import type { RunicInscription } from './types.ts';

export interface RunicSlugResolution {
  type: 'exact' | 'redirect' | 'not_found';
  canonicalSlug?: string;
  inscription?: RunicInscription;
  previousSlug?: string | null;
  nextSlug?: string | null;
}

export interface RunicMetadataResult {
  title: string;
  description: string;
  alternates?: {
    canonical: string;
  };
  openGraph?: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    type: string;
    images: Array<{ url: string; alt: string }>;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    images: string[];
  };
}

/**
 * Slår upp en inskrift via kanonisk slug, signum eller äldre alias.
 * Returnerar 'exact' vid officiell match, 'redirect' vid alias/signum-träff, eller 'not_found'.
 */
export function resolveRunicSlug(
  slug: string,
  inscriptions: RunicInscription[]
): RunicSlugResolution {
  const norm = slug.toLowerCase().trim();

  // 1. Exakt matchning på officiell kanonisk slug
  const index = inscriptions.findIndex((i) => i.canonicalSlug.toLowerCase() === norm);
  if (index !== -1) {
    const inscription = inscriptions[index];
    const previousSlug = index > 0 ? inscriptions[index - 1].canonicalSlug : null;
    const nextSlug = index < inscriptions.length - 1 ? inscriptions[index + 1].canonicalSlug : null;

    return {
      type: 'exact',
      canonicalSlug: inscription.canonicalSlug,
      inscription,
      previousSlug,
      nextSlug,
    };
  }

  // 2. Sök bland alternativa signum, tidigare slugs och alias
  const aliasMatch = inscriptions.find(
    (i) =>
      i.canonicalSignum.toLowerCase() === norm ||
      i.canonicalSignum.toLowerCase().replace(/\s+/g, '-') === norm ||
      (i.previousSlugs && i.previousSlugs.map((s) => s.toLowerCase()).includes(norm)) ||
      (i.aliases && i.aliases.some((a) => a.toLowerCase() === norm || a.toLowerCase().replace(/\s+/g, '-') === norm))
  );

  if (aliasMatch) {
    const aliasIndex = inscriptions.findIndex((i) => i.canonicalSlug === aliasMatch.canonicalSlug);
    const previousSlug = aliasIndex > 0 ? inscriptions[aliasIndex - 1].canonicalSlug : null;
    const nextSlug = aliasIndex < inscriptions.length - 1 ? inscriptions[aliasIndex + 1].canonicalSlug : null;

    return {
      type: 'redirect',
      canonicalSlug: aliasMatch.canonicalSlug,
      inscription: aliasMatch,
      previousSlug,
      nextSlug,
    };
  }

  return { type: 'not_found' };
}

/**
 * Skapar källmedvetna metadata för /runor/[slug].
 */
export function generateRunicMetadata(
  slug: string,
  inscriptions: RunicInscription[]
): RunicMetadataResult {
  const resolution = resolveRunicSlug(slug, inscriptions);
  if (resolution.type === 'not_found' || !resolution.inscription) {
    return {
      title: 'Runinskrift hittades inte — Sveriges runinskrifter',
      description: 'Den efterfrågade runinskriften finns inte i katalogen.',
    };
  }

  const item = resolution.inscription;
  const placement = item.placements[0];
  const placeStr = placement ? `${placement.parish}, ${placement.province}` : 'Sverige';
  const textExtract = item.textLayer.translationSwedish || item.textLayer.readingTransliteration;
  const snippet = textExtract ? ` ”${textExtract.slice(0, 140).trim()}…”` : '';

  const title = `${item.canonicalSignum}${item.name ? ` (${item.name})` : ''} — Sveriges runinskrifter`;
  const description = `Källutgåva och tolkning för ${item.canonicalSignum} (${placeStr}). Datering: ${item.dating.originalSourceLabel}.${snippet} Förlaga: ${item.source.sriVolumeTitle}.`;

  const imageUrl = item.images[0]?.imageUrl || '/images/runor/ej-avbildad.svg';

  return {
    title,
    description,
    alternates: {
      canonical: `https://fornsvenska.se/runor/${item.canonicalSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://fornsvenska.se/runor/${item.canonicalSlug}`,
      siteName: 'fornsvenska.se',
      type: 'article',
      images: [
        {
          url: imageUrl,
          alt: item.images[0]?.caption || `Runinskrift ${item.canonicalSignum}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Skapar Schema.org JSON-LD strukturerad data för en runinskrift.
 */
export function generateRunicStructuredData(inscription: RunicInscription): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: `${inscription.canonicalSignum}${inscription.name ? ` (${inscription.name})` : ''}`,
    artform: inscription.carrier.type,
    material: inscription.carrier.material,
    description: inscription.textLayer.translationSwedish || inscription.textLayer.readingTransliteration,
    spatialCoverage: inscription.placements[0]
      ? {
          '@type': 'Place',
          name: `${inscription.placements[0].placeName || ''}, ${inscription.placements[0].parish}, ${inscription.placements[0].province}`.trim(),
          geo: inscription.placements[0].coordinatesWgs84
            ? {
                '@type': 'GeoCoordinates',
                longitude: inscription.placements[0].coordinatesWgs84[0],
                latitude: inscription.placements[0].coordinatesWgs84[1],
              }
            : undefined,
        }
      : undefined,
    temporalCoverage: inscription.dating.originalSourceLabel,
    citation: `${inscription.source.sriVolumeTitle}, s. ${inscription.source.printedPageStart}`,
    image: inscription.images[0]?.imageUrl ? `https://fornsvenska.se${inscription.images[0].imageUrl}` : undefined,
  };
}
