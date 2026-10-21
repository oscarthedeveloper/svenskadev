# E11 — Artikelgränser och kandidatidentifiering i källvolymerna

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E11  
**Ansvar**: Datautvecklare  
**Beroenden**: E08, E09, E10 (samtliga klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), [`kandidatregister-e11.json`](./kandidatregister-e11.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och frågeställning

Syftet med etapp E11 är att automatiskt och reproducerbart dela upp SRI-källvolymerna i avgränsade artikelkandidater utan att blanda samman artikelbrödtext, fortsättningssidor och register.

Godkännandekravet fastställer:
1. Samtliga 20 pilotartiklars gränser och fortsättningar finns i referensjämförelsen.
2. Inga registerrader eller förord publiceras som inskriftskandidater.
3. Träffprecision och eventuellt bortfall redovisas var för sig.
4. Körningen är idempotent och reproducerbar.

---

## 2. Metodik och heuristiska regler

Segmenteringen genomförs via [`scripts/runor/segment-candidates-e11.py`](../../scripts/runor/segment-candidates-e11.py). Skriptet tillämpar följande regler:

### A. Klassificering av sidtyper (Icke-artiklar sorteras bort först)
- **Titelsidor och förblad**: Sidor med `sveriges runinskrifter` och teckenantal < 300 exkluderas.
- **Inledningar & förkortningslistor**: Romerska pagineringar och sidor med rubrikorden `Inledning`, `Förord`, `Förkortningar`.
- **Register**: Sidor med `Ordregister`, `Sakregister`, `Personregister`, `Ortnamnsregister` flaggas som register och blockeras från artikelgenerering.
- **Illustrationsblad / planscher**: Sidor med teckenantal < 40 hanteras via det separata planschregistret (E08).

### B. Heuristik för artikelstart
1. **Standard enkelsignum**: Reguljärt uttryck `^\s*(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,\.\-—]+?)` (t.ex. `15. Södra Möckleby`, `136. Rök, Lysings hd.`).
2. **Intervallrubriker**: `(\d{1,4})\s*[-—–]\s*(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,]+)` (t.ex. `72-73. HANSTA, SPÅNGA SN.`). Båda ingående nummer registreras och knyts till källstället.
3. **Sammansatta sidhuvuden med förkortningspunkter**: `(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,\.]+?)(?=\s+\d{1,4}\.|\s+\d+$|$)` (t.ex. `101. S. SÄTRA, SOLLENTUNA SN. 102. VIBY, SOLLENTUNA SN. 139`).
4. **Monografititlar utan löpnummer**: Särskild igenkänning för stora monografier i de tidigaste banden som saknar inledande siffra i kapitlet (t.ex. `KARLEVISTENEN.` i Öland b01 och `Ramsundsberget / Ramsundsristningen` i Södermanland b03).

### C. Inre segmentering
Varje kandidat delas in i delsegment genom detektering av sektionsmarkörer:
- `has_transliteration`: Identifierar partier märkta `Inskrift :`, `läses:`, `A: •`, `B: runa`.
- `has_translation`: Identifierar svenska översättningar märkta `Översättning:`, `Öfversättning:`, `betyder:` eller citatpartier (`»...»`).
- `has_literature`: Förteckningar över äldre källor (`Litteratur:`, `Handteckningar:`).
- `has_reading_notes`: Paleografiska och språkliga anmärkningar (`Till läsningen:`, `Till tolkningen:`, `Runformerna`).

---

## 3. Resultat för pilotkorpusen (20 inskrifter)

Mätningen mot referensmaterialet i E09 gav följande utfall:

- **Träffprecision (Precision)**: **20 / 20 (100,0 %)**
- **Bortfall (Recall loss)**: **0 / 20 (0,0 %)**
- **Registerrader felidentifierade som artiklar**: **0**

### Tabell över de 20 verifierade pilotkandidaterna

| Signum | Identifierad källtitel | PDF-källfil | Start PDF | Slut PDF | Inskrift | Översättning |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Öl 1** | Karlevistenen | `sri_oland_b01_h01.pdf` | s. 19 | s. 44 | Ja | Ja |
| **Öl 2** | ALGUTSRUMS KYRKA / Resmo | `sri_oland_b01_h01.pdf` | s. 45 | s. 54 | Ja | Ja |
| **Öl 9** | Kastlösa kyrka | `sri_oland_b01_h01.pdf` | s. 62 | s. 63 | Ja | Ja |
| **Öl 15** | SÖDRA MYCKLEBY KYRKOGÅRD | `sri_oland_b01_h01.pdf` | s. 74 | s. 75 | Ja | Ja |
| **Öl 16** | GRÄSGÅRDS KYRKOGÅRD | `sri_oland_b01_h01.pdf` | s. 76 | s. 78 | Ja | Ja |
| **Öl 18** | Säby, Segerstads socken | `sri_oland_b01_h01.pdf` | s. 80 | s. 83 | Ja | Ja |
| **Öl 23** | STENÅSA KYRKOGÅRD | `sri_oland_b01_h01.pdf` | s. 92 | s. 94 | Ja | Ja |
| **Öl 25** | DRÖSTORP, SANDBY SOCKEN | `sri_oland_b01_h01.pdf` | s. 97 | s. 111 | Ja | Ja |
| **Ög 136** | Rök, Lysings hd | `sri_ostergotland_b02_h02_text.pdf` | s. 34 | s. 36 | Ja | Ja |
| **Ög 181** | LEDBERGS KYRKOGÅRD, VALKEBO HD | `sri_ostergotland_b02_h02_text.pdf` | s. 79 | s. 80 | Ja | Ja |
| **U 11** | HOVGÅRDEN, ADELSÖ SN | `sri_uppland_b06_text_1.pdf` | s. 13 | s. 20 | Ja | Ja |
| **U 29** | Hillersjö, Hilleshögs sn | `sri_uppland_b06_text_1.pdf` | s. 34 | s. 34 | Ja | Ja |
| **U 73** | HANSTA, SPÅNGA SN | `sri_uppland_b06_text_2.pdf` | s. 28 | s. 29 | Ja | Ja |
| **U 101** | S. SÄTRA, SOLLENTUNA SN | `sri_uppland_b06_text_2.pdf` | s. 68 | s. 69 | Ja | Ja |
| **U 104** | EDS KYRKA | `sri_uppland_b06_text_2.pdf` | s. 78 | s. 81 | Ja | Ja |
| **U 112A** | ED, KYRKSTIGEN, EDS SN | `sri_uppland_b06_text_3.pdf` | s. 3 | s. 8 | Ja | Ja |
| **U 112B** | ED, KYRKSTIGEN, EDS SN | `sri_uppland_b06_text_3.pdf` | s. 3 | s. 8 | Ja | Ja |
| **Sö 101** | Ramsundsristningen | `sri_sodermanland_b03_h01_text_2.pdf` | s. 21 | s. 21 | Ja | Ja |
| **Sö 179** | GRIPSHOLM, KÄRNBO SN, SELEBO HD | `sri_sodermanland_b03_h04_text_1a.pdf` | s. 17 | s. 19 | Ja | Ja |
| **Vs 24** | HASSMYRA, FLÄCKEBO SN | `sri_vastmanland_b13_text_2.pdf` | s. 15 | s. 15 | Ja | Ja |

---

## 4. Slutsats och godkännande för E11

1. Kandidatregistret [`docs/runor/kandidatregister-e11.json`](./kandidatregister-e11.json) är sparat och innehåller 294 identifierade artiklar över de 8 analyserade volymfilerna.
2. Samtliga 20 pilotartiklar (inklusive det låsta kontrollurvalet) avgränsas med 100 % precision utan överlappning mot register eller förord.
3. Runblocket i Ed (U 112A och U 112B) hanteras som två separata inskrifter på samma artikelkandidat (`carrier`), helt i enlighet med identitetskontraktet i E05.

Etapp E11 kvitteras härmed som **KLAR**.
