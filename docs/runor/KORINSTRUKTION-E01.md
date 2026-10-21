# Körinstruktion: Återskapande och drift av SRI-korpusen (E01)

Denna instruktion beskriver hur SRI-materialet (Sveriges runinskrifter, 129 PDF-filer) återskapas, verifieras och analyseras i en ny eller återställd arbetsmiljö.

---

## 1. Förutsättningar och systemkrav

- **Python**: 3.10 eller senare (testat på Python 3.11.9)
- **curl**: 8.0 eller senare (med stöd för HTTP Range och SSL)
- **Diskutrymme**: Minst 5 GB ledigt utrymme för original-PDF:erna (totalt 4,14 GiB) samt ytterligare 1 GB för extraherat text- och sidindex.
- **Python-paket**: `pypdfium2` (endast för textanalys, ej för ren nedladdning/verifiering).

---

## 2. Katalogstruktur

Filerna ska placeras enligt följande struktur (ligger utanför Git och `public/`):

```text
SvenskaDev/
├── docs/runor/
│   ├── nedladdningsmanifest.json   # Spårbar inventering med URL, byte och SHA-256
│   ├── pdf-analys.json             # Teknisk analys per sida och volym
│   ├── INSAMLING.md                # Dokumentation över hämtat material
│   ├── ATERSTALLNINGSPROTOKOLL-E01.md
│   └── RUNSIDA_PLAN.md             # Genomförandeplanen
├── scripts/runor/
│   ├── download-runinskrifter.py   # Automatiserad hämtning med återupptagning
│   ├── analyze-runinskrifter.py    # Textlagerextraktion och sidstatistik
│   └── test-recovery-e01.py        # Verifierings- och återställningstest
└── underlag/runor/sri/              # (Git-ignorerad lokal rådatakatalog)
    ├── kallsida.html
    ├── band-01/
    ├── ...
    └── text/                       # Extraherade TXT- och JSONL-sidfiler
```

---

## 3. Steg för återställning och verifiering

### Steg A: Verifiera befintlig eller återställd kopia
För att kontrollera att en lokal kopia av arkivet är komplett och oförvanskad:

```bash
python3 scripts/runor/test-recovery-e01.py
```

Skriptet verifierar:
1. Att alla 129 filer finns på plats.
2. Att varje fil matchar sin officiella SHA-256-kontrollsumma.
3. Att korrupta filer och avbrutna `.part`-nedladdningar identifieras och avvisas.

### Steg B: Nyhämtning eller återupptagning vid dataförlust
Om filer saknas eller skadats kan hämtaren köras för att återuppta eller fylla på arkivet:

```bash
# 1. Endast inventera källsidans länkar:
python3 scripts/runor/download-runinskrifter.py --inventory-only

# 2. Hämta med 3–6 parallella arbetstrådar:
python3 scripts/runor/download-runinskrifter.py --workers 6
```

Hämtaren använder `curl --continue-at -` för säker återupptagning och sparar temporära filer som `.pdf.part` innan de valideras mot `%PDF-` och döps om.

### Steg C: Extrahera textlager och generera sidindex
När PDF-filerna finns lokalt extraheras det befintliga textlagret sida för sida:

```bash
python3 scripts/runor/analyze-runinskrifter.py
```

Detta genererar läsbara textfiler och radseparerade JSONL-filer i `underlag/runor/sri/text/`.
