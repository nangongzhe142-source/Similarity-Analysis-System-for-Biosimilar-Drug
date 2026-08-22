# -*- coding: utf-8 -*-
"""Download ProteoWizard Thermo reader regression RAW files for P6."""

from __future__ import annotations

import hashlib
import json
import urllib.request
from pathlib import Path

MANIFEST = Path(__file__).resolve().parents[1] / "fixtures" / "manifest.json"
TARGET_DIR = Path(__file__).resolve().parents[1] / "fixtures" / "pwiz-thermo"


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(4 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    tool = next(item for item in manifest["toolFixtures"] if item["name"] == "pwiz-thermo")
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    base = tool["urlBase"]
    for entry in tool["files"]:
        destination = TARGET_DIR / entry["fileName"]
        if destination.is_file() and sha256_of(destination) == entry["sha256"]:
            print(f"ok {entry['fileName']}")
            continue
        url = base + entry["fileName"]
        print(f"GET {url}")
        with urllib.request.urlopen(url, timeout=120) as response:
            destination.write_bytes(response.read())
        actual = sha256_of(destination)
        if actual != entry["sha256"]:
            raise SystemExit(f"checksum mismatch for {entry['fileName']}: {actual}")
        print(f"saved {entry['fileName']} ({destination.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
