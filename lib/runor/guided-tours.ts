/**
 * Källbundna tematiska guidningar (E33 / Krav K11).
 * Ger besökaren en pedagogisk berättelse med kontrollerad stegning mellan verkliga källor.
 */

export interface GuidedTourStep {
  stepNumber: number;
  canonicalSignum: string;
  slug: string;
  title: string;
  historicalContext: string;
  sourceCitation: string;
  recommendedZoom?: number;
}

export interface GuidedTour {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  theme: 'historia' | 'sprak' | 'samhalle';
  coverSignum: string;
  steps: GuidedTourStep[];
}

export const GUIDED_TOURS: GuidedTour[] = [
  {
    id: 'ingvarstaget',
    title: 'Ingvarståget i runskriften',
    subtitle: 'Vikingatåget österut till Särkland ca 1036–1041',
    description:
      'Följ de gripande minnesmärkena över nordmännen som följde Ingvar den vittfarne på hans ödesdigra expedition österut i det abbasidiska kalifatets gränstrakter.',
    theme: 'historia',
    coverSignum: 'Sö 179',
    steps: [
      {
        stepNumber: 1,
        canonicalSignum: 'Sö 179',
        slug: 'so-179',
        title: 'Gripsholmsstenen — Harald dog i Särkland',
        historicalContext:
          'Modern Tola reste denna sten vid Gripsholm till minne av sin son Harald, Ingvars broder. Skaldedikten på fornyrðislag berättar: "De foro manligen fjärran efter guld och österut gåvo örnen föda. De dogo söderut i Särkland."',
        sourceCitation: 'Södermanlands runinskrifter (SRI bd 3), s. 153–158.',
        recommendedZoom: 13,
      },
      {
        stepNumber: 2,
        canonicalSignum: 'U 112A',
        slug: 'u-112a',
        title: 'Kyrkstigen i Ed — Ragnvald i Grekland',
        historicalContext:
          'I samma Mälardalsmiljö reste Ragnvald minnesmärket över sin moder Fastvi. Ragnvald berättar stolt att han tjänat i österled: "Han var i Grekland, var truppens ledare."',
        sourceCitation: 'Upplands runinskrifter (SRI bd 6), s. 160–166.',
        recommendedZoom: 13,
      },
      {
        stepNumber: 3,
        canonicalSignum: 'Vs 24',
        slug: 'vs-24',
        title: 'Hassmyrastenen — Mälardalens runkonst under samtiden',
        historicalContext:
          'Under samma årtionden som Ingvarsstenarna restes verkade runmästaren Balle den röde i Västmanland och Uppland. Hans ristning i Fläckebo visar den höga formkänsla och verskonst som präglade tiden.',
        sourceCitation: 'Västmanlands runinskrifter (SRI bd 13), s. 69–76.',
        recommendedZoom: 13,
      },
    ],
  },

  {
    id: 'kvinnor-och-makt',
    title: 'Vikingatida kvinnor, makt & minne',
    subtitle: 'Godsägare, mödrar och skaldediktade husfruar',
    description:
      'Runstenarna ger unika samtida vittnesmål om kvinnors ställning som självständiga beställare, arvingar och centralgestalter i 1000-talets samhälle.',
    theme: 'samhalle',
    coverSignum: 'Vs 24',
    steps: [
      {
        stepNumber: 1,
        canonicalSignum: 'Vs 24',
        slug: 'vs-24',
        title: 'Husfrun Odendisa på Hassmyra',
        historicalContext:
          'Bonden Holmgöt hedrade sin hustru med en av runtidens vackraste verser: "Det kommer icke till Hassmyra en bättre husfru, som råder för gården." Ristningen visar kvinnans centrala roll som förvaltare av gården.',
        sourceCitation: 'Västmanlands runinskrifter (SRI bd 13), s. 69–76.',
        recommendedZoom: 13,
      },
      {
        stepNumber: 2,
        canonicalSignum: 'Sö 179',
        slug: 'so-179',
        title: 'Tolas ensamma minnesresning',
        historicalContext:
          'Vid Gripsholm står Tola ensam som beställare av ett av Sveriges mest berömda monument. Ingen make eller medbeställare nämns; Tola förfogade självständigt över de medel som krävdes för att anlita en förnäm runristare.',
        sourceCitation: 'Södermanlands runinskrifter (SRI bd 3), s. 153–158.',
        recommendedZoom: 13,
      },
      {
        stepNumber: 3,
        canonicalSignum: 'U 73',
        slug: 'u-73',
        title: 'Ingegärds tvillingstenar i Hansta',
        historicalContext:
          'Ingegärd i Spånga lät resa två monumentala stenar (U 72 och U 73) efter sina båda söner som föll i Bysans. Stenarna reglerar även arvsfrågan och säkrar moderns minne och rätt.',
        sourceCitation: 'Upplands runinskrifter (SRI bd 6), s. 99–104.',
        recommendedZoom: 13,
      },
      {
        stepNumber: 4,
        canonicalSignum: 'Sö 101',
        slug: 'so-101',
        title: 'Sigrid och Ramsundsristningen',
        historicalContext:
          'Sigrid, Holmgers moder och Alriks hustru, lät bygga Ramsundsbron och hugga den magnifika Sigurdsristningen till minne av sin make. En monumental ingenjörs- och kulturgärning.',
        sourceCitation: 'Södermanlands runinskrifter (SRI bd 3), s. 70–76.',
        recommendedZoom: 13,
      },
    ],
  },

  {
    id: 'runmastare-och-metrik',
    title: 'Runmästare & Skaldemetrik',
    subtitle: 'Från Rökstenens fornyrðislag till Balles elegans',
    description:
      'Följ runskriftens konstnärliga och språkliga utveckling från 800-talets gåtfulla fornspråk till 1000-talets mästarristare och avancerade versmått.',
    theme: 'sprak',
    coverSignum: 'Ög 136',
    steps: [
      {
        stepNumber: 1,
        canonicalSignum: 'Ög 136',
        slug: 'og-136',
        title: 'Rökstenen — Varin och fornspråket',
        historicalContext:
          'Östergötlands stolthet: Varin ristade över 700 runor till minne av sonen Vemod ca 800–850 e.Kr. Texten innehåller fornyrðislag, gåtfulla kenningar och Nordens tidigaste bevarade litterära storverk.',
        sourceCitation: 'Östergötlands runinskrifter (SRI bd 2), s. 227–248.',
        recommendedZoom: 13,
      },
      {
        stepNumber: 2,
        canonicalSignum: 'Öl 1',
        slug: 'ol-1',
        title: 'Karlevistenen — Dróttkvætt vid Kalmarsund',
        historicalContext:
          'Ca år 1000 ristade ett danskt vikingafölje Nordens äldsta bevarade dróttkvætt-strof på Karlevi strand till minne av Sibbe gode. Den metriska finessen med inre rim och stavrim är oöverträffad.',
        sourceCitation: 'Ölands runinskrifter (SRI bd 1), s. 15–24.',
        recommendedZoom: 13,
      },
      {
        stepNumber: 3,
        canonicalSignum: 'Vs 24',
        slug: 'vs-24',
        title: 'Balle den röde — Signerad skaldedikt',
        historicalContext:
          'Runmästaren Balle (Rauð-Balliʀ) signerar stolt sitt verk på Hassmyrastenen efter att ha sammanfogat minnesdikt, ormslingor och kors till en harmonisk helhet.',
        sourceCitation: 'Västmanlands runinskrifter (SRI bd 13), s. 69–76.',
        recommendedZoom: 13,
      },
    ],
  },
];

export function getAllGuidedTours(): GuidedTour[] {
  return GUIDED_TOURS;
}

export function getGuidedTourById(id: string): GuidedTour | null {
  return GUIDED_TOURS.find((t) => t.id === id) || null;
}
