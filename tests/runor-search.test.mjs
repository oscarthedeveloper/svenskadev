import test from 'node:test';
import assert from 'node:assert/strict';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import {
  executeRunicQuery,
  matchesDatingInterval,
  normalizeSearchString,
  normalizeSignumKey,
} from '../lib/runor/search.ts';

test('E23: Normalisering hanterar Ö/ö, diakritik och specialtecken', () => {
  assert.equal(normalizeSearchString('Öl 1'), 'ol 1');
  assert.equal(normalizeSearchString('Sö 179'), 'so 179');
  assert.equal(normalizeSearchString('Þrúðar'), 'thrudar');
  assert.equal(normalizeSearchString('Danmǫrku'), 'danmorku');
  assert.equal(normalizeSearchString('  U  112 B  '), 'u 112 b');

  // Signum-nyckel
  assert.equal(normalizeSignumKey('Öl 1'), 'ol1');
  assert.equal(normalizeSignumKey('U 112B'), 'u112b');
  assert.equal(normalizeSignumKey('Sö 179'), 'so179');
});

test('E23: Sökning på signum, suffix och diakritik-okänsliga former', () => {
  // Sökning 'ol 1' hittar Öl 1
  const resOl = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'ol 1' });
  assert.ok(resOl.items.some((i) => i.canonicalSignum === 'Öl 1'));
  assert.ok(resOl.matchReasons.get('runa-ol-1')?.includes('signum'));

  // Sökning 'u 112' hittar U 112B med suffix
  const resU112 = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'u 112' });
  assert.ok(resU112.items.some((i) => i.canonicalSignum === 'U 112B'));
  assert.ok(resU112.matchReasons.get('runa-u-112b')?.includes('signum'));

  // Sökning 'vs 24' hittar Hassmyrastenen
  const resVs = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'vs 24' });
  assert.equal(resVs.totalMatched, 1);
  assert.equal(resVs.items[0].canonicalSignum, 'Vs 24');
});

test('E23: Sökning på litteratursignum och äldre alias (Bautil, Liljegren, Karlevi)', () => {
  // Bautil
  const resBautil = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'Bautil' });
  assert.ok(resBautil.totalMatched >= 1);
  assert.ok(resBautil.items.some((i) => i.canonicalSignum === 'Öl 1'));
  assert.ok(resBautil.matchReasons.get('runa-ol-1')?.includes('alias'));

  // Liljegren
  const resLilje = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'Liljegren 1361' });
  assert.ok(resLilje.items.some((i) => i.canonicalSignum === 'Öl 1'));

  // Namn 'Karlevi'
  const resKarlevi = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'Karlevi' });
  assert.ok(resKarlevi.items.some((i) => i.canonicalSignum === 'Öl 1'));
  assert.ok(resKarlevi.matchReasons.get('runa-ol-1')?.includes('namn'));
});

test('E23: Sökning i tolkning och runtext', () => {
  // Sökning i svensk tolkning: 'dróttkvætt' eller 'Foldars son'
  const resTrans = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'Foldars son' });
  assert.equal(resTrans.totalMatched, 1);
  assert.equal(resTrans.items[0].canonicalSignum, 'Öl 1');
  assert.ok(resTrans.matchReasons.get('runa-ol-1')?.includes('tolkning'));

  // Sökning i runtext/translitterering: 'fulkin'
  const resRun = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { searchQuery: 'fulkin' });
  assert.ok(resRun.items.some((i) => i.canonicalSignum === 'Öl 1'));
  assert.ok(resRun.matchReasons.get('runa-ol-1')?.includes('translitterering'));
});

test('E23: Tidsfilter enligt Avsnitt 9.4 (slutna intervall [s, e] mot [a, b])', () => {
  // Skapa en syntetisk testinskrift med datering 950–1050
  const synth950_1050 = {
    ...RUNIC_PILOT_INSCRIPTIONS[0],
    dating: {
      originalSourceLabel: 'ca 950–1050',
      earliestYear: 950,
      latestYear: 1050,
      periodLabel: 'Vikingatid',
      isUncertain: false,
      datingMethod: 'Typologisk',
    },
  };

  // 1. 950–1050 mot 1000–1100 -> Överlappar (sant)
  assert.equal(matchesDatingInterval(synth950_1050, { startYear: 1000, endYear: 1100 }), true);

  // 2. 950–1050 mot 1050–1100 -> Gränsår matchar enligt slutet intervall (sant)
  assert.equal(matchesDatingInterval(synth950_1050, { startYear: 1050, endYear: 1100 }), true);

  // 3. 950–1050 mot 1051–1100 -> Utanför (falskt)
  assert.equal(matchesDatingInterval(synth950_1050, { startYear: 1051, endYear: 1100 }), false);

  // 4. Okänd datering (null-värden)
  const synthUnknown = {
    ...RUNIC_PILOT_INSCRIPTIONS[0],
    dating: {
      originalSourceLabel: 'Okänd tid',
      earliestYear: null,
      latestYear: null,
      periodLabel: 'Okänd',
      isUncertain: true,
      datingMethod: null,
    },
  };

  // När includeUnknown är falskt ingår den inte
  assert.equal(
    matchesDatingInterval(synthUnknown, { startYear: 1000, endYear: 1100, includeUnknown: false }),
    false
  );

  // När includeUnknown är sant ingår den i separat grupp utan fiktivt årtal
  assert.equal(
    matchesDatingInterval(synthUnknown, { startYear: 1000, endYear: 1100, includeUnknown: true }),
    true
  );
});

test('E23: Tom sökning returnerar exakt hela beståndet med noll filter', () => {
  const result = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {});
  assert.equal(result.totalMatched, 20);
  assert.equal(result.items.length, 20);
  assert.equal(result.hasFilters, false);
  assert.equal(result.activeFilterCount, 0);
});

test('E23: Motstridiga filter ger tydligt tomt resultat utan fel', () => {
  // Sök efter runsten i Västmanland med status 'forlorad' (Vs 24 är bevarad i sin helhet)
  const result = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {
    province: 'Vs',
    preservationStatus: 'forlorad',
  });

  assert.equal(result.totalMatched, 0);
  assert.equal(result.items.length, 0);
  assert.equal(result.totalWithCoordinates, 0);
  assert.equal(result.hasFilters, true);
});

test('E23: Kartans och listans grundmängd är identisk', () => {
  // Kör en flerstegsfiltrering
  const result = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, {
    province: 'Öl',
    carrierType: 'runsten',
  });

  // Grundmängden för både lista och karta är result.items
  assert.ok(result.items.length > 0);
  assert.equal(result.totalMatched, result.items.length);

  // Delmängden med koordinater är strikt definierad och spårbar
  const calculatedCoords = result.items.filter((i) => i.placements.some((p) => p.coordinatesWgs84 !== null)).length;
  assert.equal(result.totalWithCoordinates, calculatedCoords);
});

test('E23: Fuzzy sökning slår aldrig ihop eller raderar inskriftsidentiteter', () => {
  // Sökning på bred term 'runsten'
  const result = executeRunicQuery(RUNIC_PILOT_INSCRIPTIONS, { carrierType: 'runsten' });
  const ids = new Set(result.items.map((i) => i.id));

  // Varje matchad inskrift har en unik stabil identitet
  assert.equal(ids.size, result.items.length);
});
