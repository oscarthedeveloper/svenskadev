# E09 — Piloturval och svårfallsmatris (20 inskrifter)

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E09  
**Ansvar**: Redaktör och runologisk granskare  
**Beroenden**: E04, E05, E06, E08 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och urvalskriterier

För att piloten ska fungera som ett verkligt skalbarhetsbevis (och inte bara visa upp 20 lättlästa, välkända och intakta runstenar) måste urvalet stresstesta datamodellen, kartmotorn och källkedjan mot runologins alla typiska svårfall:
- **Tät geografisk grupp**: Runstenar som står nära varandra (risk för överlappande markörer).
- **Flera inskrifter på samma bärare**: Ett runblock med skilda ristningar och texter.
- **Fast berghäll**: Ej fristående sten, fast i berggrunden.
- **Förlorat objekt (`extant: false`)**: Tidigare känd inskrift som saknar fysisk bevaring och aktuellt läge.
- **Fragment**: Delvis krossat eller inmurat objekt.
- **Flyttad sten**: Fyndplats skiljer sig väsentligt från nuvarande visningsplats (t.ex. flyttad till museum eller Skansen).
- **Språklig komplexitet**: Skaldemått (dróttkvætt, fornyrðislag), urnordiska drag, lönnrunor.
- **Ristarsignaturer**: Kända historiska runristare (Öpir, Torir, Ragnvald).
- **Osäkerhet**: Lakuner, skador, omtvistade läsningar.

---

## 2. Svårfallsmatris över de 20 kuraterade inskrifterna

| Signum | Namn | Landskap | Fysisk bärartyp | Status | Svårfallsroll i testmatrisen |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Öl 1** | Karlevistenen | Öland | Runsten | Bevarad | Standardmonument, dróttkvætt på fornvästnordiska/runsvenska, in situ |
| **Öl 2** | Resmo kyrka | Öland | Fragment | Fragment | Sekundärt inmurat fragment |
| **Öl 9** | Kastlösa kyrka | Öland | Fragment | Fragment | Fragmentarisk gravkistehäll |
| **Öl 15** | Södra Möckleby | Öland | Runsten | **Förlorad** | Saknar aktuellt läge (`extant: false`), historisk observation |
| **Öl 16** | Gräsgård | Öland | Runsten | **Förlorad** | Känd endast genom äldre Bautil-avritning |
| **Öl 18** | Seby | Öland | Runsten | Bevarad | Lakun i texten, osäker personnamnstolkning |
| **Öl 23** | Stenåsa | Öland | Gravhäll | Fragment | Medeltida gravhäll med kristet kors |
| **Öl 25** | Dröstorp | Öland | **Fast häll** | Bevarad | Fast berghäll på Stora Alvaret |
| **Ög 136** | Rökstenen | Östergötland | Runsten | Bevarad | Monografi: lönnrunor, chiffer, äldre futhark, Theoderik-strofen |
| **Ög 181** | Ledbergsstenen | Östergötland | Runsten | Bevarad | Bildsten: mytologiska scener (Fenrisulven slukar Oden) |
| **U 11** | Hovgården | Uppland | **Runblock** | Bevarad | Kunglig inskrift (Håkon jarl) på fast rundslipat bergsblock |
| **U 29** | Hillersjöhällen | Uppland | **Fast häll** | Bevarad | Upplands längsta runinskrift (Geirlögs arvsberättelse i sex led) |
| **U 73** | Hansta | Uppland | Runsten | Bevarad | **Flyttad sten**: funnen i Spånga, rest på Skansen i Stockholm |
| **U 101** | Sjöstugan (Täby) | Uppland | Runsten | Bevarad | **Tät grupp**: del av Jarlabankes monument vid Täby bro |
| **U 104** | Eds kyrka | Uppland | Runsten | Bevarad | **Ristarsignatur**: *Ybiʀ risti* (Öpir) |
| **U 112A** | Runblocket i Ed (V) | Uppland | **Runblock** | Bevarad | **Samma bärare (sida A)**: Ragnvald lät rista efter sin moder Fastvi |
| **U 112B** | Runblocket i Ed (Ö) | Uppland | **Runblock** | Bevarad | **Samma bärare (sida B)**: Ragnvald var härförare i Grekland |
| **Sö 101** | Ramsundsberget | Södermanland | **Fast häll** | Bevarad | Monumental Sigurdsristning på fast bergknalle, ristare Torir |
| **Sö 179** | Gripsholm | Södermanland | Runsten | Bevarad | Ingvarssten (österled): "de dogo söderut i Särkland" |
| **Vs 24** | Hassmyra | Västmanland | Runsten | Bevarad | Skaldedikt över en husfru (Odendisa) i allittererande vers |

---

## 3. Låst kontrollurval (20 % reserverat)

I enlighet med godkännandekravet i E09 reserveras 4 av inskrifterna (20 %) som ett **låst kontrollurval**:
1. **Öl 15** (representant för förlorat objekt)
2. **U 112B** (representant för sekundär ristning på samma bärare)
3. **U 73** (representant för flyttad sten med divergerande koordinater)
4. **Vs 24** (representant för regional dialektal skaldedikt)

Dessa 4 poster modifieras inte under den löpande regelutvecklingen utan används uteslutande för blindtest och regressionskontroll före milstolpegodkännande.

---

## 4. Slutsats och beslut för E09

Urvalet av 20 inskrifter är låst, täcker samtliga obligatoriska svårfall och finns maskinläsbart i [`docs/runor/pilot-20-inskrifter.json`](./pilot-20-inskrifter.json) samt typsäkert implementerat i [`lib/runor/pilot-data.ts`](../../lib/runor/pilot-data.ts).

Etapp E09 kvitteras härmed som **KLAR**.
