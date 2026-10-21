import type { RunicInscription } from './types.ts';
import { validateRunicInscription } from './validation.ts';
import { RUNIC_PILOT_INSCRIPTIONS } from './pilot-data.ts';

export interface RunicPublishedInscription {
  version: '1.0.0';
  id: string;
  canonicalSignum: string;
  provinceCode: string;
  itemNumber: number;
  suffix: string | null;
  name: string | null;
  canonicalSlug: string;
  aliases: string[];
  carrier: RunicInscription['carrier'];
  placements: RunicInscription['placements'];
  dating: RunicInscription['dating'];
  textLayer: RunicInscription['textLayer'];
  source: RunicInscription['source'];
  images: RunicInscription['images'];
  editorialNotes: string | null;
  status: 'publicerad';
  publishedAt: string;
}

export interface RunicApiResponseV1 {
  version: '1.0.0';
  apiEndpoint: '/api/runor/v1';
  license: string;
  attribution: string;
  generatedAt: string;
  totalPublished: number;
  inscriptions: RunicPublishedInscription[];
}

export interface RunicSingleResponseV1 {
  version: '1.0.0';
  apiEndpoint: string;
  license: string;
  attribution: string;
  generatedAt: string;
  inscription: RunicPublishedInscription;
}

/**
 * Strikt publiceringsfilter: Omvandlar en intern inskrift till en publicerad post.
 * Avvisar utkast, arkiverade poster och poster som misslyckas i källvalideringen.
 */
export function toPublicPublishedItem(item: RunicInscription): RunicPublishedInscription | null {
  // Säkerhetsspärr (Krav K10 / E36): Syntetiska test- och prestandaposter får ALDRIG läcka till publik data
  if (item.isSynthetic) {
    return null;
  }

  // 1. Endast 'granskad_pilot' eller 'publicerad' godkänns
  if (item.curationStatus !== 'granskad_pilot' && item.curationStatus !== 'publicerad') {
    return null;
  }

  // 2. Validera integritet mot källreglerna (E06)
  const validation = validateRunicInscription(item);
  if (!validation.valid) {
    return null;
  }

  // 3. Exponera endast godkända publika fält, dölj interna granskningsanteckningar
  return {
    version: '1.0.0',
    id: item.id,
    canonicalSignum: item.canonicalSignum,
    provinceCode: item.provinceCode,
    itemNumber: item.itemNumber,
    suffix: item.suffix ?? null,
    name: item.name ?? null,
    canonicalSlug: item.canonicalSlug,
    aliases: item.aliases || [],
    carrier: { ...item.carrier },
    placements: item.placements.map((p) => ({ ...p })),
    dating: { ...item.dating },
    textLayer: { ...item.textLayer },
    source: { ...item.source },
    images: item.images.map((img) => ({ ...img })),
    editorialNotes: item.editorialNotes ?? null,
    status: 'publicerad',
    publishedAt: item.reviewedAt || new Date().toISOString(),
  };
}

/**
 * Skapar ett fullständigt, versionsmärkt API-svar för hela det publicerade beståndet.
 */
export function getPublishedRunicCorpus(
  items: RunicInscription[] = RUNIC_PILOT_INSCRIPTIONS,
  filters?: {
    province?: string;
    carrierType?: string;
    search?: string;
  }
): RunicApiResponseV1 {
  let publicItems: RunicPublishedInscription[] = [];

  for (const item of items) {
    const pub = toPublicPublishedItem(item);
    if (pub) {
      publicItems.push(pub);
    }
  }

  if (filters) {
    if (filters.province && filters.province !== 'all') {
      publicItems = publicItems.filter((i) => i.provinceCode === filters.province);
    }
    if (filters.carrierType && filters.carrierType !== 'all') {
      publicItems = publicItems.filter((i) => i.carrier.type === filters.carrierType);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      publicItems = publicItems.filter(
        (i) =>
          i.canonicalSignum.toLowerCase().includes(q) ||
          (i.name && i.name.toLowerCase().includes(q)) ||
          i.aliases.some((a) => a.toLowerCase().includes(q)) ||
          (i.textLayer.translationSwedish && i.textLayer.translationSwedish.toLowerCase().includes(q)) ||
          i.placements.some((p) => p.parish.toLowerCase().includes(q) || p.province.toLowerCase().includes(q))
      );
    }
  }

  return {
    version: '1.0.0',
    apiEndpoint: '/api/runor/v1',
    license: 'Samnordisk runtextdatabas (ODbL 1.0) / Sveriges runinskrifter (Public Domain)',
    attribution:
      'Källutgåva: Sveriges runinskrifter (Kungl. Vitterhetsakademien / Riksantikvarieämbetet). Metadata och koordinater: Samnordisk runtextdatabas (Uppsala universitet).',
    generatedAt: new Date().toISOString(),
    totalPublished: publicItems.length,
    inscriptions: publicItems,
  };
}

/**
 * Hämtar en enskild publicerad inskrift via slug eller signum.
 */
export function getPublishedRunicInscription(
  slugOrSignum: string,
  items: RunicInscription[] = RUNIC_PILOT_INSCRIPTIONS
): RunicPublishedInscription | null {
  const norm = slugOrSignum.toLowerCase().trim();
  const found = items.find(
    (i) =>
      i.canonicalSlug.toLowerCase() === norm ||
      i.canonicalSignum.toLowerCase() === norm ||
      i.id.toLowerCase() === norm
  );

  if (!found) return null;
  return toPublicPublishedItem(found);
}
