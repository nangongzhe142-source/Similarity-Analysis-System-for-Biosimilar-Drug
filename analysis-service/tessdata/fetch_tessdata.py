# -*- coding: utf-8 -*-
"""Populate a project-local Tesseract tessdata directory.

Why project-local rather than the system install:

* The host Tesseract 5.5.0 lives in C:\\Program Files\\Tesseract-OCR and ships
  only `eng` and `osd`. Writing `chi_sim` there needs administrator rights,
  which the build does not have and should not need.
* A project-local directory pointed at by TESSDATA_PREFIX makes the OCR
  environment reproducible: the same language data is used on the developer
  host and inside the analysis container, and its checksums are recorded.

Tesseract resolves languages ONLY inside TESSDATA_PREFIX, so `eng` and `osd`
must be present here too, not just `chi_sim`. They are copied from the host
install rather than downloaded, so the host and the project agree byte for byte.

Variant choice: tessdata_best. Figure axis labels are short strings where a
single wrong digit changes a calibration, so accuracy matters far more than
throughput. Recorded in the manifest written next to the data.
"""
import hashlib
import json
import os
import shutil
import time
import urllib.request
from pathlib import Path

TESSDATA_DIR = Path(__file__).resolve().parent
HOST_TESSDATA = Path(r"C:\Program Files\Tesseract-OCR\tessdata")
VARIANT = "tessdata_best"
BASE_URL = f"https://github.com/tesseract-ocr/{VARIANT}/raw/main/"

DOWNLOAD_LANGS = ["chi_sim"]
COPY_FROM_HOST = ["eng", "osd"]

USER_AGENT = "biosimilar-primary-structure-analysis/0.1 (tessdata fetcher)"
MANIFEST_PATH = TESSDATA_DIR / "tessdata.manifest.json"


def sha256_of(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def download(language: str) -> dict:
    name = f"{language}.traineddata"
    url = BASE_URL + name
    destination = TESSDATA_DIR / name
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=300) as response:
        payload = response.read()
    destination.write_bytes(payload)
    return {
        "language": language,
        "fileName": name,
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
        "origin": url,
        "variant": VARIANT,
        "license": "Apache-2.0 (tesseract-ocr project)",
    }


def copy_from_host(language: str) -> dict:
    name = f"{language}.traineddata"
    source = HOST_TESSDATA / name
    if not source.exists():
        raise FileNotFoundError(f"host tessdata missing: {source}")
    destination = TESSDATA_DIR / name
    shutil.copy2(source, destination)
    return {
        "language": language,
        "fileName": name,
        "bytes": destination.stat().st_size,
        "sha256": sha256_of(destination),
        "origin": str(source),
        "variant": "host-install (Tesseract 5.5.0 bundled)",
        "license": "Apache-2.0 (tesseract-ocr project)",
    }


def main() -> int:
    entries = []
    for language in COPY_FROM_HOST:
        entry = copy_from_host(language)
        entries.append(entry)
        print(f"copied   {entry['fileName']:24s} {entry['bytes']/1024/1024:7.2f} MB")
    for language in DOWNLOAD_LANGS:
        entry = download(language)
        entries.append(entry)
        print(f"fetched  {entry['fileName']:24s} {entry['bytes']/1024/1024:7.2f} MB  {entry['variant']}")

    manifest = {
        "purpose": "Project-local Tesseract language data, referenced through TESSDATA_PREFIX",
        "createdOn": time.strftime("%Y-%m-%d"),
        "variantForDownloads": VARIANT,
        "variantRationale": (
            "Figure axis labels are short strings where one wrong digit corrupts a "
            "calibration, so accuracy is preferred over speed."
        ),
        "tessdataPrefix": str(TESSDATA_DIR),
        "hostTesseract": "5.5.0.20241111 at C:\\Program Files\\Tesseract-OCR",
        "files": entries,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    total = sum(entry["bytes"] for entry in entries)
    print(f"\n{len(entries)} files, {total/1024/1024:.2f} MB total")
    print(f"manifest: {MANIFEST_PATH}")
    print(f"set TESSDATA_PREFIX={TESSDATA_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
