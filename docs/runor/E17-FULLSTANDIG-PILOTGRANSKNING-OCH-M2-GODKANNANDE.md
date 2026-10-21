# E17 — Fullständig innehållsgranskning av piloten och godkännande av Milstolpe M2

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E17  
**Ansvar**: Redaktionellt ansvarig  
**Beroenden**: E01, E03, E12, E13, E14, E15, E16 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), [`pilot-20-inskrifter.json`](./pilot-20-inskrifter.json), [`bildmanifest-e16.json`](./bildmanifest-e16.json)  
**Status**: **GODKÄND (Milstolpe M2 Slutförd)**

---

## 1. Syfte och godkännandekrav

Etapp E17 markerar slutpunkten för **Milstolpe M2: Betrodd innehållspilot**.  
Målet är att genomföra en fullständig, revisionsmässig granskning av hela kedjan:
$$\text{Identitet} \longrightarrow \text{Källa (SRI)} \longrightarrow \text{Sidor \& Figurer} \longrightarrow \text{Geografi \& Datering} \longrightarrow \text{Textversioner} \longrightarrow \text{Bilder}$$

### Kriterier för godkännande av M2:
1. **20/20 granskade poster**: Samtliga pilotposter uppfyller kraven i Avsnitt 9.2 (Identitet, Källkedja, Plats, Datering, Text, Bild, Redaktionell proveniens).
2. **0 olösta konflikter**: Noll olösta sammanslagningar eller felaktiga källkopplingar.
3. **100 % passande automatiserade tester**: Både enskild entitetsvalidering (`validateRunicInscription`) och korpusvalidering (`validateRunicCorpus`) passerar grönt.
4. **Verifierat kontrollurval (20 % låst)**: De 4 svårfallsinskrifterna från E09 (Öl 15, U 73, U 112B, Vs 24) granskas och godkänns specifikt.
5. **Rättighetsklarhet**: Samtliga bildresurser och textkällor har dokumenterade fria villkor (Public Domain) i enlighet med Beslut D01.

---

## 2. Revisionsprotokoll per granskningsområde (Avsnitt 9.2)

| Område | Revisionskrav | Utfall | Status |
| :--- | :--- | :--- | :--- |
| **Identitet** | Stabila ID:n, kanoniskt signum, slug, alias | 20/20 poster har unika ID:n, slugar och alias. Inga dubbletter. | **GODKÄND** |
| **Källkedja** | Volym, tryckta sidor, PDF-sidor, källversion | 20/20 poster är individuellt kopplade till käll-PDF och tryckt sida i SRI. | **GODKÄND** |
| **Plats & Geografi** | Giltiga WGS84-koordinater inom Norden, socken/landskap | 20/20 poster har verifierade platser. U 73 har två placeringar (fyndplats + Skansen). Förlorade objekt (Öl 15, Öl 16, Öl 23) har `sockencentrum` utan påhittade koordinater. | **GODKÄND** |
| **Datering** | Källintervall och Gräslunds stilgrupper | Källbaserade intervall, inga fiktiva mittpunkter som exakta årtal. | **GODKÄND** |
| **Textversioner** | Translitterering, normalisering och svensk källöversättning | 20/20 poster har fullständiga källtrogna textlager från SRI. Versmått (dróttkvætt, fornyrðislag) dokumenterade. Inga AI-påhittade original. | **GODKÄND** |
| **Bilder** | Bildmanifest, dimensioner, webboptimering | 19 WebP-bilder (display max 1100 px, tumnagel max 360 px, snittstorlek 10–85 KB) samt 1 förlorad inskrift med informativ SVG-placeholder (`ej-avbildad.svg`). Samtliga Public Domain. | **GODKÄND** |

---

## 3. Utfall för det 20 % låsta kontrollurvalet

De fyra inskrifterna som låstes i etapp E09 som representanter för datamodellens svåraste gränsfall har genomgått särskild granskning:

```text
1. Öl 15 (Södra Möckleby kyrkogård):
   - Kategori: Förlorad runsten sedan 1800-talet, ej avbildad.
   - Resultat: precision: "sockencentrum", coordinatesWgs84: [16.4167, 56.3500],
     depicted: false, placeholder: /images/runor/ej-avbildad.svg.
   - Status: GODKÄND. Inga påhittade koordinater eller fiktiva bilder.

2. U 73 (Hansta / Skansenstenen):
   - Kategori: Sekundärt flyttad sten med två relevanta geografiska platser.
   - Resultat:
     * Placering 1 (fyndplats): Hansta gård, Spånga sn, [17.8999, 59.4219], exakt koordinat.
     * Placering 2 (nuvarande): Skansen (Bollnästorgets backe), [18.1017, 59.3253], exakt koordinat.
   - Status: GODKÄND. Båda platserna bevarade och sökbara.

3. U 112B (Runblocket i Ed, östra sidan / Grekland):
   - Kategori: Två distinkta runinskrifter på samma fysiska bärare (U 112A & U 112B).
   - Resultat: Delar samma bärare (carrier-u-112, flyttblock), men har separata inskrifts-ID:n,
     separata textlager (Ragnvalds greklandsfärd på U 112B) och separata planscher (Pl. 51 resp. Pl. 52).
   - Status: GODKÄND. Datamodellens separation mellan Bärare och Inskrift bevisad.

4. Vs 24 (Hassmyrastenen / Odendisa):
   - Kategori: Sen vikingatid (1050–1080), skaldestrof på fornyrðislag över husfru.
   - Resultat: Ristarsignatur Balle den röde, stilgrupp Pr3, fornvästmanländska dialektdrag
     i normalisering, auktoritativ översättning från Jansson (1964).
   - Status: GODKÄND. Litterär och språkhistorisk fullständighet uppnådd.
```

---

## 4. Revisionsresultat och automatiserad evidens

Körning av det dedikerade revisionsskriptet [`scripts/runor/audit-pilot-release-e17.py`](../../scripts/runor/audit-pilot-release-e17.py):

```text
=== E17: Fullständig revisionsgranskning av M2 Pilotdataset ===
Granskar 20 inskrifter mot Avsnitt 9.2...

Granskar det låsta 20 %-kontrollurvalet:
  [PASS] Öl 15: förlorad, sockencentrum, ej-avbildad placeholder
  [PASS] U 73: 2 placeringar (Hansta fyndplats + Skansen nuvarande placering)
  [PASS] U 112B: B-parti på Ed-blocket (U 112A + U 112B verifierade)
  [PASS] Vs 24: Odendisa-skaldestrof och Pr3-datering verifierad

Resultat:
20/20 inskrifter granskade och godkända utan anmärkning!
4/4 kontrollposter godkända i det låsta kontrollurvalet.
Milstolpe M2 är därmed fullständigt verifierad och klar för release.
```

- **Testsvit (`npm test`)**: 31 tester passerade (100 % grönt).
- **Typkontroll (`npm run typecheck`)**: 0 TypeScript-fel.

---

## 5. Slutsats och godkännande av Milstolpe M2

Samtliga etapper i Milstolpe M2 (**E08–E17**) är härmed slutförda, dokumenterade och verifierade.  
Datasetet är fryst under version `fornsvenska-runor-pilot-v1` och tillgängligt för frontend-utveckling i:
- `docs/runor/pilot-20-inskrifter.json`
- `lib/runor/pilot-data.ts`
- `docs/runor/bildmanifest-e16.json`
- `public/images/runor/`

**Milstolpe M2 förklaras härmed GODKÄND.**  
Projektet är därmed redo att påbörja **Milstolpe M3: Webbgränssnitt och besökarupplevelse** (med början i E18: Prototypa informationsstruktur och alla huvudtillstånd, samt E19: Prova kartmotor).
