# E04 — Åtkomstprotokoll för geografisk kompletteringsdata och beslut D02

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E04  
**Ansvar**: Dataansvarig och GIS-granskare  
**Beroenden**: E02, E03 (båda klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och metod

För att kartan på `/runor` ska kunna visa verkliga, spårbara och vetenskapligt belagda lägen krävs en extern geodatakälla som kompletterar SRI:s tryckta volymer (där exakta koordinater inte finns angivna i texten).

Detta protokoll utvärderar tillgängliga källor, verifierar en maskinläsbar råexport med 10 representativa testobjekt och fastställer det formella **Beslut D02**.

---

## 2. Utvärderade källor och åtkomstvägar

1. **Samnordisk runtextdatabas (Uppsala universitet, 2018/2020)**:
   - Innehåller signum, dateringar, forn- och nuspråkliga tolkningar samt koordinater.
   - Det äldre 2018-paketet distribueras som textfiler/databastabeller.
2. **Riksantikvarieämbetets Runor API (`https://runor.raa.se/api/snrd/`)**:
   - Modern REST-tjänst baserad på senaste versionen av Samnordisk runtextdatabas sammanställd av RAÄ och Uppsala universitet.
   - Öppen åtkomst (kräver inga API-nycklar).
   - Tillhandahåller strukturerad JSON med unika UUID:n (`inscription_id`), standardiserade signum, hierarkisk proveniens (landskap, socken, härad, platsnamn), WGS84-koordinater i GeoJSON-format samt åtskillnad mellan `oldest_known` och `current` läge.
   - Inkluderar flagga för bevarandestatus (`extant: true/false`).

---

## 3. Provkörning och verifiering av 10 testobjekt

Skriptet [`scripts/runor/fetch-geo-sample-e04.py`](../../scripts/runor/fetch-geo-sample-e04.py) anropade API:et och extraherade följande 10 objekt över sju olika landskap:

| Signum | Namn / Plats | Landskap & socken | Koordinater (WGS84 [lon, lat]) | Bevarad (`extant`) |
| :--- | :--- | :--- | :--- | :--- |
| **Öl 1** | Karlevistenen | Öland, Vickleby socken | `[16.4398, 56.6075]` | Ja (`true`) |
| **Ög 136** | Rökstenen | Östergötland, Röks socken | `[14.7752, 58.2950]` | Ja (`true`) |
| **U 11** | Hovgårdsstenen | Uppland, Adelsö socken | `[17.5340, 59.3601]` | Ja (`true`) |
| **U 112** | Kyrkstigen (Jarlabanke) | Uppland, Eds socken | `[17.8679, 59.5030]` | Ja (`true`) |
| **Sö 101** | Ramsundsristningen | Södermanland, Jäders socken | `[16.6344, 59.4413]` | Ja (`true`) |
| **Sö 179** | Gripsholmsstenen (Ingvar) | Södermanland, Kärnbo socken | `[17.2182, 59.2569]` | Ja (`true`) |
| **Vg 181** | Frugården | Västergötland, Norra Åsarps socken | `[13.5558, 58.0171]` | Ja (`true`) |
| **Sm 35** | Replösa | Småland, Ljungby socken | `[13.9747, 56.8478]` | Ja (`true`) |
| **Vs 24** | Hassmyra (Odendisa) | Västmanland, Fläckebo socken | `[16.3414, 59.8731]` | Ja (`true`) |
| **Öl 15** | Södra Möckleby kyrkogård | Öland, Södra Möckleby socken | `[16.4214, 56.3565]` | **Nej (`false`)** |

Rådatamängden har sparats i [`docs/runor/provdata-e04.json`](./provdata-e04.json).

---

## 4. Beslutsprotokoll D02

```text
Beslut-ID: D02
Fråga: Vilken geografisk datakälla, version och åtkomstväg används?
Datum: 2026-10-21
Beslut:
1. Riksantikvarieämbetets Runor API (api/snrd) med edition_id="latest" (Samnordisk runtextdatabas) fastställs som primär källa för geografiska koordinater och standardiserade signum.
2. Koordinatreferenssystem fastställs till WGS84 (EPSG:4326) med ordningen [longitud, latitud] i enlighet med RFC 7946 (GeoJSON).
3. Fyndplats/äldsta kända plats (oldest_known) och nuvarande placering (current) hålls strikt åtskilda i datamodellen. Om en sten flyttats eller förvaras på museum (t.ex. Historiska museet) ska inte museets koordinater presenteras som stenens historiska resningsplats.
4. Förlorade eller fragmentariska inskrifter (extant: false) utan säkert läge ska aldrig tilldelas fabricerade mittpunktskoordinater.
5. Inga hemliga API-nycklar krävs. Förfrågningar körs under byggfas och redaktionell import, vilket förhindrar att klientens webbläsare blir beroende av extern serverupptid.
Skäl: Källan är officiellt förvaltad av RAÄ och Uppsala universitet, fullt öppen och tillhandahåller verifierade WGS84-koordinater och stabila UUID:n.
Omprövning utlöses om: RAÄ ändrar API-strukturen eller stänger öppen åtkomst till snrd-endpoints.
```

---

## 5. Slutsats för E04

Åtkomsten till geografisk kompletteringsdata är bevisad och reproducerbar, 10 provobjekt har verifierats och sparats i råexport, och Beslut D02 är formellt fattat.

Etapp E04 kvitteras härmed som **KLAR**.
