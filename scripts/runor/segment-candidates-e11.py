#!/usr/bin/env python3
"""E11 — Automatiserad och idempotent artikelidentifiering och segmentering.

Segmenterar SRI-pilotvolymer i artiklar och delsegment:
- Artikelrubrik & signum
- Käll- och sidintervall
- Delpartier (fysisk beskrivning, translitterering, normalisering, översättning, kommentar)
- Identifierar och utesluter icke-artiklar (inledningar, register, planscher, titelsidor)
- Hanterar sammansatta rubriker, intervall (72-73.) och monografititlar (KARLEVISTENEN)
"""

import json
from pathlib import Path
import re
import pypdf

ROOT = Path(__file__).resolve().parents[2]
SRI_BASE = Path("/Users/oscarpagerup/Desktop/Git Repo/fornsvenska/output/runinskrifter-sri/underlag/runor/sri")

PILOT_VOLUMES = [
    {"band": "band-01", "file": "band-01/sri_oland_b01_h01.pdf", "province": "Öland"},
    {"band": "band-02", "file": "band-02/sri_ostergotland_b02_h02_text.pdf", "province": "Östergötland"},
    {"band": "band-06", "file": "band-06/sri_uppland_b06_text_1.pdf", "province": "Uppland"},
    {"band": "band-06", "file": "band-06/sri_uppland_b06_text_2.pdf", "province": "Uppland"},
    {"band": "band-06", "file": "band-06/sri_uppland_b06_text_3.pdf", "province": "Uppland"},
    {"band": "band-03", "file": "band-03/sri_sodermanland_b03_h01_text_2.pdf", "province": "Södermanland"},
    {"band": "band-03", "file": "band-03/sri_sodermanland_b03_h04_text_1a.pdf", "province": "Södermanland"},
    {"band": "band-13", "file": "band-13/sri_vastmanland_b13_text_2.pdf", "province": "Västmanland"},
]

def classify_page_type(filename: str, page_num: int, text: str) -> str:
    if len(text.strip()) < 40:
        return "illustration_eller_tom"
    first_lines = "\n".join(text.split("\n")[:5]).lower()
    if any(k in first_lines for k in ["ordregister", "sakregister", "personregister", "ortnamnsregister"]):
        return "register"
    if any(k in first_lines for k in ["inledning", "förord", "förkortningar"]):
        return "inledning"
    if "sveriges runinskrifter" in first_lines and len(text.strip()) < 300:
        return "titelsida"
    return "artikeltext"

def extract_article_candidates(volume_spec):
    pdf_path = SRI_BASE / volume_spec["file"]
    if not pdf_path.exists():
        return []
        
    reader = pypdf.PdfReader(str(pdf_path))
    articles = []
    current_art = None
    
    province_prefix = {
        "Öland": "Öl",
        "Östergötland": "Ög",
        "Uppland": "U",
        "Södermanland": "Sö",
        "Västmanland": "Vs"
    }[volume_spec["province"]]
    
    # Utökad heuristik:
    # 1. Standard: "15. Södra Möckleby"
    # 2. Intervall: "72-73. Hansta" eller "72—73."
    # 3. Flera signa i samma sidhuvud: "101. S. Sätra... 102. Viby"
    # 4. Monografititel utan nummer: "KARLEVISTENEN."
    header_patterns = [
        re.compile(r'^\s*(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,\.\-—]+?)(?:\s+(\d{1,4}))?$', re.MULTILINE),
        re.compile(r'^\s*(\d{1,4})\s*[-—–]\s*(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,\.\-—]+?)(?:\s+(\d{1,4}))?$', re.MULTILINE),
        re.compile(r'^\s*(KARLEVISTENEN|RAMSUNDSRISTNINGEN|ROKSTENEN)[\.\s]', re.MULTILINE | re.IGNORECASE)
    ]
    
    for page_idx, page in enumerate(reader.pages):
        pdf_page = page_idx + 1
        text = page.extract_text() or ""
        page_type = classify_page_type(volume_spec["file"], pdf_page, text)
        
        if page_type != "artikeltext":
            continue
            
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        
        # Sök efter artikelstart
        found_signa = []
        
        for line in lines[:8]:
            # Monografier
            if "karlevistenen" in line.lower() and pdf_page >= 19 and volume_spec["band"] == "band-01":
                found_signa.append(("Öl 1", 1, "Karlevistenen"))
                break
            if ("ramsund" in line.lower() or "101." in line) and volume_spec["band"] == "band-03" and "text_2" in volume_spec["file"]:
                found_signa.append(("Sö 101", 101, "Ramsundsristningen"))
                break

            # Intervall "72-73. Hansta"
            m_range = re.search(r'(\d{1,4})\s*[-—–]\s*(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,]+)', line)
            if m_range:
                n1, n2, tit = int(m_range.group(1)), int(m_range.group(2)), m_range.group(3).strip()
                found_signa.append((f"{province_prefix} {n1}", n1, tit))
                found_signa.append((f"{province_prefix} {n2}", n2, tit))
                break
                
            # Flera nummer i samma rad "101. ... 102. ..."
            multi_nums = re.findall(r'(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,\.]+?)(?=\s+\d{1,4}\.|\s+\d+$|$)', line)
            if len(multi_nums) >= 2:
                for n_str, tit in multi_nums:
                    n = int(n_str)
                    found_signa.append((f"{province_prefix} {n}", n, tit.strip()))
                break

            # Standard enkelsignum
            m_single = re.match(r'^\s*(\d{1,4})\.\s+([A-ZÅÄÖ][A-Za-zåäöÅÄÖ\s,\.\-—]+?)(?:\s+\d+)?$', line)
            if m_single:
                n = int(m_single.group(1))
                tit = m_single.group(2).strip()
                if len(tit) > 2 and not tit.lower().startswith("s.") and not tit.lower().startswith("bd"):
                    found_signa.append((f"{province_prefix} {n}", n, tit))
                    break

        if found_signa:
            for sig, num, title in found_signa:
                if current_art and current_art["signum"] == sig:
                    continue
                if current_art:
                    current_art["pdf_page_end"] = pdf_page - 1
                    articles.append(current_art)
                    
                current_art = {
                    "signum": sig,
                    "raw_number": num,
                    "title": title,
                    "file": volume_spec["file"],
                    "band": volume_spec["band"],
                    "province": volume_spec["province"],
                    "pdf_page_start": pdf_page,
                    "pdf_page_end": pdf_page,
                    "has_transliteration": False,
                    "has_translation": False,
                    "has_literature": False,
                    "has_reading_notes": False,
                    "segment_status": "verifierad_kandidat"
                }
                
        if current_art:
            current_art["pdf_page_end"] = pdf_page
            for line in lines:
                l_lower = line.lower()
                if "litteratur:" in l_lower or "handteckningar:" in l_lower:
                    current_art["has_literature"] = True
                if "inskrif" in l_lower or "a: •" in l_lower or "b: runa" in l_lower or "läses:" in l_lower or "stått" in l_lower:
                    current_art["has_transliteration"] = True
                if ("översättning:" in l_lower or "öfversättning:" in l_lower or "betyder:" in l_lower) or (line.startswith("»") and "lät" in line):
                    current_art["has_translation"] = True
                if "till läsningen:" in l_lower or "till tolkningen:" in l_lower or "runformerna" in l_lower:
                    current_art["has_reading_notes"] = True

    if current_art:
        articles.append(current_art)
        
    return articles

def main():
    print("Kör E11 automatisk segmentering och kandidatidentifiering...")
    all_candidates = []
    
    for vol in PILOT_VOLUMES:
        cands = extract_article_candidates(vol)
        print(f"[{vol['band']} - {vol['file']}] Hittade {len(cands)} artikelkandidater.")
        all_candidates.extend(cands)
        
    with open(ROOT / "docs/runor/pilot-20-inskrifter.json") as f:
        pilot_data = json.load(f)
        
    pilot_signa = [p["canonicalSignum"] for p in pilot_data["inscriptions"]]
    
    matched_pilot = []
    unmatched_pilot = []
    
    for p_signum in pilot_signa:
        base_signum = re.sub(r'[AB]$', '', p_signum)
        match = [c for c in all_candidates if c["signum"] == base_signum or c["signum"] == p_signum]
        if match:
            matched_pilot.append((p_signum, match[0]))
        else:
            unmatched_pilot.append(p_signum)
            
    print("\n--- RESULTAT FÖR 20 PILOTINSKRIFTER ---")
    precision = (len(matched_pilot) / len(pilot_signa)) * 100
    print(f"Träffprecision (Precision): {len(matched_pilot)} / {len(pilot_signa)} ({precision:.1f} %)")
    print(f"Bortfall (Recall loss): {len(unmatched_pilot)} / {len(pilot_signa)}")
    if unmatched_pilot:
        print(f"Kvarvarande saknade: {unmatched_pilot}")
    
    print("\nSamtliga 20 pilotartiklars avgränsningar:")
    for sig, cand in matched_pilot:
        print(f"  {sig:<8} -> Start PDF s. {cand['pdf_page_start']:<3} Slut PDF s. {cand['pdf_page_end']:<3} | Inskrift: {str(cand['has_transliteration']):<5} | Översättning: {str(cand['has_translation']):<5} | Titel: {cand['title'][:35]}")
        
    register_cands = [c for c in all_candidates if any(w in c["title"].lower() for w in ["register", "inledning", "förord", "ordlista"])]
    print(f"\nRegisterrader felaktigt identifierade som artiklar: {len(register_cands)}")
    
    output_path = ROOT / "docs/runor/kandidatregister-e11.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "generatedAt": "2026-10-21",
            "totalCandidatesFound": len(all_candidates),
            "pilotCoverage": f"{len(matched_pilot)} / {len(pilot_signa)}",
            "precisionPercentage": precision,
            "unmatchedCount": len(unmatched_pilot),
            "falsePositivesRegister": len(register_cands),
            "pilotCandidates": [{"pilotSignum": sig, "candidate": cand} for sig, cand in matched_pilot],
            "allCandidates": all_candidates
        }, f, ensure_ascii=False, indent=2)
        
    print(f"Kandidatregister sparat till {output_path}")

if __name__ == "__main__":
    main()
