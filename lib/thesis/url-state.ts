import type { GrammaticalTense, ParadigmId } from './types.ts';
import { THESIS_PILOT_EDITION } from './pilot-data.ts';

export type ThesisViewTab = 'karta-och-paradigm' | 'forandringsmodell' | 'kallkritik-och-ordlista';

export interface ThesisUrlState {
  regionId: string;
  subAreaId: string | null;
  paradigmId: ParadigmId;
  tense: GrammaticalTense;
  verbLemma: string;
  stepOrder: number;
  viewMode: 'interaktiv' | 'statisk-jamforelse';
  glossaryTermId: string | null;
}

const VALID_REGION_IDS = new Map(
  THESIS_PILOT_EDITION.regions.map((r) => [r.id, r])
);

const PARADIGM_TO_REGION_ID = new Map<ParadigmId, string>(
  THESIS_PILOT_EDITION.regions.map((r) => [r.paradigmId, r.id])
);

const VALID_SUBAREA_TO_REGION = new Map<string, string>();
for (const region of THESIS_PILOT_EDITION.regions) {
  for (const sub of region.subAreas) {
    VALID_SUBAREA_TO_REGION.set(sub.id, region.id);
  }
}

const VALID_VERBS = new Set(
  THESIS_PILOT_EDITION.referenceExampleTabla29.verbs.map((v) => v.lemma)
);

const VALID_GLOSSARY_IDS = new Set(
  THESIS_PILOT_EDITION.glossary.map((g) => g.id)
);

const MAX_STEP = THESIS_PILOT_EDITION.changeModelFigur6.steps.length;

export const DEFAULT_THESIS_URL_STATE: ThesisUrlState = {
  regionId: 'region-um-omradet',
  subAreaId: null,
  paradigmId: 'um-bojning',
  tense: 'presens',
  verbLemma: 'kasta',
  stepOrder: 1,
  viewMode: 'interaktiv',
  glossaryTermId: null,
};

function firstString(value: string | string[] | undefined | null): string | null {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim();
  return null;
}

/**
 * Tolkar URL-parametrar säkert och ignorerar okända eller ogiltiga värden (A02.4).
 */
export function parseThesisUrlState(
  rawParams: Record<string, string | string[] | undefined> | URLSearchParams
): ThesisUrlState {
  const getParam = (key: string): string | null => {
    if (rawParams instanceof URLSearchParams) {
      return rawParams.get(key)?.trim() ?? null;
    }
    return firstString(rawParams[key]);
  };

  let regionId = DEFAULT_THESIS_URL_STATE.regionId;
  let subAreaId: string | null = null;

  const rawRegion = getParam('omrade');
  const rawParadigm = getParam('paradigm') as ParadigmId | null;
  const rawSubArea = getParam('delomrade');

  if (rawRegion && VALID_REGION_IDS.has(rawRegion)) {
    regionId = rawRegion;
  } else if (rawParadigm && PARADIGM_TO_REGION_ID.has(rawParadigm)) {
    regionId = PARADIGM_TO_REGION_ID.get(rawParadigm)!;
  }

  if (rawSubArea && VALID_SUBAREA_TO_REGION.has(rawSubArea)) {
    const ownerRegionId = VALID_SUBAREA_TO_REGION.get(rawSubArea)!;
    // Om användaren angav ett giltigt delområde synkas huvudområdet till dess ägarregion
    regionId = ownerRegionId;
    subAreaId = rawSubArea;
  }

  const regionObj = VALID_REGION_IDS.get(regionId) ?? THESIS_PILOT_EDITION.regions[0];
  const paradigmId = regionObj.paradigmId;

  const rawTense = getParam('tempus');
  const tense: GrammaticalTense =
    rawTense === 'preteritum' || rawTense === 'presens'
      ? rawTense
      : DEFAULT_THESIS_URL_STATE.tense;

  const rawVerb = getParam('verb');
  const verbLemma =
    rawVerb && VALID_VERBS.has(rawVerb)
      ? rawVerb
      : DEFAULT_THESIS_URL_STATE.verbLemma;

  const rawStep = getParam('steg');
  const parsedStep = rawStep ? Number.parseInt(rawStep, 10) : NaN;
  const stepOrder =
    Number.isInteger(parsedStep) && parsedStep >= 1 && parsedStep <= MAX_STEP
      ? parsedStep
      : DEFAULT_THESIS_URL_STATE.stepOrder;

  const rawViewMode = getParam('vy');
  const viewMode: 'interaktiv' | 'statisk-jamforelse' =
    rawViewMode === 'statisk-jamforelse' ? 'statisk-jamforelse' : 'interaktiv';

  const rawGlossary = getParam('begrepp');
  const glossaryTermId =
    rawGlossary && VALID_GLOSSARY_IDS.has(rawGlossary) ? rawGlossary : null;

  return {
    regionId,
    subAreaId,
    paradigmId,
    tense,
    verbLemma,
    stepOrder,
    viewMode,
    glossaryTermId,
  };
}

/**
 * Bygger en kompakt och delbar frågesträng utan onödiga standardvärden (A02.4).
 */
export function serializeThesisUrlState(
  state: Partial<ThesisUrlState>,
  basePath = '/sprakliv/person-och-numerus'
): string {
  const merged: ThesisUrlState = {
    ...DEFAULT_THESIS_URL_STATE,
    ...state,
  };
  const params = new URLSearchParams();

  if (merged.regionId !== DEFAULT_THESIS_URL_STATE.regionId) {
    params.set('omrade', merged.regionId);
  }
  if (merged.subAreaId) {
    params.set('delomrade', merged.subAreaId);
  }
  if (merged.tense !== DEFAULT_THESIS_URL_STATE.tense) {
    params.set('tempus', merged.tense);
  }
  if (merged.verbLemma !== DEFAULT_THESIS_URL_STATE.verbLemma) {
    params.set('verb', merged.verbLemma);
  }
  if (merged.stepOrder !== DEFAULT_THESIS_URL_STATE.stepOrder) {
    params.set('steg', String(merged.stepOrder));
  }
  if (merged.viewMode !== DEFAULT_THESIS_URL_STATE.viewMode) {
    params.set('vy', merged.viewMode);
  }
  if (merged.glossaryTermId) {
    params.set('begrepp', merged.glossaryTermId);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
