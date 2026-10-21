import type { ParadigmId, ThesisPilotEdition } from './types.ts';
import { THESIS_PILOT_EDITION } from './pilot-data.ts';
import { validateThesisPilotEdition } from './validation.ts';

export interface RegionEditorialOverride {
  regionId: string;
  paradigmId: ParadigmId;
  customLabel: string;
  customColorHex: string;
  editorialSourceNote: string;
}

export interface ThesisEditorialConfig {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  shortReadingPath: string;
  orientationBoxTitle: string;
  orientationBoxBody: string;
  mapSectionTitle: string;
  mapSectionIntro: string;
  changeModelSectionTitle: string;
  changeModelSectionIntro: string;
  sourcePanelIntro: string;
  dataVersionLabel: string;
  regionOverrides: Record<string, RegionEditorialOverride>;
  customPilotEdition?: ThesisPilotEdition | null;
}

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export const DEFAULT_THESIS_EDITORIAL_CONFIG: ThesisEditorialConfig = {
  eyebrow: 'Språkliv · Doktorsavhandling i interaktiv utgåva (Pilot v1)',
  title: 'Från person till person',
  subtitle:
    'Hur verben i sydvästsvenska dialekter steg för steg slutade böjas efter person i plural — från tre pluralpersoner till en gemensam pluralform.',
  intro:
    'I dagens standardsvenska heter det ”vi kastar, ni kastar, de kastar” (enhetsböjning). I äldre sydvästsvenska folkmål (ca 1850–1950, med tyngdpunkt kring sekelskiftet 1900) växlade verbets pluralform däremot efter vem som utförde handlingen: ”vi kastum, I kasten, di kasta”. Denna interaktiva pilot bygger på kapitel 7 i Adam Horn af Åminnes avhandling (2022) och låter dig följa kartan, paradigmen, förändringsmodellen och de exakta källställena sida vid sida.',
  shortReadingPath:
    'Snabb läsväg (2 minuter): 1) Jämför rutan ”Tre begrepp på 30 sekunder” nedan med modern svenska. 2) Klicka på de fyra områdena på Karta 10 (eller i regionlistan) för att se hur 1, 2 och 3 person plural slås ihop i Tablå 28 och Tablå 29. 3) Stega igenom Figur 6 för att se de två analogiska vägarna från um-böjning till a-böjning.',
  orientationBoxTitle: 'Tre begrepp på 30 sekunder: person, numerus och enhetsböjning',
  orientationBoxBody:
    '• Personkongruens i plural (um-, e- och skånsk böjning): verbet byter ändelse efter om subjektet är 1 person (vi), 2 person (I/ni) eller 3 person (di/de).\n• Ren numeruskongruens i plural (a-böjning): alla tre personer i plural har samma ändelse (-a i presens / -e i preteritum), men plural skiljs fortfarande från singular.\n• Enhetsböjning (nutida standardsvenska och sydvästra Skåne): samma verbform i både singular och plural i alla personer.',
  mapSectionTitle: 'Karta 10 & Tablå 28 · Plural indikativ i Sydvästsverige',
  mapSectionIntro:
    'Välj ett av de fyra huvudområdena eller ett specifikt delområde i kartan eller listan. Varje val uppdaterar direkt ändelseparadigmet i Tablå 28 (s. 147), fullständiga exempelverb ur Tablå 29 (s. 153) samt källkritiska förbehåll (som n-bortfallsgränsen och fotnot 81).',
  changeModelSectionTitle: 'Figur 6 · Den analogiska förändringsmodellen (s. 160)',
  changeModelSectionIntro:
    'Stega framåt eller bakåt mellan de fyra utvecklingsstegen i Figur 6, eller välj ”Visa alla steg samtidigt” för en statisk tabelljämförelse. Observera att modellen visar den språkhistoriska mekanismen (analogisk utjämning mellan grammatiska personer) — inte en kronologisk inspelning av en enskild talare.',
  sourcePanelIntro:
    'Varje uppgift på sidan är knuten till tryckt sida och fysisk PDF-sida i avhandlingen (Acta Universitatis Upsaliensis 2022) samt bakomliggande arkivbelägg.',
  dataVersionLabel: 'svenskadev-thesis-pilot-v1 (1.0.0)',
  regionOverrides: {
    'region-um-omradet': {
      regionId: 'region-um-omradet',
      paradigmId: 'um-bojning',
      customLabel: 'um-området (1p -um · 2p -e(n) · 3p -a / -e)',
      customColorHex: '#C84B31',
      editorialSourceNote:
        'Karta 10 s. 148 & kap. 7.1.1 s. 152–153. Prickskraffering i norr markerar -e utan finalt /n/ i 2 person plural.',
    },
    'region-e-omradet': {
      regionId: 'region-e-omradet',
      paradigmId: 'e-bojning',
      customLabel: 'e-området (1p = 2p -e(n) · 3p -a / -e)',
      customColorHex: '#2B6CB0',
      editorialSourceNote:
        'Karta 10 s. 148 & kap. 7.1.2 s. 153–154. Ytterområdet i norra Halland är indirekt härlett enligt fotnot 81 (s. 147).',
    },
    'region-skanska-omradet': {
      regionId: 'region-skanska-omradet',
      paradigmId: 'skansk-bojning',
      customLabel: 'det skånska området (1p = 3p -a / -e · 2p -en)',
      customColorHex: '#7B341E',
      editorialSourceNote:
        'Karta 10 s. 148 & kap. 7.1.3 s. 154. Gränsar i sydväst mot det ofärgade området med enhetsböjning (jfr Karta 12 s. 151).',
    },
    'region-a-omradet': {
      regionId: 'region-a-omradet',
      paradigmId: 'a-bojning',
      customLabel: 'a-området (1p = 2p = 3p -a / -e · ren numeruskongruens)',
      customColorHex: '#2F855A',
      editorialSourceNote:
        'Karta 10 s. 148 & kap. 7.1.4 s. 154–155. Omfattar även exklaven i Ale härad (belagd i preteritum, s. 158) och det indirekt härledda området i Blekinge (fotnot 81, s. 147).',
    },
  },
  customPilotEdition: null,
};

export function validateThesisEditorialConfig(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return 'Konfigurationen för avhandlingspiloten saknas.';
  }
  const cfg = value as ThesisEditorialConfig;

  const textLimits: Array<[keyof ThesisEditorialConfig, number]> = [
    ['eyebrow', 120],
    ['title', 90],
    ['subtitle', 320],
    ['intro', 1200],
    ['shortReadingPath', 800],
    ['orientationBoxTitle', 140],
    ['orientationBoxBody', 1200],
    ['mapSectionTitle', 140],
    ['mapSectionIntro', 800],
    ['changeModelSectionTitle', 140],
    ['changeModelSectionIntro', 800],
    ['sourcePanelIntro', 600],
    ['dataVersionLabel', 80],
  ];

  for (const [field, maxLen] of textLimits) {
    const val = cfg[field];
    if (typeof val !== 'string' || !val.trim() || val.length > maxLen) {
      return `Fältet "${String(field)}" måste innehålla 1–${maxLen} tecken.`;
    }
  }

  if (!cfg.regionOverrides || typeof cfg.regionOverrides !== 'object') {
    return 'regionOverrides saknas.';
  }

  for (const baseRegion of THESIS_PILOT_EDITION.regions) {
    const override = cfg.regionOverrides[baseRegion.id];
    if (!override) {
      return `Regioninställning saknas för ${baseRegion.id}.`;
    }
    if (
      typeof override.customLabel !== 'string' ||
      !override.customLabel.trim() ||
      override.customLabel.length > 120
    ) {
      return `Regionetikett för ${baseRegion.id} måste vara 1–120 tecken.`;
    }
    if (
      typeof override.customColorHex !== 'string' ||
      !HEX_COLOR_RE.test(override.customColorHex)
    ) {
      return `Färgkod för ${baseRegion.id} måste vara en giltig sexsiffrig hexkod (t.ex. #C84B31).`;
    }
    if (
      typeof override.editorialSourceNote !== 'string' ||
      !override.editorialSourceNote.trim() ||
      override.editorialSourceNote.length > 500
    ) {
      return `Källnot för ${baseRegion.id} måste vara 1–500 tecken.`;
    }
  }

  if (cfg.customPilotEdition !== null && cfg.customPilotEdition !== undefined) {
    const editionCheck = validateThesisPilotEdition(cfg.customPilotEdition);
    if (!editionCheck.valid) {
      return `Importerad pilotdata underkändes av källkritisk validering: ${editionCheck.errors[0]}`;
    }
  }

  return null;
}

export function resolveThesisEditionWithConfig(
  config: ThesisEditorialConfig
): ThesisPilotEdition {
  const base = config.customPilotEdition ?? THESIS_PILOT_EDITION;
  const colorByParadigm = new Map<ParadigmId, string>();
  for (const r of Object.values(config.regionOverrides || {})) {
    if (r?.paradigmId && HEX_COLOR_RE.test(r.customColorHex)) {
      colorByParadigm.set(r.paradigmId, r.customColorHex);
    }
  }

  return {
    ...base,
    version: config.dataVersionLabel || base.version,
    paradigms: base.paradigms.map((p) => ({
      ...p,
      webDisplayColorHex: colorByParadigm.get(p.id) ?? p.webDisplayColorHex,
    })),
  };
}
