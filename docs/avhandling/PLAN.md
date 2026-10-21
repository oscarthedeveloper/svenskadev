# Från person till person på Svenska.dev

Genomförandeplan, version 1.0 · 2026-10-19

Status: planeringsunderlag. Webbplatsen och Supabase har inte ändrats i denna etapp.

## Beslut att utgå från

Skapa en sammanhållen, interaktiv forskningsutställning på `/fran-person-till-person`, helt ägnad Adam Horn af Åminnes avhandling från 2022. Återanvänd Svenska.devs befintliga typografi, pappersbakgrund, färgskala, linjer och navigation. Ge sidan större utrymme för kartor och jämförelser än en vanlig artikel.

Huvudfrågan för besökaren är: **Varför säger vi ”vi är” och inte ”vi äro” – och vad hände med alla de andra verbformerna?** Kartan är ingången. Böjningsmönstren förklarar förändringen. Fallstudierna förankrar den i människors språkbruk.

Sverigekartan är en mycket bra idé, men avhandlingens ämne är nordiskt. Lägg därför till en nordisk utblick, med Finland, Estland, Färöarna och Island där underlaget kräver det. Gör tydlig skillnad mellan svenskans standardskrift och talade varieteter. Kartan är historisk och ska aldrig beskrivas som en kartläggning av dagens dialekter.

Allmänheten ska kunna förstå huvudberättelsen på cirka fem minuter. Den nyfikne ska kunna stanna i kartan, jämföra paradigmen och följa varje uppgift tillbaka till sin källa. Den korta vägen och fördjupningen använder samma data och samma sida.

## Underlag och avgränsning

Huvudkälla: *Från person till person. Avvecklingen av nordisk personkongruens ur ett diakront typologiskt perspektiv*, Adam Horn af Åminne, Uppsala 2022. Den bifogade PDF-filen har 292 fysiska sidor; publikationen anges bibliografiskt som 288 sidor. Genomgången omfattar samtliga kapitel, den engelska sammanfattningen, referensförteckningen och bildförteckningen. Kartor, tabeller, metodavsnitt och slutsatser har fått särskild uppmärksamhet.

Detta är en innehålls- och genomförandeanalys, inte en oberoende kontroll av avhandlingens samtliga historiska källor, arkivinspelningar eller transkriptioner. Den strukturerade datamängden är ännu inte färdigdigitaliserad. Läs [LASNING-OCH-KALLKRITIK.md](LASNING-OCH-KALLKRITIK.md) innan innehåll eller statistik förs in i koden. Alla 86 numrerade illustrationer är inventerade i [ILLUSTRATIONER.csv](ILLUSTRATIONER.csv); inventerad betyder inte publiceringsklar.

Arbetet delas i tre nivåer:

1. **Första publicerbara versionen:** introduktion, responsiv Sverigekarta med ett verifierat lager, de fyra sydvästsvenska böjningsmönstren, en styrbar förklaringsanimation, källpanel och fungerande administration.
2. **Fördjupad utställning:** nordisk jämförelse, separat imperativlager, de två fallstudierna och fler modeller för språkförändring.
3. **Utökad digital utgåva:** ljud och eventuellt fullständig tillgänglig webbtext, om underlag och publiceringsförutsättningar medger detta.

Publicera inte hela avhandlingen eller arkivljud som en följd av att någon har laddat upp PDF-filen. Planera en självständig, källbelagd presentation; klarlägg separat vilka originalfigurer, bearbetningar, textmängder och ljud som kan användas. Ett alternativ till en full webbtext är en kapitelguide och länk till originalet. Ljud ska inte blockera första versionen.

## Sidans berättelse och ordning

| Del och ankare | Besökarens fråga | Innehåll och interaktion | Primärt underlag |
| --- | --- | --- | --- |
| `#borja` | Vad har hänt med svenskan? | Nutida ”jag/du/vi är”, äldre former och en enkel förklaring av person respektive numerus. Knappen ”Följ formerna” går vidare utan att kräva karta. | S. 19–20, 32–35, 89–95, 259 |
| `#kartan` | Var fanns andra former? | Sverigekarta med tydliga undersökningsområden och beläggens tid. Klick leder till en region, ett böjningsmönster och källa. Nordisk utblick tillkommer senare. | Karta 1, 7, 10; s. 23, 118, 147–148 |
| `#formerna` | Vad skiljer områdena åt? | Jämför um-böjning, e-böjning, skånsk böjning och a-böjning. Visa pronomen och verb tillsammans. Välj person, presens/preteritum och normaliserad form/förklaring. | Tablå 28–29; s. 147, 153 |
| `#forandringen` | Hur kan former sammanfalla? | Styrbar stegvis animation. Senare fyra utvecklingsvägar, inklusive okända fortsättningar, samt horisontell/vertikal påverkan. | Figur 6, 9–10; tablå 42–44; s. 160, 188, 243–254 |
| `#manniskorna` | Hur såg det ut hos enskilda talare? | Två parallella fallstudier, Mark och Kind respektive Östra Göinge. Källornas talarkoder, födelseuppgifter, hemsocknar, dokumenterade former och förklaringar. | Kapitel 6, s. 169–238 |
| `#om-forskningen` | Hur vet vi det? | Arkivmaterial, insamlingsurval, osäkerhet, författarens slutsatser och öppna frågor. Klickbar kapitelguide och originalhänvisning. | Kapitel 1, 4 och 7; s. 19–29, 127–139, 239–258 |

Inledningen ska förklara att ”person” är grammatisk person, inte personnamn. Författare, fullständig titel, årtal och att webbplatsen är en bearbetning ska framgå nära sidans början. Markera inte webbprojektet som officiellt författarsamarbete innan ett sådant finns.

Undvik ett långt obligatoriskt intro. Besökaren kan välja ”Utforska kartan”, ”Jämför formerna” eller ”Läs förklaringen”. Spara val i delbar URL, till exempel `?region=mark-kind&lager=indikativ#kartan`. Specificera den slutliga URL-modellen i etapp 2 och validera okända värden.

## Kartans utformning

### Tre skalor, olika slags underlag

- **Sverige:** orientering och historiskt belagda språkdrag. Visa övriga landet med en neutral bakgrund, inte en färg som antyder ”saknar böjning”. Första versionen kan ha hela Sverige som orienteringskarta och ett utförligt utsnitt av Sydvästsverige. Skriv uttryckligen vad som ännu inte är digitaliserat.
- **Sydvästsverige:** fyra indikativa paradigm, följt av ett separat lager för imperativ. Visa vilka avgränsningar som är ungefärliga eller bygger på indirekt underlag. Karta 10 är en syntes, inte ett nät av exakt belagda polygoner.
- **Mark–Kind och Östra Göinge:** socknar, hemsocknar och belägg med källhänvisningar. Skilj en sockencentroid från en faktisk inspelningsplats. Kartlägg inte enskilda hem.

Den senare nordiska vyn ska vara en egen vy med anpassad utsnittshantering, inte ett Sverigeutsnitt där relevanta varieteter utanför Sverige har försvunnit.

### Lager och tid

Använd separata kontroller för geografisk skala, språkligt fenomen och källornas tid. Ett enda reglage märkt ”årtal” skulle blanda ihop oförenliga tidsuppgifter.

| Tidsuppgift | Korrekt visning | Felaktig slutsats att undvika |
| --- | --- | --- |
| Karta 7, ca 1850 respektive ca 1900 | Två diskreta historiska översikter med olika källtäckning | En exakt årsvis nedgångskurva eller gräns för varje mellanår |
| Karta 14, 1700-/1800-tal | Separat, tydligt märkt hypotetisk rekonstruktion | Belagd spridningsfilm, kalibrerade hastigheter eller exakta ortsdatum |
| Karta 22–23, uppteckningar 1880–1940 och 1948–1980 | Jämförelse av källmaterial från två insamlingsperioder | Två ögonblicksbilder av hela befolkningens språk |
| Informanternas födelseår | Födelseuppgift och författarens kohort | Året då en form användes i en viss inspelning |
| Inspelningsår | Separat uppgift; ungefärligt eller okänt när så är fallet | Automatisk ersättning med födelseår eller periodens mittpunkt |

Kartan ska ha en regionlista som fullvärdig alternativ navigation. Klick och tangentbord ska ge samma resultat. Ingen information får kräva hover. Välj ”Visa region” och ”Till översikten” före avancerad fri panorering. Behövs fri zoom senare ska den ha knappar och inte blockera mobilens vanliga sidrullning.

### Grafik och animation

Använd samma färg för samma böjningsmönster i hela denna utställning, med textetiketter och ytterligare markörer. Om färgerna skiljer sig från avhandlingens figurer anges det i källpanelen. Osäkerhet visas med mönster, streckade gränser och en begriplig text, inte bara genom svagare färg.

Kartan växlar diskret mellan verifierade lager. Animering får mjuka upp bytet, men ska inte skapa mellanlägen som ser ut som nya historiska observationer. Avvecklingen ska inte gestaltas som en enda våg som sveper över Sverige: det motsäger avhandlingens slutsats.

Låt böjningsceller vara animationens viktigaste objekt. Besökaren trycker ”Nästa steg” och ser hur två celler får samma form eller hur en kategori upphör att uttryckas. Behåll föregående och nästa tillstånd läsbara. Figur 10 passar bättre som ett förgrenat stegdiagram än som ett linjärt klipp. Okända steg i typ 4 förblir okända.

En senare animation efter figur 9 kan visa två mekanismer: grannbygders påverkan ändrar lokala paradigm mellan talare/generationer; prestigepåverkan kan ge växling mellan pluralform och enhetsform hos samma talare. Presentera detta som avhandlingens analys. Uppfinn inte ett geografiskt kontaktnät med viktade kanter.

## Digitalisering och källmodell

PDF-texten går att extrahera; huvudarbetet är strukturerad tolkning och kontroll, inte att köra OCR över allt. Textutvinning tappar bland annat färgkodning, typografiska distinktioner och tabellstruktur. Vissa fonetiska tecken och mellanrum behöver visuell kontroll. Skannade arkivbilder kan kräva separat manuell transkription.

Arbetsflöde för varje publicerat objekt:

1. Registrera källa, tryckt sida, fysisk PDF-sida och figur-/tabellnummer. Behåll båda sidnumren som egna fält även när de sammanfaller.
2. Spara källans ordalydelse eller avläsning separat från en redaktionell normalisering. Markera om det rör sig om en form, en ändelse, en rekonstruerad form eller ett pedagogiskt exempel.
3. Läs rubrik, förklaring, fotnoter och omgivande resonemang. Ange tid, modus, person, numerus, tempus, ordföljd och eventuellt verbtyp där dessa behövs för tolkningen.
4. Kontrollera mot den renderade originalsidan. Kartor får inte vektoriseras automatiskt utan en kontroll av projektion, gränser och källans precision.
5. Låt en andra genomgång kontrollera avskriften och betydelsen. Dokumentera vem som granskat och vad som återstår; extern sakkunniggranskning eftersträvas för kärnmodellen.
6. Först därefter får objektet status publiceringsklart. Besökaren ska alltid kunna öppna en kort källpanel med belägg, förklaring, sida och osäkerhet.

Fullständig löptext lagras eller publiceras inte automatiskt. Om en full digital läsutgåva senare beslutas, tillkommer eget arbete med fotnoter, rubrikhierarki, tabellsemantik, formler, språktecken, sökning, sidankare och avstämning mot originalet.

### Föreslagna dataobjekt

| Objekt | Minsta innehåll | Viktig regel |
| --- | --- | --- |
| Källa och lokalisering | Bibliografi, stabil länk, källversion, checksumma, fysisk sida, tryckt sida, objekt-ID | Original, bearbetning och sekundärkälla är skilda |
| Region och geometri | Stabilt ID, historiskt namn, typ, geometri, precision, giltighet, geodatakälla | Moderna administrativa gränser ersätter inte historiska språkområden |
| Varietet och paradigm | Namn, område, tempus, modus, person/numerus, råform, visningsform, variantvillkor | Formen i ett enda tempus representerar inte hela språksystemet |
| Belägg eller syntes | Källställe, formulering, tidsintervall och tidsroll, platsroll, evidenstyp, osäkerhetsnot | Saknas, inte belagt, ingen relevant kontext och tvetydigt är olika tillstånd |
| Informant och inspelning | Befintlig talarkod, studie-ID, hemsocken, födelseuppgift, inspelningsdatum, arkiv-ID | Ungefärliga och okända datum bevaras; inga återidentifieringar |
| Tabellmått | Värde eller kategori, enhet, nämnare, urval, tröskeldefinition och överlapp | Personer, belägg och grammatiska personer får inte räknas samman |
| Förklaringsmodell | Noder, steg/kanter, författarens beskrivning, belagda respektive hypotetiska delar | Okända övergångar fylls inte ut med animation |
| Media | Arkivreferens, rättighetsstatus, tidskoder, avskrift, översättning | Ljud och illustrerande nutida uppläsning märks olika |
| Redaktionell utgåva | Sidtext, valda dataversioner, granskningsstatus, publiceringsrevision | Publiceringen måste ge en sammanhängande text- och dataversion |

Använd stabila ID:n från början, till exempel `karta-10`, `tabla-28` och `mark-kind:AJ3`. Följ källans talarkoder, även mellanslag och numrering, och definiera separat maskin-ID. Exempel-ID:t är ingen instruktion att normalisera om originalkoden utan kontroll.

## Teknik och administration

Utgå från befintlig Next/React/TypeScript-app i `SvenskaDev`. Föreslagen explicit rutt är `app/fran-person-till-person/page.tsx`; den generiska artikelrutten accepterar i dag endast befintliga sektionsnamn. Länka utställningen från Språkliv och eventuellt ett redaktionellt valt startsideskort.

Återanvänd sidram, typsnitt, inloggning och befintlig administratörskontroll. Skapa avhandlingens egna komponenter och datamodeller. Pressa inte in kartgeometri och forskningsdata i nuvarande `StudyBlock`-textfält. Vanlig brödtext och exempel kan använda befintliga redaktionella mönster.

En SVG-karta är förstahandsvalet för ett begränsat antal språkregioner: den kan bli skarp och lätt utan en separat karttjänst. För geografiskt korrekta koordinater används en definierad projektion; utvärdera ett litet projektionsbibliotek när geodata har valts. Kartmotor med bakgrundskartor är en senare möjlighet endast om verklig användning kräver den. Ingen ny teknik behöver bestämmas innan källornas geometrier är kända.

Serverrendera sidtext, källor och listalternativ. Ladda interaktion och tyngre regiondata när de behövs. Första läsningen får inte kräva att en PDF på cirka 18 MB laddas ned. Ett PDF-fel eller ett otillgängligt ljudarkiv ska inte slå ut sidans innehåll.

Använd samma Supabaseprojekt som redan valts: `woezrcirqbickpqoduck`. Utöka endast Svenska.devs eget namnutrymme, exempelvis `svenska_thesis_*`; lägg inte forskningsdata i Fornsvenska.se:s tabeller. Befintlig rätt att administrera Svenska.dev återanvänds. Inga nya konton eller utökade kontorättigheter behövs som standard.

Föreslagen adminingång: `/admin/avhandling`, med länkar till:

- Sidans texter och berättelsesteg.
- Källor, belägg och granskningsanmärkningar.
- Regioner, paradigm och mapplager.
- Fallstudier och tabeller.
- Media och publicering.

Vanliga redigeringar ska kunna göras i formulär utan kod. Bulkimport kan ske via validerad JSON/CSV med förhandsvisning, felrapport och uttryckligt importsteg. Geometri behöver i första versionen ett tydligt filimportflöde; ett fritt kartredigeringsverktyg ingår inte. Ett regionnamn, en text, en färg eller en källnot ska gå att ändra direkt i admin.

Använd privat utkast, revisionskontroll och atomär publicering av en sammanhängande utgåva. En möjlig första modell är en versionshanterad, validerad datasamling per utgåva och separata käll-/mediaregister. Mät datamängden innan normaliserade tabeller respektive JSON väljs slutligt. Om vissa register lagras separat ska den publicerade utgåvan hänvisa till oföränderliga registerversioner. Publika läsare får endast publicerade utgåvor; admin ser utkast. Återställning publicerar en tidigare version som ny revision. RLS och skrivfunktioner prövas lokalt före migration i det delade projektet.

## Etapper med leverans och klartkriterier

### Etapp 0 · Källram och avgränsning

**Uppgifter:** fastställ första innehållsomfånget; kontrollera originalutgåva, eventuell errata och publiceringsvillkor; efterfråga vid behov författarens ursprungsfigurer/geodata och förklaring till antalsavvikelserna. Klarlägg om arkivljud kan tillgängliggöras. Inga meddelanden skickas utan användarens instruktion.

**Leverans:** beslutslogg med omfattning, källversion, tillåtna tillgångar, öppna frågor och alternativ för sådant som inte kan användas. Bevara källa och checksumma.

**Klart när:** första versionens egna texter, datakällor och grafiska underlag har en dokumenterad användningsväg. Saknat ljud stoppar endast ljuddelen. Om originalkartor inte kan bearbetas används verifierade egna scheman eller en enklare lokaliseringskarta medan originalet länkas.

**Beroenden:** inga. Författarsvar och arkivtillgång kan dröja; lokalt modell- och skissarbete kan fortsätta.

### Etapp 1 · Källregister och första verifierade datamängd

**Uppgifter:** digitalisera tablå 28, karta 10 och deras förklaringar som ett avgränsat pilotpaket; skilj belagda och indirekt härledda områden; skapa grammatisk ordlista och typade valideringsregler. För en avvikelselogg. Prova specialtecken mot originalet.

**Leverans:** versionssatt pilotdata, källkoppling för varje cell/område och en granskningsrapport. Uppdatera illustrationsregistret med faktisk kontrollstatus. Fält som inte stöds av källan förblir tomma eller uttryckligen okända.

**Klart när:** alla fyra paradigm går att återge korrekt för de tre pluralpersonerna och presens/preteritum; snedstreckets tempusbetydelse bevaras; det går att visa varför en region fått en viss färg. Inga syntetiska talar- eller tokenräkningar.

**Beroenden:** etapp 0 för publiceringsbarhet. Datamodell kan arbetas fram parallellt med källklarläggandet.

### Etapp 2 · Berättelse, grafisk modell och responsiv prototyp

**Uppgifter:** skriv introduktion och sidans sex delar; definiera kort/lång läsväg; rita desktop- och mobilvyer; testa karta tillsammans med jämförelsetabell och källpanel. Specificera URL-tillstånd, färgsemantik och osäkerhetsmarkörer.

**Leverans:** granskningsbar prototyp med pilotdata från etapp 1 och en klickbar berättelse genom ett enda komplett exempel. Prototypen ska vara lokalt avskild från publicerat innehåll.

**Klart när:** en ovan läsare kan förklara skillnaden mellan grammatisk person och numerus samt förstå vilket område och vilken period kartan visar. Samma uppgift fungerar på mobil och utan hover. Designen känns som Svenska.dev.

**Beroenden:** etapp 1. Här avgörs också hur mycket kartografisk detalj som verkligen hjälper.

### Etapp 3 · Första fungerande sida och administration

**Uppgifter:** bygg den explicita rutten, serverrenderad text, responsiv SVG-karta, regionlista, paradigmväljare och källpanel. Koppla adminformulär, validering, utkast och versionsstyrd publicering. Lägg migrationen i projektet och prova isolering mot befintliga tabeller innan körning i gemensamt Supabaseprojekt.

**Leverans:** en komplett lokal förhandsversion av introduktion → karta → paradigm → källa, med samma administratörskonto som webbplatsen redan använder. Text, regionval och källa ska överleva omladdning efter redigering.

**Klart när:** en redaktör kan ändra pilotinnehållet, spara utkast, förhandsgranska, publicera och återställa; en anonym besökare får aldrig utkast; två adminflikar kan inte tyst skriva över varandra. Ingen databasändring berör Fornsvenska.se:s egna data.

**Beroenden:** etapp 2 och verifierad datamodell från etapp 1.

### Etapp 4 · Animation som förklarar formernas förändring

**Uppgifter:** animera ett källbelagt eller tydligt modellerat förlopp i ett böjningsschema med nästa/föregående/återställ. Utgå från figur 6 för pilotens sydvästsvenska relationer. Lägg sedan till figur 10 och tablå 42 som fyra vägar; respektera typ 4:s okända fortsättning. Förklara varför detta är en modell, inte en exakt film av varje talare.

**Leverans:** första versionens pedagogiska animation och ett likvärdigt stillbilds-/textalternativ. Låt alla slutlägen kunna studeras utan att rörelsen pågår.

**Klart när:** rörelsen tydliggör vilken form som sammanfaller med vilken, återställning fungerar och reducerad rörelse respekteras. Inget årtal eller orsakssamband har skapats enbart för animationens skull.

**Beroenden:** etapp 3. Efter denna etapp och kvalitetssäkring i etapp 8 kan den första begränsade versionen lanseras; man behöver inte invänta hela atlasen.

### Etapp 5 · Utbyggd atlas och nordiskt sammanhang

**Uppgifter:** digitalisera karta 7:s diskreta jämförelse, ett separat imperativlager efter karta 15 och relevanta regionala fördjupningar från kapitel 3. Lägg till tablå 20–26 där de förklarar ett valt område. Karta 14 kan tillkomma som uttrycklig rekonstruktion i en separat modellvy.

**Leverans:** Sverigekarta med utbyggd täckning och en nordisk utblick, förklaringar av skillnaden mellan indikativ/imperativ samt tal/skrift. Lagerväljaren anger underlag och tidsroll.

**Klart när:** kartlager saknar påhittad precision, Finland/Estland/ögrupper hanteras när källan omfattar dem och luckor inte visas som negativa observationer. Beläggspunkter kan skiljas från syntesområden. Kartans historiska bakgrundsgränser är beskrivna.

**Beroenden:** etapp 1:s granskningsflöde och etapp 3:s dataversionering. Varje lager kan levereras för sig.

### Etapp 6 · De två fallstudierna och människorna

**Uppgifter:** strukturera tablå 30–39, relevanta tabeller 1–5 och kartsamband. Skapa faktiska kohortmedlemskap från källan i stället för automatiska årtalsgränser. Visa beläggens begränsningar och informantkoder. Förklara figur 9:s horisontella och vertikala påverkan med en separat animation.

**Leverans:** jämförbara paneler för Mark–Kind och Östra Göinge, med informantrader och källnoter; utvalda språkprov med översättning och grammatisk kommentar. Tablå 39:s preferenser återges som rangordningar med korrekt enhet, inte procentstaplar.

**Klart när:** samma informant inte oavsiktligt dubbelräknas; kategori ”båda” inte har blivit 50/50; ≥5-varianter motsvarar källans egen definition; små och okända underlag syns; generationsgränser har kontrollerats. Avvikande totalsiffror är utredda eller öppet avgränsade.

**Beroenden:** etapp 3 och en separat granskad transkription av fallstudiernas tabeller. Kräver inte att etapp 5 är helt färdig.

### Etapp 7 · Ljud och eventuell utökad läsutgåva

**Uppgifter:** verifiera tillgängliga originalinspelningar, arkiv-ID:n, publiceringsvillkor, segment och tidskoder. Koppla ljud till exakt språkprov och avskrift. Utred en fullständig HTML-läsutgåva som ett separat delbeslut med rättigheter, omfattning och korrekturläsning.

**Leverans:** korta verifierade ljudexempel med transkription, normalisering/översättning och grammatisk förklaring. Om ljud inte kan användas förblir språkproven textbaserade. Eventuell nutida berättarröst märks som just berättarröst.

**Klart när:** spelaren har tangentbordsstöd, tydliga knappar och textalternativ; inget autospelas; kopplingen mellan källa och ljud är dokumenterad. Ingen syntetisk imitation presenteras som ett historiskt belägg.

**Beroenden:** arkivtillgång och etapp 6 för dessa språkprov. Denna etapp är valfri och inte ett lanseringskrav.

### Etapp 8 · Redaktionell granskning, kvalitet och lansering

**Uppgifter:** kontrollera sakuppgifter mot originalet, publiceringsvillkor, källänkar, hjälptexter, specialtecken och alla aktuella kartlager. Prova mobil, pekskärm, tangentbord, skärmläsning, förstoring och reducerad rörelse. Mät datamängd och svarstider. Prova databasregler och återställning av en hel utgåva. Granska metadata, indexering och länk från Språkliv.

**Leverans:** dokumenterad granskning, kända begränsningar, lanseringschecklista och återställningsbar innehållsversion. Lokal leverans och offentlig lansering är separata steg; domän/drift ska verifieras när publicering faktiskt ska ske.

**Klart när:** kriterierna nedan är uppfyllda för den utgåva som ska släppas. Kör kvalitetssäkringen igen vid varje större utbyggnad från etapp 5–7.

**Beroenden:** minst etapp 0–4 för första versionen. Etapp 5–7 kan följa som egna utgåvor.

## Kontroller som ska styra genomförandet

### Innehåll och data

- Varje färglagd region, tabellcell, modellsteg och språkprov har källställe och granskningsstatus.
- Ingen omarkerad rekonstruktion. Ingen årsvis interpolation mellan de två historiska översikterna.
- Tabellerna skiljer informantantal från beläggantal och författarens kategorier från egna beräkningar.
- Konjunktiv förväxlas inte med likalydande indikativa pluralformer. Avhandlingen är inte i sig en undersökning av konjunktiv.
- De fyra huvudparadigmen är verifierade mot tablå 28; allomorfi och normalisering anges.
- Ursprungsdata, redaktionell bearbetning och publicerad version kan särskiljas och återfinnas.

### Användning

- Huvudberättelse och regionlista fungerar när animationer är avstängda. Sidans serverrenderade läsväg fungerar utan klientinteraktion.
- Karta och tabeller fungerar vid 320, 390, 768 och 1440 CSS-pixlars bredd. Ingen oavsiktlig horisontell sidrullning; en bred tabell har märkt, lokal rullning eller en läsbar alternativvy.
- Tangentbord når regionval, lager, stegknappar, källpanel och återgång. Fokus flyttas begripligt när paneler öppnas/stängs.
- Val kommuniceras med etikett och tillstånd. Färger är aldrig enda bärare av information. Mobilen kräver inte hovring.
- Text går att förstora till 200 procent utan att kontroller överlappar. Röst- och skärmläsningsordning följer sidans berättelse.
- Reducerad rörelse tar bort förflyttningar som inte behövs. Ljud spelas endast efter användarens val.

### Teknik och redaktion

- RLS-test: anonym kan läsa publicerat, inte utkast eller skrivfunktioner; rätt admin kan redigera; övriga inloggade kan inte.
- En utgåva publiceras atomärt: kartan och texten kan inte tillfälligt peka på oförenliga versioner. Konflikt mellan två flikar ger synligt fel.
- Import av felaktiga rader visar rad/objekt och orsak; partiella importer blir inte publicerade.
- Befintliga Svenska.dev-artiklar, startsida och Fornsvenska.se:s tabeller fortsätter fungera efter migration.
- Använd befintliga projektkommandon för tester, typkontroll och bygge, kompletterade med meningsfulla datavalideringar och ett användarflöde för utställningen. Testa särskilt okända datum, osäkra områden och saknat ljud.
- Preliminär prestandabudget: högst 250 kB komprimerad extra klientkod för utställningens första vy och högst 500 kB första kart-/datapaket. Mät och justera med dokumenterat skäl; inga ljudfiler eller original-PDF i första sidladdningen.

## Prioritering och arbetsordning

Arbeta i följande ordning: **källram → pilotdata → prototyp → komplett sida med admin → förklaringsanimation → första kvalitetsgranskning/lansering → ytterligare kartlager och fallstudier → valfritt ljud/fulltext**.

Grov arbetsuppskattning för en utvecklare med redaktionellt arbete: etapp 0–1 cirka 3–7 arbetsdagar, etapp 2–4 cirka 6–12, första kvalitetssäkring cirka 2–4. Fördjupad atlas och fallstudier kan kräva ytterligare 6–12. Detta är planeringsintervall, inte kalenderlöften; detaljerad manuell källgranskning, rättighetsklarlägganden, geodata och extern återkoppling kan bli den största delen. Ljud och fulltext uppskattas separat när materialet är känt.

Bygg inte alla 27 kartor och 44 tablåer före första leverans. Börja med det sammanhängande exemplet i etapp 1–4 och behåll övriga objekt i registret. Första versionen är en avgränsad digital presentation, inte en förklädd utfästelse om att hela avhandlingen redan är digitaliserad.

Nästa genomförandesteg finns som avbockningsbar backlog i [ARBETSLISTA.md](ARBETSLISTA.md). Vid varje avslutad etapp: uppdatera status, käll-/dataversion, verifiering, kvarstående frågor och nästa uppgift i dessa dokument.
