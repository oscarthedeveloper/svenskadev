/**
 * Modell och granskade data för stegad läsning och källorienterad läsanimation (E32).
 * Skiljer redaktionell läsväg från ristningstillfället enligt Krav K11 och Beslut D04.
 */

export interface ReadingSegmentBox {
  x: number; // Procent från vänster kant (0–100)
  y: number; // Procent från överkant (0–100)
  width: number; // Bredd i procent (0–100)
  height: number; // Höjd i procent (0–100)
}

export type ReadingDirection =
  | 'nerifrån-upp'
  | 'uppifrån-ner'
  | 'vänster-till-höger'
  | 'höger-till-vänster'
  | 'medurs-slinga'
  | 'moturs-slinga';

export interface ReadingSegment {
  id: string;
  order: number;
  label: string;
  readingDirection: ReadingDirection;
  boundingBoxPercent: ReadingSegmentBox;
  transliteration: string;
  normalization: string;
  translation: string;
  isUncertain?: boolean;
  notes?: string;
}

export interface GuidedReadingInscription {
  canonicalSignum: string;
  title: string;
  imageUrl: string;
  sourceVolumeTitle: string;
  plateOrFigure: string;
  editorialRationale: string;
  segments: ReadingSegment[];
}

export const GUIDED_READING_INSCRIPTIONS: Record<string, GuidedReadingInscription> = {
  'Vs 24': {
    canonicalSignum: 'Vs 24',
    title: 'Hassmyrastenen (Odendisa) — Minnesvers på fornyrðislag',
    imageUrl: '/images/runor/vs-24.webp',
    sourceVolumeTitle: 'Västmanlands runinskrifter',
    plateOrFigure: 'Plansch 18',
    editorialRationale:
      'Läsningen följer den yttre rundjurslingan nerifrån och upp längs vänster kant, passerar toppbågen och fortsätter ner längs högra kanten, för att därefter avslutas i den inre korsslingan och ristarsignaturen av Balle den röde.',
    segments: [
      {
        id: 'vs-24-seg-1',
        order: 1,
        label: 'Dedikation (resning efter hustrun Odendis)',
        readingDirection: 'nerifrån-upp',
        boundingBoxPercent: { x: 8, y: 35, width: 28, height: 58 },
        transliteration: 'buonti × kuþr × hulmkoetr × lit × resa × ufteʀ × oþintisu × kunu × seno ×',
        normalization: 'Boandi goðr Holmgautr let ræisa æftiʀ Oðindisu, kunu sina.',
        translation: 'Gode bonden Holmgöt lät resa stenen efter Odendis, sin hustru.',
        isUncertain: false,
        notes: 'Vänstra ytterkanten börjar vid djurets stjärt och stiger uppåt.',
      },
      {
        id: 'vs-24-seg-2',
        order: 2,
        label: 'Minnesdikten (Husfrun på Hassmyra)',
        readingDirection: 'uppifrån-ner',
        boundingBoxPercent: { x: 55, y: 15, width: 38, height: 72 },
        transliteration: 'kumbr × hifrya × til × hasmuimura × iki betr × þon × byi raþr',
        normalization: 'Kumbʀ hifrøya til Hasumyra æigi bætri, þan byi raðr.',
        translation: 'Det kommer icke till Hassmyra en bättre husfru, som råder för gården.',
        isUncertain: false,
        notes: 'Högklassig fornvästmanländsk allitteration på versmåttet fornyrðislag.',
      },
      {
        id: 'vs-24-seg-3',
        order: 3,
        label: 'Ristarsignatur (Balle den röde)',
        readingDirection: 'medurs-slinga',
        boundingBoxPercent: { x: 30, y: 22, width: 42, height: 42 },
        transliteration: 'roþbalir × risti × runi × þisa ×',
        normalization: 'Rauð-Balliʀ risti runiʀ þessaʀ.',
        translation: 'Balle den röde ristade dessa runor.',
        isUncertain: false,
        notes: 'Inre slinga strax under rundjurets nackbåge.',
      },
      {
        id: 'vs-24-seg-4',
        order: 4,
        label: 'Slutrad och förbön (delvis skadad)',
        readingDirection: 'vänster-till-höger',
        boundingBoxPercent: { x: 26, y: 72, width: 48, height: 22 },
        transliteration: 'sikmuntaʀ × uaʀ … sestʀ × kuþ',
        normalization: 'Sigmundaʀ vaʀ [Oðindisa] systiʀ goð.',
        translation: 'Sigmunds goda syster var Odendisa.',
        isUncertain: true,
        notes: 'Vittrade runor längst ned mot basen; klammer markerar osäker/rekonstruerad läsning.',
      },
    ],
  },

  'Sö 179': {
    canonicalSignum: 'Sö 179',
    title: 'Gripsholmsstenen — Ingvarsstenen med versen om örnens föda',
    imageUrl: '/images/runor/so-179.webp',
    sourceVolumeTitle: 'Södermanlands runinskrifter',
    plateOrFigure: 'Plansch s. 153',
    editorialRationale:
      'Läsningen börjar vid rundjurets huvud på vänstra sidan, följer slingan uppåt över krönet och fortsätter ner mot höger, där versen om Ingvarståget till Särkland tar vid.',
    segments: [
      {
        id: 'so-179-seg-1',
        order: 1,
        label: 'Inledning (Modern Tolas resning efter Harald)',
        readingDirection: 'nerifrån-upp',
        boundingBoxPercent: { x: 10, y: 28, width: 28, height: 65 },
        transliteration: '× tula : lit : raisa : stain : þinsa : at : sun : sin : haralt : bruþur : inkuars :',
        normalization: 'Tola let ræisa stæin þennsa at sun sinn Harald, broður Ingvars.',
        translation: 'Tola lät resa denna sten efter sin son Harald, Ingvars broder.',
        isUncertain: false,
        notes: 'Börjar vid djurhuvudets gap på vänstra sidan och löper uppåt.',
      },
      {
        id: 'so-179-seg-2',
        order: 2,
        label: 'Vikingatåget österut (Guldjakten)',
        readingDirection: 'medurs-slinga',
        boundingBoxPercent: { x: 28, y: 8, width: 48, height: 28 },
        transliteration: 'þaiʀ furu : trikila : fiari : at : kuli :',
        normalization: 'Þæiʀ foru drængila fiarri at gulli',
        translation: 'De foro manligen fjärran efter guld',
        isUncertain: false,
        notes: 'Toppbågen över det centrala korset.',
      },
      {
        id: 'so-179-seg-3',
        order: 3,
        label: 'Skaldedikten (Örnen gåvo föda)',
        readingDirection: 'uppifrån-ner',
        boundingBoxPercent: { x: 62, y: 32, width: 30, height: 42 },
        transliteration: 'auk : a:ustarla : ar:ni : kafu :',
        normalization: 'ok austarla ærni gafu,',
        translation: 'och österut gåvo örnen föda.',
        isUncertain: false,
        notes: 'Känd kenning: att ge örnen mat betydde att fälla fiender i strid.',
      },
      {
        id: 'so-179-seg-4',
        order: 4,
        label: 'Slutraden (Döden i Särkland)',
        readingDirection: 'uppifrån-ner',
        boundingBoxPercent: { x: 60, y: 70, width: 32, height: 25 },
        transliteration: 'tuu : sunar:la : a sirk:lan:ti',
        normalization: 'dou sunnarla a Særklandi.',
        translation: 'De dogo söderut i Särkland.',
        isUncertain: false,
        notes: 'Särkland syftar på det abbasidiska kalifatets länder kring Kaspiska havet.',
      },
    ],
  },

  'Öl 1': {
    canonicalSignum: 'Öl 1',
    title: 'Karlevistenen — Nordens äldsta bevarade dróttkvætt-strof',
    imageUrl: '/images/runor/ol-1.webp',
    sourceVolumeTitle: 'Ölands runinskrifter',
    plateOrFigure: 'Plansch s. 15',
    editorialRationale:
      'Inskriften på Karlevistenen löper i vertikala band runt den grova kalkstenen. Först läses prosainledningen, därefter den berömda skaldestrofen till minne av den danske hövdingen Sibbe gode.',
    segments: [
      {
        id: 'ol-1-seg-1',
        order: 1,
        label: 'Prosainledning (Följets minnesmärke över Sibbe)',
        readingDirection: 'uppifrån-ner',
        boundingBoxPercent: { x: 12, y: 15, width: 28, height: 75 },
        transliteration: '+ s-a… --(s)- i(a)s · satr · aiftir · si(b)(a) · kuþa · sun · fultars · in hons ·· liþi · sati · at · u · -ausa-þ-…',
        normalization: 'S[t]e[inn] [þe]ss[i] er settr eptir Sibba Góða/Goða, son Foldars, en hans liði setti at … …',
        translation: 'Stenen är rest efter Sibbe den gode, Foldars son, och hans följe satte detta minnesmärke.',
        isUncertain: true,
        notes: 'Inledande runor delvis skadade av väder och vind vid Kalmarsund.',
      },
      {
        id: 'ol-1-seg-2',
        order: 2,
        label: 'Dróttkvætt: Halvstrof 1 (Dold ligger stridernas träd)',
        readingDirection: 'uppifrån-ner',
        boundingBoxPercent: { x: 40, y: 12, width: 26, height: 78 },
        transliteration: '+: fulkin : likr : hins : fulkþu : flaistr (:)· uisi · þat · maistar · taiþir : tulka · þruþar : traukr : i : þaimsi · huki ·',
        normalization: 'Folginn liggr hinns fylgðu, flestr vissi þat, mestar dæðir dolga Þrúðar draugr í þessu haugi;',
        translation: 'Dold ligger den som de största dåd följde — det visste de flesta — stridernas träd i denna hög.',
        isUncertain: false,
        notes: 'Klassisk skaldemetrik med sträng stavrim och inre rim (hendingar).',
      },
      {
        id: 'ol-1-seg-3',
        order: 3,
        label: 'Dróttkvætt: Halvstrof 2 (Danmarks rättrådigaste stridsman)',
        readingDirection: 'uppifrån-ner',
        boundingBoxPercent: { x: 66, y: 14, width: 26, height: 76 },
        transliteration: 'munat : raiþ:uiþur : raþa : ruk:starkr · i · tanmarku : --ntils : iarmun··kruntar : urkrontari : lonti',
        normalization: 'munat Reið-Viðurr ráða rógstarkr í Danmǫrku [E]ndils jǫrmungrundar ørgrandari landi.',
        translation: 'Ingen rättrådigare stridsman på den väldiga havsgudens mark skall härska över land i Danmark.',
        isUncertain: false,
        notes: 'Hänsyftar till Sibbes makt och anseende i det samtida Danmark under Sven Tveskäggs tid.',
      },
    ],
  },

  'U 73': {
    canonicalSignum: 'U 73',
    title: 'Hansta (U 73) — Greklandsfararstenen och tvillingstenarna',
    imageUrl: '/images/runor/u-73.webp',
    sourceVolumeTitle: 'Upplands runinskrifter',
    plateOrFigure: 'Plansch s. 101',
    editorialRationale:
      'Läsningen följer den yttre rundjursslingan från nedre vänstra sidan, upp över toppen och ner på högra sidan där det tragiska beskedet om sönernas död i Bysans (Grikkland) återges.',
    segments: [
      {
        id: 'u-73-seg-1',
        order: 1,
        label: 'Inledning (Ingegärds minnesmärke över sönerna)',
        readingDirection: 'nerifrån-upp',
        boundingBoxPercent: { x: 12, y: 25, width: 30, height: 68 },
        transliteration: 'þisun · merki · iru · gar · eftʀ · suni · ikikara ·',
        normalization: 'Þessun mærki eʀu gær æftiʀ syni Ingigærðaʀ.',
        translation: 'Dessa minnesmärken äro gjorda efter Ingegärds söner.',
        isUncertain: false,
        notes: 'Hänvisar i plural ("dessa minnesmärken") till parstenen U 72 som restes samtidigt.',
      },
      {
        id: 'u-73-seg-2',
        order: 2,
        label: 'Arv och fördelning',
        readingDirection: 'medurs-slinga',
        boundingBoxPercent: { x: 30, y: 10, width: 44, height: 35 },
        transliteration: 'hon · ati · suni · tba ·',
        normalization: 'Hon atti syni tva...',
        translation: 'Hon hade två söner...',
        isUncertain: false,
        notes: 'Toppdelen av runormen.',
      },
      {
        id: 'u-73-seg-3',
        order: 3,
        label: 'Döden i Bysans (De dogo i Grekland)',
        readingDirection: 'uppifrån-ner',
        boundingBoxPercent: { x: 58, y: 35, width: 30, height: 58 },
        transliteration: 'þaiʀ · to · i · kirikium',
        normalization: 'Þæiʀ dou i Grikkium.',
        translation: 'De dogo i Grekland.',
        isUncertain: false,
        notes: 'Grikkland avsåg hela det bysantinska riket där nordmän tog värvning i väringagardet.',
      },
    ],
  },
};

/**
 * Hämtar guidad läsning för ett visst signum om sådan finns publicerad.
 */
export function getGuidedReadingForSignum(signum: string): GuidedReadingInscription | null {
  return GUIDED_READING_INSCRIPTIONS[signum] || null;
}
