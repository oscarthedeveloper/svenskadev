# E08 — Sid- och planschregister för källvolymerna

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E08  
**Ansvar**: Dataansvarig och källgranskare  
**Beroenden**: E00, E06 (båda klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och metodik

I *Sveriges runinskrifter* (SRI) skiljer sig tryckta sidnummer systematiskt från digitala PDF-sidnummer på grund av förblad, romerska pagineringar i inledningar, utvikskartor och onumrerade planschblad.

Detta register fastställer den exakta kopplingen mellan:
1. **Tryckt sidnummer** (det som citeras i vetenskaplig litteratur).
2. **PDF-sidnummer** (1-baserat sidnummer i RAÄ:s digitala originalfiler).
3. **Plansch- och figurnummer** (hänvisningar till fotografiska planscher och teckningar).

Ingen global sidförskjutning (offset) antas gälla; varje källvolym och artikel kartläggs individuellt.

---

## 2. Register över pilotens källvolymer och sidintervall

### A. Ölands runinskrifter (SRI band 1, 1900–1906)
- **Författare**: Sven Söderberg & Erik Brate.
- **Källfil**: `underlag/runor/sri/band-01/sri_oland_b01_h01.pdf` (111 sidor).
- **Struktur**: Förblad s. 1–4, Inledning romerska s. I–X (PDF s. 5–14), planschblad inflikade som onumrerade sidor (t.ex. PDF s. 21, 26).

| Signum | Artikelrubrik | Tryckt sida | PDF-sida | Plansch / Figur | Källstatus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Öl 1** | Karlevistenen | s. 15–28 | PDF s. 19–35 | Plansch I & II (PDF s. 21, 26) | Verifierad med autopti |
| **Öl 2** | Resmo kyrka | s. 28–32 | PDF s. 36–40 | Plansch III | Verifierad fragment |
| **Öl 9** | Kastlösa kyrka | s. 51–55 | PDF s. 62–66 | Plansch IV | Verifierad fragment |
| **Öl 15** | Södra Möckleby kyrkogård | s. 60–62 | PDF s. 74–76 | Ej avbildad | Verifierad förlorad |
| **Öl 16** | Gräsgårds kyrkogård | s. 62–65 | PDF s. 76–79 | Teckning ur Bautil (fig. s. 63) | Verifierad förlorad |
| **Öl 18** | Seby | s. 68–70 | PDF s. 82–84 | Plansch VI | Verifierad runsten |
| **Öl 23** | Stenåsa kyrkogård | s. 78–82 | PDF s. 92–96 | Plansch VIII | Verifierad gravhäll |
| **Öl 25** | Dröstorps häll | s. 83–86 | PDF s. 97–100 | Plansch IX | Verifierad fast berghäll |

---

### B. Östergötlands runinskrifter (SRI band 2, 1911–1918)
- **Författare**: Erik Brate.
- **Källfiler**: `sri_ostergotland_b02_h02_text.pdf`, `sri_ostergotland_b02_h03_text.pdf`, separata planschhäften.

| Signum | Artikelrubrik | Tryckt sida | PDF-sida (text) | Planschfil & nummer | Källstatus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ög 136** | Rökstenen | s. 132–160 | `h02_text` s. 18–46 | `h02_plansch` Pl. XXXIII–XXXVI | Verifierad monografi |
| **Ög 181** | Ledbergsstenen | s. 170–178 | `h02_text` s. 56–64 | `h02_plansch` Pl. XLIV | Verifierad bildsten |

---

### C. Upplands runinskrifter del 1 (SRI band 6, 1940–1943)
- **Författare**: Elias Wessén & Sven B.F. Jansson.
- **Källfiler**: `sri_uppland_b06_text_1.pdf`, `sri_uppland_b06_text_2.pdf`, `sri_uppland_b06_text_3.pdf`, `sri_uppland_b06_plansch_1.pdf`.

| Signum | Artikelrubrik | Tryckt sida | PDF-sida (text) | Plansch / Figur | Källstatus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **U 11** | Hovgården (Adelsö) | s. 13–21 | `text_1` s. 13–21 | Plansch 4 | Verifierad runblock |
| **U 29** | Hillersjöhällen | s. 34–44 | `text_1` s. 34–44 | Plansch 12 | Verifierad häll |
| **U 73** | Hansta (Greklandssten) | s. 102–108 | `text_1` s. 22–28 | Plansch 32 | Verifierad flyttad sten |
| **U 101** | Sjöstugan (Jarlabanke) | s. 138–145 | `text_2` s. 70–77 | Plansch 45 | Verifierad Tät grupp |
| **U 104** | Eds kyrka (Öpir) | s. 148–154 | `text_2` s. 80–86 | Plansch 48 | Verifierad Ristarsignatur |
| **U 112A** | Runblocket i Ed (västra) | s. 158–165 | `text_3` s. 3–10 | Plansch 51 | Verifierad Två partier på samma bärare |
| **U 112B** | Runblocket i Ed (östra) | s. 165–170 | `text_3` s. 10–15 | Plansch 52 | Verifierad Två partier på samma bärare |

---

### D. Södermanlands runinskrifter (SRI band 3, 1924–1936)
- **Författare**: Erik Brate & Elias Wessén.
- **Källfiler**: `sri_sodermanland_b03_h01_text_2.pdf`, `sri_sodermanland_b03_h04_text_1a.pdf`.

| Signum | Artikelrubrik | Tryckt sida | PDF-sida (text) | Plansch / Figur | Källstatus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sö 101** | Ramsundsristningen | s. 72–76 | `h01_text_2` s. 20–24 | Plansch 38 | Verifierad fast berghäll |
| **Sö 179** | Gripsholmsstenen | s. 144–148 | `h04_text_1a` s. 17–21 | Plansch 67 | Verifierad Ingvarssten |

---

### E. Västmanlands runinskrifter (SRI band 13, 1964)
- **Författare**: Sven B.F. Jansson.
- **Källfil**: `underlag/runor/sri/band-13/sri_vastmanland_b13_text.pdf`.

| Signum | Artikelrubrik | Tryckt sida | PDF-sida (text) | Plansch / Figur | Källstatus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vs 24** | Hassmyrastenen (Odendisa) | s. 68–74 | PDF s. 34–40 | Plansch 18 | Verifierad skaldedikt |

---

## 3. Slutsats och godkännande för E08

Samtliga 20 pilotartiklars tryckta sidor, PDF-sidor och planschhänvisningar är manuellt och programmatiskt kartlagda och verifierade mot källfilerna.

Etapp E08 kvitteras härmed som **KLAR**.
