# E22 — Bygg serverrenderade routes och listreserv

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E22  
**Ansvar**: Frontendutvecklare  
**Beroenden**: E18, E20, E21 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och arkitektur

Etapp E22 implementerar serverrenderade rutter för `/runor` och `/runor/[slug]`, kopplade mot databaslagringen och publiceringsfiltret från E20 och E21. Syftet är att göra runsidan fullt användbar, indexerbar och delbar även utan interaktiv karta eller WebGL.

Huvudprinciper:
1. **Oberoende direktlänkar**: En länk till `/runor/ol-1` eller `/runor/u-73` fungerar direkt i en ny flik utan att besökaren först måste ha laddat kartan eller etablerat ett klienttillstånd.
2. **Källmedvetna metadata**: Varje enskild inskriftssida har unika HTML-titlar, OpenGraph- och Twitter-kort, samt metabeskrivningar som sammanfattar socken, härad, datering, förlaga i *Sveriges runinskrifter* och ett utdrag av tolkningen.
3. **Tillgänglig listreserv**: En fullständig semantisk HTML-katalog (`RunorServerListReserve`) renderas på servern (tillgänglig i `<noscript>`-fall och för sökmotorer), vilket möjliggör textläsning i Lynx/curl/skärmläsare utan JavaScript.
4. **Kanonisk alias- och signumomdirigering**: Sidor som anropas med alternativa signumformer (t.ex. `U 73` istället för `u-73`) eller traditionella namn (t.ex. `Karlevistenen`) omdirigeras säkert via HTTP till den officiella kanoniska adressen.
5. **Skrivskydd och utkastisolering**: Okända objekt eller opublicerade utkast kastar strikt `notFound()` för anonyma besökare.
6. **Strukturerad data (JSON-LD)**: Varje inskriftssida injicerar Schema.org `VisualArtwork` med `spatialCoverage`, `GeoCoordinates`, `temporalCoverage` och SRI-citat.

---

## 2. Implementerade filer och komponenter

### 2.1 Huvudsida för runor: [`app/runor/page.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/runor/page.tsx)
- Serverkomponent som asynkront hämtar det publicerade runbeståndet via `getRunicCorpusState()`.
- Tillhandahåller kanonisk metadata och OpenGraph för `/runor`.
- Renderar den interaktiva klientkatalogen ([`RunorDirectoryClient`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorDirectoryClient.tsx)) tillsammans med den serverrenderade listreserven ([`RunorServerListReserve`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorServerListReserve.tsx)) inom `<noscript>`.

### 2.2 Enskild inskriftssida: [`app/runor/[slug]/page.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/runor/%5Bslug%5D/page.tsx)
- `generateStaticParams()`: Genererar statiska vägar för samtliga 20 godkända pilotinskrifter.
- `generateMetadata()`: Skapar dynamisk metadata baserad på källuppgifterna.
- Anropar `resolveRunicSlug()`:
  - Vid exakt kanonisk slug: Visar sidan och injicerar Schema.org JSON-LD samt navigationspilar (föregående/nästa) inom korpusen.
  - Vid alias/alternativ form: Omdirigerar via Next.js `redirect()` till den kanoniska adressen.
  - Vid okänd slug eller utkast: Kastar Next.js `notFound()`.

### 2.3 Rutt- och metadatalogik: [`lib/runor/routes.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/routes.ts)
- `resolveRunicSlug(slug, inscriptions)`: Pure TypeScript-funktion för deterministisk och testbar slug- och aliasuppslagning.
- `generateRunicMetadata(slug, inscriptions)`: Genererar OpenGraph-, Twitter- och kanoniska länkobjekt.
- `generateRunicStructuredData(inscription)`: Skapar Schema.org JSON-LD-representation.

### 2.4 Serverrenderad listreserv: [`components/runor/RunorServerListReserve.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorServerListReserve.tsx)
- Semantisk `<ol>`-lista över alla 20 inskrifter.
- Innehåller länkar till kanonisk sida, signum, namn, socken, landskap, datering, källhänvisning till SRI och svensk tolkning.

### 2.5 Felsidor och 404:
- [`app/runor/not-found.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/runor/not-found.tsx): Dedikerad 404-sida med runologisk estetik och tydlig tillbakalänk till `/runor`.
- [`app/runor/error.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/runor/error.tsx): Felgräns (Error Boundary) med "Försök igen"-knapp.

---

## 3. Automatiserade tester och verifiering ([`tests/runor-routes.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-routes.test.mjs))

Testsviten omfattar 8 specifika deltester för kraven i Avsnitt 4 i genomförandeplanen:

```text
✔ E22: generateStaticParams genererar alla 20 kanoniska slugs (0.8 ms)
✔ E22: generateRunicMetadata skapar unika titlar, delbar OpenGraph och källmedvetna metabeskrivningar (0.3 ms)
✔ E22: Direktlänk fungerar oberoende i ny flik utan tidigare kartstate (0.1 ms)
✔ E22: Okänt objekt returnerar not_found (leder till notFound()) (0.1 ms)
✔ E22: Utkast är inte åtkomliga via publika rutter för anonyma besökare (0.1 ms)
✔ E22: Uppslagning hanterar alternativa signumformat och alias med redirect (0.1 ms)
✔ E22: Schema.org JSON-LD genererar fullständig semantisk metadata (0.1 ms)
✔ E22: Serverrenderad listreserv finns och innehåller alla nödvändiga fält (6.2 ms)
```

Bygg- och typtester:
- **`npm test`**: **60/60 tester passerar grönt (100 %)**.
- **`npm run typecheck`**: **0 fel**.
- **`npm run build`**: **26/26 statiska sidor och API-rutter genererade på 1,3 s**.

---

## 4. Uppfyllda godkännandekrav

| Krav enligt RUNSIDA_PLAN.md | Utfall | Evidens |
|---|---|---|
| En direktlänk fungerar i ny flik utan tidigare kartstate | **UPPFYLLT** | Test 3: Oberoende uppslagning av U 73 via kanonisk URL i ren kontext. |
| Okänt objekt ger 404 | **UPPFYLLT** | Test 4: Okänd slug ger `not_found` och utlöser Next.js `notFound()`. |
| Utkast blir inte publikt via alternativ URL | **UPPFYLLT** | Test 5: Strikt filtrering av utkast för publika läsare; okända utkast ger 404. |
| Listan förblir användbar utan WebGL och kräver inte stora PDF:er i bygget | **UPPFYLLT** | Test 8: `RunorServerListReserve` levererar alla 20 inskrifter och SRI-citat i ren HTML. |
| Unik titel och källmedveten metabeskrivning | **UPPFYLLT** | Test 2: Innehåller signum, socken, landskap, SRI-förlaga och tolkning. |

---

## 5. Slutsats

Etapp **E22** är härmed fullständigt genomförd, verifierad och **GODKÄND**.
