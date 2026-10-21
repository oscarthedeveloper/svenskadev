# E30 — Lägg till kamerarörelse och valövergångar

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E30  
**Ansvar**: Frontendutvecklare och designer  
**Beroenden**: E19, E25, E27, E29 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och principer för rörelse

Etapp E30 implementerar kontrollerad, användarstyrd kamerapanorering och övergångar på Runsidans interaktiva karta:

1. **Användarstyrd kameraflygning (`flyTo`)**:
   - Vid val av en inskrift (genom kartklick, kortklick eller URL-parametern `vald=<slug>`) flyger kartan mjukt till inskriftens koordinater (`Math.max(currentZoom, 12)`).
   - Tidslängden är begränsad till **0,8 sekunder** (`flyDurationSeconds: 0.8`), vilket ger överblick utan onödig väntetid.
2. **Avbrytning vid snabba val**:
   - Om användaren klickar på en ny markör eller växlar filter medan en animering pågår anropas `map.stop()`. Föregående förflyttning avbryts omedelbart för att förhindra hoppighet eller tävlande anrop (race conditions).
3. **Full respekt för reducerad rörelse (`prefers-reduced-motion`)**:
   - Om användaren har aktiverat reducerad rörelse i sitt operativsystem kopplas animeringar bort (`useAnimation: false`, `flyDurationSeconds: 0`).
   - Övergången sker omedelbart via `map.setView([lat, lon], targetZoom)`.
4. **Ingen självstartande rundtur eller pulsering**:
   - Inga påträngande automatiska turer eller ständigt pulserande cirklar som kan framkalla åksjuka eller störa läsning av text och runor.
5. **Skymningskompensation för öppna paneler**:
   - Modulen [`lib/runor/motion.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/motion.ts) innehåller `calculateVisibleCenter` för att säkerställa att markören inte hamnar dold bakom snabbvisningspanelen på desktop.

---

## 2. Implementerade moduler och gränssnitt

- **Rörelsemodul**: [`lib/runor/motion.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/motion.ts)
- **Kamera- och övergångskontroll i karta**: [`components/runor/RunorInteractiveMap.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorInteractiveMap.tsx)
- **CSS-transitioner och motion-rules**: [`app/globals.css`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/globals.css)

---

## 3. Automatiserad verifiering ([`tests/runor-motion.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-motion.test.mjs))

Testsviten omfattar:
1. **Standardrörelse**: Verifierar att standardkonfigurationen har `useAnimation === true`, `flyDurationSeconds === 0.8`, `targetZoomLevel === 12` och `easeLinearity === 0.25`.
2. **Reducerad rörelse**: Verifierar att `overrideReducedMotion === true` ger `useAnimation === false` och 0 sekunder i varaktighet.
3. **Paneloffset**: Verifierar att `calculateVisibleCenter` beräknar lämplig offset på desktop, men lämnar koordinaten oförändrad på mobil eller när panelen är stängd.

Utfall: **100 av 100 tester godkända** i `npm test`. Typecheck och Next.js produktionsbygge slutförs felfritt.
