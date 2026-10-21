# E03 — Källvillkor, rättighetsregister och beslut D01

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E03  
**Ansvar**: Källansvarig och juridiskt ansvarig  
**Beroenden**: E00, E02 (båda klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och bakgrund

För att säkerställa att inga immateriella rättigheter eller användningsvillkor överträds, fastställer detta dokument reglerna för hur text, bild, metadata och kartunderlag får användas och publiceras på fornsvenska.se.

Inga påståenden om "generell frihet för alla 129 PDF-filer" görs. Varje tillgångskategori har separata villkor som skiljer intern vetenskaplig bearbetning/analys från publik distribution.

---

## 2. Inventering av källkategorier och licensvillkor

### A. Sveriges runinskrifter (SRI, band 1–15, 1900–1981)
- **Utgivare**: Kungl. Vitterhets Historie och Antikvitets Akademien (KVHAA) / Riksantikvarieämbetet (RAÄ).
- **Textdelar**: Enskilda inskrifters translitterering, diplomatiska avskrifter och tolkningar citeras med stöd av upphovsrättslagen (1960:729) § 22 (vetenskaplig och upplysande citaträtt i överensstämmelse med god sed).
- **Fotografier och planscher**:
  - Fotografiska bilder (utan verkshöjd) framställda före 1 januari 1969 är fria (övergångsbestämmelserna till URL 1994).
  - Fotografiska verk skyddas i 70 år efter fotografens dödsår.
  - För moderna band (t.ex. band 11–15, 1962–1981) måste varje avsedd planschbild kontrolleras individuellt.
- **Strategi för publicering**: 
  1. I första hand används länkningar direkt till källans öppna PDF-sida hos RAÄ.
  2. När beskurna detaljbilder visas i applikationen används antingen verifierat fria äldre teckningar/foton (t.ex. Bautil, äldre planscher före 1969) eller öppet licensierade foton (CC BY / CC BY-SA) från RAÄ/K-samsök/KulturNav/Wikimedia Commons med fullständig fotografangivelse.

### B. Samnordisk runtextdatabas (Uppsala universitet)
- **Utgivare**: Institutionen för nordiska språk, Uppsala universitet.
- **Licensform**: 
  - Databasstruktur: Open Database License (ODbL 1.0).
  - Databasinnehåll: Database Contents License (DbCL 1.0).
- **Krav**:
  1. **Attribuering**: Tydlig källangivelse ("Källa: Samnordisk runtextdatabas, Uppsala universitet").
  2. **Share-Alike**: Om en bearbetad version av databasen i sin helhet tillgängliggörs för nedladdning, ska den distribueras under ODbL.
  3. **Meddelandeplikt**: Meddelande skickas till Uppsala runforum när en publik tillämpning lanserats.

### C. Riksantikvarieämbetets öppna data och Runor API
- **Utgivare**: Riksantikvarieämbetet (RAÄ).
- **Licens**: Öppna data och metadata under Creative Commons Zero (CC0 1.0) eller CC BY.
- **Krav**: Attribuering med länk till objektets permanenta URI på `app.raa.se/open/runor/`.

### D. Kartdata och kartplattor
- **Geodata**: OpenStreetMap (OSM).
- **Licens**: Open Database License (ODbL).
- **Krav för visning**: Synlig källhänvisning i kartans nedre hörn: `© OpenStreetMap-bidragsgivare`.

---

## 3. Beslutsprotokoll D01

```text
Beslut-ID: D01
Fråga: Vilken text- och bildåteranvändning stöder de dokumenterade villkoren?
Datum: 2026-10-21
Beslut:
1. Textdelar (translitterering, normalisering, språkanteckningar) publiceras som vetenskapliga citat med exakt angivelse av källställe (SRI-band, författare, tryckt sida, PDF-sida).
2. Samnordisk runtextdatabas används som kompletterande primärkälla för standardiserade signum, runristare, dateringskoder och koordinater under ODbL/DbCL med synlig attribution.
3. Rå-PDF-filer (4,14 GiB) distribueras INTE som en massnedladdning på sajten, utan förblir ett internt referensarkiv. I stället tillhandahålls stabila källänkar direkt till RAÄ:s digitala volymer.
4. Bilder i applikationen publiceras endast per objekt efter individuell rättighetsverifiering i ett centralt bildregister (docs/runor/bildregister.json). Saknas fri publiceringsrätt visas inskriften med källänk till förlagans planschsida i stället för inbäddad bild.
Skäl: Skyddar projektet och användaren mot upphovsrättsliga risker, bevarar vetenskaplig transparens och minimerar hosting- och bandbreddskostnader.
Omprövning utlöses om: RAÄ eller Uppsala universitet ändrar sina licensvillkor, eller om ett specifikt avtal om utökad bildlicens ingås.
```

---

## 4. Mall för synlig källangivelse och attribution

I inskriftens läspanel och i sidfoten ska följande standardiserade block visas:

### För inskriftsdata och tolkning:
```text
Källutgåva: Sveriges runinskrifter, band [X] ([År]), s. [Y] (PDF-sida [Z]).
Författare: [Sven B.F. Jansson / Erik Brate / Elias Wessén m.fl.]
Signum & basdata: Samnordisk runtextdatabas (Uppsala universitet) / RAÄ Runor ([URI])
```

### För kartunderlag:
```text
Karta: © OpenStreetMap-bidragsgivare · Kartstil: MapLibre / Carto (CC BY 4.0)
```

### För visade plansch- och föremålsbilder:
```text
Bild: [Teckning ur SRI band X, plansch Y / Foto: Fotografens namn, År, Licens: Public Domain / CC BY 4.0].
Källa: [K-samsök / RAÄ / Förlagans plansch].
```

---

## 5. Slutsats och beslut för E03

Källvillkoren är fullständigt inventerade, Beslut D01 är fattat och attributionsmallen är låst.

Etapp E03 kvitteras härmed som **KLAR**.
