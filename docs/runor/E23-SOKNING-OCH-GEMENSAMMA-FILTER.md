# E23 — Implementera sökning och gemensamma filter

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E23  
**Ansvar**: Frontend- och datautvecklare  
**Beroenden**: E14, E20, E22 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och arkitektur

Etapp E23 etablerar en gemensam, källtrogen frågemodell och filtermotor för Runsidan på fornsvenska.se. Samma underliggande frågemotor styr sökning och urval i både listvyn, tabellvyn och kartvyn, vilket garanterar att samma urval och samma antal redovisas oavsett representationsform (i enlighet med krav **K07** och Avsnitt 9.6).

Huvudprinciper:
1. **Bevara källtext intakt**: Diakritik- och accenttolerant sökning sker via härledda söknycklar i minnet. Källans originalortografi och runologiska tecken (`þ`, `ð`, `ǫ`, ligaturer, versaler) visas alltid oförändrade för besökaren.
2. **Källtrogen tidsfiltrering (Avsnitt 9.4)**:
   - Slutna intervall: En inskrift med datering $[a, b]$ matchar ett sökfönster $[s, e]$ omm $a \le e$ och $b \ge s$ (tidsmässig överlappning).
   - Inga påhittade mittpunkter! En bred datering (t.ex. 950–1050) visas över hela sitt intervall och tilldelas inget fiktivt mittpunktsår.
   - Okänd datering hanteras som en separat grupp som kan väljas till/från utan att förvanskas till ett specifikt sekel.
3. **Märkta träfforsaker**: När en fritextsökning matchar redovisar motorn varför träffen uppstod (`signum`, `namn`, `alias`, `ort`, `tolkning`, `translitterering` eller `ristare`).
4. **Tydlig redovisning av kartläge (Avsnitt 9.6)**: Resultaträknaren anger både det totala antalet matchade inskrifter och delmängden med känt kartläge (t.ex. ”20 inskrifter matchar (17 med känt kartläge)”).

---

## 2. Den gemensamma frågemotorn ([`lib/runor/search.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/search.ts))

### 2.1 Teckennormalisering och söknycklar
Funktionen `normalizeSearchString(str)` utför deterministisk normalisering:
- Normaliserar till Unicode NFD för att separera kombinerande accenter (`\u0300-\u036f`), strippar accenterna och återgår till NFC.
- Ersätter fornnordiska/isländska specialtecken med sökbara ekvivalenter:
  - `Þ`/`þ` $\to$ `th`
  - `Ð`/`ð` $\to$ `d`
  - `Ǫ`/`ǫ` $\to$ `o`
  - `Æ`/`æ` $\to$ `ae`
  - `Ø`/`ø` $\to$ `o`
- Diakritik-okänslig: sökning på `ol 1`, `so 179` eller `karlevi` matchar `Öl 1`, `Sö 179` respektive `Karlevi`.
- Suffixhantering: `normalizeSignumKey` tillåter sökning på `u 112` för att hitta `U 112B`.

### 2.2 Tidsfilterfunktion: `matchesDatingInterval`
Följer specifikationen i Avsnitt 9.4:
- $950–1050$ mot $1000–1100$: **Matchar** ($950 \le 1100$ och $1050 \ge 1000$).
- $950–1050$ mot $1050–1100$: **Matchar** (gränsår enligt slutet intervall).
- $950–1050$ mot $1051–1100$: **Matchar inte** ($1050 < 1051$).
- Okänd datering ($earliestYear = null$): Ingår inte i det numeriska fönstret om inte `includeUnknown = true` har valts.

### 2.3 Frågeexekverare: `executeRunicQuery`
Tar emot `RunicInscription[]` och `RunicFilterCriteria`, och returnerar ett strukturerat `RunicQueryResult`:
- `items`: Matris med samtliga matchade inskrifter.
- `totalMatched`: Totalt antal träffar.
- `totalWithCoordinates`: Antal träffar med kända koordinater.
- `matchReasons`: `Map<string, MatchReason[]>` som kopplar inskrifts-ID till matchningskategorier.
- `activeFilterCount`: Antal aktiva filterregler.
- `hasFilters`: Boolesk flagga för snabb kontroll av grundtillstånd.

---

## 3. Klientintegration ([`components/runor/RunorDirectoryClient.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorDirectoryClient.tsx))

Katalogen har uppdaterats för att nyttja frågemotorn:
1. **Fritextfält**: Blixtsnabb sökning mot signum, namn, alias, ort, translitterering och svensk översättning.
2. **Träfforsaksbrickor**: På kort och i tabell visas diskreta brickor (t.ex. *Träff: Tolkning*, *Träff: Alias/Litteratur*, *Träff: Plats/Ort*).
3. **Interaktiv tidsväljare**: Utfällbar panel med intervallväljare (från år / till år) och kryssruta för att inkludera inskrifter med okänd/bred datering.
4. **Koordinatfilter**: Valbart läge för att visa *Alla lägen*, *Bara med känt kartläge* eller *Bara saknat läge / sockencentrum*.
5. **Rensa alla filter**: Återställer momentant samtliga kontroller och sökfält till grundläget.
6. **Informativt tomt läge**: Om en sökning eller motstridiga filter ger noll träffar förklaras orsaken tydligt med råd om att vidga kriterierna samt en direktknapp för att nollställa.

---

## 4. Automatiserade regressionstester ([`tests/runor-search.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-search.test.mjs))

Testsviten omfattar 9 deltester:

```text
✔ E23: Normalisering hanterar Ö/ö, diakritik och specialtecken (1.5 ms)
✔ E23: Sökning på signum, suffix och diakritik-okänsliga former (6.1 ms)
✔ E23: Sökning på litteratursignum och äldre alias (Bautil, Liljegren, Karlevi) (3.1 ms)
✔ E23: Sökning i tolkning och runtext (1.2 ms)
✔ E23: Tidsfilter enligt Avsnitt 9.4 (slutna intervall [s, e] mot [a, b]) (0.1 ms)
✔ E23: Tom sökning returnerar exakt hela beståndet med noll filter (0.1 ms)
✔ E23: Motstridiga filter ger tydligt tomt resultat utan fel (0.1 ms)
✔ E23: Kartans och listans grundmängd är identisk (0.1 ms)
✔ E23: Fuzzy sökning slår aldrig ihop eller raderar inskriftsidentiteter (0.1 ms)
```

Bygg- och typtester:
- **`npm test`**: **69/69 tester passerar grönt (100 %)**.
- **`npm run typecheck`**: **0 fel**.
- **`npm run build`**: **26/26 sidor genererade felfritt på 767 ms**.

---

## 5. Uppfyllda godkännandekrav

| Krav enligt RUNSIDA_PLAN.md | Utfall | Evidens |
|---|---|---|
| Testfall täcker Ö/ö, diakritik, suffix och litteratursignum | **UPPFYLLT** | Test 1, 2, 3: Verifierat för Öl 1, U 112B, Sö 179, Bautil, Liljegren, Karlevi. |
| Tom sökning och motstridiga filter | **UPPFYLLT** | Test 6, 7: Tom sökning ger hela korpusen; motstridiga filter ger 0 träffar utan krasch. |
| Kartans och listans grundmängd är identisk | **UPPFYLLT** | Test 8: Samma `items` och strikt redovisat `totalWithCoordinates`. |
| Inga fiktiva mittpunkter för dateringar | **UPPFYLLT** | Test 5: Slutna intervall enligt Avsnitt 9.4; okänd datering hanteras som explicit grupp. |
| Fuzzy sökning väljer eller slår aldrig ihop inskrifter | **UPPFYLLT** | Test 9: Stabila interna ID:n bevaras alltid unika; inga oavsiktliga sammanslagningar. |

---

## 6. Slutsats

Etapp **E23** är härmed fullständigt genomförd, verifierad och **GODKÄND**.
