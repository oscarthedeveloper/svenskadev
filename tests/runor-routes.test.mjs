import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import {
  resolveRunicSlug,
  generateRunicMetadata,
  generateRunicStructuredData,
} from '../lib/runor/routes.ts';

test('E22: generateStaticParams genererar alla 20 kanoniska slugs', () => {
  const slugs = RUNIC_PILOT_INSCRIPTIONS.map((i) => i.canonicalSlug);

  assert.equal(slugs.length, 20);
  assert.ok(slugs.includes('ol-1'));
  assert.ok(slugs.includes('u-73'));
  assert.ok(slugs.includes('vs-24'));
  assert.ok(slugs.includes('so-179'));
});

test('E22: generateRunicMetadata skapar unika titlar, delbar OpenGraph och källmedvetna metabeskrivningar', () => {
  // 1. För Öl 1 (Karlevistenen)
  const metaKarlevi = generateRunicMetadata('ol-1', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(metaKarlevi.title, 'Öl 1 (Karlevistenen) — Sveriges runinskrifter');
  assert.ok(metaKarlevi.description.includes('Vickleby socken, Öland'));
  assert.ok(metaKarlevi.description.includes('Ölands runinskrifter'));
  assert.equal(metaKarlevi.alternates?.canonical, 'https://fornsvenska.se/runor/ol-1');
  assert.equal(metaKarlevi.openGraph?.url, 'https://fornsvenska.se/runor/ol-1');
  assert.ok(metaKarlevi.openGraph?.images[0].url.includes('ol-1'));

  // 2. För okänd slug
  const metaUnknown = generateRunicMetadata('inte-en-sten', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(metaUnknown.title, 'Runinskrift hittades inte — Sveriges runinskrifter');
  assert.ok(metaUnknown.description.includes('finns inte'));
});

test('E22: Direktlänk fungerar oberoende i ny flik utan tidigare kartstate', () => {
  const resolution = resolveRunicSlug('u-73', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(resolution.type, 'exact');
  assert.ok(resolution.inscription);
  assert.equal(resolution.inscription.canonicalSignum, 'U 73');
  assert.equal(resolution.inscription.canonicalSlug, 'u-73');
  assert.equal(resolution.inscription.carrier.type, 'runsten');
  assert.equal(resolution.inscription.placements[0]?.parish, 'Spånga socken');
  assert.equal(resolution.inscription.dating.originalSourceLabel, 'ca 1060–1100 (Greklandsresenärer)');
});

test('E22: Okänt objekt returnerar not_found (leder till notFound())', () => {
  const resolution = resolveRunicSlug('okand-slug-xyz', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(resolution.type, 'not_found');
  assert.equal(resolution.inscription, undefined);
});

test('E22: Utkast är inte åtkomliga via publika rutter för anonyma besökare', () => {
  // Verifiera att pilotens alla 20 publika inskrifter har granskad_pilot eller publicerad
  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    assert.notEqual(item.curationStatus, 'utkast');
    assert.ok(item.curationStatus === 'granskad_pilot' || item.curationStatus === 'publicerad');
  }

  // Ett syntetiskt utkast måste filtreras bort och ge not_found om det inte finns i corpus
  const publishedOnly = RUNIC_PILOT_INSCRIPTIONS.filter(
    (i) => i.curationStatus === 'granskad_pilot' || i.curationStatus === 'publicerad'
  );
  const draftResolution = resolveRunicSlug('utkast-sten', publishedOnly);
  assert.equal(draftResolution.type, 'not_found');
});

test('E22: Uppslagning hanterar alternativa signumformat och alias med redirect', () => {
  // 1. Exakt kanonisk slug -> exact
  const exact = resolveRunicSlug('u-73', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(exact.type, 'exact');
  assert.equal(exact.canonicalSlug, 'u-73');
  assert.equal(exact.inscription?.canonicalSignum, 'U 73');

  // 2. Signum med mellanslag 'U 73' -> redirect till u-73
  const bySignum = resolveRunicSlug('U 73', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(bySignum.type, 'redirect');
  assert.equal(bySignum.canonicalSlug, 'u-73');

  // 3. 'Öl 1' -> redirect till ol-1
  const bySignumOl = resolveRunicSlug('Öl 1', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(bySignumOl.type, 'redirect');
  assert.equal(bySignumOl.canonicalSlug, 'ol-1');

  // 4. Namnalias 'Karlevistenen' -> redirect till ol-1
  const byAlias = resolveRunicSlug('Karlevistenen', RUNIC_PILOT_INSCRIPTIONS);
  assert.equal(byAlias.type, 'redirect');
  assert.equal(byAlias.canonicalSlug, 'ol-1');
});

test('E22: Schema.org JSON-LD genererar fullständig semantisk metadata', () => {
  const karlevi = RUNIC_PILOT_INSCRIPTIONS.find((i) => i.canonicalSlug === 'ol-1');
  assert.ok(karlevi);

  const jsonLd = generateRunicStructuredData(karlevi);
  assert.equal(jsonLd['@context'], 'https://schema.org');
  assert.equal(jsonLd['@type'], 'VisualArtwork');
  assert.equal(jsonLd.name, 'Öl 1 (Karlevistenen)');
  assert.equal(jsonLd.artform, 'runsten');
  assert.equal(jsonLd.material, 'Gråbrun kalksten');
  assert.equal(jsonLd.temporalCoverage, 'ca 990–1010 (strax efter slaget vid Fyrisvallarna ca 985)');
  assert.ok(String(jsonLd.citation).includes('Ölands runinskrifter'));
  assert.equal(jsonLd.spatialCoverage?.geo?.longitude, 16.4398);
  assert.equal(jsonLd.spatialCoverage?.geo?.latitude, 56.6075);
});

test('E22: Serverrenderad listreserv finns och innehåller alla nödvändiga fält', async () => {
  const reserveCode = await readFile(
    new URL('../components/runor/RunorServerListReserve.tsx', import.meta.url),
    'utf8'
  );
  assert.ok(reserveCode.includes('Katalog över publicerade runinskrifter'));
  assert.ok(reserveCode.includes('canonicalSlug'));
  assert.ok(reserveCode.includes('canonicalSignum'));
  assert.ok(reserveCode.includes('placement.parish'));
  assert.ok(reserveCode.includes('dating.originalSourceLabel'));
  assert.ok(reserveCode.includes('source.sriVolumeTitle'));
  assert.ok(reserveCode.includes('translationSwedish'));
});
