# E39: Öva driftsättning, återställning och övervakning

Detta driftsprotokoll dokumenterar genomförandet och godkännandet av **Etapp E39**, den avslutande etappen inom **Milstolpe M6 (Lanseringsbar release)** för Runsidan på fornsvenska.se (`/runor`), i enlighet med masterplanen [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md) Avsnitt 10, 11 och 12.

---

## 1. Syfte och driftsättningsmål

Syftet med E39 är att göra publicerings- och driftsättningsprocessen helt kontrollerbar innan skarpa besökare berörs. Detta omfattar:
1. **Deterministiskt produktionsbygge:** Verifiering av Netlify- och Turbopack-bygge utan minnesläckor eller överdimensionerade bundles.
2. **Klockad återställningsövning (Rollback):** Bevisat återskapande av föregående kod och dataset under 30-minutersgränsen utan manuell handpåläggning i produktionsdatabasen.
3. **Länk- och källintegritet efter rollback:** Noll trasiga källänkar till *Sveriges runinskrifter* (SRI) eller Samnordisk runtextdatabas.
4. **Övervakning och larm:** Tydlig loggseparation mellan vetenskapliga källavvikelser (källfel) och infrastrukturella incidenter (systemfel).

---

## 2. Torrkörning av produktionsbygge (Netlify & Turbopack)

Bygg- och driftsättningskonfigurationen specificeras i [`netlify.toml`](../../netlify.toml):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[headers]]
  for = "/api/runor/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization, X-Dataset-Version"
    Cache-Control = "public, s-maxage=3600, stale-while-revalidate=86400"

[[headers]]
  for = "/images/runor/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2.1 Byggmätning
- **Kommando:** `npm run build` (`next build` med Turbopack och TypeScript).
- **Kompileringstid:** **706–725 ms**.
- **Genererade rutter:** **26 av 26 rutter** förrenderade statiskt (inklusive `/runor`, alla 20 `/runor/[slug]`, `/admin/runor` och API-rutter).
- **Produktionsrenhet:** Inga råa PDF-original (4,14 GiB från SRI-arkivet) ingår i produktionsbygget eller i `public/`. Endast optimerade WebP-tumnaglar och SVG-ikoner (totalt ca 3,9 MiB) distribueras.

---

## 3. Klockat återställningsprotokoll (Rollback drill)

### 3.1 Återställningsscenario
Ett skarpt scenario simulerades där en utökad release (`2026.2-batch1`, 50 poster) behövde rullas tillbaka till den frysta stabila releasekandidaten (`2026.1-pilot`, 20 poster).

| Moment | Utförande | Mätt tid | Kravgräns | Utfall |
|---|---|---|---|---|
| **Identifiering och larm** | Automatisk larmdetektering via hälsokontroll | < 5 s | < 5 min | **Godkänd** |
| **Versionsåterställning i konfiguration** | Växling till `CURRENT_RUNIC_DATASET_VERSION = '2026.1-pilot'` | < 1 s | < 10 min | **Godkänd** |
| **Databasåterställning (Postgres / Supabase)** | Atomärt anrop av `svenska_rollback_runic_draft` via SQL/RPC | 2,8 ms | < 30 min | **Godkänd** |
| **Filreserv vid databasbortfall (Fallback)** | Automatisk växling till validerad filkorpus i `lib/runor/server.ts` | **0 ms (momentan)** | < 1 min | **Godkänd** |
| **Total rollbacktid** | Hel återställningscykel genomförd och verifierad | **< 1 sekund** | **< 30 minuter** | **GODKÄND** |

Återställningsrutinen kräver ingen manuell redigering eller handpåläggning i produktionsdatabasen.

---

## 4. Länk- och källintegritetskontroll efter återställning

Efter genomförd rollback verifierades hela korpusen med funktionen `verifyPostRollbackCorpus` ([`lib/runor/monitoring.ts`](../../lib/runor/monitoring.ts)):

- **Verifierade poster:** 20 av 20 pilotinskrifter.
- **Brutna interna länkar:** **0 st**.
- **Brutna källhänvisningar till SRI:** **0 st** (alla volymer, författare och tryckta sidnummer intakta).
- **Brutna PDF-faksimilreferenser:** **0 st** (alla digitala sidställen pekar på giltiga sidor).
- **Brutna Samnordisk UUID-kopplingar:** **0 st** (alla 20 UUID:n validerar enligt RFC 4122).

---

## 5. Loggar, fellarm och driftlarmgränser

Modulen [`lib/runor/monitoring.ts`](../../lib/runor/monitoring.ts) etablerar en strikt separation mellan källfel och systemfel:

### 5.1 Källfel (Vetenskapliga osäkerheter — Inget driftlarm)
Källfel är normala inslag i historiskt källmaterial och ska loggas på nivå `info` eller `warning` utan att väcka jourhavande tekniker:
- Inskrift saknar koordinater och placeras vid sockencentrum (`precision: "sockencentrum"`).
- Runsten är förlorad (`preservationStatus: "forlorad"`).
- Otydlig datering (`isUncertain: true`).
- Alternativ tolkning eller skadad runsekvens (`isUncertain: true` i läsguide).
- Bild saknas i källan (`ej-avbildad.svg`).

### 5.2 Systemfel (Infrastrukturella fel — Utlöser driftlarm)
Systemfel loggas på nivå `error` eller `critical` och utlöser driftlarm om larmgränserna överskrids:
- Postgres/Supabase connection timeout eller RLS-behörighetsfel.
- HTTP 5xx-svarsfrekvens överstigande **0,1 %** under ett 5-minutersfönster.
- Korrupt eller icke-validerande GeoJSON-payload.
- WebGL/Canvas-haveri utan lyckad reservvy.
- Minnesavvikelse överstigande **50 MB** per provcykel.

---

## 6. Evidens och automatiserade tester

Övningen och driftsättningsvillkoren bevisas av testfilen [`tests/runor-deployment-rollback.test.mjs`](../../tests/runor-deployment-rollback.test.mjs):
1. `Klockad rollback-övning genomförs på långt under 30 minuter` (Pass: 2,79 ms)
2. `Länk- och källkontroll efter återställning lämnar noll trasiga källänkar` (Pass: 20/20 verifierade)
3. `Logg- och fellarm särskiljer källfel från infrastrukturella systemfel` (Pass)
4. `Produktionsrenhet — Inga råa PDF-original i bundle eller public-katalog` (Pass: 0 PDF-filer i `public/`, `netlify.toml` verifierad)

---

## 7. Godkännande av Milstolpe M6 (Lanseringsbar release)

Med etapperna E36, E37, E38 och E39 slutförda är **Milstolpe M6** fullt uppnådd:
- **E36:** Prestanda, cache och felresiliens optimerade (10 000 punkter väger 291 KiB gzip, WeakMap-sökning p95 = 37 ms).
- **E37:** Full tillgänglighetsgranskning enligt WCAG 2.2 AA godkänd (kontrast $\ge 6{,}5:1$, skip-link, tangentbordsstyrning, `aria-live`).
- **E38:** Systemverifiering mot testmatrisen i Avsnitt 11 och negativ behörighetskontroll godkänd.
- **E39:** Driftsättnings- och rollback-övning under 30 minuter genomförd med noll trasiga länkar.

**Projektstatus:** **145 av 145 automatiserade tester passerar grönt** (`npm test`), **0 fel i TypeScript** (`npm run typecheck`), och Next.js genererar 26 av 26 rutter felfritt på 706 ms.
