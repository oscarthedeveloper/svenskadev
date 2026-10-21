import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_CAMERA_MOTION,
  REDUCED_CAMERA_MOTION,
  getCameraMotionConfig,
  calculateVisibleCenter,
} from '../lib/runor/motion.ts';

test('E30 Kamerarörelse - standardkonfiguration ger mjuk och tidsbegränsad rörelse', () => {
  const config = getCameraMotionConfig(false);

  assert.equal(config.useAnimation, true);
  assert.equal(config.flyDurationSeconds, 0.8);
  assert.equal(config.targetZoomLevel, 12);
  assert.equal(config.easeLinearity, 0.25);
});

test('E30 Kamerarörelse - reducerad rörelse (prefers-reduced-motion) ger omedelbar övergång utan animation', () => {
  const config = getCameraMotionConfig(true);

  assert.equal(config.useAnimation, false);
  assert.equal(config.flyDurationSeconds, 0);
  assert.equal(config.targetZoomLevel, 12);
});

test('E30 Kamerarörelse - calculateVisibleCenter hanterar paneloffset på desktop och mobil', () => {
  const originalLat = 59.3293;
  const originalLon = 18.0686;

  // 1. Desktop med öppen panel (panel 350px, karta 1200px)
  const [deskLat, deskLon] = calculateVisibleCenter(originalLat, originalLon, 350, 1200, 12);
  assert.equal(deskLat, originalLat);
  assert.ok(deskLon > originalLon, 'Longituden ska förskjutas så markören hamnar fritt från panelen');

  // 2. Mobilvy där panelen täcker mer än 50 % av skärmen -> ingen förskjutning
  const [mobLat, mobLon] = calculateVisibleCenter(originalLat, originalLon, 340, 360, 12);
  assert.equal(mobLat, originalLat);
  assert.equal(mobLon, originalLon);

  // 3. Ingen panel öppen -> exakt ursprungligt centrum
  const [zeroLat, zeroLon] = calculateVisibleCenter(originalLat, originalLon, 0, 1000, 12);
  assert.equal(zeroLat, originalLat);
  assert.equal(zeroLon, originalLon);
});
