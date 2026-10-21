# E24 — Bygg Sverigekartan med kluster och platslägen

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E24  
**Ansvar**: Frontendutvecklare  
**Beroenden**: E19, E20, E23 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och kartarkitektur

Etapp E24 förenar det vetenskapliga källurvalet och den gemensamma frågemodellen (E23) med en geografisk överblick över Sveriges runmaterial. Kartan implementeras i enlighet med **Beslut D06** (Leaflet v1.9.4 med CartoDB Voyager-kakel och SVG-fallback) och kraven i Avsnitt 9.3 och 9.6 i genomförandeplanen.

Huvudprinciper:
1. **Separata visningslägen: Fyndplats vs. Nuvarande placering**:
   - En runsten kan ha blivit flyttad från sin ursprungliga resningsplats (t.ex. U 73 som restes vid Hansta i Spånga socken men flyttades till Skansen i Stockholm 1896).
   - Användaren kan med ett klick växla mellan *Fyndplats (ursprunglig)* och *Nuvarande placering*.
2. **Inga falska exakta koordinater för osäkra lägen**:
   - Förlorade runstenar eller fragment med dokumenterad precision `sockencentrum` (t.ex. Öl 15) ritas med en diskret **streckad osäkerhetscirkel** (~1 400 m radie) och grå färgkodning.
   - Texten anger uttryckligen: *”Sockencentrum (approximativt läge för förlorad sten — exakt fyndplats okänd)”*.
3. **Klusterhantering utan dubblettpunkter**:
   - Inskrifter som delar samma koordinatpunkt grupperas i en klustermarkör med sifferindikator (t.ex. ”2” eller ”3”).
   - Vid klick öppnas en grupperad lista där samtliga inskrifter på platsen redovisas individuellt med länk och tolkning. Inga identiteter slås ihop eller raderas.
4. **Öppen GeoJSON-standard (RFC 7946)**:
   - Koordinatordning strikt `[longitud, latitud]` i WGS 84.
   - Exponeras även via det publika API:et: `/api/runor/v1?format=geojson`.

---

## 2. Implementerade moduler och funktioner

### 2.1 GeoJSON-generator och klustring: [`lib/runor/geojson.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/geojson.ts)
- `selectPlacementForMode(inscription, mode)`: Väljer rätt platsuppgift baserat på om besökaren granskar fyndplatser eller nuvarande platser.
- `inscriptionsToGeoJson(inscriptions, mode)`: Genererar en fullständig `FeatureCollection` med egenskaper som signum, namn, slug, socken, härad, datering, tolkning och precision.
- `groupPointsByCoordinate(features)`: Deterministisk spatial gruppering av sammanfallande punkter för att förhindra överlappning och dubbletter.

### 2.2 Interaktiv kartkomponent: [`components/runor/RunorInteractiveMap.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorInteractiveMap.tsx)
- Dynamisk Leaflet-klientkomponent (laddas utan SSR via `next/dynamic`).
- **Lägesväljare**: Tvåknappskontroll för *Fyndplats (ursprunglig)* respektive *Nuvarande placering*.
- **Osäkerhetsytor**: Skapar `L.circle` med streckad linje (`dashArray: '5, 5'`) och halvtransparent fyllning för sockencentrum.
- **Kluster- och enkelmarkörer**:
  - Enskild bevarad sten: Fylld vinröd cirkelmarkör (`#8b1e0f`).
  - Förlorad sten: Neutral grå cirkelmarkör (`#78716c`).
  - Kluster: Cirkulär badge med sifferantal och interaktiv popupruta med länkad lista.
- **Kartlegend**: Redovisar färger, cirkelsymboler och förklarar relationen mellan kartantal och listantal:
  *”Visar X punkter (Y saknar koordinat och listas i textkatalogen)”*.

### 2.3 API-stöd för GeoJSON: [`app/api/runor/v1/route.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/api/runor/v1/route.ts)
- Stöder anrop med `?format=geojson&placement=fyndplats` eller `?format=geojson&placement=nuvarande_plats`.
- Levererar `Content-Type: application/geo+json; charset=utf-8` med CORS och cache-headers.

---

## 3. Automatiserade tester och verifiering ([`tests/runor-map-layers.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-map-layers.test.mjs))

Testsviten omfattar 6 deltester:

```text
✔ E24: inscriptionsToGeoJson genererar giltig RFC 7946 FeatureCollection med [lon, lat] (4.0 ms)
✔ E24: Inga dubblettpunkter från flera platsuppgifter i samma läge (0.1 ms)
✔ E24: Fyndplats och nuvarande plats hanteras som separata lägen (U 73) (0.4 ms)
✔ E24: Osäkra lägen (sockencentrum) har rätt precision och uppfinner inga exakta koordinater (0.1 ms)
✔ E24: Klustergruppering sammanför punkter i samma läge utan att radera identiteter (0.2 ms)
✔ E24: Listantal och kartantal förklaras när koordinater saknas (0.1 ms)
```

Bygg- och typtester:
- **`npm test`**: **75/75 tester passerar grönt (100 %)**.
- **`npm run typecheck`**: **0 fel**.
- **`npm run build`**: **26/26 sidor genererade felfritt på 713 ms**.

---

## 4. Uppfyllda godkännandekrav

| Krav enligt RUNSIDA_PLAN.md | Utfall | Evidens |
|---|---|---|
| Inga dubblettpunkter från flera platsuppgifter i samma läge | **UPPFYLLT** | Test 2: Strikt en punkt per inskrift för valt läge. |
| Ett kluster kan delas och en vald inskrift förblir identifierbar | **UPPFYLLT** | Test 5 & UI: Klusterpopup visar alla ingående inskrifter med individuella länkar. |
| Fyndplats vs. nuvarande plats som separata visningslägen | **UPPFYLLT** | Test 3: U 73 visar Hansta vid fyndplats och Skansen vid nuvarande plats. |
| Osäkra lägen ges annan förklaring och vid underlag en osäkerhetsyta | **UPPFYLLT** | Test 4 & UI: `L.circle` med streckad linje (~1400 m) för sockencentrum; inga påhittade koordinater. |
| Listantal och kartantal förklaras när koordinater saknas | **UPPFYLLT** | Test 6 & UI: TotalFeatures + MissingCoordinates redovisas öppet i legenden. |

---

## 5. Slutsats

Etapp **E24** är härmed fullständigt genomförd, verifierad och **GODKÄND**.
