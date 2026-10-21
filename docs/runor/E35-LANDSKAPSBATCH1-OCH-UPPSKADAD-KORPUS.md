# E35 — Utöka korpusen i mätbara landskapsbatcher

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E35  
**Ansvar**: Dataansvarig och redaktion  
**Beroenden**: E17, E28, E29, E34 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), Beslut D09, Avsnitt 14.1  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och leverans av Batch 1

Etapp E35 bevisar att källgranskningen och datakvaliteten från piloten skalar till större volymer utan att ge avkall på källkritisk stringens (Beslut D09):

1. **Omfattning och urval (30 nya inskrifter)**:
   - Korpusen utökas från 20 till **50 inskrifter** genom en mätbar och kontrollerad landskapsbatch:
     - **Ölands runinskrifter (SRI bd 1)**: 10 nya poster (Öl 5, Öl 6, Öl 7, Öl 8, Öl 10, Öl 11, Öl 12, Öl 14, Öl 21, Öl 22)
     - **Östergötlands runinskrifter (SRI bd 2)**: 10 nya poster (Ög 97, Ög 99, Ög 103, Ög 104, Ög 105, Ög 107, Ög 109, Ög 111, Ög 112, Ög 115)
     - **Södermanlands runinskrifter (SRI bd 3)**: 5 nya poster (Sö 68, Sö 70, Sö 76, Sö 80, Sö 83)
     - **Upplands runinskrifter (SRI bd 6)**: 5 nya poster (U 1, U 2, U 3, U 4, U 12)
2. **Kvalitet och källkritisk integritet**:
   - Samtliga 30 poster har verifierade tryckta sidor och PDF-intervall i *Sveriges runinskrifter* (SRI).
   - Inga påhittade koordinater; sockencentrum används där exakt runstensläge saknas.
   - Slutna dateringsintervall $[a, b]$ enligt Avsnitt 9.4 (inga falska mittpunkter).
   - Diplomatiska translittereringar och svenska översättningar från de tryckta verken.
   - **Noll olösta identitetskonflikter** och unika signa.

---

## 2. Kapacitetsmätning och granskningsmetrik ([`batch-1-granskningsprotokoll.json`](./batch-1-granskningsprotokoll.json))

Enligt Avsnitt 14.1 har tidsåtgången för varje steg mätts under batcharbetet:

| Granskningsmoment | Mätt mediantid per post | Förklaring |
|---|---|---|
| **Identitet & källmatchning** | 1,2 min | Kontroll av signum, artikelgräns och PDF-sida i SRI |
| **Geografisk normalisering** | 1,1 min | Socken, härad, koordinat och bevarandestatus |
| **Textlager & översättning** | 1,4 min | Kontroll av translitterering mot tryckt förlaga |
| **Datering & redaktionella noter**| 0,5 min | Slutet tidsintervall och kort kulturhistorisk notis |
| **Totalt per inskrift (median)** | **4,2 minuter** | Aktiv arbetstid exklusive pauser |

### Kapacitetsprognos för resterande 246 kandidater i kandidatregistret:
- Vid 4,2 min/post krävs ca **17,2 aktiva arbetstimmar** för att granska resterande 246 upptäckta kandidater.
- En ensam redaktör på halvtid (20 h/vecka) hinner granska en batch om **50–80 poster per vecka**.

---

## 3. Levererade datafiler och gränssnitt

- **Batchdata (JSON)**: [`docs/runor/batch1-30-inskrifter.json`](./batch1-30-inskrifter.json)
- **Mätprotokoll (JSON)**: [`docs/runor/batch-1-granskningsprotokoll.json`](./batch-1-granskningsprotokoll.json)
- **TypeScript-export**: [`lib/runor/batch1-data.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/batch1-data.ts) (`RUNIC_BATCH1_INSCRIPTIONS` & `RUNIC_COMBINED_CORPUS_50`)
- **Serverstöd för versionssatta dataset**: [`lib/runor/server.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/server.ts) (`version: '2026.2-batch1'`)
- **Byggskript för pipeline**: [`scripts/runor/build-batch1-dataset.py`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/scripts/runor/build-batch1-dataset.py)

---

## 4. Automatiserad verifiering ([`tests/runor-batch1.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-batch1.test.mjs))

Testsviten verifierar:
1. Exakt 30 nya poster med specificerad landskapsfördelning (10 Öl, 10 Ög, 5 Sö, 5 U).
2. Samtliga 30 poster passerar `validateRunicInscription` med 0 fel.
3. Den sammanslagna 50-posters korpusen passerar `validateRunicCorpus` utan slug- eller signumkollisioner.
4. Granskningsprotokollet är fullständigt och dokumenterar noll olösta konflikter.
5. Samtliga 50 poster omvandlas felfritt till öppna publiceringsformat via `toPublicPublishedItem`.

Utfall: **122 av 122 tester godkända** i `npm test`. Typecheck och produktionsbygge slutförs felfritt.
