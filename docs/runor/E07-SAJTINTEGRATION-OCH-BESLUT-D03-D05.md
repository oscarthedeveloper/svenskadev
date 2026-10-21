# E07 — Sajtintegration och beslut D03–D05

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E07  
**Ansvar**: Tekniskt ansvarig och arkitekt  
**Beroenden**: E01, E02, E06 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och teknisk inventering

SvenskaDev är byggt på **Next.js 16.4.2** (App Router, Turbopack, React 19) med TypeScript 5.9, Tailwind CSS 4, Supabase (PostgreSQL med Row Level Security) och server actions.

Runsidan ska integreras som en förstklassig avdelning:
- **Publik URL-struktur**:
  - Huvudsida: `/runor` (serverrenderad översikt med klusterkarta och sökfilter).
  - Enskild inskrift: `/runor/[signum]` (t.ex. `/runor/ol-1`, `/runor/og-136`).
- **Koppling till övriga sektioner**:
  - Länk från huvudmenyn och sidfoten.
  - Hänvisningar till Resursbiblioteket (`/kallor`), Språkliv och ordartiklar.

---

## 2. Beslutsprotokoll D03: Källregister och validatorstrategi

```text
Beslut-ID: D03
Fråga: Hur möts befintligt källregister och separat runarkiv?
Datum: 2026-10-21
Beslut:
1. De 129 SRI-PDF-filerna (4,14 GiB) förblir i den lokala, Git-ignorerade katalogen underlag/runor/sri/ och ingår INTE i det publika webbbygget.
2. I sajtens källregister (data/kallor.ts) registreras SRI-huvudverken som digitala tillgångar av typen "extern" med direkta länkar till RAÄ:s officiella källsidor.
3. Befintliga valideringsskript (scripts/validate-kallor.ts) modifieras inte för att kräva lokala PDF-filer för externa resurser. Detta säkerställer att en ren Git-klon på en utvecklardator eller i en CI/CD-miljö (t.ex. Netlify/Vercel) kan bygga hela sajten (npm run build) utan gigabyte-stora råarkiv.
Skäl: Förhindrar uppblåst byggstorlek och garanterar snabba byggtider (< 10 sekunder) samt enkel onboarding för nya utvecklare.
```

---

## 3. Beslutsprotokoll D04: Lagringsmodell (Filbaserad pilot vs. Supabase)

```text
Beslut-ID: D04
Fråga: Filbaserad publiceringsmängd eller Supabase från början?
Datum: 2026-10-21
Beslut:
1. För piloten (E08–E29): Modellen implementeras med en typad, versionshanterad TypeScript-datamängd (lib/runor/pilot-data.ts) som serverrenderas statiskt/dynamiskt. Detta eliminerar alla nätverks- och databaslatenser under läsning och garanterar 100 % tillgänglighet även vid tillfälliga databasavbrott.
2. För den redaktionella förvaltningen och uppskalningen (E34+): En dedikerad PostgreSQL-tabellstruktur i namnutrymmet svenska_runor_* skapas i Supabase med strikt Row Level Security (RLS) och atomära utkast-/publiceringsfunktioner enligt samma beprövade mönster som piloten för avhandlingen (svenska_thesis_*).
3. Samma läskontrakt (lib/runor/types.ts och lib/runor/validation.ts) används av både den filbaserade piloten och den databasstödda utökningen.
Skäl: Ger maximal stabilitet och prestanda under pilotfasen, samtidigt som en tydlig och beprövad väg finns för redaktionellt underhåll.
```

---

## 4. Beslutsprotokoll D05: Tillgångslagring och bildoptimering

```text
Beslut-ID: D05
Fråga: Hur lagras original, sidbilder och publika tillgångar?
Datum: 2026-10-21
Beslut:
1. Originalarkivet (4,14 GiB PDF-filer) bevaras i den lokala arbetsmappen och säkerhetskopieras separat. Det exponeras aldrig direkt via webbservern.
2. Behovsgenererade bilder (t.ex. teckningar av runstenar och planschutsnitt som klarat E03:s rättighetskontroll) optimeras till moderna webbformat (WebP och SVG) och placeras i public/images/runor/ med en strikt storleksbudget (max 150 KB per bild).
3. För bilder som inte får distribueras fritt tillhandahålls en direktlänk till förlagans plansch på RAÄ:s webbplats.
Skäl: Respekterar upphovsrättsliga villkor och upprätthåller Core Web Vitals (LCP < 2,5 s).
```

---

## 5. Slutsats för E07 och Milstolpe M1

Integrationsstrategin är fastställd, Beslut D03, D04 och D05 är fattade, och bygg- och publiceringsvägarna är säkrade.

Härmed är **samtliga etapper i Milstolpe M1 (E01, E02, E03, E04, E05, E06, E07)** slutförda. Milstolpe **M1 (Beslutad grund)** är därmed **PASSERAD**.
