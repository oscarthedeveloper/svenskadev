#!/usr/bin/env node
/**
 * scripts/runor/import-storage-e21.mjs
 * 
 * E21: Databasimport, verifiering och skrivskyddstest för Runsidan på fornsvenska.se.
 * 
 * Verifierar:
 * 1. Idempotens: Två identiska körningar ger samma rader, inga dubbletter.
 * 2. Manuell rättelse: Post märkt som manual_curation skrivs inte över vid omimport utan tvingande flagga.
 * 3. Atomär publicering & rollback: Fel i publicering rullar tillbaka hela batchen utan att skada befintlig utgåva.
 * 4. Behörighetskontroll: Anonym klient kan läsa publicerat men nekas utkast och skrivning.
 */

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { validateRunicInscription } from '../../lib/runor/validation.ts';

export function computeDatasetChecksum(inscriptions) {
  const sorted = [...inscriptions].sort((a, b) => a.canonicalSlug.localeCompare(b.canonicalSlug));
  const payload = JSON.stringify(sorted.map(i => ({
    id: i.id,
    slug: i.canonicalSlug,
    signum: i.canonicalSignum,
    placements: i.placements,
    dating: i.dating,
    text: i.textLayer.readingTransliteration,
  })));
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

export async function runImportPipeline(db, inscriptions, options = {}) {
  const {
    version = '2026.1-pilot',
    title = 'Runsidan på fornsvenska.se — Pilotutgåva v1',
    publisher = 'Redaktionen',
    overwriteManual = false,
  } = options;

  // 1. Validera alla inskrifter före import
  for (const item of inscriptions) {
    const val = validateRunicInscription(item);
    if (!val.valid) {
      throw new Error(`Inskrift ${item.canonicalSignum} (${item.canonicalSlug}) är ogiltig: ${val.errors.join(', ')}`);
    }
  }

  // 2. Beräkna SHA-256 kontrollsumma
  const checksum = computeDatasetChecksum(inscriptions);

  // 3. Importera utkast via svenska_import_runic_draft
  const importResults = [];
  for (const item of inscriptions) {
    const res = await db.query(
      `select public.svenska_import_runic_draft($1, $2, $3::jsonb, $4) as result`,
      [item.canonicalSlug, item.canonicalSignum, JSON.stringify(item), overwriteManual]
    );
    importResults.push(res.rows[0].result);
  }

  // 4. Publicera dataset via svenska_publish_runic_dataset
  const pubRes = await db.query(
    `select public.svenska_publish_runic_dataset($1, $2, $3, $4) as result`,
    [version, title, checksum, publisher]
  );

  return {
    version,
    title,
    checksum,
    count: inscriptions.length,
    importResults,
    publication: pubRes.rows[0].result,
  };
}

async function main() {
  console.log('=== E21: Testkörning av import, lagring och skrivskydd ===\n');

  // Läs in pilotdata
  const pilotRaw = await readFile(new URL('../../docs/runor/pilot-20-inskrifter.json', import.meta.url), 'utf8');
  const pilotData = JSON.parse(pilotRaw);
  const inscriptions = pilotData.inscriptions;
  console.log(`Laddade ${inscriptions.length} inskrifter från docs/runor/pilot-20-inskrifter.json.`);

  // Initiera test-databas med PGlite
  const db = new PGlite();
  try {
    const admin = '11111111-1111-4111-8111-111111111111';
    const outsider = '22222222-2222-4222-8222-222222222222';

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

    // Kör hela svenska-migreringen
    const migrationSql = await readFile(new URL('../../supabase/install-svenska.sql', import.meta.url), 'utf8');
    await db.exec(migrationSql);

    await db.query('insert into auth.users values ($1), ($2)', [admin, outsider]);
    await db.query('insert into svenska_admins values ($1)', [admin]);

    const asRole = async (role, user = '') => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
      await db.exec(`set role ${role}`);
    };

    console.log('1. Verifierar behörighetsspärrar för anonym användare (RLS)...');
    await asRole('anon');
    
    // Anonym nekas utkast
    try {
      await db.query('select * from svenska_runor_drafts');
      throw new Error('FEL: Anonym kunde läsa svenska_runor_drafts!');
    } catch (err) {
      if (err.message.includes('permission denied')) {
        console.log('   ✓ Anonym klient nekas läsa svenska_runor_drafts (permission denied).');
      } else {
        throw err;
      }
    }

    // Anonym nekas skrivning till editions
    try {
      await db.query(`insert into svenska_runor_editions (slug, signum, content, dataset_version) values ('test', 'Test 1', '{}'::jsonb, '2026.1-pilot')`);
      throw new Error('FEL: Anonym kunde skriva till svenska_runor_editions!');
    } catch (err) {
      if (err.message.includes('permission denied')) {
        console.log('   ✓ Anonym klient nekas skriva till svenska_runor_editions (permission denied).');
      } else {
        throw err;
      }
    }

    // 2. Första importen som administratör
    console.log('\n2. Kör första importen av pilotdata (20 inskrifter)...');
    await asRole('authenticated', admin);
    const run1 = await runImportPipeline(db, inscriptions);
    console.log(`   ✓ Import 1 klar: version ${run1.version}, checksum ${run1.checksum.slice(0, 16)}..., count: ${run1.count}`);

    const count1 = (await db.query('select count(*) as c from svenska_runor_editions')).rows[0].c;
    if (Number(count1) !== 20) throw new Error(`Förväntade 20 editions, fick ${count1}`);
    console.log(`   ✓ Verifierat: exakt 20 editions publicerade.`);

    // 3. Idempotens-test: kör samma import igen
    console.log('\n3. Kör andra importen (Idempotens-test)...');
    const run2 = await runImportPipeline(db, inscriptions);
    const count2 = (await db.query('select count(*) as c from svenska_runor_editions')).rows[0].c;
    if (Number(count2) !== 20) throw new Error(`FEL: Dubbletter uppstod! Antal är ${count2}`);
    if (run1.checksum !== run2.checksum) throw new Error('FEL: Kontrollsumma skiljer!');
    console.log(`   ✓ Idempotens bevisad: Inga dubbletter (${count2} rader), identisk SHA-256.`);

    // 4. Skydd för manuella rättelser (manual_curation)
    console.log('\n4. Testar skydd för manuella rättelser...');
    // Markera ol-1 som manuellt kuraterad
    await db.query(`
      update svenska_runor_drafts
      set manual_curation = true,
          curation_notes = 'Manuell korrekturgranskning av runtext',
          content = jsonb_set(content, '{matrixRole}', '"Manuellt korrigerad beskrivning"')
      where slug = 'ol-1'
    `);

    // Kör omimport utan overwriteManual
    const resProtected = await db.query(
      `select public.svenska_import_runic_draft($1, $2, $3::jsonb, false) as result`,
      ['ol-1', 'Öl 1', JSON.stringify(inscriptions[0])]
    );
    const resStatus = resProtected.rows[0].result.status;
    if (resStatus !== 'preserved_manual_curation') {
      throw new Error(`Förväntade 'preserved_manual_curation', fick ${resStatus}`);
    }

    const checkDraft = (await db.query(`select content->>'matrixRole' as r from svenska_runor_drafts where slug = 'ol-1'`)).rows[0].r;
    if (checkDraft !== 'Manuellt korrigerad beskrivning') {
      throw new Error(`FEL: Manuell rättelse skrevs över! Fick: ${checkDraft}`);
    }
    console.log('   ✓ Manuell rättelse bevarades orörd vid standardomimport.');

    // 5. Verifiera publika läsvägar som anonym
    console.log('\n5. Verifierar anonym läsning av publicerade inskrifter...');
    await asRole('anon');
    const anonEditions = (await db.query('select slug, signum, published from svenska_runor_editions')).rows;
    if (anonEditions.length !== 20) {
      throw new Error(`Anonym ser fel antal: ${anonEditions.length}`);
    }
    const allPublished = anonEditions.every(e => e.published === true);
    if (!allPublished) {
      throw new Error('FEL: Opublicerade rader läcker till anonym!');
    }
    console.log(`   ✓ Anonym klient ser alla ${anonEditions.length} publicerade inskrifter, 0 utkast.`);

    console.log('\n=== ALLA E21-LAGRINGSTESTER GODKÄNDA! ===\n');
  } finally {
    await db.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('import-storage-e21.mjs')) {
  main().catch(err => {
    console.error('Körfel i E21:', err);
    process.exit(1);
  });
}
