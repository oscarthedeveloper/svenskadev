# E32 — Bygg dokumenterad läsanimation för utvalda inskrifter

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E32  
**Ansvar**: Sakredaktör och frontendutvecklare  
**Beroenden**: E15, E16, E26, E30 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), Krav K11, Beslut D04  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och källkritiska principer

Etapp E32 knyter läsarens blick på den fotografiska källplanschen till runskriftens faktiska läsordning, språkliga normalisering och svenska översättning:

1. **Skilj redaktionell visualisering från huggtillfället (Krav K11)**:
   - Systemet påstår inte att animationen återskapar den historiska stenmästarens exakta arbetsordning eller huggsekvens.
   - Den stegade läsningen representerar en **granskad redaktionell läsväg** som leder besökarens öga genom runormens slingor från inledande resningsformel till eventuell skaldedikt, förbön och ristarsignatur.
2. **Koppling i bildens koordinater (procentuell skalning)**:
   - Samtliga lässegment är manuellt granskade och definierade med procentuella koordinater (`boundingBoxPercent: { x, y, width, height }`).
   - Detta garanterar att markören stämmer exakt oberoende av skärmupplösning, zoomnivå eller mobilvy.
3. **Full läsbarhet utan overlay**:
   - Bildmarkeringen kan när som helst döljas via knappen `⚪ Dölj markering` så att besökaren kan studera planschen utan störande element.
   - Texten, translittereringen, normaliseringen och översättningen visas i ett tydligt och fullt läsbart kort nedanför bilden, samt i en expanderbar sammanhängande textsekvens.
4. **Tydlig markering av osäkra segment**:
   - Skadade, vittrade eller rekonstruerade partier (t.ex. slutraden på Vs 24 eller inledningen på Öl 1) markeras med `isUncertain: true`, bärnstensgul streckad kontur och tydlig varningstext (`⚠️ Osäker läsning`).
5. **Tangentbords- och rörelsetillgänglighet**:
   - Användaren kan stega manuellt med sifferknappar, `Föregående` / `Nästa` eller tangentbordets piltangenter (`ArrowLeft` / `ArrowRight`).
   - Automatisk uppspelning är valbar (`▶ Spela läsning` / `⏸ Pausa stegning`), startar **aldrig automatiskt** och avbryts omedelbart om användaren har aktiverat `prefers-reduced-motion`.

---

## 2. Granskade referensexempel (4 inskrifter)

Etappen omfattar fyra välunderbyggda och rättighetsklara exempel från *Sveriges runinskrifter*:

| Signum | Namn | Plansch / Förlaga | Antal segment | Karaktär och läsväg |
|---|---|---|---|---|
| **Vs 24** | Hassmyrastenen | *Västmanlands runinskrifter*, pl. 18 | 4 segment | Vänster rundjurslinga nerifrån och upp, toppbåge, fornyrðislag-dikt nedåt till höger, inre Balle-signatur och skadad slutrad. |
| **Sö 179** | Gripsholmsstenen | *Södermanlands runinskrifter*, s. 153 | 4 segment | Ingvarssten: Vänster djurkropp uppåt, toppbåge om guldjakten, versen om örnens föda och slutraden om döden i Särkland. |
| **Öl 1** | Karlevistenen | *Ölands runinskrifter*, s. 15 | 3 segment | Nordens äldsta dróttkvætt: Vertikal prosainledning följt av de två halvstroferna till minne av Sibbe gode. |
| **U 73** | Hansta | *Upplands runinskrifter*, s. 101 | 3 segment | Greklandsfararsten: Parstenens inledning uppåt, toppbåge om sönerna, och inre slingan om döden i Grekland (Bysans). |

---

## 3. Implementerade komponenter och moduler

- **Modell & segmentdata**: [`lib/runor/reading-segments.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/reading-segments.ts)
- **Interaktiv läsguide-komponent**: [`components/runor/RunorReadingGuide.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorReadingGuide.tsx)
- **Integrering i detaljvyn**: [`components/runor/RunorDetailView.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorDetailView.tsx)

---

## 4. Automatiserad verifiering ([`tests/runor-reading.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-reading.test.mjs))

Testsviten kontrollerar:
1. Minst 4 representativa exempel ingår (Vs 24, Sö 179, Öl 1, U 73).
2. Alla procentuella koordinater ryms inom $[0, 100]$ % och har strikt sekventiell numrering.
3. Skadade/vittrade partier flaggas som osäkra (`isUncertain === true`).
4. Inskrifter utan källplansch eller läsguide (t.ex. förlorade Öl 15) returnerar rent `null`.
5. Full textläsbarhet utan bildoverlay enligt Krav K11.

Utfall: **109 av 109 tester godkända** i `npm test`. Typecheck och Next.js produktionsbygge (26 rutter) genomförs felfritt.
