export type ArchiveNode = {
  id?: string;
  slug: string;
  title: string;
  kind: "folder" | "doc";
  note?: string;
  children?: ArchiveNode[];
  publication?: "published" | "draft" | "changes";
};

export type StudyBlock =
  | {
      id: string;
      type: "text";
      title: string;
      body: string;
    }
  | {
      id: string;
      type: "columns";
      title: string;
      leftTitle: string;
      leftBody: string;
      rightTitle: string;
      rightBody: string;
    }
  | {
      id: string;
      type: "table";
      title: string;
      columns: string[];
      rows: string[][];
    }
  | {
      id: string;
      type: "example";
      label: string;
      text: string;
      note: string;
    }
  | {
      id: string;
      type: "quote";
      text: string;
      source: string;
    }
  | {
      id: string;
      type: "note";
      label: string;
      title: string;
      body: string;
    };

export type StudyBlockType = StudyBlock["type"];

export type StudyDocument = {
  title: string;
  subtitle: string;
  period: string;
  category: string;
  intro: string;
  quote?: string;
  quoteSource?: string;
  sources?: Array<{ title: string; url: string }>;
  utkast?: boolean;
  /** Flexibel blocklista. Äldre dokument med sections/table konverteras vid visning. */
  blocks?: StudyBlock[];
  sections: Array<{
    title: string;
    body: string;
    example?: string;
    annotation?: string;
  }>;
  table?: { title: string; columns: string[]; rows: string[][] };
};

/** Gör befintliga dokument redigerbara med den nya blockmodellen utan datamigrering. */
export function blocksForDocument(document: StudyDocument): StudyBlock[] {
  if (document.blocks) return document.blocks;

  const blocks: StudyBlock[] = document.sections.flatMap((section, index) => {
    const converted: StudyBlock[] = [
      {
        id: `legacy-text-${index}`,
        type: "text",
        title: section.title,
        body: section.body,
      },
    ];
    if (section.example || section.annotation) {
      converted.push({
        id: `legacy-example-${index}`,
        type: "example",
        label: "Exempel",
        text: section.example ?? "",
        note: section.annotation ?? "",
      });
    }
    return converted;
  });

  if (document.table) {
    blocks.push({
      id: "legacy-table",
      type: "table",
      title: document.table.title,
      columns: document.table.columns,
      rows: document.table.rows,
    });
  }

  return blocks;
}

/** Tomt innehåll som skapats av redigerarens startknapp, men aldrig skrivits i. */
export function isPlaceholderDocument(value: unknown): boolean {
  if (!value || typeof value !== "object") return true;
  const document = value as Partial<StudyDocument>;
  if (document.intro?.trim()) return false;
  if (document.quote?.trim()) return false;

  if (document.blocks?.length) {
    return (
      document.blocks.length === 1 &&
      document.blocks[0].type === "text" &&
      !document.blocks[0].body.trim() &&
      ["", "Nytt avsnitt"].includes(document.blocks[0].title.trim())
    );
  }

  const sections = document.sections ?? [];
  return (
    sections.length === 0 ||
    (sections.length === 1 &&
      !sections[0].body.trim() &&
      !sections[0].example?.trim() &&
      ["", "Nytt avsnitt"].includes(sections[0].title.trim()))
  );
}

export const TREES = {
  sprakrad: [
    { slug: "de-och-dem", title: "De, dem eller dom?", kind: "doc", note: "Ett enkelt test och dess begränsningar" },
    { slug: "skrivregler", title: "Skrivregler", kind: "folder", note: "Kommande: skiljetecken, särskrivningar och stor bokstav", children: [] },
  ],
  grammatik: [
    { slug: "konjunktiv", title: "Om jag finge välja", kind: "doc", note: "Vore, finge och andra konjunktivformer" },
    { slug: "ordfoljd", title: "Ordföljd", kind: "folder", note: "Kommande: huvudsatser, bisatser och satsadverbial", children: [] },
    { slug: "ordklasser", title: "Ordklasser och böjning", kind: "folder", note: "Kommande: substantiv, adjektiv, pronomen och verb", children: [] },
  ],
  ordval: [
    { slug: "anglicismer", title: "Säg det på svenska", kind: "doc", note: "Alternativ till anglicismer, efter sammanhang" },
    { slug: "betydelseskillnader", title: "Nästan samma sak", kind: "folder", note: "Kommande: ord som ligger nära men betyder olika saker", children: [] },
  ],
  sprakliv: [
    { slug: "om-spraket", title: "Ett språk i rörelse", kind: "doc", note: "Om webbplatsens syn på bruk, stil och variation" },
    { slug: "dialekter", title: "Dialekter och variation", kind: "folder", note: "Kommande: regionala ord, uttal och finlandssvenska", children: [] },
    { slug: "sprakhistoria", title: "Språkhistoria", kind: "folder", note: "Kommande: äldre ord och former i dagens svenska", children: [] },
  ],
} satisfies Record<string, ArchiveNode[]>;

export const DOCUMENTS: Record<string, StudyDocument> = {
  "sprakrad/de-och-dem": {
    title: "De, dem eller dom?", subtitle: "Vem gör något — och vem gäller det?", period: "Nutida svenska", category: "Språkråd", sections: [],
    intro: "Som pronomen används de normalt som subjekt och dem som objekt eller efter en preposition. Ett byte till vi och oss kan hjälpa dig att se skillnaden i enkla meningar.",
    blocks: [
      { id: "de-rule", type: "columns", title: "Prova med vi och oss", leftTitle: "Vi → de", leftBody: "Vi läser boken. → De läser boken.\nDe är subjekt: de utför handlingen.", rightTitle: "Oss → dem", rightBody: "Boken handlar om oss. → Boken handlar om dem.\nHär står pronomenet efter en preposition." },
      { id: "de-example", type: "example", label: "Ett exempel till", text: "De såg oss. Vi såg dem.", note: "Vem som ser och vem som blir sedd avgör pronomenformen." },
      { id: "de-limit", type: "note", label: "Observera", title: "Testet löser inte allt", body: "De används också framför bestämda substantivfraser: de röda böckerna. Då handlar det inte om ett personligt pronomen. Konstruktioner med de/dem som kräver också ett eget resonemang." },
      { id: "de-dom", type: "text", title: "Och dom?", body: "Språkrådet rekommenderar de och dem som neutrala former i standardskrift. Dom kan passa i exempelvis repliker och personligare texter. Valet behöver ta hänsyn till textens ton och läsare." },
    ],
    sources: [{ title: "Språkrådet: När skriver man de och när skriver man dem?", url: "https://frageladan.isof.se/faqs/25461" }, { title: "Språkrådet: När används dom och när används de/dem?", url: "https://frageladan.isof.se/faqs/30753" }],
  },
  "grammatik/konjunktiv": {
    title: "Om jag finge välja", subtitle: "Konjunktivens möjligheter", period: "Nutida och äldre svenska", category: "Verb och modus", sections: [],
    intro: "Konjunktiv kan uttrycka något tänkt, osäkert eller önskat. Vore lever kvar i dagens svenska; finge och flera andra former ger ofta texten en äldre eller litterär ton.",
    blocks: [
      { id: "kon-example", type: "example", label: "Tänk om", text: "Om jag finge välja, vore svaret enkelt.", note: "Ett eget språkexempel: finge motsvarar här fick och vore motsvarar skulle vara." },
      { id: "kon-table", type: "table", title: "Former att känna igen", columns: ["Verb", "Konjunktiv", "Möjlig omskrivning"], rows: [["vara", "vore", "skulle vara"], ["få", "finge", "fick / skulle få"], ["gå", "ginge", "gick / skulle gå"]] },
      { id: "kon-style", type: "text", title: "Välj form efter textens ton", body: "Det vore trevligt är ett naturligt sätt att uttrycka en tänkt möjlighet. Finge är betydligt ovanligare. En omskrivning kan vara lättare att förstå, medan den äldre formen kan vara ett medvetet stilval." },
      { id: "kon-leve", type: "note", label: "En släkting", title: "Leve och vare", body: "Former som leve och vare uttrycker önskan eller förhoppning. De kallas optativ eller presens konjunktiv, som i Leve sommaren!" },
    ],
    sources: [{ title: "Språkrådet: Vad kallas former som vore och finge?", url: "https://frageladan.isof.se/faqs/24717" }],
  },
  "ordval/anglicismer": {
    title: "Säg det på svenska", subtitle: "Börja med betydelsen", period: "Nutida svenska", category: "Ordval", sections: [],
    intro: "Ett bra svenskt alternativ behöver passa det du faktiskt menar. Här är redaktionella förslag att pröva i sitt sammanhang, snarare än en lista med förbjudna ord.",
    blocks: [
      { id: "ord-table", type: "table", title: "Pröva ett annat uttryck", columns: ["Uttryck", "Svenska alternativ", "Sammanhang"], rows: [["makea sense", "låta rimligt / vara begripligt / hänga ihop", "Ett resonemang eller en förklaring"], ["brainstorma", "spåna / kläcka idéer", "Gemensamt idéarbete"], ["deadline", "sista dag / tidsfrist", "När något ska vara klart"], ["feedback", "återkoppling / synpunkter", "Respons på ett arbete"]] },
      { id: "ord-example", type: "columns", title: "Samma engelska uttryck, olika betydelser", leftTitle: "Rimlighet", leftBody: "Det makear sense att åka tidigare.\n→ Det låter rimligt att åka tidigare.", rightTitle: "Begriplighet", rightBody: "Den här meningen makear inte sense.\n→ Den här meningen är inte begriplig." },
      { id: "ord-note", type: "note", label: "Ord & stil", title: "Behåll nyansen", body: "Ett lånord kan vara etablerat eller fungera bra i en viss grupp. Fundera på vem som läser, vilken ton du vill ha och vilken betydelse som behöver komma fram." },
    ],
  },
  "sprakliv/om-spraket": {
    title: "Ett språk i rörelse", subtitle: "Regler, bruk och nyfikenhet", period: "Om svenska.dev", category: "Redaktionellt", sections: [],
    intro: "Svenska.dev samlar praktisk språkhjälp och upptäckter om svenskan. Ambitionen är att förklara både hur ett uttryck fungerar och när det passar.",
    blocks: [
      { id: "liv-purpose", type: "text", title: "Mer än rätt och fel", body: "Ett språkval kan vara lämpligt i en chatt och mindre lämpligt i ett myndighetsbrev. Därför ska råden beskriva sammanhang, stil och möjliga alternativ." },
      { id: "liv-future", type: "note", label: "På väg", title: "Nästa kapitel skriver vi vidare på", body: "Dialekter, finlandssvenska, etymologi och äldre svenska är tänkta delar av arkivet. De tomma mapparna visar strukturen; de fylls med artiklar efter hand." },
    ],
  },
};
