#!/usr/bin/env python3
"""
Etapp E17: Fullständigt gransknings- och revisionsskript för M2 (Betrodd innehållspilot).
Granskar samtliga 20 pilotposter mot kraven i RUNSIDA_PLAN.md Avsnitt 9.2.
Verifierar det låsta 20 %-kontrollurvalet (Öl 15, U 73, U 112B, Vs 24).
"""

import json
import os
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
PILOT_JSON = os.path.join(REPO_ROOT, "docs/runor/pilot-20-inskrifter.json")
MANIFEST_JSON = os.path.join(REPO_ROOT, "docs/runor/bildmanifest-e16.json")
PUBLIC_DIR = os.path.join(REPO_ROOT, "public")

LOCKED_SAMPLE = ["Öl 15", "U 73", "U 112B", "Vs 24"]

def main():
    print("=== E17: Fullständig revisionsgranskning av M2 Pilotdataset ===")
    
    if not os.path.exists(PILOT_JSON):
        print(f"FEL: {PILOT_JSON} saknas!", file=sys.stderr)
        sys.exit(1)
        
    with open(PILOT_JSON, "r", encoding="utf-8") as f:
        pilot = json.load(f)
        
    with open(MANIFEST_JSON, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    inscriptions = pilot.get("inscriptions", [])
    if len(inscriptions) != 20:
        print(f"FEL: Antal inskrifter är {len(inscriptions)}, förväntat 20!", file=sys.stderr)
        sys.exit(1)

    errors = []
    audit_log = []

    print(f"Granskar {len(inscriptions)} inskrifter mot Avsnitt 9.2...")

    for insc in inscriptions:
        signum = insc.get("canonicalSignum", "Okänt")
        slug = insc.get("canonicalSlug", "")
        
        # 1. Identitet
        if not signum or not slug:
            errors.append(f"[{signum}]: Saknar signum eller slug")
        if not insc.get("id"):
            errors.append(f"[{signum}]: Saknar stabilt id")
        if not insc.get("carrier"):
            errors.append(f"[{signum}]: Saknar carrier")
            
        # 2. Källkedja
        source = insc.get("source", {})
        if (
            not source.get("sriVolumeId")
            or not source.get("sriVolumeTitle")
            or not source.get("pdfFil")
            or source.get("printedPageStart") is None
            or source.get("pdfPageStart") is None
        ):
            errors.append(f"[{signum}]: Ofullständig källkedja (saknar sriVolumeId, pdfFil eller sidor)")
            
        # 3. Plats & geografi
        placements = insc.get("placements", [])
        if not placements:
            errors.append(f"[{signum}]: Saknar placering")
        for p in placements:
            coords = p.get("coordinatesWgs84")
            if coords:
                lon, lat = coords
                if not (8.0 <= lon <= 26.0 and 54.0 <= lat <= 71.0):
                    errors.append(f"[{signum}]: Koordinater [{lon}, {lat}] ligger utanför Norden")
            if p.get("precision") not in ["exakt_koordinat", "sockencentrum", "haradscentrum", "okant_lage"]:
                errors.append(f"[{signum}]: Ogiltig precisionsangivelse: {p.get('precision')}")
                
        # 4. Datering
        dating = insc.get("dating", {})
        earliest = dating.get("earliestYear")
        latest = dating.get("latestYear")
        if earliest is not None and latest is not None and earliest > latest:
            errors.append(f"[{signum}]: Inverterat dateringsintervall {earliest} > {latest}")
            
        # 5. Textlager
        text = insc.get("textLayer", {})
        if not text.get("readingTransliteration") or not text.get("translationSwedish"):
            errors.append(f"[{signum}]: Saknar readingTransliteration eller translationSwedish")
            
        # 6. Bilder
        images = insc.get("images", [])
        if not images:
            errors.append(f"[{signum}]: Saknar bildpost")
        for img in images:
            if not img.get("license") or img.get("license") != "Public Domain":
                errors.append(f"[{signum}]: Bild saknar Public Domain-licens")
            img_url = img.get("imageUrl", "")
            disk_path = os.path.join(PUBLIC_DIR, img_url.lstrip("/"))
            if not os.path.exists(disk_path):
                errors.append(f"[{signum}]: Bildfil saknas på disk: {disk_path}")
            thumb_url = img.get("thumbnailUrl", "")
            thumb_disk = os.path.join(PUBLIC_DIR, thumb_url.lstrip("/"))
            if not os.path.exists(thumb_disk):
                errors.append(f"[{signum}]: Tumnagel saknas på disk: {thumb_disk}")
                
        audit_log.append({
            "signum": signum,
            "slug": slug,
            "carrierType": insc["carrier"]["type"],
            "placements": len(placements),
            "dating": f"{dating.get('earliestYear')}–{dating.get('latestYear')} ({dating.get('styleGroup')})",
            "hasTranslation": bool(text.get("translationSwedish")),
            "imageOk": True,
            "lockedControl": signum in LOCKED_SAMPLE
        })

    # Kontrollurval
    print("\nGranskar det låsta 20 %-kontrollurvalet:")
    for lsignum in LOCKED_SAMPLE:
        item = next((i for i in inscriptions if i["canonicalSignum"] == lsignum), None)
        if not item:
            errors.append(f"Saknar kontrollpost: {lsignum}")
            continue
        if lsignum == "Öl 15":
            assert item["carrier"]["preservationStatus"] == "forlorad"
            assert item["placements"][0]["precision"] == "sockencentrum"
            assert item["images"][0]["imageUrl"] == "/images/runor/ej-avbildad.svg"
            print(f"  [PASS] Öl 15: förlorad, sockencentrum, ej-avbildad placeholder")
        elif lsignum == "U 73":
            assert len(item["placements"]) == 2
            assert item["placements"][0]["type"] == "fyndplats"
            assert item["placements"][1]["type"] == "nuvarande_placering"
            print(f"  [PASS] U 73: 2 placeringar (Hansta fyndplats + Skansen nuvarande placering)")
        elif lsignum == "U 112B":
            assert item["suffix"] == "B"
            assert "U 112A" in [x["canonicalSignum"] for x in inscriptions]
            print(f"  [PASS] U 112B: B-parti på Ed-blocket (U 112A + U 112B verifierade)")
        elif lsignum == "Vs 24":
            assert "Pr3" in item["dating"].get("datingMethod", "") or item["dating"].get("styleGroup") == "Pr3"
            assert "Odendis" in item["textLayer"]["translationSwedish"]
            print(f"  [PASS] Vs 24: Odendisa-skaldestrof och Pr3-datering verifierad")

    print("\nResultat:")
    if errors:
        print(f"FEL ({len(errors)} st):")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print(f"20/20 inskrifter granskade och godkända utan anmärkning!")
        print(f"4/4 kontrollposter godkända i det låsta kontrollurvalet.")
        print(f"Milstolpe M2 är därmed fullständigt verifierad och klar för release.")

if __name__ == "__main__":
    main()
