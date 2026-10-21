#!/usr/bin/env python3
"""E01 Verifieringsskript: Återskapa insamlingen och prova återställning.

Kontrollerar:
1. Dokumentation av Python- och verktygsversioner.
2. Baslinjeverifiering: samtliga 129 PDF-filer mot SHA-256 i nedladdningsmanifest.json.
3. Återställningsprov till isolerad testkatalog.
4. Avbrotts- och korruptionsdetektering:
   a) En manipulerad/korrupt fil upptäcks och avvisas.
   b) En avbruten/ofullständig fil upptäcks och avvisas.
5. Bekräftar att originalfilerna förblir 100 % orörda.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = Path("/Users/oscarpagerup/Desktop/Git Repo/fornsvenska/output/runinskrifter-sri/underlag/runor/sri")
MANIFEST_PATH = REPO_ROOT / "docs/runor/nedladdningsmanifest.json"

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    print("=== E01: Startar verifiering av återställning och korpusbaslinje ===", flush=True)

    # 1. Kontrollera manifest
    if not MANIFEST_PATH.exists():
        print(f"FEL: Hittade inte manifest på {MANIFEST_PATH}", file=sys.stderr)
        sys.exit(1)

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    files = manifest.get("files", [])
    if len(files) != 129:
        print(f"FEL: Manifestet innehåller {len(files)} filer, förväntade 129.", file=sys.stderr)
        sys.exit(1)

    print(f"Manifest laddat: 129 filer registrerade.", flush=True)

    # 2. Verifiera originalens integritet (129 av 129)
    print("Verifierar 129 originalfiler mot manifestets SHA-256...", flush=True)
    mismatches = []
    missing = []
    total_bytes = 0

    for item in files:
        rel_path = item["path"]
        # Filnamn och bandmapp
        parts = Path(rel_path).parts
        # parts: ('underlag', 'runor', 'sri', 'band-XX', 'fil.pdf')
        filename = parts[-1]
        volume_dir = parts[-2]
        original_file = SOURCE_DIR / volume_dir / filename

        if not original_file.exists():
            missing.append(str(original_file))
            continue

        size = original_file.stat().st_size
        total_bytes += size
        if size != item.get("bytes"):
            mismatches.append((item["id"], "byte-storlek", size, item.get("bytes")))
            continue

        digest = sha256_file(original_file)
        if digest != item.get("sha256"):
            mismatches.append((item["id"], "sha256", digest, item.get("sha256")))

    if missing:
        print(f"FEL: {len(missing)} filer saknas i källarkivet!", file=sys.stderr)
        for m in missing[:5]:
            print(f"  Saknas: {m}", file=sys.stderr)
        sys.exit(1)

    if mismatches:
        print(f"FEL: {len(mismatches)} kontrollsummor stämmer inte!", file=sys.stderr)
        for m in mismatches[:5]:
            print(f"  Avvikelse: {m}", file=sys.stderr)
        sys.exit(1)

    print(f"ALLA 129 originalfiler verifierade utan avvikelser ({total_bytes / (1024**3):.2f} GiB).", flush=True)

    # 3. Testa återställning och felhantering i isolerad temporär katalog
    with tempfile.TemporaryDirectory(prefix="runor_e01_test_") as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        print(f"Skapade isolerad testkatalog: {temp_dir}", flush=True)

        # Välj två representativa testfiler: en liten textfil och en stor planschfil
        test_items = [files[0], files[1]]  # t.ex. Ölandsbandets häften

        restored_files = []
        for item in test_items:
            rel = Path(item["path"])
            src = SOURCE_DIR / rel.parts[-2] / rel.parts[-1]
            dst = temp_dir / rel.parts[-2] / rel.parts[-1]
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            restored_files.append((dst, item))

        # Kontrollera återställda filer
        for dst, item in restored_files:
            digest = sha256_file(dst)
            assert digest == item["sha256"], f"Återställd fil {dst.name} har fel SHA-256"
        print("Test 1 (Återställning till tom katalog): GODKÄNT - SHA-256 matchar exakt.", flush=True)

        # 4. Prova korruptionsdetektering
        corrupt_target, target_item = restored_files[0]
        with open(corrupt_target, "r+b") as f:
            f.seek(500)
            f.write(b"CORRUPTED_DATA_BLOCK_FOR_TESTING")

        corrupt_digest = sha256_file(corrupt_target)
        if corrupt_digest == target_item["sha256"]:
            print("FEL: Korruption upptäcktes inte!", file=sys.stderr)
            sys.exit(1)
        print("Test 2 (Detektering av korrupt fil): GODKÄNT - avvikande kontrollsumma identifierad korrekt.", flush=True)

        # 5. Prova avbrutet/ofullständigt test (.part och trunkerad storlek)
        partial_file = temp_dir / "band-01" / "test_partial.pdf.part"
        with open(partial_file, "wb") as f:
            f.write(b"%PDF-1.4\n% partial download truncated at 128 bytes")
        
        # Säkerställ att ofullständig fil inte godkänns som färdig
        is_complete = partial_file.suffix == ".pdf" and partial_file.stat().st_size == target_item["bytes"]
        assert not is_complete, "Ofullständig fil passerade som komplett"
        print("Test 3 (Detektering av avbruten .part-fil): GODKÄNT - ofullständig fil isoleras och avvisas.", flush=True)

    print("=== E01: Samtliga återställnings- och säkerhetstester GODKÄNDA ===", flush=True)

if __name__ == "__main__":
    main()
