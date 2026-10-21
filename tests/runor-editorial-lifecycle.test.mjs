import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_MAINTENANCE_SCHEDULE,
  RUNIC_EDITORIAL_CHANGELOG,
  retractImageWithPreservedSource,
  resolveSlugWithHistory,
  diffDatasetVersions,
} from '../lib/runor/editorial-lifecycle.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import { RUNIC_BATCH1_INSCRIPTIONS } from '../lib/runor/batch1-data.ts';

test('E42 Förvaltning: Kvartalsvis underhållsschema och officiella källor är fastställda', () => {
  assert.equal(OFFICIAL_MAINTENANCE_SCHEDULE.cadence, 'kvartalsvis');
  assert.ok(OFFICIAL_MAINTENANCE_SCHEDULE.sourcesToPoll.length >= 3);

  const sourceNames = OFFICIAL_MAINTENANCE_SCHEDULE.sourcesToPoll.map((s) => s.name);
  assert.ok(sourceNames.some((n) => n.includes('Riksantikvarieämbetet')));
  assert.ok(sourceNames.some((n) => n.includes('Vitterhetsakademien')));
  assert.ok(sourceNames.some((n) => n.includes('Uppsala universitet')));
});

test('E42 Förvaltning: Redaktionell ändringslogg bevarar tidigare värden och akademiska referenser', () => {
  assert.ok(RUNIC_EDITORIAL_CHANGELOG.length >= 3, 'Ändringsloggen ska innehålla registrerade rättelser');

  for (const record of RUNIC_EDITORIAL_CHANGELOG) {
    assert.ok(record.id.startsWith('CORR-'), `Ogiltigt ID: ${record.id}`);
    assert.ok(record.academicReference.length > 5, `Saknar källreferens för ${record.id}`);
    assert.ok(record.sourceRationale.length > 10, `Saknar motivering för ${record.id}`);
    assert.ok(record.previousValue !== undefined, `Tidigare värde får inte raderas för ${record.id}`);
    assert.ok(record.newValue !== undefined, `Nytt värde saknas för ${record.id}`);
    assert.ok(record.reviewedBy.length > 3, `Saknar granskare för ${record.id}`);
  }
});

test('E42 Förvaltning: Säker bildåterkallelse döljer bilden utan att källtext eller fyndplats raderas', () => {
  const karlevi = RUNIC_PILOT_INSCRIPTIONS.find((item) => item.canonicalSlug === 'ol-1');
  assert.ok(karlevi, 'Karlevistenen måste finnas i testunderlaget');

  const { updatedInscription, retractedImage } = retractImageWithPreservedSource(
    karlevi,
    'img-ol-1',
    'Upphovsrättslig förfrågan under utredning'
  );

  // Bilden ska nu peka på neutral placeholder
  assert.ok(retractedImage, 'Originalbilden ska returneras för arkivering');
  assert.equal(updatedInscription.images[0].imageUrl, '/images/runor/ej-avbildad.svg');
  assert.ok(updatedInscription.images[0].caption.includes('tillfälligt tillbakadragen'));

  // Källkritisk stringens: källtext, signum, SRI-referens och fyndplats är 100 % bevarade
  assert.equal(updatedInscription.canonicalSignum, karlevi.canonicalSignum);
  assert.equal(updatedInscription.source.sriVolumeTitle, karlevi.source.sriVolumeTitle);
  assert.equal(updatedInscription.source.printedPageStart, karlevi.source.printedPageStart);
  assert.equal(updatedInscription.textLayer.readingTransliteration, karlevi.textLayer.readingTransliteration);
  assert.equal(updatedInscription.placements[0].placeName, karlevi.placements[0].placeName);
});

test('E42 Förvaltning: Historiska sluggar omdirigeras automatiskt via previousSlugs', () => {
  // Skapa en testinskrift med äldre alias i previousSlugs
  const testInscription = {
    ...RUNIC_PILOT_INSCRIPTIONS[0],
    canonicalSlug: 'ol-1-karlevi',
    previousSlugs: ['ol-1', 'karlevi-stenen'],
  };

  const corpus = [testInscription];

  // 1. Direkt kanonisk träff
  const res1 = resolveSlugWithHistory(corpus, 'ol-1-karlevi');
  assert.equal(res1.found, true);
  assert.equal(res1.isRedirect, false);
  assert.equal(res1.canonicalSlug, 'ol-1-karlevi');

  // 2. Äldre historisk slug (ol-1) omdirigeras
  const res2 = resolveSlugWithHistory(corpus, 'ol-1');
  assert.equal(res2.found, true);
  assert.equal(res2.isRedirect, true);
  assert.equal(res2.canonicalSlug, 'ol-1-karlevi');

  // 3. Äldre historisk slug 2 (karlevi-stenen) omdirigeras
  const res3 = resolveSlugWithHistory(corpus, 'karlevi-stenen');
  assert.equal(res3.found, true);
  assert.equal(res3.isRedirect, true);
  assert.equal(res3.canonicalSlug, 'ol-1-karlevi');

  // 4. Helt okänd slug
  const res4 = resolveSlugWithHistory(corpus, 'helt-okand-slug');
  assert.equal(res4.found, false);
  assert.equal(res4.isRedirect, false);
  assert.equal(res4.canonicalSlug, null);
});

test('E42 Förvaltning: Versionsdiff identifierar tillägg och varnar för brytande raderingar', () => {
  const pilot = RUNIC_PILOT_INSCRIPTIONS;
  const expanded = [...RUNIC_PILOT_INSCRIPTIONS, ...RUNIC_BATCH1_INSCRIPTIONS];

  // Jämförelse pilot -> expansion (inga raderingar)
  const diffForward = diffDatasetVersions(pilot, expanded);
  assert.equal(diffForward.addedSlugs.length, 30);
  assert.equal(diffForward.removedSlugs.length, 0);
  assert.equal(diffForward.hasBreakingChanges, false);

  // Jämförelse bakåt (radering av 30 poster)
  const diffBackward = diffDatasetVersions(expanded, pilot);
  assert.equal(diffBackward.removedSlugs.length, 30);
  assert.equal(diffBackward.hasBreakingChanges, true);
});
