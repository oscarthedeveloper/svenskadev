import type { ParadigmId } from './types.ts';

export interface MapSubAreaGeometry {
  subAreaId: string;
  regionId: string;
  paradigmId: ParadigmId;
  svgPath: string;
  labelX: number;
  labelY: number;
  shortCode: string;
  hasNDropDots: boolean;
  isInferredFn81: boolean;
  isExclave?: boolean;
}

export interface MapProvinceReference {
  id: string;
  name: string;
  abbr: string;
  labelX: number;
  labelY: number;
  borderPath: string;
}

export interface MapExceptionMarker {
  exceptionId: string;
  regionId: string;
  label: string;
  shortTag: string;
  x: number;
  y: number;
}

export const KARTA_10_VIEWBOX = '0 0 640 760';

/**
 * Schematisk kust- och landkontur för Sydvästsverige (Västergötland, Halland, Småland, Skåne, Blekinge)
 * med Vänern och Vättern som geografiska referensytor.
 * Geometrin är strikt separerad från avhandlingens språkliga källdata (A03.2).
 */
export const SOUTHWEST_SWEDEN_LAND_OUTLINE =
  'M 135 55 L 250 45 L 335 75 L 365 165 L 430 175 L 575 210 L 595 455 L 545 520 L 440 535 L 395 555 L 385 620 L 355 685 L 265 695 L 210 675 L 185 615 L 205 565 L 185 520 L 210 490 L 180 430 L 145 350 L 120 265 L 110 175 L 125 110 Z';

export const VANERN_OUTLINE =
  'M 145 30 L 270 18 L 295 65 L 235 105 L 155 95 Z';

export const VATTERN_OUTLINE =
  'M 340 65 L 385 55 L 395 235 L 350 245 Z';

/**
 * Sydvästskånska området utan indikativ pluralböjning (ofärgat på Karta 10 s. 148).
 */
export const SW_SKANE_ENHETSBOJNING_PATH =
  'M 185 555 L 255 565 L 315 625 L 345 685 L 265 695 L 210 675 L 185 615 Z';

/**
 * Vågformad gränslinje för n-bortfall i -e(n) där Halland, Västergötland och Småland möts (s. 147–148).
 * Norr om linjen realiseras -e(n) som -e (prickskraffering på Karta 10); söder om linjen som -en.
 */
export const N_DROP_WAVE_BOUNDARY_PATH =
  'M 118 292 Q 165 308 212 294 T 305 298 T 395 288';

export const PROVINCE_REFERENCES_KARTA_10: MapProvinceReference[] = [
  {
    id: 'prov-vg',
    name: 'Västergötland',
    abbr: 'VG',
    labelX: 235,
    labelY: 165,
    borderPath: 'M 125 195 L 175 235 L 245 315 L 310 265 L 350 230',
  },
  {
    id: 'prov-ha',
    name: 'Halland',
    abbr: 'HA',
    labelX: 145,
    labelY: 365,
    borderPath: 'M 125 195 L 175 235 L 215 340 L 235 450 L 195 495',
  },
  {
    id: 'prov-sm',
    name: 'Småland',
    abbr: 'SM',
    labelX: 435,
    labelY: 335,
    borderPath: 'M 310 265 L 235 450 L 395 465 L 540 460',
  },
  {
    id: 'prov-sk',
    name: 'Skåne',
    abbr: 'SK',
    labelX: 285,
    labelY: 590,
    borderPath: 'M 195 495 L 235 450 L 395 465 L 405 545',
  },
  {
    id: 'prov-bl',
    name: 'Blekinge',
    abbr: 'BL',
    labelX: 485,
    labelY: 505,
    borderPath: 'M 395 465 L 540 460 L 545 520 L 405 545 Z',
  },
];

/**
 * De 9 delområdena som tillsammans bygger upp de 4 huvudregionerna på Karta 10 (s. 148).
 * Varje delområde bär information om prickskraffering (n-bortfall) och indirekt härledning (fotnot 81).
 */
export const SUBAREA_GEOMETRIES_KARTA_10: MapSubAreaGeometry[] = [
  // 1. a-området: Exklaven i Ale härad (västra Västergötland)
  {
    subAreaId: 'subarea-a-ale-harad-exklav',
    regionId: 'region-a-omradet',
    paradigmId: 'a-bojning',
    svgPath: 'M 132 142 L 168 135 L 176 176 L 138 184 Z',
    labelX: 154,
    labelY: 160,
    shortCode: 'a (Ale hd)',
    hasNDropDots: false,
    isInferredFn81: false,
    isExclave: true,
  },
  // 2. a-området: Sammanhängande bälte i Västergötland och Småland
  {
    subAreaId: 'subarea-a-gransbalte-vg-sm',
    regionId: 'region-a-omradet',
    paradigmId: 'a-bojning',
    svgPath:
      'M 182 178 L 285 172 L 348 228 L 415 295 L 442 395 L 435 465 L 398 465 L 402 395 L 378 312 L 322 252 L 268 205 L 185 208 Z',
    labelX: 365,
    labelY: 265,
    shortCode: 'a',
    hasNDropDots: false,
    isInferredFn81: false,
  },
  // 3. a-området: Indirekt härlett ytterområde i Blekinge (fotnot 81)
  {
    subAreaId: 'subarea-a-blekinge-inferred-fn81',
    regionId: 'region-a-omradet',
    paradigmId: 'a-bojning',
    svgPath: 'M 425 465 L 495 462 L 502 526 L 425 536 Z',
    labelX: 462,
    labelY: 498,
    shortCode: 'a (not 81)',
    hasNDropDots: false,
    isInferredFn81: true,
  },
  // 4. e-området: Indirekt härlett ytterområde i norra Halland (fotnot 81, prickskrafferat)
  {
    subAreaId: 'subarea-e-norra-halland-inferred-fn81',
    regionId: 'region-e-omradet',
    paradigmId: 'e-bojning',
    svgPath: 'M 118 202 L 172 205 L 178 272 L 122 272 Z',
    labelX: 148,
    labelY: 240,
    shortCode: 'e (not 81)',
    hasNDropDots: true,
    isInferredFn81: true,
  },
  // 5. e-området: Norra e-området i Västergötland och nordvästligaste Småland (prickskrafferat, -e)
  {
    subAreaId: 'subarea-e-nord-n-bortfall',
    regionId: 'region-e-omradet',
    paradigmId: 'e-bojning',
    svgPath:
      'M 172 205 L 268 205 L 322 252 L 378 312 L 305 298 L 265 252 L 202 252 L 178 272 Z',
    labelX: 258,
    labelY: 232,
    shortCode: 'e (-e)',
    hasNDropDots: true,
    isInferredFn81: false,
  },
  // 6. e-området: Södra e-området i mellersta Halland, sydvästra Småland, NÖ Skåne och Lister (-en)
  {
    subAreaId: 'subarea-e-syd-bevarat-n',
    regionId: 'region-e-omradet',
    paradigmId: 'e-bojning',
    svgPath:
      'M 148 358 L 205 352 L 262 342 L 305 298 L 378 312 L 402 395 L 398 465 L 425 465 L 425 536 L 395 545 L 362 505 L 315 472 L 252 448 L 172 415 Z',
    labelX: 338,
    labelY: 412,
    shortCode: 'e (-en)',
    hasNDropDots: false,
    isInferredFn81: false,
  },
  // 7. um-området: Norra um-området i Mark och sydvästra Kind (prickskrafferat, 2p -e)
  {
    subAreaId: 'subarea-um-nord-n-bortfall',
    regionId: 'region-um-omradet',
    paradigmId: 'um-bojning',
    svgPath: 'M 178 272 L 202 252 L 265 252 L 292 296 L 195 298 Z',
    labelX: 232,
    labelY: 278,
    shortCode: 'um (-e)',
    hasNDropDots: true,
    isInferredFn81: false,
  },
  // 8. um-området: Södra um-området i mellersta Halland och västligaste Småland (2p -en)
  {
    subAreaId: 'subarea-um-syd-bevarat-n',
    regionId: 'region-um-omradet',
    paradigmId: 'um-bojning',
    svgPath: 'M 122 272 L 178 272 L 195 298 L 292 296 L 262 342 L 205 352 L 148 358 Z',
    labelX: 205,
    labelY: 325,
    shortCode: 'um (-en)',
    hasNDropDots: false,
    isInferredFn81: false,
  },
  // 9. Det skånska området: Södra Halland, sydvästligaste Småland och Skåne (utom SV Skåne och NÖ Göinge)
  {
    subAreaId: 'subarea-skanska-huvudomradet',
    regionId: 'region-skanska-omradet',
    paradigmId: 'skansk-bojning',
    svgPath:
      'M 172 415 L 252 448 L 315 472 L 362 505 L 395 545 L 385 620 L 355 685 L 345 685 L 315 625 L 255 565 L 185 555 L 205 525 L 185 505 L 210 485 Z',
    labelX: 295,
    labelY: 542,
    shortCode: 'skånsk',
    hasNDropDots: false,
    isInferredFn81: false,
  },
];

export const EXCEPTION_MARKERS_KARTA_10: MapExceptionMarker[] = [
  {
    exceptionId: 'exc-sodra-kind-overgang',
    regionId: 'region-um-omradet',
    label: 'Södra Kinds hd (um → e kring 1900, s. 152)',
    shortTag: 'Kind',
    x: 268,
    y: 288,
  },
  {
    exceptionId: 'exc-burseryd-fulla-paradigm',
    regionId: 'region-um-omradet',
    label: 'Burseryds sn (fulla källparadigm i Västbo hd, s. 152–153)',
    shortTag: 'Burseryd',
    x: 272,
    y: 322,
  },
  {
    exceptionId: 'exc-2a-bojning-redvag',
    regionId: 'region-e-omradet',
    label: 'Hössna & Strängsereds sn, Redvägs hd (2a-böjning: 1p -e, 2p/3p -a, s. 155–156)',
    shortTag: '2a-böjn.',
    x: 292,
    y: 222,
  },
  {
    exceptionId: 'exc-hanger-och-od-skansk-i-norr',
    regionId: 'region-e-omradet',
    label: 'Ods sn (VG) & Hångers sn (SM) (nordliga belägg på skånsk böjning, s. 154)',
    shortTag: 'Od / Hånger',
    x: 242,
    y: 215,
  },
  {
    exceptionId: 'exc-osby-a-bojning-i-skane',
    regionId: 'region-skanska-omradet',
    label: 'Osby sn, Östra Göinge hd (belägg på a-böjning i NÖ Skåne, s. 155)',
    shortTag: 'Osby (a)',
    x: 348,
    y: 478,
  },
  {
    exceptionId: 'exc-generaliserad-e-bojning-sm-bl',
    regionId: 'region-a-omradet',
    label: 'Berg, Södra Sandsjö & Hällaryd (generaliserad e-böjning 1p=2p=3p -en, s. 156–157)',
    shortTag: 'Gen. -en',
    x: 448,
    y: 442,
  },
];
