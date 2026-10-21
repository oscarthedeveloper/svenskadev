import test from 'node:test';
import assert from 'node:assert/strict';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import { RUNIC_COMBINED_CORPUS_50 } from '../lib/runor/batch1-data.ts';
import {
  toPublicPublishedItem,
  getPublishedRunicCorpus,
  getPublishedRunicInscription,
} from '../lib/runor/contract.ts';
import {
  CURRENT_RUNIC_DATASET_VERSION,
  isValidDatasetVersion,
  getRunicCacheHeaders,
} from '../lib/runor/cache-control.ts';
import { executeRunicQuery } from '../lib/runor/search.ts';
import { inscriptionsToGeoJson } from '../lib/runor/geojson.ts';
import { generateRunicStructuredData } from '../lib/runor/routes.ts';
import { validateRunicInscription, validateRunicCorpus } from '../lib/runor/validation.ts';
import { generateSyntheticInscriptions } from '../lib/runor/synthetic-benchmark.ts';

test('E38: Fullständig källkritiskt validerad korpus (Pilot 20 & Batch 1 50)', () => {
  // 1. Piloten validerar felfritt
  const pilotValidation = validateRunicCorpus(RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(pilotValidation.valid, true);
  assert.equal(pilotValidation.errors.length, 0);
  assert.equal(RUNIC_PILOT_INSCRIPTIONS.length, 20);

  // 2. Batch 1 (30 nya + 20 pilot = 50 totalt) validerar felfritt
  const combinedValidation = validateRunicCorpus(RUNIC_COMBINED_CORPUS_50);
  assert.equal(combinedValidation.valid, true);
  assert.equal(combinedValidation.errors.length, 0);
  assert.equal(RUNIC_COMBINED_CORPUS_50.length, 50);

  // 3. Kontrollera källkedja: Varje post har verifierbar SRI-volym och Samnordisk-referens
  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    assert.ok(item.source.sriVolumeTitle && item.source.sriVolumeTitle.length > 0);
    assert.ok(item.source.printedPageStart > 0);
    assert.ok(item.source.pdfPageStart > 0);
    assert.ok(item.source.author && item.source.author.length > 0);
    assert.ok(item.source.externalUris.samnordiskUuid, `Samnordisk UUID saknas för ${item.canonicalSignum}`);
  }
});

test('E38: Publiceringsgräns & Negativ säkerhetskontroll (Utkast & Syntetiska poster)', () => {
  // A. Utkast blockeras strikt från publik åtkomst
  const draftItem = {
    ...RUNIC_PILOT_INSCRIPTIONS[0],
    id: 'draft-test-1',
    canonicalSlug: 'draft-test-1',
    curationStatus: 'utkast',
  };
  assert.equal(
    toPublicPublishedItem(draftItem),
    null,
    'Utkast får aldrig godkännas av toPublicPublishedItem'
  );

  // B. Arkiverade poster blockeras
  const archivedItem = {
    ...RUNIC_PILOT_INSCRIPTIONS[0],
    id: 'archived-test-1',
    canonicalSlug: 'archived-test-1',
    curationStatus: 'arkiverad',
  };
  assert.equal(
    toPublicPublishedItem(archivedItem),
    null,
    'Arkiverad post får aldrig publiceras'
  );

  // C. Syntetiska poster blockeras strikt oavsett godkänd curationStatus
  const syntheticItems = generateSyntheticInscriptions(5);
  for (const syn of syntheticItems) {
    assert.equal(
      toPublicPublishedItem(syn),
      null,
      `Syntetisk post ${syn.canonicalSignum} fick inte passera publiceringsgränsen`
    );
  }

  // D. getPublishedRunicInscription avvisar okända eller opublicerade slugs
  assert.equal(getPublishedRunicInscription('icke-existerande-slug'), null);
  assert.equal(getPublishedRunicInscription('syn-1'), null);

  // E. Kontrollera att interna redaktörsnoter döljs
  const publishedItem = toPublicPublishedItem(RUNIC_PILOT_INSCRIPTIONS[0]);
  assert.ok(publishedItem);
  assert.equal(publishedItem.matrixRole, undefined, 'Internt matrixRole ska döljas');
  assert.equal(publishedItem.isSynthetic, undefined, 'isSynthetic ska döljas');
});

test('E38: Frågemodell & Semantisk konsistens mellan Lista, Karta och API', () => {
  const testFilter = { province: 'U', carrierType: 'runsten' };
  const queryRes = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, testFilter);

  // 1. Frågeresultatet har identiska ID:n
  const matchedIds = queryRes.items.map((i) => i.id).sort();
  assert.ok(matchedIds.length > 0);

  // 2. GeoJSON FeatureCollection för samma filter har exakt samma punkter
  const geoJson = inscriptionsToGeoJson(queryRes.items, 'fyndplats');
  const geoIds = geoJson.features.map((f) => f.id).sort();
  assert.deepEqual(matchedIds, geoIds, 'Kartan och listan ska innehålla exakt samma ID-mängd');

  // 3. Tom sökning returnerar exakt 0 poster utan fel
  const emptyRes = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {
    searchQuery: 'fiktivt-ord-som-aldrig-finns-12345',
  });
  assert.equal(emptyRes.totalMatched, 0);
  assert.equal(emptyRes.items.length, 0);
});

test('E38: Schema.org JSON-LD och semantiska metadata enligt W3C-standard', () => {
  const item = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Öl 1');
  assert.ok(item);

  const jsonLd = generateRunicStructuredData(item);
  assert.equal(jsonLd['@context'], 'https://schema.org');
  assert.equal(jsonLd['@type'], 'VisualArtwork');
  assert.equal(jsonLd.name, 'Öl 1 (Karlevistenen)');
  assert.ok(jsonLd.description && jsonLd.description.length > 0);
  assert.ok(jsonLd.citation.includes('Ölands runinskrifter'));
  assert.ok(jsonLd.spatialCoverage?.geo, 'Geokoordinater ska ingå i spatialCoverage');
  assert.equal(jsonLd.spatialCoverage.geo['@type'], 'GeoCoordinates');
  assert.equal(typeof jsonLd.spatialCoverage.geo.latitude, 'number');
  assert.equal(typeof jsonLd.spatialCoverage.geo.longitude, 'number');
});

test('E38: API- och HTTP-cachekontrakt med versionsvalidering', () => {
  const publishedCorpus = getPublishedRunicCorpus(RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(publishedCorpus.totalPublished, 20);
  assert.equal(publishedCorpus.version, '1.0.0');

  // Kontrollera cache-headers
  const headers = getRunicCacheHeaders(CURRENT_RUNIC_DATASET_VERSION);
  assert.equal(headers['X-Dataset-Version'], '2026.1-pilot');
  assert.ok(headers['Cache-Control'].includes('public'));
  assert.ok(headers['ETag'].includes('runor-2026.1-pilot'));
  assert.equal(isValidDatasetVersion(CURRENT_RUNIC_DATASET_VERSION), true);
});
