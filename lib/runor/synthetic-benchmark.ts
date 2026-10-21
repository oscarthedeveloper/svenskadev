/**
 * Syntetisk testbänk och prestandabudgetmätning (E36).
 *
 * Mäter:
 * 1. Payload-storlek för 10 000 syntetiska punkter i gzippat GeoJSON-format (Budget: <= 1 MiB).
 * 2. Fråge- och filterlatens (p50, p95, max) över 10 000 punkter.
 * 3. Minnesstabilitet och urvalsväxling över 5 cykler med 20 val (totalt 100 växlingar).
 * 4. Skydd mot dataläckage: Syntetiska punkter märks med `isSynthetic: true` och
 *    avvisas garanterat av alla publika API- och publiceringskontrakt.
 */

import zlib from 'node:zlib';
import type { RunicInscription } from './types.ts';
import { inscriptionsToGeoJson } from './geojson.ts';
import { executeRunicQuery, type RunicFilterCriteria } from './search.ts';

const PROVINCES = ['U', 'Sö', 'Ög', 'Öl', 'Vs', 'Sm', 'Vg', 'G'] as const;
const CARRIERS = ['runsten', 'fast_hall', 'runblock', 'gravhall', 'fragment'] as const;

/**
 * Genererar deterministiska syntetiska inskrifter för laboratoriemätning.
 * ALLA genererade entiteter har `isSynthetic: true`.
 */
export function generateSyntheticInscriptions(count: number = 10000): RunicInscription[] {
  const items: RunicInscription[] = [];

  for (let i = 1; i <= count; i++) {
    const prov = PROVINCES[i % PROVINCES.length];
    const carrier = CARRIERS[i % CARRIERS.length];
    const isLost = i % 10 === 0; // 10 % förlorade
    const hasCoordinates = i % 25 !== 0; // 4 % saknar koordinater

    // Koordinatutbredning inom Sverige: lat 55.5–63.5, lon 11.5–19.0
    const lat = 55.5 + ((i * 37) % 800) / 100;
    const lon = 11.5 + ((i * 59) % 750) / 100;
    const precision = isLost ? 'sockencentrum' : 'exakt_koordinat';

    const item: RunicInscription = {
      id: `syn-${i}`,
      canonicalSignum: `SYN ${i}`,
      provinceCode: prov,
      itemNumber: i,
      suffix: null,
      name: i % 7 === 0 ? `Syntetisk sten ${i}` : null,
      canonicalSlug: `syn-${i}`,
      previousSlugs: [],
      aliases: [`Testalias ${i}`],
      matrixRole: isLost ? 'Förlorad inskrift' : 'Standard runsten',
      isSynthetic: true, // E36 skyddsmarkering

      carrier: {
        id: `carrier-syn-${i}`,
        type: carrier,
        material: 'Granit',
        preservationStatus: isLost ? 'forlorad' : 'bevarad_i_sin_helhet',
        heightCm: 180,
        widthCm: 110,
        thicknessCm: 30,
      },

      placements: [
        {
          type: 'fyndplats',
          coordinatesWgs84: hasCoordinates ? [lon, lat] : null,
          precision: hasCoordinates ? precision : 'okant_lage',
          placeName: `Testgård ${i}`,
          parish: `Testsocken ${i % 100}`,
          hundred: `Testhärad ${i % 20}`,
          province: prov,
          sourceNote: 'Syntetisk testpunkt för budgetmätning E36',
        },
      ],

      dating: {
        originalSourceLabel: 'Vikingatid (ca 950–1050)',
        periodLabel: 'Vikingatid',
        earliestYear: 950,
        latestYear: 1050,
        isUncertain: false,
        datingMethod: 'Typologisk/konsthistorisk stilgruppering',
      },

      textLayer: {
        id: `text-syn-${i}`,
        readingTransliteration: `runar : reisti : stain : syn : ${i}`,
        normalizationRunicSwedish: `Rúnar reisti stein syn ${i}`,
        translationSwedish: `Rune reste denna sten till minne av broder nummer ${i}.`,
        isSigned: false,
      },

      source: {
        sriVolumeId: 'band-01',
        sriVolumeTitle: 'Syntetisk testkorpus',
        author: 'E36 Benchmark Lab',
        publicationYear: 2026,
        printedPageStart: i,
        printedPageEnd: i,
        pdfPageStart: i,
        pdfPageEnd: i,
        externalUris: {
          samnordiskUuid: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
        },
      },

      images: [],
      curationStatus: 'granskad_pilot',
      reviewedAt: '2026-10-22',
      reviewedBy: 'Testbänk E36',
    };

    items.push(item);
  }

  return items;
}

export interface PayloadMeasurement {
  inscriptionCount: number;
  featureCount: number;
  missingCoordinateCount: number;
  rawJsonBytes: number;
  rawJsonKiB: number;
  rawJsonMiB: number;
  gzipBytes: number;
  gzipKiB: number;
  gzipMiB: number;
  budgetMiB: number;
  passedBudget: boolean;
}

/**
 * Mäter GeoJSON-payloadstorlek (rå och komprimerad) mot budgeten 1 MiB gzip för 10 000 punkter.
 */
export function measureGeoJsonPayload(inscriptions: RunicInscription[]): PayloadMeasurement {
  const geoJson = inscriptionsToGeoJson(inscriptions, 'fyndplats');
  const jsonStr = JSON.stringify(geoJson);
  const rawBytes = Buffer.byteLength(jsonStr, 'utf8');
  const gzipBuf = zlib.gzipSync(Buffer.from(jsonStr, 'utf8'), { level: 9 });
  const gzipBytes = gzipBuf.length;

  const budgetMiB = 1.0;
  const budgetBytes = 1024 * 1024; // 1 MiB = 1 048 576 bytes

  return {
    inscriptionCount: inscriptions.length,
    featureCount: geoJson.totalFeatures,
    missingCoordinateCount: geoJson.totalMissingCoordinates,
    rawJsonBytes: rawBytes,
    rawJsonKiB: Math.round((rawBytes / 1024) * 10) / 10,
    rawJsonMiB: Math.round((rawBytes / (1024 * 1024)) * 100) / 100,
    gzipBytes,
    gzipKiB: Math.round((gzipBytes / 1024) * 10) / 10,
    gzipMiB: Math.round((gzipBytes / (1024 * 1024)) * 100) / 100,
    budgetMiB,
    passedBudget: gzipBytes <= budgetBytes,
  };
}

export interface QueryLatencyMeasurement {
  iterations: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
  meanMs: number;
  latenciesMs: number[];
}

/**
 * Mäter sök- och filtreringslatens över ett inskriftsbestånd.
 */
export function benchmarkQueryLatency(
  inscriptions: RunicInscription[],
  iterations: number = 40
): QueryLatencyMeasurement {
  const testCriteria: RunicFilterCriteria[] = [
    { province: 'U' },
    { province: 'Öl', carrierType: 'runsten' },
    { searchQuery: 'minne' },
    { searchQuery: 'SYN 500' },
    { timeFilter: { startYear: 900, endYear: 1000, includeUnknown: false } },
    { hasKnownCoordinates: true },
    { preservationStatus: 'forlorad' },
    { searchQuery: 'reisti', province: 'Sö' },
  ];

  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const criteria = testCriteria[i % testCriteria.length];
    const t0 = performance.now();
    executeRunicQuery(inscriptions, criteria);
    const t1 = performance.now();
    latencies.push(t1 - t0);
  }

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const mean = latencies.reduce((acc, v) => acc + v, 0) / latencies.length;

  return {
    iterations,
    p50Ms: Math.round(p50 * 100) / 100,
    p95Ms: Math.round(p95 * 100) / 100,
    maxMs: Math.round(max * 100) / 100,
    meanMs: Math.round(mean * 100) / 100,
    latenciesMs: latencies.map((n) => Math.round(n * 100) / 100),
  };
}

export interface SelectionCycleMeasurement {
  cycles: number;
  selectionsPerCycle: number;
  totalSelections: number;
  p95SwitchMs: number;
  maxSwitchMs: number;
  meanSwitchMs: number;
  initialHeapMb: number;
  finalHeapMb: number;
  heapDeltaMb: number;
  stable: boolean;
}

/**
 * Mäter interaktionsstabilitet över upprepade urvalscykler (Avsnitt 10: 5 cykler med 20 val).
 */
export function benchmarkSelectionCycles(
  inscriptions: RunicInscription[],
  cycles: number = 5,
  selectionsPerCycle: number = 20
): SelectionCycleMeasurement {
  const initialMem = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
  const selectionLatencies: number[] = [];

  const candidates = inscriptions.slice(0, selectionsPerCycle);

  for (let c = 0; c < cycles; c++) {
    for (let s = 0; s < candidates.length; s++) {
      const target = candidates[s];
      const t0 = performance.now();

      // Simulera detaljväxling och filterapplicering
      const found = inscriptions.find((item) => item.canonicalSlug === target.canonicalSlug);
      if (!found) throw new Error(`Inskrift saknas: ${target.canonicalSlug}`);

      const t1 = performance.now();
      selectionLatencies.push(t1 - t0);
    }
  }

  const finalMem = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
  selectionLatencies.sort((a, b) => a - b);

  const p95 = selectionLatencies[Math.floor(selectionLatencies.length * 0.95)] || 0;
  const max = selectionLatencies[selectionLatencies.length - 1] || 0;
  const mean = selectionLatencies.reduce((a, b) => a + b, 0) / selectionLatencies.length;

  const initialHeapMb = Math.round((initialMem / (1024 * 1024)) * 10) / 10;
  const finalHeapMb = Math.round((finalMem / (1024 * 1024)) * 10) / 10;
  const heapDeltaMb = Math.round((finalHeapMb - initialHeapMb) * 10) / 10;

  return {
    cycles,
    selectionsPerCycle,
    totalSelections: cycles * selectionsPerCycle,
    p95SwitchMs: Math.round(p95 * 100) / 100,
    maxSwitchMs: Math.round(max * 100) / 100,
    meanSwitchMs: Math.round(mean * 100) / 100,
    initialHeapMb,
    finalHeapMb,
    heapDeltaMb,
    // Stabilitetskrav: Ingen ohämmad minnesläcka (delta < 50 MB i Node-miljö)
    stable: heapDeltaMb < 50,
  };
}
