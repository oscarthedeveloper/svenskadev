#!/usr/bin/env python3
"""
Etapp E16: Extrahera råa planschbilder ur Sveriges runinskrifter (SRI) PDF:er.
Extraherar det förlustfria JPEG-bildflödet (/DCTDecode) direkt ur PDF-sidornas XObjects.
"""

import os
import sys
import pypdf

BASE_SRI = "/Users/oscarpagerup/Desktop/Git Repo/fornsvenska/output/runinskrifter-sri/underlag/runor/sri"
OUT_DIR = "/tmp/runor_extracted_plates"

PLATE_SPECS = [
    {
        "slug": "ol-1",
        "signum": "Öl 1",
        "rel_pdf": "band-01/sri_oland_b01_h01.pdf",
        "page_1based": 21,
        "desc": "Plansch I: Karlevistenen"
    },
    {
        "slug": "ol-2",
        "signum": "Öl 2",
        "rel_pdf": "band-01/sri_oland_b01_h01.pdf",
        "page_1based": 44,
        "desc": "Plansch för Algutsrums kyrka (Öl 2)"
    },
    {
        "slug": "ol-9",
        "signum": "Öl 9",
        "rel_pdf": "band-01/sri_oland_b01_h01.pdf",
        "page_1based": 63,
        "desc": "Plansch för Kastlösa kyrka (Öl 9)"
    },
    {
        "slug": "ol-15",
        "signum": "Öl 15",
        "rel_pdf": None,
        "page_1based": None,
        "desc": "Ej avbildad (förlorad)"
    },
    {
        "slug": "ol-16",
        "signum": "Öl 16",
        "rel_pdf": "band-01/sri_oland_b01_h01.pdf",
        "page_1based": 77,
        "desc": "Teckning ur Bautil s. 63"
    },
    {
        "slug": "ol-18",
        "signum": "Öl 18",
        "rel_pdf": "band-01/sri_oland_b01_h01.pdf",
        "page_1based": 78,
        "desc": "Plansch för Seby (Öl 18)"
    },
    {
        "slug": "ol-23",
        "signum": "Öl 23",
        "rel_pdf": "band-01/sri_oland_b01_h01.pdf",
        "page_1based": 94,
        "desc": "Plansch för Stenåsa (Öl 23)"
    },
    {
        "slug": "ol-25",
        "signum": "Öl 25",
        "rel_pdf": "band-01/sri_oland_b01_h01.pdf",
        "page_1based": 99,
        "desc": "Plansch för Dröstorp (Öl 25)"
    },
    {
        "slug": "og-136",
        "signum": "Ög 136",
        "rel_pdf": "band-02/sri_ostergotland_b02_h03_plansch.pdf",
        "page_1based": 24,
        "desc": "Pl. XXXIII: Rökstenen"
    },
    {
        "slug": "og-181",
        "signum": "Ög 181",
        "rel_pdf": "band-02/sri_ostergotland_b02_h02_plansch.pdf",
        "page_1based": 29,
        "desc": "Pl. XLIV: Ledbergsstenen"
    },
    {
        "slug": "u-11",
        "signum": "U 11",
        "rel_pdf": "band-06/sri_uppland_b06_plansch_1.pdf",
        "page_1based": 4,
        "desc": "Pl. 4: Hovgården (U 11)"
    },
    {
        "slug": "u-29",
        "signum": "U 29",
        "rel_pdf": "band-06/sri_uppland_b06_plansch_1.pdf",
        "page_1based": 13,
        "desc": "Pl. 12: Hillersjöhällen (U 29)"
    },
    {
        "slug": "u-73",
        "signum": "U 73",
        "rel_pdf": "band-06/sri_uppland_b06_plansch_1.pdf",
        "page_1based": 45,
        "desc": "Pl. 32: Hansta (U 73)"
    },
    {
        "slug": "u-101",
        "signum": "U 101",
        "rel_pdf": "band-06/sri_uppland_b06_plansch_1.pdf",
        "page_1based": 63,
        "desc": "Pl. 45: Sjöstugan (U 101)"
    },
    {
        "slug": "u-104",
        "signum": "U 104",
        "rel_pdf": "band-06/sri_uppland_b06_plansch_1.pdf",
        "page_1based": 67,
        "desc": "Pl. 48: Eds kyrka (U 104)"
    },
    {
        "slug": "u-112a",
        "signum": "U 112A",
        "rel_pdf": "band-06/sri_uppland_b06_plansch_1.pdf",
        "page_1based": 72,
        "desc": "Pl. 51: Runblocket i Ed västra (U 112A)"
    },
    {
        "slug": "u-112b",
        "signum": "U 112B",
        "rel_pdf": "band-06/sri_uppland_b06_plansch_1.pdf",
        "page_1based": 73,
        "desc": "Pl. 52: Runblocket i Ed östra (U 112B)"
    },
    {
        "slug": "so-101",
        "signum": "Sö 101",
        "rel_pdf": "band-03/sri_sodermanland_b03_h04_plansch.pdf",
        "page_1based": 7,
        "desc": "Pl. 38: Ramsundsristningen (Sö 101)"
    },
    {
        "slug": "so-179",
        "signum": "Sö 179",
        "rel_pdf": "band-03/sri_sodermanland_b03_h03_plansch_1.pdf",
        "page_1based": 6,
        "desc": "Pl. 67: Gripsholmsstenen (Sö 179)"
    },
    {
        "slug": "vs-24",
        "signum": "Vs 24",
        "rel_pdf": "band-13/sri_vastmanland_b13_plansch.pdf",
        "page_1based": 26,
        "desc": "Pl. 18: Hassmyrastenen (Vs 24)"
    }
]

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Extraherar planschbilder till {OUT_DIR}...")
    
    extracted_count = 0
    for spec in PLATE_SPECS:
        slug = spec["slug"]
        if spec["rel_pdf"] is None:
            print(f"[{slug:8}] Inskriften saknar avbildning (markeras depicted: false).")
            continue
            
        pdf_path = os.path.join(BASE_SRI, spec["rel_pdf"])
        if not os.path.exists(pdf_path):
            print(f"FEL: Hittade inte {pdf_path}", file=sys.stderr)
            sys.exit(1)
            
        reader = pypdf.PdfReader(pdf_path)
        page_idx = spec["page_1based"] - 1
        page = reader.pages[page_idx]
        
        xobj = page["/Resources"]["/XObject"].get_object()
        img_keys = [k for k in xobj if xobj[k].get_object().get("/Subtype") == "/Image"]
        if not img_keys:
            print(f"FEL: Inga bilder på s. {spec['page_1based']} i {spec['rel_pdf']}", file=sys.stderr)
            sys.exit(1)
            
        # Ta den största bilden om det finns flera
        best_obj = None
        best_size = 0
        for k in img_keys:
            obj = xobj[k].get_object()
            data = obj.get_data()
            if len(data) > best_size:
                best_size = len(data)
                best_obj = obj
                
        out_jpg = os.path.join(OUT_DIR, f"{slug}.jpg")
        with open(out_jpg, "wb") as f:
            f.write(best_obj.get_data())
            
        w = best_obj.get("/Width")
        h = best_obj.get("/Height")
        print(f"[{slug:8}] OK -> {w}x{h} ({best_size / 1024:.1f} KB) ur {spec['desc']}")
        extracted_count += 1
        
    print(f"Klar! {extracted_count} råa JPEG-planscher extraherade till {OUT_DIR}.")

if __name__ == "__main__":
    main()
