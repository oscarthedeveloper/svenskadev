# E21 — Implementera lagring, import och skrivskydd

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E21  
**Ansvar**: Datautvecklare och driftansvarig  
**Beroenden**: E01, E03, E07, E20 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och arkitektur

Etapp E21 etablerar databaslagring, importrutiner och behörighetskontroller för runinskrifterna i enlighet med **Beslut D04** (hybridmodell: filbaserad publiceringsreserv kombinerad med PostgreSQL/Supabase och explicit Row Level Security).

Målet är att:
1. Garantera **idempotenta importer**: Att köra importverktyget flera gånger med samma källdata producerar exakt samma logiska databastillstånd utan dubbletter.
2. Säkerställa **skydd för manuella redaktionella rättelser**: Rättelser och förtydliganden gjorda i arbetsutkast (`manual_curation = true`) skrivs inte över vid automatiska omimporter från rådata utan uttrycklig tvingande flagga.
3. Upprätthålla **strikt skrivskydd och RLS**: Anonyma besökare kan endast läsa publicerade rader (`published = true`) i `svenska_runor_editions`. Arbetsutkast i `svenska_runor_drafts` är fullständigt osynliga och otillgängliga för icke-administratörer.
4. Säkerställa **atomär publicering och rollback**: En avbruten eller felaktig publicering rullar tillbaka hela transaktionen och lämnar det föregående publicerade datasetet fullt funktionellt.
5. Tillhandahålla **transparent filreserv**: Om databasen inte är konfigurerad eller saknar tabeller faller servern automatiskt och säkert tillbaka till den validerade pilotdatamängden i `lib/runor/pilot-data.ts`.

---

## 2. Databasdesign (`supabase/migrations/20261021_runic_storage.sql`)

### 2.1 Tabeller

1. `public.svenska_runor_datasets`:
   - Metadata för publicerade korpusversioner (t.ex. `2026.1-pilot`).
   - Fält: `version` (PK, semver/årtalsformat), `title`, `inscription_count`, `checksum_sha256` (64 tecken hex), `published_at`, `published_by`.
   - RLS: Publik läsrättighet (`select on ... to anon, authenticated`), skrivning begränsad till administratörer (`svenska_is_admin()`).

2. `public.svenska_runor_editions`:
   - Publicerade inskriftsutgåvor.
   - Fält: `slug` (PK), `signum` (UNIQUE), `content` (`jsonb` med fullständig validerad `RunicInscription`), `published` (`boolean`), `dataset_version` (FK till datasets), `revision`, `created_at`, `updated_at`.
   - RLS: Endast rader med `published = true` är synliga för anonyma besökare. Skrivning (INSERT, UPDATE, DELETE) nekas obehöriga och tillåts enbart för administratörer.

3. `public.svenska_runor_drafts`:
   - Redaktionens arbetsutkast.
   - Fält: `slug` (PK), `signum` (UNIQUE), `content` (`jsonb`), `revision`, `dirty` (`boolean`), `manual_curation` (`boolean`), `curation_notes` (`text`), `updated_at`.
   - RLS: `revoke all on public.svenska_runor_drafts from anon, authenticated;`. Anonyma besökare har noll behörighet (`permission denied`). Endast inloggade administratörer kan läsa och skriva.

### 2.2 Lagrade procedurer

- `public.svenska_import_runic_draft(p_slug, p_signum, p_content, p_overwrite_manual)`:
  - Verifierar administratörsbehörighet.
  - Kontrollerar om befintlig post har `manual_curation = true`. Om så är fallet och `p_overwrite_manual = false`, ignoreras rådatan och postens manuella ändring bevaras (`status: preserved_manual_curation`).
  - Uppdaterar annars utkastet och inkrementerar revisionsnumret.
- `public.svenska_publish_runic_dataset(p_version, p_title, p_checksum, p_publisher)`:
  - Verifierar administratörsbehörighet.
  - Skapar eller uppdaterar datasetmetadata i `svenska_runor_datasets`.
  - Kopierar/uppdaterar samtliga utkast till `svenska_runor_editions` med `published = true`.
  - Nollställer `dirty`-flaggan på utkasten.
  - Allt sker i en atomär transaktion: vid minsta fel (t.ex. check constraint-brott) återställs databasen.

---

## 3. Serveradapter och filreserv (`lib/runor/server.ts`)

Serverkomponenten `lib/runor/server.ts` tillhandahåller funktionerna:
- `getRunicCorpusState(options?: { preferDraftForAdmin?: boolean })`:
  - Kontrollerar databasstatus (`getDatabaseSetup`).
  - Om databasen inte är redo eller tabellerna saknas (`42P01` / `PGRST205`): serverar säkert den typade och validerade pilotdatamängden (`RUNIC_PILOT_INSCRIPTIONS`) med `isFallback: true`.
  - Om databasen är aktiv och anroparen är anonym: hämtar publicerade rader från `svenska_runor_editions` och validerar varje post mot `validateRunicInscription`.
  - Om anroparen är administratör med `preferDraftForAdmin = true`: hämtar aktuella arbetsutkast från `svenska_runor_drafts`.
- `getRunicInscriptionState(slugOrSignum, options)`:
  - Slår upp enskild post via kanonisk slug, signum eller UUID.

---

## 4. Import- och verifieringsverktyg (`scripts/runor/import-storage-e21.mjs`)

Verktyget läser in pilotens 20 inskrifter och utför:
1. Validering mot schema och källkrav (E06).
2. Deterministisk SHA-256 kontrollsummeberäkning (`computeDatasetChecksum`).
3. Batchimport till `svenska_runor_drafts` via `svenska_import_runic_draft`.
4. Atomär publicering till `svenska_runor_editions` via `svenska_publish_runic_dataset`.

---

## 5. Resultat av verifiering och automatiserade tester

Den automatiserade testsviten `tests/runor-storage.test.mjs` kördes med **PGlite** (in-memory PostgreSQL) och verifierade samtliga krav i Avsnitt 4 i genomförandeplanen:

```text
▶ E21: Databaslagring, RLS, import och skrivskydd för runinskrifter
  ✔ RLS nekar anonyma och obehöriga klienter från svenska_runor_drafts (15.2 ms)
  ✔ RLS nekar anonyma klienter att skriva till svenska_runor_editions (2.0 ms)
  ✔ Administratör kan köra import och publicering av pilotdata (38.7 ms)
  ✔ Idempotens: omimport skapar inga dubbletter och bibehåller exakt samma rader (27.8 ms)
  ✔ Manuell kuratering i utkast skyddas mot oavsiktlig överskrivning (3.5 ms)
  ✔ Anonym läsare ser endast publicerade rader och inga utkast (1.6 ms)
  ✔ Atomär rollback vid felaktig publicering (1.7 ms)
✔ E21: Databaslagring, RLS, import och skrivskydd för runinskrifter (2330.5 ms)
✔ E21: Klientkod och bundle-säkerhet: Inga hemliga nycklar exponeras i klientkomponenter (4.0 ms)
```

Bygg- och typstatus:
- **`npm run typecheck`**: 0 fel.
- **`npm test`**: 52/52 tester passerar grönt (100 %).
- **`npm run build`**: 26/26 sidor genererade felfritt på 707 ms.

---

## 6. Uppfyllda godkännandekrav

| Krav enligt RUNSIDA_PLAN.md | Utfall | Evidens |
|---|---|---|
| Två identiska importer ger samma logiska innehåll och inga dubbletter | **UPPFYLLT** | Test 4: Exakt 20 editions efter dubbel import; identisk SHA-256. |
| Manuell rättelse försvinner inte vid omimport | **UPPFYLLT** | Test 5: Post med `manual_curation=true` behåller ändring vid standardomimport. |
| Avbruten import/publicering lämnar föregående version användbar | **UPPFYLLT** | Test 7: Rollback vid fel behåller tidigare dataset intakt. |
| Anonym klient kan läsa publicerat men inte skriva eller läsa utkast | **UPPFYLLT** | Test 1, 2, 6: RLS kastar `permission denied` mot anonyma för drafts och skrivingrepp. |
| Hemliga nycklar saknas i klientbygget | **UPPFYLLT** | Statisk bundle-analys: Inga hemliga miljövariabler eller server-only-moduler i klientkomponenter. |

---

## 7. Slutsats

Etapp **E21** är härmed fullständigt genomförd, verifierad och **GODKÄND**.
