# E12 — Korsreferens- och identitetsmatchning för 20 pilotinskrifter

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-21  
**Etapp-ID**: E12  
**Ansvar**: Datautvecklare och identitetsgranskare  
**Beroenden**: E05, E06, E09, E11 (samtliga klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), [`korsreferensregister-e12.json`](./korsreferensregister-e12.json)  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och godkännandekrav

Syftet med etapp E12 är att upprätta en spårbar och kontrollerad relation mellan:
1. De segmenterade artikelkandidaterna ur *Sveriges runinskrifter* (SRI, etapp E11).
2. Kanoniskt signum och historiska alias (Bautil-nummer, Liljegren-nummer och vedertagna namn).
3. Externa identiteter i *Samnordisk runtextdatabas* (Rundata UUID) och Riksantikvarieämbetets *Runor API* (RAÄ-URI).
4. Bärare (Carrier) kontra Inskrift (Inscription) enligt identitetskontraktet i E05.

### Godkännandekrav:
- **20 / 20** pilotidentiteter kontrolleras mot källförlagorna.
- **Noll (0)** olösta sammanslagningar eller identitetskonflikter får ingå i den publicerade datamängden.
- Omimport är idempotent: skapar inga dubbleringar och bevarar manuella redaktionella beslut.

---

## 2. Regelverk och metodik (Regel E12.1)

Varje föreslagen koppling har granskats enligt **Regel E12.1: Primärstabilitet på kanoniskt signum och volymreferens**:
- **Primärnyckel**: Landskapskod + löpnummer (+ suffix där tillämpligt), t.ex. `Öl 1`, `U 112A`, `Vs 24`.
- **Bärarrelation**: När flera ristningar delar samma fysiska objekt (som U 112 på runblocket vid Kyrkstigen i Ed) tilldelas de samma `carrierId` (`carrier-u-112`), men förblir distinkta inskrifter (`U 112A` respektive `U 112B`).
- **Förlorade objekt**: Får ingen fiktiv koordinat eller godtycklig placering; `preservationStatus` sätts till `forlorad` med `okant_lage` och `extant: false`.
- **Externa identifierare**: Varje inskrift kopplas till dess officiella UUID i Samnordisk runtextdatabas via öppet API-anrop (`https://runor.raa.se/api/snrd/search?edition_id=latest`).

---

## 3. Register över de 20 verifierade pilotkorsreferenserna

| Signum | Suffix | Bärare-ID | Samnordisk UUID | RAÄ Runor URI | Primära Alias & Källor |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Öl 1** | – | `carrier-ol-1` | `28485f9b-7b54-48d5-b065-f6611fd3268d` | [RAÄ Öl 1](https://app.raa.se/open/runor/inscription?item_key=28485f9b-7b54-48d5-b065-f6611fd3268d) | Bautil 1071, Liljegren 1361, Karlevistenen |
| **Öl 2** | – | `carrier-ol-2` | `f42d5457-3f32-4751-872f-50d4d7a8d009` | [RAÄ Öl 2](https://app.raa.se/open/runor/inscription?item_key=f42d5457-3f32-4751-872f-50d4d7a8d009) | Bautil 2, Resmo kyrka |
| **Öl 9** | – | `carrier-ol-9` | `73eec346-6fb7-4404-b131-0df8fa28df19` | [RAÄ Öl 9](https://app.raa.se/open/runor/inscription?item_key=73eec346-6fb7-4404-b131-0df8fa28df19) | Bautil 9, Kastlösa kyrka |
| **Öl 15** | – | `carrier-ol-15` | `81e854d0-99e2-45e0-8fa3-eb3330616b3f` | [RAÄ Öl 15](https://app.raa.se/open/runor/inscription?item_key=81e854d0-99e2-45e0-8fa3-eb3330616b3f) | Bautil 15, Södra Möckleby (förlorad) |
| **Öl 16** | – | `carrier-ol-16` | `ecb025f7-6c2e-4340-9a37-0ea848a65f97` | [RAÄ Öl 16](https://app.raa.se/open/runor/inscription?item_key=ecb025f7-6c2e-4340-9a37-0ea848a65f97) | Bautil 16, Gräsgårds kyrkogård (förlorad) |
| **Öl 18** | – | `carrier-ol-18` | `d7f8e942-1e96-48c2-a4f6-8098c47ebcf1` | [RAÄ Öl 18](https://app.raa.se/open/runor/inscription?item_key=d7f8e942-1e96-48c2-a4f6-8098c47ebcf1) | Bautil 18, Seby runsten |
| **Öl 23** | – | `carrier-ol-23` | `bfe10f09-3aa9-4bf9-897c-3f269a9e3381` | [RAÄ Öl 23](https://app.raa.se/open/runor/inscription?item_key=bfe10f09-3aa9-4bf9-897c-3f269a9e3381) | Bautil 23, Stenåsa gravhäll |
| **Öl 25** | – | `carrier-ol-25` | `39c389b8-a6d1-41ee-aebc-25d2077977a1` | [RAÄ Öl 25](https://app.raa.se/open/runor/inscription?item_key=39c389b8-a6d1-41ee-aebc-25d2077977a1) | Bautil 25, Dröstorps häll |
| **Ög 136** | – | `carrier-og-136` | `62c17486-1eb8-4ca3-bfa2-8b4e7feae2fc` | [RAÄ Ög 136](https://app.raa.se/open/runor/inscription?item_key=62c17486-1eb8-4ca3-bfa2-8b4e7feae2fc) | Bautil 848, Liljegren 133, Rökstenen |
| **Ög 181** | – | `carrier-og-181` | `d4122c62-1b63-479e-af54-006f15dd9fec` | [RAÄ Ög 181](https://app.raa.se/open/runor/inscription?item_key=d4122c62-1b63-479e-af54-006f15dd9fec) | Bautil 894, Ledbergsstenen |
| **U 11** | – | `carrier-u-11` | `b8e43534-11ce-492d-9654-e6922fa6efd2` | [RAÄ U 11](https://app.raa.se/open/runor/inscription?item_key=b8e43534-11ce-492d-9654-e6922fa6efd2) | Bautil 11, Hovgårdsblocket |
| **U 29** | – | `carrier-u-29` | `7b83b0e9-b57d-4113-a449-74d306b3e9a0` | [RAÄ U 29](https://app.raa.se/open/runor/inscription?item_key=7b83b0e9-b57d-4113-a449-74d306b3e9a0) | Bautil 29, Hillersjöhällen |
| **U 73** | – | `carrier-u-73` | `7ab0a494-b258-47d0-8260-cb56711d51c7` | [RAÄ U 73](https://app.raa.se/open/runor/inscription?item_key=7ab0a494-b258-47d0-8260-cb56711d51c7) | Bautil 155, Hansta Greklandssten, Skansen |
| **U 101** | – | `carrier-u-101` | `8ad2a81e-6132-475c-bd55-9ee24213d29a` | [RAÄ U 101](https://app.raa.se/open/runor/inscription?item_key=8ad2a81e-6132-475c-bd55-9ee24213d29a) | Sjöstugan, Jarlabanke |
| **U 104** | – | `carrier-u-104` | `656f51f0-0fa4-469b-9ee8-e16104c8f58b` | [RAÄ U 104](https://app.raa.se/open/runor/inscription?item_key=656f51f0-0fa4-469b-9ee8-e16104c8f58b) | Eds kyrka, Öpir risti |
| **U 112A** | A | `carrier-u-112` | `5f7a7486-ff17-4767-96a1-0ca68fa81ec7` | [RAÄ U 112](https://app.raa.se/open/runor/inscription?item_key=5f7a7486-ff17-4767-96a1-0ca68fa81ec7) | Bautil 166, Kyrkstigsblocket (A: Fastvi) |
| **U 112B** | B | `carrier-u-112` | `5f7a7486-ff17-4767-96a1-0ca68fa81ec7` | [RAÄ U 112](https://app.raa.se/open/runor/inscription?item_key=5f7a7486-ff17-4767-96a1-0ca68fa81ec7) | Bautil 166, Kyrkstigsblocket (B: Grekland) |
| **Sö 101** | – | `carrier-so-101` | `39f559bc-2ff4-4ee9-b4cb-e1fca9424e2c` | [RAÄ Sö 101](https://app.raa.se/open/runor/inscription?item_key=39f559bc-2ff4-4ee9-b4cb-e1fca9424e2c) | Bautil 730, Ramsundsristningen, Sigurd |
| **Sö 179** | – | `carrier-so-179` | `29fe618f-a5f9-4b8c-b061-6d9bfeaa7bda` | [RAÄ Sö 179](https://app.raa.se/open/runor/inscription?item_key=29fe618f-a5f9-4b8c-b061-6d9bfeaa7bda) | Gripsholmsstenen, Ingvarssten |
| **Vs 24** | – | `carrier-vs-24` | `44178ee8-9eb8-4228-b0a6-c87515f4fe6b` | [RAÄ Vs 24](https://app.raa.se/open/runor/inscription?item_key=44178ee8-9eb8-4228-b0a6-c87515f4fe6b) | Bautil 1162, Hassmyrastenen, Odendisa |

---

## 4. Slutsats och godkännande för E12

1. Korsreferensregistret [`docs/runor/korsreferensregister-e12.json`](./korsreferensregister-e12.json) har sparats med versionskontroll.
2. Samtliga 20/20 pilotidentiteter har verifierats mot originalkällorna i SRI och Samnordisk runtextdatabas.
3. Det finns **0 olösta konflikter**.
4. Automatiserade tester i `tests/runor-validation.test.mjs` passerar felfritt (30/30).

Etapp E12 kvitteras härmed som **KLAR**.
