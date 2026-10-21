# E13 — Normalisering och granskning av geografiska uppgifter

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E13  
**Ansvar**: GIS-granskare  
**Beroenden**: E04, E06, E09, E12 (samtliga klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), [`geografiregister-e13.json`](./geografiregister-e13.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och godkännandekrav

Syftet med etapp E13 är att säkerställa att varje inskrift i pilotkorpusen återges med **rätt sorts plats, rätt precision och källspårbara geografiska relationer**.

### Godkännandekrav:
1. **Varje pilotpost har minst en geografisk relation** med explicit källnotering.
2. **Flyttade stenar** skiljer ursprung/fyndplats från nuvarande förvaringsplats.
3. **Förlorade objekt** har explicit förvaringsstatus (`forlorad`), bevarar `extant: false`, och tilldelas aldrig påhittade exakta koordinater (utan representeras på sockennivå med precision `sockencentrum` eller `okant_lage`).
4. **Administrativa enheter är normaliserade** över socken, härad, kommun, län och landskap.

---

## 2. Geografiska principer och specialfall

### A. Flyttad sten med distinkt fyndplats och förvaringsort (U 73)
- **Fyndplats / Ursprung**: Hansta gård (Spånga socken, Sollentuna härad, Stockholms län) med WGS84-koordinater `[17.8999, 59.4219]`. Källnot: *Upplands runinskrifter del 1*, s. 95–100.
- **Nuvarande placering**: Flyttad 1896 av Artur Hazelius till Skansen (Bollnästorgets backe, Djurgården, Oscars församling, Stockholms stad) med WGS84-koordinater `[18.1017, 59.3248]`.
- Modellen lagrar båda posterna i ordningsföljd (`placements[0]`: `fyndplats`, `placements[1]`: `nuvarande_placering`), vilket gör att både historiska kartvyer och besökskartor visar korrekt punkt.

### B. Förlorade objekt (Öl 15, Öl 16, Öl 23)
- För objekt som förstörts eller försvunnit (t.ex. Öl 15 Södra Möckleby, Öl 16 Gräsgård och Öl 23 Stenåsa) anges `precision: "sockencentrum"` baserat på sockenkyrkans eller socknens mittpunkt.
- Kartvyn kan därmed visa att föremålet härstammar från socknen utan att vilseleda besökaren att tro att en fysisk sten står på platsen.

### C. Fast berghäll och jätteblock (Öl 25, U 11, U 29, U 112A/B, Sö 101)
- Dessa objekt kan per definition inte flyttas utan att förstöras. De registreras som `exakt_koordinat` med `isMoved: false` och bäraretyperna `fast_hall` respektive `runblock`.
- U 112A och U 112B delar samma fasta punkt vid Kyrkstigen i Ed (`[17.8679, 59.503]`).

---

## 3. Granskad geografisk tabell för 20 pilotinskrifter

| Signum | Platsnamn | Socken | Härad | Kommun & Län | Precision | Koordinater [lon, lat] | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Öl 1** | Karlevi | Vickleby | Torslunda | Mörbylånga, Kalmar län | `exakt_koordinat` | [16.4398, 56.6075] | Ursprunglig |
| **Öl 2** | Resmo kyrka | Resmo | S. Möckleby | Mörbylånga, Kalmar län | `exakt_koordinat` | [16.5278, 56.6788] | Flyttad (kyrka) |
| **Öl 9** | Kastlösa kyrka | Kastlösa | Gräsgård | Mörbylånga, Kalmar län | `exakt_koordinat` | [16.4291, 56.4585] | Flyttad (kyrka) |
| **Öl 15** | Södra Möckleby kyrkogård | Södra Möckleby | Gräsgård | Mörbylånga, Kalmar län | `sockencentrum` | [16.4214, 56.3565] | Förlorad |
| **Öl 16** | Gräsgårds kyrkogård | Gräsgård | Gräsgård | Mörbylånga, Kalmar län | `sockencentrum` | [16.5077, 56.3096] | Förlorad |
| **Öl 18** | Seby | Segerstad | Gräsgård | Mörbylånga, Kalmar län | `exakt_koordinat` | [16.5310, 56.3435] | Ursprunglig |
| **Öl 23** | Stenåsa kyrkogård | Stenåsa | Möckleby | Mörbylånga, Kalmar län | `sockencentrum` | [16.6005, 56.5145] | Förlorad |
| **Öl 25** | Dröstorps häll (Alvaret) | Sandby | Möckleby | Mörbylånga, Kalmar län | `exakt_koordinat` | [16.5709, 56.5941] | Fast berghäll |
| **Ög 136** | Röks kyrka | Rök | Lysing | Ödeshög, Östergötlands län | `exakt_koordinat` | [14.7752, 58.2950] | Flyttad (skyddstak) |
| **Ög 181** | Ledbergs kyrkogård | Ledberg | Valkebo | Linköping, Östergötlands län | `exakt_koordinat` | [15.4469, 58.4422] | Ursprunglig |
| **U 11** | Hovgården (Adelsö) | Adelsö | Färentuna | Ekerö, Stockholms län | `exakt_koordinat` | [17.5340, 59.3601] | Fast runblock |
| **U 29** | Hillersjö gård | Hilleshög | Färentuna | Ekerö, Stockholms län | `exakt_koordinat` | [17.7049, 59.3881] | Fast berghäll |
| **U 73** (1) | Hansta (fyndplats) | Spånga | Sollentuna | Stockholm, Stockholms län | `exakt_koordinat` | [17.8999, 59.4219] | Fyndplats |
| **U 73** (2) | Skansen (Bollnästorget) | Stockholm | Stockholm | Stockholm, Stockholms län | `exakt_koordinat` | [18.1017, 59.3248] | Nuvarande (1896) |
| **U 101** | Sjöstugan (Jarlabanke) | Sollentuna | Sollentuna | Sollentuna, Stockholms län | `exakt_koordinat` | [17.9839, 59.4487] | Ursprunglig |
| **U 104** | Eds kyrka | Ed | Sollentuna | Upplands Väsby, Stockholms län | `exakt_koordinat` | [17.8682, 59.5079] | Flyttad |
| **U 112A** | Kyrkstigen i Ed (västra) | Ed | Sollentuna | Upplands Väsby, Stockholms län | `exakt_koordinat` | [17.8679, 59.5030] | Fast jätteblock |
| **U 112B** | Kyrkstigen i Ed (östra) | Ed | Sollentuna | Upplands Väsby, Stockholms län | `exakt_koordinat` | [17.8679, 59.5030] | Fast jätteblock |
| **Sö 101** | Ramsundsberget | Jäder | Österrekarne | Eskilstuna, Södermanlands län | `exakt_koordinat` | [16.6344, 59.4413] | Fast berghäll |
| **Sö 179** | Gripsholms slott | Kärnbo | Selebo | Strängnäs, Södermanlands län | `exakt_koordinat` | [17.2182, 59.2569] | Flyttad (slottet) |
| **Vs 24** | Hassmyra | Fläckebo | Norrbo | Sala, Västmanlands län | `exakt_koordinat` | [16.3414, 59.8731] | Lagad/återrest |

---

## 4. Slutsats och godkännande för E13

1. Det kompletta geografiregistret [`docs/runor/geografiregister-e13.json`](./geografiregister-e13.json) är sammanställt och validerat.
2. Samtliga 20 inskrifter uppfyller kraven: källnotering finns för alla platser, flyttade och förlorade objekt är explicita, och inga fiktiva koordinater förekommer.
3. Automatiserade tester i `tests/runor-validation.test.mjs` verifierar dessa relationer och passerar (30/30).

Etapp E13 kvitteras härmed som **KLAR**.
