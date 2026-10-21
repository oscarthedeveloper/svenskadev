# Återställningsprotokoll: E01 — Återskapa insamlingen och prova återställning

**Projekt**: Runsidan på fornsvenska.se (`SvenskaDev`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E01  
**Ansvar**: Dataansvarig och driftansvarig  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md) och [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Systemmiljö och verktygsversioner

- **Operativsystem**: macOS (Darwin 26.0, x86_64)
- **Python-version**: Python 3.11.9 (`/usr/local/bin/python3`)
- **curl-version**: curl 8.7.1 (x86_64-apple-darwin26.0) libcurl/8.7.1 SecureTransport LibreSSL/3.3.6 zlib/1.2.12 nghttp2/1.69.0
- **Källarkiv**: `/Users/oscarpagerup/Desktop/Git Repo/fornsvenska/output/runinskrifter-sri/underlag/runor/sri`
- **Manifest**: [`docs/runor/nedladdningsmanifest.json`](./nedladdningsmanifest.json) (129 registrerade PDF-filer)
- **Analysfil**: [`docs/runor/pdf-analys.json`](./pdf-analys.json) (7 217 sidor)

---

## 2. Baslinjeverifiering av originalarkivet (129/129)

Skriptet [`scripts/runor/test-recovery-e01.py`](../../scripts/runor/test-recovery-e01.py) läste in samtliga 129 poster i manifestet och beräknade SHA-256-kontrollsummor samt filstorlekar direkt mot disk.

| Mätvärde | Utfall | Status |
| :--- | :--- | :--- |
| **Registrerade filer i manifest** | 129 st | Verifierat |
| **Faktiskt hittade originalfiler** | 129 st | Verifierat |
| **Matchande SHA-256-kontrollsummor** | 129 av 129 (100 %) | **Godkänt** |
| **Total korpusstorlek** | 4 440 853 483 byte (4,14 GiB) | Exakt match |
| **Saknade filer** | 0 st | Inga |
| **Korrupta / ändrade filer** | 0 st | Inga |

Samtliga originalfiler i källarkivet förblev **helt orörda** under verifieringen (skrivskyddad läsning).

---

## 3. Provåterställning och felhanteringstester

I enlighet med godkännandekraven för E01 utfördes återställnings- och feldetekteringstester i en isolerad tillfällig katalog:

### Test 1: Återställning till tom katalog
- **Genomförande**: Två representativa volymer (en ren textvolym och en volym med planscher) kopierades till en nyskapad tom temporär mapp.
- **Kontroll**: SHA-256 beräknades på de återställda filerna och jämfördes mot manifestet.
- **Utfall**: **GODKÄNT**. Kontrollsummorna matchade originalen till 100 %.

### Test 2: Detektering av korrupt kopia
- **Genomförande**: En byte-sekvens (500 byte in i filen) manipulerades i den återställda testfilen (`CORRUPTED_DATA_BLOCK_FOR_TESTING`).
- **Kontroll**: Verifieringslogiken kördes mot den manipulerade filen.
- **Utfall**: **GODKÄNT**. Kontrollsumman avvek omedelbart och filen flaggades och avvisades som korrupt.

### Test 3: Detektering av avbruten/ofullständig fil
- **Genomförande**: En ofullständig fil skapades med ändelsen `.part` och en trunkerad filstorlek (128 byte).
- **Kontroll**: Verifieraren kontrollerade att ofullständiga filer inte klassas som godkända `.pdf`-original.
- **Utfall**: **GODKÄNT**. Den ofullständiga filen isolerades och nekades godkännande.

---

## 4. Slutsats och beslut för E01

Kriterierna i `RUNSIDA_PLAN.md` för E01 är uppfyllda:
1. Den återställda kopian matchar **129/129 SHA-256**.
2. Både avbrutet test (`.part`) och korrupt kopia upptäcktes automatiskt.
3. Befintliga originalfiler förblev orörda.
4. Säkerhetskopian och arkivstrukturen är reproducerbar via dokumenterad körinstruktion.

Etapp E01 kvitteras härmed som **KLAR**.
