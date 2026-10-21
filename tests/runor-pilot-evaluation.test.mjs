import test from 'node:test';
import assert from 'node:assert/strict';

import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import { executeRunicQuery } from '../lib/runor/search.ts';
import { parseRunicUrlState, serializeRunicUrlState, determineHistoryAction } from '../lib/runor/url-state.ts';
import { resolveRunicSlug, generateRunicMetadata } from '../lib/runor/routes.ts';
import { inscriptionsToGeoJson } from '../lib/runor/geojson.ts';

test('E29 Användarflöde 1: Hitta inskrift via fritext och filter', () => {
  // Användaren söker efter inskrifter om "bro" i Uppland
  const results = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {
    searchQuery: 'bro',
    province: 'U',
  });

  assert.ok(results.items.length > 0, 'Sökningen ska ge träffar');
  for (const item of results.items) {
    assert.equal(item.provinceCode, 'U');
    const reasons = results.matchReasons.get(item.id);
    assert.ok(reasons && reasons.length > 0);
  }
});

test('E29 Användarflöde 2: Förstå platsens säkerhet och flyttade objekt', () => {
  // Kontrollera förlorat objekt med sockencentrum (Öl 15)
  const ol15 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Öl 15');
  assert.ok(ol15);
  assert.equal(ol15.carrier.preservationStatus, 'forlorad');
  assert.equal(ol15.placements[0].precision, 'sockencentrum');

  // Kontrollera flyttad runsten (U 73)
  const u73 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'U 73');
  assert.ok(u73);
  const fynd = u73.placements.find((p) => p.type === 'fyndplats');
  const nuv = u73.placements.find((p) => p.type === 'nuvarande_placering');
  assert.ok(fynd && nuv);
  assert.notDeepEqual(fynd.coordinatesWgs84, nuv.coordinatesWgs84);
});

test('E29 Användarflöde 3: Öppna förlaga, textlager och källplansch', () => {
  // Granska Vs 24 (Hassmyrastenen)
  const vs24 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Vs 24');
  assert.ok(vs24);
  assert.ok(vs24.textLayer.readingTransliteration.includes('roþbalir × risti'));
  assert.ok(vs24.textLayer.translationSwedish.includes('Gode bonden Holmgöt'));
  assert.equal(vs24.source.sriVolumeId, 'band-13');
  assert.ok(vs24.source.printedPageStart > 0);
  assert.ok(vs24.images[0].imageUrl.endsWith('.webp'));
});

test('E29 Användarflöde 4: Delad URL och historiknavigering', () => {
  const urlState = parseRunicUrlState(new URLSearchParams('landskap=U&typ=runblock&vald=u-73-hansta'));
  assert.equal(urlState.province, 'U');
  assert.equal(urlState.carrierType, 'runblock');
  assert.equal(urlState.selectedSlug, 'u-73-hansta');

  const serialized = serializeRunicUrlState(urlState);
  assert.ok(serialized.includes('landskap=U'));
  assert.ok(serialized.includes('typ=runblock'));
  assert.ok(serialized.includes('vald=u-73-hansta'));

  // Skonsam historik
  const nextTypingState = { ...urlState, searchQuery: 'Gunnar' };
  assert.equal(determineHistoryAction(urlState, nextTypingState), 'replace');
});

test('E29 Användarflöde 5: Kritiska fel- och reservlägen (404, alias-redirect och metadata)', () => {
  // Okänd slug ger not_found
  const unknown = resolveRunicSlug('okand-sten', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(unknown.type, 'not_found');

  // Äldre alias redirectar till kanonisk slug
  const aliasLookup = resolveRunicSlug('bautil-15', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(aliasLookup.type, 'redirect');
  assert.equal(aliasLookup.canonicalSlug, 'ol-15');

  // Metadata genereras felfritt för kanonisk slug
  const meta = generateRunicMetadata('u-73', RUNIC_PILOT_INSCRIPTIONS);
  assert.ok(meta.title?.includes('U 73'));
  assert.ok(meta.description?.includes('Upplands runinskrifter'));
});
