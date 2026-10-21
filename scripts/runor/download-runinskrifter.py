#!/usr/bin/env python3
"""Inventera och hämta PDF-länkarna i RAÄ:s Digitala Sveriges runinskrifter.

Python 3 + curl. Återupptagbar: befintliga filer godtas endast om tidigare
kontrollsumma och byteantal stämmer. Råfiler ligger utanför public/ och Git.
"""
import argparse
import concurrent.futures
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "underlag/runor/sri"
MANIFEST = ROOT / "docs/runor/nedladdningsmanifest.json"
SOURCE = "https://www.raa.se/kulturarv/runor-och-runstenar/digitala-sveriges-runinskrifter/digitala-sveriges-runinskrifter-publicerade-volymer/"

def now():
    return datetime.now(timezone.utc).isoformat()

def checksum(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

class Inventory(HTMLParser):
    def __init__(self):
        super().__init__()
        self.heading = ""
        self.in_heading = False
        self.anchor = None
        self.links = []
        self.kind = "text"

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h2":
            self.in_heading = True
            self.heading = ""
            self.kind = "text"
        if tag == "a" and urlparse(attrs.get("href", "")).path.lower().endswith(".pdf"):
            url = urljoin(SOURCE, attrs["href"])
            # Endast de digitaliserade volymerna, inga PDF:er i sidfot/menyer.
            if urlparse(url).hostname == "www.raa.se" and urlparse(url).path.startswith("/runinskrifter/sri_"):
                self.anchor = {"url": url, "title": attrs.get("title", ""), "label": "", "volume": self.heading.strip()}

    def handle_endtag(self, tag):
        if tag == "h2":
            self.in_heading = False
        if tag == "a" and self.anchor is not None:
            self.anchor["label"] = self.anchor["label"].strip()
            self.links.append(self.anchor)
            self.anchor = None

    def handle_data(self, data):
        if self.in_heading:
            self.heading += data
        if self.anchor is not None:
            self.anchor["label"] += data

def download(item, previous):
    path = ROOT / item["path"]
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and previous.get("sha256") and path.stat().st_size == previous.get("bytes") and checksum(path) == previous["sha256"]:
        return {**item, **{k: previous[k] for k in ("bytes", "sha256", "downloaded_at", "final_url") if k in previous}, "status": "ok"}
    partial = path.with_suffix(".pdf.part")
    try:
        result = subprocess.run([
            "curl", "--location", "--fail", "--silent", "--show-error",
            "--retry", "3", "--retry-delay", "3", "--connect-timeout", "30",
            "--max-time", "1200", "--continue-at", "-", "--output", str(partial),
            "--write-out", "%{url_effective}", item["url"],
        ], capture_output=True, text=True, timeout=1250)
        if result.returncode in (33, 36) or (result.returncode == 22 and "416" in result.stderr):
            # Vissa servrar stöder inte Range, eller filen har ändrats.
            partial.unlink(missing_ok=True)
            return download(item, {})
        if result.returncode:
            raise RuntimeError(result.stderr.strip())
        with partial.open("rb") as stream:
            if not stream.read(1024).lstrip().startswith(b"%PDF-"):
                raise RuntimeError("Svaret är inte en PDF-fil")
        partial.replace(path)
        return {**item, "status": "ok", "bytes": path.stat().st_size, "sha256": checksum(path), "downloaded_at": now(), "final_url": result.stdout.strip()}
    except Exception as error:
        return {**item, "status": "error", "error": str(error)}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inventory-only", action="store_true")
    parser.add_argument("--workers", type=int, default=3)
    args = parser.parse_args()
    BASE.mkdir(parents=True, exist_ok=True)
    snapshot = BASE / "kallsida.html"
    if not snapshot.exists():
        subprocess.run(["curl", "-L", "--fail", "--max-time", "90", SOURCE, "-o", str(snapshot)], check=True)
    inventory = Inventory()
    inventory.feed(snapshot.read_text())
    items = []
    seen = set()
    for link in inventory.links:
        if link["url"] in seen:
            continue
        seen.add(link["url"])
        filename = Path(urlparse(link["url"]).path).name
        match = re.search(r"_b(\d+)(?:_d(\d+))?", filename)
        volume_id = "band-" + match[1] + ("-del-" + match[2] if match[2] else "")
        kind = "plansch" if "plansch" in filename else "register" if "ord" in filename else "karta" if "karta" in filename else "inledning" if "inledn" in filename else "innehall" if "titel" in filename else "text-och-planscher" if "_oland_" in filename else "text"
        if "_pl_titel" in filename:
            kind = "planschregister"
        items.append({**link, "id": filename.removesuffix(".pdf"), "kind": kind, "volume_id": volume_id, "path": str((BASE / volume_id / filename).relative_to(ROOT)), "status": "pending"})
    if not items:
        raise RuntimeError("Inga PDF-länkar hittades; avbryter utan att skriva över manifestet")
    old = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    previous = {i["url"]: i for i in old.get("files", [])}
    manifest = {"source": SOURCE, "inventoried_at": now(), "source_snapshot": str(snapshot.relative_to(ROOT)), "source_sha256": checksum(snapshot), "count": len(items), "files": items}
    def save():
        MANIFEST.parent.mkdir(parents=True, exist_ok=True)
        temp = MANIFEST.with_suffix(".json.tmp")
        temp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        temp.replace(MANIFEST)
    if args.inventory_only:
        manifest["files"] = [{**i, **{k:v for k,v in previous.get(i["url"], {}).items() if k in ("status", "bytes", "sha256", "downloaded_at", "final_url")}} for i in items]
        save()
        print(f"{len(items)} PDF-filer i {len(set(i['volume_id'] for i in items))} volymdelar", flush=True)
        return
    save()
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(6, args.workers))) as executor:
        futures = {executor.submit(download, i, previous.get(i["url"], {})): index for index, i in enumerate(items)}
        for done, future in enumerate(concurrent.futures.as_completed(futures), 1):
            index = futures[future]
            result = future.result()
            manifest["files"][index] = result
            save()
            print(f"[{done}/{len(items)}] {result['status']} {result['id']} {result.get('bytes', 0)/1024/1024:.1f} MiB", flush=True)
    manifest["completed_at"] = now()
    manifest["downloaded_count"] = sum(i["status"] == "ok" for i in manifest["files"])
    manifest["total_bytes"] = sum(i.get("bytes", 0) for i in manifest["files"])
    save()
    if manifest["downloaded_count"] != len(items):
        raise SystemExit("Vissa hämtningar misslyckades. Kör igen för att försöka om.")

if __name__ == "__main__":
    main()
