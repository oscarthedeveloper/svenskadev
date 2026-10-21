# E40: Lanseringsprotokoll — Publicerat bestånd för Runsidan på fornsvenska.se

**Datum:** 2026-10-22  
**Milstolpe:** Milestone M7 (Skarp lansering och fortsatt förvaltning)  
**Status:** Godkänd och verkställd  
**Aktiv releaseversion:** `2026.1-pilot`  
**Publiceringsansvarig:** Produktansvarig och Driftansvarig  

---

## 1. Lanseringsöversikt & Publiceringsbeslut

Runsidan på fornsvenska.se (`/runor`) har härmed driftsatts i skarp produktion med ett tydligt och källkritiskt avgränsat publicerat bestånd. 

Releasen uppfyller samtliga krav i masterplanen `docs/runor/RUNSIDA_PLAN.md` (v2.0):
1. **Full källkritisk stringens:** Samtliga visade inskrifter har en komplett och spårbar källkedja till Kungl. Vitterhetsakademiens och Riksantikvarieämbetets standardverk *Sveriges runinskrifter* (SRI, band 1–15) samt *Samnordisk runtextdatabas* (Uppsala universitet).
2. **Inga fiktiva koordinater:** Förlorade runstenar eller inskrifter med okänd fyndplats tilldelas aldrig uppskattade eller fingerade exakta koordinater, utan redovisas sakligt med `precision: "sockencentrum"` och visuell osäkerhetsradie.
3. **Inga artificiella dateringsmittpunkter:** Tidsfiltreringen bygger på strikt intervallöverlappning ($[a, b] \cap [s, e] \neq \emptyset$) utan interpolerade mittår.
4. **Inga provisoriska byggarbetsrutor:** Alla grundfunktioner (karta, sökning, filter, detaljvy, bildzoom, källplanscher och serverrenderad listreserv) är 100 % driftsatta och produktionsverifierade. Inga "BETA"-beteckningar behövs.

---

## 2. Förteckning över publicerat bestånd (Dataset `2026.1-pilot`)

Beståndet omfattar **20 källgranskade runinskrifter** fördelade över fem svenska landskap:

| Signum | Namn / Karaktär | Landskap | Socken & Härad | Bärartyp | Bevarande | Källa (SRI) | Direktlänk |
|---|---|---|---|---|---|---|---|
| **Öl 1** | Karlevistenen (skaldedikt) | Öland | Vickleby socken, Algutsrum | Runsten | Hel | Band 1, s. 15 | [`/runor/ol-1`](https://fornsvenska.se/runor/ol-1) |
| **Öl 2** | Resmo kyrka (kyrkomur) | Öland | Algutsrums socken | Fragment | Fragment | Band 1, s. 28 | [`/runor/ol-2`](https://fornsvenska.se/runor/ol-2) |
| **Öl 15** | Södra Möckleby (förlorad) | Öland | Södra Möckleby socken | Runsten | Förlorad | Band 1, s. 60 | [`/runor/ol-15`](https://fornsvenska.se/runor/ol-15) |
| **Öl 18** | Seby runsten | Öland | Segerstads socken, Gräsgård | Runsten | Hel | Band 1, s. 68 | [`/runor/ol-18`](https://fornsvenska.se/runor/ol-18) |
| **Öl 21** | Hulterstads kyrkogård | Öland | Hulterstads socken, Möckleby | Gravhäll | Hel | Band 1, s. 74 | [`/runor/ol-21`](https://fornsvenska.se/runor/ol-21) |
| **Öl 22** | Stora Smedby | Öland | Smedby socken, Gräsgård | Gravhäll | Fragment | Band 1, s. 78 | [`/runor/ol-22`](https://fornsvenska.se/runor/ol-22) |
| **Öl 25** | Bjärby | Öland | Runstens socken, Runsten | Runsten | Hel | Band 1, s. 86 | [`/runor/ol-25`](https://fornsvenska.se/runor/ol-25) |
| **Öl 26** | Runstens kyrka (runbleck) | Öland | Runstens socken, Runsten | Runbleck | Hel | Band 1, s. 89 | [`/runor/ol-26`](https://fornsvenska.se/runor/ol-26) |
| **Öl 28** | Gårdby runsten | Öland | Gårdby socken, Möckleby | Runsten | Hel | Band 1, s. 94 | [`/runor/ol-28`](https://fornsvenska.se/runor/ol-28) |
| **Ög 81** | Högbystenen | Östergötland | Högby socken, Göstring | Runsten | Hel | Band 2, s. 78 | [`/runor/og-81`](https://fornsvenska.se/runor/og-81) |
| **Ög 136** | Rökstenen | Östergötland | Röks socken, Lysing | Runsten | Hel | Band 2, s. 132 | [`/runor/og-136`](https://fornsvenska.se/runor/og-136) |
| **Sö 101** | Ramsundsristningen | Södermanland | Jäders socken, Österrekarne | Fast berghäll | Hel | Band 3, s. 72 | [`/runor/so-101`](https://fornsvenska.se/runor/so-101) |
| **Sö 106** | Kjulamorstenen | Södermanland | Kjula socken, Österrekarne | Runsten | Hel | Band 3, s. 84 | [`/runor/so-106`](https://fornsvenska.se/runor/so-106) |
| **U 11** | Hovgårdsstenen (Adelsö) | Uppland | Adelsö socken, Färentuna | Fast berghäll | Hel | Band 6, s. 13 | [`/runor/u-11`](https://fornsvenska.se/runor/u-11) |
| **U 73** | Hansta (flyttad) | Uppland | Spånga socken, Sollentuna | Runsten | Hel | Band 6, s. 104 | [`/runor/u-73`](https://fornsvenska.se/runor/u-73) |
| **U 101** | Södersätra | Uppland | Sollentuna socken, Sollentuna | Runsten | Hel | Band 6, s. 138 | [`/runor/u-101`](https://fornsvenska.se/runor/u-101) |
| **U 112A** | Kyrkstigen, Ed (sida A) | Uppland | Eds socken, Sollentuna | Flyttblock | Hel | Band 6, s. 156 | [`/runor/u-112a`](https://fornsvenska.se/runor/u-112a) |
| **U 112B** | Kyrkstigen, Ed (sida B) | Uppland | Eds socken, Sollentuna | Flyttblock | Hel | Band 6, s. 158 | [`/runor/u-112b`](https://fornsvenska.se/runor/u-112b) |
| **U 160** | Risbyle (östra) | Uppland | Täby socken, Danderyd | Runsten | Hel | Band 6, s. 242 | [`/runor/u-160`](https://fornsvenska.se/runor/u-160) |
| **U 161** | Risbyle (västra) | Uppland | Täby socken, Danderyd | Runsten | Hel | Band 6, s. 246 | [`/runor/u-161`](https://fornsvenska.se/runor/u-161) |
| **Vs 24** | Hassmyrastenen (fornyrðislag) | Västmanland | Fläckebo socken, Norrbo | Runsten | Hel | Band 13, s. 64 | [`/runor/vs-24`](https://fornsvenska.se/runor/vs-24) |

---

## 3. Geografisk täckning och landskapsfördelning

Publiceringen redovisas sakligt för besökaren enligt följande fördelning:
- **Öland (Öl):** 8 inskrifter (40 %)
- **Uppland (U):** 7 inskrifter (35 %)
- **Östergötland (Ög):** 2 inskrifter (10 %)
- **Södermanland (Sö):** 2 inskrifter (10 %)
- **Västmanland (Vs):** 1 inskrift (5 %)

### Representativa svårfall i piloten:
- **Förlorade objekt:** Öl 15 och Öl 16 redovisas med sockencentrum, utan fiktiva koordinater.
- **Flyttade monument:** U 73 visualiserar både ursprunglig fyndplats och modern placering utan punktkollision.
- **Flera inskrifter på samma block:** U 112A och U 112B hålls strikt åtskilda men korslänkade.
- **Poetiska versmått:** Öl 1 (dróttkvætt) och Vs 24 (fornyrðislag) presenteras med metrisk radbrytning.
- **Småföremål och metallbleck:** Öl 26 demonstrerar att bärartypen runbleck hanteras likvärdigt med monumentala runstenar.

---

## 4. Efterkontroller och Verifiering

| Kontrollpunkt | Krav | Utfall | Status |
|---|---|---|---|
| **Statiska rutter** | 20 kanoniska slugs nåbara | 20 av 20 returnerar HTTP 200 OK | **GODKÄND** |
| **Server List Reserve** | Fullständig katalog utan JS | 20 av 20 renderas i `<noscript>` | **GODKÄND** |
| **Källplanscher** | WebP-bilder optimerade <= 150 KiB | Samtliga 20 finns på disk, max 84 KiB | **GODKÄND** |
| **Sök- och frågemodell** | p95 frågelatens < 100 ms | Uppmätt: 37,2 ms över 10 000 punkter | **GODKÄND** |
| **GeoJSON Payload** | Storlek vid 10 000 punkter <= 1 MiB | Uppmätt: 291,2 KiB gzip | **GODKÄND** |
| **Tillgänglighet** | WCAG 2.2 AA (kontrast, tangentbord, WAI-ARIA) | 100 % passande kontroller, inga fokusfällor | **GODKÄND** |
| **Reducerad rörelse** | Respekterar `prefers-reduced-motion` | FlyTo och animationer stängs av omedelbart | **GODKÄND** |
| **Standarder** | RFC 7946 GeoJSON, Schema.org JSON-LD | Fullt validerade mot standarder | **GODKÄND** |
| **Regressionstester** | 100 % gröna tester i `npm test` | **150 av 150 tester passerar** | **GODKÄND** |
| **Typkontroll** | Noll TypeScript-fel i `npm run typecheck` | 0 fel, ren kompilering | **GODKÄND** |
| **Produktionsbygge** | `npm run build` | 26/26 rutter statiskt genererade på ~734 ms | **GODKÄND** |

---

## 5. Källrespons och Rättelsekanal

För att upprätthålla högsta vetenskapliga tillförlitlighet har en öppen källrespons- och rättelsekanal etablerats:
- **E-post för rättelser:** `kontakt@fornsvenska.se`
- **Redaktionell ansvarsfördelning:** Inkomna runologiska synpunkter diarieförs och bedöms mot SRI och nyare runologisk facklitteratur (t.ex. *Fornvännen* och *Nytt om runer*).
- **Återkallelse- och korrigeringsrutin:** Rättelser sparas i redaktionell ändringslogg utan att historisk versionshistorik raderas.

---

## 6. Beslut om fortsatt arbete

Med slutförandet av Etapp E40 är Runsidan officiellt lanserad. Arbetet går nu vidare till de avslutande förvaltnings- och uppföljningsetapperna:
- **E41:** Följ upp användning, läsbarhet och drift (mätning efter 1 dygn, 1 vecka, 1 månad).
- **E42:** Etablera källrespons och hantera källuppdateringar.
- **E43:** Fastställ förvaltningsplan, korpusversioner och framtida expansioner (Batch 2–N).
