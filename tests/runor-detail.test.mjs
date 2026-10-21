import test from 'node:test';
import assert from 'node:assert/strict';

import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E26 Detaljvy - samtliga 20 inskrifter har strikt separerade textlager och källhänvisningar', () => {
  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    // 1. Textlager är åtskilda och inte sammanblandade
    assert.ok(item.textLayer.readingTransliteration, `${item.canonicalSignum} saknar translitterering`);
    assert.ok(item.textLayer.translationSwedish, `${item.canonicalSignum} saknar svensk tolkning`);
    assert.notEqual(
      item.textLayer.readingTransliteration,
      item.textLayer.translationSwedish,
      `${item.canonicalSignum} translitterering och översättning får inte vara identiska`
    );

    // 2. Källhänvisning är verifierad med boktitel, tryckt sida och PDF-sida
    assert.ok(item.source.sriVolumeTitle, `${item.canonicalSignum} saknar sriVolumeTitle`);
    assert.ok(item.source.author, `${item.canonicalSignum} saknar author`);
    assert.ok(item.source.printedPageStart > 0, `${item.canonicalSignum} saknar printedPageStart`);
    assert.ok(item.source.pdfPageStart > 0, `${item.canonicalSignum} saknar pdfPageStart`);

    // 3. Externa länkar är formellt giltiga
    assert.ok(
      item.source.externalUris.raaRunorUri.startsWith('https://app.raa.se/open/runor/inscription?item_key='),
      `${item.canonicalSignum} har ogiltig raaRunorUri`
    );
    assert.match(
      item.source.externalUris.samnordiskUuid,
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      `${item.canonicalSignum} har ogiltigt Samnordisk UUID-format`
    );
  }
});

test('E26 Svårfall 1 (Öl 15) - Förlorad inskrift hanteras med sockencentrum och ej-avbildad placeholder', () => {
  const ol15 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Öl 15');
  assert.ok(ol15, 'Öl 15 saknas');

  assert.equal(ol15.carrier.preservationStatus, 'forlorad');
  assert.equal(ol15.placements[0].precision, 'sockencentrum');
  assert.equal(ol15.images[0]?.imageUrl, '/images/runor/ej-avbildad.svg');
  assert.ok(ol15.images[0]?.caption.includes('förlorad'));
});

test('E26 Svårfall 2 (U 73) - Flyttad runsten särskiljer ursprunglig fyndplats från nuvarande placering', () => {
  const u73 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'U 73');
  assert.ok(u73, 'U 73 saknas');

  const fyndplats = u73.placements.find((p) => p.type === 'fyndplats');
  const nuvarande = u73.placements.find((p) => p.type === 'nuvarande_placering');

  assert.ok(fyndplats, 'Fyndplats saknas för U 73');
  assert.ok(nuvarande, 'Nuvarande placering saknas för U 73');

  assert.equal(fyndplats.placeName, 'Hansta (fyndplats)');
  assert.equal(fyndplats.parish, 'Spånga socken');

  assert.equal(nuvarande.placeName, 'Skansen (Bollnästorgets backe)');
  assert.equal(nuvarande.parish, 'Stockholms stad / Oscars församling');

  // Koordinaterna ska skilja sig åt
  assert.notDeepEqual(fyndplats.coordinatesWgs84, nuvarande.coordinatesWgs84);
});

test('E26 Svårfall 3 (U 112B) - Flera inskrifter på samma block särskiljs med unika identiteter', () => {
  const u112b = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'U 112B');
  assert.ok(u112b, 'U 112B saknas');

  assert.equal(u112b.suffix, 'B');
  assert.equal(u112b.carrier.type, 'runblock');
  assert.ok(u112b.aliases.includes('Kyrkstigsblocket'));
  assert.ok(u112b.matrixRole.includes('Flera inskrifter på samma bärare'));
});

test('E26 Svårfall 4 (Vs 24) - Skaldedikt med fornyrðislag och Balle den röde', () => {
  const vs24 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Vs 24');
  assert.ok(vs24, 'Vs 24 saknas');

  assert.equal(vs24.name, 'Hassmyrastenen (Odendisa)');
  assert.ok(vs24.editorialNotes?.includes('fornyrðislag'));
  assert.ok(vs24.dating.datingMethod?.includes('Balle'));
  assert.ok(vs24.textLayer.readingTransliteration.includes('roþbalir × risti × runi × þisa'));
});
