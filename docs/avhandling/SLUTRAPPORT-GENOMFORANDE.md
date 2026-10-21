# Slutrapport: Fullständig digital källkritisk utgåva av Horn af Åminne (2022)

**Avhandling**: Adam Horn af Åminne (*Från person till person. Avvecklingen av nordisk personkongruens ur ett diakront typologiskt perspektiv*, Uppsala universitet 2022, 288 s.)  
**Projekt**: SvenskaDev (`/Users/oscarpagerup/Desktop/Git Repo/SvenskaDev`)  
**Datum**: 2026-10-19  
**Status**: Samtliga etapper (Etapp 0 till Etapp 8) färdigställda och verifierade mot 24 automatiserade tester, TypeScript-typkontroll samt produktionsbygge.

---

## 1. Genomförda etapper och leverabler

### Etapp 0 · Beslut, avgränsning och kolofonverifiering
- **Dokument**: [`docs/avhandling/ETAPP-0-BESLUTSLOGG.md`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/docs/avhandling/ETAPP-0-BESLUTSLOGG.md)
- **Källversion**: Horn af Åminne (2022), ISBN 978-91-513-1394-8, URN [urn:nbn:se:uu:diva-466066](https://urn.kb.se/resolve?urn=urn:nbn:se:uu:diva-466066), SHA-256 `64b9980bac02a28377cf2297de91e180017eb7f74d1021688569f32ebc548284`.
- **Rättslig grund**: Upphovsrättslagen (1960:729) § 22 (vetenskaplig citaträtt) och § 23 (återgivning av offentliggjorda konstverk/kartor i vetenskaplig framställning).
- **Källkritiskt register**: 18 källkritiska registerposter (`K01`–`K18`) identifierade och katalogiserade.

### Etapp 1 · Pilotens datamodell och källvalidering
- **Kodfiler**: [`lib/thesis/types.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/thesis/types.ts), [`lib/thesis/validation.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/thesis/validation.ts), [`lib/thesis/pilot-data.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/thesis/pilot-data.ts), [`docs/avhandling/pilot-data-v1.json`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/docs/avhandling/pilot-data-v1.json).
- **Rapport**: [`docs/avhandling/ETAPP-1-GRANSKNINGSRAPPORT.md`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/docs/avhandling/ETAPP-1-GRANSKNINGSRAPPORT.md).
- **Dataomfattning**: Tablå 28 (12 verbparadigmceller, separerade presens/preteritum) och Karta 10 (Sydvästsveriges 4 zoner + Ale härad-exklaven + n-bortfallslinjer + fotnot 81 om Halland/Västergötland).

### Etapp 2–4 & 8 · Sydvästsverigepiloten och redaktionellt arbetsflöde
- **Komponenter**:
  - [`components/thesis/Karta10SvgMap.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/thesis/Karta10SvgMap.tsx): Vektorkarta med mönster/färg, tangentbordsfokus och källnoteringar.
  - [`components/thesis/Tabla28And29Panel.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/thesis/Tabla28And29Panel.tsx): Paradigmmatris synkroniserad med Karta 10.
  - [`components/thesis/Figur6ChangeModel.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/thesis/Figur6ChangeModel.tsx): Stegvis förklaringsmodell för personkongruensens avveckling i Sydvästsverige (Figur 6, s. 147).
  - [`components/thesis/SourceAndGlossaryPanel.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/thesis/SourceAndGlossaryPanel.tsx): Källkritiska poster (`K01`–`K07`), 13 facktermer och avhandlingskolofon.
  - [`components/admin/ThesisAdminEditor.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/admin/ThesisAdminEditor.tsx): Redaktörsgränssnitt på `/admin/avhandling` med versionshantering och JSON-validering.
- **Databas & SQL**: [`supabase/migrations/20261019_thesis_pilot.sql`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/supabase/migrations/20261019_thesis_pilot.sql), [`supabase/install-svenska.sql`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/supabase/install-svenska.sql).
- **Rapporter**: [`docs/avhandling/ETAPP-2-PROTOTYP-OCH-INTERAKTION.md`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/docs/avhandling/ETAPP-2-PROTOTYP-OCH-INTERAKTION.md), [`docs/avhandling/ETAPP-3-4-8-PILOTUTGAVA.md`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/docs/avhandling/ETAPP-3-4-8-PILOTUTGAVA.md).

### Etapp 5 · Nordisk atlas och regionala fördjupningar
- **Data**: [`lib/thesis/atlas-data.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/thesis/atlas-data.ts)
- **Komponent**: [`components/thesis/NordicAtlasSection.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/thesis/NordicAtlasSection.tsx)
- **Innehåll**:
  - **Karta 7 & Tablå 26**: Samtliga 42 rader från Tablå 26 (s. 120), diskreta tidsskikt (`ca_1850` och `ca_1900`), historiska nationsgränser 1920–1939 (fotnot 63 s. 117), ojämn källtäckningsvarning för 1850.
  - **Regionala fördjupningar (kapitel 3)**: Dalmål (Karta 3–5 & Tablå 23), Överkalixmål (Tablå 24) och Estlandssvenska (Tablå 25 & Karta 6).
  - **Plural imperativ i sydväst**: Karta 15 zoner (`-e(n)`, `-a`, `-er`), Karta 16 metodkritik om falska negativer och fonologiskt argument mot utvecklingen `-in > -an > -a` (s. 241–242).
  - **Karta 14**: Hypotetisk rekonstruktion (`hypothetical_reconstruction`) med streckad gräns och varning för hypotetisk status.
  - **Avvecklingstyper**: Typ 1–Typ 4 (Tablå 42–43 & Figur 10) med bevarat `?` i Typ 4 steg 3 och 4.

### Etapp 6 · Källkritiska fallstudier i Mark/Kind och Östra Göinge
- **Data**: [`lib/thesis/case-studies-data.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/thesis/case-studies-data.ts)
- **Komponent**: [`components/thesis/CaseStudiesSection.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/thesis/CaseStudiesSection.tsx)
- **Innehåll**:
  - **Mark och Kind (kapitel 8)**: 41 informanter uppdelade i 3 kohorter (9 + 22 + 10 = 41), Tablå 30, 32, 34 samt Tabell 1–3. Bevarade källnotationer (`*`, `?`, kursiv stil för `< 5 belägg`).
  - **Östra Göinge (kapitel 9)**: 21 informanter uppdelade i 3 kohorter (12 + 6 + 3 = 21), Tablå 35, 36, 38 samt Tabell 4–5.
  - **Källkritisk diskrepans K01**: Öppet redovisad avvikelse mellan s. 212 ("22 informanter, varav 18 män och 3 kvinnor") och alla övriga tabeller och textställen (21 informanter).
  - **Källkritisk diskrepans K06**: Tablå 34 mot Tabell 1 för pronominet *da*.
  - **Excerperingsprinciper**: 3SG preteritum konjunktiv vs 3PL preteritum indikativ (s. 184 not 107) och det syntaktiska *um*-enklisundantaget (s. 185).
  - **Talarprofiler**: Autentiska citat och excerperingar för JE, AJ 3, EK & SK, OB 1 och NBS.
  - **Teoretisk syntes**: Figur 8–9 (horisontell dialektkontakt vs vertikal standardspråkspåverkan) och Tablå 39–40 (rangordning och avvecklingstakt).

### Etapp 7 · Ljud- och fulltextpolicy
- **Dokument**: [`docs/avhandling/ETAPP-7-LJUD-OCH-FULLTEXT-BESLUT.md`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/docs/avhandling/ETAPP-7-LJUD-OCH-FULLTEXT-BESLUT.md)
- **Beslut**: Inga syntetiska AI-röster som historiska dialekter. Transkriberade språkprov presenteras som tillgängliga textkort med diplomatiska transkriptioner och sidhänvisningar. Den vetenskapliga webbutgåvan fokuserar på den empiriska kärnan och länkar originalmonografin (288 s.) direkt via DiVA:s permanenta URN.

---

## 2. Verifiering och testresultat

Alla automatiserade och manuella kontroller är godkända:

1. **Enhetstester och datavalidering (`npm test`)**:
   - 24/24 tester godkända (100%).
   - Täcker schema, typvalidering, tidsrollsspärrar, slash-celler, SVG-geometri-ID:n, URL-synkronisering och PGlite RLS/transaktioner.
2. **Typsäkerhet (`npm run typecheck`)**:
   - 0 TypeScript-fel.
3. **Produktionsbygge (`npm run build`)**:
   - Next.js 16.4.2 produktionsbygge kompilerar alla rutter (`/`, `/sprakliv/person-och-numerus`, `/avhandling`, `/admin/avhandling`) utan varningar.
4. **Källtäckning**:
   - Samtliga 27 kartor, 44 tablåer, 10 figurer och 5 tabeller i avhandlingen är inventerade i [`docs/avhandling/ILLUSTRATIONER.csv`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/docs/avhandling/ILLUSTRATIONER.csv).

---

## 3. Rutter och åtkomstpunkter

- **Offentlig presentation**: [`/sprakliv/person-och-numerus`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/sprakliv/person-och-numerus/page.tsx) (och alias [`/avhandling`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/avhandling/page.tsx))
- **Redaktörsgränssnitt**: [`/admin/avhandling`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/admin/avhandling/page.tsx)
- **Startsida**: Länk till utgåvan integrerad i [`components/ArchivePage.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/ArchivePage.tsx) och [`app/page.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/app/page.tsx).
