import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRunicInscription, validateRunicCorpus } from '../lib/runor/validation.ts';

const SAMPLE_VALID_INSCRIPTION = {
  id: 'runa-ol-1',
  canonicalSignum: 'Öl 1',
  provinceCode: 'Öl',
  itemNumber: 1,
  suffix: null,
  name: 'Karlevistenen',
  canonicalSlug: 'ol-1',
  previousSlugs: [],
  aliases: ['Bautil 102', 'Liljegren 135'],
  carrier: {
    id: 'carrier-ol-1',
    type: 'runsten',
    material: 'Kalksten',
    preservationStatus: 'bevarad_i_sin_helhet',
    heightCm: 180,
    widthCm: 80,
  },
  placements: [
    {
      type: 'fyndplats',
      province: 'Öland',
      parish: 'Vickleby socken',
      placeName: 'Karlevi',
      coordinatesWgs84: [16.4398, 56.6075],
      precision: 'exakt_koordinat',
      sourceNote: 'SRI band 1, s. 15',
    },
  ],
  dating: {
    originalSourceLabel: 'ca 980–1000',
    periodLabel: 'Vikingatid',
    earliestYear: 980,
    latestYear: 1000,
    isUncertain: false,
    datingMethod: 'Typologisk stilgruppering och historisk koppling till slaget vid Fyrisvallarna',
  },
  textLayer: {
    id: 'text-ol-1',
    readingTransliteration: '[s-a... --(s)- i(n)str...]',
    normalizationRunicSwedish: 'Stæinn [sa]/[sāi] es sattr...',
    translationSwedish: 'Stenen är satt efter Sibbe den gode...',
    isSigned: false,
  },
  source: {
    sriVolumeId: 'band-01',
    sriVolumeTitle: 'Ölands runinskrifter',
    author: 'Sven Söderberg & Erik Brate',
    publicationYear: 1906,
    printedPageStart: 15,
    printedPageEnd: 24,
    pdfPageStart: 19,
    pdfPageEnd: 28,
    plateNumber: 'Plansch I',
    externalUris: {
      samnordiskUuid: '28485f9b-7b54-48d5-b065-f6611fd3268d',
      raaRunorUri: 'https://app.raa.se/open/runor/inscription?item_key=28485f9b-7b54-48d5-b065-f6611fd3268d',
    },
  },
  images: [
    {
      id: 'img-ol-1-plansch',
      imageUrl: '/images/runor/ol-1-plansch.webp',
      caption: 'Karlevistenen, teckning ur SRI band 1',
      photographerOrArtist: 'Sven Söderberg',
      year: 1900,
      license: 'Public Domain',
      isPubliclyDistributable: true,
      isEditorialDrawing: true,
    },
  ],
  curationStatus: 'granskad_pilot',
};

test('validateRunicInscription godkänner en fullständig och korrekt inskrift (E06)', () => {
  const result = validateRunicInscription(SAMPLE_VALID_INSCRIPTION);
  assert.equal(result.valid, true, `Validering misslyckades: ${result.errors.join(', ')}`);
  assert.equal(result.errors.length, 0);
});

test('validateRunicInscription avvisar omvända dateringsintervall (earliestYear > latestYear)', () => {
  const invalid = {
    ...SAMPLE_VALID_INSCRIPTION,
    dating: {
      ...SAMPLE_VALID_INSCRIPTION.dating,
      earliestYear: 1050,
      latestYear: 1000,
    },
  };
  const result = validateRunicInscription(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /earliestYear.*>.*latestYear/);
});

test('validateRunicInscription avvisar koordinater utanför Norden', () => {
  const invalid = {
    ...SAMPLE_VALID_INSCRIPTION,
    placements: [
      {
        ...SAMPLE_VALID_INSCRIPTION.placements[0],
        coordinatesWgs84: [0.0, 20.0], // Mitt i Atlanten/Afrika
      },
    ],
  };
  const result = validateRunicInscription(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /ligger utanför Norden/);
});

test('validateRunicInscription avvisar publik bild med oklar licens', () => {
  const invalid = {
    ...SAMPLE_VALID_INSCRIPTION,
    images: [
      {
        ...SAMPLE_VALID_INSCRIPTION.images[0],
        license: 'oklar',
        isPubliclyDistributable: true,
      },
    ],
  };
  const result = validateRunicInscription(invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /saknar giltig licens/);
});

test('validateRunicCorpus upptäcker dubbletter av signum och slug', () => {
  const duplicate = {
    ...SAMPLE_VALID_INSCRIPTION,
    id: 'runa-ol-1-dublett',
  };
  const result = validateRunicCorpus([SAMPLE_VALID_INSCRIPTION, duplicate]);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /Dubblett av kanoniskt signum: Öl 1/);
  assert.match(result.errors.join(' '), /Dubblett av URL-slug: ol-1/);
});

test('RUNIC_PILOT_INSCRIPTIONS (E08 & E09) validerar felfritt för samtliga 20 kuraterade poster', async () => {
  const { RUNIC_PILOT_INSCRIPTIONS } = await import('../lib/runor/pilot-data.ts');
  assert.equal(RUNIC_PILOT_INSCRIPTIONS.length, 20, 'Piloten ska innehålla exakt 20 inskrifter');

  const corpusResult = validateRunicCorpus(RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(corpusResult.valid, true, `Valideringsfel i pilot: ${corpusResult.errors.join('; ')}`);
  assert.equal(corpusResult.errors.length, 0);

  // Verifiera svårfallsmatrisen (E09)
  const lostInscriptions = RUNIC_PILOT_INSCRIPTIONS.filter(
    (i) => i.carrier.preservationStatus === 'forlorad'
  );
  assert.ok(lostInscriptions.length >= 2, 'Piloten ska innehålla minst två förlorade inskrifter (t.ex. Öl 15, Öl 16)');

  const fragments = RUNIC_PILOT_INSCRIPTIONS.filter(
    (i) => i.carrier.preservationStatus === 'bevarad_i_fragment'
  );
  assert.ok(fragments.length >= 2, 'Piloten ska innehålla minst två fragment (t.ex. Öl 2, Öl 9)');

  const rockCarvings = RUNIC_PILOT_INSCRIPTIONS.filter(
    (i) => i.carrier.type === 'fast_hall' || i.carrier.type === 'runblock'
  );
  assert.ok(rockCarvings.length >= 3, 'Piloten ska innehålla fasta berghällar/runblock (t.ex. Sö 101, U 11, U 29, U 112)');

  // Verifiera geografisk integritet och flyttade/förlorade objekt (E13)
  const u73 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'U 73');
  assert.ok(u73, 'U 73 ska finnas i piloten');
  assert.equal(u73.placements.length, 2, 'Flyttade stenen U 73 ska ha både fyndplats och nuvarande placering');
  assert.equal(u73.placements[0].type, 'fyndplats');
  assert.equal(u73.placements[0].placeName, 'Hansta (fyndplats)');
  assert.equal(u73.placements[1].type, 'nuvarande_placering');
  assert.match(u73.placements[1].placeName, /Skansen/);

  for (const lost of lostInscriptions) {
    for (const p of lost.placements) {
      assert.equal(p.precision, 'sockencentrum', `Förlorat objekt ${lost.canonicalSignum} ska ha sockencentrum, inte exakt koordinat`);
    }
  }

  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    assert.ok(item.placements.length >= 1, `${item.canonicalSignum} ska ha minst en placering`);
    for (const p of item.placements) {
      assert.ok(p.sourceNote && p.sourceNote.length > 5, `${item.canonicalSignum} placering ska ha källnot`);
    }
  }
});

test('E16: Bildmanifest och optimerade bildfiler för samtliga 20 inskrifter', async () => {
  const fs = await import('fs');
  const path = await import('path');

  const manifestPath = path.resolve('docs/runor/bildmanifest-e16.json');
  assert.ok(fs.existsSync(manifestPath), 'docs/runor/bildmanifest-e16.json ska existera');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.equal(manifest.totalInscriptions, 20);
  assert.equal(manifest.depictedCount, 19);
  assert.equal(manifest.nonDepictedCount, 1);
  assert.equal(manifest.images.length, 20);

  for (const entry of manifest.images) {
    assert.ok(entry.canonicalSignum, 'Måste ha canonicalSignum');
    assert.ok(entry.caption && entry.caption.length > 10, `${entry.canonicalSignum} måste ha informativ bildtext`);
    assert.ok(entry.altText && entry.altText.length > 10, `${entry.canonicalSignum} måste ha beskrivande alt-text`);
    assert.equal(entry.license, 'Public Domain', `${entry.canonicalSignum} måste vara rättighetsklar (Public Domain)`);

    if (entry.isDepicted) {
      assert.ok(entry.displayImage.url.endsWith('.webp'), 'Displaybild ska vara WebP');
      assert.ok(entry.thumbImage.url.endsWith('.webp'), 'Tumnagel ska vara WebP');

      const displayDiskPath = path.resolve(entry.displayImage.url.replace(/^\//, 'public/'));
      const thumbDiskPath = path.resolve(entry.thumbImage.url.replace(/^\//, 'public/'));

      assert.ok(fs.existsSync(displayDiskPath), `Fil ska finnas på disk: ${displayDiskPath}`);
      assert.ok(fs.existsSync(thumbDiskPath), `Fil ska finnas på disk: ${thumbDiskPath}`);

      assert.ok(entry.displayImage.sizeBytes < 250000, `Displaybild ska vara webboptimerad (< 250 KB): ${entry.displayImage.sizeBytes} B`);
      assert.ok(entry.thumbImage.sizeBytes < 35000, `Tumnagel ska vara miniatyroptimerad (< 35 KB): ${entry.thumbImage.sizeBytes} B`);
    } else {
      assert.equal(entry.canonicalSlug, 'ol-15');
      assert.ok(entry.displayImage.isPlaceholder, 'Förlorad inskrift utan avbildning ska ha placeholder');
      const placeholderDiskPath = path.resolve('public/images/runor/ej-avbildad.svg');
      assert.ok(fs.existsSync(placeholderDiskPath), 'ej-avbildad.svg ska finnas på disk');
    }
  }
});


