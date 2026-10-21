# E02 — Produktmål, målgrupper och kravbaslinje

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E02  
**Ansvar**: Produktansvarig och redaktör  
**Beroenden**: E00 (slutförd), M0 passerad  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Produktvision och syfte

Målet med **Runsidan** (`/runor`) är att skapa en modern, vetenskapligt tillförlitlig och levande runatlas integrerad i webbplatsen fornsvenska.se.

Besökaren ska kunna:
1. **Upptäcka** runinskrifter via en lugn, responsiv och klustrad Sverigekarta med ortsnamn och tydlig markering av geografisk precision.
2. **Läsa och förstå** inskriften genom strikt åtskilda textlager (translitterering, normaliserad runsvenska/fornsvenska och nusvensk översättning) med pedagogiska förklaringar.
3. **Förstå osäkerhet** i datering, läsning och bevarandestatus (inga påhittade exakta årtal eller rekonstruktioner som presenteras som säkra fakta).
4. **Spåra källan** direkt till tryckt och digitaliserad förlaga i *Sveriges runinskrifter* (SRI), med exakta sid- och planschhänvisningar samt externa permanenta URI:er (RAÄ/Runor).

Täckning betyder **granskade och publicerade poster**, aldrig ett löfte om att alla runor i Sverige är digitaliserade enbart för att PDF-arkivet har hämtats. Ingen tidsmässig begränsning (t.ex. till klassisk fornsvenska 1225–1526) tillämpas: materialet spänner över urnordiska, vikingatida och medeltida inskrifter.

---

## 2. Målgrupper och användarresor

### Användarresa 1: Den allmänintresserade / nybörjaren
- **Mål**: Hitta en runsten i sin närhet (t.ex. i Uppland eller på Öland), förstå vad som står på den och vem som lät rista den.
- **Flöde**:
  1. Öppnar `/runor` i mobil eller webbläsare.
  2. Klickar på ett landskap eller zoomar in på kartan till sitt närområde.
  3. Klickar på en markör eller träff i listan (t.ex. *Karlevistenen Öl 1*).
  4. Läser en tillgänglig introduktion, ser en bild eller teckning från förlagan och läser översättningen till modern svenska.
  5. Förstår att stenen restes till minne av en hövding (Sibbe) och ser att dateringen är ca 1000-tal utan falsk precision.

### Användarresa 2: Den språk- och historointresserade
- **Mål**: Fördjupa sig i ordförråd, runformer, syntax och dialektala drag.
- **Flöde**:
  1. Söker på ett specifikt ord eller formel (t.ex. *let ræisa stæin* / *bropur sin*).
  2. Jämför translittereringen tecken för tecken mot den normaliserade runsvenska texten.
  3. Ser alternativa tolkningar och källnoter om svårlästa runor (skador, bindrunor, lakuner).
  4. Klickar på länkade termer i ordboken eller grammatikartiklar på sajten.

### Användarresa 3: Forskaren och källäsaren
- **Mål**: Kontrollera ett påstående, finna originalsignum, undersöka tidigare tolkningar och öppna rätt PDF- och trycksida i SRI.
- **Flöde**:
  1. Söker på signum (t.ex. `U 112`, `Ög 136`, `Öl 1`) eller litteraturalias.
  2. Får omedelbart träff med bevarad identitet och källhänvisning.
  3. Ser exakt källvolym (SRI band, del, författare, tryckår), tryckt sidnummer, PDF-sidnummer samt plansch- och figurnummer.
  4. Kan med ett klick öppna källan eller kopiera en permanent delbar länk (`/runor/ol-1`).

---

## 3. Omfattningsavgränsning (In-scope vs. Out-of-scope)

### In-scope för Runsidan
- Responsiv kartvy med klustring, baserad på GeoJSON med verifierade koordinater.
- Fullständig källkedja till SRI:s publicerade volymer (129 PDF-dokument).
- Åtskilda fält för:
  - Fysisk bärare och bevarandestatus (sten, block, häll, fragment, förlorad).
  - Fyndplats kontra nuvarande placering (med angiven precision: exakt, sockenmittpunkt, okänd).
  - Datering som källans intervall (t.ex. "ca 980–1015", "vikingatid", "okänd").
  - Translitterering, normalisering och översättning.
- Delbara URL:er med synkroniserad tillståndsmaskin för filter och karta.
- Full tillgänglighet enligt WCAG 2.2 AA (tangentbordsfokus, skärmläsarstöd, fungerande listreserv utan WebGL).

### Out-of-scope (Utanför avgränsningen)
- **Inga påhittade eller fabricerade koordinater**: Saknas koordinater visas posten i listan och markeras med "saknar verifierat kartläge".
- **Ingen automatisk OCR-publicering**: Råtext från OCR får aldrig publiceras som förlagans auktoritativa läsning utan manuell sakgranskning.
- **Inga syntetiska AI-röster som autentiskt fornspråk**: Eventuella uttal i framtida etapper ska baseras på vetenskapligt belagda rekonstruktioner och uttryckligen märkas som sådana.
- **Ingen fullständig täckning som förutsättning**: Webbplatsen lovar inte att Sveriges samtliga ca 4 000 runinskrifter ingår i lanseringen; publicering sker i granskade delbestånd med öppen redovisning av urvalet.

---

## 4. Kravbaslinje (K01–K16) och verifieringsmetoder

| Krav-ID | Kravbeskrivning | Verifieringsmetod | Acceptance criteria |
| :--- | :--- | :--- | :--- |
| **K01** | Stabil identitet och dokumenterad källa | Automatiserat schema-test (`lib/runor/validation.ts`) | Varje post har unikt internt ID, originalsignum och källreferens. |
| **K02** | Spårbarhet till sida, figur och extern URI | Automatiserad korsvalidering mot `nedladdningsmanifest.json` | PDF-sida inom intervall, tryckt sida angiven, giltig URI. |
| **K03** | Åtskillnad mellan fyndplats och nuvarande plats | Datamodelltest och GIS-validering | Skilda fält för `findingPlace` och `currentLocation`; koordinater märkta med precision. |
| **K04** | Dateringsintervall utan falsk precision | Schematest för dateringsstruktur | Tillåter breda tidsspann (`earliestYear`, `latestYear`) samt `periodLabel`; inga fiktiva exakta år. |
| **K05** | Tydlig språkangivelse för textlager | Validering av textversionsobjekt | `language` specificerat (`urnordiska`, `runsvenska`, `fornsvenska`, `nusvenska`). |
| **K06** | Sammanhängande användarresa (Hitta → Välj → Läs → Tillbaka) | E2E- och manuella användarflödestester | Alla steg fungerar utan avbrott eller tappat urval. |
| **K07** | Synkroniserat urval mellan karta, lista och URL | State-maskintest och URL-parser | Ändring i karta uppdaterar URL och lista; bakåtknapp återställer state. |
| **K08** | Mobilanpassning och fullgod listreserv | Responsivitetstest och rendering utan WebGL | Kartan kan döljas/ersättas av tillgänglig lista; inga scroll-fällor på mobil. |
| **K09** | Rättighets- och källredovisning för bilder och text | Automatiserad källgranskning | Varje bildpost har licens/upphovsman angiven; ingen otillåten distribution. |
| **K10** | Mjuka kamerarörelser och respekt för `prefers-reduced-motion` | CSS- och JS-animationstest | Animationer stängs av eller förenklas vid användarens preferens. |
| **K11** | Källbundna lässegment utan automatisk animation | Manuell och visuell källkontroll | Bildkoordinater för runsegment matchar originalplanschens linjer. |
| **K12** | Återupprepningsbar import utan tyst dataförlust | Migrations- och idempotens-tester | Omläsning av data skriver inte över redaktionella rättelser tyst. |
| **K13** | Serverkontroll och skrivskydd | RLS-tester och Next.js route-tester | Anonyma läsare kan endast läsa publicerade poster; skrivning kräver admin. |
| **K14** | Prestandabudget | Lighthouse / Web Vitals mätning | Mobil LCP < 2,5 s; payloads för GeoJSON optimerade via klustring. |
| **K15** | Kompatibilitet med befintlig sajt | `npm test` och `validate:kallor` | Befintliga moduler (Språkliv, grammatik, ordbok) påverkas inte negativt. |
| **K16** | Täckningsredovisning och återställningsbarhet | Releaseverifiering och versionsmanifest | Publiceringsdatum och antal granskade poster visas öppet i sidfoten. |

---

## 5. Slutsats och beslut för E02

Produktmålen, användarresorna, omfattningsavgränsningarna och kravmatrisen K01–K16 är nu formellt fastställda.

Etapp E02 kvitteras härmed som **KLAR**.
