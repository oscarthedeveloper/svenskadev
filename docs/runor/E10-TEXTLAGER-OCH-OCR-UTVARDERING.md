# E10 — Mätning av textlagren och utvärdering av OCR-behov

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E10  
**Ansvar**: Datautvecklare och språkgranskare  
**Beroenden**: E08, E09 (båda klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), [`textlager-matning-e10.json`](./textlager-matning-e10.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och frågeställning

Syftet med etapp E10 är att systematiskt mäta kvaliteten i det befintliga digitala textlagret i *Sveriges runinskrifter* (SRI) samt avgöra om ny optisk teckenigenkänning (OCR) ska köras över korpusen eller delar av den.

Frågeställningen lyder:  
*Förbättrar en ny OCR-körning (t.ex. Tesseract/Kraken) de runologiska målsegmenten på ett reproducerbart sätt utan att införa oacceptabla regressioner i brödtext och skiljetecken?*

---

## 2. Metod och testkorpus

Mätningen har genomförts med skriptet [`scripts/runor/measure-textlayers-e10.py`](../../scripts/runor/measure-textlayers-e10.py) mot samtliga **20 pilotinskrifter** över 5 volymdelar och tidsperioder (1900–1964), omfattande **156 PDF-sidor** och **481 388 tecken**.

### Det låsta kontrollurvalet (20 % av korpusen)
För att förhindra överanpassning har följande fyra poster hållits som strikt låst kontrollurval:
1. **Öl 15** (Södra Möckleby, förlorad sten, band 1, 1906)
2. **U 73** (Hansta/Skansen, flyttad Greklandssten, band 6 del 2, 1942)
3. **U 112B** (Kyrkstigen i Ed, östra partiet på runblock, band 6 del 3, 1943)
4. **Vs 24** (Hassmyrastenen/Odendisa, skaldedikt, band 13, 1964)

---

## 3. Mätresultat och felklassificering

Mätningen visade 100 % träffsäkerhet i att identifiera rubriker och signum i textlagret (20/20), men avslöjade tydliga och systematiska egenskaper i textens struktur:

| Kategori | Beskrivning | Frekvens i piloten | Exempel ur SRI | Påverkan & åtgärd |
| :--- | :--- | :--- | :--- | :--- |
| **A: Kerning / Spärrning** | Spärrad sättning i rubriker och nyckelord | 0 i modern brödtext; förekommer i titlar | `K A R L E V I S T E N E N`, `S Ö D R A  M Y C K L E B Y` | Hanteras med regex-kollaps av enskilda versaler med enkla mellanslag. |
| **B: Avstavningar** | Radbrytningar med bindestreck mitt i ord | 175 fall (~1,1 per sida) | `ristning- / ens`, `öfver- / ensstämmer` | Åtgärdas vid sökindexering genom dehyphenation (`\w+-\s*\n\s*\w+`). |
| **C: Ligaturer & accenter** | Äldre trycktyper för diakritiska tecken | Frekvent i b01–b03 (1900–1936) | `æ` → `œ`/`ce`, `kvam` → `Jcvam`, `brø̄ðr` → `brßör` | OCR/textlagret kan ej användas direkt för vetenskaplig normalisering. |
| **D: Runologiska tecken** | Runor, R-rot, thorn, edh, skiljetecken | þ=600, ð=97, []=303, **ʀ=0, runor=0** | `ʀ` lagras som `R`; runtyper kodade som ASCII (`HÎ+I+`) | Digitala runtecken (U+16A0–U+16FF) saknas helt i textlagret. |
| **E: Illustrationssidor** | Planschblad och helsidesfotografier | Helt utan textlager (eller endast bildtext) | Planscher i b01, b02, b06, b13 | Kräver separat sid- och bildregister (genomfört i E08). |

---

## 4. Utvärdering av ny OCR

Ett försök med generell optisk teckenigenkänning (OCR) visar följande utfall:
1. **Brödtext**: SRI:s befintliga digitala textlager (producerat vid digitaliseringen hos Kungliga biblioteket / RAÄ) har mycket god kvalitet i den löpande svenska brödtexten och den moderna filologiska diskussionen (i volymer från 1940- och 1960-talet > 98 % ordkorrekthet).
2. **Translitterering och runor**: Ny OCR med vanliga modeller (t.ex. Tesseract med svenskt språkpaket) misslyckas kapitalt på de runologiska partierna:
   - Runinterpunktion (`•`, `:`, `x`, `+`) tolkas som slumpmässiga punkter, komman eller bindestreck.
   - Runologiska tecken som `þ`, `ð`, `ʀ` och nasalerade vokaler ersätts med `p`, `b`, `d`, `R` eller brus.
   - Hakparenteser `[...]` (för skadade partier) förväxlas med `l...l`, `I...I` eller `|...|`.
3. **Regressioner**: Ny OCR förbättrar inte brödtexten men försämrar strukturen och inför nya oförutsägbara fel i de kritiska läsningarna.

---

## 5. Beslut D06 — Differentierad textarkitektur

Med stöd i godkännandekravet för E10 fattas härmed följande arkitekturbeslut:

> ### Beslut D06: Ingen ny blind OCR – Tillämpa differentierad textarkitektur
> 1. **Sökunderlag**: SRI:s befintliga extraherade textlager bevaras och används som **fulltextsökbart underlag**. Vid indexering appliceras automatisk avstavningsnormalisering (dehyphenation) och sammanslagning av spärrade rubriker.
> 2. **Auktoritativ visningstext**: Publicerad translitterering, fornnordisk normalisering (runsvenska/fornvästnordiska) och svensk översättning hämtas från **manuellt granskade referensdata** samstämda med *Samnordisk runtextdatabas* (Rundata 2020) och SRI:s tryckta original.
> 3. **Källtrohet**: Besökaren ges alltid möjlighet att öppna och granska originalsidans faksimil via direktlänk till PDF-sidan i SRI.
> 4. **Manuell transkription**: Svåra eller omtvistade textsegment hanteras via redaktionell korrektur, aldrig genom automatiserad OCR utan mänsklig granskning.

---

## 6. Uppdatering av källreferenser efter E10-verifiering

Under E10-arbetet upptäcktes två sidintervallsjusteringar för Upplands pilotinskrifter som nu har korrigerats i data och register:
- **U 73**: Texten återfinns i `sri_uppland_b06_text_2.pdf` sid 26–31 (tryckt s. 95–100), inte i `text_1.pdf`.
- **U 112 (A och B)**: Båda inskrifterna på runblocket behandlas gemensamt i `sri_uppland_b06_text_3.pdf` sid 1–9 (tryckt s. 157–165).
- **Ög 136**: Återfinns i `sri_ostergotland_b02_h02_text.pdf` sid 34–62 (tryckt s. 130–158).
- **Ög 181**: Återfinns i `sri_ostergotland_b02_h02_text.pdf` sid 78–81 (tryckt s. 174–177).

Dessa justeringar är synkroniserade i [`docs/runor/pilot-20-inskrifter.json`](./pilot-20-inskrifter.json) och [`lib/runor/pilot-data.ts`](../../lib/runor/pilot-data.ts).

---

## 7. Slutsats och godkännande

Kriterierna för E10 är uppfyllda:
- Referenssidornas fel och egenskaper är fullständigt klassificerade (Kategori A–E).
- Mätdata för alla 20 inskrifter och det 20 % låsta kontrollurvalet finns dokumenterade i [`textlager-matning-e10.json`](./textlager-matning-e10.json).
- Behovet av ny OCR har utvärderats och avvisats till förmån för en robust differentierad textarkitektur (Beslut D06).

Etapp E10 kvitteras härmed som **KLAR**.
