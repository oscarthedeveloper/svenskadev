# E25 — Synkronisera URL, filter, karta och historik

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E25  
**Ansvar**: Frontendutvecklare  
**Beroenden**: E22, E23, E24 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och arkitektur

Etapp E25 garanterar att Runsidans tillstånd (söksträng, landskapsurval, bärartyp, bevarandestatus, tidsintervall, platsläge, vy och vald inskrift) är **100 % synkroniserat med webbläsarens URL**.

Detta uppfyller tre centrala krav:
1. **Delbara URL:er**: En användare eller forskare som delar en länk (t.ex. `/runor?landskap=U&typ=runblock&vy=map&vald=u-73-hansta`) återskapar exakt samma vy, aktiva filter och selekterade inskrift hos mottagaren.
2. **Webbläsarens framåt/bakåt-navigering**: Att trycka på ”Bakåt” (`history.back()`) återställer föregående filter- eller karttillstånd utan oönskade sidomladdningar.
3. **Skonsam historik vid textinmatning**: Pågående textskrivning i sökrutan uppdaterar URL:en med `history.replaceState` (så att varje tangenttryck inte skapar en ny historikpost), medan diskreta användarval (klick på landskap, byte av vy, val av sten på kartan) använder `history.pushState`.

---

## 2. Implementerade moduler och funktioner

### 2.1 URL-tillståndsmotor: [`lib/runor/url-state.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/url-state.ts)
- `parseRunicUrlState(rawParams)`:
  - Tolkar parametrarna `q` (sökfras), `landskap`/`province`, `typ`/`carrier`, `status`, `lage` (`fyndplats` vs `nuvarande`), `kartlage` (`all`, `known`, `missing`), `vy` (`grid`, `table`, `map`), `tid` (`950-1050,okand`), och `vald` (slug).
  - Säker sanering: Okända värden eller felskrivningar degraderas automatiskt till stabila standardvärden utan att krascha gränssnittet.
- `serializeRunicUrlState(state)`:
  - Serialiserar aktivt tillstånd till en minimal query-sträng. Standardvärden utelämnas för att hålla länkarna korta och läsbara.
- `determineHistoryAction(prevState, nextState)`:
  - Returnerar `'replace'` om endast fritextsökningen ändrats, och `'push'` vid alla filter- eller vybyten.

### 2.2 Reaktiv gränssnittssynk: [`components/runor/RunorDirectoryClient.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorDirectoryClient.tsx)
- Synkroniserar lokalt tillstånd med `window.location.search` och hanterar `popstate`-händelser vid användning av webbläsarens framåt/bakåtknappar.
- Race condition-skydd: `querySeqRef` garanterar att asynkrona filtreringar alltid landar i sekventiell ordning.
- **Snabbvisningspanel för vald inskrift (`vald=slug`)**:
  - När en besökare klickar på en markör i kartan eller klickar på ett kort sätts `vald=<slug>` i URL:en.
  - En sidopanel glider upp med ingress, datering, socken, translitterering, svensk tolkning och länk direkt till detaljsidan (`/runor/<slug>`).

---

## 3. Automatiserade tester och verifiering ([`tests/runor-url-state.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-url-state.test.mjs))

Testsviten omfattar 6 deltester:
1. **Tomma parametrar**: Återställer deterministiskt `DEFAULT_RUNIC_URL_STATE` och ger tom querystring.
2. **URLSearchParams-tolkning**: Mappar samtliga filterfält, tidsintervall och slug korrekt.
3. **Alias och råa objekt**: Stöder alternativa parameternamn (`province`, `carrier`, `nuvarande_plats`).
4. **Sanitering av korrupta värden**: Ogiltiga landskap (t.ex. *Atlantis*), bärartyper eller trasiga tidsformat rensas till säkra standardvärden.
5. **Rundgång (Roundtrip)**: `parseRunicUrlState(serializeRunicUrlState(state))` bevarar exakt samma datastruktur utan förvanskning.
6. **Historiklogik**: Verifierar att textskrivning ger `'replace'` och filterbyten ger `'push'`.

Utfall: **81 av 81 tester godkända** i den samlade testsviten (`npm test`). Typecheck och Next.js produktionsbygge slutförs utan fel eller varningar.
