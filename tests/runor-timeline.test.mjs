import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RUNIC_EPOCHS,
  DEFAULT_PLAYBACK_STATE,
  advanceTimeWindow,
} from '../lib/runor/timeline.ts';
import { executeRunicQuery, matchesDatingInterval } from '../lib/runor/search.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E31 Tidsfilter - RUNIC_EPOCHS definierar förankrade historiska epoker utan falska mittpunkter', () => {
  assert.ok(Array.isArray(RUNIC_EPOCHS));
  assert.ok(RUNIC_EPOCHS.length >= 4);

  const all = RUNIC_EPOCHS.find((e) => e.id === 'alla-tider');
  assert.ok(all);
  assert.equal(all.startYear, 750);
  assert.equal(all.endYear, 1250);

  // Verifiera att alla epoker har start <= end inom ramen för svenskt runmaterial
  for (const epoch of RUNIC_EPOCHS) {
    assert.ok(epoch.startYear <= epoch.endYear, `Epok ${epoch.id} måste ha start <= end`);
    assert.ok(epoch.startYear >= 750, `Epok ${epoch.id} startår bör vara >= 750`);
    assert.ok(epoch.endYear <= 1250, `Epok ${epoch.id} slutår bör vara <= 1250`);
    assert.ok(epoch.description.length > 10);
  }
});

test('E31 Tidsfilter - advanceTimeWindow stegar tidsfönster framåt och loopar kontrollerat', () => {
  // 1. Vanligt steg från 800 med fönster 75 och steg 25
  const step1 = advanceTimeWindow(800, 75, 800, 1175, 25);
  assert.equal(step1.nextStart, 825);
  assert.equal(step1.nextEnd, 900);
  assert.equal(step1.hasLooped, false);

  // 2. Steg mot slutet av tidsspannet
  const nearEnd = advanceTimeWindow(1100, 75, 800, 1175, 25);
  assert.equal(nearEnd.nextStart, 1125);
  assert.equal(nearEnd.nextEnd, 1175);
  assert.equal(nearEnd.hasLooped, false);

  // 3. Steg som överskrider maxYear loopar tillbaka till minYear
  const loopStep = advanceTimeWindow(1125, 75, 800, 1175, 25);
  assert.equal(loopStep.nextStart, 800);
  assert.equal(loopStep.nextEnd, 875);
  assert.equal(loopStep.hasLooped, true);
});

test('E31 Tidsfilter - dateringsfiltrering med slutna intervall enligt Avsnitt 9.4', () => {
  // Rökstenen (Ög 136) är daterad ca 800–850 e.Kr.
  const rokstenen = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSignum === 'Ög 136');
  assert.ok(rokstenen);
  assert.equal(rokstenen.dating.earliestYear, 800);
  assert.equal(rokstenen.dating.latestYear, 850);

  // Tidig vikingatid (750–950): Ög 136 ska ingå
  const earlyRes = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {
    timeFilter: { startYear: 750, endYear: 950 },
  });
  assert.ok(earlyRes.items.some((i) => i.canonicalSignum === 'Ög 136'));

  // Sen vikingatid (1000–1100): Ög 136 ska INTE ingå
  const lateRes = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {
    timeFilter: { startYear: 1000, endYear: 1100 },
  });
  assert.ok(!lateRes.items.some((i) => i.canonicalSignum === 'Ög 136'));

  // Överlappande fönster [840, 890]: Ög 136 [800, 850] överlappar (800 <= 890 && 850 >= 840)
  const overlapRes = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {
    timeFilter: { startYear: 840, endYear: 890 },
  });
  assert.ok(overlapRes.items.some((i) => i.canonicalSignum === 'Ög 136'));

  // Ingen datering uppfinns som en enda fiktiv mittpunkt: breda inskrifter visas under hela sitt spann
  const broadInscriptions = RUNIC_PILOT_INSCRIPTIONS.filter(
    (i) => i.dating.latestYear - i.dating.earliestYear >= 50
  );
  assert.ok(broadInscriptions.length > 0);
  for (const item of broadInscriptions) {
    const isMatching = matchesDatingInterval(item, {
      startYear: item.dating.earliestYear,
      endYear: item.dating.earliestYear + 10,
    });
    assert.equal(isMatching, true, `Bred datering för ${item.canonicalSignum} ska träffa sitt startintervall`);
  }
});

test('E31 Tidsuppspelning - standardtillstånd startar inte automatiskt (isPlaying: false)', () => {
  assert.equal(DEFAULT_PLAYBACK_STATE.isPlaying, false, 'Automatisk uppspelning får aldrig vara påslagen vid sidladdning');
  assert.ok(DEFAULT_PLAYBACK_STATE.speedMs >= 1000, 'Hastigheten måste vara minst 1000 ms för att inte ge flimmer');
  assert.ok(DEFAULT_PLAYBACK_STATE.windowSizeYears > 0);
});
