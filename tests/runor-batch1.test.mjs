import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  RUNIC_BATCH1_INSCRIPTIONS,
  RUNIC_COMBINED_CORPUS_50,
} from '../lib/runor/batch1-data.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import {
  validateRunicInscription,
  validateRunicCorpus,
} from '../lib/runor/validation.ts';
import { toPublicPublishedItem } from '../lib/runor/contract.ts';

test('E35 Landskapsbatch 1 - omfattar exakt 30 granskade inskrifter över 4 landskap', () => {
  assert.equal(RUNIC_BATCH1_INSCRIPTIONS.length, 30);

  const oland = RUNIC_BATCH1_INSCRIPTIONS.filter((i) => i.provinceCode === 'Öl');
  const ostergotland = RUNIC_BATCH1_INSCRIPTIONS.filter((i) => i.provinceCode === 'Ög');
  const sodermanland = RUNIC_BATCH1_INSCRIPTIONS.filter((i) => i.provinceCode === 'Sö');
  const uppland = RUNIC_BATCH1_INSCRIPTIONS.filter((i) => i.provinceCode === 'U');

  assert.equal(oland.length, 10, 'Öland ska ha 10 nya poster');
  assert.equal(ostergotland.length, 10, 'Östergötland ska ha 10 nya poster');
  assert.equal(sodermanland.length, 5, 'Södermanland ska ha 5 nya poster');
  assert.equal(uppland.length, 5, 'Uppland ska ha 5 nya poster');
});

test('E35 Landskapsbatch 1 - samtliga 30 poster passerar fullständig validering utan fel', () => {
  for (const item of RUNIC_BATCH1_INSCRIPTIONS) {
    const val = validateRunicInscription(item);
    assert.equal(
      val.valid,
      true,
      `Inskrift ${item.canonicalSignum} misslyckades vid validering: ${val.errors.map((e) => e.message).join(', ')}`
    );

    // Källhänvisningsintegritet
    assert.ok(item.source.author.length > 3);
    assert.ok(item.source.publicationYear > 1900);
    assert.ok(item.source.printedPageStart > 0);
    assert.ok(item.source.pdfPageStart > 0);
    assert.ok(item.source.plateNumber && item.source.plateNumber.length > 0);

    // Textlagerintegritet
    assert.ok(item.textLayer.readingTransliteration.length > 5);
    assert.ok(item.textLayer.translationSwedish && item.textLayer.translationSwedish.length > 5);

    // Dateringsintervall
    assert.ok(item.dating.earliestYear <= item.dating.latestYear);
  }
});

test('E35 Landskapsbatch 1 - kombinerad 50-posters korpus har noll identitetskonflikter och unika signa', () => {
  assert.equal(RUNIC_COMBINED_CORPUS_50.length, 50);

  const corpusVal = validateRunicCorpus(RUNIC_COMBINED_CORPUS_50);
  assert.equal(corpusVal.valid, true, `Korpusen har fel: ${corpusVal.errors.map((e) => e.message).join(', ')}`);
  assert.equal(corpusVal.errors.length, 0);

  // Verifiera att pilotens 20 inskrifter och batch 1:s 30 inskrifter inte kolliderar
  const pilotSlugs = new Set(RUNIC_PILOT_INSCRIPTIONS.map((i) => i.canonicalSlug));
  for (const b1 of RUNIC_BATCH1_INSCRIPTIONS) {
    assert.ok(!pilotSlugs.has(b1.canonicalSlug), `Kollision: slug ${b1.canonicalSlug} finns redan i piloten!`);
  }
});

test('E35 Landskapsbatch 1 - granskningsprotokoll och kapacitetsmätning finns dokumenterat', async () => {
  const protocolRaw = await readFile(
    new URL('../docs/runor/batch-1-granskningsprotokoll.json', import.meta.url),
    'utf8'
  );
  const protocol = JSON.parse(protocolRaw);

  assert.equal(protocol.batchId, 'batch-1');
  assert.equal(protocol.datasetVersion, '2026.2-batch1');
  assert.equal(protocol.status, 'fullstandigt_granskad');
  assert.equal(protocol.unresolvedConflicts, 0, 'Noll olösta konflikter tillåts');
  assert.equal(protocol.batchCandidatesSelected, 30);
  assert.equal(protocol.reviewedAndApprovedCount, 30);
  assert.ok(protocol.measuredCurationTimesMinutes.medianMinutesPerInscription > 0);
});

test('E35 Landskapsbatch 1 - publiceringskontrakt genererar giltiga öppna data för samtliga 50 poster', () => {
  const publishedItems = [];
  for (const item of RUNIC_COMBINED_CORPUS_50) {
    const pub = toPublicPublishedItem(item);
    assert.ok(pub, `Inskrift ${item.canonicalSignum} ska kunna publiceras`);
    publishedItems.push(pub);
  }
  assert.equal(publishedItems.length, 50);
});
