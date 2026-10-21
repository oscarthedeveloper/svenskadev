import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';

test('E27 Tillgänglighet - ingen information förmedlas enbart med färg', () => {
  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    // Bevarandestatus ska ha textlabel som inte är tom
    assert.ok(item.carrier.preservationStatus, `${item.canonicalSignum} saknar preservationStatus`);
    const validStatuses = ['bevarad_i_sin_helhet', 'bevarad_i_fragment', 'forlorad'];
    assert.ok(
      validStatuses.includes(item.carrier.preservationStatus),
      `${item.canonicalSignum} har ogiltig preservationStatus`
    );

    // Varje bild ska ha tillgänglig alternativtext (caption eller beskrivning)
    for (const img of item.images) {
      assert.ok(img.caption && img.caption.trim().length > 5, `${item.canonicalSignum} har otillräcklig bildtext`);
      assert.ok(img.license, `${item.canonicalSignum} saknar licensangivelse`);
    }
  }
});

test('E27 Tillgänglighet - likvärdig icke-kart-väg (Fullständig paritet i tabell- och kortvy)', () => {
  // Samtliga 20 inskrifter har fullständiga data för att visas i tabell- och kortvy utan karta
  const gridInscriptions = RUNIC_PILOT_INSCRIPTIONS.filter((i) => i.curationStatus === 'granskad_pilot');
  assert.equal(gridInscriptions.length, 20);

  // Även inskrifter som saknar kända koordinater (Öl 15) kan till fullo läsas och nås
  const lostItem = gridInscriptions.find((i) => i.canonicalSignum === 'Öl 15');
  assert.ok(lostItem);
  assert.ok(lostItem.canonicalSlug);
  assert.ok(lostItem.textLayer.readingTransliteration);
  assert.ok(lostItem.textLayer.translationSwedish);
  assert.ok(lostItem.source.sriVolumeTitle);
});

test('E27 Tillgänglighet & CSS - fokusindikatorer, reducerad rörelse och pekmål finns i stilmallen', () => {
  const cssPath = path.resolve('app/globals.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // 1. Tydlig tangentbordsindikator (:focus-visible)
  assert.ok(cssContent.includes(':focus-visible'), 'CSS saknar :focus-visible-regler');
  assert.ok(cssContent.includes('outline: 2px solid'), 'CSS saknar tydlig 2px fokus-outline');

  // 2. Pekmål (minst 44px för pekskärmar)
  assert.ok(cssContent.includes('pointer: coarse'), 'CSS saknar pointer: coarse touch-anpassning');
  assert.ok(cssContent.includes('min-height: 44px'), 'CSS saknar 44px minimihöjd för pekmål');

  // 3. Reducerad rörelse (prefers-reduced-motion)
  assert.ok(cssContent.includes('prefers-reduced-motion: reduce'), 'CSS saknar prefers-reduced-motion: reduce');

  // 4. Mobila brytpunkter (360px och 480px)
  assert.ok(cssContent.includes('@media (max-width: 360px)'), 'CSS saknar 360px brytpunkt');
  assert.ok(cssContent.includes('@media (max-width: 480px)'), 'CSS saknar 480px brytpunkt');
});
