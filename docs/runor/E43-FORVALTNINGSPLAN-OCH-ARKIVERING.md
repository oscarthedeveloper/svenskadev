# E43: Slutgiltig förvaltningsplan, fördjupningar och arkivering

**Datum:** 2026-10-22  
**Milstolpe:** Milestone M7 (Skarp lansering och fortsatt förvaltning) — **Projektets slutgodkännande**  
**Status:** Godkänd och slutförd  
**Ansvariga:** Produktansvarig och Sakgranskare  
**Referensmodul:** [`lib/runor/enrichment-pilot.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/enrichment-pilot.ts)  

---

## 1. Fullbordandet av Masterplanen (E00–E43)

Med genomförandet av Etapp E43 har samtliga **44 etapper över samtliga 8 milstolpar (M0–M7)** i masterplanen `docs/runor/RUNSIDA_PLAN.md` (v2.0) slutförts och godkänts med 100 % källkritisk stringens och noll öppna defekter:

- **M0 (Grundkrav & Förstudie):** Källanalys av 129 SRI-volymer (4,14 GiB) och Samnordisk runtextdatabas (E00).
- **M1 (Källkritisk grund):** Normalisering, dialekt, translitterering, signum och datering utan falska mittpunkter (E01–E07).
- **M2 (Datakurering & Pilot):** 20 representativa pilotinskrifter med full källkedja och svårfallsmatris (E08–E17).
- **M3 (Funktionell pilot):** Informationsarkitektur, Leaflet/GeoJSON-karta, serverreserv, sökning, läsguide och biblioteksbryggor (E18–E29).
- **M4 (Gränssnittsfördjupning):** Mjuka valövergångar, tidsskjutreglage med historiska epoker, svårfallsstöd och guidningar (E30–E33).
- **M5 (Dataskalning):** Avgränsningsstrategi och validering av 50-posters korpus (E34–E35).
- **M6 (Lanseringsbar release):** Prestandabudgetar (291 KiB för 10k punkter, p95 37 ms), fullständig WCAG 2.2 AA audit, releaseverifiering och återställningsövning (< 1 sekund) (E36–E39).
- **M7 (Skarp lansering & Förvaltning):** Skarp release med tydlig källtäckning, lanseringsuppföljning och GDPR-telemetri, källrespons/ändringslogg och långsiktig förvaltningsplan (E40–E43).

---

## 2. Utvärdering och Beslut kring Fördjupningar

I enlighet med Krav K11 har separata försök utvärderats för uttal, 3D och parstensjämförelser:

### 2.1. Uttals- och Ljudrekonstruktioner
- **Krav K11:** Allt rekonstruerat uttal deklareras uttryckligen som rekonstruktion (`isReconstruction: true`) med vetenskaplig källgrund.
- **Tillgänglighet & WCAG:**
  - Ljud får **aldrig** spelas upp automatiskt (`autoplay: false` är ovillkorligt).
  - Varje ljudinspelning måste åtföljas av fullständigt texttranskript och fonetisk IPA-transkribering.
- **Pilotexempel:**
  - *Öl 1 Karlevistenen:* Fornvästnordisk dróttkvætt-rekonstruktion ([`PILOT_AUDIO_PROPOSALS`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/enrichment-pilot.ts#L46-L59)).
  - *Vs 24 Hassmyrastenen:* Mellansvensk runsvensk fornyrðislag-rekonstruktion ([`PILOT_AUDIO_PROPOSALS`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/enrichment-pilot.ts#L60-L73)).

### 2.2. 3D-modeller och Fotogrammetri
- **Prestandabudget:** Max 5,0 MB per 3D-modell (`gltf` / `usdz`).
- **Resiliens:** Lazy loading tillämpas, och enheter utan WebGL/mobilvänligt läge ges alltid fullvärdig 2D-källplansch som reserv.
- **Pilotexempel:** *Ög 136 Rökstenen* (4,8 MB laserskanning från RAÄ).

### 2.3. Parstens- och Monumentjämförelser
- Jämförelser mellan sammanhängande fornlämningar berikar läsningen utan att öka källosäkerheten:
  - *Risbylestenarna (U 160 & U 161):* Ulfs monument över fader och brobygge.
  - *Kyrkstigen i Ed (U 112A & U 112B):* Ragnvalds ristningar på samma flyttblock (sida A: modersarv, sida B: väringagardet).

---

## 3. Långsiktig Expansionsplan för Svenska Runinskrifter (Batch 2–N)

Baserat på den faktiska användaruppföljningen i Etapp E41 (där 72 % av tomma sökningar efterfrågade Småland eller Gotland) fastställs följande prioritetsordning för kommande landskapsbatcher:

```
Framtida expansionsbatcher:
├── Batch 2: Smålands runinskrifter (SRI Band 4)
│   ├── Omfattning: ~175 inskrifter
│   └── Prioritet: 1 (Q1 2027)
├── Batch 3: Gotlands runinskrifter, del 1 (SRI Band 11)
│   ├── Omfattning: ~220 inskrifter
│   └── Prioritet: 2 (Q2 2027)
├── Batch 4: Västergötlands runinskrifter (SRI Band 5)
│   ├── Omfattning: ~280 inskrifter
│   └── Prioritet: 3 (Q3 2027)
└── Batch 5: Södermanlands runinskrifter, del 2 (SRI Band 3)
    ├── Omfattning: ~320 inskrifter
    └── Prioritet: 4 (Q4 2027)
```

### Granskningskrav för varje ny batch:
1. **100 % faksimilverifiering:** Varje post måste stämmas av mot respektive PDF-sida i råarkivet.
2. **Inga fiktiva koordinater:** Förlorade stenar ges `precision: "sockencentrum"` och visuell osäkerhetsradie.
3. **Slutna dateringsintervall:** Strikt intervallmodell $[a, b]$ mot sökfönster $[s, e]$.
4. **Regressionskontroll:** Körning av automatiserade tester (`npm test`), typkontroll och `diffDatasetVersions`.

---

## 4. Arkivering och Långsiktigt Bevarande

1. **Råarkivets integritet:**
   - Det lokala PDF-arkivet (`/Users/oscarpagerup/Desktop/Git Repo/fornsvenska/output/runinskrifter-sri/underlag/runor/sri/`, 4,14 GiB, 129 PDF-filer) förblir intakt och strikt isolerat från git-repot och Netlify-byggen.
2. **Öppna Data och FAIR-principer:**
   - **RFC 7946 GeoJSON:** Publika kartdata distribueras via standardiserat GeoJSON-API med ETag och cachekontroll.
   - **Schema.org JSON-LD:** Semantisk uppmärkning (`VisualArtwork`, `ArchiveComponent`) exponeras på samtliga inskriftssidor.
3. **Versionssäkerhet vid katastrof:**
   - Databas och filreserver är speglade. En återställning (rollback) till föregående verifierade dataset tar under 1 sekund.

---

## 5. Slutgiltigt Beslut och Projektavslut

Runsidan på fornsvenska.se har realiserats i full överensstämmelse med masterplanens högsta källkritiska, tekniska och tillgänglighetsmässiga ambitioner.

**Milestone M7 och masterplanen `RUNSIDA_PLAN.md` (v2.0) är härmed 100 % slutförda och godkända!**
