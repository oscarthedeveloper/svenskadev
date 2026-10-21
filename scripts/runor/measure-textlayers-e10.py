#!/usr/bin/env python3
"""E10 — Systematisk mätning av textlagren i SRI för 20 pilotinskrifter.

Mäter separat:
- Rubriker och signumidentifiering
- Brödtext och ordavstavningar
- Translitterering och runologiska tecken
- Tolkning/översättning
- Felklassificering:
  Kat A: Spacing/kerning (t.ex. 'ö f v e r', 'KARLE VISTENEN')
  Kat B: Avstavningar vid radbrytning ('in- / skriften')
  Kat C: Ligaturer och accenttecken (fi, fl, ä, ö, å)
  Kat D: Runologiska tecken (þ, ð, ʀ, ą, ǫ, hakparenteser)
  Kat E: Saknat textlager (illustrationssidor, foton)
"""

import json
from pathlib import Path
import re
import pypdf

ROOT = Path(__file__).resolve().parents[2]
SRI_BASE = Path("/Users/oscarpagerup/Desktop/Git Repo/fornsvenska/output/runinskrifter-sri/underlag/runor/sri")

PILOT_MAP = [
    # Öland (1900-1906, b01)
    {"signum": "Öl 1", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(19, 36)), "control": False, "printed": "s. 15–28"},
    {"signum": "Öl 2", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(36, 41)), "control": False, "printed": "s. 28–32"},
    {"signum": "Öl 9", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(62, 67)), "control": False, "printed": "s. 51–55"},
    {"signum": "Öl 15", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(74, 77)), "control": True, "printed": "s. 60–62"},
    {"signum": "Öl 16", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(76, 80)), "control": False, "printed": "s. 62–65"},
    {"signum": "Öl 18", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(82, 85)), "control": False, "printed": "s. 68–70"},
    {"signum": "Öl 23", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(92, 97)), "control": False, "printed": "s. 78–82"},
    {"signum": "Öl 25", "file": SRI_BASE / "band-01/sri_oland_b01_h01.pdf", "pdf_pages": list(range(97, 101)), "control": False, "printed": "s. 83–86"},
    # Östergötland (1911-1918, b02)
    {"signum": "Ög 136", "file": SRI_BASE / "band-02/sri_ostergotland_b02_h02_text.pdf", "pdf_pages": list(range(34, 63)), "control": False, "printed": "s. 130–158"},
    {"signum": "Ög 181", "file": SRI_BASE / "band-02/sri_ostergotland_b02_h02_text.pdf", "pdf_pages": list(range(78, 82)), "control": False, "printed": "s. 174–177"},
    # Uppland (1940-1943, b06)
    {"signum": "U 11", "file": SRI_BASE / "band-06/sri_uppland_b06_text_1.pdf", "pdf_pages": list(range(13, 22)), "control": False, "printed": "s. 13–21"},
    {"signum": "U 29", "file": SRI_BASE / "band-06/sri_uppland_b06_text_1.pdf", "pdf_pages": list(range(34, 45)), "control": False, "printed": "s. 34–44"},
    {"signum": "U 73", "file": SRI_BASE / "band-06/sri_uppland_b06_text_2.pdf", "pdf_pages": list(range(26, 32)), "control": True, "printed": "s. 95–100"},
    {"signum": "U 101", "file": SRI_BASE / "band-06/sri_uppland_b06_text_2.pdf", "pdf_pages": list(range(69, 77)), "control": False, "printed": "s. 138–145"},
    {"signum": "U 104", "file": SRI_BASE / "band-06/sri_uppland_b06_text_2.pdf", "pdf_pages": list(range(79, 86)), "control": False, "printed": "s. 148–154"},
    {"signum": "U 112A", "file": SRI_BASE / "band-06/sri_uppland_b06_text_3.pdf", "pdf_pages": list(range(1, 10)), "control": False, "printed": "s. 157–165"},
    {"signum": "U 112B", "file": SRI_BASE / "band-06/sri_uppland_b06_text_3.pdf", "pdf_pages": list(range(1, 10)), "control": True, "printed": "s. 157–165"},
    # Södermanland (1924-1936, b03)
    {"signum": "Sö 101", "file": SRI_BASE / "band-03/sri_sodermanland_b03_h01_text_2.pdf", "pdf_pages": list(range(20, 25)), "control": False, "printed": "s. 72–76"},
    {"signum": "Sö 179", "file": SRI_BASE / "band-03/sri_sodermanland_b03_h04_text_1a.pdf", "pdf_pages": list(range(17, 22)), "control": False, "printed": "s. 153–157"},
    # Västmanland (1964, b13)
    {"signum": "Vs 24", "file": SRI_BASE / "band-13/sri_vastmanland_b13_text_2.pdf", "pdf_pages": list(range(15, 23)), "control": True, "printed": "s. 69–76"},
]

def analyze_inscription(item):
    pdf_path = item["file"]
    if not pdf_path.exists():
        return {"error": f"Fil saknas: {pdf_path}"}
    
    reader = pypdf.PdfReader(str(pdf_path))
    results = {
        "signum": item["signum"],
        "control": item["control"],
        "file": pdf_path.name,
        "printed": item["printed"],
        "page_count": len(item["pdf_pages"]),
        "total_chars": 0,
        "empty_pages": 0,
        "header_found": False,
        "transliteration_found": False,
        "translation_found": False,
        "spacing_issues": 0,
        "hyphenations": 0,
        "special_chars": {
            "thorn": 0,
            "eth": 0,
            "r_rot": 0,
            "brackets": 0,
            "runes": 0
        },
        "sample_header": "",
        "sample_translit": "",
        "sample_translation": "",
        "raw_text_by_page": {}
    }
    
    signum_num = re.sub(r'^[^\d]*', '', item["signum"]).replace('A', '').replace('B', '').strip()
    
    for page_idx in item["pdf_pages"]:
        if page_idx - 1 >= len(reader.pages):
            continue
        p = reader.pages[page_idx - 1]
        text = p.extract_text() or ""
        char_count = len(text.strip())
        results["total_chars"] += char_count
        results["raw_text_by_page"][page_idx] = text[:200]  # snippet
        
        if char_count < 40:
            results["empty_pages"] += 1
            continue
            
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:5]:
            if (f"{signum_num}." in line or item["signum"] in line or "STENEN" in line.upper() or "RISTNINGEN" in line.upper()) and not results["header_found"]:
                results["header_found"] = True
                results["sample_header"] = line[:100]
                break

        # Kerning / spacing check
        spaced_words = re.findall(r'\b(?:[A-Za-zåäöÅÄÖ]\s){3,}[A-Za-zåäöÅÄÖ]\b', text)
        results["spacing_issues"] += len(spaced_words)
        
        # Hyphenations
        hyphs = re.findall(r'\w+-\s*\n\s*\w+', text)
        results["hyphenations"] += len(hyphs)
        
        # Special characters
        results["special_chars"]["thorn"] += len(re.findall(r'[þÞ]', text))
        results["special_chars"]["eth"] += len(re.findall(r'[ðÐ]', text))
        results["special_chars"]["r_rot"] += len(re.findall(r'[ʀ]', text))
        results["special_chars"]["brackets"] += len(re.findall(r'[\[\]]', text))
        results["special_chars"]["runes"] += len(re.findall(r'[\u16A0-\u16FF]', text))
        
        for line in lines:
            if not results["sample_translit"] and any(term in line.lower() for term in ["lyder:", "läses:", "inskriften", "inskrifter :", "a: •", "b: runa"]):
                if any(c in line for c in ["•", ":", "x", "+", "*", "—"]):
                    results["transliteration_found"] = True
                    results["sample_translit"] = line[:120]
            if not results["sample_translation"] and any(term in line.lower() for term in ["betyder:", "översättning:", "öfversättning", "tolkning:"]) or (line.startswith("»") and "lät" in line):
                results["translation_found"] = True
                results["sample_translation"] = line[:120]
                
    return results

def main():
    print("Mäter textlager för 20 pilotinskrifter...")
    report_data = []
    control_data = []
    
    for item in PILOT_MAP:
        res = analyze_inscription(item)
        report_data.append(res)
        if item["control"]:
            control_data.append(res)
            
    print("\n--- SAMMANFATTNING PER INSKRIFT ---")
    header = f"{'Signum':<8} {'Kontroll':<9} {'Fil':<32} {'Sidor':<6} {'Tecken':<8} {'Rubrik':<7} {'Spacings':<9} {'Avstavn':<8} {'Specialtkn (þ,ð,ʀ,[])'}"
    print(header)
    print("-" * len(header))
    
    total_chars = 0
    total_pages = 0
    total_spacings = 0
    total_hyphs = 0
    total_thorns = 0
    total_eths = 0
    total_r_rots = 0
    total_brackets = 0
    total_runes = 0
    
    for r in report_data:
        sp = r["special_chars"]
        spec_str = f"þ:{sp['thorn']} ð:{sp['eth']} ʀ:{sp['r_rot']} []:{sp['brackets']} ᚱ:{sp['runes']}"
        ctrl_mark = "JA (20%)" if r["control"] else "Nej"
        hdr_mark = "OK" if r["header_found"] else "MISS"
        print(f"{r['signum']:<8} {ctrl_mark:<9} {r['file'][:31]:<32} {r['page_count']:<6} {r['total_chars']:<8} {hdr_mark:<7} {r['spacing_issues']:<9} {r['hyphenations']:<8} {spec_str}")
        
        total_chars += r["total_chars"]
        total_pages += r["page_count"]
        total_spacings += r["spacing_issues"]
        total_hyphs += r["hyphenations"]
        total_thorns += sp["thorn"]
        total_eths += sp["eth"]
        total_r_rots += sp["r_rot"]
        total_brackets += sp["brackets"]
        total_runes += sp["runes"]

    print("-" * len(header))
    print(f"TOTALT: {len(report_data)} inskrifter | {total_pages} sidor | {total_chars} tecken | {total_spacings} spärrningar | {total_hyphs} avstavningar")
    print(f"SPECIALTECKEN TOTALT: þ={total_thorns}, ð={total_eths}, ʀ={total_r_rots}, []={total_brackets}, runtecken={total_runes}")
    
    print("\n--- LÅST KONTROLLURVAL (20 % = 4 poster: Öl 15, U 73, U 112B, Vs 24) ---")
    for c in control_data:
        print(f"Signum: {c['signum']} ({c['file']})")
        print(f"  Tryckt: {c['printed']} | Sidor: {c['page_count']} | Tecken: {c['total_chars']} | Rubrik identifierad: {c['header_found']}")
        print(f"  Rubrikrad: '{c['sample_header']}'")
        print(f"  Spärrningar: {c['spacing_issues']} | Avstavningar: {c['hyphenations']}")
        print(f"  Translitterering hittad: {c['transliteration_found']} -> '{c['sample_translit']}'")
        print(f"  Översättning hittad: {c['translation_found']} -> '{c['sample_translation']}'")
        print(f"  Specialtecken: {c['special_chars']}")

    output_json = ROOT / "docs/runor/textlager-matning-e10.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump({
            "generatedAt": "2026-10-21",
            "pilotCount": len(report_data),
            "totalPages": total_pages,
            "totalChars": total_chars,
            "totalSpacingIssues": total_spacings,
            "totalHyphenations": total_hyphs,
            "specialCharsTotal": {
                "thorn": total_thorns,
                "eth": total_eths,
                "r_rot": total_r_rots,
                "brackets": total_brackets,
                "runes": total_runes
            },
            "inscriptions": [{k: v for k, v in r.items() if k != "raw_text_by_page"} for r in report_data]
        }, f, ensure_ascii=False, indent=2)
    print(f"\nSparade mätdata till {output_json}")

if __name__ == "__main__":
    main()
