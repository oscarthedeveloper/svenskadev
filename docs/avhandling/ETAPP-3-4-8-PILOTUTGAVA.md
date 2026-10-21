# Etapp 3, 4 & 8 – Dokumentation av Pilotutgåva v1 (`/sprakliv/person-och-numerus` & `/admin/avhandling`)

Detta dokument sammanfattar genomförande, teknisk arkitektur, lagringsmodell, tillgänglighets- och källkontroll samt återställningsväg för **Pilotutgåva v1** (`svenskadev-thesis-pilot-v1`).

---

## 1. Arkitektur och separation av ansvar (`A03.1`–`A03.3`)

Pilotutgåvan är uppbyggd med strikt separation mellan källdata, kartgeometri, URL-tillstånd, lagring och visningskomponenter:

| Modul / fil | Ansvar |
| --- | --- |
| [`lib/thesis/types.ts`](../../lib/thesis/types.ts) | Typsystem för källställen (`printedPage` + `pdfPage`), tidsroller (`TimeRole`), osäkerhetsmarkörer (`UncertaintyMarker`), paradigmceller, regioner, förändringssteg och ordlista. |
| [`lib/thesis/validation.ts`](../../lib/thesis/validation.ts) | Körningsvalidering (`validateThesisPilotEdition`) som avvisar poster utan källa, felaktiga sidnummer, ouppdelade snedstrecksceller (`-a / -e`), sammanblandade tidsroller och indirekt härledda områden utan osäkerhetsmönster. |
| [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts) & [`docs/avhandling/pilot-data-v1.json`](./pilot-data-v1.json) | Dubbelkontrollerad källdata för **Tablå 28** (s. 147), **Karta 10** (s. 148), **Tablå 29** (s. 153), **Figur 6** (s. 160), 13 kärnbegrepp samt granskningslogg (`K01`–`K15`). |
| [`lib/thesis/map-geometry.ts`](../../lib/thesis/map-geometry.ts) | Fristående SVG-geometri (`KARTA_10_VIEWBOX`, 9 delområdespolygoner, vågformad `n`-bortfallsgräns, sydvästskånsk enhetsböjningszon, landskapsreferenser och undantagsmarkörer). |
| [`lib/thesis/url-state.ts`](../../lib/thesis/url-state.ts) | Tolkning och serialisering av delbara URL-parametrar (`?omrade=...&delomrade=...&tempus=...&verb=...&steg=...&vy=...&begrepp=...`) med säker ignorering av okända parametrar. |
| [`lib/thesis/editorial-config.ts`](../../lib/thesis/editorial-config.ts) & [`lib/thesis/server.ts`](../../lib/thesis/server.ts) | Redaktionell konfiguration (`ThesisEditorialConfig`), validering och serverinläsning med stöd för förhandsgranskning av privata utkast (`?forhandsgranska=1`). |
| [`components/thesis/Karta10SvgMap.tsx`](../../components/thesis/Karta10SvgMap.tsx) | Interaktiv SVG-karta med dubbel kodning (färg + mönster + textetikett), prickskraffering för nordligt `n`-bortfall (`-e`), snedskraffering + streckad kant för fotnot 81 samt tillgänglig knapplista utan hoverkrav. |
| [`components/thesis/Tabla28And29Panel.tsx`](../../components/thesis/Tabla28And29Panel.tsx) | Interaktiv tabell för **Tablå 28** (med tempusväxlare `Presens -a` / `Preteritum -e`, allomorfi och vokalkrock) samt fullständigt referensparadigm för fem typverb ur **Tablå 29** (s. 153). |
| [`components/thesis/Figur6ChangeModel.tsx`](../../components/thesis/Figur6ChangeModel.tsx) | Stegvis vy (`Steg 1–4`, `Föregående`, `Nästa`, `Återställ`) och likvärdig statisk jämförelsetabell för **Figur 6** (s. 160) med modellvarning (`K15`). |
| [`components/thesis/SourceAndGlossaryPanel.tsx`](../../components/thesis/SourceAndGlossaryPanel.tsx) | Käll- och osäkerhetskort (*1. Detta visar källan / 2. Så har vi återgett det / 3. Detta är osäkert*), tidsrollsvarning, dokumenterade undantag, sökbar ordlista (13 termer) och bibliografi. |
| [`app/sprakliv/person-och-numerus/page.tsx`](../../app/sprakliv/person-och-numerus/page.tsx) & [`app/admin/avhandling/page.tsx`](../../app/admin/avhandling/page.tsx) | Publika respektive administrativa sidrutter. `/avhandling` omdirigerar till `/sprakliv/person-och-numerus`. |

---

## 2. Lagringsmodell, RLS och isolering i delat Supabaseprojekt (`A03.4`–`A03.7`)

1. **Uppmätt datastorlek (`A03.4`)**:
   - Den kanoniska pilotdatan (`docs/avhandling/pilot-data-v1.json`) är **39 KB** (okompimerad JSON).
   - Den redaktionella konfigurationen (`ThesisEditorialConfig`) är **~4 KB** (eller ~43 KB om en hel anpassad `ThesisPilotEdition` inkluderas).
   - Därför används en hybridmodell där den verifierade basutgåvan i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts) alltid finns tillgänglig direkt på servern (även utan databasanslutning), medan redaktionella ändringar och utgåvor lagras i två dedikerade tabeller i `svenska_`-namnutrymmet.
2. **Migration i `svenska_`-namnutrymmet ([`supabase/migrations/20261019_thesis_pilot.sql`](../../supabase/migrations/20261019_thesis_pilot.sql))**:
   - `public.svenska_thesis_editions`: Innehåller den publicerade utgåvan (`anon` kan endast läsa rader där `published = true`).
   - `public.svenska_thesis_drafts`: Innehåller privata utkast (`anon` har ingen behörighet alls; icke-admin får `0` rader via RLS `public.svenska_is_admin()`).
   - Atomära PL/pgSQL-funktioner med revisionslåsning (`FOR UPDATE`):
     - `public.svenska_save_thesis_draft(p_slug, p_content, p_revision)`
     - `public.svenska_publish_thesis(p_slug, p_revision)`
     - `public.svenska_unpublish_thesis(p_slug, p_revision)`
     - `public.svenska_restore_thesis_published(p_slug, p_revision)`
   - **Inga Fornsvenska- eller Italo-tabeller berörs.**

---

## 3. Omfattningsbeslut i Etapp 4 (`A04.4`)

För första utgåvan (Pilot v1) behålls den dubbelkontrollerade modellen efter **Figur 6 (s. 160)** för de fyra sydvästsvenska huvudparadigmen (`um-böjning` → `e-böjning` / `skånsk böjning` → `a-böjning`). De nordiska avvecklingstyperna i **Tablå 42 (s. 243)** och **Figur 10 (s. 245)** — där avvecklingstyp 4 saknar belagda senare steg och bär frågetecken i originalet — sparas till den nordiska utblicken i Etapp 5 och fylls aldrig i med spekulativa mellansteg.

---

## 4. Kvalitets-, tillgänglighets- och publiceringskontroll för Pilot v1 (`A08.1`–`A08.6`)

- **`A08.1` Innehålls- och källkontroll**:
  - Samtliga 12 celler i Tablå 28, 5 typverb i Tablå 29, 4 huvudområden och 9 delområden på Karta 10 samt 4 steg i Figur 6 har verifierats mot original-PDF:en (se [`ETAPP-1-GRANSKNINGSRAPPORT.md`](./ETAPP-1-GRANSKNINGSRAPPORT.md)).
  - Tidsrollen `historical_synthesis_period` (`ca 1850–1950`, `allowsInterpolation: false`), modus (`indikativ` i Tablå 28/Karta 10 vs. `imperativ` i Tablå 29) samt fotnot 81:s indirekt härledda ytterområden är explicit utmärkta i gränssnittet.
- **`A08.2` Tillgänglighet, mobil och reducerad rörelse**:
  - Responsiva brytpunkter vid `980px` och `640px`.
  - Dubbel kodning (färg + SVG-mönster + synkretismetikett `1p ≠ 2p ≠ 3p` osv.).
  - Full tangentbordsåtkomst och knapplistor för alla regioner och delområden utan krav på hover.
  - Likvärdig statisk jämförelsetabell för Figur 6 (`Visa alla steg samtidigt`) samt `@media (prefers-reduced-motion: reduce)`.
- **`A08.3` Automatiska tester och RLS-verifiering**:
  - 22 automatiska tester i `npm test` (inklusive `PGlite`-tester av RLS, flikkonflikter, utkast, publicering, återställning och avpublicering) samt `npm run typecheck`.
- **`A08.5` Metadata, indexering och inlänkning**:
  - Kanonisk URL `/sprakliv/person-och-numerus`.
  - Automatisk `robots: { index: false, follow: false }` på `/admin/avhandling` samt vid utkastförhandsgranskning (`?forhandsgranska=1`).
  - Inlänkad från både `/sprakliv` (utvalt kort överst i arkivet), startsidans Språklivssektion och `/admin`.
- **`A08.6` Kända begränsningar och återställningsväg**:
  - *Omfattning i Pilot v1*: Omfattar kapitel 7:s sydvästsvenska huvudkarta (Karta 10), Tablå 28, Tablå 29, Figur 6 och kärnordlistan. Nordisk utblick (Etapp 5) och fallstudierna i Mark/Kind respektive Östra Göinge (Etapp 6) levereras i efterföljande etapper.
  - *Återställningsväg*: I `/admin/avhandling` kan administratören när som helst klicka på **”Återställ från publicerad”** (för att kasta ett pågående utkast), **”Avpublicera anpassning”** eller **”Återställ formulär till basdata”** (vilket återställer all text och data till den källkritiskt låsta basutgåvan i [`lib/thesis/pilot-data.ts`](../../lib/thesis/pilot-data.ts)).
