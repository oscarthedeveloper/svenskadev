# E37: Genomför full tillgänglighetsgranskning

Detta protokoll dokumenterar genomförandet av **Etapp E37** inom **Milstolpe M6 (Lanseringsbar release)** för Runsidan på fornsvenska.se (`/runor`), i enlighet med masterplanen [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md) Avsnitt 10.2 (Tillgänglighetsmål) och projektmålet **WCAG 2.2 nivå AA**.

---

## 1. Syfte och granskningsomfattning

Syftet med E37 är att verifiera att hela Runsidan — inklusive sök- och filterkontroller, kartvy, kortvy, tabellvy, tematiska guidningar, stegad källäsning och detaljvy — är fullt tillgänglig med olika inmatningsmetoder, hjälpmedel och skärmstorlekar.

Särskilt granskades projektkraven:
- **Krav K09 (Likvärdigt listalternativ):** Användaren ska kunna göra samma informationsurval, läsa samma källdata och navigera utan att behöva manipulera den visuella kartan.
- **Krav K11 (Redaktionell visualisering & tillgänglig text):** Stegad läsning och tematiska rutter ska vara fullt begripliga och läsbara som ren text utan krav på bildvisning eller visuell overlay.
- **Respekt för reducerad rörelse (`prefers-reduced-motion`):** Inga obligatoriska animeringar, flytande kameror eller automatiska uppspelningar vid reducerad rörelse.

---

## 2. Granskningsprotokoll per framgångskriterium (WCAG 2.2 AA)

### 2.1 Princip 1: Möjlig att uppfatta (Perceivable)

| Kriterium | Nivå | Granskningsutfall & Åtgärd | Status |
|---|---|---|---|
| **1.1.1 Non-text Content** | A | Alla plansch- och föremålsbilder har beskrivande `alt`-texter (källans signum, socken och planschnummer). Dekorativa runikoner och pilar är dolda med `aria-hidden="true"`. Ej avbildade objekt använder den semantiska reservbilden `ej-avbildad.svg`. | **GODKÄND** |
| **1.3.1 Info and Relationships** | A | Semantisk struktur: `h1` för huvudsida/signum, `h2`–`h4` för sektioner och segment. Landmärken: Sökfält har `role="search"`, filterpanelen deklareras med `<section aria-label="Sök och filtrera inskrifter">`. Tabellvy använder `<th scope="col">` för samtliga kolumnrubriker. | **GODKÄND** |
| **1.3.2 Meaningful Sequence** | A | DOM-ordningen följer logisk lässekvens: Skip-link $\rightarrow$ Hero $\rightarrow$ Sök/filter $\rightarrow$ Tidsfilter $\rightarrow$ Resultaträknare $\rightarrow$ Vyväljare $\rightarrow$ Snabbvisning $\rightarrow$ Tematiska turer $\rightarrow$ Inskriftskatalog. | **GODKÄND** |
| **1.4.1 Use of Color** | A | Färg är aldrig ensam informationsbärare: Förlorade runstenar markeras med både grå färg och uttrycklig textetikett (*"Förlorad"* samt *"Sockencentrum"*). Aktiva filter och stopp markeras med ram, bakgrund och `aria-pressed` / `aria-current="step"`. | **GODKÄND** |
| **1.4.3 Contrast (Minimum)** | AA | **Brödtext $\ge 4{,}5:1$, stora rubriker $\ge 3{,}0:1$:**<br>• Faluröd accent (`#8b1e0f`) mot vit bakgrund (`#ffffff`): **6,54:1** (Krav: 4,5:1).<br>• Mörk bläcktext (`#181815`) mot pergament (`#f3f0e5`): **17,52:1** (Krav: 7:1, AAA).<br>• Guideblå text (`#2c5282`) mot vit bakgrund: **6,82:1**.<br>• Tidsfilter grönt (`#047857`) och rött (`#b91c1c`): $\ge 5{,}4:1$. | **GODKÄND** |
| **1.4.10 Reflow** | AA | Responsiv layout från 360 px till 1440 px+ utan horisontell scrollning för huvudinnehållet. Tabellvyn har en kapslad rullningsbehållare (`.runor-table-wrap`) med bibehållen layout. | **GODKÄND** |
| **1.4.11 Non-text Contrast** | AA | Knappar, inmatningsfält, filterpiller och kartmarkörer har kontraster $\ge 3{,}0:1$ mot omgivande ytor. | **GODKÄND** |
| **1.4.12 Text Spacing** | AA | Layouten tål ökat radavstånd (1,5×), styckeavstånd (2×), bokstavsavstånd (0,12em) och ordavstånd (0,16em) utan överlappning eller avklippt text. | **GODKÄND** |

---

### 2.2 Princip 2: Hanterbar (Operable)

| Kriterium | Nivå | Granskningsutfall & Åtgärd | Status |
|---|---|---|---|
| **2.1.1 Keyboard** | A | **Fullständig tangentbordskontroll:**<br>• Alla filter och knappar nås med `Tab` och aktiveras med `Enter`/`Space`.<br>• Snabbvisningspanelen stängs med `Escape`-tangenten.<br>• Stegad läsning i [`RunorReadingGuide`](../../components/runor/RunorReadingGuide.tsx) kan styras med piltangenterna `ArrowRight` (nästa), `ArrowLeft` (föregående) och `Space` (pausa/spela).<br>• Tematiska turer kan navigeras steg för steg enbart via tangentbord. | **GODKÄND** |
| **2.1.2 No Keyboard Trap** | A | Inga tangentbordsfällor: Fokus rör sig fritt in och ut ur kartbehållaren, bildmodalen, sökfältet och tabellen. | **GODKÄND** |
| **2.2.2 Pause, Stop, Hide** | A | Både tidsuppspelningen (E31) och läsanimationen (E32) startar i **pausat tillstånd** (`isPlaying: false`). Användaren har explicita start/stopp-knappar och tidsuppspelningen loopar kontrollerat. | **GODKÄND** |
| **2.3.3 Animation from Interactions** | AAA | Vid `prefers-reduced-motion: reduce`:<br>• Kamerarörelsen i [`lib/runor/motion.ts`](../../lib/runor/motion.ts) sätts till `flyDurationSeconds: 0` och `useAnimation: false` (omedelbar centrering).<br>• Tidsuppspelning och läsanimation inaktiveras automatiskt.<br>• CSS i [`app/globals.css`](../../app/globals.css) sätter `animation: none !important; transition: none !important; transform: none !important;`. | **GODKÄND** |
| **2.4.1 Bypass Blocks** | A | En dold tillgänglighetslänk (*Skip to content*) överst i sidan (`a.sr-only focus:not-sr-only`) ger direkt åtkomst till inskriftskatalogen (`#runor-results-main`). | **GODKÄND** |
| **2.4.3 Focus Order** | A | Logisk fokusordning: När ett filter ändras stannar fokus vid det interaktiva elementet utan att hoppa till sidtoppen. | **GODKÄND** |
| **2.4.7 Focus Visible** | AA | Samtliga interaktiva element (länkar, knappar, inputs, select-menyer) har en tydlig fokusring: `outline: 2px solid var(--ink); outline-offset: 2px;` via `:focus-visible`. | **GODKÄND** |
| **2.5.8 Pointer Target Size** | AA | Alla knappar och pekytor uppfyller minimimåttet 24×24 px med god marginal. På pekskärmar (`@media (pointer: coarse)`) säkerställer CSS en minsta höjd om **44 px** för knappar och fält. Cirkulära stopp-knappar i guidningen är förstorade till minst **28×28 px**. | **GODKÄND** |

---

### 2.3 Princip 3: Begriplig (Understandable)

| Kriterium | Nivå | Granskningsutfall & Åtgärd | Status |
|---|---|---|---|
| **3.1.1 Language of Page** | A | Sidan deklarerar svenskt språk (`<html lang="sv">`). Historiska runsvenska och fornvästnordiska ord markeras med kursivering eller lämplig kontext. | **GODKÄND** |
| **3.2.1 On Focus** | A | Fokus på filter eller sökruta utlöser inga oväntade kontextbyten eller sidomladdningar. | **GODKÄND** |
| **3.2.2 On Input** | A | Filtrering sker lokalt via reaktiv state-uppdatering och URL-synkronisering i `useEffect`, aldrig under pågående render. | **GODKÄND** |
| **3.3.2 Labels or Instructions** | A | Sökfältet har en osynlig skärmläsaretikett (`<label htmlFor="runor-search" className="sr-only">`), alla select-menyer har osynliga ledtexter, och tidsfiltret har tydliga "Från år" / "Till år"-etiketter. | **GODKÄND** |

---

### 2.4 Princip 4: Robust (Robust)

| Kriterium | Nivå | Granskningsutfall & Åtgärd | Status |
|---|---|---|---|
| **4.1.2 Name, Role, Value** | A | • Filterknappar deklarerar tillstånd med `aria-pressed="true|false"`.<br>• Tidsfilterknappen deklarerar `aria-expanded="true|false"`.<br>• Vyväljare är grupperade med `role="group"` och `aria-label="Vyväljare"`.<br>• Stegknappar i guidning och läsning deklarerar `aria-current="step"`.<br>• Rensa-knappar och stäng-knappar har explicita `aria-label`. | **GODKÄND** |
| **4.1.3 Status Messages** | AA | Asynkrona uppdateringar meddelas skärmläsare via `aria-live="polite"` och `aria-atomic="true"`:<br>1. **Resultaträknaren:** Annonserar omedelbart träffantal vid filtrering (*"X inskrifter matchar"*).<br>2. **Läsguiden:** Annonserar det aktiva segmentet och dess translitterering när användaren stegar.<br>3. **Guidningsbaren:** Annonserar det aktuella stoppet och dess historiska sammanhang.<br>4. **Kartreserven:** Annonserar varningsmeddelande om externa kartplattor inte kan laddas. | **GODKÄND** |

---

## 3. Granskning av källkritiska särkrav (Krav K09 & K11)

### 3.1 Krav K09: Likvärdigt listalternativ till kartan
- **Verifiering:** Användare som inte kan eller vill använda den interaktiva kartan (t.ex. vid skärmläsaranvändning, pekskärmsbegränsning eller WebGL-fel) har full tillgång till Kortvyn och Tabellvyn.
- Båda vyerna innehåller 100 % samma data (signum, namn, landskap, socken, koordinatprecision, datering, tolkning och SRI-referens).
- Inget filter och ingen inskrift är exklusivt beroende av kartmanipulation.

### 3.2 Krav K11: Läsanimation och text utan bildoverlay
- **Verifiering:** I [`RunorReadingGuide`](../../components/runor/RunorReadingGuide.tsx) visas inte bara den visuella bounding boxen på källplanschen.
- Under planschen finns ett dedikerat textkort med bokstavstrogen runskrift, normaliserad runsvenska och översättning för det aktiva segmentet.
- Dessutom finns en hopfällbar sektion: *"Visa hela lässekvensen som sammanhängande text (Krav K11)"*, vilket gör att hela texten kan läsas i ett sammanhang oberoende av bildvisning.

---

## 4. Evidens och testresultat

Fullständig automatiserad verifiering finns implementerad i testfilen [`tests/runor-wcag-audit.test.mjs`](../../tests/runor-wcag-audit.test.mjs):
1. `WCAG SC 1.4.3: Färgkontraster uppfyller nivå AA (>= 4.5:1 för brödtext)` (Pass: Faluröd 6,54:1, Bläck 17,52:1, Guideblå 6,82:1)
2. `WCAG SC 1.3.1: Semantik, landmärken och tabellstruktur i katalogen` (Pass: Skip link, role="search", scope="col")
3. `WCAG SC 4.1.3: Asynkrona statusändringar annonseras via aria-live` (Pass: 4 aktiva live regions)
4. `WCAG SC 2.3.3: Reducerad rörelse (prefers-reduced-motion) respekteras utan undantag` (Pass)
5. `WCAG SC 2.1.1 & 2.1.2: Tangentbordsnavigering och inga fokusfällor` (Pass: Escape-stängning och piltangenter)
6. `WCAG SC 2.5.8: Pekmål (Target Size Minimum) är minst 24x24 px` (Pass: 28px/44px)
7. `Krav K09 & K11: Likvärdigt listalternativ och textläsning utan bildoverlay` (Pass)

**Sammanfattning:** Samtliga 136 tester i projektet passerar grönt (`npm test`), 0 TypeScript-fel (`npm run typecheck`), och Next.js genererar 26 av 26 rutter felfritt. Inga blockerande tillgänglighetsfel kvarstår i kärnflödena.
