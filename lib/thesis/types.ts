export type ReviewStatus =
  | 'inventerad_ej_publiceringsklar'
  | 'primaravlasning'
  | 'dubbelkontrollerad_pilotklar'
  | 'publiceringsklar';

export type TimeRole =
  | 'historical_synthesis_period'
  | 'collection_window'
  | 'attestation_year'
  | 'birth_year'
  | 'recording_year'
  | 'hypothetical_period';

export type EvidenceStatus =
  | 'attested'
  | 'synthesized'
  | 'inferred_from_neighbor'
  | 'hypothetical_reconstruction'
  | 'unattested'
  | 'not_investigated'
  | 'ambiguous';

export type GrammaticalPerson = 1 | 2 | 3;
export type GrammaticalNumber = 'singular' | 'plural';
export type GrammaticalMood = 'indikativ' | 'imperativ';
export type GrammaticalTense = 'presens' | 'preteritum';

export type FormRepresentationType =
  | 'normalized_ending'
  | 'allomorph'
  | 'inflected_form'
  | 'reconstructed_form'
  | 'pedagogical_example';

export type ParadigmId =
  | 'um-bojning'
  | 'e-bojning'
  | 'skansk-bojning'
  | 'a-bojning';

export type DeviantParadigmId = '2a-bojning' | 'generaliserad-e-bojning';

export interface SourceDocument {
  id: string;
  author: string;
  year: number;
  title: string;
  subtitle: string;
  englishTitle: string;
  series: string;
  publisher: string;
  isbn: string;
  issn: string;
  urn: string;
  urnUrl: string;
  printedPagesTotal: number;
  pdfPagesTotal: number;
  pdfByteSize: number;
  pdfSha256: string;
  copyrightNotice: string;
}

export interface SourceLocation {
  sourceId: string;
  objectId: string;
  printedPage: number;
  pdfPage: number;
  printedPageEnd?: number;
  pdfPageEnd?: number;
  section?: string;
  footnotes?: number[];
  underlyingSources?: string[];
  quoteOrReading?: string;
}

export interface TimeSpecification {
  id: string;
  role: TimeRole;
  label: string;
  startYear: number | null;
  endYear: number | null;
  isApproximate: boolean;
  isUnknown: boolean;
  allowsInterpolation: false;
  warningAgainstMisinterpretation: string;
  source: SourceLocation;
}

export interface UncertaintyMarker {
  level: 'none' | 'moderate_synthesis' | 'high_inferred' | 'hypothetical';
  patternStyle: 'solid' | 'dashed_border' | 'hatched_inferred' | 'dotted_n_drop';
  whatSourceShows: string;
  howWeRepresentIt: string;
  whatIsUncertain: string;
  auditIssueIds?: string[];
}

export interface AllomorphVariant {
  form: string;
  condition: string;
  source: SourceLocation;
}

export interface ParadigmCell {
  id: string;
  paradigmId: ParadigmId;
  person: GrammaticalPerson;
  number: 'plural';
  mood: 'indikativ';
  rawCellText: string;
  formType: FormRepresentationType;
  splitsTenseBySlash: boolean;
  presentEnding: string;
  pastEnding: string;
  nDropVariantInNorth: string | null;
  allomorphs: AllomorphVariant[];
  hiatusRule: string;
  syncretismGroup:
    | 'unique-1pl-um'
    | 'person-2pl-or-12pl-en'
    | 'person-3pl-or-general-pl-a-e';
  etymologyNote: string;
  source: SourceLocation;
  reviewStatus: ReviewStatus;
}

export interface InflectedVerbExample {
  person: GrammaticalPerson;
  number: GrammaticalNumber;
  pronoun: string;
  presentForm: string;
  pastForm: string;
  translationPresent: string;
  translationPast: string;
  verbLemma: string;
  formType: FormRepresentationType;
  comment: string;
  source: SourceLocation;
}

export interface ParadigmDefinition {
  id: ParadigmId;
  name: string;
  shortLabel: string;
  regionName: string;
  agreementType: 'personkongruens' | 'numeruskongruens';
  distinctPersonsInPlural: 1 | 2 | 3;
  syncretismPattern: string;
  syncretismDescription: string;
  thesisMapColorName: string;
  webDisplayColorHex: string;
  patternMarkerLabel: string;
  summary: string;
  historicalDevelopmentNote: string;
  cells: [ParadigmCell, ParadigmCell, ParadigmCell];
  exampleForms: InflectedVerbExample[];
  source: SourceLocation;
  reviewStatus: ReviewStatus;
}

export interface RegionSubArea {
  id: string;
  name: string;
  provincesOrHundreds: string[];
  evidenceStatus: EvidenceStatus;
  nDropRealization: '-e' | '-en' | 'mixed_-e_-en' | 'not_applicable';
  description: string;
  uncertainty: UncertaintyMarker;
  source: SourceLocation;
}

export interface DocumentedRegionalException {
  id: string;
  location: string;
  phenomenon: string;
  deviantParadigmType?: DeviantParadigmId | ParadigmId | 'enhetsbojning';
  explanation: string;
  evidenceStatus: EvidenceStatus;
  source: SourceLocation;
}

export interface ThesisRegion {
  id: string;
  name: string;
  paradigmId: ParadigmId;
  geographicSummary: string;
  provincesCovered: string[];
  geometrySourceType: 'schematic_synthesis_after_karta_10';
  precisionLevel: 'approximate_synthesis';
  hasNorthernNDropSubzone: boolean;
  nDropNote: string;
  timeSpecification: TimeSpecification;
  uncertainty: UncertaintyMarker;
  subAreas: RegionSubArea[];
  documentedExceptions: DocumentedRegionalException[];
  source: SourceLocation;
  reviewStatus: ReviewStatus;
}

export interface ChangeModelStep {
  id: string;
  stepOrder: number;
  fromParadigmId: ParadigmId | null;
  toParadigmId: ParadigmId;
  branch:
    | 'utgangslage'
    | 'nordlig_gren'
    | 'sydlig_gren'
    | 'gemensam_numerusbojning';
  title: string;
  changedPerson: GrammaticalPerson | '1_och_2' | null;
  sourcePersonForAnalogy: GrammaticalPerson | null;
  presentEndingsSnapshot: {
    p1: string;
    p2: string;
    p3: string;
  };
  pastEndingsSnapshot: {
    p1: string;
    p2: string;
    p3: string;
  };
  explanation: string;
  evidenceStatus: EvidenceStatus;
  uncertaintyNote: string;
  source: SourceLocation;
}

export interface ReferenceVerbParadigmTabla29 {
  category: 'kopula' | 'hjalpverb' | 'starka' | 'svaga';
  lemma: string;
  gloss: string;
  presensIndikativ: {
    '1s': string;
    '2s': string;
    '3s': string;
    '1p': string;
    '2p': string;
    '3p': string;
  };
  preteritumIndikativ: {
    '1s': string;
    '2s': string;
    '3s': string;
    '1p': string;
    '2p': string;
    '3p': string;
  };
  imperativ: {
    '2s': string;
    '2p': string;
  };
}

export interface GlossaryTerm {
  id: string;
  term: string;
  shortDefinition: string;
  thesisSpecificNuance: string;
  contrastTermIds: string[];
  example: string;
  source: SourceLocation;
  reviewStatus: ReviewStatus;
}

export interface ThesisAuditEntry {
  id: string;
  summary: string;
  handlingRule: string;
  sourcePages: number[];
  status: 'verifierad_regel' | 'oppen_ej_tyst_korrigerad' | 'kraver_radkontroll_i_etapp_6';
}

export interface ThesisPilotEdition {
  editionId: string;
  version: string;
  createdAt: string;
  status: 'draft' | 'verified_pilot' | 'published';
  sourceDocument: SourceDocument;
  timeSpecifications: Record<string, TimeSpecification>;
  paradigms: ParadigmDefinition[];
  regions: ThesisRegion[];
  changeModelFigur6: {
    id: string;
    title: string;
    isModelNotIndividualFilmNote: string;
    source: SourceLocation;
    reviewStatus: ReviewStatus;
    steps: ChangeModelStep[];
  };
  referenceExampleTabla29: {
    id: string;
    title: string;
    varietyDescription: string;
    normalizationNote: string;
    source: SourceLocation;
    reviewStatus: ReviewStatus;
    verbs: ReferenceVerbParadigmTabla29[];
  };
  glossary: GlossaryTerm[];
  auditLog: ThesisAuditEntry[];
}

// ============================================================================
// Etapp 5: Nordisk & svensk atlas, regionala fördjupningar, imperativ & typologi
// ============================================================================

export type NordicTimeSliceId = 'ca_1850' | 'ca_1900';

export type Tabla26CellCode = '+' | '(+)' | '2PL' | '3PL' | 'SG';

export interface Tabla26Row {
  id: string;
  languageOrProvinceGroup: string;
  areaLabel: string;
  isStandardLanguage: boolean;
  presInd: {
    p1: Tabla26CellCode;
    p2: Tabla26CellCode;
    p3: Tabla26CellCode;
  };
  pretInd: {
    p1: Tabla26CellCode;
    p2: Tabla26CellCode;
    p3: Tabla26CellCode;
  };
  imp2PL: Tabla26CellCode;
  hasTwoOrMorePersonFormsInIndicative: boolean;
  notes: string;
  source: SourceLocation;
}

export type Karta7CoverageCategory =
  | 'indikativ_och_imperativ_1900'
  | 'endast_imperativ_1900'
  | 'indikativ_1850_imperativ_1900'
  | 'indikativ_och_imperativ_endast_1850'
  | 'endast_imperativ_endast_1850'
  | 'ingen_pluralbojning';

export interface Karta7RegionEntry {
  id: string;
  name: string;
  countryOrRealm: 'Island' | 'Färöarna' | 'Norge' | 'Danmark' | 'Sverige' | 'Finland' | 'Estland';
  category: Karta7CoverageCategory;
  activeIn1850: 'indikativ_och_imperativ' | 'endast_imperativ' | 'ingen';
  activeIn1900: 'indikativ_och_imperativ' | 'endast_imperativ' | 'ingen';
  hasWaveHatchingPersonForms: boolean;
  svgCoords: { cx: number; cy: number; rx: number; ry: number };
  summary: string;
  sourceCoverageCaveat: string;
  source: SourceLocation;
}

export interface DalmalParishEntry {
  code: string;
  name: string;
  subgroup: 'ovansiljanmal' | 'nedansiljanmal' | 'vasterdalmal';
  hasIndicativePlural: boolean;
  hasImperativePlural: boolean;
  proDrop12PL: 'vanlig_rak_ordfoljd' | 'valfri_rak_ordfoljd' | 'ingen';
  endingOmissionInverted: '1_och_2_person' | 'endast_2_person' | 'ingen';
  note: string;
  source: SourceLocation;
}

export interface BergslagsmalParishEntry {
  name: string;
  ending: '-a' | '-an' | '-an (variant -a)';
  zone: 'nordlig_-a' | 'sydlig_-an';
  source: SourceLocation;
}

export interface EstlandssvenskaAreaEntry {
  id: string;
  name: string;
  indicativeStatus1940s:
    | 'presens_och_preteritum'
    | 'endast_presens'
    | 'ingen_indikativ_plural'
    | 'utdod_1800_tal';
  status1800s: string;
  imperativeEnding: string;
  shownOnKarta6: boolean;
  omissionReasonIfNotOnKarta6?: string;
  source: SourceLocation;
}

export interface ImperativeZoneSouthwest {
  id: string;
  label: string;
  ending: '-e(n)' | '-a' | '-er' | '-e(n) / -a' | '-e(n) / -er';
  geographicScope: string;
  etymologyExplanation: string;
  colorHex: string;
  patternLabel: string;
  source: SourceLocation;
}

export type DismantlingStepCell = '1' | '2' | '3' | '= 2' | '= 3' | '= SG' | '?';

export interface DismantlingTypeEntry {
  id: 'typ-1' | 'typ-2' | 'typ-3' | 'typ-4';
  label: string;
  regionsAttested: string[];
  steps: {
    step1: { p1: DismantlingStepCell; p2: DismantlingStepCell; p3: DismantlingStepCell };
    step2: { p1: DismantlingStepCell; p2: DismantlingStepCell; p3: DismantlingStepCell };
    step3: { p1: DismantlingStepCell; p2: DismantlingStepCell; p3: DismantlingStepCell };
    step4: { p1: DismantlingStepCell; p2: DismantlingStepCell; p3: DismantlingStepCell };
  };
  featuresPerStep: {
    step1: { p1: string; p2: string; p3: string };
    step2: { p1: string; p2: string; p3: string };
    step3: { p1: string; p2: string; p3: string };
    step4: { p1: string; p2: string; p3: string };
  };
  hasUnattestedSteps: boolean;
  unattestedExplanation?: string;
  explanation: string;
  source: SourceLocation;
}

export interface NordicAtlasData {
  karta7AndTabla26: {
    title: string;
    discreteTimeSlices: {
      id: NordicTimeSliceId;
      label: string;
      timeSpec: TimeSpecification;
      description: string;
    }[];
    borderHistoricalNote: string;
    unevenSourceCoverageWarning: string;
    imperativePersistenceRule: string;
    karta7Regions: Karta7RegionEntry[];
    tabla26Rows: Tabla26Row[];
    sourceKarta7: SourceLocation;
    sourceTabla26: SourceLocation;
  };
  regionalDeepDives: {
    dalmal: {
      title: string;
      summary: string;
      karta3Parishes: DalmalParishEntry[];
      tabla23Alvdalska: {
        title: string;
        source: SourceLocation;
        weakPreteriteSyncretismNote: string;
        verbs: ReferenceVerbParadigmTabla29[];
      };
      karta5Bergslagsmal: {
        title: string;
        summary: string;
        parishes: BergslagsmalParishEntry[];
        source: SourceLocation;
      };
      sourceKarta3: SourceLocation;
      sourceKarta4: SourceLocation;
    };
    overkalixmal: {
      title: string;
      summary: string;
      toneAccentAndApocopeNote: string;
      supineStemImperativeNote: string;
      pitemalInfinitiveSyncretismNote: string;
      tabla24Overkalix: {
        title: string;
        source: SourceLocation;
        verbs: ReferenceVerbParadigmTabla29[];
      };
    };
    estlandssvenska: {
      title: string;
      summary: string;
      areas: EstlandssvenskaAreaEntry[];
      tabla25Nuckomal: {
        title: string;
        source: SourceLocation;
        verbs: ReferenceVerbParadigmTabla29[];
      };
      sourceKarta6: SourceLocation;
    };
  };
  pluralImperativeSouthwest: {
    title: string;
    summary: string;
    soundChangeArgumentInToAnToA: string;
    karta15Zones: ImperativeZoneSouthwest[];
    karta16QuestionnaireBias: {
      title: string;
      elicitationPhrases: string[];
      whyFalseNegativesOccur: string;
      spontaneousCounterExample: {
        parish: string;
        hundred: string;
        phrase: string;
        ending: string;
        explanation: string;
      };
      source: SourceLocation;
    };
    sourceKarta15: SourceLocation;
  };
  hypotheticalReconstructionKarta14: {
    id: string;
    title: string;
    evidenceStatus: 'hypothetical_reconstruction';
    timeSpec: TimeSpecification;
    uncertainty: UncertaintyMarker;
    methodologicalWarningBanner: string;
    innovationCenters: {
      id: string;
      name: string;
      directionOfInfluence: string;
      impactStrength: 'mycket_stark' | 'stark' | 'mattlig';
      description: string;
    }[];
    regionalTrajectories: {
      id: string;
      area: string;
      trajectory: string;
      note: string;
    }[];
    source: SourceLocation;
  };
  dismantlingTypes: {
    title: string;
    summary: string;
    threeKeyObservations: string[];
    types: DismantlingTypeEntry[];
    sourceTabla42: SourceLocation;
    sourceFigur10: SourceLocation;
    sourceTabla43: SourceLocation;
  };
}

// ============================================================================
// Etapp 6: Fallstudierna i Mark & Kind respektive Östra Göinge (Kapitel 6)
// ============================================================================

export type NumberCodingUsage = 'plural' | 'båda' | 'singular' | '–';

export interface PersonUsageCell {
  usage: NumberCodingUsage;
  underFiveTokens: boolean; // Kursiv stil i Tablå 32 och Tablå 36 (< 5 belägg)
}

export interface PronounUsageCell {
  allTokens: NumberCodingUsage;
  minFiveTokens: NumberCodingUsage; // Värde vid >= 5 belägg (inom parentes i Tablå 34 & 38 om avvikande)
  rawDisplay: string;
}

export interface MarkKindInformant {
  id: string;
  birthYear: number;
  recordedYear: number;
  hundred: 'Mark' | 'Kind' | 'Veden' | 'Faurås';
  parish: string;
  parishCode: string;
  cohort: 'Generation 1' | 'Generation 2' | 'Generation 3';
  tabla32Usage: {
    p1: PersonUsageCell;
    p2: PersonUsageCell;
    p3: PersonUsageCell;
  };
  tabla34Pronouns: {
    da: PronounUsageCell;
    di: PronounUsageCell;
    dum: PronounUsageCell;
  };
}

export interface OstraGoingeInformant {
  id: string;
  birthYear: number;
  isBirthYearApproximate: boolean; // Asterisk (*) i Tablå 35, 36, 38
  recordedYear: number | null;
  isRecordingYearUnknown: boolean; // Frågetecken (?) i Tablå 35
  recordedYearRaw: string;
  parish: string;
  parishCode: string;
  interviewer: string;
  transcriber: string;
  cohort: 'Generation 2' | 'Generation 3' | 'Generation 4';
  tabla36Usage: {
    p1: PersonUsageCell;
    p2: PersonUsageCell;
    p3: PersonUsageCell;
  };
  tabla38Pronouns: {
    da_ost: PronounUsageCell; // 'då'
    di: PronounUsageCell;
    dam: PronounUsageCell; // 'dåm'
  };
}

export interface CohortPreferenceRow {
  cohort: 'Generation 1' | 'Generation 2' | 'Generation 3' | 'Generation 4';
  informantCount: number;
  birthYearRange: string;
  spanYears: number;
  preferenceOrder: string;
  unit: 'grammatiska_personer';
  unitExplanation: string;
}

export interface PronounCorrelationSummaryRow {
  pronoun: string;
  varietyLevel: 'lokal_traditionell' | 'regional_modern' | 'malardalsk_standardnara';
  pluralCount: number;
  bothCount: number;
  singularCount: number;
  totalInformants: number;
}

export interface SpeakerCaseProfile {
  informantId: string;
  title: string;
  birthYear: number;
  recordedYear: number;
  ageAtRecording: string;
  parishAndHundred: string;
  cohort: string;
  localParadigm: string;
  summary: string;
  morphosyntacticTendencies: string[];
  examples: {
    numberInThesis: string;
    dialectText: string;
    standardTranslation: string;
    grammaticalFocus: string;
    source: SourceLocation;
  }[];
  source: SourceLocation;
}

export interface CaseStudiesData {
  horizontalAndVerticalModel: {
    title: string;
    prestigeHierarchyFigur8: {
      level: number;
      label: string;
      examplesInStudyArea: string;
      prestigeDescription: string;
    }[];
    processComparisonFigur9: {
      dimension: string;
      horizontalProcess: string;
      verticalProcess: string;
    }[];
    modernizationAndCarsKarta17And18: {
      summary: string;
      urbanizationStatsNote95: string;
      source: SourceLocation;
    };
    sourceFigur8: SourceLocation;
    sourceFigur9: SourceLocation;
  };
  excerptionPrinciples: {
    title: string;
    leadPrinciple: string;
    excludedCategories: {
      id: string;
      category: string;
      reason: string;
      examples: string;
      contrastExample?: {
        nonRelevant: string;
        nonRelevantGloss: string;
        relevant: string;
        relevantGloss: string;
      };
      source: SourceLocation;
    }[];
    umAreaException: {
      explanation: string;
      examplesFromAAH: { dialect: string; translation: string }[];
      source: SourceLocation;
    };
    ostraGoingeSpecificPrinciples: {
      id: string;
      principle: string;
      explanation: string;
      examples: string;
      source: SourceLocation;
    }[];
  };
  markAndKind: {
    title: string;
    overview: {
      interviewsCount: number;
      informantsTotal: number;
      menCount: number;
      womenCount: number;
      grownUpInMark: number;
      grownUpInKind: number;
      grownUpInNeighboringHundreds: { count: number; details: string };
      birthYearRange: string;
      medianBirthYear: number;
      recordingYears: number[];
      interviewer: string;
      totalAudioHoursApprox: number;
      transcribedByBengtssonCount: number;
      untranscribedCount: number;
      transcriptionCorrectionExamples: {
        originalTranscript: string;
        correctedReading: string;
        meaning: string;
        explanation: string;
      }[];
      source: SourceLocation;
    };
    parishesTabla31: {
      code: string;
      name: string;
      hundred: 'Mark' | 'Kind' | 'Veden' | 'Faurås';
    }[];
    diachronicMapShiftKarta19To23: {
      summary: string;
      period1880To1940: string;
      period1948To1980: string;
      shrinkingUmParishes: string[];
      source: SourceLocation;
    };
    informants: MarkKindInformant[];
    cohortsTabla33: CohortPreferenceRow[];
    pronounSummaryAllTokensTabell1: {
      title: string;
      unit: 'antal_informanter';
      rows: PronounCorrelationSummaryRow[];
      source: SourceLocation;
    };
    pronounSummaryMinFiveTabell2: {
      title: string;
      unit: 'antal_informanter';
      rows: PronounCorrelationSummaryRow[];
      footnote112Note: string;
      source: SourceLocation;
    };
    pronounByCohortTabell3: {
      cohort: string;
      n: number;
      daAllAndMin5: string;
      diAllAndMin5: string;
      dumAllAndMin5: string;
    }[];
    speakerProfiles: SpeakerCaseProfile[];
    sourceTabla30: SourceLocation;
    sourceTabla32: SourceLocation;
    sourceTabla33: SourceLocation;
    sourceTabla34: SourceLocation;
  };
  ostraGoinge: {
    title: string;
    auditNoticeK01: {
      issueId: 'K01';
      title: string;
      page212Quote: string;
      page217AndTablesFact: string;
      editorialHandlingNote: string;
      source: SourceLocation;
    };
    overview: {
      interviewsCount: number;
      informantsInTablesCount: number;
      informantsNamedInProsePage212: number;
      menCountPage212: number;
      womenCountPage212: number;
      informantsUsingPluralAtLeastOnce: number;
      informantsExclusivelyPlural: number;
      birthYearRange: string;
      medianBirthYear: number;
      recordingYearRange: string;
      interviewers: { name: string; count: number }[];
      transcribers: { name: string; count: number }[];
      totalAudioHoursListenedApprox: number;
      source: SourceLocation;
    };
    parishesKarta26: {
      code: string;
      name: string;
      lech1925Paradigm: string;
      horn2015Findings: string;
      caseStudy1PLFindingsKarta27: string;
    }[];
    informants: OstraGoingeInformant[];
    cohortsTabla37: CohortPreferenceRow[];
    pronounSummaryAllTokensTabell4: {
      title: string;
      unit: 'antal_informanter';
      rows: PronounCorrelationSummaryRow[];
      source: SourceLocation;
    };
    pronounSummaryMinFiveTabell5: {
      title: string;
      unit: 'antal_informanter';
      rows: PronounCorrelationSummaryRow[];
      source: SourceLocation;
    };
    intraparadigmaticChangeModelTabla41: {
      title: string;
      explanation: string;
      steps: {
        step: string;
        subtitle: string;
        presens1PL: string;
        presens3PL: string;
        preteritum1PL: string;
        preteritum3PL: string;
      }[];
      source: SourceLocation;
    };
    speakerProfiles: SpeakerCaseProfile[];
    sourceTabla35: SourceLocation;
    sourceTabla36: SourceLocation;
    sourceTabla37: SourceLocation;
    sourceTabla38: SourceLocation;
  };
  synthesis: {
    title: string;
    combinedCohortsTabla39: {
      cohort: 'Generation 1' | 'Generation 2' | 'Generation 3' | 'Generation 4';
      birthYears: string;
      preferenceMarkAndKind: string;
      preferenceOstraGoinge: string;
    }[];
    unitReminder: string;
    oneGenerationLagConclusion: string;
    intensiveLanguageShiftWindow: string;
    pronounContactTabla40: {
      title: string;
      explanationWhy1PLShiftsFirst: string;
      rows: {
        variety: string;
        p1: string;
        p2: string;
        p3: string;
        p1SharesPronounWithModern: boolean;
        p2SharesPronounWithModern: boolean;
        p3SharesPronounWithModern: boolean;
      }[];
      source: SourceLocation;
    };
    sourceTabla39: SourceLocation;
  };
}

