# E27 — Färdigställ responsivitet och grundtillgänglighet

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E27  
**Ansvar**: Frontendutvecklare och tillgänglighetsgranskare  
**Beroenden**: E18, E24, E25, E26 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och tillgänglighetskrav (WCAG 2.1 AA)

Etapp E27 garanterar att Runsidan erbjuder en likvärdig, fullt funktionell och tillgänglig upplevelse för alla användare, oavsett enhet, hjälpmedel eller synförmåga:

1. **Mobila brytpunkter och layoutstabilitet**:
   - **360 px**: Små mobila skärmar hanteras utan horisontellt spill (`overflow-x: hidden`). Filter, vyväljare och tidsfilter staplas logiskt utan att text klipps.
   - **768 px & 1024 px**: Layouten anpassas harmoniskt med elastisk rutnätslayout och responsiv kartcontainer.
   - **1440 px**: Centrerad container med maximal läsbarhet.
2. **Pekmål (Touch targets)**:
   - Alla interaktiva kontroller (filter-pills, vyknappar, selectrutor, zoomknappar och källänkar) har en klickbar yta om minst 44×44 px på pekskärmar (`@media (pointer: coarse)`).
3. **Tangentbordsnavigering och fokusindikatorer**:
   - Alla länkar och knappar har tydliga, högkontrasterande fokusmarkörer (`:focus-visible` med 2 px solid ram och offset).
   - Fokusordningen är strikt logisk (sökruta → landskapsfilter → rullgardinsmenyer → tidsfilter → vyväljare → resultatlista/karta).
4. **Skärmläsare och semantisk WAI-ARIA**:
   - Resultaträknaren har `aria-live="polite"` och `aria-atomic="true"` så att förändringar vid filtrering meddelas användaren.
   - Filter-pills och vyknappar har `aria-pressed`.
   - Tidsfilter har `aria-expanded`.
   - Bildzoom har `role="dialog"`, `aria-modal="true"`, `aria-label` samt tangentbordsstängning via `[Escape]`.
5. **Fullständig paritet utan karta**:
   - Användare som inte vill eller kan navigera via karta har 100 % tillgång till samma information, källor, translittereringar och filter genom kortvyn (`vy=grid`) och tabellvyn (`vy=table`).
   - Förlorade runstenar utan kända koordinater (t.ex. Öl 15) presenteras med samma vetenskapliga noggrannhet och länkbarhet som bevarade stenar.
6. **Ingen information förmedlas enbart med färg**:
   - Bevarandestatus anges alltid med tydlig text ("Bevarad", "Fragment", "Förlorad inskrift").
   - Kartmarkörer kombinerar färg med cirkelsymbol, legendförklaring och textpopuper.
7. **200 % textförstoring och reducerad rörelse**:
   - Texten kan förstoras upp till 200 % utan att kontroller bryts eller döljs.
   - `@media (prefers-reduced-motion: reduce)` stänger av eller förenklar kart- och bildanimationer.

---

## 2. Automatiserad verifiering ([`tests/runor-accessibility.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-accessibility.test.mjs))

Testsviten omfattar:
1. **Färgoberoende status & tillgängliga bildtexter**: Verifierar att alla 20 inskrifter har giltig textuell bevarandestatus och utförliga bildtexter med licensangivelse.
2. **Likvärdig icke-kart-väg**: Verifierar att samtliga 20 inskrifter har fullständig paritet och läsbarhet i tabell- och kortvy utan kartberoende.
3. **Stilmallens tillgänglighetsregler**: Kontrollerar förekomst av `:focus-visible`, `pointer: coarse` (min-height 44px), `prefers-reduced-motion: reduce`, samt brytpunkter för 360 px och 480 px.

Utfall: **89 av 89 tester godkända** i `npm test`. Typecheck och produktionsbygge slutförs felfritt på ~700 ms.
