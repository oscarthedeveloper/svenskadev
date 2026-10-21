import type { RunicInscription } from './types.ts';

export interface RunicTimeFilter {
  startYear: number;
  endYear: number;
  includeUnknown?: boolean;
}

export interface RunicFilterCriteria {
  searchQuery?: string;
  province?: string; // 'all' eller provinskod 'Öl', 'U', etc.
  carrierType?: string; // 'all' eller 'runsten', 'fast_hall', etc.
  preservationStatus?: string; // 'all' eller 'bevarad_i_sin_helhet', etc.
  hasKnownCoordinates?: boolean | 'all';
  timeFilter?: RunicTimeFilter | null;
}

export type MatchReason =
  | 'signum'
  | 'namn'
  | 'alias'
  | 'ort'
  | 'tolkning'
  | 'translitterering'
  | 'ristare';

export interface RunicQueryResult {
  items: RunicInscription[];
  totalMatched: number;
  totalWithCoordinates: number;
  matchReasons: Map<string, MatchReason[]>;
  activeFilterCount: number;
  hasFilters: boolean;
}

/**
 * Normaliserar strängar för sökning (NFC, gemener, diakritik-tolerant).
 * Källans originaltext bevaras alltid intakt för visning och källkritik.
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .replace(/[þÞ]/g, 'th')
    .replace(/[ðÐ]/g, 'd')
    .replace(/[ǫǪ]/g, 'o')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[øØ]/g, 'o')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Strippa kombinerande accenter (t.ex. ú -> u, é -> e, ö -> o)
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\s\-_.:·+§]+/g, ' ') // Normalisera skiljetecken och runskiljetecken
    .trim();
}

/**
 * Enkel normalisering av signum (t.ex. "Öl 1" -> "ol 1", "U 112B" -> "u 112b").
 */
export function normalizeSignumKey(signum: string): string {
  if (!signum) return '';
  return signum
    .toLowerCase()
    .replace(/ö/g, 'o')
    .replace(/ä/g, 'a')
    .replace(/å/g, 'a')
    .replace(/[\s\-_]+/g, '')
    .trim();
}

/**
 * Kontrollerar om en inskrifts datering överlappar med sökfönstret [s, e].
 * Följer Avsnitt 9.4 (slutna intervall):
 * En inskrift med [a, b] matchar [s, e] omm a <= e och b >= s.
 */
export function matchesDatingInterval(
  inscription: RunicInscription,
  filter: RunicTimeFilter
): boolean {
  const { startYear, endYear, includeUnknown = false } = filter;
  const { earliestYear, latestYear, isUncertain } = inscription.dating;

  // Om inskriften saknar numerisk datering (okänd datering)
  if (
    earliestYear === null ||
    earliestYear === undefined ||
    latestYear === null ||
    latestYear === undefined
  ) {
    return Boolean(includeUnknown);
  }

  // Slutet intervall [a, b] mot [s, e]
  const a = earliestYear;
  const b = latestYear;
  const s = startYear;
  const e = endYear;

  const overlaps = a <= e && b >= s;
  return overlaps;
}

interface InscriptionSearchIndex {
  signumNorm: string;
  signumKey: string;
  nameNorm: string | null;
  aliasesNorm: string[];
  geoNorm: string[];
  transSwe: string;
  transEng: string;
  translit: string;
  normSwe: string;
  normOwn: string;
  carver: string;
}

const itemSearchIndexCache = new WeakMap<RunicInscription, InscriptionSearchIndex>();

function getOrCreateSearchIndex(item: RunicInscription): InscriptionSearchIndex {
  let cached = itemSearchIndexCache.get(item);
  if (!cached) {
    cached = {
      signumNorm: normalizeSearchString(item.canonicalSignum),
      signumKey: normalizeSignumKey(item.canonicalSignum),
      nameNorm: item.name ? normalizeSearchString(item.name) : null,
      aliasesNorm: item.aliases ? item.aliases.map(normalizeSearchString) : [],
      geoNorm: item.placements.map((p) =>
        normalizeSearchString(`${p.placeName || ''} ${p.parish} ${p.hundred || ''} ${p.province}`)
      ),
      transSwe: item.textLayer.translationSwedish ? normalizeSearchString(item.textLayer.translationSwedish) : '',
      transEng: item.textLayer.translationEnglish ? normalizeSearchString(item.textLayer.translationEnglish) : '',
      translit: item.textLayer.readingTransliteration ? normalizeSearchString(item.textLayer.readingTransliteration) : '',
      normSwe: item.textLayer.normalizationRunicSwedish ? normalizeSearchString(item.textLayer.normalizationRunicSwedish) : '',
      normOwn: item.textLayer.normalizationOldWestNorse ? normalizeSearchString(item.textLayer.normalizationOldWestNorse) : '',
      carver: item.textLayer.carverAttribution ? normalizeSearchString(item.textLayer.carverAttribution) : '',
    };
    itemSearchIndexCache.set(item, cached);
  }
  return cached;
}

/**
 * Exekverar sökning och filtrering mot ett runbestånd.
 * Garanterar identisk resultatsemantik för lista, karta och statistik.
 */
export function executeRunicQuery(
  inscriptions: RunicInscription[],
  criteria: RunicFilterCriteria
): RunicQueryResult {
  const query = criteria.searchQuery ? criteria.searchQuery.trim() : '';
  const normQuery = normalizeSearchString(query);
  const normSignumQuery = normalizeSignumKey(query);

  const filterProvince = criteria.province && criteria.province !== 'all' ? criteria.province : null;
  const filterCarrier = criteria.carrierType && criteria.carrierType !== 'all' ? criteria.carrierType : null;
  const filterPreservation = criteria.preservationStatus && criteria.preservationStatus !== 'all' ? criteria.preservationStatus : null;
  const filterCoords = criteria.hasKnownCoordinates !== undefined && criteria.hasKnownCoordinates !== 'all' ? criteria.hasKnownCoordinates : null;
  const timeFilter = criteria.timeFilter || null;

  let activeFilterCount = 0;
  if (query) activeFilterCount++;
  if (filterProvince) activeFilterCount++;
  if (filterCarrier) activeFilterCount++;
  if (filterPreservation) activeFilterCount++;
  if (filterCoords !== null) activeFilterCount++;
  if (timeFilter) activeFilterCount++;

  const hasFilters = activeFilterCount > 0;
  const matchReasons = new Map<string, MatchReason[]>();
  const matchedItems: RunicInscription[] = [];
  let totalWithCoordinates = 0;

  for (const item of inscriptions) {
    // 1. Landskapsfilter
    if (filterProvince && item.provinceCode !== filterProvince) {
      continue;
    }

    // 2. Föremålstyp
    if (filterCarrier && item.carrier.type !== filterCarrier) {
      continue;
    }

    // 3. Bevarandestatus
    if (filterPreservation && item.carrier.preservationStatus !== filterPreservation) {
      continue;
    }

    // 4. Koordinattillgänglighet
    const hasCoord = Boolean(item.placements[0]?.coordinatesWgs84);
    if (filterCoords !== null) {
      if (filterCoords === true && !hasCoord) continue;
      if (filterCoords === false && hasCoord) continue;
    }

    // 5. Tidsfilter (Avsnitt 9.4)
    if (timeFilter) {
      if (!matchesDatingInterval(item, timeFilter)) {
        continue;
      }
    }

    // 6. Fritextsökning med normaliserade nycklar
    if (query) {
      const reasons: MatchReason[] = [];
      const idx = getOrCreateSearchIndex(item);

      // A. Signum (inkl. suffix och diakritik-okänsligt)
      if (
        idx.signumNorm.includes(normQuery) ||
        idx.signumKey.includes(normSignumQuery) ||
        (item.suffix && idx.signumKey.startsWith(normSignumQuery))
      ) {
        reasons.push('signum');
      }

      // B. Namn
      if (idx.nameNorm && idx.nameNorm.includes(normQuery)) {
        reasons.push('namn');
      }

      // C. Alias och litteratursignum (Bautil, Liljegren etc.)
      for (const aliasNorm of idx.aliasesNorm) {
        if (aliasNorm.includes(normQuery)) {
          reasons.push('alias');
          break;
        }
      }

      // D. Geografi (ort, socken, härad, landskap)
      for (const geoNorm of idx.geoNorm) {
        if (geoNorm.includes(normQuery)) {
          reasons.push('ort');
          break;
        }
      }

      // E. Tolkning (svensk och engelsk översättning)
      if (idx.transSwe.includes(normQuery) || idx.transEng.includes(normQuery)) {
        reasons.push('tolkning');
      }

      // F. Translitterering och normalisering
      if (
        idx.translit.includes(normQuery) ||
        idx.normSwe.includes(normQuery) ||
        idx.normOwn.includes(normQuery)
      ) {
        reasons.push('translitterering');
      }

      // G. Ristare
      if (idx.carver && idx.carver.includes(normQuery)) {
        reasons.push('ristare');
      }

      // Om ingen träfforsak fanns matchar inte texten
      if (reasons.length === 0) {
        continue;
      }

      matchReasons.set(item.id, reasons);
    }

    matchedItems.push(item);
    if (hasCoord) {
      totalWithCoordinates++;
    }
  }

  return {
    items: matchedItems,
    totalMatched: matchedItems.length,
    totalWithCoordinates,
    matchReasons,
    activeFilterCount,
    hasFilters,
  };
}
