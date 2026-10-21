import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toPublicPublishedItem,
  getPublishedRunicCorpus,
  getPublishedRunicInscription,
} from '../lib/runor/contract.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

const SAMPLE_BASE = RUNIC_PILOT_INSCRIPTIONS[0]; // Öl 1

test('E20: getPublishedRunicCorpus returnerar samtliga 20 godkända inskrifter', () => {
  const corpus = getPublishedRunicCorpus();
  assert.equal(corpus.version, '1.0.0');
  assert.equal(corpus.apiEndpoint, '/api/runor/v1');
  assert.equal(corpus.totalPublished, 20);
  assert.equal(corpus.inscriptions.length, 20);
  assert.match(corpus.license, /ODbL/);
  assert.match(corpus.attribution, /Sveriges runinskrifter/);

  for (const item of corpus.inscriptions) {
    assert.equal(item.status, 'publicerad');
    assert.equal(item.version, '1.0.0');
    assert.ok(item.canonicalSignum);
    assert.ok(item.canonicalSlug);
  }
});

test('E20: Filterfunktioner i getPublishedRunicCorpus fungerar', () => {
  // Landskapsfilter
  const oland = getPublishedRunicCorpus(undefined, { province: 'Öl' });
  assert.equal(oland.totalPublished, 8);

  const uppland = getPublishedRunicCorpus(undefined, { province: 'U' });
  assert.equal(uppland.totalPublished, 7);

  // Bärarfilter
  const fastHall = getPublishedRunicCorpus(undefined, { carrierType: 'fast_hall' });
  assert.ok(fastHall.totalPublished >= 2);

  // Sökfilter
  const karlevi = getPublishedRunicCorpus(undefined, { search: 'Karlevi' });
  assert.equal(karlevi.totalPublished, 1);
  assert.equal(karlevi.inscriptions[0].canonicalSignum, 'Öl 1');
});

test('E20: getPublishedRunicInscription slår upp på slug eller signum', () => {
  const bySlug = getPublishedRunicInscription('ol-1');
  assert.ok(bySlug);
  assert.equal(bySlug.canonicalSignum, 'Öl 1');
  assert.equal(bySlug.name, 'Karlevistenen');

  const bySignum = getPublishedRunicInscription('Öl 1');
  assert.ok(bySignum);
  assert.equal(bySignum.canonicalSlug, 'ol-1');

  const notFound = getPublishedRunicInscription('ogiltig-slug-12345');
  assert.equal(notFound, null);
});

test('E20 (Negativt test 1): Interna utkast utesluts strikt från publiceringskontraktet', () => {
  const draftItem = {
    ...SAMPLE_BASE,
    id: 'test-draft-1',
    canonicalSignum: 'Test 1',
    canonicalSlug: 'test-1',
    curationStatus: 'utkast',
  };

  const pubResult = toPublicPublishedItem(draftItem);
  assert.equal(pubResult, null, 'Ett utkast får aldrig godkännas i publiceringskontraktet');

  const corpusWithDraft = getPublishedRunicCorpus([SAMPLE_BASE, draftItem]);
  assert.equal(corpusWithDraft.totalPublished, 1);
  assert.equal(corpusWithDraft.inscriptions[0].canonicalSignum, 'Öl 1');
});

test('E20 (Negativt test 2): Arkiverade poster utesluts från publiceringskontraktet', () => {
  const archivedItem = {
    ...SAMPLE_BASE,
    id: 'test-archived-1',
    canonicalSignum: 'Test 2',
    canonicalSlug: 'test-2',
    curationStatus: 'arkiverad',
  };

  const pubResult = toPublicPublishedItem(archivedItem);
  assert.equal(pubResult, null, 'En arkiverad post får aldrig godkännas i publiceringskontraktet');
});

test('E20 (Negativt test 3): Poster med ogiltiga koordinater utanför Norden avvisas', () => {
  const invalidCoordsItem = {
    ...SAMPLE_BASE,
    id: 'test-invalid-coords',
    canonicalSignum: 'Test 3',
    canonicalSlug: 'test-3',
    placements: [
      {
        ...SAMPLE_BASE.placements[0],
        coordinatesWgs84: [0.0, 0.0], // Ekvatorn / Nollmeridianen
      },
    ],
  };

  const pubResult = toPublicPublishedItem(invalidCoordsItem);
  assert.equal(pubResult, null, 'Inskrifter med koordinater utanför Norden måste avvisas');
});

test('E20 (Negativt test 4): Poster med omvänt dateringsintervall avvisas', () => {
  const invalidDatingItem = {
    ...SAMPLE_BASE,
    id: 'test-invalid-dating',
    canonicalSignum: 'Test 4',
    canonicalSlug: 'test-4',
    dating: {
      ...SAMPLE_BASE.dating,
      earliestYear: 1100,
      latestYear: 1000, // Inverterat
    },
  };

  const pubResult = toPublicPublishedItem(invalidDatingItem);
  assert.equal(pubResult, null, 'Inskrifter med inverterade tidsintervall måste avvisas');
});

test('E20 (Negativt test 5): Poster med publik bild och oklar licens avvisas', () => {
  const invalidImageItem = {
    ...SAMPLE_BASE,
    id: 'test-invalid-image',
    canonicalSignum: 'Test 5',
    canonicalSlug: 'test-5',
    images: [
      {
        ...SAMPLE_BASE.images[0],
        isPubliclyDistributable: true,
        license: 'Oklar', // Otillåten licens
      },
    ],
  };

  const pubResult = toPublicPublishedItem(invalidImageItem);
  assert.equal(pubResult, null, 'Bilder med oklar licens får inte publiceras');
});
