# E29 — Utvärdera den funktionella piloten och Milstolpe M3-godkännande

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E29  
**Milstolpe**: **MILSTOLPE M3 GODKÄND (Webbgränssnitt och besökarupplevelse)**  
**Ansvar**: Produktansvarig och granskare  
**Beroenden**: E17, E27, E28 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och sammanfattning

Etapp E29 utgör det formella godkännandet av **Milstolpe M3** (etapperna E18–E29).
Syftet är att verifiera att Runsidans informationsarkitektur, interaktiva karta, URL-synkronisering, detaljvy och källvisning bildar en helgjuten, tillgänglig och källkritisk besökarupplevelse som till fullo uppfyller kraven i Avsnitt 9 i genomförandeplanen.

Samtliga fem obligatoriska användarflöden har testats och verifierats genom automatiserade regressionstester och visuell granskning:

| Flöde | Uppgift | Resultat | Verifiering |
|---|---|---|---|
| **Flöde 1** | Hitta en inskrift via fritext och filter (t.ex. söka ”bro” i Uppland). | **GODKÄND** | Normaliserad diakritik-tolerant sökning med märkta träfforsaker (`MatchReason`). |
| **Flöde 2** | Förstå platsens säkerhet och flyttade objekt (Öl 15 och U 73). | **GODKÄND** | Streckad osäkerhetsyta (~1 400 m) för sockencentrum utan påhittade koordinater. Tydlig separation av fyndplats och nuvarande placering för flyttade stenar. |
| **Flöde 3** | Öppna förlaga, textlager och källplansch (Vs 24 Hassmyrastenen). | **GODKÄND** | Åtskilda textlager (translitterering, runsvenska, fornvästnordiska, nusvenska), modal bildzoom med zoomsteg och [Esc]-stängning. |
| **Flöde 4** | Delad URL och historiknavigering (`history.back()`). | **GODKÄND** | 100 % synkronisering mellan webbläsarens URL och tillstånd. `replaceState` vid skrivande för att skona historiken, `pushState` vid filterval. |
| **Flöde 5** | Kritiska fel- och reservlägen (404, alias-redirect, listreserv). | **GODKÄND** | 404 för okända objekt, transparent alias-redirect för äldre källbeteckningar (Bautil 15 -> Öl 15), fullständig serverrenderad listreserv vid avstängt JS/WebGL. |

---

## 2. Milstolpe M3 Slutrapport: Levererade Etapper (E18–E29)

Med slutförandet av etapperna E18 till E29 är hela Milstolpe M3 klar och i drift:

1. **E18 — Informationsstruktur och alla huvudtillstånd**:
   - Statiska och dynamiska Next.js-rutter, 9 huvudtillstånd (T01–T09) och 4 breddfall (360 px, 768 px, 1024 px, 1440 px).
2. **E19 — Kartmotor och kartunderlag (Beslut D06)**:
   - Leaflet v1.9.4 med CartoDB Voyager kakellager och robust 2D SVG fallback.
3. **E20 — Versionerat läskontrakt och filter**:
   - `getPublishedRunicCorpus` och `/api/runor/v1` med strikt publiceringsfilter (inga interna utkast eller felaktiga koordinater släpps igenom).
4. **E21 — Lagring, import och skrivskydd**:
   - SQL-migrationer, Row Level Security (RLS) som blockerar anonyma skrivningar och utkastläsningar, idempotenta importskript verifierade med PGlite.
5. **E22 — Serverrenderade routes och listreserv**:
   - Delbara direktlänkar i ny flik, alias-redirects, Schema.org JSON-LD semantisk metadata och serverrenderad listreserv.
6. **E23 — Sökning och gemensamma filter**:
   - Diakritiktolerant sökning (`þ`→`th`, `ð`→`d`, `ǫ`→`o`), slutna dateringsintervall enligt Avsnitt 9.4, märkta träfforsaker.
7. **E24 — Sverigekartan med kluster och platslägen**:
   - RFC 7946 GeoJSON, spatial klustring utan identitetsförlust, streckade osäkerhetsytor för sockencentrum.
8. **E25 — Samordna URL, filter, karta och historik**:
   - URL-serialiserare, `popstate`-lyssnare, skydd mot gamla asynkrona svar, snabbvisningspanel för `vald=<slug>`.
9. **E26 — Bygg inskriftens läsvy och källvisning**:
   - Strikt separerade textlager, tillgänglig bildzoom-modal, callout-banners för svårfall (förlorade/flyttade stenar, versmått).
10. **E27 — Färdigställ responsivitet och grundtillgänglighet**:
    - WCAG 2.1 AA, `aria-live`, `aria-pressed`, `aria-expanded`, minst 44 px pekmål för touch, `:focus-visible` och `prefers-reduced-motion`.
11. **E28 — Integrera Resursbibliotek, grammatik och ordbok**:
    - Bibliografisk SRI-katalog i `lib/runor/library.ts`, språkhistoriska korsreferenser till *Från person till person* och grammatik, direktlänkar på startsidan `app/page.tsx`.
12. **E29 — Utvärdera den funktionella piloten**:
    - Automatiserad testning av de fem användarflödena och formellt milstolpegodkännande.

---

## 3. Test- och byggstatus vid M3-avslut

- **Automatiserade enhetstester**: **97 av 97 tester godkända** (`npm test`).
- **Typkontroll**: 0 TypeScript-fel (`npm run typecheck`).
- **Produktionsbygge**: Next.js bygger samtliga 26 statiska och dynamiska rutter på **~650 ms** (`npm run build`).

**Beslut:** Milstolpe M3 godkänns härmed i sin helhet. Projektet är redo att fortsätta med Milstolpe M4 (Skalad insamling, segmentering och OCR).
