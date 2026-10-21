import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import { RUNIC_COMBINED_CORPUS_50 } from '../lib/runor/batch1-data.ts';
import { toPublicPublishedItem, getPublishedRunicCorpus } from '../lib/runor/contract.ts';
import {
  generateSyntheticInscriptions,
  measureGeoJsonPayload,
  benchmarkQueryLatency,
  benchmarkSelectionCycles,
} from '../lib/runor/synthetic-benchmark.ts';
import {
  CURRENT_RUNIC_DATASET_VERSION,
  BATCH1_RUNIC_DATASET_VERSION,
  isValidDatasetVersion,
  isDatasetVersionCompatible,
  getRunicCacheHeaders,
} from '../lib/runor/cache-control.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

test('E36: Pilot (20 poster) och Batch 1 (50 poster) har minimal nätverkspayload', () => {
  const pilotPayload = measureGeoJsonPayload(RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(pilotPayload.inscriptionCount, 20);
  assert.ok(pilotPayload.gzipKiB < 10, `Pilot gzip payload (${pilotPayload.gzipKiB} KiB) ska vara under 10 KiB`);

  const batch1Payload = measureGeoJsonPayload(RUNIC_COMBINED_CORPUS_50);
  assert.equal(batch1Payload.inscriptionCount, 50);
  assert.ok(batch1Payload.gzipKiB < 25, `Batch 1 gzip payload (${batch1Payload.gzipKiB} KiB) ska vara under 25 KiB`);
});

test('E36: Syntetiskt 10 000-punktsurval uppfyller kvalitetsbudgeten (<= 1 MiB gzip)', () => {
  const syn10k = generateSyntheticInscriptions(10000);
  assert.equal(syn10k.length, 10000);

  const payload = measureGeoJsonPayload(syn10k);
  assert.ok(payload.passedBudget, `10 000 punkter (${payload.gzipMiB} MiB gzip) måste klara budgeten 1.0 MiB`);
  assert.ok(payload.gzipKiB < 600, `Förväntar gzip-storlek under 600 KiB (observerad: ${payload.gzipKiB} KiB)`);
  assert.equal(payload.featureCount + payload.missingCoordinateCount, 10000);
});

test('E36: Säkerhetsspärr mot dataläckage — syntetiska punkter kan ALDRIG exponeras publikt', () => {
  const synList = generateSyntheticInscriptions(10);

  for (const item of synList) {
    assert.equal(item.isSynthetic, true);
    // toPublicPublishedItem MÅSTE avvisa syntetiska poster oavsett status
    const pub = toPublicPublishedItem(item);
    assert.equal(pub, null, `Syntetisk post ${item.canonicalSignum} fick inte passera toPublicPublishedItem`);
  }

  // Även om en syntetisk post artificiellt skulle blandas in i korpusen avvisas den av getPublishedRunicCorpus
  const mixedCorpus = [RUNIC_PILOT_INSCRIPTIONS[0], synList[0]];
  const pubCorpus = getPublishedRunicCorpus(mixedCorpus);
  const leaked = pubCorpus.inscriptions.find((i) => i.isSynthetic || i.canonicalSignum.startsWith('SYN'));
  assert.equal(leaked, undefined, 'Syntetisk punkt får aldrig finnas i getPublishedRunicCorpus');
});

test('E36: Frågemodell och filter för 10 000 punkter har sub-100 ms svarstid (reaktionsbudget)', () => {
  const syn10k = generateSyntheticInscriptions(10000);
  const latency = benchmarkQueryLatency(syn10k, 25);

  assert.ok(
    latency.p95Ms < 100,
    `p95 frågelatens (${latency.p95Ms} ms) måste vara under 100 ms reaktionsbudget`
  );
  assert.ok(latency.p50Ms < 20, `p50 frågelatens (${latency.p50Ms} ms) förväntas vara under 20 ms`);
});

test('E36: Stabilitet och minne över 5 cykler med 20 val (totalt 100 växlingar)', () => {
  const syn10k = generateSyntheticInscriptions(1000);
  const cycleResult = benchmarkSelectionCycles(syn10k, 5, 20);

  assert.equal(cycleResult.totalSelections, 100);
  assert.ok(cycleResult.stable, `Minneskurvan måste vara stabil (delta: ${cycleResult.heapDeltaMb} MB)`);
  assert.ok(cycleResult.p95SwitchMs < 10, `Urvalsväxling p95 (${cycleResult.p95SwitchMs} ms) ska vara < 10 ms`);
});

test('E36: Förhandsbilder i public/images/runor uppfyller kvalitetsbudgeten (<= 150 KiB)', () => {
  const imagesDir = path.join(PROJECT_ROOT, 'public', 'images', 'runor');
  assert.ok(fs.existsSync(imagesDir), 'public/images/runor ska existera');

  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter((f) => f.endsWith('.webp') || f.endsWith('.svg'));
  assert.ok(imageFiles.length > 0, 'Ska innehålla bildfiler');

  const MAX_THUMBNAIL_BYTES = 150 * 1024; // 150 KiB budget

  for (const file of imageFiles) {
    const filePath = path.join(imagesDir, file);
    const stats = fs.statSync(filePath);

    if (file.includes('-thumb.')) {
      assert.ok(
        stats.size <= MAX_THUMBNAIL_BYTES,
        `Förhandsbild ${file} (${Math.round(stats.size / 1024)} KiB) överskrider 150 KiB`
      );
      // Extra kontroll: de flesta tumnaglar ska ligga under 30 KiB
      assert.ok(
        stats.size < 30 * 1024,
        `Tumnagel ${file} (${Math.round(stats.size / 1024)} KiB) bör vara under 30 KiB`
      );
    }
  }
});

test('E36: Cache- och versionsstyrning garanterar kompatibilitet', () => {
  assert.equal(isValidDatasetVersion(CURRENT_RUNIC_DATASET_VERSION), true);
  assert.equal(isValidDatasetVersion(BATCH1_RUNIC_DATASET_VERSION), true);
  assert.equal(isValidDatasetVersion('1999.0-invalid'), false);
  assert.equal(isValidDatasetVersion(null), false);

  assert.equal(isDatasetVersionCompatible(CURRENT_RUNIC_DATASET_VERSION, CURRENT_RUNIC_DATASET_VERSION), true);
  assert.equal(isDatasetVersionCompatible('2025.0-old', CURRENT_RUNIC_DATASET_VERSION), false);
  assert.equal(isDatasetVersionCompatible(null, CURRENT_RUNIC_DATASET_VERSION), false);

  const headers = getRunicCacheHeaders(CURRENT_RUNIC_DATASET_VERSION);
  assert.ok(headers['Cache-Control'].includes('s-maxage=3600'));
  assert.ok(headers['Cache-Control'].includes('stale-while-revalidate=86400'));
  assert.equal(headers['X-Dataset-Version'], CURRENT_RUNIC_DATASET_VERSION);
  assert.ok(headers['ETag'].includes(CURRENT_RUNIC_DATASET_VERSION));
});
