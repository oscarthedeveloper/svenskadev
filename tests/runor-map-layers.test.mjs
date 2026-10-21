import test from 'node:test';
import assert from 'node:assert/strict';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import {
  inscriptionsToGeoJson,
  selectPlacementForMode,
  groupPointsByCoordinate,
} from '../lib/runor/geojson.ts';

test('E24: inscriptionsToGeoJson genererar giltig RFC 7946 FeatureCollection med [lon, lat]', () => {
  const geojson = inscriptionsToGeoJson(RUNIC_PILOT_INSCRIPTIONS, 'fyndplats');

  assert.equal(geojson.type, 'FeatureCollection');
  assert.equal(geojson.version, '1.0.0');
  assert.ok(geojson.totalFeatures > 0);
  assert.equal(geojson.placementMode, 'fyndplats');

  for (const feature of geojson.features) {
    assert.equal(feature.type, 'Feature');
    assert.equal(feature.geometry.type, 'Point');

    const [lon, lat] = feature.geometry.coordinates;
    // WGS 84 Sverige: longitud 11° till 24° Ö, latitud 55° till 69° N
    assert.ok(lon >= 11 && lon <= 24, `Longitud ${lon} utanför Sverige för ${feature.properties.signum}`);
    assert.ok(lat >= 55 && lat <= 69, `Latitud ${lat} utanför Sverige för ${feature.properties.signum}`);

    // Kontrollera att obligatoriska metadata finns
    assert.ok(feature.properties.id);
    assert.ok(feature.properties.signum);
    assert.ok(feature.properties.slug);
    assert.ok(feature.properties.province);
    assert.ok(feature.properties.precision);
  }
});

test('E24: Inga dubblettpunkter från flera platsuppgifter i samma läge', () => {
  const geojson = inscriptionsToGeoJson(RUNIC_PILOT_INSCRIPTIONS, 'fyndplats');

  const seenIds = new Set();
  for (const feature of geojson.features) {
    assert.ok(!seenIds.has(feature.id), `Dubblett av ID upptäckt i GeoJSON: ${feature.id}`);
    seenIds.add(feature.id);
  }

  // Antalet features ska vara exakt antalet unika inskrifter som har koordinater
  assert.equal(geojson.features.length, seenIds.size);
});

test('E24: Fyndplats och nuvarande plats hanteras som separata lägen (U 73)', () => {
  const u73 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'U 73');
  assert.ok(u73);
  assert.equal(u73.placements.length, 2);

  // 1. Fyndplatsläge: Hansta i Spånga socken
  const findPlace = selectPlacementForMode(u73, 'fyndplats');
  assert.ok(findPlace);
  assert.equal(findPlace.type, 'fyndplats');
  assert.equal(findPlace.placeName, 'Hansta (fyndplats)');
  assert.equal(findPlace.parish, 'Spånga socken');
  assert.deepEqual(findPlace.coordinatesWgs84, [17.8999, 59.4219]);

  // 2. Nuvarande placeringsläge: Skansen i Stockholm
  const currentPlace = selectPlacementForMode(u73, 'nuvarande_plats');
  assert.ok(currentPlace);
  assert.equal(currentPlace.type, 'nuvarande_placering');
  assert.equal(currentPlace.placeName, 'Skansen (Bollnästorgets backe)');
  assert.deepEqual(currentPlace.coordinatesWgs84, [18.1017, 59.3248]);

  // Kontrollera att GeoJSON reflekterar skillnaden vid lägesväxling
  const geoFind = inscriptionsToGeoJson([u73], 'fyndplats');
  assert.equal(geoFind.features[0].properties.placeName, 'Hansta (fyndplats)');
  assert.deepEqual(geoFind.features[0].geometry.coordinates, [17.8999, 59.4219]);

  const geoCurrent = inscriptionsToGeoJson([u73], 'nuvarande_plats');
  assert.equal(geoCurrent.features[0].properties.placeName, 'Skansen (Bollnästorgets backe)');
  assert.deepEqual(geoCurrent.features[0].geometry.coordinates, [18.1017, 59.3248]);
});

test('E24: Osäkra lägen (sockencentrum) har rätt precision och uppfinner inga exakta koordinater', () => {
  const ol15 = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Öl 15');
  assert.ok(ol15);

  const p = selectPlacementForMode(ol15, 'fyndplats');
  assert.ok(p);
  assert.equal(p.precision, 'sockencentrum');
  assert.equal(p.parish, 'Södra Möckleby socken');

  const geojson = inscriptionsToGeoJson([ol15], 'fyndplats');
  assert.equal(geojson.features[0].properties.precision, 'sockencentrum');
  assert.equal(geojson.features[0].properties.isLost, true);
});

test('E24: Klustergruppering sammanför punkter i samma läge utan att radera identiteter', () => {
  const geojson = inscriptionsToGeoJson(RUNIC_PILOT_INSCRIPTIONS, 'fyndplats');
  const clusters = groupPointsByCoordinate(geojson.features);

  assert.ok(clusters.length > 0);
  let totalInClusters = 0;
  for (const c of clusters) {
    totalInClusters += c.features.length;
    if (!c.isSingle) {
      assert.ok(c.features.length >= 2);
      // Kontrollera att alla i klustret delar samma koordinat (inom 5 decimaler)
      const firstCoord = c.features[0].geometry.coordinates;
      for (const item of c.features) {
        assert.equal(item.geometry.coordinates[0].toFixed(4), firstCoord[0].toFixed(4));
        assert.equal(item.geometry.coordinates[1].toFixed(4), firstCoord[1].toFixed(4));
      }
    }
  }

  // Alla features ska finnas kvar i klustren
  assert.equal(totalInClusters, geojson.features.length);
});

test('E24: Listantal och kartantal förklaras när koordinater saknas', () => {
  const geojson = inscriptionsToGeoJson(RUNIC_PILOT_INSCRIPTIONS, 'fyndplats');

  const total = RUNIC_PILOT_INSCRIPTIONS.length;
  const withCoords = geojson.totalFeatures;
  const missingCoords = geojson.totalMissingCoordinates;

  assert.equal(withCoords + missingCoords, total);
});
