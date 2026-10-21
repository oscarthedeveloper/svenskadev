import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import { CURRENT_RUNIC_DATASET_VERSION } from '../lib/runor/cache-control.ts';
import { toPublicPublishedItem } from '../lib/runor/contract.ts';

test('E40 Lansering: Publicerat bestånd motsvarar 2026.1-pilot (20 källgranskade poster)', () => {
  assert.equal(CURRENT_RUNIC_DATASET_VERSION, '2026.1-pilot');
  assert.equal(RUNIC_PILOT_INSCRIPTIONS.length, 20);

  // Alla poster måste vara granskade för release och icke-syntetiska
  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    assert.ok(
      item.curationStatus === 'publicerad' || item.curationStatus === 'granskad_pilot',
      `Inskrift ${item.canonicalSignum} måste ha godkänd kurering (publicerad eller granskad_pilot)`
    );
    assert.equal(item.isSynthetic ?? false, false, `Inskrift ${item.canonicalSignum} får inte vara syntetisk`);

    // Validera att publiceringskontraktet godkänner posten ovillkorligen
    const published = toPublicPublishedItem(item);
    assert.ok(published, `Inskrift ${item.canonicalSignum} måste godkännas av toPublicPublishedItem`);
    assert.equal(published.canonicalSlug, item.canonicalSlug);
  }
});

test('E40 Lansering: Saklig och verifierad geografisk täckning över 5 landskap', () => {
  const provinceCounts = {
    Öl: 0,
    U: 0,
    Ög: 0,
    Sö: 0,
    Vs: 0,
  };

  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    assert.ok(item.provinceCode in provinceCounts, `Okänd provinskod: ${item.provinceCode}`);
    provinceCounts[item.provinceCode] += 1;
  }

  // Verifiera exakt fördelning redovisad i lanseringsprotokollet
  assert.equal(provinceCounts.Öl, 8, 'Öland ska ha 8 poster');
  assert.equal(provinceCounts.U, 7, 'Uppland ska ha 7 poster');
  assert.equal(provinceCounts.Ög, 2, 'Östergötland ska ha 2 poster');
  assert.equal(provinceCounts.Sö, 2, 'Södermanland ska ha 2 poster');
  assert.equal(provinceCounts.Vs, 1, 'Västmanland ska ha 1 post');
});

test('E40 Lansering: Samtliga 20 kanoniska direktlänkar och källplanscher är intakta', () => {
  const publicDir = path.resolve('public');

  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    // Slug-format
    assert.match(item.canonicalSlug, /^[a-z0-9-]+$/, `Ogiltig slug: ${item.canonicalSlug}`);

    // Källplansch
    assert.ok(item.images.length > 0, `${item.canonicalSignum} saknar bild`);
    const primaryImage = item.images[0];
    assert.ok(primaryImage.imageUrl, `${item.canonicalSignum} saknar image.imageUrl`);

    // Kontrollera att filen faktiskt existerar på disk under public/
    const filePath = path.join(publicDir, primaryImage.imageUrl.replace(/^\//, ''));
    assert.ok(fs.existsSync(filePath), `Bildfil saknas på disk för ${item.canonicalSignum}: ${filePath}`);

    // Källhänvisning till SRI
    assert.ok(item.source.sriVolumeTitle, `${item.canonicalSignum} saknar sriVolumeTitle`);
    assert.ok(item.source.printedPageStart > 0, `${item.canonicalSignum} saknar giltigt tryckt sidnummer`);
  }
});

test('E40 Lansering: Vetenskaplig stringens för förlorade stenar (inga fiktiva koordinater)', () => {
  const lostInscriptions = RUNIC_PILOT_INSCRIPTIONS.filter(
    (item) => item.carrier.preservationStatus === 'forlorad'
  );

  assert.ok(lostInscriptions.length > 0, 'Pilotutgåvan måste innehålla representativa förlorade stenar');

  for (const item of lostInscriptions) {
    for (const placement of item.placements) {
      assert.equal(
        placement.precision,
        'sockencentrum',
        `Förlorad sten ${item.canonicalSignum} får inte ha exakt koordinat`
      );
    }
  }
});

test('E40 Lansering: Inga provisoriska BETA- eller byggarbetsbeteckningar i de publika vyerna', () => {
  const directoryClientSource = fs.readFileSync(
    path.resolve('components/runor/RunorDirectoryClient.tsx'),
    'utf-8'
  );

  assert.doesNotMatch(
    directoryClientSource,
    /\bBETA\b/i,
    'RunorDirectoryClient får inte innehålla BETA-märkningar'
  );
  assert.doesNotMatch(
    directoryClientSource,
    /under konstruktion/i,
    'RunorDirectoryClient får inte innehålla provisoriska "under konstruktion"-texter'
  );
  assert.match(
    directoryClientSource,
    /Datasetversion:.*2026\.1-pilot/i,
    'RunorDirectoryClient måste redovisa gällande datasetversion (2026.1-pilot)'
  );
  assert.match(
    directoryClientSource,
    /kontakt@fornsvenska\.se/i,
    'RunorDirectoryClient måste erbjuda kontaktväg för rättelser'
  );
});
