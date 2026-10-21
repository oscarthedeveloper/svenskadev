#!/usr/bin/env python3
"""Teknisk inventering och fullständig textlagerextraktion av lokala SRI-PDF:er.

Kör med Python-miljön som har pypdfium2. --watch behandlar filer allt eftersom
hämtningen blir klar. Extraktion är sökunderlag, aldrig korrekturläst text.
"""
import argparse
from collections import defaultdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time
import pypdfium2 as pdfium

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/runor/nedladdningsmanifest.json"
REPORT = ROOT / "docs/runor/pdf-analys.json"
TEXT = ROOT / "underlag/runor/sri/text"

def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024*1024), b''):
            digest.update(block)
    return digest.hexdigest()

def inspect(item):
    path = ROOT / item['path']
    digest = sha256(path)
    if digest != item['sha256']:
        raise ValueError('Kontrollsumman avviker från hämtningen')
    doc = pdfium.PdfDocument(str(path))
    metadata = doc.get_metadata_dict()
    page_stats = []
    text_path = TEXT / (item['id'] + '.txt')
    index_path = TEXT / (item['id'] + '.jsonl')
    TEXT.mkdir(parents=True, exist_ok=True)
    with text_path.open('w') as text, index_path.open('w') as index:
        for page_index in range(len(doc)):
            page = doc[page_index]
            textpage = page.get_textpage()
            content = textpage.get_text_bounded()
            characters = sum(not c.isspace() for c in content)
            record = {'pdf_page': page_index+1, 'characters': characters, 'text': content}
            text.write(content + '\n\f\n')
            index.write(json.dumps(record, ensure_ascii=False)+'\n')
            page_stats.append({'pdf_page': page_index+1, 'characters': characters})
            textpage.close()
            page.close()
    doc.close()
    return {'id': item['id'], 'volume': item['volume'], 'volume_id': item['volume_id'], 'kind': item['kind'], 'path': item['path'], 'sha256_verified': digest, 'pages': len(page_stats), 'pages_with_text': sum(p['characters']>0 for p in page_stats), 'pages_under_40_characters': sum(p['characters']<40 for p in page_stats), 'text_characters': sum(p['characters'] for p in page_stats), 'metadata': metadata, 'text_path': str(text_path.relative_to(ROOT)), 'page_index_path': str(index_path.relative_to(ROOT)), 'page_stats': page_stats}

def summarize(manifest, files):
    by_volume = defaultdict(list)
    for f in files:
        by_volume[f['volume']].append(f)
    downloaded = sum(f['status'] == 'ok' for f in manifest['files'])
    size = sum(f.get('bytes', 0) for f in manifest['files'])
    rows = [
        '# Lokal insamling av Sveriges runinskrifter', '',
        'Inventering och analys: 21 oktober 2026.', '',
        f"Hämtat **{downloaded} av {manifest['count']} PDF-filer**, totalt **{size:,} byte ({size/1024**3:.2f} GiB)**. ".replace(',', ' ') +
        f"Tekniskt analyserat **{len(files)} filer och {sum(f['pages'] for f in files):,} PDF-sidor**.".replace(',', ' '), '',
        '[Utgångssida hos RAÄ](' + manifest['source'] + '). Alla direkta SRI-PDF-länkar på sidan ingår; det är dokument, inte individuella inskriftsobjekt.', '',
        '## Var materialet finns', '',
        '- Original: `underlag/runor/sri/band-*/`.',
        '- Söktillämpningens arbetsunderlag: `underlag/runor/sri/text/*.txt` och `*.jsonl` (en post per PDF-sida).',
        '- Källa, länkar, tidpunkter, storlekar och SHA-256: [nedladdningsmanifest.json](nedladdningsmanifest.json).',
        '- Sidantal, metadata, textmängd och kontrollresultat: [pdf-analys.json](pdf-analys.json).',
        '- Förslag till karta, datamodell och utvecklingsetapper: [RUNSIDA_PLAN.md](RUNSIDA_PLAN.md).', '',
        'Original och extraherad text ligger lokalt och är Git-ignorerade. De publiceras inte av webbbygget och behöver säkerhetskopieras separat.', '',
        '## Volymer', '',
        '| Utgåva | Filer analyserade | PDF-sidor |', '|---|---:|---:|',
    ]
    for volume, group in by_volume.items():
        rows.append(f"| {volume} | {len(group)} | {sum(f['pages'] for f in group)} |")
    with_text = sum(f['pages_with_text'] for f in files)
    sparse = sum(f['pages_under_40_characters'] for f in files)
    characters = sum(f['text_characters'] for f in files)
    rows += ['', '## Kontroll och analysens gränser', '',
        f"- Varje analyserad fil har öppnats med PDFium, alla dess sidor har öppnats och kontrollsumman har verifierats på nytt mot hämtningen.",
        f"- {with_text:,} sidor innehåller text i det befintliga textlagret; {sparse:,} sidor har färre än 40 icke-blanka texttecken efter extraktion (även blankblad och bildplanscher räknas här).".replace(',', ' '),
        f"- Totalt {characters:,} texttecken utan blanktecken har extraherats. Ingen ny OCR har körts.".replace(',', ' '),
        '- En textsida från Öland och en plansch från Östergötland har dessutom kontrollerats visuellt. Provbilder finns under `underlag/runor/sri/provbilder/`.',
        '- Öppningsbarhet och textmängd bevisar inte att OCR, sidordning, datering eller läsning är korrekt. Ingen fullständig vetenskaplig genomläsning av alla inskrifter har utförts.',
        '- Textlager och planscher behöver kopplas till individuella runsignum. Koordinater har inte importerats eller konstruerats.', '',
        '## Återkörning', '',
        'Hämtning (Python 3 och curl):', '', '```sh', 'python3 scripts/download-runinskrifter.py --workers 6', '```', '',
        'Analys (Python-miljö med `pypdfium2`):', '', '```sh', 'python3 scripts/analyze-runinskrifter.py', '```', '',
        'Hämtverktyget jämför byteantal och SHA-256 innan en fil hoppas över. Analysverktyget återanvänder färdiga analyser med samma kontrollsumma. En ny ögonblicksbild av källsidan behövs om länkarna ska inventeras på nytt.', '',
    ]
    (ROOT / 'docs/runor/INSAMLING.md').write_text('\n'.join(rows))


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--watch',action='store_true')
    args=parser.parse_args()
    old=json.loads(REPORT.read_text()) if REPORT.exists() else {}
    done={f['id']:f for f in old.get('files',[])}
    errors={}
    while True:
        manifest=json.loads(MANIFEST.read_text())
        for item in manifest['files']:
            if item['status']!='ok' or item['id'] in errors:
                continue
            if item['id'] in done and done[item['id']]['sha256_verified']==item['sha256']:
                continue
            try:
                done[item['id']]=inspect(item)
                print(f"Analyserad {len(done)}/{manifest['count']}: {item['id']} ({done[item['id']]['pages']} sidor)",flush=True)
            except Exception as e:
                errors[item['id']]=str(e)
            files=[done[i['id']] for i in manifest['files'] if i['id'] in done]
            report={'generated_at':datetime.now(timezone.utc).isoformat(),'method':'PDFium: all pages opened, full text layer extracted, SHA-256 independently verified; no new OCR; no scholarly correction', 'expected_files':manifest['count'], 'analyzed_files':len(files),'pages':sum(f['pages'] for f in files),'text_characters':sum(f['text_characters'] for f in files),'errors':errors,'files':files}
            tmp=REPORT.with_suffix('.json.tmp')
            tmp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');tmp.replace(REPORT)
        if not args.watch or manifest.get('completed_at'):
            if errors: raise SystemExit(str(errors))
            break
        time.sleep(8)
    summarize(manifest, [done[i['id']] for i in manifest['files'] if i['id'] in done])

if __name__=='__main__': main()
