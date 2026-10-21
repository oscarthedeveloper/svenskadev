/**
 * Förvaltning av källuppdateringar, rättelser och versionsbyten för Runsidan (E42).
 * Säkerställer att källor kan uppdateras utan att tidigare evidens raderas,
 * att bilder kan dras tillbaka utan källförlust, och att ändrade sluggar omdirigeras.
 */

import type { RunicInscription, RunicImage } from './types.ts';

export interface RunicCorrectionRecord {
  id: string; // t.ex. "CORR-2026-001"
  slug: string;
  signum: string;
  fieldPath: string; // t.ex. "dating.originalSourceLabel", "images", "textLayer.alternativeReadings"
  previousValue: unknown;
  newValue: unknown;
  sourceRationale: string;
  academicReference: string; // t.ex. "Fornvännen 2012, s. 145"
  reviewedBy: string;
  reviewedAt: string;
  appliedInDatasetVersion: string;
}

export interface MaintenanceSchedule {
  cadence: 'kvartalsvis' | 'halvarsvis';
  lastRunDate: string;
  nextScheduledDate: string;
  sourcesToPoll: Array<{
    name: string;
    uri: string;
    checkType: 'faksimil_tillganglighet' | 'rundata_differens' | 'licensgranskning';
  }>;
}

export const OFFICIAL_MAINTENANCE_SCHEDULE: MaintenanceSchedule = {
  cadence: 'kvartalsvis',
  lastRunDate: '2026-10-22',
  nextScheduledDate: '2027-01-15',
  sourcesToPoll: [
    {
      name: 'Riksantikvarieämbetet (RAÄ) Runor API',
      uri: 'https://app.raa.se/open/runor/',
      checkType: 'rundata_differens',
    },
    {
      name: 'Kungl. Vitterhetsakademiens SRI Digitalisering',
      uri: 'https://fornsvenska.se/underlag/runor/sri/',
      checkType: 'faksimil_tillganglighet',
    },
    {
      name: 'Samnordisk runtextdatabas (Uppsala universitet)',
      uri: 'https://www.nordiska.uu.se/forskn/samnord.htm',
      checkType: 'rundata_differens',
    },
  ],
};

/**
 * Registrerade källrättelser och uppdateringar i version 2026.1-patch1 / E42.
 */
export const RUNIC_EDITORIAL_CHANGELOG: RunicCorrectionRecord[] = [
  {
    id: 'CORR-2026-001',
    slug: 'ol-1',
    signum: 'Öl 1',
    fieldPath: 'dating.originalSourceLabel',
    previousValue: 'ca 990–1010',
    newValue: 'ca 990–1010 (strax efter slaget vid Fyrisvallarna ca 985)',
    sourceRationale: 'Tydliggör historisk händelsekoppling till slaget vid Fyrisvallarna enligt skaldemetrisk analys.',
    academicReference: 'Ölands runinskrifter s. 15; Fornvännen 2012 s. 142–156',
    reviewedBy: 'Källansvarig redaktör & Docent i runologi',
    reviewedAt: '2026-10-22T08:30:00Z',
    appliedInDatasetVersion: '2026.1-patch1',
  },
  {
    id: 'CORR-2026-002',
    slug: 'u-112b',
    signum: 'U 112B',
    fieldPath: 'editorialNotes',
    previousValue: 'Ragnvald lät rista runorna i Grekland.',
    newValue: 'Ragnvald var befälhavare i väringagardet i Bysans (Grekland) enligt Elias Wesséns tolkning i SRI Band 6.',
    sourceRationale: 'Skilj redaktionell förklaring om väringagardet från själva runtextens tolkning.',
    academicReference: 'Upplands runinskrifter, Band 6, s. 158',
    reviewedBy: 'Källansvarig redaktör',
    reviewedAt: '2026-10-22T09:15:00Z',
    appliedInDatasetVersion: '2026.1-patch1',
  },
  {
    id: 'CORR-2026-003',
    slug: 'ol-26',
    signum: 'Öl 26',
    fieldPath: 'images.0.caption',
    previousValue: 'Runbleck från Runsten',
    newValue: 'Runstens kyrka (Öl 26), runbleck av koppar från medeltiden, teckning efter SRI Band 1',
    sourceRationale: 'Precisera bärarmaterial (koppar) och proveniens.',
    academicReference: 'Ölands runinskrifter, Band 1, s. 89',
    reviewedBy: 'Källansvarig redaktör',
    reviewedAt: '2026-10-22T09:45:00Z',
    appliedInDatasetVersion: '2026.1-patch1',
  },
];

/**
 * Drar säkert tillbaka en bildlicens utan att förlora inskriftens källtext eller övriga data.
 * Ersätter bilden med en säker standardplaceholder ('/images/runor/ej-avbildad.svg')
 * och loggar orsaken i redaktionella noteringar.
 */
export function retractImageWithPreservedSource(
  inscription: RunicInscription,
  imageIdToRetract: string,
  retractionReason: string
): { updatedInscription: RunicInscription; retractedImage: RunicImage | null } {
  const existingImages = inscription.images || [];
  const targetImage = existingImages.find((img) => img.id === imageIdToRetract) || null;

  if (!targetImage) {
    return { updatedInscription: inscription, retractedImage: null };
  }

  const safePlaceholder: RunicImage = {
    id: `${targetImage.id}-retracted`,
    imageUrl: '/images/runor/ej-avbildad.svg',
    thumbnailUrl: '/images/runor/ej-avbildad.svg',
    caption: `Bild tillfälligt tillbakadragen: ${retractionReason}`,
    photographerOrArtist: 'Ej tillgänglig',
    year: null,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
  };

  const updatedImages = existingImages.map((img) =>
    img.id === imageIdToRetract ? safePlaceholder : img
  );

  const updatedInscription: RunicInscription = {
    ...inscription,
    images: updatedImages,
    editorialNotes: `${inscription.editorialNotes || ''} [Bild ${imageIdToRetract} tillbakadragen: ${retractionReason}]`.trim(),
  };

  return { updatedInscription, retractedImage: targetImage };
}

/**
 * Slår upp en inskrift med bakåtkompatibel historikstöd via canonicalSlug och previousSlugs.
 * Garanterar att gamla bokmärken eller externa citeringar alltid löses upp.
 */
export function resolveSlugWithHistory(
  inscriptions: RunicInscription[],
  requestedSlug: string
): {
  found: boolean;
  inscription: RunicInscription | null;
  isRedirect: boolean;
  canonicalSlug: string | null;
} {
  const normalized = requestedSlug.toLowerCase().trim();

  // 1. Direkt kanonisk träff
  const canonicalMatch = inscriptions.find(
    (item) => item.canonicalSlug.toLowerCase() === normalized
  );
  if (canonicalMatch) {
    return {
      found: true,
      inscription: canonicalMatch,
      isRedirect: false,
      canonicalSlug: canonicalMatch.canonicalSlug,
    };
  }

  // 2. Äldre historisk slug (previousSlugs)
  const legacyMatch = inscriptions.find((item) =>
    item.previousSlugs?.some((prev) => prev.toLowerCase() === normalized)
  );
  if (legacyMatch) {
    return {
      found: true,
      inscription: legacyMatch,
      isRedirect: true,
      canonicalSlug: legacyMatch.canonicalSlug,
    };
  }

  return {
    found: false,
    inscription: null,
    isRedirect: false,
    canonicalSlug: null,
  };
}

/**
 * Jämför två versioner av en inskriftskorpus och genererar en strukturerad differensrapport.
 */
export interface CorpusDiffResult {
  addedSlugs: string[];
  removedSlugs: string[];
  modifiedSlugs: string[];
  unchangedSlugs: string[];
  hasBreakingChanges: boolean;
}

export function diffDatasetVersions(
  previousCorpus: RunicInscription[],
  newCorpus: RunicInscription[]
): CorpusDiffResult {
  const prevMap = new Map(previousCorpus.map((item) => [item.canonicalSlug, item]));
  const newMap = new Map(newCorpus.map((item) => [item.canonicalSlug, item]));

  const addedSlugs: string[] = [];
  const removedSlugs: string[] = [];
  const modifiedSlugs: string[] = [];
  const unchangedSlugs: string[] = [];

  for (const [slug] of newMap) {
    if (!prevMap.has(slug)) {
      addedSlugs.push(slug);
    } else {
      const prev = prevMap.get(slug)!;
      const curr = newMap.get(slug)!;
      const isIdentical = JSON.stringify(prev) === JSON.stringify(curr);
      if (isIdentical) {
        unchangedSlugs.push(slug);
      } else {
        modifiedSlugs.push(slug);
      }
    }
  }

  for (const [slug] of prevMap) {
    if (!newMap.has(slug)) {
      removedSlugs.push(slug);
    }
  }

  return {
    addedSlugs,
    removedSlugs,
    modifiedSlugs,
    unchangedSlugs,
    hasBreakingChanges: removedSlugs.length > 0,
  };
}
