import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeSearchQueryForTelemetry,
  generateLaunchFollowupSummary,
  LAUNCH_ACTION_ITEMS,
} from '../lib/runor/launch-telemetry.ts';

test('E41 Telemetri: Dataminimering och integritetsskydd (inga personuppgifter sparas)', () => {
  // 1. Signum ska identifieras och normaliseras säkert
  const signumRes = sanitizeSearchQueryForTelemetry('öl 1');
  assert.equal(signumRes.isSafe, true);
  assert.equal(signumRes.isSignumPattern, true);
  assert.equal(signumRes.category, 'signum:ÖL 1');

  // 2. Kända landskap/socknar kategoriseras sakligt
  const geoRes = sanitizeSearchQueryForTelemetry('stenar i uppland');
  assert.equal(geoRes.isSafe, true);
  assert.equal(geoRes.category, 'geo:uppland');

  // 3. Potentiellt personlig eller oidentifierad fritext anonymiseras till ordlängd
  const sensitiveRes = sanitizeSearchQueryForTelemetry('Anna Andersson telefon 0701234567');
  assert.equal(sensitiveRes.isSafe, true);
  assert.equal(sensitiveRes.isSignumPattern, false);
  assert.equal(sensitiveRes.category, 'generic_query:length_33');
  assert.ok(!sensitiveRes.category.includes('Anna'));
  assert.ok(!sensitiveRes.category.includes('0701234567'));
});

test('E41 Telemetri: Fältmått uppfyller kvalitetsbudgetar över 1 dygn, 1 vecka och 1 månad', () => {
  const windows = ['1_dygn', '1_vecka', '1_manad'];

  for (const win of windows) {
    const summary = generateLaunchFollowupSummary(win);

    // Kärn-Web Vitals (Fältmått)
    assert.ok(summary.fieldMetrics.lcpP75Seconds <= 2.5, `${win}: LCP p75 måste vara <= 2.5s`);
    assert.ok(summary.fieldMetrics.inpP75Ms <= 200, `${win}: INP p75 måste vara <= 200ms`);
    assert.ok(summary.fieldMetrics.clsP75Score <= 0.1, `${win}: CLS p75 måste vara <= 0.1`);
    assert.ok(summary.fieldMetrics.ttfbP75Ms <= 800, `${win}: TTFB p75 måste vara <= 800ms`);

    // Resiliens och kartkostnad
    assert.ok(summary.mapAndCdnMetrics.tileErrorRatePercent < 0.1, `${win}: Tile error rate måste vara < 0.1%`);
    assert.ok(summary.mapAndCdnMetrics.cdnHitRatioPercent >= 90.0, `${win}: CDN hit ratio måste vara >= 90%`);

    // Strikt felkvot för systemfel (driftlarm)
    assert.ok(summary.errors.systemErrorRatePercent <= 0.1, `${win}: System error rate måste vara <= 0.1%`);
    // Källanomalier (saknad datering, förlorad sten) räknas inte som systemkrascher
    assert.ok(summary.errors.sourceAnomaliesCount > 0, `${win}: Källfel måste redovisas utan att utlösa larm`);
  }
});

test('E41 Telemetri: Analys av tomma sökningar har spårbara orsaker', () => {
  const summary1d = generateLaunchFollowupSummary('1_dygn');
  assert.ok(summary1d.searchMetrics.emptySearchRatePercent < 15.0, 'Tomma sökningar ska vara under 15%');
  assert.ok(summary1d.searchMetrics.topEmptyCategories.length > 0, 'Orsaker till tomma sökningar ska redovisas');

  // Småland är mest efterfrågade icke-publicerade landskapet
  const smalandCategory = summary1d.searchMetrics.topEmptyCategories.find(
    (c) => c.category === 'geo:småland'
  );
  assert.ok(smalandCategory, 'Sökningar på Småland ska vara spårade som orsak till tomma träffar');
  assert.ok(smalandCategory.cause.includes('Batch 2') || smalandCategory.cause.includes('planeras'));
});

test('E41 Åtgärdslista: Alla identifierade avvikelser har ägare, åtgärd och deadline', () => {
  assert.ok(LAUNCH_ACTION_ITEMS.length >= 3, 'Åtgärdslistan ska innehålla minst 3 konkreta åtgärder');

  for (const item of LAUNCH_ACTION_ITEMS) {
    assert.ok(item.id.startsWith('ACT-'), `Ogiltigt ID: ${item.id}`);
    assert.ok(item.title.length > 10, `För kort titel på ${item.id}`);
    assert.ok(item.observation.length > 10, `Saknar observation på ${item.id}`);
    assert.ok(item.action.length > 10, `Saknar åtgärdsbeskrivning på ${item.id}`);
    assert.ok(item.owner.length > 3, `Saknar ägare på ${item.id}`);
    assert.ok(item.targetMilestoneOrRelease.length > 1, `Saknar målutgåva på ${item.id}`);
  }
});
