import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseRunicUrlState,
  serializeRunicUrlState,
  determineHistoryAction,
  DEFAULT_RUNIC_URL_STATE,
} from '../lib/runor/url-state.ts';

test('E25 URL-tillstånd - tomma parametrar ger default-tillstånd', () => {
  const emptyParams = new URLSearchParams('');
  const state = parseRunicUrlState(emptyParams);

  assert.deepEqual(state, DEFAULT_RUNIC_URL_STATE);
  assert.equal(serializeRunicUrlState(state), '');
});

test('E25 URL-tillstånd - parsar URLSearchParams korrekt för filtrering och lägen', () => {
  const params = new URLSearchParams({
    q: 'Gunnar',
    landskap: 'U',
    typ: 'runblock',
    status: 'bevarad_i_sin_helhet',
    lage: 'nuvarande',
    kartlage: 'known',
    vy: 'map',
    tid: '950-1050,ingen-okand',
    vald: 'u-73-hansta',
  });

  const state = parseRunicUrlState(params);

  assert.equal(state.searchQuery, 'Gunnar');
  assert.equal(state.province, 'U');
  assert.equal(state.carrierType, 'runblock');
  assert.equal(state.preservationStatus, 'bevarad_i_sin_helhet');
  assert.equal(state.placementMode, 'nuvarande_plats');
  assert.equal(state.coordMode, 'known');
  assert.equal(state.viewMode, 'map');
  assert.equal(state.timeFilterEnabled, true);
  assert.equal(state.startYear, 950);
  assert.equal(state.endYear, 1050);
  assert.equal(state.includeUnknownDating, false);
  assert.equal(state.selectedSlug, 'u-73-hansta');
});

test('E25 URL-tillstånd - tolererar alias och råa object-parametrar', () => {
  const rawRecord = {
    q: '  Torsten  ',
    province: 'Öl',
    carrier: 'gravhall',
    lage: 'nuvarande_plats',
    kartlage: 'missing',
    vy: 'table',
  };

  const state = parseRunicUrlState(rawRecord);

  assert.equal(state.searchQuery, 'Torsten');
  assert.equal(state.province, 'Öl');
  assert.equal(state.carrierType, 'gravhall');
  assert.equal(state.placementMode, 'nuvarande_plats');
  assert.equal(state.coordMode, 'missing');
  assert.equal(state.viewMode, 'table');
});

test('E25 URL-tillstånd - saniterar ogiltiga och korrupta parametrar till säkra standardvärden', () => {
  const invalidParams = new URLSearchParams({
    landskap: 'Atlantis',
    typ: 'rymdskepp',
    status: 'exploderad',
    kartlage: 'satellit',
    vy: '3d-virtual-reality',
    tid: 'ogiltigt-intervall',
  });

  const state = parseRunicUrlState(invalidParams);

  assert.equal(state.province, 'all');
  assert.equal(state.carrierType, 'all');
  assert.equal(state.preservationStatus, 'all');
  assert.equal(state.coordMode, 'all');
  assert.equal(state.viewMode, 'grid');
  assert.equal(state.timeFilterEnabled, false);
});

test('E25 URL-tillstånd - rundgång (roundtrip) serialisering och parsning', () => {
  const originalState = {
    searchQuery: 'bro',
    province: 'Sö',
    carrierType: 'runsten',
    preservationStatus: 'forlorad',
    placementMode: 'nuvarande_plats',
    coordMode: 'known',
    timeFilterEnabled: true,
    startYear: 1000,
    endYear: 1100,
    includeUnknownDating: true,
    viewMode: 'map',
    selectedSlug: 'so-106-kjulagret',
  };

  const serialized = serializeRunicUrlState(originalState);
  assert.ok(serialized.startsWith('?'));

  const parsedBack = parseRunicUrlState(new URLSearchParams(serialized.slice(1)));

  assert.deepEqual(parsedBack, originalState);
});

test('E25 URL-tillstånd - determineHistoryAction särskiljer sökning (replace) från filterbyten (push)', () => {
  const baseState = { ...DEFAULT_RUNIC_URL_STATE };

  // 1. Textinmatning i sökrutan -> replace
  const typingState = { ...baseState, searchQuery: 'halvdan' };
  assert.equal(determineHistoryAction(baseState, typingState), 'replace');

  // 2. Fortsatt skrivande -> replace
  const moreTypingState = { ...typingState, searchQuery: 'halvdan fader' };
  assert.equal(determineHistoryAction(typingState, moreTypingState), 'replace');

  // 3. Val av landskap -> push
  const provinceState = { ...typingState, province: 'U' };
  assert.equal(determineHistoryAction(typingState, provinceState), 'push');

  // 4. Val av vy (t.ex. karta) -> push
  const mapState = { ...typingState, viewMode: 'map' };
  assert.equal(determineHistoryAction(typingState, mapState), 'push');

  // 5. Val av inskrift (slug) -> push
  const selectState = { ...typingState, selectedSlug: 'u-11-hovgarden' };
  assert.equal(determineHistoryAction(typingState, selectState), 'push');
});
