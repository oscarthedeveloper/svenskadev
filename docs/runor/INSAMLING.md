# Lokal insamling av Sveriges runinskrifter

Inventering och analys: 21 oktober 2026.

Hämtat **129 av 129 PDF-filer**  totalt **4 440 853 483 byte (4.14 GiB)**. Tekniskt analyserat **129 filer och 7 217 PDF-sidor**.

[Utgångssida hos RAÄ](https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/digitala-sveriges-runinskrifter-publicerade-volymer/). Alla direkta SRI-PDF-länkar på sidan ingår; det är dokument, inte individuella inskriftsobjekt.

## Var materialet finns

- Original: `underlag/runor/sri/band-*/`.
- Söktillämpningens arbetsunderlag: `underlag/runor/sri/text/*.txt` och `*.jsonl` (en post per PDF-sida).
- Källa, länkar, tidpunkter, storlekar och SHA-256: [nedladdningsmanifest.json](nedladdningsmanifest.json).
- Sidantal, metadata, textmängd och kontrollresultat: [pdf-analys.json](pdf-analys.json).
- Förslag till karta, datamodell och utvecklingsetapper: [RUNSIDA_PLAN.md](RUNSIDA_PLAN.md).

Original och extraherad text ligger lokalt och är Git-ignorerade. De publiceras inte av webbbygget och behöver säkerhetskopieras separat.

## Volymer

| Utgåva | Filer analyserade | PDF-sidor |
|---|---:|---:|
| Ölands runinskrifter (SRI band 1, 1900-1906) | 2 | 197 |
| Östergötlands runinskrifter (SRI band 2, 1911-1918) | 7 | 396 |
| Södermanlands runinskrifter (SRI band 3, 1924-1936) | 19 | 779 |
| Smålands runinskrifter (SRI band 4, 1935-1961) | 9 | 475 |
| Västergötlands runinskrifter (SRI band 5, 1940-1970) | 14 | 783 |
| Upplands runinskrifter del 1 (SRI band 6, 1940-1943) | 12 | 702 |
| Upplands runinskrifter del 2 (SRI band 7, 1943-1946) | 12 | 707 |
| Upplands runinskrifter del 3 (SRI band 8, 1949-1951) | 16 | 896 |
| Upplands runinskrifter del 4 (SRI band 9, 1953-1958) | 15 | 887 |
| Gotlands runinskrifter del 1 (SRI band 11, 1962) | 4 | 387 |
| Gotlands runinskrifter del 2 (SRI band 12, 1978) | 6 | 353 |
| Västmanlands runinskrifter (SRI band 13, 1964) | 3 | 135 |
| Närkes runinskrifter (SRI band 14:1, 1975) | 3 | 167 |
| Värmlands runinskrifter (SRI band 14:2, 1978) | 3 | 110 |
| Gästriklands runinskrifter (SRI band 15:1, 1981) | 4 | 243 |

## Kontroll och analysens gränser

- Varje analyserad fil har öppnats med PDFium, alla dess sidor har öppnats och kontrollsumman har verifierats på nytt mot hämtningen.
- 7 180 sidor innehåller text i det befintliga textlagret; 367 sidor har färre än 40 icke-blanka texttecken efter extraktion (även blankblad och bildplanscher räknas här).
- Totalt 14 049 271 texttecken utan blanktecken har extraherats. Ingen ny OCR har körts.
- En textsida från Öland och en plansch från Östergötland har dessutom kontrollerats visuellt. Provbilder finns under `underlag/runor/sri/provbilder/`.
- Öppningsbarhet och textmängd bevisar inte att OCR, sidordning, datering eller läsning är korrekt. Ingen fullständig vetenskaplig genomläsning av alla inskrifter har utförts.
- Textlager och planscher behöver kopplas till individuella runsignum. Koordinater har inte importerats eller konstruerats.

## Återkörning

Hämtning (Python 3 och curl):

```sh
python3 scripts/download-runinskrifter.py --workers 6
```

Analys (Python-miljö med `pypdfium2`):

```sh
python3 scripts/analyze-runinskrifter.py
```

Hämtverktyget jämför byteantal och SHA-256 innan en fil hoppas över. Analysverktyget återanvänder färdiga analyser med samma kontrollsumma. En ny ögonblicksbild av källsidan behövs om länkarna ska inventeras på nytt.
