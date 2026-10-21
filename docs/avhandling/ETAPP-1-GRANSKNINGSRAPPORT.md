# Etapp 1 – Granskningsrapport (Pilotdata för Tablå 28, Karta 10, Tablå 29, Figur 6 och kärnordlista)

Denna rapport dokumenterar primäravläsning och fristående andra kontroll (`A01.1`–`A01.6`) mot högupplösta renderingar av originalsidorna i Adam Horn af Åminnes doktorsavhandling *Från person till person. Avvecklingen av nordisk personkongruens ur ett diakront typologiskt perspektiv* (2022, SHA-256 `64b9980bac02a28377cf2297de91e180017eb7f74d1021688569f32ebc548284`).

---

## 1. Granskade originalsidor och kontrollmetod

1. **Primäravläsning**: Textutdrag (`pypdf`) kombinerat med visuell läsning av högupplösta sidrenderingar (216 DPI PNG) av sidorna 2, 4, 23, 28, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 160 och 161.
2. **Andra kontroll (dubbelkontroll)**: Varje fält i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts) och [`docs/avhandling/pilot-data-v1.json`](./pilot-data-v1.json) har jämförts cell för cell mot de renderade originalsidorna samt mot de automatiska valideringsreglerna i [`lib/thesis/validation.ts`](../../lib/thesis/validation.ts) och enhetstesterna i [`tests/thesis-pilot.test.mjs`](../../tests/thesis-pilot.test.mjs).

---

## 2. Cell-för-cell-kontroll av Tablå 28 (tryckt s. 147 / PDF-s. 147)

**Originalrubrik:** *Tablå 28. De sydvästsvenska paradigmens pluraländelser i indikativ.*

| Paradigm (kolumn) | Person (rad) | Råtext i cell (`rawCellText`) | Presens (`presentEnding`) | Preteritum (`pastEnding`) | Färgkod i originaltablån | Allomorfi & vokalkrock (s. 147, 152–155) | Kontrollstatus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **um-böjning** | `1p` | `-um` | `-um` | `-um` | Ljusorange | `-um`, `-om`, `-em` (obetonat i sammanhängande tal, s. 152), `-m` efter vokal (`vi kastam < kast-a-um`, s. 147, 153) | Dubbelkontrollerad (OK) |
| **um-böjning** | `2p` | `-e(n)` | `-e(n)` | `-e(n)` | Ljus blågrå | `-e` i norra um-området (prickskrafferat på Karta 10), `-en` i södra um-området; `-n` efter vokal i söder (`I kastan`, s. 153) | Dubbelkontrollerad (OK) |
| **um-böjning** | `3p` | `-a / -e` | `-a` | `-e` | Ljus olivgrön | `-a` i presens (samt ar-verbens preteritum p.g.a. vokalkrock `< kast-a-e`), `-e` i preteritum (starka verb, er-verb m.fl.) | Dubbelkontrollerad (OK) |
| **e-böjning** | `1p` | `-e(n)` | `-e(n)` | `-e(n)` | Ljus blågrå | `-e` i norra e-området (prickskrafferat på Karta 10), `-en` i södra e-området | Dubbelkontrollerad (OK) |
| **e-böjning** | `2p` | `-e(n)` | `-e(n)` | `-e(n)` | Ljus blågrå | `-e` i norra e-området, `-en` i södra e-området | Dubbelkontrollerad (OK) |
| **e-böjning** | `3p` | `-a / -e` | `-a` | `-e` | Ljus olivgrön | `-a` i presens, `-e` i preteritum (i norra e-området sammanfaller därmed 1p, 2p och 3p i preteritum `-e`, s. 160) | Dubbelkontrollerad (OK) |
| **skånsk böjning** | `1p` | `-a / -e` | `-a` | `-e` | Ljus olivgrön | `-a` i presens, `-e` i preteritum (synkretism med 3p) | Dubbelkontrollerad (OK) |
| **skånsk böjning** | `2p` | `-e(n)` | `-e(n)` | `-e(n)` | Ljus blågrå | I det sammanhängande skånska området så gott som alltid `-en` med bevarat `/n/` (s. 154); `-e` i nordligt ströbelägg (Ods sn, VG) | Dubbelkontrollerad (OK) |
| **skånsk böjning** | `3p` | `-a / -e` | `-a` | `-e` | Ljus olivgrön | `-a` i presens, `-e` i preteritum | Dubbelkontrollerad (OK) |
| **a-böjning** | `1p` | `-a / -e` | `-a` | `-e` | Ljus olivgrön | `-a` i presens, `-e` i preteritum (ren numeruskongruens) | Dubbelkontrollerad (OK) |
| **a-böjning** | `2p` | `-a / -e` | `-a` | `-e` | Ljus olivgrön | `-a` i presens, `-e` i preteritum | Dubbelkontrollerad (OK) |
| **a-böjning** | `3p` | `-a / -e` | `-a` | `-e` | Ljus olivgrön | `-a` i presens, `-e` i preteritum | Dubbelkontrollerad (OK) |

---

## 3. Kontroll av Tablå 29 (tryckt s. 153 / PDF-s. 153)

**Originalrubrik:** *Tablå 29. Indikativ och imperativ personböjning i södra um-området*

Samtliga fem exempelverb i `referenceExampleTabla29` har kontrollerats mot den renderade tabellen på s. 153:

- **kopula (`vara`)**:
  - Presens indikativ: `1s ä`, `2s ä(st)`, `3s ä`, `1p äm`, `2p än`, `3p ä`
  - Preteritum indikativ: `1s va`, `2s va(st)`, `3s va`, `1p vôrum`, `2p vôren`, `3p vôre`
  - Imperativ: `2s va!`, `2p van!`
- **hjälpverb (`kunna`)**:
  - Presens indikativ: `1s kann`, `2s kann((s)t)`, `3s kann`, `1p kunnum`, `2p kunnen`, `3p kunna`
  - Preteritum indikativ: `1s kunde`, `2s kunde(st)`, `3s kunde`, `1p kundum`, `2p kunden`, `3p kunde`
  - Imperativ: `2s –`, `2p –`
- **starka (`ge`)**:
  - Presens indikativ: `1s ger`, `2s ger`, `3s ger`, `1p gem`, `2p gen`, `3p ge`
  - Preteritum indikativ: `1s ga`, `2s ga(st)`, `3s ga`, `1p gôvum`, `2p gôven`, `3p gôve`
  - Imperativ: `2s ge!`, `2p gen!`
- **svaga, kolumn 1 (`kasta`)**:
  - Presens indikativ: `1s kastar`, `2s kastar`, `3s kastar`, `1p kastum`, `2p kasten`, `3p kasta`
  - Preteritum indikativ: `1s kasta`, `2s kasta(st)`, `3s kasta`, `1p kastam`, `2p kastan`, `3p kasta`
  - Imperativ: `2s kasta!`, `2p kasten!`
- **svaga, kolumn 2 (`dömma`)**:
  - Presens indikativ: `1s dömmer`, `2s dömmer`, `3s dömmer`, `1p dömmum`, `2p dömmen`, `3p dömma`
  - Preteritum indikativ: `1s dömde`, `2s dömde(st)`, `3s dömde`, `1p dömdum`, `2p dömden`, `3p dömde`
  - Imperativ: `2s dömm!`, `2p dömmen!`

---

## 4. Kontroll av Karta 10 (tryckt s. 148 / PDF-s. 148) samt s. 147–158

**Originalrubrik:** *Karta 10. Plural indikativ i Sydvästsverige.*

1. **Fyra huvudområden och färgkodning i originalet**:
   - **um-området (rött)**: Sydligaste Västergötland (södra/mellersta Mark, sydvästra Kind), norra delen av mellersta Halland samt västligaste Småland (bl.a. Burseryds sn i Västbo hd).
   - **e-området (blått)**: Omgärdar `um-området` i södra Västergötland, mellersta/norra Halland, sydvästra Småland, nordöstra Skåne (norra Östra Göinge) och västra Blekinge (Listers hd).
   - **det skånska området (lila)**: Skåne (utom nordostligaste hörnet och det ofärgade sydvästra området med enhetsböjning), södra Halland och sydvästligaste Småland.
   - **a-området (grönt)**: Smalt ytterbälte längs `e-områdets` nord- och östgräns i Västergötland och Småland, exklav i Ale härad samt västra/mellersta Blekinge öster om Lister.
2. **Prickskraffering (`-e(n)` saknar `/n/`)**:
   - Täcker norra delen av `um-området` och norra delen av `e-området` norr om den vågformade gräns där Halland, Västergötland och Småland möts.
3. **Fotnot 81 (s. 147) – indirekt härledda ytterområden**:
   - `subarea-e-norra-halland-inferred-fn81` och `subarea-a-blekinge-inferred-fn81` är registrerade med `evidenceStatus: "inferred_from_neighbor"`, `patternStyle: "hatched_inferred"` och `footnotes: [81]`.
4. **Exklaven i Ale härad och källkritiska nyanser**:
   - `subarea-a-ale-harad-exklav` dokumenterar att Ale härad har grön markering på Karta 10 (s. 148) men saknas på Karta 11 (s. 150, typordlistor) och Karta 14 (s. 158, presens), eftersom numerusböjning i OSDs samlingar från Ale härad endast är belagd i preteritum (s. 158).
5. **Dokumenterade undantag och avvikande typer**:
   - `2a-böjning` i Hössna och Strängsereds sn (Redvägs hd, VG, s. 155–156).
   - `generaliserad e-böjning` (`1p = 2p = 3p -en`) i Bergs sn (Norrvidinge hd, SM), Södra Sandsjö sn (Konga hd, SM) och Hällaryds sn (Bräkne hd, BL, s. 156–157).
   - Nordliga ströbelägg på skånsk böjning i Hångers sn (Östbo hd, SM) och Ods sn (Gäsene hd, VG, s. 154).
   - Belägg på a-böjning i Osby sn (Östra Göinge hd, SK, s. 155).

---

## 5. Kontroll av Figur 6 (tryckt s. 160 / PDF-s. 160)

**Originalrubrik:** *Figur 6. Den analogiska utvecklingen från um-böjning till e-böjning respektive skånsk böjning och sedan a-böjning.*

- **Utgångsläge i mitten**: `um-böjning` (`-um`, `-en`, `-a`).
- **Vänster gren**: `um-böjning` → `e-böjning` (`-en`, `-en`, `-a`; pil från 2p `-en` till 1p) → `a-böjning` (`-a`, `-a`, `-a`; pilar från 3p `-a` till 1p och 2p).
- **Höger gren**: `um-böjning` → `skånsk böjning` (`-a`, `-en`, `-a`; pil från 3p `-a` till 1p) → `a-böjning` (`-a`, `-a`, `-a`; pil från 3p `-a` till 2p, med fotnot 89 om att 1p `-a` har en sekundär roll).
- **Modellförbehåll**: Registrerat i `isModelNotIndividualFilmNote` så att modellen aldrig presenteras som en kronologisk inspelning av en enskild individ.

---

## 6. Logg över avvikelser och observationer under Etapp 1

1. **Inga avvikelser mellan `pilot-data.ts` / `pilot-data-v1.json` och original-PDF:en**: Alla 12 celler i Tablå 28, alla 5 verb i Tablå 29, alla 4 regioner på Karta 10 och alla 4 steg i Figur 6 stämmer exakt med originalet efter andra kontrollen.
2. **Observation inför Etapp 6 (kartnumrering i kap. 7.2 på s. 156–161)**: Under sidkontrollen av kap. 7 noterades att avhandlingens löpande kartnumrering i kap. 7.1.5–7.3 har en förskjutning jämfört med illustrationsförteckningen i avhandlingens början (t.ex. finns på s. 156 *Karta 13. Två avvikande sydvästsvenska böjningstyper* och på s. 157 *Karta 14. Belagda former på -en i 3 person indikativ*). Detta påverkar **inte** Karta 10 (s. 148), Karta 11 (s. 150) eller Karta 12 (s. 151), men ska kontrolleras systematiskt när de senare fördjupningskartorna granskas i Etapp 6.

---

## 7. Signering av Etapp 1

- **Primäravläsning utförd:** 2026-10-19 (visuell läsning av 216 DPI PNG-renderingar + textextrakt)
- **Andra kontroll utförd:** 2026-10-19 (validerad med `validateThesisPilotEdition`, 18/18 tester godkända, `tsc --noEmit` utan fel)
- **Beslut:** Pilotdata i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts) och [`docs/avhandling/pilot-data-v1.json`](./pilot-data-v1.json) är godkända som källkritiskt verifierad grund för **Etapp 2** (informationsarkitektur, källpanel och redaktionell granskningsvy) och **Etapp 3** (interaktiv pilot för Karta 10, Tablå 28 och Figur 6).
