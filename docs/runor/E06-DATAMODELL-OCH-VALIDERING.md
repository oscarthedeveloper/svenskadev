# E06 — Datamodell och valideringskontrakt

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E06  
**Ansvar**: Datautvecklare och redaktör  
**Beroenden**: E03, E05 (båda klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och arkitektur

Datamodellen implementeras i TypeScript i [`lib/runor/types.ts`](../../lib/runor/types.ts) och valideras strikt genom [`lib/runor/validation.ts`](../../lib/runor/validation.ts).

Modellen är designad för att:
1. **Bevara källtrohet**: Textlager, dateringar och platser lagras med källans formulering och osäkerhet, inte tvingad syntetisk precision.
2. **Koppla källkedjan**: Varje inskrift pekar på en volym i *Sveriges runinskrifter* (SRI) med tryckt sida och PDF-sida.
3. **Tillåta null- och osäkerhetsvärden**: Inskrifter med förlorat läge tillåts ha `coordinatesWgs84: null` med `precision: 'okant_lage'`.
4. **Spärra ogiltiga data**: Valideringen avvisar ogiltiga sidintervall, omvända dateringsintervall, koordinater utanför Norden, dubblett-ID:n samt bilder som saknar rättighetsregistrering.

---

## 2. Entiteter och fältöversikt

- **`RunicInscription`**: Huvudentitet (`id`, `canonicalSignum`, `provinceCode`, `itemNumber`, `suffix`, `name`, `canonicalSlug`, `previousSlugs`, `aliases`, `curationStatus`).
- **`RunicCarrier`**: Fysisk bärare (`type`, `material`, `preservationStatus`, dimensioner och nuvarande förvaringsplats).
- **`RunicPlacement`**: Geografiskt läge (`type: 'fyndplats' | 'ursprunglig_plats' | 'nuvarande_placering'`, `province`, `parish`, `placeName`, `coordinatesWgs84: [lon, lat] | null`, `precision`).
- **`RunicDating`**: Kronologi (`originalSourceLabel`, `periodLabel`, `earliestYear`, `latestYear`, `isUncertain`, `datingMethod`).
- **`RunicTextLayer`**: Språklager (`readingTransliteration`, `normalizationRunicSwedish`, `normalizationOldWestNorse`, `translationSwedish`, `translationEnglish`, `carverAttribution`, `alternativeInterpretations`).
- **`RunicSourceReference`**: Källställe (`sriVolumeId`, `sriVolumeTitle`, `author`, `publicationYear`, `printedPageStart`, `printedPageEnd`, `pdfPageStart`, `pdfPageEnd`, `plateNumber`, `figureNumber`, `externalUris`).
- **`RunicImage`**: Bildresurs (`imageUrl`, `thumbnailUrl`, `caption`, `photographerOrArtist`, `license`, `isPubliclyDistributable`).

---

## 3. Slutsats och beslut för E06

Datamodell och valideringskontrakt är definierade i kod och dokumenterade.

Etapp E06 kvitteras härmed som **KLAR**.
