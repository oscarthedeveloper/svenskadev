# E14 — Strukturering av dateringar och språkklassning

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E14  
**Ansvar**: Runologisk och språkhistorisk granskare  
**Beroenden**: E06, E09, E12 (samtliga klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), [`dateringsregister-e14.json`](./dateringsregister-e14.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och godkännandekrav

Syftet med etapp E14 är att göra tid och språk sökbara i användargränssnittet utan att förfalska källornas osäkerhet eller ersätta vetenskapliga tidsspann med godtyckliga årtal.

### Godkännandekrav:
1. **20 / 20 pilotposter har känd, osäker eller explicit avgränsad datering**.
2. **Ingen mittpunkt presenteras som exakt år**: t.ex. får ett spann som `ca 1060–1080` aldrig avrundas till "1070" i presentationen.
3. **Periodetikett blir sifferintervall genom strikta källregler**: Anne-Sofie Gräslunds stilgrupper (RAK, Fp, Pr1–Pr5), runologiska drag (kortkvistrunor, stungna runor) eller kända historiska händelser (slaget vid Fyrisvallarna ca 985, Ingvarståget 1036–1041).
4. **Språkklassning**: Varje normaliserings språknivå deklareras explicit: Runsvenska (RSV), Fornvästnordisk jämförelse (FVN), och särskilda versmått (dróttkvætt, fornyrðislag).

---

## 2. Dateringsmetodik och stilgrupper

Dateringarna i piloten förankras i etablerad runologisk metodik:
- **RAK (ca 980–1015)**: Raka runband utan drakhuvuden, tvära avslutningar. T.ex. **Öl 1 Karlevi**, **Ög 136 Rök** (äldre skede med kortkvistrunor ca 800–850).
- **Fp (Fågelperspektiv, ca 1010–1050)**: Ristningsslingor sedda ovanifrån med två ögon. T.ex. **Sö 179 Gripsholm** (Ingvarssten ca 1040–1050).
- **Pr1–Pr2 (Profilstil 1–2, ca 1010–1070)**: Rundjur i profil med måttlig böjning. T.ex. **Öl 18 Seby** (Pr1), **Sö 101 Ramsund** (Pr1–Pr2), **U 101 Sjöstugan** (Pr2).
- **Pr3 (Profilstil 3, ca 1050–1080)**: Utpräglad Ringerike/Urnesövergång, åttatalsformade slingor. T.ex. **U 11 Hovgården**, **U 73 Hansta**, **U 112A/B Ed**, **Vs 24 Hassmyra**.
- **Pr4–Pr5 (Senvikingatida Urnesstil, ca 1070–1110)**: Tunt flätverk och eleganta öglor. T.ex. **U 104 Eds kyrka** (signerad av Öpir: *ybiR risti*).
- **Gravhällsstil (ca 1050–1130)**: Tidigkristna lockhällar och kistlock med korsornamentik. T.ex. **Öl 9 Kastlösa**, **Öl 23 Stenåsa**.

---

## 3. Register över dateringar och språkklassning för 20 pilotinskrifter

| Signum | Sifferintervall | Periodetikett | Dateringsmetod & Stilgrupp | Språkklassning | Versmått |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Öl 1** | 990–1010 | Vikingatid (tidig/mellan) | Historisk kontext (Fyrisvallarna ca 985); RAK | RSV + FVN | **Dróttkvætt** (skaldestrof) |
| **Öl 2** | 1020–1070 | Vikingatid (sen) | Stilgruppering; Pr1–Pr2 | RSV | Prosa |
| **Öl 9** | 1050–1120 | Tidigmedeltid / Senvikingatid | Kistlockhäll; gravhällsstil | RSV | Prosa |
| **Öl 15** | 1000–1080 | Vikingatid (sen) | Äldre teckningar och runformer | RSV | Prosa |
| **Öl 16** | 1000–1080 | Vikingatid (sen) | Bautil-avritning; djurslinga | RSV | Prosa |
| **Öl 18** | 1010–1060 | Vikingatid (mellan/sen) | Kors och rundjurslinga; Pr1 | RSV | Prosa |
| **Öl 23** | 1060–1130 | Tidigmedeltid / Senvikingatid | Gravhäll med processionskors | RSV | Prosa |
| **Öl 25** | 1020–1070 | Vikingatid (mellan/sen) | Berghäll; Pr2 | RSV | Prosa |
| **Ög 136** | 800–850 | Tidig vikingatid | Kortkvistrunor, språkliga arkaismer | RSV (arkaisk) + FVN | **Fornyrðislag** (lönnrunor) |
| **Ög 181** | 1000–1050 | Vikingatid | Bildsten, Ringerikestil (Ragnarök) | RSV | Prosa / lönnrunor |
| **U 11** | 1060–1085 | Vikingatid (sen) | Historisk kunglig inskrift (Håkon jarl); Pr3 | RSV | Prosa |
| **U 29** | 1060–1090 | Vikingatid (sen) | Torbjörn skald, genealogi; Pr2–Pr3 | RSV | Allittererad prosa |
| **U 73** | 1060–1100 | Vikingatid (sen) | Greklandsresenärer; Pr3 | RSV | Prosa |
| **U 101** | 1060–1080 | Vikingatid (sen) | Jarlabankesläktens kronologi; Pr2 | RSV | Prosa |
| **U 104** | 1070–1110 | Vikingatid (mycket sen) | Öpir-signatur (*ybiR risti*); Pr4–Pr5 | RSV | Prosa |
| **U 112A** | 1060–1100 | Vikingatid (sen) | Ragnvald och modern Fastvi; Pr3 | RSV | Prosa |
| **U 112B** | 1060–1100 | Vikingatid (sen) | Ragnvald i Grekland (*liðs forungi*); Pr3 | RSV | **Allittererad skaldestrof** |
| **Sö 101** | 1020–1050 | Vikingatid (mellan) | Sigurdssagan, ristare Torir; Pr1–Pr2 | RSV | Prosa |
| **Sö 179** | 1040–1050 | Vikingatid (mellan) | Ingvarståget (1036–1041); Fp | RSV | **Fornyrðislag** ("De foro manligen...") |
| **Vs 24** | 1050–1080 | Vikingatid (sen) | Balle den röde, fornvästmanländska; Pr3 | RSV + FVN | **Fornyrðislag** (minnesdikt över Odendisa) |

---

## 4. Slutsats och godkännande för E14

1. Registret [`docs/runor/dateringsregister-e14.json`](./dateringsregister-e14.json) är komplett och verifierat.
2. Inga mittpunkter representeras som exakta årtal; alla poster har källförankrade intervall och tydlig stilgrupp/metod.
3. Språknivåerna (Runsvenska vs Fornvästnordiska vs versmått) är distinkt modellerade och integrerade i [`lib/runor/pilot-data.ts`](../../lib/runor/pilot-data.ts).
4. Automatiserade tester i `tests/runor-validation.test.mjs` passerar felfritt (30/30).

Etapp E14 kvitteras härmed som **KLAR**.
