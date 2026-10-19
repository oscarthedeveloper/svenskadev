# Svenska.dev

En lokal startmall baserad på Italo. Bevarar dess pappersbakgrund, korall/blå/gröna färger, Cormorant Garamond, IBM Plex Mono, arkiv, artikelsidor och blockredigerare. Startsidan utgår från språkfrågor i stället för italiensk språkhistoria.

## Kör lokalt

Kräver Node 22.13 eller senare.

```sh
npm install
npm run dev
```

Öppna adressen som Next skriver ut, normalt http://localhost:3000.

```sh
npm run typecheck
npm run build
npm start
```

Utan Supabase visas lokalt grundinnehåll. `/admin` visar konfigurationshjälp. Google Fonts hämtas under bygget och serveras därefter lokalt av Next.

## Anslut Supabase

1. Svenska.dev är konfigurerat för samma projekt som Fornsvenska.se: `https://woezrcirqbickpqoduck.supabase.co`. Denna mall använder egna tabeller: `svenska_nodes`, `svenska_admins`, `svenska_drafts` och `svenska_settings`.
2. **Installationen i det valda projektet är redan genomförd den 17 oktober 2026. Kör inte installationsfilen igen där.** Följande gäller om projektet ska installeras från början på annan plats. Vid en ny installation: kör **`supabase/install-svenska.sql`** en gång i projektets SQL Editor. Filen samlar de tre migrationerna i en transaktion. Om du hellre kör dem separat är ordningen:
   - `supabase/migrations/20261017_svenska_dev.sql`
   - `supabase/migrations/20261017_editorial_workflow.sql`
   - `supabase/migrations/20261017_homepage.sql`

   De skapar arkivet, privata utkast, versionskontroll, publiceringsfunktioner och RLS. Italos tabeller ändras inte. Om de två första migrationerna redan är körda behöver du endast köra startsidans migration. Alla tre är redan körda i det valda projektet. Befintligt innehåll bevaras som publicerat vid uppgraderingen.
3. Det befintliga administratörskontot från Fornsvenska.se har fått åtkomst till svenska.dev enligt ditt val. Samma användare och lösenord kan användas. För ytterligare administratörer: välj ett konto i Authentication → Users, bekräfta e-postadressen och lägg till kontots UUID med SQL Editor:

```sql
insert into public.svenska_admins (user_id) values ('ANVÄNDARENS-UUID');
```

4. `.env.local` är nu skapad med det valda projektets URL och den publika anon-nyckeln från Italo. Filen ignoreras av Git. Inga privata nycklar har kopierats. Vid installation på en annan dator: utgå från `.env.local.example` och fyll i projektets publika anon-nyckel. Service role-nyckel behövs inte i webbappen.
5. Starta om utvecklingsservern, gå till `/admin` och logga in med hela e-postadressen och lösenordet. För korta användarnamn används `fornsvenska.local`, precis som i Italos projektkonfiguration. Använd hela e-postadressen om ditt konto använder en annan domän.
6. Grundinnehållet är redan importerat: 10 arkivnoder, varav 4 publicerade exempelartiklar. **Synkronisera grundinnehåll** kan användas för att lägga till eventuella saknade mallnoder. Befintliga texter, namn, ordning och beskrivningar bevaras; tomma dokument fylls. Öppna sedan ett arkiv och välj **Redigera sidan** i adminlisten.

Du kan skapa mappar och dokument, ändra ordning och bygga artiklar av text, två spalter, tabeller, exempel, citat och notiser. Källor läggs till, ändras och tas bort i redigeringsläget. Använd fullständiga http- eller https-länkar.

## Utkast och publicering

- `/admin` visar artiklar och utkast. Öppna en artikel och välj **Redigera sidan** i adminlisten.
- Textändringar autosparas som **privata utkast**. **Spara utkast** sparar direkt och kan användas igen efter ett anslutningsfel.
- **Förhandsgranska** visar utkastet utan redigeringsfält. Endast administratörer kan läsa det.
- **Publicera** gör en ny artikel tillgänglig. **Publicera ändringar** ersätter den tidigare publika versionen. Titel och ingress krävs.
- **Avpublicera** tar bort artikeln ur besökarnas arkiv och behåller texten i redaktionen.
- När flera flikar redigerar samma artikel avvisas en gammal version. Kopiera vid behov din osparade text innan du laddar om; slå sedan ihop ändringarna manuellt.

Utkast ligger i `svenska_drafts`, som skyddas av RLS även för direkt API-läsning. `svenska_nodes.content` innehåller bara den publicerade versionen. Publicering och avpublicering använder versionskontroll i en transaktion. Arkivrubriker för artiklar ändras också i utkastet; mapparnas namn och ordning ändras direkt.

Synkroniseringen från `/admin` publicerar mallens exempelartiklar när de först läggs till. Den bevarar befintliga utkast, även efter avpublicering. När importen slutförts är databasen huvudkälla: att tömma en sektion eller avpublicera en artikel hämtar inte tillbaka lokalt mallinnehåll. Anslutningsfel visar ett fel i stället för att ersätta redaktionens innehåll med malltext.

Kontrollera alltid att adminlisten visar **Sparat** innan du stänger eller går tillbaka med webbläsarens bakåtknapp. Vanliga interna länkar väntar på pågående sparning; ett fönster med osparad text varnar vid stängning. Källformulärets nya/ändrade källa måste först bekräftas med **Lägg till källa** eller **Spara källa**.

## Redigera startsidan

På `/admin` finns avsnittet **Startsidan**. Där ändrar du överrubrik, huvudrubrikens två rader, introduktion och ordningen på 1–4 utvalda artiklar. **Spara startsidan** uppdaterar den publika startsidan direkt. Detta formulär har separat versionskontroll: en äldre flik får ett konfliktmeddelande i stället för att skriva över en nyare version.

Urvalet använder artikel-ID:n och bygger länkar från det publicerade arkivet. Artiklar som avpubliceras eller tas bort döljs automatiskt från urvalet. Spara med minst en publicerad artikel; samma artikel kan inte väljas flera gånger. Startsidan hämtar publicerade rubriker, även när redaktören har opublicerade rubrikändringar i ett utkast.

De övriga startsidessektionernas texter och språkexempel ligger fortfarande i kod. Formuläret sparas uttryckligen med knappen, till skillnad från artiklarnas autosparning. Kontrollera sparmeddelandet innan du byter sida.

## Omfattning

Fyra sektioner, fyra korta exempelartiklar och tomma mappar för kommande innehåll. Det är en mall, inte en färdig heltäckande referensgrammatik. Språkrådet är länkat i relevanta artiklar; ordvalslistan är egna redaktionella förslag. Italo har lästs som referensmaterial och inte ändrats.

Se [PLAN.md](PLAN.md) för innehållsförslag, etapper och lanseringskrav. Databasinstallationen och importen är genomförda i det valda projektet. Första innehållet är publicerat i databasen. Webbplatsen har inte driftsatts på svenska.dev och inga DNS-ändringar har gjorts.

## Verifiering, 17 oktober 2026

- `npm test` kör migrations- och RLS-tester i lokal PostgreSQL (PGlite), samt validering av källänkar. De täcker besökare, vanliga användare, administratörer, privata utkast, publicering, avpublicering, versionskonflikter, omordning och uppgradering från den första mallen.
- Tio testfall, TypeScript-kontrollen och produktionsbygget med den valda projektkonfigurationen godkända. HTTP-kontroll av startsida, admin, arkiv och exempelartiklar gav 200; okänd sektion gav 404. Adminsidan skickar noindex och besökarnas artiklar saknar administrationsverktyg.
- PGlite-tester kompletteras nu med kontroller i det riktiga projektet: publik läsning av 10 noder och installerad status, nekad publik åtkomst till utkast och administratörer samt behörighetskontroll med den befintliga administratörens databasroll. Inloggning med befintligt konto, artikelredigering, privat sparning, förhandsgranskning och publicering har nu verifierats i webbappen.
- Startsida och artikelmall har granskats i webbläsare vid cirka 670 px bredd. Fullständig kontroll på fler skärmstorlekar återstår före lansering.

Förhandsbild: `preview.png`. Starta med `npm run dev` för fortsatt arbete.

## Installerat Supabase-projekt

Installation och grundimport utfördes den 17 oktober 2026 i `woezrcirqbickpqoduck`. Före och efter installationen hade de ursprungliga tabellerna `nodes` och `admins` 102 respektive 1 post. Inga skrivoperationer utfördes mot dem. Den enda befintliga administratörens UUID lades, med ditt godkännande, till i `svenska_admins`.

Kontroller: `svenska_nodes` har 10 noder (4 artiklar), `svenska_drafts` har 4 redaktionella versioner, `svenska_settings.initialized` är true. Publik åtkomst till `svenska_drafts` och `svenska_admins` nekas av API:t (HTTP 401, Postgres-kod 42501). Administratörens databasroll kan läsa 4 redaktionella versioner och 10 noder. Startsida, admin-inloggning, arkiv och artikelsidor har verifierats lokalt mot den riktiga databasen.

Grundimporten finns för dokumentation i `supabase/operations/seed-initial.sql`. Den lägger endast till saknade noder och är testad att bevara befintligt innehåll vid upprepad körning. Fortsatt redaktionellt arbete görs via `/admin`.

## Verifierad redigering i webbappen

Den 17 oktober 2026 provades det befintliga kontot via `/admin`. Konjunktivartikelns underrubrik ändrades till ”Konjunktivens former och användning” och sparades som utkast. Det publika API:t behöll den tidigare underrubriken före publicering och visade den nya efter publicering. Förhandsgranskningen kontrollerades före publiceringen. Startsidesurvalet sparades via formuläret och verifierades publikt med version 1. Migrationen för startsidans inställningar är installerad.

Bilder: `admin-homepage.png` visar formuläret, `supabase-installed.png` visar tidigare databasverifiering. Återstående granskning före lansering: fler skärmstorlekar, samtliga blocktyper via UI, sökning/SEO och drift på svenska.dev.

Produktionsbygget och slutkontrollen är godkända efter införandet av startsidans redigering. Startsidan renderas dynamiskt på servern och läser aktuellt publicerat urval vid besök. En oinloggad klient fick 200 för startsida/artikel och inloggningsformulär för `/admin`; startsidesredigeringen visades inte utan inloggning. Det inloggade kontots produktionsvy granskades separat. Den tillfälliga granskningsservern är avslutad; använd `npm run dev` vid fortsatt lokalt arbete.

## Om Turbopack tappar projektet efter en flytt

Stoppa den gamla utvecklingsservern och starta från projektets aktuella mapp. `next.config.ts` anger nu Turbopacks rot utifrån konfigurationsfilens plats, enligt [Nexts rotkonfiguration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory). Den tidigare utvecklingscachen säkerhetskopierades till en tillfällig mapp vid felsökningen den 17 oktober 2026. En ny cache skapades, och startsida, artikelsida, admin och ikon verifierades med HTTP 200.
