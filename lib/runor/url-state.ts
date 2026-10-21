import type { PlacementViewMode } from './geojson.ts';

export type RunicViewMode = 'grid' | 'table' | 'map';

export interface RunicUrlState {
  searchQuery: string;
  province: string;
  carrierType: string;
  preservationStatus: string;
  placementMode: PlacementViewMode;
  coordMode: 'all' | 'known' | 'missing';
  timeFilterEnabled: boolean;
  startYear: number;
  endYear: number;
  includeUnknownDating: boolean;
  viewMode: RunicViewMode;
  selectedSlug: string | null;
}

export const VALID_PROVINCES = new Set(['all', 'Öl', 'U', 'Sö', 'Vs', 'Ög']);
export const VALID_CARRIER_TYPES = new Set(['all', 'runsten', 'runblock', 'fast_hall', 'gravhall', 'fragment']);
export const VALID_PRESERVATIONS = new Set(['all', 'bevarad_i_sin_helhet', 'bevarad_i_fragment', 'forlorad']);
export const VALID_VIEW_MODES = new Set<RunicViewMode>(['grid', 'table', 'map']);

export const DEFAULT_RUNIC_URL_STATE: RunicUrlState = {
  searchQuery: '',
  province: 'all',
  carrierType: 'all',
  preservationStatus: 'all',
  placementMode: 'fyndplats',
  coordMode: 'all',
  timeFilterEnabled: false,
  startYear: 900,
  endYear: 1150,
  includeUnknownDating: true,
  viewMode: 'grid',
  selectedSlug: null,
};

function firstString(value: string | string[] | undefined | null): string | null {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0].trim();
  return null;
}

/**
 * Tolkar och saniterar URL-parametrar för Runsidan (E25).
 * Säkerställer att okända eller korrupta parametrar ignoreras och att tillståndet förblir stabilt.
 */
export function parseRunicUrlState(
  rawParams: Record<string, string | string[] | undefined> | URLSearchParams
): RunicUrlState {
  const getParam = (key: string): string | null => {
    if (rawParams instanceof URLSearchParams) {
      return rawParams.get(key)?.trim() ?? null;
    }
    return firstString(rawParams[key]);
  };

  // 1. Fritext
  const searchQuery = getParam('q') ?? '';

  // 2. Landskap
  const rawProv = getParam('landskap') ?? getParam('province');
  const province = rawProv && VALID_PROVINCES.has(rawProv) ? rawProv : 'all';

  // 3. Bärartyp
  const rawCarrier = getParam('typ') ?? getParam('carrier');
  const carrierType = rawCarrier && VALID_CARRIER_TYPES.has(rawCarrier) ? rawCarrier : 'all';

  // 4. Bevarandestatus
  const rawPres = getParam('status');
  const preservationStatus = rawPres && VALID_PRESERVATIONS.has(rawPres) ? rawPres : 'all';

  // 5. Platsläge (fyndplats vs nuvarande placering)
  const rawLage = getParam('lage');
  const placementMode: PlacementViewMode =
    rawLage === 'nuvarande' || rawLage === 'nuvarande_plats' ? 'nuvarande_plats' : 'fyndplats';

  // 6. Kartlägestyp
  const rawCoords = getParam('kartlage');
  const coordMode: 'all' | 'known' | 'missing' =
    rawCoords === 'known' || rawCoords === 'missing' ? rawCoords : 'all';

  // 7. Vyval
  const rawVy = getParam('vy');
  const viewMode: RunicViewMode =
    rawVy && VALID_VIEW_MODES.has(rawVy as RunicViewMode) ? (rawVy as RunicViewMode) : 'grid';

  // 8. Tidsintervall (format: tid=950-1050 eller tid=950-1050,okand)
  let timeFilterEnabled = false;
  let startYear = DEFAULT_RUNIC_URL_STATE.startYear;
  let endYear = DEFAULT_RUNIC_URL_STATE.endYear;
  let includeUnknownDating = DEFAULT_RUNIC_URL_STATE.includeUnknownDating;

  const rawTid = getParam('tid');
  if (rawTid) {
    const parts = rawTid.split(',');
    const yearsPart = parts[0] || '';
    const match = yearsPart.match(/^(\d{3,4})-(\d{3,4})$/);
    if (match) {
      const s = parseInt(match[1], 10);
      const e = parseInt(match[2], 10);
      if (s >= 500 && e <= 1500 && s <= e) {
        startYear = s;
        endYear = e;
        timeFilterEnabled = true;
      }
    }
    if (parts.includes('okand')) {
      includeUnknownDating = true;
    } else if (parts.includes('ingen-okand')) {
      includeUnknownDating = false;
    }
  }

  // 9. Vald inskrift slug
  const selectedSlug = getParam('vald') || null;

  return {
    searchQuery,
    province,
    carrierType,
    preservationStatus,
    placementMode,
    coordMode,
    timeFilterEnabled,
    startYear,
    endYear,
    includeUnknownDating,
    viewMode,
    selectedSlug,
  };
}

/**
 * Serialiserar körande tillstånd till en minimal, kanonisk URL-query-sträng.
 * Standardvärden utelämnas för att hålla länkarna korta och delbara.
 */
export function serializeRunicUrlState(state: RunicUrlState): string {
  const p = new URLSearchParams();

  if (state.searchQuery.trim()) {
    p.set('q', state.searchQuery.trim());
  }

  if (state.province !== 'all') {
    p.set('landskap', state.province);
  }

  if (state.carrierType !== 'all') {
    p.set('typ', state.carrierType);
  }

  if (state.preservationStatus !== 'all') {
    p.set('status', state.preservationStatus);
  }

  if (state.placementMode !== 'fyndplats') {
    p.set('lage', 'nuvarande');
  }

  if (state.coordMode !== 'all') {
    p.set('kartlage', state.coordMode);
  }

  if (state.timeFilterEnabled) {
    const tidStr = `${state.startYear}-${state.endYear}${state.includeUnknownDating ? ',okand' : ',ingen-okand'}`;
    p.set('tid', tidStr);
  }

  if (state.viewMode !== 'grid') {
    p.set('vy', state.viewMode);
  }

  if (state.selectedSlug) {
    p.set('vald', state.selectedSlug);
  }

  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Avgör om en tillståndsuppdatering ska använda pushState eller replaceState.
 * Textinmatning under pågående skrivande ska använda 'replace' för att inte förgifta back-historiken.
 * Diskreta filterval (landskap, vy, nollställning) använder 'push'.
 */
export function determineHistoryAction(
  prevState: RunicUrlState,
  nextState: RunicUrlState
): 'push' | 'replace' {
  // Om enbart fritext söksträng ändrats
  const onlySearchChanged =
    prevState.searchQuery !== nextState.searchQuery &&
    prevState.province === nextState.province &&
    prevState.carrierType === nextState.carrierType &&
    prevState.preservationStatus === nextState.preservationStatus &&
    prevState.placementMode === nextState.placementMode &&
    prevState.coordMode === nextState.coordMode &&
    prevState.timeFilterEnabled === nextState.timeFilterEnabled &&
    prevState.viewMode === nextState.viewMode &&
    prevState.selectedSlug === nextState.selectedSlug;

  if (onlySearchChanged) {
    return 'replace';
  }

  return 'push';
}
