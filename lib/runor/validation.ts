import type { RunicInscription } from './types.ts';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validerar en enskild runinskrift enligt E06-kontraktet.
 */
export function validateRunicInscription(item: RunicInscription): ValidationResult {
  const errors: string[] = [];

  if (!item.id || typeof item.id !== 'string') {
    errors.push('Inskrift saknar giltigt id');
  }
  if (!item.canonicalSignum || !item.canonicalSignum.trim()) {
    errors.push('Inskrift saknar kanoniskt signum');
  }
  if (!item.provinceCode || !item.provinceCode.trim()) {
    errors.push('Inskrift saknar landskapskod');
  }
  if (!Number.isInteger(item.itemNumber) || item.itemNumber <= 0) {
    errors.push('Inskrift måste ha ett positivt heltal som itemNumber');
  }
  if (!item.canonicalSlug || !/^[a-z0-9-]+$/.test(item.canonicalSlug)) {
    errors.push(`Kanonisk slug '${item.canonicalSlug}' är ogiltig (endast små bokstäver och bindestreck)`);
  }

  // Bärare
  if (!item.carrier) {
    errors.push('Inskrift saknar bärare (carrier)');
  } else {
    if (!item.carrier.type) errors.push('Bärare saknar typ');
    if (!item.carrier.material) errors.push('Bärare saknar material');
    if (!item.carrier.preservationStatus) errors.push('Bärare saknar bevarandestatus');
  }

  // Källhänvisning
  if (!item.source) {
    errors.push('Inskrift saknar källhänvisning (source)');
  } else {
    if (!item.source.sriVolumeId) errors.push('Källa saknar sriVolumeId');
    if (!item.source.author) errors.push('Källa saknar författare');
    if (!item.source.publicationYear || item.source.publicationYear < 1900 || item.source.publicationYear > 2026) {
      errors.push(`Källa har orimligt publikationsår: ${item.source.publicationYear}`);
    }
    if (!item.source.printedPageStart || item.source.printedPageStart <= 0) {
      errors.push('Källa saknar giltigt tryckt start-sidnummer');
    }
    if (item.source.printedPageEnd && item.source.printedPageEnd < item.source.printedPageStart) {
      errors.push('Källa har tryckt slutsida som är mindre än startsida');
    }
    if (!item.source.pdfPageStart || item.source.pdfPageStart <= 0) {
      errors.push('Källa saknar giltigt PDF-startsidnummer');
    }
    if (item.source.pdfPageEnd && item.source.pdfPageEnd < item.source.pdfPageStart) {
      errors.push('Källa har PDF-slutsida som är mindre än startsida');
    }
  }

  // Textlager
  if (!item.textLayer) {
    errors.push('Inskrift saknar textlager (textLayer)');
  } else {
    if (!item.textLayer.readingTransliteration || !item.textLayer.readingTransliteration.trim()) {
      errors.push('Textlager saknar translittererad läsning');
    }
    if (!item.textLayer.translationSwedish || !item.textLayer.translationSwedish.trim()) {
      errors.push('Textlager saknar svensk översättning');
    }
  }

  // Datering
  if (!item.dating) {
    errors.push('Inskrift saknar datering');
  } else {
    if (!item.dating.originalSourceLabel) errors.push('Datering saknar källformulering');
    if (
      item.dating.earliestYear != null &&
      item.dating.latestYear != null &&
      item.dating.earliestYear > item.dating.latestYear
    ) {
      errors.push(`Datering har earliestYear (${item.dating.earliestYear}) > latestYear (${item.dating.latestYear})`);
    }
  }

  // Platser och koordinater
  if (!Array.isArray(item.placements) || item.placements.length === 0) {
    errors.push('Inskrift saknar minst en platsangivelse (placements)');
  } else {
    for (const [idx, p] of item.placements.entries()) {
      if (!p.placeName || !p.parish || !p.province) {
        errors.push(`Placering #${idx} saknar platsnamn, socken eller landskap`);
      }
      if (p.coordinatesWgs84) {
        const [lon, lat] = p.coordinatesWgs84;
        if (typeof lon !== 'number' || typeof lat !== 'number') {
          errors.push(`Placering #${idx} har icke-numeriska koordinater`);
        } else if (lon < 8.0 || lon > 26.0 || lat < 54.0 || lat > 71.0) {
          errors.push(`Placering #${idx} koordinater [${lon}, ${lat}] ligger utanför Norden`);
        }
      }
    }
  }

  // Bilder och rättigheter
  if (Array.isArray(item.images)) {
    for (const [idx, img] of item.images.entries()) {
      if (img.isPubliclyDistributable && (!img.license || img.license.toLowerCase() === 'oklar')) {
        errors.push(`Bild #${idx} är markerad som publikt distribuerbar men saknar giltig licens`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validerar en hel korpus av runinskrifter mot dubbletter och relationer.
 */
export function validateRunicCorpus(items: RunicInscription[]): ValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const seenSigna = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const item of items) {
    const single = validateRunicInscription(item);
    if (!single.valid) {
      errors.push(`[${item.canonicalSignum || item.id}]: ${single.errors.join(', ')}`);
    }

    if (seenIds.has(item.id)) {
      errors.push(`Dubblett av internt id: ${item.id}`);
    }
    seenIds.add(item.id);

    if (seenSigna.has(item.canonicalSignum)) {
      errors.push(`Dubblett av kanoniskt signum: ${item.canonicalSignum}`);
    }
    seenSigna.add(item.canonicalSignum);

    if (seenSlugs.has(item.canonicalSlug)) {
      errors.push(`Dubblett av URL-slug: ${item.canonicalSlug}`);
    }
    seenSlugs.add(item.canonicalSlug);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
