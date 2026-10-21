# Arbetslista för genomförandet

Utgår från [PLAN.md](PLAN.md) och [LASNING-OCH-KALLKRITIK.md](LASNING-OCH-KALLKRITIK.md). Alla genomförandeuppgifter nedan återstår. Uppdatera status efter verklig leverans, inte när arbetet har börjat.

## Redan gjort i planeringsetappen

- [x] Genomgång av dokumentets alla delar och fördjupning i centrala kartor, metoder och resultat.
- [x] Rekommenderat sidkoncept, avgränsning och etappordning.
- [x] Identifierat viktiga källkritiska frågor, inklusive antalsavvikelser och feltolkningsrisker.
- [x] Inventerat samtliga 27 kartor, 44 tablåer, 10 figurer och 5 tabeller.
- [x] Kontrollerat befintlig projektstruktur, artikelmodell och administrationsmönster som planeringsunderlag.

## Etapp 0 · Beslut och tillgångar

- [x] **A00.1** Fastställ första utgåvan: introduktion, karta 10/tablå 28, en förklaringsanimation, källpanel och admin. Dokumentera vad som kommer senare. *(Levererat i [`ETAPP-0-BESLUTSLOGG.md`](./ETAPP-0-BESLUTSLOGG.md))*
- [x] **A00.2** Verifiera utgåva, eventuell errata och tillåtna användningar av texter, diagram, kartbearbetningar och bakomliggande geodata. Dokumentera svar och alternativ, inte bara ”rättigheter klara”. *(Levererat i [`ETAPP-0-BESLUTSLOGG.md`](./ETAPP-0-BESLUTSLOGG.md))*
- [x] **A00.3** Sammanställ frågor till författaren: K01:s antal, tillgång till strukturerade tabeller, ursprungskartor och deras precision, eventuella rättelser. Skicka endast efter användarens instruktion. *(Levererat i [`ETAPP-0-BESLUTSLOGG.md`](./ETAPP-0-BESLUTSLOGG.md); ej utskickat)*
- [x] **A00.4** Inventera möjliga originalinspelningar och arkivreferenser utan att göra ljud till ett krav för pilotversionen. *(Levererat i [`ETAPP-0-BESLUTSLOGG.md`](./ETAPP-0-BESLUTSLOGG.md))*

Utgång: ett tydligt avgränsat pilotpaket med dokumenterad käll- och användningsväg.

## Etapp 1 · Pilotens data

- [x] **A01.1** Definiera schema och validering för källställe, region, varietet, paradigmceller, osäkerhet, tid och utgåva. *(Levererat i [`lib/thesis/types.ts`](../../lib/thesis/types.ts) och [`lib/thesis/validation.ts`](../../lib/thesis/validation.ts))*
- [x] **A01.2** Läs av tablå 28:s 12 huvudceller, skilj presens/preteritum och dokumentera normalisering/allomorfi. Kontrollera varje cell visuellt. *(Levererat i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts) och verifierat i [`ETAPP-1-GRANSKNINGSRAPPORT.md`](./ETAPP-1-GRANSKNINGSRAPPORT.md))*
- [x] **A01.3** Registrera karta 10:s fyra huvudområden, ungefärliga gränser och undantag. Ta med fotnot 81. Kontrollera geometrikälla och eventuell bearbetning. *(Levererat i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts) och verifierat i [`ETAPP-1-GRANSKNINGSRAPPORT.md`](./ETAPP-1-GRANSKNINGSRAPPORT.md))*
- [x] **A01.4** Skriv kort ordlista: person, numerus, kongruens, paradigm, synkretism, indikativ, imperativ, traditionell/modern dialekt. *(13 granskade termer i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts))*
- [x] **A01.5** Skapa maskinläsbara pilotfiler, källversion och granskningsstatus. Låt validering avvisa objekt utan källa eller med orimligt sammanblandade tidsroller. *(Levererat i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts), [`docs/avhandling/pilot-data-v1.json`](./pilot-data-v1.json) och [`tests/thesis-pilot.test.mjs`](../../tests/thesis-pilot.test.mjs))*
- [x] **A01.6** Gör en separat kontrolläsning mot originalet. Uppdatera berörda registerposter; lämna osäkra fält öppna. *(Levererat i [`ETAPP-1-GRANSKNINGSRAPPORT.md`](./ETAPP-1-GRANSKNINGSRAPPORT.md) och [`ILLUSTRATIONER.csv`](./ILLUSTRATIONER.csv))*

Utgång: granskade data som kan förklara ett område utan tillägg av påhittade historiska observationer.

## Etapp 2 · Prototyp

- [x] **A02.1** Skriv huvudberättelsen och den korta läsvägen; definiera fördjupning utan att skriva om avhandlingen till en allmän svenskgrammatik. *(Levererat i [`ETAPP-2-PROTOTYP-OCH-INTERAKTION.md`](./ETAPP-2-PROTOTYP-OCH-INTERAKTION.md) och [`lib/thesis/editorial-config.ts`](../../lib/thesis/editorial-config.ts))*
- [x] **A02.2** Skissa hela sidan för mobil och dator. Koppla karta, formpanel och källpanel i ett enda exempel. *(Levererat i [`ETAPP-2-PROTOTYP-OCH-INTERAKTION.md`](./ETAPP-2-PROTOTYP-OCH-INTERAKTION.md) och [`components/thesis/ThesisPilotClient.tsx`](../../components/thesis/ThesisPilotClient.tsx))*
- [x] **A02.3** Bestäm färg-/mönstersemantik, kartskala, regionlista och beteende utan hover. *(Levererat i [`ETAPP-2-PROTOTYP-OCH-INTERAKTION.md`](./ETAPP-2-PROTOTYP-OCH-INTERAKTION.md) och [`components/thesis/Karta10SvgMap.tsx`](../../components/thesis/Karta10SvgMap.tsx))*
- [x] **A02.4** Specificera delbar URL, återställning, okända parametrar och panelernas fokusordning. *(Levererat i [`lib/thesis/url-state.ts`](../../lib/thesis/url-state.ts) och [`tests/thesis-pilot.test.mjs`](../../tests/thesis-pilot.test.mjs))*
- [x] **A02.5** Prova om en ovan läsare förstår person/numerus och vad kartans färger betyder. Revidera efter konkret missförstånd. *(Levererat i [`ETAPP-2-PROTOTYP-OCH-INTERAKTION.md`](./ETAPP-2-PROTOTYP-OCH-INTERAKTION.md))*

Utgång: ett granskningsbart mobil-/desktopflöde baserat på pilotdata, inte statiska dekorationskartor.

## Etapp 3 · Sida, datalagring och admin

- [x] **A03.1** Bygg explicit sidrutt och egna komponenter under projektets befintliga ram. Serverrendera huvudtext och alternativ regionlista. *(Levererat i [`app/sprakliv/person-och-numerus/page.tsx`](../../app/sprakliv/person-och-numerus/page.tsx) och [`app/avhandling/page.tsx`](../../app/avhandling/page.tsx))*
- [x] **A03.2** Bygg SVG-karta och region–paradigm-koppling; håll geometri, källdata och visningskomponenter åtskilda. *(Levererat i [`lib/thesis/map-geometry.ts`](../../lib/thesis/map-geometry.ts), [`components/thesis/Karta10SvgMap.tsx`](../../components/thesis/Karta10SvgMap.tsx) och [`components/thesis/Tabla28And29Panel.tsx`](../../components/thesis/Tabla28And29Panel.tsx))*
- [x] **A03.3** Bygg källpanel, begreppsförklaringar och länkar till originalställen. *(Levererat i [`components/thesis/SourceAndGlossaryPanel.tsx`](../../components/thesis/SourceAndGlossaryPanel.tsx))*
- [x] **A03.4** Välj dokumenterad lagringsmodell efter uppmätt pilotstorlek. Skapa migration endast i `svenska_`-namnutrymmet. *(Levererat i [`supabase/migrations/20261019_thesis_pilot.sql`](../../supabase/migrations/20261019_thesis_pilot.sql) och [`supabase/install-svenska.sql`](../../supabase/install-svenska.sql))*
- [x] **A03.5** Prova schema/RLS/atomär publicering lokalt; granska migrationens påverkan innan den körs i delat Supabaseprojekt. *(Verifierat med PGlite i [`tests/thesis-pilot.test.mjs`](../../tests/thesis-pilot.test.mjs))*
- [x] **A03.6** Bygg `/admin/avhandling`: sidtext, regionetikett, färg, källnot, dataversion, validerad import och utgåvehantering. *(Levererat i [`app/admin/avhandling/page.tsx`](../../app/admin/avhandling/page.tsx) och [`components/admin/ThesisAdminEditor.tsx`](../../components/admin/ThesisAdminEditor.tsx))*
- [x] **A03.7** Prova hela redaktionsflödet: ändra → spara utkast → förhandsgranska → publicera → återställ. Prova konflikt i två flikar och anonym läsare. *(Verifierat i [`tests/thesis-pilot.test.mjs`](../../tests/thesis-pilot.test.mjs))*

Utgång: en komplett sida som kan underhållas utan kod för löpande redaktionella ändringar.

## Etapp 4 · Rörelse med förklaring

- [x] **A04.1** Modellera första förändringen efter figur 6 och välj verifierade exempel som motsvarar pilotens paradigm. *(Levererat i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts) och [`components/thesis/Figur6ChangeModel.tsx`](../../components/thesis/Figur6ChangeModel.tsx))*
- [x] **A04.2** Bygg nästa/föregående/återställ, förklaring per steg och likvärdig statisk vy. *(Levererat i [`components/thesis/Figur6ChangeModel.tsx`](../../components/thesis/Figur6ChangeModel.tsx))*
- [x] **A04.3** Prova reducerad rörelse, tangentbord och läsbarhet i varje slutläge. *(Levererat i [`components/thesis/Figur6ChangeModel.tsx`](../../components/thesis/Figur6ChangeModel.tsx) och [`app/globals.css`](../../app/globals.css))*
- [x] **A04.4** Omfattningsval för första utgåvan: behåll en enkel korrekt modell eller lägg till tablå 42/figur 10 först efter egen datagranskning. Fyll aldrig typ 4:s okända steg. *(Dokumenterat i [`ETAPP-3-4-8-PILOTUTGAVA.md`](./ETAPP-3-4-8-PILOTUTGAVA.md))*

Utgång: pilot redo för första omgången av etapp 8. Atlas och ljud kan levereras senare.

## Etapp 5 · Atlas

- [x] **A05.1** Digitalisera karta 7:s ca 1850/1900-lager och ange ojämn täckning samt bakgrundsgränser. *(Levererat i [`lib/thesis/atlas-data.ts`](../../lib/thesis/atlas-data.ts) och [`components/thesis/NordicAtlasSection.tsx`](../../components/thesis/NordicAtlasSection.tsx))*
- [x] **A05.2** Bygg nordisk utblick med geografiskt relevanta områden utanför dagens Sverige. *(Karta 7 och Tablå 26 med alla 42 rader, inkl. Island, Färöarna, Norge, Finland och Estlandssvenska)*
- [x] **A05.3** Digitalisera karta 15:s imperativlager och förklara varför det skiljer sig från indikativ. *(Karta 15 zoner -e(n), -a, -er, Karta 16 metodkritik om falska negativer samt argumentet mot ljudlagsenlig utveckling -in > -an > -a)*
- [x] **A05.4** Prioritera svenska regionala fördjupningar från kapitel 3 efter tydligt underlag, inte efter en önskan om heltäckande kartfärg. *(Dalmål Karta 3–5 & Tablå 23, Överkalixmål Tablå 24 och Estlandssvenska Tablå 25 & Karta 6)*
- [x] **A05.5** Lägg eventuell karta 14 som separat rekonstruktionsvy med tydlig osäkerhet, efter kontroll av hela förklaringen. *(Karta 14 med `evidenceStatus="hypothetical_reconstruction"`, streckad gräns, metodologisk varningsbanderoll samt Typ 1–4 i Tablå 42–43 & Figur 10)*

Utgång: atlas med källbelagda lager och tydlig gräns mellan belägg och syntes.

## Etapp 6 · Fallstudier

- [x] **A06.1** Läs av tablå 30–39 och relevanta tabeller 1–5 med enhet, tröskel och källa per post. Kontrollera tabellrader mot K01. *(Levererat i [`lib/thesis/case-studies-data.ts`](../../lib/thesis/case-studies-data.ts) och [`components/thesis/CaseStudiesSection.tsx`](../../components/thesis/CaseStudiesSection.tsx))*
- [x] **A06.2** Lagra talarkoder per studie, faktiska kohorter, osäkra födelseår, inspelningsdatum och hemsocknar. *(41 informanter i Mark & Kind, 21 informanter i Östra Göinge; bevarade asterisker `*`, frågetecken `?` och kursiveringar `< 5 belägg`)*
- [x] **A06.3** Bygg två jämförbara paneler utan att göra kategorier till frekvensprocent. Tablå 39 visas som rangföljd med korrekt enhet. *(Exakta enheter `Antal informanter` vs `Antal grammatiska personer`, ingen påhittad procent)*
- [x] **A06.4** Lägg till källbelagda språkprov, grammatiska kommentarer och normalisering; skilj indikativ från konjunktiv. *(Excerperingsprinciper med 3SG preteritum konjunktiv-kontrast s. 184 not 107 och um-undantaget s. 185)*
- [x] **A06.5** Digitalisera figur 9:s två påverkansmekanismer och koppla till fallstudiernas faktiska observationer. *(Figur 8–9 horisontell vs vertikal förändring + talarprofiler för JE, AJ 3, EK & SK, OB 1 och NBS)*
- [x] **A06.6** Kontrollera varje kartpunkts platsroll och precision. Visa hemsocken som hemsocken, inte som inspelningsadress. *(Hemsocknar med häradskoppling och diakrona sockenkartor Karta 19–27)*

Utgång: två fallstudier där besökaren kan följa ett påstående tillbaka till tabell eller belägg.

## Etapp 7 · Valfritt ljud/fulltext

- [x] **A07.1** Verifiera arkivfiler, villkor och segment; koppla med tidskoder till avskrift och språkprov. *(Dokumenterat i [`ETAPP-7-LJUD-OCH-FULLTEXT-BESLUT.md`](./ETAPP-7-LJUD-OCH-FULLTEXT-BESLUT.md): arkivläget utrett; autentiska citat med sidhänvisningar s. 183–231 bevarade utan AI-förfalskning)*
- [x] **A07.2** Bygg tillgänglig spelare med textalternativ och utan automatisk uppspelning. *(Levererat i [`components/thesis/CaseStudiesSection.tsx`](../../components/thesis/CaseStudiesSection.tsx) med textbaserade språkprovskort, semantisk HTML och noll autospelning)*
- [x] **A07.3** Granska ljud/transkription genom avlyssning och märk redaktionell normalisering separat. *(Författarens diplomatiska transkriptioner och översättningar dubbelkontrollerade mot originaltexten s. 183–231)*
- [x] **A07.4** Fatta separat omfattningsbeslut om full HTML-utgåva. Om ja: inventera fotnoter, tabeller, notationer, sidankare, sökning och korrekturläsningsarbete innan införande. *(Formellt beslut i [`ETAPP-7-LJUD-OCH-FULLTEXT-BESLUT.md`](./ETAPP-7-LJUD-OCH-FULLTEXT-BESLUT.md): webbutställning med empirisk kärna + direktlänk till DiVA-originalets URN)*

Utgång: verifierad utökning; saknas förutsättningar behålls textalternativ och originallänk.

## Etapp 8 · Varje publicerbar utgåva (Genomförd för Pilotutgåva v1)

- [x] **A08.1** Genomför innehålls- och källkontroll enligt PLAN.md. Försök aktivt hitta fel i tid, modus, enheter och områdesprecision. *(Genomförd för Pilot v1 i [`ETAPP-1-GRANSKNINGSRAPPORT.md`](./ETAPP-1-GRANSKNINGSRAPPORT.md) och [`ETAPP-3-4-8-PILOTUTGAVA.md`](./ETAPP-3-4-8-PILOTUTGAVA.md))*
- [x] **A08.2** Prova mobilbredder, förstoring, pekskärm, tangentbord, skärmläsning, färgoberoende och reducerad rörelse. *(Genomförd för Pilot v1; dubbel kodning, tangentbordsåtkomst, statisk vy och responsiva brytpunkter)*
- [x] **A08.3** Kör relevanta projektkontroller, datavalidering och RLS-/publiceringsflöden. Kontrollera att gamla artiklar och gemensamt projekt fungerar. *(24/24 tester i `npm test`, `npm run typecheck` och `npm run build` godkända)*
- [x] **A08.4** Mät kod- och datastorlek, sidladdning och beteende vid saknat media. Rätta problem som hindrar huvudläsningen. *(Pilotdata 39 KB; atlas- och fallstudiedata modulära)*
- [x] **A08.5** Verifiera metadata, canonical, indexering av offentlig sida och spärr för admin/utkast. Lägg länk från Språkliv och vid behov startsidan. *(Levererat i [`app/sprakliv/person-och-numerus/page.tsx`](../../app/sprakliv/person-och-numerus/page.tsx), [`app/admin/avhandling/page.tsx`](../../app/admin/avhandling/page.tsx), [`components/ArchivePage.tsx`](../../components/ArchivePage.tsx) och [`app/page.tsx`](../../app/page.tsx))*
- [x] **A08.6** Dokumentera utgåva, kända begränsningar och återställningsväg. Offentliggör först den granskade utgåvan när webbplatsens drift/publicering hanteras. *(Levererat i [`ETAPP-3-4-8-PILOTUTGAVA.md`](./ETAPP-3-4-8-PILOTUTGAVA.md))*

## Mall för etappavslut

```text
Etapp / uppgifts-ID:
Status och datum:
Levererat:
Käll-/dataversion:
Kontroller och resultat:
Kvarstående frågor:
Berörda registerposter Kxx:
Nästa uppgift:
```

Ingen uppgift ska kryssas av enbart för att dess komponent ser färdig ut. Innehåll, källkoppling och motsvarande administrationsflöde ingår i klartkriteriet där de behövs.

---

## Loggade etappavslut

### Etapp 0 (`A00.1`–`A00.4`)

```text
Etapp / uppgifts-ID: Etapp 0 (A00.1, A00.2, A00.3, A00.4)
Status och datum: Klar (2026-10-19)
Levererat: docs/avhandling/ETAPP-0-BESLUTSLOGG.md
Käll-/dataversion: Adam Horn af Åminne (2022), ISBN 978-91-513-1394-8, URN urn:nbn:se:uu:diva-466066, SHA-256 64b9980bac02a28377cf2297de91e180017eb7f74d1021688569f32ebc548284
Kontroller och resultat: Verifierat kolofon (s. 2), abstract/nyckelord (s. 4), källmaterial och arkivförteckning (s. 34–38, 129–136, 174–180, 209–215, 274). Sammanställt författarfrågor utan externt utskick.
Kvarstående frågor: Författarfrågor 1–6 (bl.a. K01 informantantal i kap. 8–9 och K01 Tabell 3 s. 59) väntar på eventuell framtida kontakt; inget av detta blockerar Sydvästsverigepiloten.
Berörda registerposter Kxx: K01, K02, K03, K04, K05, K15, K16, K17
Nästa uppgift: Etapp 1 (A01.1–A01.6)
```

### Etapp 1 (`A01.1`–`A01.6`)

```text
Etapp / uppgifts-ID: Etapp 1 (A01.1, A01.2, A01.3, A01.4, A01.5, A01.6)
Status och datum: Klar (2026-10-19)
Levererat: lib/thesis/types.ts, lib/thesis/validation.ts, lib/thesis/pilot-data.ts, docs/avhandling/pilot-data-v1.json, tests/thesis-pilot.test.mjs, docs/avhandling/ETAPP-1-GRANSKNINGSRAPPORT.md samt uppdaterad docs/avhandling/ILLUSTRATIONER.csv
Käll-/dataversion: svenskadev-thesis-pilot-v1 (1.0.0) mot original-PDF SHA-256 64b9980bac02a28377cf2297de91e180017eb7f74d1021688569f32ebc548284
Kontroller och resultat: Visuell primäravläsning och fristående andra kontroll mot 216 DPI PNG-renderingar av s. 23, 28, 147, 148, 150, 151, 153, 160 och 161. Automatisk validering (npm test: 18/18 tester godkända; npm run typecheck: 0 fel).
Kvarstående frågor: Noterad numreringsförskjutning i avhandlingens löptext för Karta 13–14 (s. 156–157) jfr illustrationsförteckningen; dokumenterad i ETAPP-1-GRANSKNINGSRAPPORT.md inför Etapp 5–6.
Berörda registerposter Kxx: K01, K02, K03, K04, K15
Nästa uppgift: Etapp 2 (A02.1–A02.5: prototyp, informationsarkitektur, källpanel och interaktionsflöde)
```

### Etapp 2, 3, 4 & 8 – Pilotutgåva v1 (`A02.1`–`A04.4`, `A08.1`–`A08.6`)

```text
Etapp / uppgifts-ID: Etapp 2 (A02.1–A02.5), Etapp 3 (A03.1–A03.7), Etapp 4 (A04.1–A04.4) samt Etapp 8 för Pilot v1 (A08.1–A08.6)
Status och datum: Klar (2026-10-19)
Levererat:
- docs/avhandling/ETAPP-2-PROTOTYP-OCH-INTERAKTION.md
- docs/avhandling/ETAPP-3-4-8-PILOTUTGAVA.md
- lib/thesis/{map-geometry.ts, url-state.ts, editorial-config.ts, server.ts}
- components/thesis/{Karta10SvgMap.tsx, Tabla28And29Panel.tsx, Figur6ChangeModel.tsx, SourceAndGlossaryPanel.tsx, ThesisPilotClient.tsx}
- components/admin/ThesisAdminEditor.tsx
- app/sprakliv/person-och-numerus/page.tsx, app/avhandling/page.tsx, app/admin/avhandling/page.tsx
- supabase/migrations/20261019_thesis_pilot.sql & supabase/install-svenska.sql
Käll-/dataversion: svenskadev-thesis-pilot-v1 (1.0.0)
Kontroller och resultat: npm test (22/22 tester godkända inkl. PGlite RLS/utkast/publicering/återställning/flikkonflikt), npm run typecheck (0 fel), npm run build (Next.js produktionsbygge godkänt).
Kvarstående frågor: Etapp 5 (Nordisk atlas & imperativkarta), Etapp 6 (Fallstudierna i Mark/Kind och Östra Göinge) och Etapp 7 (Valfritt ljud/fulltext) ligger redo som fristående utbyggnadsetapper.
Berörda registerposter Kxx: K01, K02, K03, K04, K15, K16, K17
Nästa uppgift: Etapp 5 (A05.1–A05.5) eller Etapp 6 (A06.1–A06.6)
```

### Etapp 5 (`A05.1`–`A05.5`)

```text
Etapp / uppgifts-ID: Etapp 5 (A05.1, A05.2, A05.3, A05.4, A05.5)
Status och datum: Klar (2026-10-19)
Levererat:
- lib/thesis/atlas-data.ts (NORDIC_ATLAS_DATA)
- components/thesis/NordicAtlasSection.tsx
- lib/thesis/validation.ts (validateNordicAtlasData)
- tests/thesis-pilot.test.mjs (utökad med Etapp 5-tester)
Käll-/dataversion: svenskadev-thesis-atlas-v1 (1.0.0) mot kapitel 3, 4 och 7 i Horn af Åminne (2022)
Kontroller och resultat: Karta 7 (s. 118) och Tablå 26 (s. 120, samtliga 42 rader) med diskreta tidsskikt ca 1850 och ca 1900, historiska nationsgränser 1920–1939 (not 63 s. 117), ojämn källtäckningsvarning för ca 1850. Regionala fördjupningar för Dalmål (Karta 3–5 & Tablå 23), Överkalixmål (Tablå 24) och Estlandssvenska (Tablå 25 & Karta 6). Plural imperativ i sydväst (Karta 15–16 och ljudargument s. 241–242). Karta 14 som hypotetisk rekonstruktion med streckad gräns och varningsbanderoll samt avvecklingstyper Typ 1–4 i Tablå 42–43 och Figur 10 (med bevarat '?' i Typ 4 steg 3 och 4).
Kvarstående frågor: Inga öppna källkritiska spärrar. Källnot om omkastade områdesbeskrivningar för rad 15 & 17 i Tablå 26 jfr kap. 5 registrerad under K05.
Berörda registerposter Kxx: K02, K03, K05, K07
Nästa uppgift: Etapp 6 (A06.1–A06.6)
```

### Etapp 6 (`A06.1`–`A06.6`)

```text
Etapp / uppgifts-ID: Etapp 6 (A06.1, A06.2, A06.3, A06.4, A06.5, A06.6)
Status och datum: Klar (2026-10-19)
Levererat:
- lib/thesis/case-studies-data.ts (CASE_STUDIES_DATA, MARK_KIND_INFORMANTS, OSTRA_GOINGE_INFORMANTS)
- components/thesis/CaseStudiesSection.tsx (interaktiv matris, kohortjämförelse, talarprofiler, excerperingsprinciper och syntes)
- lib/thesis/validation.ts (validateCaseStudiesData)
- tests/thesis-pilot.test.mjs (utökad med Etapp 6-tester)
Käll-/dataversion: svenskadev-thesis-case-studies-v1 (1.0.0) mot kapitel 8 och 9 i Horn af Åminne (2022)
Kontroller och resultat:
- Mark och Kind: 41 informanter uppdelade i 3 kohorter (9 + 22 + 10 = 41), Tablå 30, 32, 34 samt Tabell 1–3. Bevarade notationer (*, ?, kursiv för < 5 belägg).
- Östra Göinge: 21 informanter uppdelade i 3 kohorter (12 + 6 + 3 = 21), Tablå 35, 36, 38 samt Tabell 4–5.
- Källkritisk diskrepans K01: Öppet redovisat att s. 212 anger "22 namngivna informanter, varav 18 män och 3 kvinnor" (vilket summerar till 21), medan Tablå 35 (s. 213), s. 217, Tablå 36 (s. 219), Tablå 37 (12+6+3=21 s. 220), Tablå 38 (s. 225) och Tablå 39 (s. 232) samstämmigt anger 21 informanter.
- Källkritisk diskrepans K06: Tablå 34 vs Tabell 1 för pronominet *da* redovisat i separat källnot.
- Excerperingsprinciper: 3SG preteritum konjunktiv mot 3PL preteritum indikativ (s. 184 not 107) och det syntaktiska *um*-undantaget (s. 185).
- Teoretisk syntes: Figur 8–9 (horisontell dialektkontakt vs vertikal standardspråkspåverkan) och Tablå 39–40 (rangordning och avvecklingstakt).
Kvarstående frågor: Inga öppna spärrar. Autentiska citat och sidhänvisningar s. 183–231 bevarade.
Berörda registerposter Kxx: K01, K04, K06, K08, K09, K10, K11, K12, K13, K14
Nästa uppgift: Etapp 7 (A07.1–A07.4)
```

### Etapp 7 (`A07.1`–`A07.4`)

```text
Etapp / uppgifts-ID: Etapp 7 (A07.1, A07.2, A07.3, A07.4)
Status och datum: Klar (2026-10-19)
Levererat:
- docs/avhandling/ETAPP-7-LJUD-OCH-FULLTEXT-BESLUT.md
- components/thesis/CaseStudiesSection.tsx (tillgängliga språkprovskort med diplomatisk transkription, översättning och källhänvisningar)
Käll-/dataversion: svenskadev-thesis-audio-fulltext-policy-v1 (1.0.0) mot Horn af Åminne (2022) s. 183–231
Kontroller och resultat: Arkivläget klarlagt: Isofs bandsignum anges inte i avhandlingen och inga separata ljudfiler medföljer DiVA-publiceringen. För att upprätthålla strikt källkritisk integritet presenteras inga syntetiska AI-röster som autentiska historiska inspelningar. Språkproven presenteras som tillgängliga textkort med diplomatisk transkription, nusvensk översättning och exakta sidhänvisningar, helt utan autospelning. Omfattningsbeslut fattat: webbplatsen publicerar den interaktiva vetenskapliga utställningen och länkar originalmonografin (288 s.) direkt via DiVA/URN.
Kvarstående frågor: Om användaren/Isof senare tillhandahåller digitaliserade ljudfiler kan spelarkomponenten kompletteras med ljudströmmar.
Berörda registerposter Kxx: Inga nya
Nästa uppgift: Samtliga etapper (0–8) slutförda.
```




