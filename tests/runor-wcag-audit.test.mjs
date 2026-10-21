import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getCameraMotionConfig } from '../lib/runor/motion.ts';
import { GUIDED_TOURS } from '../lib/runor/guided-tours.ts';
import { GUIDED_READING_INSCRIPTIONS } from '../lib/runor/reading-segments.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Hjälpfunktion för att beräkna relativ luminans och kontrastförhållande enligt WCAG 2.1/2.2
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function getLuminance(r, g, b) {
  const [aR, aG, aB] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * aR + 0.7152 * aG + 0.0722 * aB;
}

function getContrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

test('E37 WCAG SC 1.4.3: Färgkontraster uppfyller nivå AA (>= 4.5:1 för brödtext)', () => {
  // Primär accentfärg (Faluröd) mot vit botten
  const falurodContrast = getContrastRatio('#8b1e0f', '#ffffff');
  assert.ok(
    falurodContrast >= 4.5,
    `Faluröd kontrast (${falurodContrast.toFixed(2)}:1) ska vara minst 4.5:1`
  );

  // Mörk bläcktext (#181815) mot pergamentbotten (#f3f0e5)
  const inkContrast = getContrastRatio('#181815', '#f3f0e5');
  assert.ok(
    inkContrast >= 7.0,
    `Bläcktext mot pappersbakgrund (${inkContrast.toFixed(2)}:1) ska klara AAA (>= 7:1)`
  );

  // Tur- och läsknappar mörkblå (#2c5282) mot vit botten
  const blueContrast = getContrastRatio('#2c5282', '#ffffff');
  assert.ok(
    blueContrast >= 4.5,
    `Guideblå text (${blueContrast.toFixed(2)}:1) ska vara minst 4.5:1`
  );
});

test('E37 WCAG SC 1.3.1: Semantik, landmärken och tabellstruktur i katalogen', () => {
  const clientFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorDirectoryClient.tsx');
  const content = fs.readFileSync(clientFile, 'utf8');

  // Skip link för tangentbordsnavigering
  assert.ok(
    content.includes('href="#runor-results-main"'),
    'Katalogen ska ha en hopplänk (skip-link) till huvudresultaten'
  );
  assert.ok(
    content.includes('id="runor-results-main"'),
    'Resultatsektionen ska ha motsvarande mål-id'
  );

  // Landmärken
  assert.ok(
    content.includes('role="search"'),
    'Sökfältet ska deklareras med role="search"'
  );
  assert.ok(
    content.includes('<section className="runor-control-bar" aria-label="Sök och filtrera inskrifter">'),
    'Kontrollpanelen ska ha en tydlig sektionsetikett'
  );

  // Tabellstruktur med scope="col"
  assert.ok(
    content.includes('<th scope="col">Signum / Namn</th>'),
    'Tabellhuvuden ska specificera scope="col"'
  );
  assert.ok(
    content.includes('<th scope="col">Källa i SRI</th>'),
    'Källkolumnen ska specificera scope="col"'
  );
});

test('E37 WCAG SC 4.1.3: Asynkrona statusändringar annonseras via aria-live', () => {
  const clientFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorDirectoryClient.tsx');
  const clientContent = fs.readFileSync(clientFile, 'utf8');

  // Resultaträknare
  assert.ok(
    clientContent.includes('aria-live="polite"'),
    'Resultaträknaren ska ha aria-live="polite"'
  );

  // Läsguide
  const guideFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorReadingGuide.tsx');
  const guideContent = fs.readFileSync(guideFile, 'utf8');
  assert.ok(
    guideContent.includes('aria-live="polite"'),
    'Läsguiden ska annonsera aktivt segment via aria-live="polite"'
  );

  // Tematiska guidningar
  const tourFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorGuidedToursBar.tsx');
  const tourContent = fs.readFileSync(tourFile, 'utf8');
  assert.ok(
    tourContent.includes('aria-live="polite"'),
    'Guidningsbaren ska annonsera aktivt stopp via aria-live="polite"'
  );

  // Kartfel och reservstatus
  const mapFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorInteractiveMap.tsx');
  const mapContent = fs.readFileSync(mapFile, 'utf8');
  assert.ok(
    mapContent.includes('role="region"') && mapContent.includes('Reservvy för runkarta'),
    'Kartreserven ska deklarera ett tillgängligt region-landmärke'
  );
});

test('E37 WCAG SC 2.3.3: Reducerad rörelse (prefers-reduced-motion) respekteras utan undantag', () => {
  // Kamerarörelse
  const reducedMotionConfig = getCameraMotionConfig(true);
  assert.equal(reducedMotionConfig.useAnimation, false);
  assert.equal(reducedMotionConfig.flyDurationSeconds, 0);

  // CSS-regler i globals.css
  const cssFile = path.join(PROJECT_ROOT, 'app', 'globals.css');
  const cssContent = fs.readFileSync(cssFile, 'utf8');

  assert.ok(
    cssContent.includes('@media (prefers-reduced-motion: reduce)'),
    'globals.css måste innehålla prefers-reduced-motion-undantag'
  );
  assert.ok(
    cssContent.includes('animation: none !important'),
    'Animationer ska stängas av vid reducerad rörelse'
  );
  assert.ok(
    cssContent.includes('transition: none !important'),
    'Övergångar ska stängas av vid reducerad rörelse'
  );
});

test('E37 WCAG SC 2.1.1 & 2.1.2: Tangentbordsnavigering och inga fokusfällor', () => {
  const clientFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorDirectoryClient.tsx');
  const clientContent = fs.readFileSync(clientFile, 'utf8');

  // Escape-tangent stänger panel
  assert.ok(
    clientContent.includes("e.key === 'Escape'"),
    'Katalogen ska lyssna på Escape för att stänga snabbvisning'
  );

  // Läsguiden har tangentbordsstöd (piltangenter & mellanslag)
  const guideFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorReadingGuide.tsx');
  const guideContent = fs.readFileSync(guideFile, 'utf8');
  assert.ok(
    guideContent.includes("e.key === 'ArrowRight'"),
    'Läsguiden ska stödja högerpil'
  );
  assert.ok(
    guideContent.includes("e.key === 'ArrowLeft'"),
    'Läsguiden ska stödja vänsterpil'
  );
  assert.ok(
    guideContent.includes("e.key === ' '"),
    'Läsguiden ska stödja paus/start med mellanslag'
  );
});

test('E37 WCAG SC 2.5.8: Pekmål (Target Size Minimum) är minst 24x24 px', () => {
  const tourFile = path.join(PROJECT_ROOT, 'components', 'runor', 'RunorGuidedToursBar.tsx');
  const tourContent = fs.readFileSync(tourFile, 'utf8');

  // Stopp-knapparna i turen ska vara minst 24x24 px (i koden: 28x28 px)
  assert.ok(
    tourContent.includes("minWidth: '28px'") && tourContent.includes("minHeight: '28px'"),
    'Stopp-knapparna ska ha minst 28px klickyta'
  );

  const cssFile = path.join(PROJECT_ROOT, 'app', 'globals.css');
  const cssContent = fs.readFileSync(cssFile, 'utf8');
  assert.ok(
    cssContent.includes('min-height: 44px'),
    'Pekmål på mobila enheter (@media pointer: coarse) ska ha minst 44px höjd'
  );
});

test('E37 Krav K09 & K11: Likvärdigt listalternativ och textläsning utan bildoverlay', () => {
  // Läsguiden innehåller alltid fullständig sekvenstext utan krav på bildvisning
  for (const guide of Object.values(GUIDED_READING_INSCRIPTIONS)) {
    assert.ok(guide.segments.length > 0);
    for (const seg of guide.segments) {
      assert.ok(seg.translation && seg.translation.length > 0);
      assert.ok(seg.normalization && seg.normalization.length > 0);
    }
  }

  // Turer innehåller kompletta textuella sammanfattningar och signum
  for (const tour of GUIDED_TOURS) {
    assert.ok(tour.steps.length >= 3);
    for (const step of tour.steps) {
      assert.ok(step.canonicalSignum && step.canonicalSignum.length > 0);
      assert.ok(step.historicalContext && step.historicalContext.length > 0);
      assert.ok(step.sourceCitation && step.sourceCitation.length > 0);
    }
  }
});
