# Etapp 7 · Beslutsdokumentation: Arkivljud, textåtergivning och fulltextomfattning

**Datum**: 2026-10-19  
**Status**: Slutförd (Beslut och teknisk implementering enligt A07.1–A07.4)  
**Kopplade dokument**: [PLAN.md](PLAN.md), [ETAPP-0-BESLUTSLOGG.md](ETAPP-0-BESLUTSLOGG.md), [ARBETSLISTA.md](ARBETSLISTA.md)

---

## 1. Verifiering av arkivfiler, tillstånd och tidskoder (A07.1)

### Källunderlagets begränsningar
I Adam Horn af Åminnes tryckta avhandling (*Från person till person*, 2022) redovisas informanterna med anonymiserade koder (`JA`, `AJ 1`, `SJ 1` osv.), födelseår, inspelningsår och hemsocken (s. 178, 213).
* **Isofs bandsignum/accessionsnummer**: Trycktes **inte** ut i avhandlingens tabeller eller text för att skydda informanternas integritet enligt forskningsetiska principer och arkivpraxis.
* **Inga bifogade ljudfiler i DiVA**: Avhandlingen publicerades i DiVA (`urn:nbn:se:uu:diva-466066`) som en enskild PDF-fil (18,3 MB). Inga separata WAV-, MP3- eller FLAC-filer medföljer i det officiella DiVA-underlaget.

### Källkritiskt ställningstagande
> **Krav:** Inga syntetiska imitationer (t.ex. text-till-tal eller generativa AI-röster) får presenteras som autentiska historiska dialektinspelningar från 1940–1980-talen.

1. **Bevarande av textuell precision**: Samtliga autentiska språkprov ur avhandlingen (t.ex. exempel 36–86 på s. 183–231) återges med författarens diplomatiska transkription, grammatisk analys och översättning till nusvenska.
2. **Arkivkoppling**: För varje citat anges exakt exempelsiffra och sidhänvisning i avhandlingen samt insamlingsuppgifter (Sixten Bengtsson för Mark & Kind; Isof/DAL för Östra Göinge).
3. **Plats för framtida arkivljud**: Spelarkomponenten är konstruerad så att om användaren eller förvaltaren senare erhåller digitala utdrag ur Isofs ljudsamlingar kan dessa kopplas in direkt via URL och tidsintervall.

---

## 2. Tillgänglig spelare och textalternativ (A07.2 & A07.3)

* **Ingen automatisk uppspelning**: Alla medieinslag kräver aktiv användarinteraktion.
* **Fullständigt textalternativ**: Varje språkprov har transkriberad dialektlydelse, ord-för-ord-översättning, person- och numerusbestämning och sidhänvisning synlig i klartext.
* **Tangentbords- och skärmläsarstöd**: Semantisk HTML med `blockquote`, `cite`, `strong` och ARIA-etiketter.

---

## 3. Omfattningsbeslut rörande fullständig HTML-utgåva (A07.4)

### Beslut: Avgränsning mot full 288-sidig monografitext
Webbplatsen publicerar **inte** hela avhandlingens 288 tryckta boksidor som en kontinuerlig löpande HTML-bok.

**Skäl för beslutet**:
1. **Upphovsrätt**: Avhandlingens löptext är skyddad av upphovsrätt (`© Adam Horn af Åminne 2022`). Att reproducera hela monografin utan ett formellt förlags- och författaravtal är inte tillåtet.
2. **Webbformatets syfte**: Syftet med Svenska.devs interaktiva utgåva är att tillgängliggöra forskningens empiriska kärna – kartor, böjningssystem, förändringsmodeller och informantdata – som i tryckt form är svåröverskådlig och statisk.
3. **Korrekt källhänvisning**: Fulltexten är fritt tillgänglig i original som open access via Uppsala universitets DiVA-portal. Webbplatsen länkar direkt till denna permanenta URN (`https://urn.kb.se/resolve?urn=urn:nbn:se:uu:diva-466066`).

---

## Sammanfattning av status

| Uppgift | Status | Resultat |
| :--- | :--- | :--- |
| **A07.1** | Utförd | Arkivläge klarlagt; autentiska citat med sidhänvisningar bevarade. |
| **A07.2** | Utförd | Tillgängliga språkprovskort med textalternativ i `CaseStudiesSection.tsx`. |
| **A07.3** | Utförd | Diplomatisk transkription och översättning granskad mot s. 183–231. |
| **A07.4** | Utförd | Omfattningsbeslut fattat: interaktiv utställning + källänk till DiVA-URN. |
