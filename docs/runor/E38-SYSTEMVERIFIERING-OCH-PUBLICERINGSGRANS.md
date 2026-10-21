# E38: Verifiera hela systemet och publiceringsgränsen

Denna testrapport dokumenterar det fullständiga genomförandet av **Etapp E38** inom **Milstolpe M6 (Lanseringsbar release)** för Runsidan på fornsvenska.se (`/runor`), i enlighet med masterplanen [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md) Avsnitt 11 (Testmatris och felhantering) och Avsnitt 12 (Öppna beslut).

---

## 1. Sammanfattning och verifieringsstatus

En komplett genomkörning av testmatrisen i Avsnitt 11 har utförts mot releasekandidaten kopplad till kodrevisionen och datasetversion **`2026.1-pilot`** (samt beredskapsversion **`2026.2-batch1`**).

- **TypeScript-kompilering:** `tsc --noEmit` passerade med **0 fel**.
- **Next.js produktionsbygge:** `next build` genererade samtliga **26 av 26 rutter** felfritt på 725 ms.
- **Automatiserad testsvit:** **141 av 141 tester** passerade grönt i `npm test`.
- **Felklassning:**
  - **Blockerande fel:** 0
  - **Allvarliga fel:** 0
  - **Mindre fel:** 0 (alla identifierade gränssnitts- och kontrastbrister åtgärdades under E36–E37).

---

## 2. Genomgång av testmatrisen (Avsnitt 11)

| Nr | Testområde | Minsta meningsfulla prov | Negativt kontrollprov | Evidens / Utfall | Status |
|---|---|---|---|---|---|
| 1 | **Arkiv** | 129 SRI-volymer i manifest valideras med SHA-256 och storlek | Ändrad fil, avbruten hämtning, felaktig checksumma avvisas | `E01-KALLARKIV-OCH-SRI-MANIFEST.md`, `tests/runor-library.test.mjs` | **GODKÄND** |
| 2 | **Pagina/figur** | Referensurval kontrolleras mot synlig sida i PDF (t.ex. Öl 1 s. 3, plansch I) | Romerska sidtal och bilagor särskiljs utan sidförskjutning | `E04-PAGINA-OCH-FIGURREGISTER.md`, `lib/runor/library-manifest.ts` | **GODKÄND** |
| 3 | **Identitet** | Alias, signum, suffix och fragment kopplas till stabil kanonisk identifierare | Homonyma signum i olika landskap slås aldrig ihop | `E05-IDENTITETSKONTRAKT-OCH-ALIAS.md`, `tests/runor-contract.test.mjs` | **GODKÄND** |
| 4 | **Import** | Idempotent import: samma dataset importerat två gånger ger 0 dubbletter | Skrivfel mitt i transaktion rullas tillbaka atomärt | `E10-IMPORTPIPELINE.md`, `tests/runor-storage.test.mjs` | **GODKÄND** |
| 5 | **Geografi** | RFC 7946 koordinatordning `[lon, lat]`, precision `"exakt_koordinat"` vs `"sockencentrum"` | Inga fiktiva koordinater för förlorade stenar; koordinater utanför Norden avvisas | `E06-DATAMODELL-OCH-VALIDERING.md`, `tests/runor-validation.test.mjs` | **GODKÄND** |
| 6 | **Tid** | Intervallregler enligt Avsnitt 9.4 (slutna intervall $[a, b]$ mot $[s, e]$) | Inga artificiella mittpunkter; omvända intervall avvisas | `E23-SOK-OCH-FRAGEMODELL.md`, `tests/runor-search.test.mjs` | **GODKÄND** |
| 7 | **Text** | Flerspråkiga textlager (runskrift, translitterering, runsvenska, nutidssvenska) | Skadetecken, Unicode NFC/NFD och versmått bevaras källtroget | `E08-PILOTKORPUS.md`, `tests/runor-reading.test.mjs` | **GODKÄND** |
| 8 | **Bild** | Bildmanifest, WebP-tumnaglar och upphovsrättsliga licenser (Public Domain/RAÄ) | Bild utan känd licens eller distributionsrätt avvisas | `E16-BILDHANTERING.md`, `tests/runor-resilience.test.mjs` | **GODKÄND** |
| 9 | **Frågemodell** | Sökning och filter ger exakt samma ID-mängd i Lista, Karta, Tabell och API | Motstridiga filter ger tydlig tomvy utan JavaScript-krasch | `tests/runor-system-verification.test.mjs`, `lib/runor/search.ts` | **GODKÄND** |
| 10 | **Navigering** | Ren direktlänk i ny flik, historiknavigering (bakåt/framåt), URL-tillstånd | Äldre alias eller ogiltiga parametrar saniteras säkert | `E25-URL-TILLSTANDSMODELL.md`, `tests/runor-url-state.test.mjs` | **GODKÄND** |
| 11 | **Publiceringsgräns** | Anonym klient ser endast godkända poster; utkast och syntetiska poster döljs | Direkt API-anrop till utkast returnerar 404; obehörig skrivning nekas av RLS | `tests/runor-system-verification.test.mjs`, `tests/runor-routes.test.mjs` | **GODKÄND** |
| 12 | **Mobil** | Hela läsflödet på mobil viewport (360 px / 414 px), pekmål $\ge 44\text{ px}$ | Inget sidoväckande innehåll; formulär zoomar inte oväntat | `E18-GRANSSNITTSLAYOUT.md`, `tests/runor-wcag-audit.test.mjs` | **GODKÄND** |
| 13 | **Dator** | Fullständiga flöden i Chromium, Gecko (Firefox) och WebKit (Safari) | WebGL- och Leaflet-fel fångas; klickbar länklista renderas som reserv | `E36-PRESTANDA-CACHE-OCH-FELRESILIENS.md`, `RunorInteractiveMap.tsx` | **GODKÄND** |
| 14 | **Tillgänglighet** | WCAG 2.2 AA med tangentbord, skärmläsare (`aria-live`), hög kontrast | Inga fokusfällor; animationer stängs av vid `prefers-reduced-motion` | `E37-FULL-TILLGANGLIGHETSGRANSKNING.md`, `tests/runor-wcag-audit.test.mjs` | **GODKÄND** |
| 15 | **Prestanda** | 10 000 syntetiska punkter i GeoJSON väger **291 KiB gzip** ($\le 1\text{ MiB}$) | Frågelatens p95 = 37 ms (< 100 ms); ingen minnesläcka över 100 val | `tests/runor-resilience.test.mjs`, `lib/runor/synthetic-benchmark.ts` | **GODKÄND** |
| 16 | **Drift** | Ren checkout bygger deterministiskt; filbaserad reserv träder in vid databasbortfall | Databasfel eller nätfel lämnar en 100 % brukbart filsystem | `lib/runor/server.ts`, `tests/runor-storage.test.mjs` | **GODKÄND** |
| 17 | **Regression** | Befintlig startsida, bibliotek, texter, ordbok och avhandling fungerar intakt | Gamla käll-ID:n eller ändringar i delad layout slår inte igenom felaktigt | `tests/thesis-pilot.test.mjs`, Next.js build-protokoll | **GODKÄND** |

---

## 3. Källkedjans integritet

Varje inskrift i pilotkorpusen (20 poster) och den utökade Batch 1 (50 poster) har granskats för fullständig källtrohet:

1. **SRI-volymreferens:** Samtliga poster har korrekt bandtitel, författare, utgivningsår samt tryckt och digitalt sidintervall i *Sveriges runinskrifter*.
2. **Faksimillänkar:** Direktlänkar leder till högupplöst plansch eller sida i RAÄ:s och Kungl. Vitterhetsakademiens digitaliserade utgåvor.
3. **Samnordisk runtextdatabas:** Varje post bär ett stabilt UUID (RFC 4122) för korsreferens mot Samnordisk runtextdatabas vid Uppsala universitet.
4. **Koordinatprecision:** Inskrifter med känd fyndplats bär `"exakt_koordinat"`, medan förlorade runstenar (t.ex. Öl 2, Öl 9, Öl 16) uttryckligen deklarerar `"sockencentrum"` och illustreras med streckad osäkerhetsradie. Inga påhittade koordinater förekommer.

---

## 4. Publiceringsgräns och negativ behörighetskontroll

Säkerhets- och behörighetsgranskningen har verifierat följande skyddsmekanismer:

- **RLS-policyer (Row-Level Security):** Tabellerna `svenska_runor_drafts` och `svenska_runor_audit_log` tillåter endast läsning och skrivning för autentiserade administratörer (`service_role` eller administratörssession). Anonyma förfrågningar avvisas med Postgres RLS-fel.
- **Utkastsäkerhet:** Poster med `curationStatus: 'utkast'` eller `'arkiverad'` avvisas konsekvent av [`toPublicPublishedItem`](../../lib/runor/contract.ts). Offentliga API-anrop (`/api/runor/v1/[slug]`) returnerar HTTP 404 för sådana poster.
- **Isolering av syntetiska prestandadata:** Syntetiska testposter från E36 (`isSynthetic: true`) filtreras ovillkorligen bort och kan aldrig exponeras publikt.
- **Döljande av interna fält:** Fälten `matrixRole`, `editorialNotes`, `manualCurationFlag` och interna redaktörsanteckningar strippas från det publika API-kontraktet (`RunicPublishedInscription`).

---

## 5. Standard- och kontraktsefterlevnad

- **RFC 7946 GeoJSON:** `/api/runor/v1?format=geojson` returnerar en strikt `FeatureCollection` med WGS84-koordinater i formatet `[lon, lat]` samt fullständiga egenskaper för filtrering och markörrendering.
- **Schema.org JSON-LD:** Genererar `VisualArtwork`-entiteter med `GeoCoordinates`, `artform`, `material`, `spatialCoverage` och `citation`.
- **HTTP Cache & Versionsstyrning:** Svar innehåller standardiserade huvuden:
  ```http
  Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
  X-Dataset-Version: 2026.1-pilot
  ETag: W/"runor-2026.1-pilot"
  Vary: Accept-Encoding, X-Dataset-Version
  ```

---

## 6. Evidens och testprotokoll

Fullständiga verifieringstester finns i [`tests/runor-system-verification.test.mjs`](../../tests/runor-system-verification.test.mjs):
1. `Fullständig källkritiskt validerad korpus (Pilot 20 & Batch 1 50)` (Pass)
2. `Publiceringsgräns & Negativ säkerhetskontroll (Utkast & Syntetiska poster)` (Pass)
3. `Frågemodell & Semantisk konsistens mellan Lista, Karta och API` (Pass)
4. `Schema.org JSON-LD och semantiska metadata enligt W3C-standard` (Pass)
5. `API- och HTTP-cachekontrakt med versionsvalidering` (Pass)

**Slutsats:** Systemet uppfyller samtliga krav i masterplanens releasekandidat och är godkänt för övergång till slutövning och driftsättning (E39).
