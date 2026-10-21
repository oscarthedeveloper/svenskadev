# E26 — Bygg inskriftens läsvy och källvisning

**Projekt**: Runsidan på fornsvenska.se (`/runor/[slug]`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E26  
**Ansvar**: Frontendutvecklare och redaktör  
**Beroenden**: E08, E15, E16, E22, E25 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och redaktionella principer

Etapp E26 bygger och förfinar den individuella läsvyn (`/runor/[slug]`) för Sveriges runinskrifter, med full källkritisk integritet och tillgänglighet i enlighet med Avsnitt 9.2 och 9.5 i genomförandeplanen:

1. **Strikt åtskilda textlager**:
   - Diplomatisk translitterering (bokstavstrogen med tecknen `×`, `+`, `[…]` i kodblock).
   - Normalisering till runsvenska (vikingatida standardspråk).
   - Normalisering till fornvästnordiska (klassisk litterär form där tillämpligt).
   - Auktoritativ nusvensk tolkning hämtad ur *Sveriges runinskrifter* (SRI), presenterad som central citatblock.
   - Engelsk referensöversättning för internationella forskningsändamål.
   - Alternativa läsningar och forskningstolkningar redovisas öppet utan animationer som döljer innehåll för skärmläsare.
2. **Källhänvisningar och faksimilkontroll**:
   - Tydlig redovisning av SRI-volym, författare, utgivningsår.
   - Separering av tryckt sidintervall (`s. X–Y`) och digitalt PDF-faksimilintervall.
   - Verifierade externa länkar till Riksantikvarieämbetet Runor (`raaRunorUri`) med säker `rel="noopener noreferrer"`.
   - Samnordisk runtextdatabas UUID (`samnordiskUuid`).
   - Knapp för att med ett klick kopiera vetenskaplig citatsträng.
3. **Interaktiv bildzoom / Planschgranskare**:
   - Klick på källplanschen öppnar en tillgänglig modal lightbox (`role="dialog"`, `aria-modal="true"`).
   - Zoomkontroller: Förstora (`+`), förminska (`−`), återställ (`100 %`) och stäng (`✕` eller `[Esc]`).
   - Ingen bildförvanskning; fullständig källtext, fotograf och Public Domain-licens visas i modalens fotnot.
4. **Pedagogisk hantering av pilotens svårfallsmatris**:
   - **Öl 15 (Förlorat objekt)**: Varningsbanner med förklaring av antikvariska förlagor (Bautil / Liljegren), precision `sockencentrum`, och standardiserad SVG-placeholder (`/images/runor/ej-avbildad.svg`) utan fabricerade fotografier.
   - **U 73 (Flyttad runsten)**: Callout-banner och separerade placeringar som redovisar både Hansta gård (Spånga socken) och Skansen (Stockholms stad / Oscars församling).
   - **U 112B (Flera inskrifter på samma block)**: Särskild suffixmarkering `B`, alias `Kyrkstigsblocket`, och tydlig redovisning av berghällens två ristningsytor.
   - **Vs 24 (Skaldedikt på versmått)**: Versmåttsbadge *Versmått (Fornyrðislag)*, allitterationsnot och redaktionell kommentar om Odendisa och Balle den röde.

---

## 2. Implementerade moduler och gränssnitt

- **Detaljvykomponent**: [`components/runor/RunorDetailView.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorDetailView.tsx)
- **Stilar**: [`app/globals.css`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/globals.css) (sektion E26: modal, callout-banners, metriska badges, zoomkontroller)
- **Rutter och metadata**: [`app/runor/[slug]/page.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/runor/[slug]/page.tsx) med Schema.org JSON-LD

---

## 3. Automatiserad verifiering ([`tests/runor-detail.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-detail.test.mjs))

Testsviten omfattar:
1. **Textlager & Källor för alla 20 inskrifter**: Translitterering och tolkning är icke-tomma och ej sammanblandade, volymtitlar, författare, tryckta sidor och PDF-sidor är fullständiga. RAÄ Runor-länkar och Samnordisk UUID är formellt giltiga.
2. **Öl 15 (Förlorad)**: Verifierar bevarandestatus `forlorad`, `sockencentrum`-precision, SVG-placeholder och avsaknad av fabricerade foton.
3. **U 73 (Flyttad)**: Verifierar strikt separation mellan fyndplats och nuvarande placering med skilda koordinater och ortsangivelser.
4. **U 112B (Kyrkstigsblocket)**: Verifierar suffix `B`, bärartyp `runblock`, och alias.
5. **Vs 24 (Hassmyrastenen)**: Verifierar fornyrðislag, Balle-attribuering och diplomatisk translitterering.

Utfall: **86 av 86 tester godkända** i `npm test`. Typecheck och produktionsbygge slutförs felfritt.
