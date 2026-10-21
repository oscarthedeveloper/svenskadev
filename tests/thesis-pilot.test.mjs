import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

import { THESIS_PILOT_EDITION, THESIS_TIME_SPECIFICATIONS } from '../lib/thesis/pilot-data.ts';
import { NORDIC_ATLAS_DATA } from '../lib/thesis/atlas-data.ts';
import {
  CASE_STUDIES_DATA,
  MARK_KIND_INFORMANTS,
  OSTRA_GOINGE_INFORMANTS,
} from '../lib/thesis/case-studies-data.ts';
import {
  canCompareTimeSpecsDirectly,
  validateCaseStudiesData,
  validateNordicAtlasData,
  validateParadigmCell,
  validateSourceLocation,
  validateThesisPilotEdition,
  validateTimeSpecification,
  validateUncertaintyMarker,
} from '../lib/thesis/validation.ts';
import {
  DEFAULT_THESIS_URL_STATE,
  parseThesisUrlState,
  serializeThesisUrlState,
} from '../lib/thesis/url-state.ts';
import {
  EXCEPTION_MARKERS_KARTA_10,
  SUBAREA_GEOMETRIES_KARTA_10,
} from '../lib/thesis/map-geometry.ts';
import {
  DEFAULT_THESIS_EDITORIAL_CONFIG,
  resolveThesisEditionWithConfig,
  validateThesisEditorialConfig,
} from '../lib/thesis/editorial-config.ts';

test('THESIS_PILOT_EDITION passes full source-critical validation', () => {
  const result = validateThesisPilotEdition(THESIS_PILOT_EDITION);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('NORDIC_ATLAS_DATA (Etapp 5: A05.1–A05.5) passes full validation and preserves discrete 1850/1900 slices, 42 Tablå 26 rows, and Karta 14 hypothetical reconstruction', () => {
  const result = validateNordicAtlasData(
    NORDIC_ATLAS_DATA,
    THESIS_PILOT_EDITION.sourceDocument
  );
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);

  assert.equal(NORDIC_ATLAS_DATA.karta7AndTabla26.tabla26Rows.length, 42);
  assert.equal(
    NORDIC_ATLAS_DATA.karta7AndTabla26.discreteTimeSlices.length,
    2
  );
  assert.deepEqual(
    NORDIC_ATLAS_DATA.karta7AndTabla26.discreteTimeSlices.map((s) => s.id),
    ['ca_1850', 'ca_1900']
  );

  // Dalmål sockengrupper i Karta 3 (12 poster täckande 21 socknar) + Bergslagen 6 socknar i Karta 5 + Estlandssvenska 9 områden i Karta 6
  assert.equal(
    NORDIC_ATLAS_DATA.regionalDeepDives.dalmal.karta3Parishes.length,
    12
  );
  assert.equal(
    NORDIC_ATLAS_DATA.regionalDeepDives.dalmal.karta5Bergslagsmal.parishes
      .length,
    11
  );
  assert.equal(
    NORDIC_ATLAS_DATA.regionalDeepDives.overkalixmal.tabla24Overkalix.verbs
      .length,
    5
  );
  assert.equal(
    NORDIC_ATLAS_DATA.regionalDeepDives.estlandssvenska.areas.length,
    5
  );

  // Karta 14 hypotetisk rekonstruktion
  assert.equal(
    NORDIC_ATLAS_DATA.hypotheticalReconstructionKarta14.evidenceStatus,
    'hypothetical_reconstruction'
  );
  assert.equal(
    NORDIC_ATLAS_DATA.hypotheticalReconstructionKarta14.uncertainty
      .patternStyle,
    'dashed_border'
  );

  // Typ 4 bevarar frågetecknen i steg 3 och steg 4 (Tablå 42 s. 243)
  const typ4 = NORDIC_ATLAS_DATA.dismantlingTypes.types.find(
    (t) => t.id === 'typ-4'
  );
  assert.ok(typ4);
  assert.equal(typ4.steps.step3.p1, '?');
  assert.equal(typ4.steps.step4.p1, '?');
});

test('CASE_STUDIES_DATA (Etapp 6: A06.1–A06.6) passes full validation for 41 Mark & Kind informants, 21 Östra Göinge informants, cohort totals, and K01 notice', () => {
  const result = validateCaseStudiesData(
    CASE_STUDIES_DATA,
    THESIS_PILOT_EDITION.sourceDocument
  );
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);

  assert.equal(MARK_KIND_INFORMANTS.length, 41);
  assert.equal(OSTRA_GOINGE_INFORMANTS.length, 21);

  // Kohortsummor i Mark & Kind: 9 + 22 + 10 = 41
  const mkCohortCounts = CASE_STUDIES_DATA.markAndKind.cohortsTabla33.map(
    (r) => r.informantCount
  );
  assert.deepEqual(mkCohortCounts, [9, 22, 10]);

  // Kohortsummor i Östra Göinge: 12 + 6 + 3 = 21
  const ogCohortCounts = CASE_STUDIES_DATA.ostraGoinge.cohortsTabla37.map(
    (r) => r.informantCount
  );
  assert.deepEqual(ogCohortCounts, [12, 6, 3]);

  // K01-notis samt approximativa födelseår (*) och okända inspelningsår (?)
  assert.equal(CASE_STUDIES_DATA.ostraGoinge.auditNoticeK01.issueId, 'K01');
  const approxBirthIds = OSTRA_GOINGE_INFORMANTS.filter(
    (i) => i.isBirthYearApproximate
  ).map((i) => i.id);
  assert.deepEqual(approxBirthIds, ['VS', 'NN 2', 'AP']);

  const unknownRecIds = OSTRA_GOINGE_INFORMANTS.filter(
    (i) => i.isRecordingYearUnknown
  ).map((i) => i.id);
  assert.deepEqual(unknownRecIds, ['NN 1', 'PT', 'JJ', 'AB']);
});

test('Tablå 28 contains all 4 paradigms and all 12 cells with exact source readings and tense splits', () => {
  const paradigms = THESIS_PILOT_EDITION.paradigms;
  assert.equal(paradigms.length, 4);

  const expectedMatrix = {
    'um-bojning': [
      { person: 1, raw: '-um', pres: '-um', past: '-um', slash: false },
      { person: 2, raw: '-e(n)', pres: '-e(n)', past: '-e(n)', slash: false },
      { person: 3, raw: '-a / -e', pres: '-a', past: '-e', slash: true },
    ],
    'e-bojning': [
      { person: 1, raw: '-e(n)', pres: '-e(n)', past: '-e(n)', slash: false },
      { person: 2, raw: '-e(n)', pres: '-e(n)', past: '-e(n)', slash: false },
      { person: 3, raw: '-a / -e', pres: '-a', past: '-e', slash: true },
    ],
    'skansk-bojning': [
      { person: 1, raw: '-a / -e', pres: '-a', past: '-e', slash: true },
      { person: 2, raw: '-e(n)', pres: '-e(n)', past: '-e(n)', slash: false },
      { person: 3, raw: '-a / -e', pres: '-a', past: '-e', slash: true },
    ],
    'a-bojning': [
      { person: 1, raw: '-a / -e', pres: '-a', past: '-e', slash: true },
      { person: 2, raw: '-a / -e', pres: '-a', past: '-e', slash: true },
      { person: 3, raw: '-a / -e', pres: '-a', past: '-e', slash: true },
    ],
  };

  for (const paradigm of paradigms) {
    const expectedCells = expectedMatrix[paradigm.id];
    assert.ok(expectedCells, `Unexpected paradigm ${paradigm.id}`);
    assert.equal(paradigm.cells.length, 3);

    paradigm.cells.forEach((cell, idx) => {
      const exp = expectedCells[idx];
      assert.equal(cell.person, exp.person);
      assert.equal(cell.rawCellText, exp.raw);
      assert.equal(cell.presentEnding, exp.pres);
      assert.equal(cell.pastEnding, exp.past);
      assert.equal(cell.splitsTenseBySlash, exp.slash);
      assert.equal(cell.source.printedPage, 147);
      assert.equal(cell.source.pdfPage, 147);
    });
  }
});

test('Karta 10 includes all 4 main regions, n-drop zones, Ale härad exclave, and footnote 81 inferred areas', () => {
  const regions = THESIS_PILOT_EDITION.regions;
  assert.equal(regions.length, 4);

  const subAreas = regions.flatMap((r) => r.subAreas);
  const fn81Areas = subAreas.filter(
    (s) =>
      s.evidenceStatus === 'inferred_from_neighbor' &&
      s.source.footnotes?.includes(81)
  );
  assert.equal(fn81Areas.length, 2);

  const aleExclave = subAreas.find((s) => s.id === 'subarea-a-ale-harad-exklav');
  assert.ok(aleExclave, 'Ale härad exclave must be registered');
  assert.match(aleExclave.description, /preteritum/i);
});

test('Validation rejects objects without valid source locations or with out-of-range pages', () => {
  const doc = THESIS_PILOT_EDITION.sourceDocument;

  const missingErrors = validateSourceLocation(null, doc);
  assert.ok(missingErrors.length > 0);

  const overflowErrors = validateSourceLocation(
    {
      sourceId: doc.id,
      objectId: 'Ogiltig hänvisning',
      printedPage: 295,
      pdfPage: 295,
    },
    doc
  );
  assert.equal(overflowErrors.length, 2);
});

test('Validation rejects conflated time roles, interpolation, and fabricated years for unknown dates', () => {
  const doc = THESIS_PILOT_EDITION.sourceDocument;
  const synthesisSpec = THESIS_TIME_SPECIFICATIONS['trad-southwest-synthesis-1850-1950'];
  const collectionSpec = THESIS_TIME_SPECIFICATIONS['tl-window-1890-1920'];
  const unknownSpec = THESIS_TIME_SPECIFICATIONS['unknown-collection-date-template'];

  const roleComparison = canCompareTimeSpecsDirectly(synthesisSpec, collectionSpec);
  assert.equal(roleComparison.allowed, false);
  assert.match(roleComparison.reason || '', /blanda tidsrollerna/);

  const unknownComparison = canCompareTimeSpecsDirectly(
    unknownSpec,
    { ...unknownSpec, id: 'other-attestation', isUnknown: false, startYear: 1905, endYear: 1905 }
  );
  assert.equal(unknownComparison.allowed, false);

  const fabricatedUnknownErrors = validateTimeSpecification(
    {
      ...unknownSpec,
      isUnknown: true,
      startYear: 1900,
      endYear: 1900,
    },
    doc
  );
  assert.ok(
    fabricatedUnknownErrors.some((e) => e.includes('isUnknown=true')),
    'Should reject unknown date that still supplies numeric years'
  );

  const birthYearRangeErrors = validateTimeSpecification(
    {
      ...synthesisSpec,
      id: 'invalid-birth-range',
      role: 'birth_year',
      startYear: 1850,
      endYear: 1950,
    },
    doc
  );
  assert.ok(
    birthYearRangeErrors.some((e) => e.includes('birth_year')),
    'Should reject a century range masquerading as an informant birth_year'
  );
});

test('Validation rejects slash cells that do not split present and past endings properly', () => {
  const sampleCell = THESIS_PILOT_EDITION.paradigms[0].cells[2]; // -a / -e
  const brokenCell = {
    ...sampleCell,
    presentEnding: '-a / -e',
    pastEnding: '-a / -e',
  };
  const errors = validateParadigmCell(brokenCell, THESIS_PILOT_EDITION.sourceDocument);
  assert.ok(errors.length > 0);
});

test('Validation rejects inferred areas that use solid certainty styling', () => {
  const errors = validateUncertaintyMarker(
    {
      level: 'none',
      patternStyle: 'solid',
      whatSourceShows: 'Färglagd yta',
      howWeRepresentIt: 'Solid yta',
      whatIsUncertain: '1p och 2p saknar belägg',
    },
    'inferred_from_neighbor',
    'test-inferred-area'
  );
  assert.ok(errors.some((e) => e.includes('inferred_from_neighbor')));
});

test('Standalone JSON export docs/avhandling/pilot-data-v1.json is synchronized with THESIS_PILOT_EDITION', () => {
  const jsonPath = path.resolve('docs/avhandling/pilot-data-v1.json');
  assert.ok(fs.existsSync(jsonPath), 'docs/avhandling/pilot-data-v1.json must exist');
  const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  assert.deepEqual(parsed, THESIS_PILOT_EDITION);
});

test('URL state parser handles valid parameters, synchronizes sub-area parent region, and ignores unknown values (A02.4)', () => {
  const cleanDefault = parseThesisUrlState({});
  assert.deepEqual(cleanDefault, DEFAULT_THESIS_URL_STATE);
  assert.equal(serializeThesisUrlState(cleanDefault), '/sprakliv/person-och-numerus');

  const parsedSubArea = parseThesisUrlState({
    delomrade: 'subarea-a-blekinge-inferred-fn81',
    tempus: 'preteritum',
    verb: 'dömma',
    steg: '4',
    vy: 'statisk-jamforelse',
    begrepp: 'term-synkretism',
    okand_param: 'ignoreras',
  });
  assert.equal(parsedSubArea.regionId, 'region-a-omradet');
  assert.equal(parsedSubArea.paradigmId, 'a-bojning');
  assert.equal(parsedSubArea.subAreaId, 'subarea-a-blekinge-inferred-fn81');
  assert.equal(parsedSubArea.tense, 'preteritum');
  assert.equal(parsedSubArea.verbLemma, 'dömma');
  assert.equal(parsedSubArea.stepOrder, 4);
  assert.equal(parsedSubArea.viewMode, 'statisk-jamforelse');
  assert.equal(parsedSubArea.glossaryTermId, 'term-synkretism');

  const roundTripHref = serializeThesisUrlState(parsedSubArea);
  const reparsed = parseThesisUrlState(new URLSearchParams(roundTripHref.split('?')[1]));
  assert.deepEqual(reparsed, parsedSubArea);

  const fallbackInvalid = parseThesisUrlState({
    omrade: 'finns-ej',
    delomrade: 'finns-ej',
    tempus: 'futurum',
    verb: 'springa',
    steg: '99',
    vy: '3d',
    begrepp: 'okand',
  });
  assert.deepEqual(fallbackInvalid, DEFAULT_THESIS_URL_STATE);
});

test('SVG map geometry sub-areas and exception markers match verified THESIS_PILOT_EDITION IDs (A03.2)', () => {
  const allSubAreaIds = new Set(
    THESIS_PILOT_EDITION.regions.flatMap((r) => r.subAreas.map((s) => s.id))
  );
  assert.equal(SUBAREA_GEOMETRIES_KARTA_10.length, allSubAreaIds.size);
  for (const geo of SUBAREA_GEOMETRIES_KARTA_10) {
    assert.ok(allSubAreaIds.has(geo.subAreaId), `Missing subAreaId ${geo.subAreaId}`);
  }

  const allExceptionIds = new Set(
    THESIS_PILOT_EDITION.regions.flatMap((r) =>
      r.documentedExceptions.map((exc) => exc.id)
    )
  );
  for (const marker of EXCEPTION_MARKERS_KARTA_10) {
    assert.ok(
      allExceptionIds.has(marker.exceptionId),
      `Missing exceptionId ${marker.exceptionId}`
    );
  }
});

test('Editorial configuration validates fields, hex colors, and custom pilot data (A03.6)', () => {
  assert.equal(validateThesisEditorialConfig(DEFAULT_THESIS_EDITORIAL_CONFIG), null);

  assert.match(
    validateThesisEditorialConfig({ ...DEFAULT_THESIS_EDITORIAL_CONFIG, title: '' }) || '',
    /title/
  );

  const badColorConfig = {
    ...DEFAULT_THESIS_EDITORIAL_CONFIG,
    regionOverrides: {
      ...DEFAULT_THESIS_EDITORIAL_CONFIG.regionOverrides,
      'region-um-omradet': {
        ...DEFAULT_THESIS_EDITORIAL_CONFIG.regionOverrides['region-um-omradet'],
        customColorHex: 'red',
      },
    },
  };
  assert.match(validateThesisEditorialConfig(badColorConfig) || '', /hexkod/);

  const customColorResolved = resolveThesisEditionWithConfig({
    ...DEFAULT_THESIS_EDITORIAL_CONFIG,
    regionOverrides: {
      ...DEFAULT_THESIS_EDITORIAL_CONFIG.regionOverrides,
      'region-um-omradet': {
        ...DEFAULT_THESIS_EDITORIAL_CONFIG.regionOverrides['region-um-omradet'],
        customColorHex: '#112233',
      },
    },
  });
  assert.equal(customColorResolved.paradigms[0].webDisplayColorHex, '#112233');
});

test('Database RLS and atomic editorial workflow for /admin/avhandling (A03.5 & A03.7)', async () => {
  const admin = '00000000-0000-0000-0000-000000000001';
  const outsider = '00000000-0000-0000-0000-000000000002';
  const slug = 'person-och-numerus';

  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;`);

    await db.exec(await readFile(new URL('../supabase/install-svenska.sql', import.meta.url), 'utf8'));
    await db.query('insert into auth.users values ($1),($2)', [admin, outsider]);
    await db.query('insert into svenska_admins values ($1)', [admin]);

    const asRole = async (role, user = '') => {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
      await db.exec(`set role ${role}`);
    };

    // 1. Anon and non-admin cannot read or write drafts
    await asRole('anon');
    await assert.rejects(db.query('select * from svenska_thesis_drafts'), /permission denied/);
    await asRole('authenticated', outsider);
    assert.equal((await db.query('select * from svenska_thesis_drafts')).rows.length, 0);
    await assert.rejects(
      db.query('select svenska_save_thesis_draft($1,$2,0)', [slug, DEFAULT_THESIS_EDITORIAL_CONFIG]),
      /Administratör/
    );

    // 2. Admin saves draft (revision 0 -> 1) and tab conflict is blocked
    await asRole('authenticated', admin);
    const rev1 = (
      await db.query('select svenska_save_thesis_draft($1,$2,0) as rev', [
        slug,
        DEFAULT_THESIS_EDITORIAL_CONFIG,
      ])
    ).rows[0].rev;
    assert.equal(rev1, 1);

    await assert.rejects(
      db.query('select svenska_save_thesis_draft($1,$2,0)', [
        slug,
        DEFAULT_THESIS_EDITORIAL_CONFIG,
      ]),
      /annan flik/
    );

    // 3. Before publish, anon sees 0 rows in svenska_thesis_editions
    await asRole('anon');
    assert.equal((await db.query('select * from svenska_thesis_editions')).rows.length, 0);

    // 4. Admin publishes (revision 1 -> 2)
    await asRole('authenticated', admin);
    const rev2 = (
      await db.query('select svenska_publish_thesis($1,1) as rev', [slug])
    ).rows[0].rev;
    assert.equal(rev2, 2);

    // 5. Admin edits a new private draft (revision 2 -> 3); anon still sees published title
    const draftV2 = {
      ...DEFAULT_THESIS_EDITORIAL_CONFIG,
      title: 'Privat utkasttitel under arbete',
    };
    const rev3 = (
      await db.query('select svenska_save_thesis_draft($1,$2,2) as rev', [slug, draftV2])
    ).rows[0].rev;
    assert.equal(rev3, 3);

    await asRole('anon');
    const pubRows = (await db.query('select content from svenska_thesis_editions')).rows;
    assert.equal(pubRows.length, 1);
    assert.equal(pubRows[0].content.title, 'Från person till person');

    // 6. Admin restores draft from published edition (revision 3 -> 4)
    await asRole('authenticated', admin);
    const rev4 = (
      await db.query('select svenska_restore_thesis_published($1,3) as rev', [slug])
    ).rows[0].rev;
    assert.equal(rev4, 4);

    const restoredDraft = (
      await db.query('select content, dirty from svenska_thesis_drafts where slug=$1', [slug])
    ).rows[0];
    assert.equal(restoredDraft.content.title, 'Från person till person');
    assert.equal(restoredDraft.dirty, false);

    // 7. Admin unpublishes custom edition (revision 4 -> 5); anon no longer sees row
    const rev5 = (
      await db.query('select svenska_unpublish_thesis($1,4) as rev', [slug])
    ).rows[0].rev;
    assert.equal(rev5, 5);

    await asRole('anon');
    assert.equal((await db.query('select * from svenska_thesis_editions')).rows.length, 0);
  } finally {
    await db.close();
  }
});

