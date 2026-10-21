import test from 'node:test';
import assert from 'node:assert/strict';

import { RUNIC_PILOT_INSCRIPTIONS } from '../lib/runor/pilot-data.ts';
import {
  RUNIC_SOURCE_LIBRARY,
  getSourceVolumeById,
  getInscriptionsForSourceVolume,
  RUNIC_LINGUISTIC_BRIDGES,
} from '../lib/runor/library.ts';

test('E28 Källbibliotek - samtliga 20 inskrifter mappar till registrerade SRI-volymer', () => {
  assert.ok(RUNIC_SOURCE_LIBRARY.length >= 5, 'Källbiblioteket ska innehålla minst de 5 volymerna');

  const registeredVolumeIds = new Set(RUNIC_SOURCE_LIBRARY.map((v) => v.id));

  for (const item of RUNIC_PILOT_INSCRIPTIONS) {
    assert.ok(
      registeredVolumeIds.has(item.source.sriVolumeId),
      `${item.canonicalSignum} har oregistrerat volym-id: ${item.source.sriVolumeId}`
    );

    const volume = getSourceVolumeById(item.source.sriVolumeId);
    assert.ok(volume, `Kunde inte slå upp volym för ${item.canonicalSignum}`);
    assert.ok(volume.authors.length > 0);
    assert.ok(volume.publicationYear > 1900);
    assert.ok(volume.title.length > 0);
    assert.ok(volume.externalFacsimileUrl?.startsWith('https://'));
  }
});

test('E28 Källbibliotek - getInscriptionsForSourceVolume grupperar inskrifter korrekt per volym', () => {
  // Ölands runinskrifter (band-01) har 8 inskrifter i piloten (Öl 1, Öl 2, Öl 9, Öl 15, Öl 16, Öl 22, Öl 28, Öl 37)
  const olandInscriptions = getInscriptionsForSourceVolume('band-01');
  assert.equal(olandInscriptions.length, 8);
  for (const item of olandInscriptions) {
    assert.equal(item.provinceCode, 'Öl');
  }

  // Västmanlands runinskrifter (band-13) har 1 inskrift i piloten (Vs 24)
  const vsInscriptions = getInscriptionsForSourceVolume('band-13');
  assert.equal(vsInscriptions.length, 1);
  assert.equal(vsInscriptions[0].canonicalSignum, 'Vs 24');
});

test('E28 Språkhistoriska korsreferenser - bryggor mappar till giltiga inskrifter och interna rutter', () => {
  const pilotSigna = new Set(RUNIC_PILOT_INSCRIPTIONS.map((i) => i.canonicalSignum));

  for (const bridge of RUNIC_LINGUISTIC_BRIDGES) {
    assert.ok(pilotSigna.has(bridge.signum), `Brygga för okänt signum: ${bridge.signum}`);
    assert.ok(bridge.targetHref.startsWith('/'), `Ogiltig intern sökväg: ${bridge.targetHref}`);
    assert.ok(bridge.topic.length > 5);
    assert.ok(bridge.description.length > 10);
  }
});
