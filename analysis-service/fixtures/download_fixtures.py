#!/usr/bin/env python3
"""Download the public MS fixtures declared in manifest.json from PRIDE Archive.

Why this is not a three-line urlretrieve script:

* PRIDE FTP is blocked on the development host (WinError 10060), so everything
  goes over HTTPS with Range-based resume.
* Files reach 760 MB, so a partial download must be resumable rather than
  restarted, and progress has to be observable.
* Every downloaded byte is hashed. The observed SHA-256 is written to a lock
  file so a later run — or another machine — can prove it got the same bytes.
  A fixture without a recorded hash is not evidence.
* File names inside a dataset are resolved from the PRIDE API rather than
  hardcoded, so "all 36 CSVs" stays correct if the deposition changes.

Usage:
    python download_fixtures.py                 # download the manifest plan
    python download_fixtures.py --dry-run       # resolve URLs and sizes only
    python download_fixtures.py --verify        # re-hash what is already on disk
    python download_fixtures.py --only PXD023358
    python download_fixtures.py --small-only    # skip explicit large files
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

FIXTURES_DIR = Path(__file__).resolve().parent
MANIFEST_PATH = FIXTURES_DIR / "manifest.json"
LOCK_PATH = FIXTURES_DIR / "fixtures.lock.json"

USER_AGENT = "biosimilar-primary-structure-analysis/0.1 (research fixture downloader)"
CHUNK_BYTES = 1024 * 1024
NETWORK_TIMEOUT_SECONDS = 180
MAX_API_PAGES = 40
API_PAGE_SIZE = 100
RETRY_ATTEMPTS = 4
RETRY_BACKOFF_SECONDS = 5

# The PRIDE HTTPS endpoint drops long transfers mid-stream: the socket simply
# ends and read() returns b"" without raising, at a byte offset that varies from
# one attempt to the next (47,761 and 104,972,288 both observed on the same
# 797,649,988-byte file). A short read is therefore a transport failure, not a
# finished download, and must be retried with Range rather than accepted.
#
# Consecutive failures that make no progress are capped by RETRY_ATTEMPTS, but
# an attempt that does advance the file resets that budget: a 760 MB file that
# survives only ~100 MB per connection needs more than four connections, while a
# genuinely dead URL still stops after four fruitless tries.
MAX_STALLED_ATTEMPTS = 8
# Absolute ceiling, so a server that dribbles a few bytes per connection cannot
# keep the loop alive forever.
MAX_TOTAL_ATTEMPTS = 400

# Observed on PXD063988: an open-ended `Range: bytes=N-` request survives
# 40-240 MB and is then cut, after which the server refuses reconnects for a
# while. Asking for a bounded window instead keeps every request short-lived,
# so it usually completes before the server cuts it, and a failure costs one
# window rather than the whole tail of the file.
RANGE_WINDOW_BYTES = 32 * 1024 * 1024
MAX_BACKOFF_SECONDS = 120


class ShortRead(ConnectionError):
    """Stream ended before the requested byte count was reached."""

# A resolved filename must be a plain name: no separators, no parent traversal,
# no drive letters. Fixture names come from a remote API, so they are untrusted
# input even though the source is reputable.
SAFE_FILENAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._+-]{0,200}$")


def human_bytes(count: int | None) -> str:
    if count is None:
        return "unknown"
    size = float(count)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"


def open_url(url: str, extra_headers: dict[str, str] | None = None):
    headers = {"User-Agent": USER_AGENT}
    if extra_headers:
        headers.update(extra_headers)
    request = urllib.request.Request(url, headers=headers)
    return urllib.request.urlopen(request, timeout=NETWORK_TIMEOUT_SECONDS)


def fetch_json(url: str):
    with open_url(url) as response:
        return json.loads(response.read().decode("utf-8"))


def assert_safe_filename(file_name: str) -> None:
    """Reject anything that could escape the fixtures directory."""
    if not SAFE_FILENAME.match(file_name):
        raise ValueError(f"unsafe fixture file name rejected: {file_name!r}")
    if file_name in {".", ".."}:
        raise ValueError(f"unsafe fixture file name rejected: {file_name!r}")


def list_dataset_files(api_base: str, accession: str) -> list[dict]:
    """Return every file record PRIDE reports for one dataset."""
    records: list[dict] = []
    for page in range(MAX_API_PAGES):
        url = f"{api_base}/projects/{accession}/files?pageSize={API_PAGE_SIZE}&page={page}"
        payload = fetch_json(url)
        rows = payload if isinstance(payload, list) else (
            payload.get("_embedded", {}).get("files", [])
        )
        if not rows:
            break
        records.extend(rows)
    return records


def extension_of(file_name: str) -> str:
    return file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""


def select_files(dataset: dict, available: list[dict], include_large: bool) -> list[dict]:
    """Resolve the manifest selection rules against the real file listing."""
    wanted_extensions = {e.lower() for e in dataset.get("selectByExtension", [])}
    explicit_names = {
        entry["fileName"] for entry in dataset.get("explicitFiles", [])
    } if include_large else set()

    # Files an extension rule would otherwise sweep in but that must be skipped,
    # each with a reason recorded in the manifest. Applied last so it overrides
    # every selection rule.
    excluded_names = {
        entry["fileName"] for entry in dataset.get("excludeFiles", [])
    }

    # SCIEX wiff needs its .scan sibling or msconvert cannot read it at all.
    wiff_names: set[str] = set()
    for stem in dataset.get("wiffPairs", []):
        wiff_names.add(f"{stem}.wiff")
        wiff_names.add(f"{stem}.wiff.scan")

    selected: list[dict] = []
    seen: set[str] = set()
    for record in available:
        file_name = record.get("fileName", "")
        if not file_name or file_name in seen:
            continue
        if file_name in excluded_names:
            continue
        take = (
            extension_of(file_name) in wanted_extensions
            or file_name in explicit_names
            or file_name in wiff_names
        )
        if take:
            seen.add(file_name)
            selected.append(record)

    missing = (explicit_names | wiff_names) - seen
    for name in sorted(missing):
        print(f"    !! declared in manifest but not found in the deposition: {name}")
    return selected


def fetch_window(url: str, partial: Path, start: int, stop: int) -> int:
    """Append bytes [start, stop] of url to partial. Returns bytes appended.

    Raises ShortRead when the server delivers less than the requested window,
    so the caller can retry the remainder rather than accept a truncated file.
    """
    headers = {"Range": f"bytes={start}-{stop}"}
    wanted = stop - start + 1
    appended = 0
    with open_url(url, headers) as response:
        if response.status != 206:
            raise ShortRead(
                f"server answered {response.status} instead of 206 for a range request"
            )
        with partial.open("ab") as handle:
            while True:
                chunk = response.read(CHUNK_BYTES)
                if not chunk:
                    break
                handle.write(chunk)
                appended += len(chunk)
    if appended < wanted:
        raise ShortRead(f"window gave {appended} of {wanted} bytes")
    return appended


def stream_whole(url: str, partial: Path, expected_bytes: int | None) -> int:
    """Fallback for servers that will not honour Range: one streaming pass."""
    written = 0
    with open_url(url) as response:
        with partial.open("wb") as handle:
            while True:
                chunk = response.read(CHUNK_BYTES)
                if not chunk:
                    break
                handle.write(chunk)
                written += len(chunk)
    if expected_bytes and written < expected_bytes:
        raise ShortRead(f"stream ended at {written} of {expected_bytes} bytes")
    return written


def download_one(url: str, destination: Path, expected_bytes: int | None) -> tuple[str, int]:
    """Download with bounded Range windows and resume. Returns (sha256, bytes).

    The window loop exists because the PRIDE endpoint cuts long transfers at a
    byte offset that varies per attempt, and then refuses reconnects for a
    while. Requesting 32 MB at a time keeps each request inside the window the
    server tolerates, and an interrupted window only costs that window.
    """
    destination.parent.mkdir(parents=True, exist_ok=True)
    partial = destination.with_suffix(destination.suffix + ".part")

    already = partial.stat().st_size if partial.exists() else 0
    if already and expected_bytes and already > expected_bytes:
        print("      partial file is larger than expected, restarting")
        partial.unlink()
        already = 0

    if not expected_bytes:
        # Without a declared size neither windowing nor truncation detection is
        # possible, so fall back to a single pass and let the caller's hash be
        # the only record of what arrived.
        partial.unlink(missing_ok=True)
        stream_whole(url, partial, None)
    else:
        started = time.monotonic()
        start_offset = already
        stalled = 0
        attempt = 0
        reported_pct = -1
        while already < expected_bytes:
            attempt += 1
            if attempt > MAX_TOTAL_ATTEMPTS:
                raise IOError(
                    f"{destination.name}: hit the {MAX_TOTAL_ATTEMPTS}-request ceiling "
                    f"at {human_bytes(already)} of {human_bytes(expected_bytes)}"
                )
            stop = min(already + RANGE_WINDOW_BYTES, expected_bytes) - 1
            try:
                fetch_window(url, partial, already, stop)
            except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
                gained = partial.stat().st_size - already
                already = partial.stat().st_size
                stalled = 0 if gained > 0 else stalled + 1
                if stalled >= MAX_STALLED_ATTEMPTS:
                    raise IOError(
                        f"{destination.name}: stalled at {human_bytes(already)} of "
                        f"{human_bytes(expected_bytes)} after {MAX_STALLED_ATTEMPTS} "
                        f"requests with no progress, last error: {exc}"
                    ) from exc
                # Escalate only while stalling; a window that made progress waits
                # the base interval so the server is not hammered but the tail of
                # a large file still moves.
                wait = min(
                    RETRY_BACKOFF_SECONDS * 2 ** max(stalled - 1, 0),
                    MAX_BACKOFF_SECONDS,
                )
                print(f"      window at {human_bytes(already)} interrupted ({exc}); "
                      f"gained {human_bytes(gained)}, retrying in {wait}s")
                time.sleep(wait)
                continue

            stalled = 0
            already = partial.stat().st_size
            if already > expected_bytes:
                raise IOError(
                    f"{destination.name}: server sent past the requested range, "
                    f"{already} bytes on disk against a declared {expected_bytes}"
                )
            pct = int(already / expected_bytes * 100)
            if pct >= reported_pct + 5 or already >= expected_bytes:
                rate = (already - start_offset) / max(time.monotonic() - started, 1e-6)
                print(f"      {human_bytes(already)} / {human_bytes(expected_bytes)} "
                      f"({pct}%) at {human_bytes(int(rate))}/s")
                reported_pct = pct

    actual = partial.stat().st_size
    if expected_bytes and actual != expected_bytes:
        raise IOError(
            f"size mismatch for {destination.name}: got {actual}, expected {expected_bytes}"
        )

    digest = hashlib.sha256()
    with partial.open("rb") as handle:
        for block in iter(lambda: handle.read(CHUNK_BYTES), b""):
            digest.update(block)
    partial.replace(destination)
    return digest.hexdigest(), actual


def hash_existing(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(CHUNK_BYTES), b""):
            digest.update(block)
    return digest.hexdigest()


def load_lock() -> dict:
    if LOCK_PATH.exists():
        return json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    return {"lockVersion": "1.0.0", "datasets": {}}


def save_lock(lock: dict) -> None:
    lock["updatedOn"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    LOCK_PATH.write_text(
        json.dumps(lock, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                       help="resolve URLs and sizes without downloading")
    parser.add_argument("--verify", action="store_true",
                       help="re-hash files already on disk against the lock file")
    parser.add_argument("--only", metavar="ACCESSION",
                       help="restrict to one dataset")
    parser.add_argument("--small-only", action="store_true",
                       help="skip the explicit large files (RAW / mzML / wiff.scan)")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    api_base = manifest["repository"]["apiBase"]
    file_base = manifest["repository"]["fileBase"]
    lock = load_lock()

    datasets = manifest["datasets"]
    if args.only:
        datasets = [d for d in datasets if d["accession"] == args.only]
        if not datasets:
            print(f"no dataset named {args.only} in the manifest")
            return 2

    grand_bytes = 0
    grand_files = 0
    failures: list[str] = []

    for dataset in datasets:
        accession = dataset["accession"]
        print("\n" + "=" * 96)
        print(f"{accession} — {dataset['title'][:78]}")
        print(f"  product : {dataset['product']}")
        print(f"  license : {dataset['license']}   profiles: {dataset['servesProfiles']}")
        print("=" * 96)

        target_dir = FIXTURES_DIR / accession
        try:
            available = list_dataset_files(api_base, accession)
        except Exception as exc:
            print(f"  !! could not list files: {exc}")
            failures.append(f"{accession}: file listing failed")
            continue
        print(f"  deposition holds {len(available)} files")

        selected = select_files(dataset, available, include_large=not args.small_only)
        planned = sum(r.get("fileSizeBytes") or 0 for r in selected)
        print(f"  selected {len(selected)} files, {human_bytes(planned)}")

        dataset_lock = lock["datasets"].setdefault(accession, {
            "pathPrefix": dataset["pathPrefix"],
            "license": dataset["license"],
            "files": {},
        })

        for record in sorted(selected, key=lambda r: r.get("fileSizeBytes") or 0):
            file_name = record["fileName"]
            try:
                assert_safe_filename(file_name)
            except ValueError as exc:
                print(f"    !! {exc}")
                failures.append(f"{accession}/{file_name}: unsafe name")
                continue

            expected = record.get("fileSizeBytes") or None
            url = f"{file_base}/{dataset['pathPrefix']}/{file_name}"
            destination = target_dir / file_name

            if args.dry_run:
                print(f"    [dry-run] {file_name}  {human_bytes(expected)}")
                print(f"              {url}")
                continue

            if args.verify:
                if not destination.exists():
                    print(f"    [missing] {file_name}")
                    failures.append(f"{accession}/{file_name}: missing")
                    continue
                actual = hash_existing(destination)
                recorded = dataset_lock["files"].get(file_name, {}).get("sha256")
                state = "OK" if actual == recorded else (
                    "NO-LOCK-ENTRY" if recorded is None else "HASH MISMATCH")
                print(f"    [{state}] {file_name}")
                if state == "HASH MISMATCH":
                    failures.append(f"{accession}/{file_name}: hash mismatch")
                continue

            if destination.exists() and file_name in dataset_lock["files"]:
                entry = dataset_lock["files"][file_name]
                if destination.stat().st_size == entry.get("bytes"):
                    print(f"    [have] {file_name}  {human_bytes(entry.get('bytes'))}")
                    grand_files += 1
                    grand_bytes += entry.get("bytes") or 0
                    continue

            print(f"    [get ] {file_name}  {human_bytes(expected)}")
            try:
                digest, actual_bytes = download_one(url, destination, expected)
            except Exception as exc:
                print(f"      !! FAILED: {exc}")
                failures.append(f"{accession}/{file_name}: {exc}")
                continue
            dataset_lock["files"][file_name] = {
                "bytes": actual_bytes,
                "sha256": digest,
                "url": url,
                "downloadedOn": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            save_lock(lock)
            grand_files += 1
            grand_bytes += actual_bytes
            print(f"      ok  sha256={digest[:32]}…  {human_bytes(actual_bytes)}")

    if not args.dry_run and not args.verify:
        save_lock(lock)

    print("\n" + "=" * 96)
    print(f"files: {grand_files}   bytes: {human_bytes(grand_bytes)}   failures: {len(failures)}")
    for line in failures:
        print(f"  FAIL {line}")
    print("=" * 96)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
