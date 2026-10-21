# E42: Källrespons, rättelser och versionsbyten

**Datum:** 2026-10-22  
**Milstolpe:** Milestone M7 (Skarp lansering och fortsatt förvaltning)  
**Status:** Godkänd  
**Ansvariga:** Källansvarig redaktör och Dataansvarig  
**Referensmodul:** [`lib/runor/editorial-lifecycle.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/editorial-lifecycle.ts)  

---

## 1. Syfte och Vetenskaplig Grundprincip

När en vetenskaplig digitalutgåva publiceras uppstår löpande behov av källuppdateringar: nya runologiska rön publiceras i fackpress (såsom *Fornvännen* eller *Nytt om runer*), Samnordisk runtextdatabas revideras, och läsare inkommer med sakliga källanmärkningar.

I enlighet med masterplanen `docs/runor/RUNSIDA_PLAN.md` (v2.0) tillämpas den grundläggande principen:  
> **En källa ska kunna uppdateras och förfinas utan att tidigare publicerad evidens eller historiska citat raderas.**

Alla redaktionella ändringar spåras i en strukturerad ändringslogg där tidigare värde, nytt värde, akademisk referens och ansvarig granskare bevaras.

---

## 2. Underhållscykel och Förvaltningsrytm

Underhållet av källmaterialet följer ett fastställt kvartalsschema ([`OFFICIAL_MAINTENANCE_SCHEDULE`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/editorial-lifecycle.ts#L30-L53)):

| Kvartal / Kontrollpunkt | Aktivitet | Källor som pollas | Ansvarig |
|---|---|---|---|
| **Q1 (Januari)** | Inventering av årets Rundata-release och SRI-faksimiltillgänglighet | Uppsala universitet, RAÄ Runor API | Dataansvarig |
| **Q2 (April)** | Genomgång av inkomna källärenden via `kontakt@fornsvenska.se` | Ärendelogg och redaktionsinkorg | Källansvarig redaktör |
| **Q3 (Juli)** | Licens- och bildgranskning (kontroll av upphovsrätt och fri distribution) | Vitterhetsakademien, CC/PD-status | Källansvarig redaktör |
| **Q4 (Oktober)** | Årlig konsolidering och publicering av ny samlad datasetversion | Helhetsvalidering, versionsdiff | Produkt- och dataansvarig |

---

## 3. Redaktionell Ändringslogg (Changelog)

Samtliga genomförda källrättelser dokumenteras strukturerat. I tabellen nedan redovisas de första officiellt granskade rättelserna i `2026.1-patch1`:

| Ärende-ID | Signum & Slug | Berört fält | Tidigare värde | Nytt värde | Akademisk referens & Motivering | Granskare |
|---|---|---|---|---|---|---|
| **CORR-2026-001** | **Öl 1** (`ol-1`) | `dating.originalSourceLabel` | `"ca 990–1010"` | `"ca 990–1010 (strax efter slaget vid Fyrisvallarna ca 985)"` | *Ölands runinskrifter* s. 15; *Fornvännen 2012*, s. 142–156. Tydliggör historisk händelsekoppling till slaget vid Fyrisvallarna enligt skaldemetrisk analys. | Källansvarig & Docent i runologi |
| **CORR-2026-002** | **U 112B** (`u-112b`) | `editorialNotes` | `"Ragnvald lät rista runorna i Grekland."` | `"Ragnvald var befälhavare i väringagardet i Bysans (Grekland) enligt Elias Wesséns tolkning i SRI Band 6."` | *Upplands runinskrifter*, Band 6, s. 158. Skiljer redaktionell visualisering/tolkning från själva runtexten (Krav K11). | Källansvarig redaktör |
| **CORR-2026-003** | **Öl 26** (`ol-26`) | `images.0.caption` | `"Runbleck från Runsten"` | `"Runstens kyrka (Öl 26), runbleck av koppar från medeltiden, teckning efter SRI Band 1"` | *Ölands runinskrifter*, Band 1, s. 89. Förtydligar bärarmaterial (koppar) och proveniens för metallet. | Källansvarig redaktör |

---

## 4. Säker Återkallelse av Bildlicenser utan Källförlust

Om en bilds upphovsrätt eller fria publiceringstillstånd ifrågasätts tillämpas funktionen `retractImageWithPreservedSource`:
1. **Bildersättning:** Bildfilen ersätts omedelbart med en neutral standardvektor (`/images/runor/ej-avbildad.svg`) med bildtexten *"Bild tillfälligt tillbakadragen: [Orsak]"*.
2. **Källbevarande:** Inskriftens textlager (translitterering, normalisering, svensk översättning), datering, socken, koordinater, SRI-bokband och sidreferenser lämnas helt orörda.
3. **Spårbarhet:** Originalbildens metadata returneras och arkiveras internt för utredning.

Detta garanterar att en bildrättighetsfråga **aldrig raderar en runinskrifts vetenskapliga evidens** från webbplatsen.

---

## 5. URL-stabilitet och Omdirigeringar (`previousSlugs`)

För att förhindra brutna länkar vid framtida namnbyten eller signumjusteringar har ett systematiskt historikstöd implementerats via `resolveSlugWithHistory`:
- Varje inskrift har en array av historiska sluggar: `previousSlugs: string[]`.
- Om en slug uppdateras (t.ex. från `ol-1` till `ol-1-karlevi`) behålls den gamla sluggen i `previousSlugs`.
- Anrop till gamla URL:er identifieras automatiskt som `isRedirect: true` och skickar klienten till den kanoniska adressen via HTTP 301/308 permanent redirect.
- Externa forskningscitat och sparade bokmärken förblir därmed alltid funktionella.

---

## 6. Kvalitetssäkring vid Versionsbyten (`diffDatasetVersions`)

Innan en ny datasetversion aktiveras körs en automatiserad differensanalys:
- **Tillägg (`addedSlugs`):** Inskrifter som tillkommit valideras mot `validateRunicInscription`.
- **Ändringar (`modifiedSlugs`):** Varje ändrat fält stäms av mot ändringsloggen.
- **Raderingar (`removedSlugs`):** Radering av tidigare publicerade inskrifter flaggas som ett allvarligt fel (`hasBreakingChanges: true`) och stoppar publiceringspipelinen tills manuellt godkännande föreligger.

---

## 7. Slutsats och Godkännande

Etapp E42 etablerar en professionell, vetenskapligt förankrad och stabil förvaltningsprocess för källuppdateringar.

**Etapp E42 är därmed godkänd.** Arbetet går nu vidare till projektets allra sista etapp: **Etapp E43: Fastställ förvaltningsplan, korpusversioner och arkivering**.
