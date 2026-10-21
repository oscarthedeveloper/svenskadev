# E33 — Skapa korta källbundna guidningar

**Projekt**: Runsidan på fornsvenska.se (`/runor`)  
**Datum**: 2026-10-22  
**Etapp-ID**: E33  
**Ansvar**: Redaktör och designer  
**Beroenden**: E15, E26, E30, E32 (alla klara)  
**Referens**: [`RUNSIDA_PLAN.md`](./RUNSIDA_PLAN.md), [`ETAPPER.json`](./ETAPPER.json), Krav K11  
**Status**: **GODKÄND (Klar)**

---

## 1. Syfte och källkritiska principer

Etapp E33 ger besökaren tre sammanhängande historiska och språkliga berättelser som guidar genom runmaterialet utan att förlora källkritisk stringens:

1. **Varje historiskt påstående är källbelagt (Krav K11)**:
   - Guidningarna undviker spekulativa generaliseringar. Varje stopp i en tur är förankrat i en specifik volym och sida i *Sveriges runinskrifter* (SRI).
   - Inga fiktiva resvägar eller förbindelselinjer dras upp som om de vore dokumenterade färdvägar — rörelsen på kartan (`flyTo`) guidar ögat till den faktiska fyndplatsen eller nuvarande placeringen.
2. **Fri navigering utan inlåsning**:
   - Besökaren kan hoppa fritt mellan stopp, stega bakåt och framåt, eller avsluta guidningen när som helst (`✕ Avsluta guidning`).
   - Befintliga filter och URL-tillstånd respekteras fullt ut.
3. **Respekt för rörelsepreferenser**:
   - Guidningen fungerar lika bra utan kamerarörelse (`prefers-reduced-motion` ger direkt centrering utan animation).
   - Turen kan även avnjutas i tabell- eller kortvy.

---

## 2. De tre källbundna guidningarna

### Tur 1: Ingvarståget i runskriften
*Tema*: Vikingatåget österut till Särkland ca 1036–1041  
- **Stopp 1**: **Sö 179 Gripsholmsstenen** — Harald dog i Särkland (*Södermanlands runinskrifter*, s. 153–158).
- **Stopp 2**: **U 112A Eds kyrkstig** — Ragnvald i Grekland: Truppledare i Bysans (*Upplands runinskrifter*, s. 160–166).
- **Stopp 3**: **Vs 24 Hassmyrastenen** — Mälardalens samtida runkonst och Balle den röde (*Västmanlands runinskrifter*, s. 69–76).

### Tur 2: Vikingatida kvinnor, makt & minne
*Tema*: Godsägare, mödrar och skaldediktade husfruar  
- **Stopp 1**: **Vs 24 Hassmyrastenen** — Husfrun Odendisa: Fornyrðislag-dikt om gårdens förvaltare (*Västmanlands runinskrifter*, s. 69–76).
- **Stopp 2**: **Sö 179 Gripsholmsstenen** — Modern Tolas självständiga monumentala resning (*Södermanlands runinskrifter*, s. 153–158).
- **Stopp 3**: **U 73 Hansta** — Ingegärds tvillingstenar över sönerna och reglering av arvet (*Upplands runinskrifter*, s. 99–104).
- **Stopp 4**: **Sö 101 Ramsundsristningen** — Sigrids brobygge och Sigurdsristningen (*Södermanlands runinskrifter*, s. 70–76).

### Tur 3: Runmästare & Skaldemetrik
*Tema*: Från Rökstenens fornyrðislag till Balles elegans och Karlevis dróttkvætt  
- **Stopp 1**: **Ög 136 Rökstenen** — Varin och 800-talets litterära mästerverk (*Östergötlands runinskrifter*, s. 227–248).
- **Stopp 2**: **Öl 1 Karlevistenen** — Nordens äldsta bevarade dróttkvætt-strof ca år 1000 (*Ölands runinskrifter*, s. 15–24).
- **Stopp 3**: **Vs 24 Hassmyrastenen** — Balle den rödes signerade mästarsten (*Västmanlands runinskrifter*, s. 69–76).

---

## 3. Implementerade moduler och komponenter

- **Guidningsmodell och data**: [`lib/runor/guided-tours.ts`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/lib/runor/guided-tours.ts)
- **Guidningsväljare och interaktiv spelare**: [`components/runor/RunorGuidedToursBar.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorGuidedToursBar.tsx)
- **Integrering i runkatalogen**: [`components/runor/RunorDirectoryClient.tsx`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/components/runor/RunorDirectoryClient.tsx)

---

## 4. Automatiserad verifiering ([`tests/runor-tours.test.mjs`](file:///Users/oscarpagerup/Desktop/Git%20Repo/SvenskaDev/tests/runor-tours.test.mjs))

Testsviten kontrollerar:
1. Tre fullständiga turer finns med 3–4 sekventiellt numrerade stopp vardera.
2. Samtliga stopp mappar till verifierade och publicerade pilotinskrifter.
3. Källhänvisningar pekar på specifika volymer i *Sveriges runinskrifter*.
4. Oberoende navigering (Krav K11) utan påtvingade linjer eller inlåsningar.

Utfall: **113 av 113 tester godkända** i `npm test`. Typecheck och Next.js produktionsbygge (26 rutter) genomförs felfritt.
