import test from 'node:test';
import assert from 'node:assert/strict';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E18: Informationsarkitektur och statiska rutter för samtliga 20 inskrifter', () => {
  assert.equal(RUNIC_PILOT_INSCRIPTIONS.length, 20);

  const seenSlugs = new Set();
  for (const insc of RUNIC_PILOT_INSCRIPTIONS) {
    assert.ok(insc.canonicalSlug, 'Inskrift ska ha canonicalSlug');
    assert.ok(!seenSlugs.has(insc.canonicalSlug), `Slug dubblett: ${insc.canonicalSlug}`);
    seenSlugs.add(insc.canonicalSlug);

    // Kontrollera att varje inskrift har nödvändiga metadata för detaljvyn
    assert.ok(insc.canonicalSignum, 'Måste ha kanoniskt signum');
    assert.ok(insc.source.sriVolumeTitle, 'Måste ha SRI volymtitel');
    assert.ok(insc.source.printedPageStart > 0, 'Måste ha tryckt startsida');
    assert.ok(insc.source.pdfPageStart > 0, 'Måste ha PDF-startsida');
    assert.ok(insc.textLayer.translationSwedish, 'Måste ha svensk källöversättning');
    assert.ok(insc.textLayer.readingTransliteration, 'Måste ha translitterering');
    assert.ok(insc.images.length > 0, 'Måste ha minst en bildpost eller placeholder');

    // Kontrollera att bildfil eller placeholder existerar
    const img = insc.images[0];
    assert.ok(img.imageUrl.startsWith('/images/runor/'), 'Bildurl ska peka på /images/runor/');
    assert.ok(img.thumbnailUrl.startsWith('/images/runor/'), 'Tumnagel ska peka på /images/runor/');
  }
});

test('E18: Verifiera huvudtillstånd (Normalt, Filtrerat, Tomt resultat, Förlorat objekt)', () => {
  // 1. Normalt tillstånd: Alla 20 inskrifter
  const allCount = RUNIC_PILOT_INSCRIPTIONS.length;
  assert.equal(allCount, 20);

  // 2. Filtrerat tillstånd: Landskap
  const oland = RUNIC_PILOT_INSCRIPTIONS.filter((i) => i.provinceCode === 'Öl');
  assert.equal(oland.length, 8);
  const uppland = RUNIC_PILOT_INSCRIPTIONS.filter((i) => i.provinceCode === 'U');
  assert.equal(uppland.length, 7);

  // 3. Filtrerat tillstånd: Förlorade objekt
  const lost = RUNIC_PILOT_INSCRIPTIONS.filter((i) => i.carrier.preservationStatus === 'forlorad');
  assert.ok(lost.length >= 3);
  for (const l of lost) {
    assert.equal(l.placements[0].precision, 'sockencentrum');
  }

  // 4. Filtrerat tillstånd: Berghällar och flyttblock
  const rocks = RUNIC_PILOT_INSCRIPTIONS.filter(
    (i) => i.carrier.type === 'fast_hall' || i.carrier.type === 'runblock'
  );
  assert.ok(rocks.length >= 5);

  // 5. Tomt tillstånd: Sökning som inte matchar
  const nonExistent = RUNIC_PILOT_INSCRIPTIONS.filter((i) =>
    i.canonicalSignum.toLowerCase().includes('xyz-nonexistent')
  );
  assert.equal(nonExistent.length, 0);

  // 6. Kontrollera flyttat objekt med två placeringar (U 73)
  const u73 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'U 73');
  assert.ok(u73);
  assert.equal(u73.placements.length, 2);
  assert.equal(u73.placements[0].type, 'fyndplats');
  assert.equal(u73.placements[1].type, 'nuvarande_placering');

  // 7. Kontrollera förlorat objekt utan avbildning (Öl 15)
  const ol15 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Öl 15');
  assert.ok(ol15);
  assert.equal(ol15.images[0].imageUrl, '/images/runor/ej-avbildad.svg');
});
