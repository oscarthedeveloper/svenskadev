/**
 * Cache- och versionsstyrning för runmaterialet (E36).
 * Säkerställer att sammanfattningar och detaljvyer pekar på kompatibla datasetversioner
 * samt definierar standardiserade Cache-Control- och ETag-huvuden.
 */

export const CURRENT_RUNIC_DATASET_VERSION = '2026.1-pilot';
export const BATCH1_RUNIC_DATASET_VERSION = '2026.2-batch1';

export const SUPPORTED_RUNIC_DATASET_VERSIONS = [
  CURRENT_RUNIC_DATASET_VERSION,
  BATCH1_RUNIC_DATASET_VERSION,
] as const;

export type SupportedRunicDatasetVersion =
  (typeof SUPPORTED_RUNIC_DATASET_VERSIONS)[number];

export function isValidDatasetVersion(
  version: string | null | undefined
): version is SupportedRunicDatasetVersion {
  if (!version) return false;
  return (SUPPORTED_RUNIC_DATASET_VERSIONS as readonly string[]).includes(version);
}

/**
 * Validerar om klientens cachade datasetversion är kompatibel med serverns aktiva version.
 */
export function isDatasetVersionCompatible(
  clientVersion: string | null | undefined,
  serverVersion: string = CURRENT_RUNIC_DATASET_VERSION
): boolean {
  if (!clientVersion) return false;
  return clientVersion.trim() === serverVersion.trim();
}

/**
 * Genererar enhetsstandardiserade HTTP-cache-huvuden för run-API och GeoJSON.
 */
export function getRunicCacheHeaders(
  datasetVersion: string = CURRENT_RUNIC_DATASET_VERSION,
  options?: {
    sMaxAge?: number;
    staleWhileRevalidate?: number;
    customETag?: string;
  }
): Record<string, string> {
  const sMaxAge = options?.sMaxAge ?? 3600; // 1 timme på CDN
  const swr = options?.staleWhileRevalidate ?? 86400; // 24 timmar bakgrundsuppdatering
  const etag = options?.customETag ?? `W/"runor-${datasetVersion}"`;

  return {
    'Cache-Control': `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
    'X-Dataset-Version': datasetVersion,
    ETag: etag,
    Vary: 'Accept-Encoding, X-Dataset-Version',
  };
}
