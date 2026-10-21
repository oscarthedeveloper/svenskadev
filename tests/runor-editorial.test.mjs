import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

import {
  ALLOWED_STATUS_TRANSITIONS,
  isValidStatusTransition,
  validateApprovalForPublication,
  createAuditLogRecord,
} from '../lib/runor/editorial.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E34 Arbetsflöde - statusövergångar regleras strikt', () => {
  // 1. Kandidat får gå till under_granskning eller avvisad, men inte direkt till godkand
  assert.equal(isValidStatusTransition('kandidat', 'under_granskning'), true);
  assert.equal(isValidStatusTransition('kandidat', 'avvisad'), true);
  assert.equal(isValidStatusTransition('kandidat', 'godkand_for_publicering'), false, 'Kandidat måste granskas före publicering');

  // 2. Under granskning får godkännas eller avvisas
  assert.equal(isValidStatusTransition('under_granskning', 'godkand_for_publicering'), true);
  assert.equal(isValidStatusTransition('under_granskning', 'avvisad'), true);

  // 3. Avvisad måste gå via kandidat för att kunna återupptas
  assert.equal(isValidStatusTransition('avvisad', 'godkand_for_publicering'), false);
  assert.equal(isValidStatusTransition('avvisad', 'kandidat'), true);
});

test('E34 Arbetsflöde - validateApprovalForPublication kräver granskare, motivering och källhänvisning', () => {
  // Saknar granskare
  const noReviewer = validateApprovalForPublication({
    assignedReviewer: null,
    reason: 'Källkollad mot SRI',
    hasSourceCitation: true,
  });
  assert.equal(noReviewer.approved, false);
  assert.ok(noReviewer.error?.includes('granskare'));

  // Saknar motivering
  const noReason = validateApprovalForPublication({
    assignedReviewer: 'Karin Runolog',
    reason: '   ',
    hasSourceCitation: true,
  });
  assert.equal(noReason.approved, false);
  assert.ok(noReason.error?.includes('motivering'));

  // Saknar källa
  const noSource = validateApprovalForPublication({
    assignedReviewer: 'Karin Runolog',
    reason: 'Granskad och godkänd',
    hasSourceCitation: false,
  });
  assert.equal(noSource.approved, false);
  assert.ok(noSource.error?.includes('Källhänvisning'));

  // Giltig
  const valid = validateApprovalForPublication({
    assignedReviewer: 'Karin Runolog',
    reason: 'Granskad mot SRI bd 13 s. 72',
    hasSourceCitation: true,
  });
  assert.equal(valid.approved, true);
});

test('E34 Revisionslogg - createAuditLogRecord avvisar ändring utan orsak', () => {
  assert.throws(
    () => {
      createAuditLogRecord({
        slug: 'vs-24',
        signum: 'Vs 24',
        action: 'status_change',
        actor: 'admin-user',
        reason: '   ',
        previousState: null,
        newState: null,
      });
    },
    /Ändringsorsak/
  );

  const entry = createAuditLogRecord({
    slug: 'vs-24',
    signum: 'Vs 24',
    action: 'status_change',
    actor: 'admin-user',
    reason: 'Granskad mot SRI',
    previousState: { status: 'kandidat' },
    newState: { status: 'under_granskning' },
  });
  assert.equal(entry.slug, 'vs-24');
  assert.equal(entry.actor, 'admin-user');
  assert.equal(entry.reason, 'Granskad mot SRI');
});

test('E34 Databas och RLS - redaktionellt arbetsflöde, audit-logg och rollback i PostgreSQL', async (t) => {
  const db = new PGlite();
  const admin = '11111111-1111-4111-8111-111111111111';
  const outsider = '22222222-2222-4222-8222-222222222222';

  try {
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

    // Importera ett provutkast (Vs 24) som admin
    await asRole('authenticated', admin);
    const vs24 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSlug === 'vs-24');
    await db.query(
      `select public.svenska_import_runic_draft($1, $2, $3::jsonb, false)`,
      ['vs-24', 'Vs 24', JSON.stringify(vs24)]
    );

    // 1. Verifiera standardstatus kandidat
    const draftRow = (await db.query(`select status from svenska_runor_drafts where slug = 'vs-24'`)).rows[0];
    assert.equal(draftRow.status, 'kandidat');

    // 2. Ändra status till under_granskning med granskare och orsak
    const statusResult = (
      await db.query(
        `select public.svenska_set_runic_draft_status($1, $2, $3, $4, $5) as res`,
        ['vs-24', 'under_granskning', 'Karin Runolog', 'Tilldelad för källkontroll mot SRI', 'Karin Runolog']
      )
    ).rows[0].res;

    assert.equal(statusResult.new_status, 'under_granskning');

    // Verifiera att loggpost skapades i svenska_runor_audit_log
    const auditRows = (
      await db.query(`select * from svenska_runor_audit_log where slug = 'vs-24'`)
    ).rows;
    assert.equal(auditRows.length, 1);
    assert.equal(auditRows[0].action, 'status_change');
    assert.equal(auditRows[0].actor, 'Karin Runolog');
    assert.equal(auditRows[0].reason, 'Tilldelad för källkontroll mot SRI');

    // 3. Rollback till tidigare revision
    const targetContent = { ...vs24, editorialNotes: 'Återställd notis vid prov' };
    const rollbackRes = (
      await db.query(
        `select public.svenska_rollback_runic_draft($1, $2::jsonb, $3, $4) as res`,
        ['vs-24', JSON.stringify(targetContent), 'Karin Runolog', 'Återställde efter granskningsavstämning']
      )
    ).rows[0].res;

    assert.equal(rollbackRes.action, 'rollback');

    const auditRowsAfterRollback = (
      await db.query(`select * from svenska_runor_audit_log where slug = 'vs-24' order by created_at desc`)
    ).rows;
    assert.equal(auditRowsAfterRollback.length, 2);
    assert.equal(auditRowsAfterRollback[0].action, 'rollback');
    assert.equal(auditRowsAfterRollback[0].reason, 'Återställde efter granskningsavstämning');

    // 4. RLS-test: Anonym och icke-behörig användare nekas tillgång till audit-logg och funktioner
    await asRole('anon');
    await assert.rejects(
      db.query(`select * from svenska_runor_audit_log`),
      /permission denied/
    );

    await asRole('authenticated', outsider);
    const outsiderAudit = await db.query(`select * from svenska_runor_audit_log`);
    assert.equal(outsiderAudit.rows.length, 0);

    await assert.rejects(
      db.query(
        `select public.svenska_set_runic_draft_status('vs-24', 'avvisad', 'Inkräktare', 'Otillåten ändring')`
      ),
      /Administratörsbehörighet krävs/
    );
  } finally {
    await db.close();
  }
});
