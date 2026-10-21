import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PILOT_AUDIO_PROPOSALS,
  PILOT_3D_PROPOSALS,
  PILOT_COMPARISON_PROPOSALS,
  FUTURE_EXPANSION_BATCHES,
} from '../lib/runor/enrichment-pilot.ts';

test('E43 Fördjupningar: Ljud och uttal deklareras strikt som rekonstruktion (Krav K11)', () => {
  assert.ok(PILOT_AUDIO_PROPOSALS.length >= 2, 'Minst 2 ljudpiloter ska finnas');

  for (const audio of PILOT_AUDIO_PROPOSALS) {
    // Krav K11: Rekonstruktion måste uttryckligen deklareras
    assert.equal(audio.isReconstruction, true, `${audio.id} måste ha isReconstruction: true`);
    assert.ok(audio.reconstructionBasis.length > 15, `Saknar vetenskaplig rekonstruktionsgrund för ${audio.id}`);

    // WCAG SC 1.4.2 & SC 1.2.1: Inget autoplay och fullt texttranskript
    assert.equal(audio.autoplay, false, `Autoplay är förbjudet för ${audio.id}`);
    assert.ok(audio.textTranscriptSwedish.length > 10, `Saknar texttranskript för ${audio.id}`);
    assert.ok(audio.phoneticTranscriptionIpa.length > 5, `Saknar IPA-transkribering för ${audio.id}`);
    assert.ok(audio.audioDurationSeconds > 0 && audio.audioDurationSeconds <= 60, `Orimlig ljudlängd för ${audio.id}`);
  }
});

test('E43 Fördjupningar: 3D-modeller respekterar prestandabudget (<= 5 MB) och har 2D-reserv', () => {
  assert.ok(PILOT_3D_PROPOSALS.length >= 1, 'Minst ett 3D-förslag ska finnas');

  for (const model of PILOT_3D_PROPOSALS) {
    assert.ok(model.fileSizeMaxBytes <= 5000000, `${model.id} överskrider 5 MB budget`);
    assert.ok(model.fallback2dImageUrl.length > 5, `${model.id} saknar 2D-fallback`);
    assert.ok(model.photogrammetrySource.length > 5, `${model.id} saknar fotogrammetrikälla`);
  }
});

test('E43 Fördjupningar: Parstens- och släktsammanställningar har akademisk källgrund', () => {
  assert.ok(PILOT_COMPARISON_PROPOSALS.length >= 2, 'Minst 2 jämförelseförslag ska finnas');

  for (const comp of PILOT_COMPARISON_PROPOSALS) {
    assert.ok(comp.inscriptions.length >= 2, `${comp.id} måste omfatta minst två stenar`);
    assert.ok(comp.scholarlyReference.length > 10, `${comp.id} saknar källhänvisning`);
    assert.ok(comp.summary.length > 30, `${comp.id} saknar sammanfattning`);
  }
});

test('E43 Förvaltningsplan: Kommande landskapsbatcher (Batch 2–N) är planerade med SRI-volymer', () => {
  assert.ok(FUTURE_EXPANSION_BATCHES.length >= 4, 'Minst 4 framtida landskapsbatcher ska vara definierade');

  // Småland måste vara första prioritet enligt analysen i E41
  const firstBatch = FUTURE_EXPANSION_BATCHES.find((b) => b.priorityOrder === 1);
  assert.ok(firstBatch, 'Första expansionsbatch saknas');
  assert.equal(firstBatch.provinceCode, 'Sm', 'Batch 2 ska vara Småland');
  assert.equal(firstBatch.sriBandNumber, 4, 'Smålands runinskrifter är SRI Band 4');

  for (const batch of FUTURE_EXPANSION_BATCHES) {
    assert.ok(batch.batchId.startsWith('batch-'), `Ogiltigt batchId: ${batch.batchId}`);
    assert.ok(batch.estimatedInscriptions >= 50, `För låg uppskattning för ${batch.name}`);
    assert.ok(batch.sriBandNumber > 0, `Ogiltigt SRI-bandnummer för ${batch.name}`);
  }
});
