import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E19: Kartutvärdering och Beslut D06', () => {
  const reportPath = path.resolve('docs/runor/kartutvardering-e19.json');
  assert.ok(fs.existsSync(reportPath), 'docs/runor/kartutvardering-e19.json ska existera');

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  assert.ok(report.benchmark, 'Måste ha benchmark-sektion');
  assert.equal(report.benchmark.pilotPoints, 20);
  assert.equal(report.benchmark.syntheticCorpusPoints, 2500);

  // Verifiera att klustringsprestanda är sub-millisekund (< 10 ms även vid 2500 punkter)
  assert.ok(
    report.benchmark.clusteringPerformanceMs.synthZoom6 < 10,
    `Klustring ska vara snabb: ${report.benchmark.clusteringPerformanceMs.synthZoom6} ms`
  );

  // Verifiera Beslut D06
  const d06 = report.decisionD06;
  assert.ok(d06, 'Måste innehålla Beslut D06');
  assert.equal(d06.decisionId, 'D06');
  assert.match(d06.primaryEngine, /Leaflet/);
  assert.match(d06.tileProvider, /CartoDB|CARTO/);
  assert.match(d06.fallbackEngine, /SVG/);
  assert.match(d06.attributionNotice, /OpenStreetMap/);
  assert.match(d06.attributionNotice, /CARTO/);
});

test('E19: Geografisk räckvidd och koordinatvalidering för samtliga pilotpunkter', () => {
  const SWEDEN_BOUNDS = {
    minLon: 11.0,
    maxLon: 24.5,
    minLat: 55.0,
    maxLat: 69.5,
  };

  for (const insc of RUNIC_PILOT_INSCRIPTIONS) {
    for (const p of insc.placements) {
      if (p.coordinatesWgs84) {
        const [lon, lat] = p.coordinatesWgs84;
        assert.ok(
          lon >= SWEDEN_BOUNDS.minLon && lon <= SWEDEN_BOUNDS.maxLon,
          `${insc.canonicalSignum} longitud ${lon} ska ligga inom Sveriges ram`
        );
        assert.ok(
          lat >= SWEDEN_BOUNDS.minLat && lat <= SWEDEN_BOUNDS.maxLat,
          `${insc.canonicalSignum} latitud ${lat} ska ligga inom Sveriges ram`
        );
      }
    }
  }

  // Verifiera specifikt att Öland är representerat med korrekta koordinater
  const olandItems = RUNIC_PILOT_INSCRIPTIONS.filter((i) => i.provinceCode === 'Öl');
  for (const oi of olandItems) {
    const p = oi.placements[0];
    assert.ok(p.coordinatesWgs84, `${oi.canonicalSignum} måste ha koordinater`);
    const [lon, lat] = p.coordinatesWgs84;
    assert.ok(lon >= 16.0 && lon <= 17.0, `${oi.canonicalSignum} longitud ska ligga på Öland: ${lon}`);
    assert.ok(lat >= 56.1 && lat <= 57.4, `${oi.canonicalSignum} latitud ska ligga på Öland: ${lat}`);
  }
});
