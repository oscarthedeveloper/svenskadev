#!/usr/bin/env python3
"""E12 — Automatiserad korsreferenskoppling och identitetskontroll för 20 pilotinskrifter.

Kopplar samman:
- SRI-artikelkandidater från E11
- Kanoniskt signum och alias (Bautil, Liljegren, lokala namn)
- Samnordisk runtextdatabas UUID & RAÄ Runor URI
- Bärare (Carrier) vs Inskrift (Inscription)
- Loggar regel, evidens, säkerhetsstatus och konfliktstatus (verifierad/olöst/avvisad)
"""

import json
from pathlib import Path
import re
import subprocess
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
PILOT_JSON = ROOT / "docs/runor/pilot-20-inskrifter.json"
CANDIDATE_JSON = ROOT / "docs/runor/kandidatregister-e11.json"

def fetch_external_records(signum: str):
    base_sig = re.sub(r'[AB]$', '', signum)
    parts = base_sig.split()
    s1, s2 = parts[0], parts[1]
    
    url = f"https://runor.raa.se/api/snrd/search?edition_id=latest&search_field=SIGNUM&matching_text={quote(base_sig)}"
    cmd = ["curl", "-s", "--max-time", "15", url]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    items = json.loads(res.stdout)
    
    # Hitta bästa match
    matched = []
    for it in items:
        if it.get("signum1") == s1 and it.get("signum2") == s2:
            matched.append(it)
            
    return matched

def main():
    print("Kör E12 korsreferenskoppling och identitetsvalidering...")
    
    with open(PILOT_JSON) as f:
        pilot_data = json.load(f)
    with open(CANDIDATE_JSON) as f:
        cand_data = json.load(f)
        
    candidates_by_signum = {}
    for c in cand_data["allCandidates"]:
        candidates_by_signum[c["signum"]] = c
        
    cross_references = []
    conflicts = []
    
    for item in pilot_data["inscriptions"]:
        signum = item["canonicalSignum"]
        base_signum = re.sub(r'[AB]$', '', signum)
        
        # 1. Hämta kandidat från E11
        candidate = candidates_by_signum.get(signum) or candidates_by_signum.get(base_signum)
        
        # 2. Hämta extern post från RAÄ API
        ext_records = fetch_external_records(signum)
        ext_item = ext_records[0] if ext_records else {}
        
        # Kontrollera eventuella dubbla identiteter eller konflikter
        conflict_status = "verifierad"
        conflict_note = None
        
        if not candidate:
            conflict_status = "olöst"
            conflict_note = "Kandidat saknas i källsegmenteringen"
        elif not ext_records:
            conflict_status = "olöst"
            conflict_note = "Ingen match i Samnordisk runtextdatabas"
            
        # Identifiera alias
        aliases = list(item.get("aliases", []))
        # Kända historiska alias
        if signum == "Öl 1":
            aliases.extend(["Bautil 1071 (delvis)", "Liljegren 1361", "Karlevistenen"])
        elif signum == "Ög 136":
            aliases.extend(["Bautil 848", "Liljegren 133", "Rökstenen"])
        elif signum == "Ög 181":
            aliases.extend(["Bautil 894", "Ledbergsstenen"])
        elif signum == "U 73":
            aliases.extend(["Bautil 155", "Skansenstenen U 73", "Greklandsstenen i Hansta"])
        elif signum == "U 112A" or signum == "U 112B":
            aliases.extend(["Bautil 166", "Kyrkstigsblocket", "Ragnvaldsristningen"])
        elif signum == "Sö 101":
            aliases.extend(["Bautil 730", "Sigurdsristningen", "Ramsundsberget"])
        elif signum == "Vs 24":
            aliases.extend(["Bautil 1162", "Hassmyrastenen", "Odendisastenen"])
            
        aliases = sorted(list(set(aliases)))
        
        uuid = ext_item.get("inscription_id") or item["source"]["externalUris"].get("samnordiskUuid")
        raa_uri = f"https://app.raa.se/open/runor/inscription?item_key={uuid}" if uuid else None
        
        record = {
            "canonicalSignum": signum,
            "canonicalSlug": item["canonicalSlug"],
            "itemNumber": item["itemNumber"],
            "suffix": item["suffix"],
            "carrierId": item["carrier"]["id"],
            "carrierType": item["carrier"]["type"],
            "aliases": aliases,
            "status": conflict_status,
            "rule": "E12.1 Stabilitet på kanoniskt signum och volymreferens",
            "evidence": {
                "sriPdf": item["source"].get("pdfFil"),
                "sriPages": f"PDF s. {item['source']['pdfPageStart']}–{item['source']['pdfPageEnd']}",
                "sriPrinted": f"s. {item['source']['printedPageStart']}–{item['source']['printedPageEnd']}",
                "plate": item["source"].get("plateNumber"),
                "samnordiskUuid": uuid,
                "raaRunorUri": raa_uri,
                "candidateMatch": candidate["title"] if candidate else None
            },
            "conflictNote": conflict_note
        }
        
        if conflict_status == "olöst":
            conflicts.append(record)
        cross_references.append(record)
        print(f"[{conflict_status.upper()}] {signum:<8} -> UUID: {str(uuid)[:8]}... | Källfil: {item['source'].get('pdfFil')} | Alias: {len(aliases)} st")

    print("\n--- STATISTIK E12 KORSREFERENSER ---")
    print(f"Totalt behandlade poster: {len(cross_references)}")
    print(f"Verifierade identiteter: {sum(1 for r in cross_references if r['status'] == 'verifierad')} / {len(cross_references)}")
    print(f"Olösta konflikter: {len(conflicts)}")
    
    out_file = ROOT / "docs/runor/korsreferensregister-e12.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "version": "1.0",
            "generatedAt": "2026-10-21",
            "verifiedCount": sum(1 for r in cross_references if r['status'] == 'verifierad'),
            "unresolvedConflicts": len(conflicts),
            "crossReferences": cross_references
        }, f, ensure_ascii=False, indent=2)
        
    print(f"\nSparade korsreferensregister till {out_file}")

if __name__ == "__main__":
    main()
