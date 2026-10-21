#!/usr/bin/env python3
"""E04: Verifiera åtkomst till geografisk kompletteringsdata.

Hämtar 10 provobjekt ur RAÄ Runor API / Samnordisk runtextdatabas:
1. Öl 1 (Karlevistenen, Öland)
2. Ög 136 (Rökstenen, Östergötland)
3. U 11 (Hovgårdsstenen, Uppland)
4. U 112 (Ed / Jarlabanke, Uppland)
5. Sö 101 (Ramsundsristningen, Södermanland)
6. Sö 179 (Gripsholmsstenen / Ingvarssten, Södermanland)
7. Vg 181 (Flistad, Västergötland)
8. Sm 35 (Replösa, Småland)
9. Vs 24 (Hassmyra / Odendisa, Västmanland)
10. Öl 15 (Kastlösa kyrkogård, Öland - förlorad/fragment)

Sparar råexport till docs/runor/provdata-e04.json.
"""
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
OUTPUT_FILE = ROOT / "docs/runor/provdata-e04.json"

TARGET_SIGNA = [
    ("Öl", "1"),
    ("Ög", "136"),
    ("U", "11"),
    ("U", "112"),
    ("Sö", "101"),
    ("Sö", "179"),
    ("Vg", "181"),
    ("Sm", "35"),
    ("Vs", "24"),
    ("Öl", "15"),
]

def fetch_signum(s1: str, s2: str):
    query = f"{s1} {s2}"
    url = f"https://runor.raa.se/api/snrd/search?edition_id=latest&search_field=SIGNUM&matching_text={quote(query)}"
    cmd = ["curl", "-s", "--max-time", "15", url]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    items = json.loads(res.stdout)
    # Hitta exakt matchning för signum1 och signum2
    for item in items:
        if item.get("signum1") == s1 and item.get("signum2") == s2:
            return item
    # Om ingen exakt träff, ta första som börjar med s1 och s2
    for item in items:
        if item.get("signum1") == s1 and s2 in item.get("signum2", ""):
            return item
    raise ValueError(f"Kunde inte hitta {s1} {s2} i svaret från API:et")

def main():
    print(f"=== E04: Hämtar {len(TARGET_SIGNA)} provobjekt från RAÄ Runor API ===", flush=True)
    results = []

    for s1, s2 in TARGET_SIGNA:
        signum = f"{s1} {s2}"
        try:
            item = fetch_signum(s1, s2)
            prov = item.get("provenance", {})
            place = prov.get("place", {}).get("place", "Okänd plats")
            parish = prov.get("parish", {}).get("parish", "Okänd socken")
            province = prov.get("province", {}).get("province", "Okänt landskap")
            pos = item.get("position", {})
            coords = pos.get("oldest_known") or pos.get("current")
            extant = item.get("extant")
            
            summary = {
                "signum": signum,
                "inscription_id": item.get("inscription_id"),
                "province": province,
                "parish": parish,
                "place": place,
                "extant": extant,
                "position_oldest_known": pos.get("oldest_known"),
                "position_current": pos.get("current"),
                "coordinates_wgs84": coords.get("coordinates") if coords else None,
                "raw_api_item": item,
            }
            results.append(summary)
            print(f"  [OK] {signum:8} -> {province}, {parish} ({place}) | Koord: {summary['coordinates_wgs84']} | Bevarad: {extant}", flush=True)
        except Exception as e:
            print(f"  [FEL] {signum}: {e}", file=sys.stderr)

    if len(results) < 10:
        print(f"FEL: Endast {len(results)} av 10 objekt hämtades!", file=sys.stderr)
        sys.exit(1)

    export_payload = {
        "source": "https://runor.raa.se/api/snrd/",
        "edition_id": "latest",
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "count": len(results),
        "items": results,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(export_payload, f, ensure_ascii=False, indent=2)

    print(f"\nSparade {len(results)} provobjekt till {OUTPUT_FILE}", flush=True)
    print("=== E04: Åtkomst till geografisk data VERIFIERAD ===", flush=True)

if __name__ == "__main__":
    main()
