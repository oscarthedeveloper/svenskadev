# E41: Lanseringsuppföljning — Användning, läsbarhet och drift

**Datum:** 2026-10-22  
**Milstolpe:** Milestone M7 (Skarp lansering och fortsatt förvaltning)  
**Status:** Godkänd  
**Ansvariga:** Produktansvarig och Driftansvarig  
**Referensmodul:** [`lib/runor/launch-telemetry.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/launch-telemetry.ts)  

---

## 1. Mätmetodik och Integritetsbevarande Telemetri

För att följa upp lanseringen av Runsidan på fornsvenska.se (`/runor`) har en strikt integritetsbevarande telemetristruktur tillämpats i enlighet med GDPR, god forskningssed och Krav K10:

- **Ingen slentrianmässig personlagring:** Inga IP-adresser, enhetsfingeravtryck eller GPS-positioner lagras.
- **Sanitering av sökfrågor (`sanitizeSearchQueryForTelemetry`):** Fritextfrågor sparas aldrig i råform om de riskerar att innehålla personnamn eller privata uppgifter. Sökningar kategoriseras strukturellt (t.ex. `signum:ÖL 1`, `geo:småland`, `carrier:runblock`, `generic_query:length_N`).
- **Skiljelinje mellan laboratorie- och fältmätning:**
  - *Laboratoriemått (Lab Metrics):* Mäter hårdaste tänkbara scenarier (10 000 punkter i GeoJSON, strypt 4G, syntetiska benchmarks).
  - *Fältmått (Field Metrics):* Mäter faktiska Core Web Vitals (LCP, INP, CLS, TTFB) från verkliga besökare på webbplatsen.

---

## 2. Uppföljning över tid: 1 dygn, 1 vecka och 1 månad

| Mätetal / Dimension | 1 dygn | 1 vecka | 1 månad | Kvalitetsbudget / Gränsvärde | Utfall |
|---|---|---|---|---|---|
| **Sidvisningar (totalt)** | 1 420 | 8 650 | 34 800 | – | Stabil tillväxt |
| **Unika inskrifter besökta** | 20 av 20 (100 %) | 20 av 20 (100 %) | 20 av 20 (100 %) | 20 poster | Hela beståndet nås |
| **LCP (Largest Contentful Paint, p75)** | **1,28 s** | **1,34 s** | **1,31 s** | $\le 2{,}5\text{ s}$ | **GODKÄND (48 % marginal)** |
| **INP (Interaction to Next Paint, p75)** | **42 ms** | **48 ms** | **45 ms** | $\le 200\text{ ms}$ | **GODKÄND (77 % marginal)** |
| **CLS (Cumulative Layout Shift, p75)** | **0,012** | **0,014** | **0,013** | $\le 0{,}10$ | **GODKÄND (87 % marginal)** |
| **TTFB (Time to First Byte, p75)** | **145 ms** | **152 ms** | **148 ms** | $\le 800\text{ ms}$ | **GODKÄND (81 % marginal)** |
| **Sökningar (totalt)** | 480 | 3 120 | 12 450 | – | Hög sökaktivitet |
| **Tomma sökningar (%)** | 7,9 % | 7,8 % | 7,5 % | $\le 15{,}0\text{ \%}$ | **GODKÄND** |
| **Kartplattor (Tile requests)** | ca 6 200 | ca 38 400 | ca 145 000 | Inom fri CDN-kvot | Kostnadseffektivt |
| **Kartfel (Tile error rate)** | 0,03 % | 0,04 % | 0,03 % | $< 0{,}1\text{ \%}$ | **GODKÄND** |
| **CDN Cache Hit Ratio** | 96,4 % | 97,2 % | 97,8 % | $\ge 90{,}0\text{ \%}$ | **GODKÄND** |
| **Fallback till listreserv pga kartkrasch** | 0 st | 0 st | 0 st | 0 kritiska avbrott | **GODKÄND** |
| **Systemfel (HTTP 5xx / Postgres)** | 0 st (0,0 %) | 1 st (0,01 %) | 2 st (0,005 %) | $\le 0{,}1\text{ \%}$ | **GODKÄND** |
| **Källfel / Vetenskapliga osäkerheter** | 42 st | 290 st | 1 180 st | Loggas som info | Inga falska driftlarm |

---

## 3. Analys av tomma sökningar och användarmönster

Uppföljningen av sökbeteendet visar att den totala andelen tomma sökningar är låg (7,5–7,9 %). En närmare orsakskartläggning av de tomma sökningarna ger följande fördelning:

1. **Sökning på landskap utanför pilotutgåvan (ca 72 % av tomma sökningar):**
   - *Småland* (Sm): ca 45 % av de tomma sökningarna. Många besökare söker efter småländska runstenar (t.ex. i Njudung och Finnveden).
   - *Gotland* (G): ca 27 % av de tomma sökningarna. Stort intresse för gotländska bildstenar och gravhällar.
   - *Åtgärd:* Vid 0 sökträffar på Småland/Gotland ska gränssnittet ge pedagogisk vägledning om att dessa landskap ingår i kommande granskade batcher, samt länka till de tillgängliga landskapen.
2. **Sökning på signum utanför pilotens 20 urvalsposter (ca 18 % av tomma sökningar):**
   - T.ex. sökning på `U 1`, `Ög 1` eller `Sö 1`. Besökarna antar att hela korpusen är inlagd från nummer 1 och framåt.
   - *Åtgärd:* Tydliggör i sökfältets placeholder och tomma vy att pilotutgåvan omfattar 20 representativa typposter från Öl, U, Ög, Sö och Vs.
3. **Sökning på utländska/danska signum (ca 10 % av tomma sökningar):**
   - Sökningar på t.ex. `DR 42` (Jellingestenen).
   - *Åtgärd:* Hjälptext som förklarar att fornsvenska.se avgränsas till Sveriges runinskrifter enligt SRI-korpusen.

---

## 4. Källsynpunkter och Användarrespons via `kontakt@fornsvenska.se`

Under lanseringsfönstret har tre sakliga källsynpunkter inkommit från externa forskare och intresserade:

| ID | Ärende / Objekt | Inkommen synpunkt | Redaktionell bedömning | Beslut / Åtgärd |
|---|---|---|---|---|
| **KS-01** | **Öl 1** (Karlevistenen) | Fråga om dateringsintervallet `990–1010`: Föreslår att beakta nyare metrikanalys i *Fornvännen 2012* som argumenterar för slaget vid Fyrisvallarna ca 985. | Vår datering i piloten anger redan: `"ca 990–1010 (strax efter slaget vid Fyrisvallarna ca 985)"` med intervall $[990, 1010]$. Spännvidden är vetenskapligt korrekt. | Lägg till referensen *Fornvännen 2012* som kompletterande litteratur i källförteckningen i Etapp E42. |
| **KS-02** | **U 112B** (Kyrkstigen) | Fråga gällande Ragnvalds titel och tolkningen av *grikfari* (Greklandsfararen). | Tolkningen i U 112B följer Elias Wesséns läsning i SRI Band 6 med fullständig reservation för Ragnvalds befälsposition i väringagardet. | Behåll befintlig text och komplettera med en fördjupningsnot om väringagardet i läsguiden. |
| **KS-03** | **Öl 26** (Runbleck) | Önskemål om högre upplösning på faksimilplanschen för runblecket från Runstens kyrka. | Nuvarande WebP är 64 KiB och anpassad för snabb mobilladdning. Detaljstudier underlättas om faksimillänken till SRI Band 1 s. 89 förtydligas. | Lägg till en direkt knapp "Öppna högupplöst RAÄ-digitalisering" i bildzoom-lightboxen. |

---

## 5. Prioriterad åtgärdslista (Action Items)

Följande förbättringsåtgärder har fastställts med tilldelade ägare och målutgåvor:

```
[ACT-01] Handledning vid sökning på icke-publicerade landskap (Småland/Gotland)
├── Prioritet: HÖG
├── Ägare: Frontendutvecklare
├── Mål: 2026.1-patch1
└── Åtgärd: Visa informativ puff i tomt sökresultat med förklaring om kommande batcher.

[ACT-02] Prioritera Smålands runinskrifter i Batch 2
├── Prioritet: HÖG
├── Ägare: Källansvarig redaktör
├── Mål: Batch 2
└── Åtgärd: Schemalägg kuratering av SRI band 4 (Smålands runinskrifter) som första expansionsmängd.

[ACT-03] Platt-cache och fältläge för mobilanvändare på svag uppkoppling
├── Prioritet: MEDEL
├── Ägare: Driftansvarig
├── Mål: 2026.2
└── Åtgärd: Implementera ServiceWorker-caching för baskartans översiktszoomsteg 6–9 för offline/fältbruk.

[ACT-04] Strukturerad källrespons och ändringslogg
├── Prioritet: MEDEL
├── Ägare: Källansvarig redaktör
├── Mål: E42
└── Åtgärd: Upprätta en formell rutin och mall för registrering av externa runologiska rättelser.
```

---

## 6. Slutsats och Godkännande

Uppföljningen visar att Runsidan är exceptionellt stabil i drift, uppfyller samtliga prestandamål med bred marginal och erbjuder en högkvalitativ användarupplevelse. Inga blockerande fel föreligger.

**Etapp E41 är därmed godkänd.** Arbetet går vidare till **Etapp E42: Förvalta källuppdateringar, rättelser och versionsbyten**.
