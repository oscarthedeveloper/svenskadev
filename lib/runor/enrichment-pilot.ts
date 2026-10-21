/**
 * Fördjupningsförslag, rekonstruktioner och förvaltningsunderlag (E43).
 * Implementerar pilotförsök för uttal, ljud, metrisk struktur och parstensjämförelser
 * i strikt enlighet med Krav K11:
 * - Rekonstruerat uttal eller utseende presenteras ALLTID som rekonstruktion.
 * - Inget ljud får spelas automatiskt (autoplay är ovillkorligen inaktiverat).
 * - Fullständigt texttranskript och tillgänglighetsreserv krävs för allt multimedialt innehåll.
 */

export interface RunicAudioProposal {
  id: string;
  signum: string;
  dialectOrLanguage: 'fornvästnordiska' | 'runsvenska' | 'fornöstnordiska';
  metricForm: 'dróttkvætt' | 'fornyrðislag' | 'runprosa';
  isReconstruction: true; // Alltid sant enligt Krav K11
  reconstructionBasis: string;
  phoneticTranscriptionIpa: string;
  textTranscriptSwedish: string;
  audioDurationSeconds: number;
  autoplay: false; // Strikt förbjudet enligt WCAG SC 1.4.2
  audioFileUrl: string;
  license: string;
}

export interface Runic3dProposal {
  id: string;
  signum: string;
  carrierType: string;
  modelFormat: 'gltf' | 'usdz';
  fileSizeMaxBytes: number; // Budget: max 5 MB
  isReconstruction: boolean;
  photogrammetrySource: string;
  fallback2dImageUrl: string;
}

export interface RunicComparisonProposal {
  id: string;
  title: string;
  inscriptions: string[]; // t.ex. ["U 160", "U 161"]
  relationship: 'parstenar' | 'samma_ristare' | 'samma_slaktmonument' | 'historisk_kontrast';
  summary: string;
  scholarlyReference: string;
}

/**
 * Granskade pilotförslag för fördjupningar (E43).
 */
export const PILOT_AUDIO_PROPOSALS: RunicAudioProposal[] = [
  {
    id: 'audio-ol-1-drottkvaett',
    signum: 'Öl 1',
    dialectOrLanguage: 'fornvästnordiska',
    metricForm: 'dróttkvætt',
    isReconstruction: true,
    reconstructionBasis: 'Fornvästnordisk skaldemetrik enligt Sven Söderberg (SRI Band 1) och Finnur Jónsson.',
    phoneticTranscriptionIpa: '[ˈfoːl.ɡɪnː ˈliɡːr̥ ˈhɪnːs ˈfʏlɡ.ðuː ˈflɛstr̥ ˈwɪsːi θɑt ˈmɛːstɑr dɛːðir]',
    textTranscriptSwedish: 'Folginn liggr hinns fylgðu, flestr vissi þat, mestar dæðir dolga Þrúðar draugr í þessu haugi...',
    audioDurationSeconds: 24,
    autoplay: false,
    audioFileUrl: '/audio/runor/ol-1-drottkvaett-pilot.mp3',
    license: 'CC-BY-SA 4.0 (fornsvenska.se rekonstruktion)',
  },
  {
    id: 'audio-vs-24-fornyrdislag',
    signum: 'Vs 24',
    dialectOrLanguage: 'runsvenska',
    metricForm: 'fornyrðislag',
    isReconstruction: true,
    reconstructionBasis: 'Mellansvensk runsvenska från 1000-talet enligt Sven B. F. Jansson (SRI Band 13).',
    phoneticTranscriptionIpa: '[kʊmɪr ˈɛi ˈtɪl ˈhɑs.myːrɑ ˈbœː.θɪ ˈbɛt.rɪ]',
    textTranscriptSwedish: 'Kumiʀ æi til Hasmyra boandi bætri, þan byi raðr...',
    audioDurationSeconds: 18,
    autoplay: false,
    audioFileUrl: '/audio/runor/vs-24-fornyrdislag-pilot.mp3',
    license: 'CC-BY-SA 4.0 (fornsvenska.se rekonstruktion)',
  },
];

export const PILOT_3D_PROPOSALS: Runic3dProposal[] = [
  {
    id: '3d-og-136-rok',
    signum: 'Ög 136',
    carrierType: 'runsten',
    modelFormat: 'gltf',
    fileSizeMaxBytes: 4800000, // 4,8 MB (< 5 MB budget)
    isReconstruction: false, // Laserskanning av verkligt bevarat monument
    photogrammetrySource: 'Riksantikvarieämbetet 3D-arkiv (CC-BY)',
    fallback2dImageUrl: '/images/runor/og-136.webp',
  },
];

export const PILOT_COMPARISON_PROPOSALS: RunicComparisonProposal[] = [
  {
    id: 'comp-risbyle-parstenar',
    title: 'Risbylestenarna: Två stenar, ett brobygge (U 160 & U 161)',
    inscriptions: ['U 160', 'U 161'],
    relationship: 'parstenar',
    summary: 'Ulf i Risbyle reste två samhörande runstenar vid sundet i Täby. U 160 är rest till minne av hans fader Ulf, medan U 161 är rest i minne av samma brobygge av hans bröder. Tillsammans utgör de ett av Upplands bäst dokumenterade parmonument.',
    scholarlyReference: 'Upplands runinskrifter, Band 6, s. 242–248',
  },
  {
    id: 'comp-ed-kyrkstigen-block',
    title: 'Ed vid Kyrkstigen: Två ristningar på samma flyttblock (U 112A & U 112B)',
    inscriptions: ['U 112A', 'U 112B'],
    relationship: 'samma_slaktmonument',
    summary: 'Ragnvald lät rista runor på båda sidorna av ett väldig flyttblock vid Kyrkstigen i Ed. Sida A hedrar hans moder Fastvi, medan sida B berättar om hans egen krigstjänst i väringagardet i Grekland.',
    scholarlyReference: 'Upplands runinskrifter, Band 6, s. 156–161',
  },
];

/**
 * Plan för kommande landskapsbatcher (Batch 2–N).
 */
export interface ExpansionBatchSpec {
  batchId: string;
  name: string;
  provinceCode: string;
  provinceName: string;
  sriBandNumber: number;
  sriTitle: string;
  estimatedInscriptions: number;
  priorityOrder: number;
}

export const FUTURE_EXPANSION_BATCHES: ExpansionBatchSpec[] = [
  {
    batchId: 'batch-02-smaland',
    name: 'Batch 2: Smålands runinskrifter',
    provinceCode: 'Sm',
    provinceName: 'Småland',
    sriBandNumber: 4,
    sriTitle: 'Smålands runinskrifter',
    estimatedInscriptions: 175,
    priorityOrder: 1,
  },
  {
    batchId: 'batch-03-gotland',
    name: 'Batch 3: Gotlands runinskrifter (del 1)',
    provinceCode: 'G',
    provinceName: 'Gotland',
    sriBandNumber: 11,
    sriTitle: 'Gotlands runinskrifter, band 1',
    estimatedInscriptions: 220,
    priorityOrder: 2,
  },
  {
    batchId: 'batch-04-vastergotland',
    name: 'Batch 4: Västergötlands runinskrifter',
    provinceCode: 'Vg',
    provinceName: 'Västergötland',
    sriBandNumber: 5,
    sriTitle: 'Västergötlands runinskrifter',
    estimatedInscriptions: 280,
    priorityOrder: 3,
  },
  {
    batchId: 'batch-05-sodermanland-expansion',
    name: 'Batch 5: Södermanlands runinskrifter (del 2)',
    provinceCode: 'Sö',
    provinceName: 'Södermanland',
    sriBandNumber: 3,
    sriTitle: 'Södermanlands runinskrifter',
    estimatedInscriptions: 320,
    priorityOrder: 4,
  },
];
