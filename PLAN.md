# Byggplan för svenska.dev

## Idé och form

Ett lättillgängligt språkarkiv för svenskspråkiga som vill skriva tydligare och förstå mer. Börja i en konkret fråga, ge ett kort svar, förklara sedan mönstret med exempel och relevanta undantag. Beskriv skillnaden mellan standardskrift, vardagligt bruk och medvetna stilval.

Återanvänd Italos redaktionella formspråk, färger, typsnitt, linjer, register, sidokolumn och blockredigerare. Anpassa startsidans rubrik, språkexempel och genvägar till svenska. Svenska.dev får eget namn, metadata, svenska adresser och separata Supabase-tabeller.

## Innehållsstruktur och förslag

| Ingång | Första innehåll | Nästa artiklar |
| --- | --- | --- |
| Språkråd | De, dem eller dom? | Var/vart, sin/hans/hennes, enda/ända, större än jag/mig, skiljetecken, särskrivning |
| Grammatik | Konjunktiv: vore och finge | Huvudsats/bisats, BIFF-regeln och dess gränser, bestämdhet, verbens tempus, satsdelar |
| Ordval | Alternativ till anglicismer | Nära synonymer, falska vänner, idiom, myndighetsspråk till klarspråk |
| Språkliv | Redaktionell introduktion | Dialekter, finlandssvenska, etymologi, äldre svenska, språkförändring och stil |

Särskilt värdefulla framtida inslag:

- **Före och efter:** en tung mening blir tydlig, med förklaring till varje ändring.
- **Ordval efter sammanhang:** filtrera alternativ efter betydelse, ton och användningsområde.
- **Språkmyter med källor:** nyansera exempelvis föreställningen att en mening aldrig får börja med ”och”.
- **Korta övningar:** 3–5 frågor med återkoppling som förklarar svaret.
- **Läs ett språkprov:** korta äldre texter med kommentarer om former som lever kvar.

Detta är förslag för senare etapper, inte funktioner som redan är byggda.

## Etapp 1 — mall, genomförd

- Separat projektmapp SvenskaDev med Next/React och återanvända Italo-komponenter.
- Svensk startsida med fyra ingångar, språkexempel och ordvalssektion.
- Gemensam arkiv- och artikelrutt, fyra exempelartiklar och mappar att fylla.
- Återanvänd inloggning och blockredigerare; separat Supabase-schema med RLS.
- Lokal reserv gör att mallen går att granska utan konto eller nycklar.

## Etapp 2 — redaktionen byggd och Supabase anslutet

1. **Genomfört:** samma projekt som Fornsvenska.se (`woezrcirqbickpqoduck`), installation utförd och befintligt administratörskonto tilldelat.
2. **Genomfört:** båda migrationerna är körda i en transaktion och 10 noder med 4 exempelartiklar är importerade.
3. **Delvis verifierat:** besökarnas API-läsning och spärr för utkast, samt befintlig administratörs databasbehörighet. **Verifierat via webbappen:** inloggning, artikeländring, sparning i privat utkast, förhandsgranskning och publicering, samt startsidans sparning. Skrivbehörigheter och publicering täcks även av lokala PostgreSQL-tester. Återstår att prova samtliga blocktyper och arkivoperationer via UI.
4. Provredigera alla blocktyper och kontrollera kvarvarande innehåll efter omladdning.
5. **Byggt:** privat utkast i separat tabell, förhandsgranskning, publicering/avpublicering, publiceringsstatus och versionskonflikter. Testat med lokal PostgreSQL inklusive RLS.
6. **Byggt:** redigering av källor och separat installationsstatus. **Byggt och verifierat i webbappen:** startsidans överrubrik, huvudrubrik, introduktion och urval av 1–4 publicerade artiklar.
7. **Byggt:** serialiserad autosparning, sparning före interna länkbyten, stängningsvarning, versionskontroll mellan flikar och atomär omordning. Bakåtknappen bör användas först när Sparat visas.

Klart när redaktören kan skapa en hel artikel utan kod och rätt behörigheter har verifierats mot en ansluten databas.

## Etapp 3 — redaktionell första utgåva

Skriv cirka 12–20 prioriterade artiklar. Ge varje artikel ett kort svar, förklaring, egna exempel, undantag, källor och granskningsdatum. Börja med de/dem, var/vart, sin/hans/hennes, konjunktiv och 15–20 anglicismer. Låt betydelse och sammanhang styra ordvalslistan. Granska sakuppgifter och exempel före publicering.

Primärkällor att utgå från:

- [Språkrådets Frågelåda](https://frageladan.isof.se/)
- [Svenska Akademiens ordböcker](https://svenska.se/)
- [Språkrådet: de och dem](https://frageladan.isof.se/faqs/25461)
- [Språkrådet: konjunktiv](https://frageladan.isof.se/faqs/24717)

## Etapp 4 — hitta och öva

Inför sökning när mängden artiklar motiverar det. Sök i titel, sammanfattning och taggar; använd samma datakälla som arkivet. Komplettera med relaterade artiklar och små övningar. Gör ordvalslistan sökbar efter både det engelska uttrycket och den svenska betydelsen.

## Etapp 5 — lansera på svenska.dev

Välj Next-kompatibel drift med serverstöd, exempelvis Vercel eller Netlify, och kontrollera deras aktuella anvisningar vid införandet. Statisk export räcker inte för den nuvarande serverbaserade administrationen.

- Sätt miljövariabler, `NEXT_PUBLIC_SITE_URL=https://svenska.dev` och Supabases tillåtna adresser.
- Lägg till domänen hos värden, konfigurera DNS och verifiera HTTPS. `.dev` behöver HTTPS.
- Lägg till favicon, delningsbild, sitemap och robots. Blockera indexering av `/admin`.
- Granska mobil, tangentbord, fokusordning, textstorlek, kontrast och långa tabeller.
- Kontrollera 404-sidor, metadata, databastillgång, inloggning, backup och återställning.

Klart när domänen fungerar med HTTPS, innehållet är granskat och besökare respektive administratörer har provats i produktion.

## Avgränsningar

Den här leveransen är lokal. Supabase är installerat i det valda projektet. Hosting och DNS återstår och kräver domänåtkomst. Startsidan har nu ett formulär för huvudtext och artikelurval; de övriga sektionerna är fortfarande kodstyrda. De tomma mapparna är uttryckligen märkta som kommande. Ingen automatisk artikelgenerering eller extern statistik behövs för första lanseringen.
