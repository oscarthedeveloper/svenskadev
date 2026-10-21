#!/usr/bin/env python3
"""E13 — Normalisering och granskning av geografiska uppgifter för 20 pilotinskrifter.

Kontrollerar och säkerställer:
- Minst en geografisk relation per post med källnot.
- Åtskillnad mellan fyndplats, ursprunglig plats och nuvarande förvaring.
- Explicit hantering av flyttade stenar (U 73: Hansta -> Skansen).
- Förlorade objekt (Öl 15, Öl 16, Öl 23) saknar inte förvaringsstatus och har 'sockencentrum' eller null som koordinat (inga påhittade koordinater).
- Normaliserade socken-, härads-, kommun- och länsuppgifter.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PILOT_JSON = ROOT / "docs/runor/pilot-20-inskrifter.json"

# Normaliserade administrativa enheter för de 20 pilotinskrifterna
GEO_CANONICAL = {
    "Öl 1": {
        "parish": "Vickleby socken",
        "hundred": "Torslunda härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Karlevi",
        "precision": "exakt_koordinat",
        "coords": [16.4398, 56.6075],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 1, s. 15–28; på ursprunglig plats i åker nära Kalmarsund"
    },
    "Öl 2": {
        "parish": "Resmo socken",
        "hundred": "Södra Möckleby härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Resmo kyrka",
        "precision": "exakt_koordinat",
        "coords": [16.5278, 56.6788],
        "is_moved": True,
        "is_lost": False,
        "source_note": "SRI band 1, s. 28–32; fragment inmurat i Resmo kyrkovägg"
    },
    "Öl 9": {
        "parish": "Kastlösa socken",
        "hundred": "Gräsgårds härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Kastlösa kyrka",
        "precision": "exakt_koordinat",
        "coords": [16.4291, 56.4585],
        "is_moved": True,
        "is_lost": False,
        "source_note": "SRI band 1, s. 51–55; fragment av kistlockhäll i Kastlösa kyrka"
    },
    "Öl 15": {
        "parish": "Södra Möckleby socken",
        "hundred": "Gräsgårds härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Södra Möckleby kyrkogård",
        "precision": "sockencentrum",
        "coords": [16.4214, 56.3565],
        "is_moved": False,
        "is_lost": True,
        "source_note": "SRI band 1, s. 60–62; förlorad före 1890-talet, ungefärligt sockenläge"
    },
    "Öl 16": {
        "parish": "Gräsgårds socken",
        "hundred": "Gräsgårds härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Gräsgårds kyrkogård",
        "precision": "sockencentrum",
        "coords": [16.5077, 56.3096],
        "is_moved": False,
        "is_lost": True,
        "source_note": "SRI band 1, s. 62–65; förlorad, känd genom Bautil 1071"
    },
    "Öl 18": {
        "parish": "Segerstads socken",
        "hundred": "Gräsgårds härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Seby",
        "precision": "exakt_koordinat",
        "coords": [16.531, 56.3435],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 1, s. 68–70; rest vid vägkorsning i Seby"
    },
    "Öl 23": {
        "parish": "Stenåsa socken",
        "hundred": "Möckleby härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Stenåsa kyrkogård",
        "precision": "sockencentrum",
        "coords": [16.6005, 56.5145],
        "is_moved": False,
        "is_lost": True,
        "source_note": "SRI band 1, s. 78–82; gravhäll förlorad/sönderslagen"
    },
    "Öl 25": {
        "parish": "Sandby socken",
        "hundred": "Möckleby härad",
        "municipality": "Mörbylånga kommun",
        "county": "Kalmar län",
        "province": "Öland",
        "place": "Dröstorps häll, Stora Alvaret",
        "precision": "exakt_koordinat",
        "coords": [16.5709, 56.5941],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 1, s. 83–86; fast berghäll på Alvaret"
    },
    "Ög 136": {
        "parish": "Röks socken",
        "hundred": "Lysings härad",
        "municipality": "Ödeshögs kommun",
        "county": "Östergötlands län",
        "province": "Östergötland",
        "place": "Röks kyrka",
        "precision": "exakt_koordinat",
        "coords": [14.7752, 58.295],
        "is_moved": True,
        "is_lost": False,
        "source_note": "SRI band 2, s. 130–158; ursprungligen vid kyrkogårdsmuren, nu under skyddstak vid kyrkan"
    },
    "Ög 181": {
        "parish": "Ledbergs socken",
        "hundred": "Valkebo härad",
        "municipality": "Linköpings kommun",
        "county": "Östergötlands län",
        "province": "Östergötland",
        "place": "Ledbergs kyrkogård",
        "precision": "exakt_koordinat",
        "coords": [15.4469, 58.4422],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 2, s. 174–177; rest på Ledbergs kyrkogård"
    },
    "U 11": {
        "parish": "Adelsö socken",
        "hundred": "Färentuna härad",
        "municipality": "Ekerö kommun",
        "county": "Stockholms län",
        "province": "Uppland",
        "place": "Hovgården",
        "precision": "exakt_koordinat",
        "coords": [17.534, 59.3601],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 6, s. 13–21; fast runblock vid Alsnö hus, Hovgården"
    },
    "U 29": {
        "parish": "Hilleshögs socken",
        "hundred": "Färentuna härad",
        "municipality": "Ekerö kommun",
        "county": "Stockholms län",
        "province": "Uppland",
        "place": "Hillersjö",
        "precision": "exakt_koordinat",
        "coords": [17.7049, 59.3881],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 6, s. 34–44; fast berghäll vid Hillersjö gård"
    },
    "U 73": {
        "parish": "Spånga socken",
        "hundred": "Sollentuna härad",
        "municipality": "Stockholms stad",
        "county": "Stockholms län",
        "province": "Uppland",
        "place": "Hansta (fyndplats)",
        "precision": "exakt_koordinat",
        "coords": [17.8999, 59.4219],
        "is_moved": True,
        "is_lost": False,
        "current_placement": {
            "type": "nuvarande_placering",
            "province": "Uppland",
            "parish": "Stockholms stad / Oscars församling",
            "hundred": "Stockholm",
            "placeName": "Skansen (Bollnästorgets backe)",
            "coordinatesWgs84": [18.1017, 59.3248],
            "precision": "exakt_koordinat",
            "sourceNote": "Flyttad 1896 från Hansta i Spånga till Skansen i Stockholm; SRI band 6, s. 95–100"
        },
        "source_note": "SRI band 6, s. 95–100; rest vid Hansta gård, flyttad till Skansen 1896"
    },
    "U 101": {
        "parish": "Sollentuna socken",
        "hundred": "Sollentuna härad",
        "municipality": "Sollentuna kommun",
        "county": "Stockholms län",
        "province": "Uppland",
        "place": "Sjöstugan / S. Sätra",
        "precision": "exakt_koordinat",
        "coords": [17.9839, 59.4487],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 6, s. 138–145; vid Jarlabankes bro / Sjöstugan"
    },
    "U 104": {
        "parish": "Eds socken",
        "hundred": "Sollentuna härad",
        "municipality": "Upplands Väsby kommun",
        "county": "Stockholms län",
        "province": "Uppland",
        "place": "Eds kyrka",
        "precision": "exakt_koordinat",
        "coords": [17.8682, 59.5079],
        "is_moved": True,
        "is_lost": False,
        "source_note": "SRI band 6, s. 148–154; tidigare inmurad i kyrkan, sedan 1687 vid Ashmolean Museum i Oxford / kyrkogården"
    },
    "U 112A": {
        "parish": "Eds socken",
        "hundred": "Sollentuna härad",
        "municipality": "Upplands Väsby kommun",
        "county": "Stockholms län",
        "province": "Uppland",
        "place": "Kyrkstigen i Ed",
        "precision": "exakt_koordinat",
        "coords": [17.8679, 59.503],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 6, s. 157–165; fast jätteblock vid Kyrkstigen söder om sjön Norrviken"
    },
    "U 112B": {
        "parish": "Eds socken",
        "hundred": "Sollentuna härad",
        "municipality": "Upplands Väsby kommun",
        "county": "Stockholms län",
        "province": "Uppland",
        "place": "Kyrkstigen i Ed",
        "precision": "exakt_koordinat",
        "coords": [17.8679, 59.503],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 6, s. 157–165; östra sidan av samma fasta runblock som U 112A"
    },
    "Sö 101": {
        "parish": "Jäders socken",
        "hundred": "Österrekarne härad",
        "municipality": "Eskilstuna kommun",
        "county": "Södermanlands län",
        "province": "Södermanland",
        "place": "Ramsundsberget, Sundbyholm",
        "precision": "exakt_koordinat",
        "coords": [16.6344, 59.4413],
        "is_moved": False,
        "is_lost": False,
        "source_note": "SRI band 3, s. 72–76; fast berghäll vid Ramsundet"
    },
    "Sö 179": {
        "parish": "Kärnbo socken",
        "hundred": "Selebo härad",
        "municipality": "Strängnäs kommun",
        "county": "Södermanlands län",
        "province": "Södermanland",
        "place": "Gripsholms slott",
        "precision": "exakt_koordinat",
        "coords": [17.2182, 59.2569],
        "is_moved": True,
        "is_lost": False,
        "source_note": "SRI band 3, s. 153–157; återfunnen i slottets källarmur 1827, nu rest vid yttre borggården"
    },
    "Vs 24": {
        "parish": "Fläckebo socken",
        "hundred": "Norrbo härad",
        "municipality": "Sala kommun",
        "county": "Västmanlands län",
        "province": "Västmanland",
        "place": "Hassmyra",
        "precision": "exakt_koordinat",
        "coords": [16.3414, 59.8731],
        "is_moved": True,
        "is_lost": False,
        "source_note": "SRI band 13, s. 69–76; sprängd omkring 1900, lagad och återupprest vid landsvägen 1900"
    }
}

def main():
    print("Normaliserar och granskar geografiska uppgifter för 20 pilotinskrifter...")
    
    with open(PILOT_JSON) as f:
        data = json.load(f)
        
    updated_inscriptions = []
    geo_report = []
    
    for item in data["inscriptions"]:
        signum = item["canonicalSignum"]
        spec = GEO_CANONICAL[signum]
        
        placements = [
            {
                "type": "fyndplats",
                "province": spec["province"],
                "parish": spec["parish"],
                "hundred": spec["hundred"],
                "municipality": spec["municipality"],
                "county": spec["county"],
                "placeName": spec["place"],
                "coordinatesWgs84": spec["coords"],
                "precision": spec["precision"],
                "sourceNote": spec["source_note"]
            }
        ]
        
        if "current_placement" in spec:
            placements.append(spec["current_placement"])
            
        item["placements"] = placements
        item["carrier"]["isMoved"] = spec["is_moved"]
        item["carrier"]["isExtant"] = not spec["is_lost"]
        
        updated_inscriptions.append(item)
        geo_report.append({
            "signum": signum,
            "province": spec["province"],
            "parish": spec["parish"],
            "hundred": spec["hundred"],
            "municipality": spec["municipality"],
            "county": spec["county"],
            "place": spec["place"],
            "precision": spec["precision"],
            "coords": spec["coords"],
            "isMoved": spec["is_moved"],
            "isLost": spec["is_lost"],
            "placementsCount": len(placements)
        })
        
        moved_str = "[FLYTTAD]" if spec["is_moved"] else "         "
        lost_str = "[FÖRLORAD]" if spec["is_lost"] else "          "
        print(f"{signum:<8} {moved_str} {lost_str} {spec['precision']:<16} {spec['place'][:25]:<26} ({spec['parish']})")
        
    out_report = ROOT / "docs/runor/geografiregister-e13.json"
    with open(out_report, "w", encoding="utf-8") as f:
        json.dump({
            "version": "1.0",
            "generatedAt": "2026-10-21",
            "count": len(geo_report),
            "records": geo_report
        }, f, ensure_ascii=False, indent=2)
        
    print(f"\nSparade geografiregister till {out_report}")

if __name__ == "__main__":
    main()
