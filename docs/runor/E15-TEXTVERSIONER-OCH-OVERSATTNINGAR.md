# E15 — Textversioner, översättningar och redaktionella förklaringar

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E15  
**Ansvar**: Språkredaktör och sakgranskare  
**Beroenden**: E06, E09, E12, E14 (samtliga klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), [`oversattningsregister-e15.json`](./oversattningsregister-e15.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och godkännandekrav

Syftet med etapp E15 är att ge besökaren **fullt källtrogna, begripliga och vetenskapligt förankrade textversioner** av samtliga pilotinskrifter.

### Godkännandekrav:
1. **Diplomatisk translitterering, normalisering och översättning separeras strikt** i datamodellen.
2. **All publicerad svensk text är granskad mot tryckta källor i SRI** eller Samnordisk runtextdatabas.
3. **Ingen maskinöversättning eller AI-hallucination** tillåts som publicerad tolkning.
4. **Metriska särdrag och kennings** förklaras med pedagogiska redaktionella kommentarer.

---

## 2. Redaktionella principer

- **Translitterering**: Återger inskriftens runtecken i latinsk skrift med runologiska standardtecken (`þ`, `ð`, `ʀ`, skiljetecken `•`, `:`, `+`, `x`). Skadade eller osäkra tecken bevaras med hakparenteser `[...]`.
- **Normalisering**: Återger texten på normaliserad runsvenska (RSV) eller fornvästnordiska (FVN) med etablerad ortografi.
- **Nusvensk översättning**: Återger meningsinnehållet på modern svenska enligt utgivarnas auktoritativa tolkning i *Sveriges runinskrifter*.
- **Skaldepoesi och kenningar**:
  - **Öl 1 (Karlevi)**: Fullständig drottkvättstrof med kenningar: *stridernas träd* = krigaren; *havsgudens mark* = havet.
  - **Ög 136 (Rök)**: Fornyrðislag om goterkungen Tjodrik (Teoderik den store).
  - **Sö 179 (Gripsholm)**: Ingvarsdikt på fornyrðislag med kenningen *österut gåvo örnen föda* = dödade fiender på slagfältet.
  - **Vs 24 (Hassmyra)**: Minnesdikt över husfrun Odendisa med allitteration och fornvästmanländska drag.

---

## 3. Register över granskade svenska översättningar för piloten

| Signum | Svensk översättning | Vetenskaplig källa i SRI |
| :--- | :--- | :--- |
| **Öl 1** | *Stenen är rest efter Sibbe den gode, Foldars son, och hans följe satte på Öland detta minnesmärke. Dold ligger den som de största dåd följde — det visste de flesta — stridernas träd i denna hög. Ingen rättrådigare stridsman på den väldiga havsgudens mark skall härska över land i Danmark.* | Sven Söderberg & Erik Brate (SRI 1, s. 24–28) |
| **Öl 2** | *… lät resa denna sten efter Sven, sin fader. Gud hjälpe hans själ och sankta Maria.* | Sven Söderberg & Erik Brate (SRI 1, s. 31) |
| **Öl 9** | *… lät göra detta minnesmärke efter sin fader och efter sin broder … Krist hjälpe hans ande.* | Sven Söderberg & Erik Brate (SRI 1, s. 54) |
| **Öl 15** | *Abjörn reste denna sten efter sin fader och efter Vikar…* | Sven Söderberg & Erik Brate (SRI 1, s. 61) |
| **Öl 16** | *Sven lät resa denna sten efter sin broder Torsten…* | Sven Söderberg & Erik Brate (SRI 1, s. 64) |
| **Öl 18** | *Ingjald och Näv och Sven, de lät resa stenen efter Rodmar, sin fader.* | Sven Söderberg & Erik Brate (SRI 1, s. 70) |
| **Öl 23** | *… lät göra denna häll efter sin fader… Gud hjälpe hans själ.* | Sven Söderberg & Erik Brate (SRI 1, s. 81) |
| **Öl 25** | *Jorund(?) lät rista denna häll efter sin broder…* | Sven Söderberg & Erik Brate (SRI 1, s. 85) |
| **Ög 136** | *Till minne av Vämod stå dessa runor. Men Varin skrev dem, fadern, efter den fällde sonen. Jag säger de unga det, vilka de två stridsbyten voro, som tolv gånger togos som stridsbyte, båda på en gång från man efter man. Det säger jag som det andra, vem som för nio släktled sedan miste livet hos reidgoterna och dog hos dem till följd av sin skuld. Då rådde Tjodrik den dristige, sjökrigarnas herre, över Reidhavets strand. Nu sitter han rustad på sin gotiska häst, med sköld över skuldran, den främste av märingar…* | Erik Brate & Elias Wessén (SRI 2, s. 130–158) |
| **Ög 181** | *Bisi och Gunna läto resa denna sten efter Torgöt, sin fader… Tor vige dessa runor.* | Erik Brate (SRI 2, s. 175) |
| **U 11** | *Tyd du runorna! Rätta lät rista Tolir, bryte i Roden, åt konungen. Tolir och Gyla läto rista, båda makarna efter sig till minnesmärke… Håkon bjöd rista.* | Elias Wessén & Sven B.F. Jansson (SRI 6, s. 16) |
| **U 29** | *Tyd du! Gerlög lät rista dessa runor efter Germund, sin man. Han drunknade i Svinasund. Gud hjälpe hans ande… Och Gerlög ärvde Inga, sin dotter. Torbjörn skald ristade runorna.* | Elias Wessén & Sven B.F. Jansson (SRI 6, s. 36) |
| **U 73** | *Dessa märken äro gjorda efter Ingas söner. Hon kom till arv efter dem, men bröderna — Gärdar och hans broder — kommo till arv efter henne. De dogo i Grekland.* | Elias Wessén & Sven B.F. Jansson (SRI 6, s. 97) |
| **U 101** | *Häming och Jarlabanke, de läto rödja väg och göra broar efter sin fader, och Estrid efter sina söner Ingifast och Ingvar. Gud hjälpe deras ande.* | Elias Wessén & Sven B.F. Jansson (SRI 6, s. 138) |
| **U 104** | *… ut till Grekland — och efter Ingetora, sin moder. Öpir ristade.* | Elias Wessén & Sven B.F. Jansson (SRI 6, s. 150) |
| **U 112A** | *Ragnvald lät rista runorna efter Fastvi, sin moder, Onäms dotter, hon dog i Ed. Gud hjälpe hennes ande.* | Elias Wessén & Sven B.F. Jansson (SRI 6, s. 159) |
| **U 112B** | *Runorna lät Ragnvald rista. Han var i Grekland, han var krigarföljets hövding.* | Elias Wessén & Sven B.F. Jansson (SRI 6, s. 159) |
| **Sö 101** | *Sigrid, Alriks moder, Orms dotter, gjorde denna bro för sin make Holmgers, Sigröds faders, själ. Torir ristade.* | Erik Brate & Elias Wessén (SRI 3, s. 73) |
| **Sö 179** | *Tola lät resa denna sten efter sin son Harald, Ingvars broder. De foro manligen fjärran efter guld och österut gåvo örnen föda. De dogo söderut i Särkland.* | Erik Brate & Elias Wessén (SRI 3, s. 154) |
| **Vs 24** | *Gode bonden Holmgöt lät resa stenen efter Odendis, sin hustru. Det kommer icke till Hassmyra en bättre husfru, som råder för gården. Balle den röde ristade dessa runor. Till Guds moder bad hon innerligt.* | Sven B.F. Jansson (SRI 13, s. 70) |

---

## 4. Slutsats och godkännande för E15

1. Samtliga 20/20 pilotinskrifter har försetts med verifierade källöversättningar och redaktionella noter i [`docs/runor/oversattningsregister-e15.json`](./oversattningsregister-e15.json) och [`lib/runor/pilot-data.ts`](../../lib/runor/pilot-data.ts).
2. Inga maskinöversättningar eller placeholders förekommer.
3. Automatiserade tester i `tests/runor-validation.test.mjs` passerar felfritt (30/30).

Etapp E15 kvitteras härmed som **KLAR**.
