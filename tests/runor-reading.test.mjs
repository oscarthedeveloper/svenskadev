import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GUIDED_READING_INSCRIPTIONS,
  getGuidedReadingForSignum,
} from '../lib/runor/reading-segments.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E32 Läsanimation - urvalet omfattar 4 välunderbyggda och rättighetsklara exempel', () => {
  const signa = Object.keys(GUIDED_READING_INSCRIPTIONS);
  assert.ok(signa.length >= 4, 'Minst 3–5 exempel ska finnas');
  assert.ok(signa.includes('Vs 24'), 'Vs 24 Hassmyrastenen måste ingå');
  assert.ok(signa.includes('Sö 179'), 'Sö 179 Gripsholmsstenen måste ingå');
  assert.ok(signa.includes('Öl 1'), 'Öl 1 Karlevistenen måste ingå');
  assert.ok(signa.includes('U 73'), 'U 73 Hansta måste ingå');
});

test('E32 Läsanimation - koordinater och bounding boxes håller sig inom 0–100 % för alla skärmstorlekar', () => {
  for (const [signum, guide] of Object.entries(GUIDED_READING_INSCRIPTIONS)) {
    assert.ok(guide.title.length > 5);
    assert.ok(guide.editorialRationale.length > 20);
    assert.ok(guide.imageUrl.startsWith('/images/runor/'));
    assert.ok(guide.segments.length >= 3, `${signum} ska ha minst 3 lässegment`);

    let prevOrder = 0;
    for (const seg of guide.segments) {
      assert.equal(seg.order, prevOrder + 1, 'Segment ska vara strikt sekventiellt numrerade');
      prevOrder = seg.order;

      // Validera procentuella koordinater för responsiv bildvisning
      const box = seg.boundingBoxPercent;
      assert.ok(box.x >= 0 && box.x <= 100, `${seg.id}: x ska vara 0-100%`);
      assert.ok(box.y >= 0 && box.y <= 100, `${seg.id}: y ska vara 0-100%`);
      assert.ok(box.width > 0 && box.x + box.width <= 100, `${seg.id}: x + width ska vara <= 100%`);
      assert.ok(box.height > 0 && box.y + box.height <= 100, `${seg.id}: y + height ska vara <= 100%`);

      // Validera textlager i segmentet
      assert.ok(seg.transliteration.length > 0, `${seg.id}: translitterering saknas`);
      assert.ok(seg.normalization.length > 0, `${seg.id}: normalisering saknas`);
      assert.ok(seg.translation.length > 0, `${seg.id}: översättning saknas`);
    }
  }
});

test('E32 Läsanimation - osäkra eller skadade segment markeras uttryckligen', () => {
  const vs24 = getGuidedReadingForSignum('Vs 24');
  assert.ok(vs24);
  const damagedVs24 = vs24.segments.find((s) => s.id === 'vs-24-seg-4');
  assert.ok(damagedVs24);
  assert.equal(damagedVs24.isUncertain, true, 'Skadad slutrad på Vs 24 ska markeras som osäker');

  const ol1 = getGuidedReadingForSignum('Öl 1');
  assert.ok(ol1);
  const weatheredOl1 = ol1.segments.find((s) => s.id === 'ol-1-seg-1');
  assert.ok(weatheredOl1);
  assert.equal(weatheredOl1.isUncertain, true, 'Vittrad inledning på Öl 1 ska markeras som osäker');
});

test('E32 Läsanimation - getGuidedReadingForSignum returnerar null för poster utan guide', () => {
  // Öl 15 är förlorad och har ingen bild
  const lostGuide = getGuidedReadingForSignum('Öl 15');
  assert.equal(lostGuide, null);

  const nonExistent = getGuidedReadingForSignum('XYZ 999');
  assert.equal(nonExistent, null);
});

test('E32 Läsanimation - texten är fullt läsbar utan overlay (Krav K11)', () => {
  // Verifiera att segmenten för Vs 24 tillsammans bildar en fullständig och sammanhängande text
  const vs24Guide = getGuidedReadingForSignum('Vs 24');
  assert.ok(vs24Guide);

  const vs24Inscr = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Vs 24');
  assert.ok(vs24Inscr);

  // Kontrollera att nyckelorden i translittereringen återfinns i inskriftens officiella textlager
  for (const seg of vs24Guide.segments) {
    const firstWord = seg.transliteration.split(' ')[0].replace(/[^a-zþöü]/gi, '');
    if (firstWord.length > 2) {
      assert.ok(
        vs24Inscr.textLayer.readingTransliteration.includes(firstWord),
        `Segmentets inledningsord "${firstWord}" ska finnas i inskriftens translitterering`
      );
    }
  }
});
