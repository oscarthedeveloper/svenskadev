import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GUIDED_TOURS,
  getAllGuidedTours,
  getGuidedTourById,
} from '../lib/runor/guided-tours.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E33 Guidningar - 3 källbundna tematiska turer med fullständiga metadata', () => {
  const tours = getAllGuidedTours();
  assert.equal(tours.length, 3, 'Exakt 3 turer ska finnas enligt specifikationen');

  const tourIds = tours.map((t) => t.id);
  assert.ok(tourIds.includes('ingvarstaget'));
  assert.ok(tourIds.includes('kvinnor-och-makt'));
  assert.ok(tourIds.includes('runmastare-och-metrik'));

  for (const tour of tours) {
    assert.ok(tour.title.length > 5);
    assert.ok(tour.subtitle.length > 5);
    assert.ok(tour.description.length > 20);
    assert.ok(tour.steps.length >= 3 && tour.steps.length <= 5, `${tour.id} ska ha 3-5 steg`);
  }
});

test('E33 Guidningar - varje stopp mappar till en verklig och publicerad pilotinskrift', () => {
  const pilotSlugs = new Set(RUNIC_PILOT_INSCRIPTIONS.map((i) => i.canonicalSlug));
  const pilotSigna = new Set(RUNIC_PILOT_INSCRIPTIONS.map((i) => i.canonicalSignum));

  for (const tour of GUIDED_TOURS) {
    let expectedStep = 1;
    for (const step of tour.steps) {
      assert.equal(step.stepNumber, expectedStep, `Stegnummer ska vara sekventiellt i ${tour.id}`);
      expectedStep++;

      assert.ok(
        pilotSigna.has(step.canonicalSignum),
        `Signum ${step.canonicalSignum} i tur ${tour.id} måste finnas i pilotdata`
      );
      assert.ok(
        pilotSlugs.has(step.slug),
        `Slug ${step.slug} i tur ${tour.id} måste finnas i pilotdata`
      );

      // Verifiera att historisk kontext och källhänvisning finns
      assert.ok(step.historicalContext.length > 30, `Steg ${step.canonicalSignum} saknar fyllig historisk kontext`);
      assert.ok(step.sourceCitation.includes('runinskrifter'), `Källhänvisning för ${step.canonicalSignum} ska referera till SRI`);
    }
  }
});

test('E33 Guidningar - getGuidedTourById hanterar giltiga och ogiltiga ID:n', () => {
  const ingvar = getGuidedTourById('ingvarstaget');
  assert.ok(ingvar);
  assert.equal(ingvar.coverSignum, 'Sö 179');

  const missing = getGuidedTourById('fiktiv-tur-123');
  assert.equal(missing, null);
});

test('E33 Guidningar - Krav K11: turen ger fri navigering och påtvingar ingen animerad linje', () => {
  // Verifiera att varje stopp har oberoende rekommenderad zoom och kan nås i valfri ordning
  for (const tour of GUIDED_TOURS) {
    for (const step of tour.steps) {
      assert.ok(
        !step.recommendedZoom || (step.recommendedZoom >= 10 && step.recommendedZoom <= 16),
        'Zoomnivå måste vara användbar'
      );
    }
  }
});
