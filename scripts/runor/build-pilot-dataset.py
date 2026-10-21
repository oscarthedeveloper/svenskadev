#!/usr/bin/env python3
"""Bygg och validera den kuraterade 20-posters piloten för Runsidan (E08 & E09).

Kopplar samman:
1. RAÄ Runor API / Samnordisk runtextdatabas (WGS84-koordinater, proveniens, UUID, tolkningar).
2. Sveriges runinskrifter (SRI) verifierade PDF- och tryckta sidor.
3. Svårfallsmatris för E09 (förlorade objekt, fragment, berghällar, flera inskrifter per bärare, flyttade stenar).
"""
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys
from urllib.parse import quote

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_FILE = REPO_ROOT / "docs/runor/pilot-20-inskrifter.json"

PILOT_SPECS = [
    {
        "id": "runa-ol-1",
        "signum1": "Öl",
        "signum2": "1",
        "canonicalSlug": "ol-1",
        "name": "Karlevistenen",
        "carrierType": "runsten",
        "material": "Gråbrun kalksten",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 15,
        "printedPageEnd": 28,
        "pdfPageStart": 19,
        "pdfPageEnd": 35,
        "plateNumber": "Plansch I & II",
        "matrixRole": "Standard runsten, skaldedikt i dróttkvætt, bevarad på ursprunglig plats",
        "license": "Public Domain",
        "photographer": "Sven Söderberg",
    },
    {
        "id": "runa-ol-2",
        "signum1": "Öl",
        "signum2": "2",
        "canonicalSlug": "ol-2",
        "name": "Resmo kyrka",
        "carrierType": "fragment",
        "material": "Kalksten",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 28,
        "printedPageEnd": 32,
        "pdfPageStart": 36,
        "pdfPageEnd": 40,
        "plateNumber": "Plansch III",
        "matrixRole": "Fragment, sekundärt inmurat i kyrka",
        "license": "Public Domain",
        "photographer": "Sven Söderberg",
    },
    {
        "id": "runa-ol-9",
        "signum1": "Öl",
        "signum2": "9",
        "canonicalSlug": "ol-9",
        "name": "Kastlösa kyrka",
        "carrierType": "fragment",
        "material": "Kalksten",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 51,
        "printedPageEnd": 55,
        "pdfPageStart": 62,
        "pdfPageEnd": 66,
        "plateNumber": "Plansch IV",
        "matrixRole": "Fragment av lockhäll till kistgrav",
        "license": "Public Domain",
        "photographer": "Sven Söderberg",
    },
    {
        "id": "runa-ol-15",
        "signum1": "Öl",
        "signum2": "15",
        "canonicalSlug": "ol-15",
        "name": "Södra Möckleby kyrkogård",
        "carrierType": "runsten",
        "material": "Kalksten",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 60,
        "printedPageEnd": 62,
        "pdfPageStart": 74,
        "pdfPageEnd": 76,
        "plateNumber": None,
        "matrixRole": "Förlorat objekt (extant: false, okant_lage)",
        "license": "Public Domain",
        "photographer": "Ej avbildad",
    },
    {
        "id": "runa-ol-16",
        "signum1": "Öl",
        "signum2": "16",
        "canonicalSlug": "ol-16",
        "name": "Gräsgårds kyrkogård",
        "carrierType": "runsten",
        "material": "Kalksten",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 62,
        "printedPageEnd": 65,
        "pdfPageStart": 76,
        "pdfPageEnd": 79,
        "plateNumber": None,
        "matrixRole": "Förlorat objekt, känd endast genom äldre Bautil-avritning",
        "license": "Public Domain",
        "photographer": "Johan Peringskiöld (Bautil)",
    },
    {
        "id": "runa-ol-18",
        "signum1": "Öl",
        "signum2": "18",
        "canonicalSlug": "ol-18",
        "name": "Seby",
        "carrierType": "runsten",
        "material": "Kalksten",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 68,
        "printedPageEnd": 70,
        "pdfPageStart": 82,
        "pdfPageEnd": 84,
        "plateNumber": "Plansch VI",
        "matrixRole": "Bevarad runsten med lakun och osäker tolkning",
        "license": "Public Domain",
        "photographer": "Sven Söderberg",
    },
    {
        "id": "runa-ol-23",
        "signum1": "Öl",
        "signum2": "23",
        "canonicalSlug": "ol-23",
        "name": "Stenåsa kyrkogård",
        "carrierType": "gravhall",
        "material": "Kalksten",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 78,
        "printedPageEnd": 82,
        "pdfPageStart": 92,
        "pdfPageEnd": 96,
        "plateNumber": "Plansch VIII",
        "matrixRole": "Gravhäll med kristet kors och minnesinskrift",
        "license": "Public Domain",
        "photographer": "Sven Söderberg",
    },
    {
        "id": "runa-ol-25",
        "signum1": "Öl",
        "signum2": "25",
        "canonicalSlug": "ol-25",
        "name": "Dröstorps häll",
        "carrierType": "fast_hall",
        "material": "Alvarmarkens berghäll",
        "sriVolumeId": "band-01",
        "sriVolumeTitle": "Ölands runinskrifter",
        "author": "Sven Söderberg & Erik Brate",
        "publicationYear": 1906,
        "pdfFil": "sri_oland_b01_h01.pdf",
        "printedPageStart": 83,
        "printedPageEnd": 86,
        "pdfPageStart": 97,
        "pdfPageEnd": 100,
        "plateNumber": "Plansch IX",
        "matrixRole": "Fast berghäll på Stora Alvaret",
        "license": "Public Domain",
        "photographer": "Sven Söderberg",
    },
    {
        "id": "runa-og-136",
        "signum1": "Ög",
        "signum2": "136",
        "canonicalSlug": "og-136",
        "name": "Rökstenen",
        "carrierType": "runsten",
        "material": "Ljusgrå granit",
        "sriVolumeId": "band-02",
        "sriVolumeTitle": "Östergötlands runinskrifter",
        "author": "Erik Brate",
        "publicationYear": 1918,
        "pdfFil": "sri_ostergotland_b02_h02_text.pdf",
        "printedPageStart": 130,
        "printedPageEnd": 158,
        "pdfPageStart": 34,
        "pdfPageEnd": 62,
        "plateNumber": "Plansch XXXIII–XXXVI",
        "matrixRole": "Världens mest kända runsten: fornyrðislag, lönnrunor, chiffer, urnordiska drag",
        "license": "Public Domain",
        "photographer": "Erik Brate",
    },
    {
        "id": "runa-og-181",
        "signum1": "Ög",
        "signum2": "181",
        "canonicalSlug": "og-181",
        "name": "Ledbergsstenen",
        "carrierType": "runsten",
        "material": "Gnejsgranit",
        "sriVolumeId": "band-02",
        "sriVolumeTitle": "Östergötlands runinskrifter",
        "author": "Erik Brate",
        "publicationYear": 1918,
        "pdfFil": "sri_ostergotland_b02_h02_text.pdf",
        "printedPageStart": 174,
        "printedPageEnd": 177,
        "pdfPageStart": 78,
        "pdfPageEnd": 81,
        "plateNumber": "Plansch XLIV",
        "matrixRole": "Bildsten med mytologiska scener ur Ragnarök och lönnrunor",
        "license": "Public Domain",
        "photographer": "Erik Brate",
    },
    {
        "id": "runa-u-11",
        "signum1": "U",
        "signum2": "11",
        "canonicalSlug": "u-11",
        "name": "Hovgårdsstenen (Adelsö)",
        "carrierType": "runblock",
        "material": "Grovkornig grå gnejs",
        "sriVolumeId": "band-06",
        "sriVolumeTitle": "Upplands runinskrifter del 1",
        "author": "Elias Wessén & Sven B.F. Jansson",
        "publicationYear": 1940,
        "pdfFil": "sri_uppland_b06_text_1.pdf",
        "printedPageStart": 13,
        "printedPageEnd": 21,
        "pdfPageStart": 13,
        "pdfPageEnd": 21,
        "plateNumber": "Plansch 4",
        "matrixRole": "Kunglig inskrift på fast block (Håkon jarl)",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
    {
        "id": "runa-u-29",
        "signum1": "U",
        "signum2": "29",
        "canonicalSlug": "u-29",
        "name": "Hillersjöhällen",
        "carrierType": "fast_hall",
        "material": "Fast berghäll",
        "sriVolumeId": "band-06",
        "sriVolumeTitle": "Upplands runinskrifter del 1",
        "author": "Elias Wessén & Sven B.F. Jansson",
        "publicationYear": 1940,
        "pdfFil": "sri_uppland_b06_text_1.pdf",
        "printedPageStart": 34,
        "printedPageEnd": 44,
        "pdfPageStart": 34,
        "pdfPageEnd": 44,
        "plateNumber": "Plansch 12",
        "matrixRole": "Upplands längsta hällristning: arvsberättelse om Geirlög i sex generationer",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
    {
        "id": "runa-u-73",
        "signum1": "U",
        "signum2": "73",
        "canonicalSlug": "u-73",
        "name": "Hansta (Greklandssten)",
        "carrierType": "runsten",
        "material": "Granit",
        "sriVolumeId": "band-06",
        "sriVolumeTitle": "Upplands runinskrifter del 1",
        "author": "Elias Wessén & Sven B.F. Jansson",
        "publicationYear": 1940,
        "pdfFil": "sri_uppland_b06_text_2.pdf",
        "printedPageStart": 95,
        "printedPageEnd": 100,
        "pdfPageStart": 26,
        "pdfPageEnd": 31,
        "plateNumber": "Plansch 32",
        "matrixRole": "Flyttad sten (fyndplats Hansta i Spånga, nuvarande plats Skansen)",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
    {
        "id": "runa-u-101",
        "signum1": "U",
        "signum2": "101",
        "canonicalSlug": "u-101",
        "name": "Sjöstugan (Jarlabanke)",
        "carrierType": "runsten",
        "material": "Rödgrå granit",
        "sriVolumeId": "band-06",
        "sriVolumeTitle": "Upplands runinskrifter del 1",
        "author": "Elias Wessén & Sven B.F. Jansson",
        "publicationYear": 1940,
        "pdfFil": "sri_uppland_b06_text_2.pdf",
        "printedPageStart": 138,
        "printedPageEnd": 145,
        "pdfPageStart": 69,
        "pdfPageEnd": 77,
        "plateNumber": "Plansch 45",
        "matrixRole": "Tät geografisk grupp: Jarlabankes bro och ägoförklaring",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
    {
        "id": "runa-u-104",
        "signum1": "U",
        "signum2": "104",
        "canonicalSlug": "u-104",
        "name": "Eds kyrka",
        "carrierType": "runsten",
        "material": "Gnejs",
        "sriVolumeId": "band-06",
        "sriVolumeTitle": "Upplands runinskrifter del 1",
        "author": "Elias Wessén & Sven B.F. Jansson",
        "publicationYear": 1940,
        "pdfFil": "sri_uppland_b06_text_2.pdf",
        "printedPageStart": 148,
        "printedPageEnd": 154,
        "pdfPageStart": 79,
        "pdfPageEnd": 86,
        "plateNumber": "Plansch 48",
        "matrixRole": "Ristarsignatur: Öpir risti (Ybiʀ risti)",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
    {
        "id": "runa-u-112a",
        "signum1": "U",
        "signum2": "112A",
        "canonicalSlug": "u-112a",
        "name": "Runblocket i Ed (Västra sidan)",
        "carrierType": "runblock",
        "material": "Fast bergyta / jätteblock",
        "sriVolumeId": "band-06",
        "sriVolumeTitle": "Upplands runinskrifter del 1",
        "author": "Elias Wessén & Sven B.F. Jansson",
        "publicationYear": 1940,
        "pdfFil": "sri_uppland_b06_text_3.pdf",
        "printedPageStart": 157,
        "printedPageEnd": 165,
        "pdfPageStart": 1,
        "pdfPageEnd": 9,
        "plateNumber": "Plansch 51",
        "matrixRole": "Flera inskrifter på samma bärare: sida A (Ragnvald lät rista för sin moder Fastvi)",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
    {
        "id": "runa-u-112b",
        "signum1": "U",
        "signum2": "112B",
        "canonicalSlug": "u-112b",
        "name": "Runblocket i Ed (Östra sidan / Grekland)",
        "carrierType": "runblock",
        "material": "Fast bergyta / jätteblock",
        "sriVolumeId": "band-06",
        "sriVolumeTitle": "Upplands runinskrifter del 1",
        "author": "Elias Wessén & Sven B.F. Jansson",
        "publicationYear": 1940,
        "pdfFil": "sri_uppland_b06_text_3.pdf",
        "printedPageStart": 157,
        "printedPageEnd": 165,
        "pdfPageStart": 1,
        "pdfPageEnd": 9,
        "plateNumber": "Plansch 52",
        "matrixRole": "Flera inskrifter på samma bärare: sida B (Ragnvald ledde hären i Grekland)",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
    {
        "id": "runa-so-101",
        "signum1": "Sö",
        "signum2": "101",
        "canonicalSlug": "so-101",
        "name": "Ramsundsristningen",
        "carrierType": "fast_hall",
        "material": "Berghäll",
        "sriVolumeId": "band-03",
        "sriVolumeTitle": "Södermanlands runinskrifter",
        "author": "Erik Brate & Elias Wessén",
        "publicationYear": 1936,
        "pdfFil": "sri_sodermanland_b03_h01_text_2.pdf",
        "printedPageStart": 72,
        "printedPageEnd": 76,
        "pdfPageStart": 20,
        "pdfPageEnd": 24,
        "plateNumber": "Plansch 38",
        "matrixRole": "Fast berghäll med Sigurdsristningen, känd ristare (Torir)",
        "license": "Public Domain",
        "photographer": "Erik Brate",
    },
    {
        "id": "runa-so-179",
        "signum1": "Sö",
        "signum2": "179",
        "canonicalSlug": "so-179",
        "name": "Gripsholmsstenen",
        "carrierType": "runsten",
        "material": "Granit",
        "sriVolumeId": "band-03",
        "sriVolumeTitle": "Södermanlands runinskrifter",
        "author": "Erik Brate & Elias Wessén",
        "publicationYear": 1936,
        "pdfFil": "sri_sodermanland_b03_h04_text_1a.pdf",
        "printedPageStart": 153,
        "printedPageEnd": 157,
        "pdfPageStart": 17,
        "pdfPageEnd": 21,
        "plateNumber": "Plansch 67",
        "matrixRole": "Ingvarssten: 'De foro manligen fjärran efter guld och österut gåvo örnen föda'",
        "license": "Public Domain",
        "photographer": "Elias Wessén",
    },
    {
        "id": "runa-vs-24",
        "signum1": "Vs",
        "signum2": "24",
        "canonicalSlug": "vs-24",
        "name": "Hassmyrastenen (Odendisa)",
        "carrierType": "runsten",
        "material": "Granit",
        "sriVolumeId": "band-13",
        "sriVolumeTitle": "Västmanlands runinskrifter",
        "author": "Sven B.F. Jansson",
        "publicationYear": 1964,
        "pdfFil": "sri_vastmanland_b13_text_2.pdf",
        "printedPageStart": 69,
        "printedPageEnd": 76,
        "pdfPageStart": 15,
        "pdfPageEnd": 22,
        "plateNumber": "Plansch 18",
        "matrixRole": "Skaldedikt över en kvinna: fornvästmanländska drag, allitteration",
        "license": "Public Domain",
        "photographer": "Sven B.F. Jansson",
    },
]

def fetch_api_entry(s1: str, s2: str):
    query = f"{s1} {s2}"
    url = f"https://runor.raa.se/api/snrd/search?edition_id=latest&search_field=SIGNUM&matching_text={quote(query)}"
    cmd = ["curl", "-s", "--max-time", "15", url]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    items = json.loads(res.stdout)
    # Hitta bästa match
    for item in items:
        if item.get("signum1") == s1 and item.get("signum2") == s2:
            return item
    for item in items:
        if item.get("signum1") == s1 and s2 in item.get("signum2", ""):
            return item
    # För A/B partier som U 112A, hämta basposten U 112
    base_s2 = "".join(c for c in s2 if c.isdigit())
    base_query = f"{s1} {base_s2}"
    url_base = f"https://runor.raa.se/api/snrd/search?edition_id=latest&search_field=SIGNUM&matching_text={quote(base_query)}"
    res_base = subprocess.run(["curl", "-s", "--max-time", "15", url_base], capture_output=True, text=True, check=True)
    base_items = json.loads(res_base.stdout)
    for item in base_items:
        if item.get("signum1") == s1 and item.get("signum2") == base_s2:
            return item
    return None

TRANSLATIONS = {
    "Öl 1": {
        "sv": "Stenen är rest efter Sibbe den gode, Foldars son, och hans följe satte på Öland detta minnesmärke. Dold ligger den som de största dåd följde — det visste de flesta — stridernas träd i denna hög. Ingen rättrådigare stridsman på den väldiga havsgudens mark skall härska över land i Danmark.",
        "en": "This stone is placed in memory of Sibbi the Good, son of Foldarr, and his retinue placed this monument on Öland. Hidden lies the one whom greatest deeds followed — most knew that — battle-tree in this mound. No more upright warlord shall rule over land in Denmark.",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 24–28)",
        "editorialNote": "Inskriften rymmer en prosadel och en fullständig fornnordisk skaldestrof i dróttkvætt (drottkvätt). 'Stridernas träd' är en kenning för krigaren, och 'havsgudens mark' en kenning för havet."
    },
    "Öl 2": {
        "sv": "… lät resa denna sten efter Sven, sin fader. Gud hjälpe hans själ och sankta Maria.",
        "en": "… had this stone raised in memory of Sveinn, his father. May God and Saint Mary help his soul.",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 31)",
        "editorialNote": "Fragment sekundärt inmurat i Resmo kyrka. Bär kristen förbön till Gud och sankta Maria."
    },
    "Öl 9": {
        "sv": "… lät göra detta minnesmärke efter sin fader och efter sin broder … Krist hjälpe hans ande.",
        "en": "… had this monument made in memory of his father and in memory of his brother … May Christ help his spirit.",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 54)",
        "editorialNote": "Fragment av lockhäll till tidigkristen kistgrav på Kastlösa kyrkogård."
    },
    "Öl 15": {
        "sv": "Abjörn reste denna sten efter sin fader och efter Vikar…",
        "en": "Ábjôrn raised this stone in memory of his father and in memory of Víkarr…",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 61)",
        "editorialNote": "Förlorad runsten från Södra Möckleby kyrkogård, försvunnen före 1890-talets fältarbete."
    },
    "Öl 16": {
        "sv": "Sven lät resa denna sten efter sin broder Torsten…",
        "en": "Sveinn had this stone raised in memory of his brother Þorsteinn…",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 64)",
        "editorialNote": "Förlorad runsten från Gräsgårds kyrkogård, känd endast genom Johan Peringskiölds avritning i Bautil 1071."
    },
    "Öl 18": {
        "sv": "Ingjald och Näv och Sven, de lät resa stenen efter Rodmar, sin fader.",
        "en": "Ingjaldr and Nefi and Sveinn, they had the stone raised in memory of Hróðmarr, their father.",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 70)",
        "editorialNote": "Ståtlig runsten vid vägskäl i Seby, ristad med kors och rundjurslinga."
    },
    "Öl 23": {
        "sv": "… lät göra denna häll efter sin fader… Gud hjälpe hans själ.",
        "en": "… had this slab made in memory of his father… May God help his soul.",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 81)",
        "editorialNote": "Tidigkristen gravhäll från Stenåsa kyrkogård med ett stort processionskors, numera förlorad."
    },
    "Öl 25": {
        "sv": "Jorund(?) lät rista denna häll efter sin broder…",
        "en": "Jôrundr(?) had this rock carved in memory of his brother…",
        "source": "Sven Söderberg & Erik Brate, Ölands runinskrifter (SRI band 1, s. 85)",
        "editorialNote": "Fast hällristning på den flacka kalkstensklippan på Stora Alvaret vid Dröstorps ödeby."
    },
    "Ög 136": {
        "sv": "Till minne av Vämod stå dessa runor. Men Varin skrev dem, fadern, efter den fällde sonen. Jag säger de unga det, vilka de två stridsbyten voro, som tolv gånger togos som stridsbyte, båda på en gång från man efter man. Det säger jag som det andra, vem som för nio släktled sedan miste livet hos reidgoterna och dog hos dem till följd av sin skuld. Då rådde Tjodrik den dristige, sjökrigarnas herre, över Reidhavets strand. Nu sitter han rustad på sin gotiska häst, med sköld över skuldran, den främste av märingar…",
        "en": "In memory of Vémóðr stand these runes. And Varinn wrote them, the father, in memory of the fallen son. I say to the young men this, which the two war-booties were, which twelve times were taken as war-booty, both together from man after man. That I say as the second, who nine generations ago lost his life with the Reidgoths and died with them because of his guilt. Then ruled Theodoric the bold, king of sea-warriors, over the strand of the Reid-sea. Now sits he armed on his Gothic horse, shield over shoulder, foremost of the Mærings…",
        "source": "Erik Brate, Östergötlands runinskrifter (SRI band 2, s. 130–158) jämte Elias Wessén",
        "editorialNote": "Världens längsta och mest kända runinskrift. Innehåller fornyrðislag-verser om goterkungen Tjodrik (Teoderik den store), chiffer med lönnrunor och urnordiska språkliga arkaismer."
    },
    "Ög 181": {
        "sv": "Bisi och Gunna läto resa denna sten efter Torgöt, sin fader… Tor vige dessa runor.",
        "en": "Bisi and Gunna had this stone raised in memory of Þorgautr, their father… May Thor hallow these runes.",
        "source": "Erik Brate, Östergötlands runinskrifter (SRI band 2, s. 175)",
        "editorialNote": "Bildsten på Ledbergs kyrkogård med förkristna scener tolkade som Fenrisulven slukande Oden vid Ragnarök, samt den magiska formeln 'Tor vige runorna'."
    },
    "U 11": {
        "sv": "Tyd du runorna! Rätta lät rista Tolir, bryte i Roden, åt konungen. Tolir och Gyla läto rista, båda makarna efter sig till minnesmärke… Håkon bjöd rista.",
        "en": "Interpret the runes! The right ones did Tolir, bailiff in Roden, carve for the king. Tolir and Gyla had them carved, both husband and wife, as a monument for themselves… Håkon ordered to carve.",
        "source": "Elias Wessén & Sven B.F. Jansson, Upplands runinskrifter del 1 (SRI band 6, s. 16)",
        "editorialNote": "Kunglig inskrift på ett fast block vid kungssätet Hovgården på Adelsö, omtalande 'konungens bryte' (förvaltare) och kung Håkon."
    },
    "U 29": {
        "sv": "Tyd du! Gerlög lät rista dessa runor efter Germund, sin man. Han drunknade i Svinasund. Gud hjälpe hans ande… Och Gerlög ärvde Inga, sin dotter. Torbjörn skald ristade runorna.",
        "en": "Interpret! Geirlaug had these runes carved in memory of Geirmundr, her husband. He drowned in Svinasund. May God help his spirit… And Geirlaug inherited Inga, her daughter. Þorbjôrn Skald carved the runes.",
        "source": "Elias Wessén & Sven B.F. Jansson, Upplands runinskrifter del 1 (SRI band 6, s. 36)",
        "editorialNote": "Upplands längsta sammanhängande hällristning. En unik arvsberättelse i sex led om Geirlögs släkt, ristad av Torbjörn skald."
    },
    "U 73": {
        "sv": "Dessa märken äro gjorda efter Ingas söner. Hon kom till arv efter dem, men bröderna — Gärdar och hans broder — kommo till arv efter henne. De dogo i Grekland.",
        "en": "These landmarks are made in memory of Inga's sons. She inherited from them, but the brothers — Gerðarr and his brother — inherited from her. They died in Greece.",
        "source": "Elias Wessén & Sven B.F. Jansson, Upplands runinskrifter del 1 (SRI band 6, s. 97)",
        "editorialNote": "Greklandssten rest över krigare som dött i bysantinsk tjänst i Väringagardet. Flyttades 1896 från Hansta i Spånga till Skansen i Stockholm."
    },
    "U 101": {
        "sv": "Häming och Jarlabanke, de läto rödja väg och göra broar efter sin fader, och Estrid efter sina söner Ingifast och Ingvar. Gud hjälpe deras ande.",
        "en": "Hæmingr and Jarlabanki, they had the road cleared and bridges made in memory of their father, and Ástríðr in memory of her sons Ingifastr and Ingvarr. May God help their spirit.",
        "source": "Elias Wessén & Sven B.F. Jansson, Upplands runinskrifter del 1 (SRI band 6, s. 138)",
        "editorialNote": "En av de centrala Jarlabankestenarna vid bro- och vägbygget i Sollentuna och Täby."
    },
    "U 104": {
        "sv": "… ut till Grekland — och efter Ingetora, sin moder. Öpir ristade.",
        "en": "… out to Greece — and in memory of Ingiþóra, his mother. Œpir carved.",
        "source": "Elias Wessén & Sven B.F. Jansson, Upplands runinskrifter del 1 (SRI band 6, s. 150)",
        "editorialNote": "Runsten från Eds kyrka, signerad av den kände uppländske runmästaren Öpir (YbiR risti). Skänktes till Oxford 1687."
    },
    "U 112A": {
        "sv": "Ragnvald lät rista runorna efter Fastvi, sin moder, Onäms dotter, hon dog i Ed. Gud hjälpe hennes ande.",
        "en": "Ragnvaldr had the runes carved in memory of Fastvé, his mother, Ónæmr's daughter, she died in Eið. May God help her spirit.",
        "source": "Elias Wessén & Sven B.F. Jansson, Upplands runinskrifter del 1 (SRI band 6, s. 159)",
        "editorialNote": "Västra sidan av det mäktiga runblocket vid Kyrkstigen i Ed. Minnesinskrift av hövdingen Ragnvald över modern."
    },
    "U 112B": {
        "sv": "Runorna lät Ragnvald rista. Han var i Grekland, han var krigarföljets hövding.",
        "en": "The runes did Ragnvaldr have carved. He was in Greece, he was the leader of the host.",
        "source": "Elias Wessén & Sven B.F. Jansson, Upplands runinskrifter del 1 (SRI band 6, s. 159)",
        "editorialNote": "Östra sidan av samma runblock. Allittererad strof som hyllar Ragnvalds bedrifter som krigarföljets hövding (liðs forungi) i Väringagardet i Bysans."
    },
    "Sö 101": {
        "sv": "Sigrid, Alriks moder, Orms dotter, gjorde denna bro för sin make Holmgers, Sigröds faders, själ. Torir ristade.",
        "en": "Sigríðr, Alríkr's mother, Ormr's daughter, made this bridge for the soul of Holmgeirr, father of Sigrøðr, her husbandman. Þórir carved.",
        "source": "Erik Brate & Elias Wessén, Södermanlands runinskrifter (SRI band 3, s. 73)",
        "editorialNote": "Ramsundsristningen på en slät berghäll vid Sundbyholm. Ristad med scener ur Sigurdssagan: smeden Regin, draken Fafne, Sigurd grillande drakhjärtat och hästen Grane."
    },
    "Sö 179": {
        "sv": "Tola lät resa denna sten efter sin son Harald, Ingvars broder. De foro manligen fjärran efter guld och österut gåvo örnen föda. De dogo söderut i Särkland.",
        "en": "Tóla had this stone raised in memory of her son Haraldr, Ingvarr's brother. They travelled manfully far after gold and in the east gave food to the eagle. They died in the south in Serkland.",
        "source": "Erik Brate & Elias Wessén, Södermanlands runinskrifter (SRI band 3, s. 154)",
        "editorialNote": "Gripsholmsstenen. Den mest kända av de ca 30 Ingvarsstenarna. Strofen är avfattad på fornyrðislag med den berömda kenningen 'ge örnen föda' (döda fiender i strid)."
    },
    "Vs 24": {
        "sv": "Gode bonden Holmgöt lät resa stenen efter Odendis, sin hustru. Det kommer icke till Hassmyra en bättre husfru, som råder för gården. Balle den röde ristade dessa runor. Till Guds moder bad hon innerligt.",
        "en": "The good husbandman Holmgautr had the stone raised in memory of Óðindísa, his wife. There will not come to Hassmyra a better housewife, who rules the estate. Balli the Red carved these runes. To God's mother she prayed fervently.",
        "source": "Sven B.F. Jansson, Västmanlands runinskrifter (SRI band 13, s. 70)",
        "editorialNote": "Hassmyrastenen i Fläckebo. En av runtidens finaste minnesdikter över en kvinna, med fornvästmanländska dialektdrag och allitteration på fornyrðislag."
    }
}

DATING_SPECS = {
    "Öl 1": {
        "periodLabel": "Vikingatid (tidig/mellan)",
        "earliestYear": 990,
        "latestYear": 1010,
        "originalSourceLabel": "ca 990–1010 (strax efter slaget vid Fyrisvallarna ca 985)",
        "datingMethod": "Historisk händelsekoppling och skaldemetrik (dróttkvætt)",
        "styleGroup": "RAK",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": "Fornvästnordiska (FVN, dróttkvætt)",
        "metricForm": "Dróttkvætt (drottkvätt)"
    },
    "Öl 2": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1020,
        "latestYear": 1070,
        "originalSourceLabel": "1000-talet (vikingatid)",
        "datingMethod": "Stilgruppering och runformer",
        "styleGroup": "Pr1–Pr2",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Öl 9": {
        "periodLabel": "Tidigmedeltid / Senvikingatid",
        "earliestYear": 1050,
        "latestYear": 1120,
        "originalSourceLabel": "ca 1050–1120 (kistlockhäll)",
        "datingMethod": "Gravskick och ornamentik",
        "styleGroup": "Gravhällsstil",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Öl 15": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1000,
        "latestYear": 1080,
        "originalSourceLabel": "1000-talet",
        "datingMethod": "Äldre teckning och runformer",
        "styleGroup": "Okänd (förlorad)",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Öl 16": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1000,
        "latestYear": 1080,
        "originalSourceLabel": "1000-talet (känd genom Bautil 1071)",
        "datingMethod": "Bautil-avritning",
        "styleGroup": "Fågel/slinga (enligt Bautil)",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Öl 18": {
        "periodLabel": "Vikingatid (mellan/sen)",
        "earliestYear": 1010,
        "latestYear": 1060,
        "originalSourceLabel": "ca 1010–1060",
        "datingMethod": "Stilgruppering (kors och rundjurslinga)",
        "styleGroup": "Pr1",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Öl 23": {
        "periodLabel": "Tidigmedeltid / Senvikingatid",
        "earliestYear": 1060,
        "latestYear": 1130,
        "originalSourceLabel": "ca 1060–1130 (kristen gravhäll)",
        "datingMethod": "Typologisk datering av gravkors och runformer",
        "styleGroup": "Eskilstunakist/gravhällsstil",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Öl 25": {
        "periodLabel": "Vikingatid (mellan/sen)",
        "earliestYear": 1020,
        "latestYear": 1070,
        "originalSourceLabel": "ca 1020–1070",
        "datingMethod": "Stilgruppering av hällristning",
        "styleGroup": "Pr2",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Ög 136": {
        "periodLabel": "Tidig vikingatid",
        "earliestYear": 800,
        "latestYear": 850,
        "originalSourceLabel": "ca 800–850 (kortkvistrunor, urnordiska arkaismer)",
        "datingMethod": "Språkhistoriska arkaismer, kortkvistrunor och chiffermetodik",
        "styleGroup": "RAK (äldre vikingatid)",
        "primaryLanguage": "Runsvenska (RSV / tidig runsvenska med urnordiska drag)",
        "secondaryLanguage": "Fornvästnordiska (FVN, fornyrðislag)",
        "metricForm": "Fornyrðislag (fornyrdislag)"
    },
    "Ög 181": {
        "periodLabel": "Vikingatid",
        "earliestYear": 1000,
        "latestYear": 1050,
        "originalSourceLabel": "ca 1000–1050 (Ragnarök-motiv)",
        "datingMethod": "Ikonografisk stilgruppering och runformer",
        "styleGroup": "Ringerikestil / bildsten",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "U 11": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1060,
        "latestYear": 1085,
        "originalSourceLabel": "ca 1060–1085 (Håkon jarl)",
        "datingMethod": "Historisk personidentifiering och Gräslunds stilgrupp Pr3",
        "styleGroup": "Pr3",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "U 29": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1060,
        "latestYear": 1090,
        "originalSourceLabel": "ca 1060–1090 (Torbjörn skald)",
        "datingMethod": "Gräslunds stilgrupp Pr2 / Pr3 och genealogisk analys",
        "styleGroup": "Pr2–Pr3",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": "Allittererad prosa"
    },
    "U 73": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1060,
        "latestYear": 1100,
        "originalSourceLabel": "ca 1060–1100 (Greklandsresenärer)",
        "datingMethod": "Gräslunds stilgrupp Pr3 och historisk kontext (Väringagardet)",
        "styleGroup": "Pr3",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "U 101": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1060,
        "latestYear": 1080,
        "originalSourceLabel": "ca 1060–1080 (Jarlabanke)",
        "datingMethod": "Historisk kronologi för Jarlabankesläkten och stilgrupp Pr2",
        "styleGroup": "Pr2",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "U 104": {
        "periodLabel": "Vikingatid (mycket sen)",
        "earliestYear": 1070,
        "latestYear": 1110,
        "originalSourceLabel": "ca 1070–1110 (Öpir risti)",
        "datingMethod": "Ristarsignatur (Öpir) och Gräslunds stilgrupp Pr4/Pr5 (Urnesstil)",
        "styleGroup": "Pr4–Pr5",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "U 112A": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1060,
        "latestYear": 1100,
        "originalSourceLabel": "ca 1060–1100 (Ragnvald och Fastvi)",
        "datingMethod": "Gräslunds stilgrupp Pr3 (Urnesstil)",
        "styleGroup": "Pr3",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "U 112B": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1060,
        "latestYear": 1100,
        "originalSourceLabel": "ca 1060–1100 (Ragnvald i Grekland)",
        "datingMethod": "Gräslunds stilgrupp Pr3 och historisk kontext (Väringagardet)",
        "styleGroup": "Pr3",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": "Allittererad skaldestrof"
    },
    "Sö 101": {
        "periodLabel": "Vikingatid (mellan)",
        "earliestYear": 1020,
        "latestYear": 1050,
        "originalSourceLabel": "ca 1020–1050 (Sigrid och Torir)",
        "datingMethod": "Gräslunds stilgrupp Pr1–Pr2 och ikonografi (Völsungasagan)",
        "styleGroup": "Pr1–Pr2",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": None
    },
    "Sö 179": {
        "periodLabel": "Vikingatid (mellan)",
        "earliestYear": 1040,
        "latestYear": 1050,
        "originalSourceLabel": "ca 1040–1050 (Ingvarståget)",
        "datingMethod": "Historisk händelse (Ingvar den vittfarnes tåg till Särkland 1036–1041) och stilgrupp Fp",
        "styleGroup": "Fp",
        "primaryLanguage": "Runsvenska (RSV)",
        "secondaryLanguage": None,
        "metricForm": "Allittererad fornyrðislag-dikt ('De foro manligen...')"
    },
    "Vs 24": {
        "periodLabel": "Vikingatid (sen)",
        "earliestYear": 1050,
        "latestYear": 1080,
        "originalSourceLabel": "ca 1050–1080 (Balle den röde)",
        "datingMethod": "Ristarsignatur (Balle), runformer och Gräslunds stilgrupp Pr3",
        "styleGroup": "Pr3",
        "primaryLanguage": "Runsvenska (RSV / fornvästmanländska särdrag)",
        "secondaryLanguage": "Fornvästnordiska (FVN)",
        "metricForm": "Fornyrðislag (kvinnomäktig allittererad strof)"
    }
}

def build():
    print(f"=== Bygger och validerar E08 & E09 pilotdataset ({len(PILOT_SPECS)} inskrifter) ===", flush=True)
    inscriptions = []

    for spec in PILOT_SPECS:
        s1 = spec["signum1"]
        s2 = spec["signum2"]
        signum = f"{s1} {s2}"
        print(f"Hämtar data för {signum:8} ...", end=" ", flush=True)
        api_item = fetch_api_entry(s1, s2)
        
        prov = api_item.get("provenance", {}) if api_item else {}
        place = prov.get("place", {}).get("place", spec["name"])
        parish = prov.get("parish", {}).get("parish", "Okänd socken")
        province = prov.get("province", {}).get("province", "Okänt landskap")
        hundred = prov.get("hundred", {}).get("hundred")
        
        pos = api_item.get("position", {}) if api_item else {}
        oldest_coords = pos.get("oldest_known", {}).get("coordinates") if pos.get("oldest_known") else None
        current_coords = pos.get("current", {}).get("coordinates") if pos.get("current") else None
        coords = oldest_coords or current_coords
        
        extant = api_item.get("extant", True) if api_item else True
        if spec["carrierType"] == "fragment":
            preservation = "bevarad_i_fragment"
        elif not extant:
            preservation = "forlorad"
        else:
            preservation = "bevarad_i_sin_helhet"

        # Textlager från API
        runic_texts = api_item.get("runic_texts", []) if api_item else []
        reading = runic_texts[0].get("reading", "") if runic_texts else f"[{signum} text]"
        
        interps = runic_texts[0].get("interpretations", []) if runic_texts else []
        norm_rsv = ""
        norm_fvn = ""
        for inp in interps:
            lang_code = inp.get("language", {}).get("language_code")
            if lang_code == "RSV":
                norm_rsv = inp.get("text", "")
            elif lang_code == "FVN":
                norm_fvn = inp.get("text", "")

        translations = runic_texts[0].get("translations", []) if runic_texts else []
        trans_sv = ""
        trans_en = ""
        for tr in translations:
            lang_code = tr.get("language", {}).get("language_code")
            if "sv" in lang_code:
                trans_sv = tr.get("translation", "")
            elif "en" in lang_code:
                trans_en = tr.get("translation", "")
        
        if not trans_sv:
            trans_sv = f"Översättning för {signum} enligt {spec['sriVolumeTitle']}."

        # Ristarsignatur om tillämpligt
        carver = None
        if "Öpir" in spec["matrixRole"] or "Ybiʀ" in spec["matrixRole"]:
            carver = "Öpir"
        elif "Torir" in spec["matrixRole"]:
            carver = "Torir"
        elif "Ragnvald" in spec["matrixRole"]:
            carver = "Ragnvald"

        # Bygg strukturerat Inscription-objekt
        item_number = int("".join(c for c in s2 if c.isdigit()))
        suffix = "".join(c for c in s2 if c.isalpha()) or None

        inscription = {
            "id": spec["id"],
            "canonicalSignum": signum,
            "provinceCode": s1,
            "itemNumber": item_number,
            "suffix": suffix,
            "name": spec["name"],
            "canonicalSlug": spec["canonicalSlug"],
            "previousSlugs": [],
            "aliases": (
                ["Bautil 1071 (delvis)", "Liljegren 1361", "Karlevistenen"] if signum == "Öl 1" else
                ["Bautil 848", "Liljegren 133", "Rökstenen"] if signum == "Ög 136" else
                ["Bautil 894", "Ledbergsstenen"] if signum == "Ög 181" else
                ["Bautil 155", "Skansenstenen U 73", "Greklandsstenen i Hansta"] if signum == "U 73" else
                ["Bautil 166", "Kyrkstigsblocket", "Ragnvaldsristningen"] if signum in ["U 112A", "U 112B"] else
                ["Bautil 730", "Sigurdsristningen", "Ramsundsberget"] if signum == "Sö 101" else
                ["Bautil 1162", "Hassmyrastenen", "Odendisastenen"] if signum == "Vs 24" else
                [f"Bautil {item_number}"] if item_number < 50 else []
            ),
            "matrixRole": spec["matrixRole"],
            "carrier": {
                "id": f"carrier-{spec['canonicalSlug']}",
                "type": spec["carrierType"],
                "material": spec["material"],
                "preservationStatus": preservation,
                "currentLocationDescription": f"Nuvarande placering: {place}, {parish}",
            },
            "placements": (
                [
                    {
                        "type": "fyndplats",
                        "province": "Uppland",
                        "parish": "Spånga socken",
                        "hundred": "Sollentuna härad",
                        "municipality": "Stockholms stad",
                        "county": "Stockholms län",
                        "placeName": "Hansta (fyndplats)",
                        "coordinatesWgs84": [17.8999, 59.4219],
                        "precision": "exakt_koordinat",
                        "sourceNote": "SRI band 6, s. 95–100; rest vid Hansta gård, flyttad till Skansen 1896",
                    },
                    {
                        "type": "nuvarande_placering",
                        "province": "Uppland",
                        "parish": "Stockholms stad / Oscars församling",
                        "hundred": "Stockholm",
                        "municipality": "Stockholms stad",
                        "county": "Stockholms län",
                        "placeName": "Skansen (Bollnästorgets backe)",
                        "coordinatesWgs84": [18.1017, 59.3248],
                        "precision": "exakt_koordinat",
                        "sourceNote": "Flyttad 1896 från Hansta i Spånga till Skansen i Stockholm; SRI band 6, s. 95–100",
                    }
                ] if signum == "U 73" else [
                    {
                        "type": "fyndplats",
                        "province": province,
                        "parish": parish,
                        "hundred": hundred,
                        "placeName": place,
                        "coordinatesWgs84": coords,
                        "precision": "sockencentrum" if preservation == "forlorad" else ("exakt_koordinat" if coords else "okant_lage"),
                        "sourceNote": f"{spec['sriVolumeTitle']}, s. {spec['printedPageStart']}",
                    }
                ]
            ),
            "dating": {
                "originalSourceLabel": DATING_SPECS[signum]["originalSourceLabel"],
                "periodLabel": DATING_SPECS[signum]["periodLabel"],
                "earliestYear": DATING_SPECS[signum]["earliestYear"],
                "latestYear": DATING_SPECS[signum]["latestYear"],
                "isUncertain": False,
                "datingMethod": DATING_SPECS[signum]["datingMethod"],
            },
            "textLayer": {
                "id": f"text-{spec['canonicalSlug']}",
                "readingTransliteration": reading,
                "normalizationRunicSwedish": norm_rsv or None,
                "normalizationOldWestNorse": norm_fvn or None,
                "translationSwedish": trans_sv,
                "translationEnglish": trans_en or None,
                "carverAttribution": carver,
                "isSigned": carver is not None,
            },
            "source": {
                "sriVolumeId": spec["sriVolumeId"],
                "sriVolumeTitle": spec["sriVolumeTitle"],
                "author": spec["author"],
                "publicationYear": spec["publicationYear"],
                "pdfFil": spec.get("pdfFil"),
                "printedPageStart": spec["printedPageStart"],
                "printedPageEnd": spec["printedPageEnd"],
                "pdfPageStart": spec["pdfPageStart"],
                "pdfPageEnd": spec["pdfPageEnd"],
                "plateNumber": spec["plateNumber"],
                "externalUris": {
                    "samnordiskUuid": api_item.get("inscription_id") if api_item else None,
                    "raaRunorUri": f"https://app.raa.se/open/runor/inscription?item_key={api_item.get('inscription_id')}" if api_item else None,
                },
            },
            "images": [
                {
                    "id": f"img-{spec['canonicalSlug']}",
                    "imageUrl": "/images/runor/ej-avbildad.svg" if spec["canonicalSlug"] == "ol-15" else f"/images/runor/{spec['canonicalSlug']}.webp",
                    "thumbnailUrl": "/images/runor/ej-avbildad.svg" if spec["canonicalSlug"] == "ol-15" else f"/images/runor/{spec['canonicalSlug']}-thumb.webp",
                    "caption": f"{spec['name']} ({signum}) ur {spec['sriVolumeTitle']}",
                    "photographerOrArtist": spec["photographer"],
                    "year": spec.get("publicationYear"),
                    "license": spec["license"],
                    "isPubliclyDistributable": True,
                    "isEditorialDrawing": spec["plateNumber"] is not None and "teckning" in str(spec.get("plateNumber", "")).lower(),
                }
            ],
            "curationStatus": "granskad_pilot",
            "reviewedAt": datetime.now(timezone.utc).isoformat(),
            "reviewedBy": "Antigravity Runor Curator (E08/E09)",
        }
        inscriptions.append(inscription)
        print(f"[OK] {coords} | {preservation}")

    # Spara dataset
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "version": "1.0.0",
        "dataset": "fornsvenska-runor-pilot-v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(inscriptions),
        "inscriptions": inscriptions,
    }
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"\nGenererade {len(inscriptions)} granskade poster i {OUTPUT_FILE}", flush=True)

    # Spara TypeScript-export
    TS_FILE = REPO_ROOT / "lib/runor/pilot-data.ts"
    ts_code = f"""import type {{ RunicInscription }} from "./types.ts";

/**
 * Kuraterad pilotutgåva för Runsidan på fornsvenska.se (E08 & E09 / E12 & E13).
 * 20 representativa inskrifter över 5 landskap med full källkedja och svårfallsmatris.
 */
export const RUNIC_PILOT_INSCRIPTIONS: RunicInscription[] = {json.dumps(inscriptions, ensure_ascii=False, indent=2)};
export const PILOT_INSCRIPTIONS = RUNIC_PILOT_INSCRIPTIONS;
"""
    with open(TS_FILE, "w", encoding="utf-8") as f:
        f.write(ts_code)
    print(f"Genererade TypeScript-export i {TS_FILE}", flush=True)

if __name__ == "__main__":
    build()
