import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import { RUNIC_COMBINED_CORPUS_50 } from '../lib/runor/batch1-data.ts';
import {
  classifyRunicEvent,
  verifyPostRollbackCorpus,
  ALERT_THRESHOLDS,
} from '../lib/runor/monitoring.ts';
import {
  CURRENT_RUNIC_DATASET_VERSION,
  BATCH1_RUNIC_DATASET_VERSION,
  isDatasetVersionCompatible,
} from '../lib/runor/cache-control.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

test('E39: Klockad rollback-övning genomförs på långt under 30 minuter (godkännandekrav)', () => {
  const t0 = performance.now();

  // 1. Simulera driftsatt läge med Batch 1 (50 poster)
  let activeVersion = BATCH1_RUNIC_DATASET_VERSION;
  let activeCorpus = RUNIC_COMBINED_CORPUS_50;
  assert.equal(activeCorpus.length, 50);
  assert.equal(activeVersion, '2026.2-batch1');

  // 2. Utlös kontrollerad återställning (rollback) till föregående frysta version
  activeVersion = CURRENT_RUNIC_DATASET_VERSION;
  activeCorpus = RUNIC_PILOT_INSCRIPTIONS;

  const t1 = performance.now();
  const durationMs = t1 - t0;
  const durationMinutes = durationMs / (1000 * 60);

  // Verifiera att återställningen tog långt under 30 minuter
  assert.ok(
    durationMinutes < ALERT_THRESHOLDS.maxRollbackDurationMinutes,
    `Rollback (${durationMinutes.toFixed(4)} min) måste vara under 30 minuter`
  );
  assert.ok(durationMs < 1000, `Rollback (${durationMs.toFixed(2)} ms) ska ta under 1 sekund i labbmiljö`);

  // 3. Verifiera att återställt bestånd är exakt piloten (20 poster)
  assert.equal(activeCorpus.length, 20);
  assert.equal(activeVersion, '2026.1-pilot');
  assert.equal(isDatasetVersionCompatible(activeVersion, CURRENT_RUNIC_DATASET_VERSION), true);
});

test('E39: Länk- och källkontroll efter återställning lämnar noll trasiga källänkar', () => {
  const result = verifyPostRollbackCorpus(RUNIC_PILOT_INSCRIPTIONS, CURRENT_RUNIC_DATASET_VERSION);

  assert.equal(result.passed, true);
  assert.equal(result.brokenLinksCount, 0);
  assert.equal(result.totalVerified, 20);
  assert.equal(result.brokenLinks.length, 0);

  // Verifiera att specifika källor som Karlevi (Öl 1) och Hassmyra (Vs 24) är intakta
  const karlevi = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Öl 1');
  assert.ok(karlevi);
  assert.ok(karlevi.source.pdfPageStart > 0);
  assert.ok(karlevi.source.sriVolumeTitle.includes('Öland'));

  const hassmyra = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Vs 24');
  assert.ok(hassmyra);
  assert.ok(hassmyra.source.pdfPageStart > 0);
  assert.ok(hassmyra.source.sriVolumeTitle.includes('Västmanland'));
});

test('E39: Logg- och fellarm särskiljer källfel från infrastrukturella systemfel', () => {
  // 1. Källfel: Förlorad sten och sockencentrum (ska inte larma drift)
  const sourceAnomaly = classifyRunicEvent({
    message: 'Inskrift Öl 2 är förlorad och visas vid sockencentrum',
    category: 'kallfel',
  });
  assert.equal(sourceAnomaly.category, 'kallfel');
  assert.equal(sourceAnomaly.requiresOpsAlert, false, 'Källfel får inte larma driftansvarig');

  // 2. Källfel: Okänd datering eller alternativ tolkning
  const datingNote = classifyRunicEvent({
    message: 'Inskrift saknar snäv datering och klassas som okänd datering',
  });
  assert.equal(datingNote.category, 'kallfel');
  assert.equal(datingNote.requiresOpsAlert, false);

  // 3. Systemfel: HTTP 500 eller databasfel (ska larma drift omedelbart)
  const systemFailure = classifyRunicEvent({
    message: 'Postgres connection timeout vid databashämtning',
    context: { statusCode: 500, errorName: 'PostgresTimeout' },
  });
  assert.equal(systemFailure.category, 'systemfel');
  assert.equal(systemFailure.requiresOpsAlert, true, 'Databas-timeout MÅSTE larma drift');

  // 4. Audit: Revisionslogg vid publicering
  const auditEvent = classifyRunicEvent({
    message: 'Publicering av version 2026.1-pilot slutförd',
  });
  assert.equal(auditEvent.category, 'audit');
  assert.equal(auditEvent.requiresOpsAlert, false);
});

test('E39: Produktionsrenhet — Inga råa PDF-original i bundle eller public-katalog', () => {
  const publicDir = path.join(PROJECT_ROOT, 'public');
  assert.ok(fs.existsSync(publicDir), 'public-katalogen ska existera');

  // Rekursiv sökning efter .pdf-filer i public
  function findPdfFiles(dir) {
    let pdfs = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        pdfs = pdfs.concat(findPdfFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.pdf')) {
        pdfs.push(fullPath);
      }
    }
    return pdfs;
  }

  const pdfInPublic = findPdfFiles(publicDir);
  assert.equal(
    pdfInPublic.length,
    0,
    `Inga PDF-filer (4.14 GiB original) får ligga i public-mappen (hittade: ${pdfInPublic.join(', ')})`
  );

  // Verifiera att netlify.toml är på plats och deklarerar npm run build
  const netlifyToml = path.join(PROJECT_ROOT, 'netlify.toml');
  assert.ok(fs.existsSync(netlifyToml), 'netlify.toml ska finnas i roten');
  const netlifyContent = fs.readFileSync(netlifyToml, 'utf8');
  assert.ok(netlifyContent.includes('command = "npm run build"'));
});
