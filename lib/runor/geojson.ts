import type { RunicInscription, RunicPlacement } from './types.ts';

export type PlacementViewMode = 'fyndplats' | 'nuvarande_plats';

export interface RunicGeoJsonFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lon, lat] enligt RFC 7946
  };
  properties: {
    id: string;
    signum: string;
    name: string | null;
    slug: string;
    provinceCode: string;
    carrierType: string;
    preservationStatus: string;
    isLost: boolean;
    placementMode: PlacementViewMode;
    placeName: string | null;
    parish: string;
    hundred: string | null;
    province: string;
    precision: RunicPlacement['precision'];
    sourceNote?: string | null;
    datingLabel: string;
    translationSnippet: string;
    hasImage: boolean;
  };
}

export interface RunicGeoJsonCollection {
  type: 'FeatureCollection';
  version: '1.0.0';
  generatedAt: string;
  placementMode: PlacementViewMode;
  totalFeatures: number;
  totalMissingCoordinates: number;
  features: RunicGeoJsonFeature[];
}

/**
 * Väljer den mest relevanta platsen för en inskrift baserat på visningsläge.
 * - 'fyndplats': Prioriterar 'fyndplats' (eller faller tillbaka till första tillgängliga plats).
 * - 'nuvarande_plats': Prioriterar 'nuvarande_placering' (eller faller tillbaka till fyndplats om den inte flyttats).
 */
export function selectPlacementForMode(
  inscription: RunicInscription,
  mode: PlacementViewMode
): RunicPlacement | null {
  if (!inscription.placements || inscription.placements.length === 0) {
    return null;
  }

  if (mode === 'nuvarande_plats') {
    const current = inscription.placements.find((p) => p.type === 'nuvarande_placering');
    if (current && current.coordinatesWgs84) return current;
    // Fallback till fyndplats om stenen aldrig flyttats
    const findPlace = inscription.placements.find((p) => p.type === 'fyndplats');
    if (findPlace && findPlace.coordinatesWgs84) return findPlace;
    return inscription.placements[0];
  }

  // mode === 'fyndplats'
  const findPlace = inscription.placements.find((p) => p.type === 'fyndplats');
  if (findPlace && findPlace.coordinatesWgs84) return findPlace;
  return inscription.placements[0];
}

/**
 * Konverterar ett bestånd av runinskrifter till en strikt RFC 7946 GeoJSON FeatureCollection.
 * Undviker dubblettpunkter genom att välja exakt en primär punkt per inskrift för valt läge.
 */
export function inscriptionsToGeoJson(
  inscriptions: RunicInscription[],
  mode: PlacementViewMode = 'fyndplats'
): RunicGeoJsonCollection {
  const features: RunicGeoJsonFeature[] = [];
  let totalMissing = 0;

  for (const item of inscriptions) {
    const p = selectPlacementForMode(item, mode);
    if (!p || !p.coordinatesWgs84) {
      totalMissing++;
      continue;
    }

    const [lon, lat] = p.coordinatesWgs84;
    const isLost = item.carrier.preservationStatus === 'forlorad';
    const textSnippet = item.textLayer.translationSwedish || item.textLayer.readingTransliteration;

    features.push({
      type: 'Feature',
      id: item.id,
      geometry: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      properties: {
        id: item.id,
        signum: item.canonicalSignum,
        name: item.name ?? null,
        slug: item.canonicalSlug,
        provinceCode: item.provinceCode,
        carrierType: item.carrier.type,
        preservationStatus: item.carrier.preservationStatus,
        isLost,
        placementMode: mode,
        placeName: p.placeName ?? null,
        parish: p.parish,
        hundred: p.hundred ?? null,
        province: p.province,
        precision: p.precision,
        sourceNote: p.sourceNote ?? null,
        datingLabel: item.dating.originalSourceLabel,
        translationSnippet: textSnippet ? textSnippet.slice(0, 100).trim() + '…' : '',
        hasImage: Boolean(item.images && item.images.length > 0 && !item.images[0].imageUrl.includes('ej-avbildad')),
      },
    });
  }

  return {
    type: 'FeatureCollection',
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    placementMode: mode,
    totalFeatures: features.length,
    totalMissingCoordinates: totalMissing,
    features,
  };
}

/**
 * Grupperar närliggande eller sammanfallande GeoJSON-punkter för klustervisning.
 * Om två eller fler punkter delar exakt samma koordinater sammanförs de i ett kluster
 * så att användaren kan inspektera varje enskild inskrift utan överlappning.
 */
export interface ClusteredPointGroup {
  coordinates: [number, number];
  features: RunicGeoJsonFeature[];
  isSingle: boolean;
  hasUncertain: boolean;
}

export function groupPointsByCoordinate(
  features: RunicGeoJsonFeature[]
): ClusteredPointGroup[] {
  const map = new Map<string, RunicGeoJsonFeature[]>();

  for (const f of features) {
    const key = `${f.geometry.coordinates[0].toFixed(5)},${f.geometry.coordinates[1].toFixed(5)}`;
    const group = map.get(key) || [];
    group.push(f);
    map.set(key, group);
  }

  const clusters: ClusteredPointGroup[] = [];
  for (const [_, group] of map.entries()) {
    clusters.push({
      coordinates: group[0].geometry.coordinates,
      features: group,
      isSingle: group.length === 1,
      hasUncertain: group.some((f) => f.properties.precision === 'sockencentrum'),
    });
  }

  return clusters;
}
