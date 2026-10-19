export const SECTIONS = [
  { slug: "sprakrad", title: "Språkråd", description: "Svar på språkets vardagsfrågor, med förklaringar och exempel." },
  { slug: "grammatik", title: "Grammatik", description: "Mönstren bakom svenskan: ordens former, meningarnas byggnad och språkets möjligheter." },
  { slug: "ordval", title: "Ordval", description: "Svenska alternativ, betydelseskillnader och uttryck som passar sammanhanget." },
  { slug: "sprakliv", title: "Språkliv", description: "Dialekter, historia och stil. Ett växande arkiv om svenskan i bruk." },
] as const;
export type SectionSlug = (typeof SECTIONS)[number]["slug"];
