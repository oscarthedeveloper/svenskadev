/**
 * Datamodell för Runsidan på fornsvenska.se (E06).
 * Separerar bärare, inskrift, textlager, plats, datering och källhänvisningar.
 */

export type CarrierType =
  | 'runsten'
  | 'fast_hall'
  | 'runblock'
  | 'gravhall'
  | 'fragment'
  | 'traforemal'
  | 'metallforemal'
  | 'benforemal'
  | 'ovrigt';

export type PreservationStatus =
  | 'bevarad_i_sin_helhet'
  | 'bevarad_i_fragment'
  | 'delvis_forstord'
  | 'forlorad'
  | 'okand';

export type GeoPrecision =
  | 'exakt_koordinat'
  | 'ungefarlig_plats'
  | 'sockencentrum'
  | 'okant_lage';

export type HistoricalLanguage =
  | 'urnordiska'
  | 'runsvenska'
  | 'fornsvenska'
  | 'fornvastnordiska'
  | 'latin';

export type TranslationLanguage =
  | 'svenska'
  | 'engelska';

/**
 * Fysisk bärare av en eller flera runinskrifter.
 */
export interface RunicCarrier {
  id: string; // t.ex. "carrier-ol-1"
  type: CarrierType;
  material: string; // t.ex. "Kalksten", "Granit", "Gnejs"
  preservationStatus: PreservationStatus;
  heightCm?: number | null;
  widthCm?: number | null;
  thicknessCm?: number | null;
  currentLocationDescription?: string;
  notes?: string;
}

/**
 * Geografisk placering (fyndplats eller nuvarande placering).
 */
export interface RunicPlacement {
  type: 'fyndplats' | 'ursprunglig_plats' | 'nuvarande_placering';
  province: string;
  parish: string;
  hundred?: string | null;
  municipality?: string | null;
  county?: string | null;
  placeName: string;
  coordinatesWgs84: [number, number] | null; // [lon, lat] i GeoJSON-standard
  precision: GeoPrecision;
  sourceNote: string;
  observationYear?: number | null;
}

/**
 * Dateringsuppgift som bevarar intervall och osäkerhet utan falsk precision.
 */
export interface RunicDating {
  originalSourceLabel: string; // t.ex. "ca 980–1015", "vikingatid", "ca 1000"
  periodLabel: string; // t.ex. "Vikingatid (sen)", "Övergångstid", "Medeltid"
  earliestYear?: number | null;
  latestYear?: number | null;
  isUncertain: boolean;
  datingMethod?: string; // t.ex. "Typologisk/konsthistorisk stilgruppering (Gräslund)", "Historisk händelse"
}

/**
 * Textlager för en inskrift.
 */
export interface RunicTextLayer {
  id: string;
  readingTransliteration: string; // Diplomatiskt återgiven runtext (t.ex. "[iliuri : raisti...]")
  normalizationRunicSwedish?: string | null; // Normalisering till runsvenska
  normalizationOldWestNorse?: string | null; // Alternativ fornvästnordisk normalisering
  translationSwedish: string; // Nusvensk översättning
  translationEnglish?: string | null; // Engelsk översättning
  carverAttribution?: string | null; // t.ex. "Öpir", "Fot", "Åsmund Kåresson"
  isSigned: boolean;
  alternativeInterpretations?: Array<{
    author: string;
    year: number;
    text: string;
    note: string;
  }>;
}

/**
 * Källhänvisning till Sveriges runinskrifter (SRI) och externa register.
 */
export interface RunicSourceReference {
  sriVolumeId: string; // t.ex. "band-01"
  sriVolumeTitle: string; // t.ex. "Ölands runinskrifter"
  author: string; // t.ex. "Sven Söderberg & Erik Brate"
  publicationYear: number;
  printedPageStart: number;
  printedPageEnd?: number | null;
  pdfPageStart: number;
  pdfPageEnd?: number | null;
  pdfFil?: string | null; // t.ex. "sri_oland_b01_h01.pdf"
  plateNumber?: string | null; // t.ex. "Plansch I"
  figureNumber?: string | null; // t.ex. "Figur 3"
  externalUris: {
    samnordiskUuid?: string | null;
    raaRunorUri?: string | null;
    kulturarvsdataUri?: string | null;
  };
}

/**
 * Bild med separat rättighetsregistrering.
 */
export interface RunicImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption: string;
  photographerOrArtist: string;
  year?: number | null;
  license: string; // t.ex. "Public Domain", "CC BY-SA 4.0", "RAÄ öppen licens"
  isPubliclyDistributable: boolean;
  isEditorialDrawing: boolean;
}

/**
 * Huvudentitet: En enskild runinskrift.
 */
export interface RunicInscription {
  id: string; // Stabil intern UUID eller slug-ID (t.ex. "runa-ol-1")
  canonicalSignum: string; // t.ex. "Öl 1"
  provinceCode: string; // t.ex. "Öl"
  itemNumber: number; // t.ex. 1
  suffix?: string | null; // t.ex. "A", "B"
  name?: string | null; // t.ex. "Karlevistenen"
  canonicalSlug: string; // t.ex. "ol-1"
  previousSlugs: string[];
  aliases: string[]; // t.ex. ["Bautil 102", "Liljegren 135"]
  matrixRole?: string | null; // E09 svårfallsroll (t.ex. "Standard runsten", "Förlorad inskrift", "Fragment")
  
  carrier: RunicCarrier;
  placements: RunicPlacement[];
  dating: RunicDating;
  textLayer: RunicTextLayer;
  source: RunicSourceReference;
  images: RunicImage[];

  editorialNotes?: string;
  curationStatus: 'utkast' | 'granskad_pilot' | 'publicerad' | 'arkiverad';
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  isSynthetic?: boolean; // E36 prestandatestmarkering: Får aldrig exponeras publikt
}
