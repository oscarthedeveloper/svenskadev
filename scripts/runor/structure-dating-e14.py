#!/usr/bin/env python3
"""E14 — Strukturering av dateringar och språkklassning för 20 pilotinskrifter.

Regelverk:
- Inga mittpunkter presenteras som exakta år (t.ex. 'ca 1060–1080' får inte bli 1070).
- Bevarar originaletikett, tidsintervall, epok och dateringsmetod (Gräslunds stilgrupper, historiska händelser, runformer).
- Språkklassning: Runsvenska (RSV) som primär normalisering; fornvästnordiska (FVN) vid skaldemeter/jämförelse; metriska former (dróttkvætt, fornyrðislag).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PILOT_JSON = ROOT / "docs/runor/pilot-20-inskrifter.json"

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

def main():
    print("Strukturerar dateringar och språkklassning för 20 pilotinskrifter...")
    
    records = []
    for signum, spec in DATING_SPECS.items():
        records.append({
            "canonicalSignum": signum,
            "period": spec["periodLabel"],
            "interval": [spec["earliestYear"], spec["latestYear"]],
            "label": spec["originalSourceLabel"],
            "method": spec["datingMethod"],
            "styleGroup": spec["styleGroup"],
            "languages": {
                "primary": spec["primaryLanguage"],
                "secondary": spec["secondaryLanguage"]
            },
            "metricForm": spec["metricForm"]
        })
        m_str = f"[{spec['metricForm']}]" if spec["metricForm"] else " " * 15
        print(f"{signum:<8} {spec['earliestYear']}–{spec['latestYear']} | {spec['styleGroup']:<12} {m_str:<25} {spec['periodLabel']}")
        
    out_file = ROOT / "docs/runor/dateringsregister-e14.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump({
            "version": "1.0",
            "generatedAt": "2026-10-21",
            "count": len(records),
            "dateringar": records
        }, f, ensure_ascii=False, indent=2)
        
    print(f"\nSparade dateringsregister till {out_file}")

if __name__ == "__main__":
    main()
