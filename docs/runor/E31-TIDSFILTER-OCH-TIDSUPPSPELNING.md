# E31 — Bygg tidsfilter och valbar tidsuppspelning

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E31  
**Ansvar**: Frontendutvecklare och dateringsgranskare  
**Beroenden**: E14, E23, E25, E30 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), Avsnitt 9.4  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och källkritiska principer för tidsfiltrering

Etapp E31 genomför ett vetenskapligt förankrat tidsfilter och en valbar tidslinjeuppspelning som följer principerna i Avsnitt 9.4:

1. **Slutna dateringsintervall (inga fiktiva mittpunkter)**:
   - En runinskrift med dateringsintervall $[a, b]$ (t.ex. $1000–1050$) överlappar ett sök- eller tidsfönster $[s, e]$ omm $a \le e$ och $b \ge s$.
   - Systemet tilldelar **aldrig** en bred datering en artificiell matematisk mittpunkt (t.ex. $1025$) som skulle dölja den källkritiska osäkerheten eller få stenen att försvinna utanför sitt verkliga dateringsspann.
2. **Historiskt förankrade epoker**:
   - `RUNIC_EPOCHS` definierar vetenskapligt etablerade tidsperioder för svenskt runmaterial:
     - **Alla perioder**: $750–1250$ e.Kr.
     - **Tidig vikingatid**: $750–950$ e.Kr. (kortkvistrunor, tidiga urnordiska arv, Rökstenen Ög 136).
     - **Sen vikingatid**: $950–1100$ e.Kr. (minnesstenarnas och runmuffarnas period; Ingvarsstenarna och runmästare som Fot, Balle och Asmund).
     - **Övergångstid & tidig medeltid**: $1100–1250$ e.Kr. (kristna gravkistor, lockhällar och kyrkliga miljöer).
3. **Valbar tidsuppspelning utan automatisk start**:
   - Uppspelning startar **aldrig automatiskt** vid sidladdning (`isPlaying: false` som strikt standard).
   - Uppspelning kan startas (`▶ Spela tidsresa`) och pausas (`⏸ Pausa tidsresa`) när som helst av användaren.
   - Stegningen sker kontrollerat med 25 års steg framåt i tiden med 1200 ms intervall.
   - När slutet av tidsspannet nås loopar uppspelningen mjukt tillbaka till början (`hasLooped: true`).
4. **Strikt skydd för reducerad rörelse (`prefers-reduced-motion`)**:
   - Om användaren har aktiverat `prefers-reduced-motion` i systemet inaktiveras automatisk tidsuppspelning och kan inte startas, för att förhindra flimmer och kognitiv överbelastning. Manuella reglage och epokval förblir fullt tillgängliga.

---

## 2. Implementerade moduler och gränssnitt

- **Tidslinjemodell och stegningslogik**: [`lib/runor/timeline.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/timeline.ts)
- **Sök- och intervallfilter**: [`lib/runor/search.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/search.ts) (`matchesDatingInterval`)
- **Interaktiv tidsresekontroll i gränssnittet**: [`components/runor/RunorDirectoryClient.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorDirectoryClient.tsx)
- **URL-synkronisering**: Tidsfönstret synkroniseras via parametrarna `fran` och `till` i URL:en via [`lib/runor/url-state.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/url-state.ts).

---

## 3. Automatiserad verifiering ([`tests/runor-timeline.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-timeline.test.mjs))

Testsviten verifierar:
1. `RUNIC_EPOCHS` täcker giltiga tidsspann och innehåller fullödiga beskrivningar.
2. `advanceTimeWindow` flyttar tidsfönstret stegvis framåt och loopar kontrollerat när tidsgränsen nås.
3. Slutna intervall enligt Avsnitt 9.4 fungerar matematiskt korrekt mot pilotmaterialet (Ög 136 och breda dateringar).
4. `DEFAULT_PLAYBACK_STATE` har `isPlaying: false` och tillräcklig tidslatens för att undvika flimmer.

Utfall: **104 av 104 tester godkända** i `npm test`. Typecheck och produktionsbygge slutförs felfritt.
