# E28 — Integrera Resursbibliotek, grammatik och ordbok

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E28  
**Ansvar**: Sajtutvecklare och redaktör  
**Beroenden**: E07, E12, E17, E26 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och arkitektur

Etapp E28 integrerar Runsidan som en organisk och sammanhängande del av **svenska.dev / fornsvenska.se**:

1. **Källbiblioteksregister för Sveriges runinskrifter (SRI)**:
   - Modulen [`lib/runor/library.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/library.ts) etablerar en auktoritativ bibliografisk katalog över de SRI-band som ligger till grund för pilotbeståndet:
     - Band 1: *Ölands runinskrifter* (Sven Söderberg & Erik Brate, 1906)
     - Band 2: *Östergötlands runinskrifter* (Erik Brate, 1918)
     - Band 3: *Södermanlands runinskrifter* (Erik Brate & Elias Wessén, 1936)
     - Band 6–8: *Upplands runinskrifter* (Elias Wessén & Sven B.F. Jansson, 1943–1951)
     - Band 13: *Västmanlands runinskrifter* (Sven B.F. Jansson, 1964)
   - Varje post innehåller fullständig titel, författaruppgifter, utgivningsår, sidomfång och länk till digitala faksimil hos Riksantikvarieämbetet.
2. **Språkhistoriska korsreferenser till grammatik och språkliv**:
   - `RUNIC_LINGUISTIC_BRIDGES` etablerar vetenskapligt motiverade länkar mellan enskilda inskrifter och språkstudier på sajten:
     - **Vs 24 (Hassmyrastenen)**: Länkas till den interaktiva studien *Från person till person* (`/sprakliv/person-och-numerus`) för att belysa formerna `kumbr` (3 sg. pres.) och `raþr` i den fornnordiska utvecklingen före verbens synkretism.
     - **Ög 136 (Rökstenen)**: Länkas till *Grammatik* (`/grammatik`) för analys av stavrim och allittererande fornyrðislag.
     - **U 73 (Hansta)**: Länkas till *Språkråd* (`/sprakrad`) rörande fornspråkliga pronomen- och kasusstrukturer (`hann` / `honom`).
3. **Plats i sajtens huvudnavigation och startsida**:
   - Runsidan är tillgänglig i [`components/StudyFrame.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/StudyFrame.tsx) som standardflik.
   - Startsidan [`app/page.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/page.tsx) lyfter nu fram verket *Runor* med direktknapp och ingress i sektionen *Svenskan i livet & historien* samt i sidfoten.

---

## 2. Automatiserad verifiering ([`tests/runor-library.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-library.test.mjs))

Testsviten omfattar:
1. **Volymkartläggning**: Samtliga 20 inskrifter mappar mot registrerade, fullständiga SRI-volymer i biblioteket.
2. **Volymuppslag och filtrering**: `getInscriptionsForSourceVolume` returnerar exakt rätt antal inskrifter per band (t.ex. 8 för Band 1 Öland, 1 för Band 13 Västmanland).
3. **Korsreferenser och länksäkerhet**: Alla bryggor mappar till existerande signa och säkra interna rutter.

Utfall: **92 av 92 tester godkända** i `npm test`. Typecheck och Next.js produktionsbygge slutförs felfritt.
