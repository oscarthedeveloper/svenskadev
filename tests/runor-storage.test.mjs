import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { validateRunicInscription } from '../lib/runor/validation.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import { getPublishedRunicCorpus } from '../lib/runor/contract.ts';
import { runImportPipeline, computeDatasetChecksum } from '../scripts/runor/import-storage-e21.mjs';

test('E21: Databaslagring, RLS, import och skrivskydd för runinskrifter', async (t) => {
  const db = new PGlite();
  const admin = '11111111-1111-4111-8111-111111111111';
  const outsider = '22222222-2222-4222-8222-222222222222';

  try {
    // 0. Setup PGlite auth and run full migration
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema public, auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
    `);

    const installSql = await readFile(new URL('../supabase/install-svenska.sql', import.meta.url), 'utf8');
    await db.exec(installSql);

    await db.query('insert into auth.users values ($1), ($2)', [admin, outsider]);
    await db.query('insert into svenska_admins values ($1)', [admin]);

    const asRole = async (role, user = '') => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
      await db.exec(`set role ${role}`);
    };

    // Test 1: RLS locks down drafts completely from anon and unprivileged users
    await t.test('RLS nekar anonyma och obehöriga klienter från svenska_runor_drafts', async () => {
      await asRole('anon');
      await assert.rejects(
        db.query('select * from svenska_runor_drafts'),
        /permission denied/
      );

      await asRole('authenticated', outsider);
      const res = await db.query('select * from svenska_runor_drafts');
      assert.equal(res.rows.length, 0);

      await assert.rejects(
        db.query('select public.svenska_import_runic_draft($1, $2, $3::jsonb, false)', [
          'u-73',
          'U 73',
          JSON.stringify(RUNIC_PILOT_INSCRIPTIONS[0]),
        ]),
        /Administratörsbehörighet krävs/
      );
    });

    // Test 2: RLS blocks write operations to svenska_runor_editions from anon
    await t.test('RLS nekar anonyma klienter att skriva till svenska_runor_editions', async () => {
      await asRole('anon');
      await assert.rejects(
        db.query(
          `insert into svenska_runor_editions (slug, signum, content, dataset_version) values ('test', 'Test 1', '{}'::jsonb, '2026.1-pilot')`
        ),
        /permission denied/
      );
    });

    // Test 3: Admin performs batch import and publication
    await t.test('Administratör kan köra import och publicering av pilotdata', async () => {
      await asRole('authenticated', admin);
      const result = await runImportPipeline(db, RUNIC_PILOT_INSCRIPTIONS);

      assert.equal(result.version, '2026.1-pilot');
      assert.equal(result.count, 20);
      assert.equal(result.publication.status, 'published');
      assert.equal(result.publication.count, 20);

      const editionsCount = (await db.query('select count(*) as c from svenska_runor_editions')).rows[0].c;
      assert.equal(Number(editionsCount), 20);
    });

    // Test 4: Idempotency: reimporting produces identical state with 0 duplicates
    await t.test('Idempotens: omimport skapar inga dubbletter och bibehåller exakt samma rader', async () => {
      await asRole('authenticated', admin);
      const result2 = await runImportPipeline(db, RUNIC_PILOT_INSCRIPTIONS);

      assert.equal(result2.count, 20);
      assert.equal(result2.publication.count, 20);

      const editionsCount = (await db.query('select count(*) as c from svenska_runor_editions')).rows[0].c;
      assert.equal(Number(editionsCount), 20);

      const draftsCount = (await db.query('select count(*) as c from svenska_runor_drafts')).rows[0].c;
      assert.equal(Number(draftsCount), 20);
    });

    // Test 5: Manual curation protection: manual edits are not clobbered by default
    await t.test('Manuell kuratering i utkast skyddas mot oavsiktlig överskrivning', async () => {
      await asRole('authenticated', admin);

      // Sätt en manuell rättelse på vs-24
      await db.query(`
        update svenska_runor_drafts
        set manual_curation = true,
            curation_notes = 'Specialgranskad för E21-test',
            content = jsonb_set(content, '{carrier,material}', '"Särskild fältspatgranit"')
        where slug = 'vs-24'
      `);

      // Försök skriva över med standardimport (overwriteManual = false)
      const vs24Source = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSlug === 'vs-24');
      const importRes = (
        await db.query(
          `select public.svenska_import_runic_draft($1, $2, $3::jsonb, false) as result`,
          ['vs-24', 'Vs 24', JSON.stringify(vs24Source)]
        )
      ).rows[0].result;

      assert.equal(importRes.status, 'preserved_manual_curation');

      // Verifiera att ändringen är kvar
      const row = (
        await db.query(`select content->'carrier'->>'material' as mat from svenska_runor_drafts where slug = 'vs-24'`)
      ).rows[0];
      assert.equal(row.mat, 'Särskild fältspatgranit');

      // Men med tvingande flagga (overwriteManual = true) skrivs den över
      const importForce = (
        await db.query(
          `select public.svenska_import_runic_draft($1, $2, $3::jsonb, true) as result`,
          ['vs-24', 'Vs 24', JSON.stringify(vs24Source)]
        )
      ).rows[0].result;
      assert.equal(importForce.status, 'imported');

      const restoredRow = (
        await db.query(`select content->'carrier'->>'material' as mat from svenska_runor_drafts where slug = 'vs-24'`)
      ).rows[0];
      assert.equal(restoredRow.mat, vs24Source.carrier.material);
    });

    // Test 6: Anon reading: only published rows visible
    await t.test('Anonym läsare ser endast publicerade rader och inga utkast', async () => {
      await asRole('anon');
      const pubRows = (await db.query('select slug, signum, published from svenska_runor_editions')).rows;
      assert.equal(pubRows.length, 20);
      assert.ok(pubRows.every((r) => r.published === true));

      const datasetMeta = (await db.query('select version, inscription_count from svenska_runor_datasets')).rows;
      assert.equal(datasetMeta.length, 1);
      assert.equal(datasetMeta[0].version, '2026.1-pilot');
      assert.equal(datasetMeta[0].inscription_count, 20);
    });

    // Test 7: Atomic rollback when publication fails
    await t.test('Atomär rollback vid felaktig publicering', async () => {
      await asRole('authenticated', admin);
      // Försök publicera med ogiltig versionssträng (bryter mot check-constraint)
      await assert.rejects(
        db.query(`select public.svenska_publish_runic_dataset('OGILTIG_VERSION', 'Titel', '0000000000000000000000000000000000000000000000000000000000000000')`),
        /violates check constraint/
      );

      // Verifiera att befintlig publicerad version kvarstår oförändrad
      const activeMeta = (await db.query('select version from svenska_runor_datasets')).rows;
      assert.equal(activeMeta.length, 1);
      assert.equal(activeMeta[0].version, '2026.1-pilot');
    });
  } finally {
    await db.close();
  }
});

test('E21: Klientkod och bundle-säkerhet: Inga hemliga nycklar exponeras i klientkomponenter', async () => {
  const clientDir = new URL('../components/runor/', import.meta.url);
  const files = await readdir(clientDir);

  for (const file of files) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = await readFile(new URL(`../components/runor/${file}`, import.meta.url), 'utf8');
      assert.equal(
        content.includes('SUPABASE_SERVICE_ROLE_KEY'),
        false,
        `Klientkomponent ${file} får inte referera SUPABASE_SERVICE_ROLE_KEY!`
      );
      assert.equal(
        content.includes('server-only'),
        false,
        `Klientkomponent ${file} får inte importera server-only!`
      );
    }
  }
});
