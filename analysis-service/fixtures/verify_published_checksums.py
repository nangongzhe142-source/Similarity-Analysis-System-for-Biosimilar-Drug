# -*- coding: utf-8 -*-
"""Verify downloaded fixtures against the checksum manifest the depositors
uploaded, rather than against our own recomputation.

Why this is separate from `download_fixtures.py --verify`:

`--verify` re-hashes the files on disk and compares them with the SHA-256 we
recorded in fixtures.lock.json at download time. That proves the bytes have not
changed since we wrote them. It cannot prove those bytes are what the
submitters produced, because both numbers come from us.

Each PRIDE deposition ships its own `checksum.txt` with SHA-1 digests computed
on the submitters' machines. Checking against that is an independent witness, so
a truncated or silently corrupted transfer is caught by someone else's number.
This matters here specifically: the PRIDE HTTPS endpoint cuts long transfers
mid-stream, and the two mzML fixtures each needed dozens of resumed range
windows to assemble.

Usage:
    python verify_published_checksums.py            # every dataset
    python verify_published_checksums.py PXD063988  # one dataset

Exit code is non-zero when any file mismatches, so this can gate a build.
"""
import hashlib
import re
import sys
from pathlib import Path

FIXTURES_DIR = Path(__file__).resolve().parent
CHECKSUM_FILE_NAME = "checksum.txt"
READ_BLOCK_BYTES = 4 * 1024 * 1024

HEX_ONLY = re.compile(r"^[0-9a-fA-F]{32,64}$")
DIGEST_ALGORITHMS = {32: "md5", 40: "sha1", 64: "sha256"}


def basename_of(raw: str) -> str:
    """Depositor manifests carry Windows drive paths and UNC paths, which
    pathlib would not split on a POSIX host, so break on both separators."""
    return re.split(r"[\\/]", raw.strip())[-1]


def parse_checksums(path: Path) -> dict[str, str]:
    """Map file name to digest, accepting either column order.

    Observed formats: `<UNC path>\\t<sha1>` in PXD063988, and the more common
    `<digest>  <name>` layout. Comment lines start with '#'.
    """
    mapping: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        fields = [field for field in re.split(r"\t+|\s{2,}| ", line) if field]
        if len(fields) < 2:
            continue
        if HEX_ONLY.match(fields[-1]):
            digest, name = fields[-1], " ".join(fields[:-1])
        elif HEX_ONLY.match(fields[0]):
            digest, name = fields[0], " ".join(fields[1:])
        else:
            continue
        mapping[basename_of(name)] = digest.lower()
    return mapping


def digest_of(path: Path, algorithm: str) -> str:
    hasher = hashlib.new(algorithm)
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(READ_BLOCK_BYTES), b""):
            hasher.update(block)
    return hasher.hexdigest()


def verify_dataset(dataset_dir: Path) -> tuple[int, int, int]:
    """Returns (ok, mismatched, unlisted)."""
    checksum_path = dataset_dir / CHECKSUM_FILE_NAME
    if not checksum_path.exists():
        print(f"{dataset_dir.name}: no {CHECKSUM_FILE_NAME}, cannot verify independently")
        return 0, 0, 0

    published = parse_checksums(checksum_path)
    sample = next(iter(published.values()), "")
    algorithm = DIGEST_ALGORITHMS.get(len(sample))
    print(f"\n=== {dataset_dir.name}")
    print(f"  {CHECKSUM_FILE_NAME} lists {len(published)} files, "
          f"digest length {len(sample)} -> {algorithm}")
    if algorithm is None:
        print("  unrecognised digest length, cannot verify")
        return 0, 0, 0

    ok = mismatched = unlisted = 0
    for path in sorted(dataset_dir.iterdir()):
        if not path.is_file():
            continue
        if path.name == CHECKSUM_FILE_NAME or path.suffix == ".part":
            continue
        expected = published.get(path.name)
        if expected is None:
            print(f"  [not listed] {path.name}")
            unlisted += 1
            continue
        actual = digest_of(path, algorithm)
        if actual == expected:
            ok += 1
            # Only announce the large ones; they are the transfers that can
            # silently truncate and the ones worth seeing confirmed.
            if path.stat().st_size > 50 * 1024 * 1024:
                print(f"  [OK] {path.name}")
                print(f"       {path.stat().st_size:,} bytes  {algorithm}={actual}")
        else:
            mismatched += 1
            print(f"  [MISMATCH] {path.name}")
            print(f"       published: {expected}")
            print(f"       computed : {actual}")
    print(f"  verified {ok} files, {mismatched} mismatched, {unlisted} not listed")
    return ok, mismatched, unlisted


def main(argv: list[str]) -> int:
    wanted = {arg for arg in argv[1:] if not arg.startswith("-")}
    dataset_dirs = sorted(
        directory for directory in FIXTURES_DIR.glob("PXD*") if directory.is_dir()
    )
    if wanted:
        dataset_dirs = [d for d in dataset_dirs if d.name in wanted]
        missing = wanted - {d.name for d in dataset_dirs}
        for name in sorted(missing):
            print(f"{name}: no such directory under {FIXTURES_DIR}")
        if missing:
            return 2

    if not dataset_dirs:
        print(f"no PXD* directories under {FIXTURES_DIR}")
        return 2

    total_ok = total_bad = total_unlisted = 0
    for dataset_dir in dataset_dirs:
        ok, bad, unlisted = verify_dataset(dataset_dir)
        total_ok += ok
        total_bad += bad
        total_unlisted += unlisted

    print("\n" + "=" * 80)
    print(f"verified against depositor checksums: {total_ok} OK, "
          f"{total_bad} mismatched, {total_unlisted} not listed")
    print("=" * 80)
    if total_bad:
        print("A mismatch means the bytes on disk are not what the submitters")
        print("produced. Delete the affected file and download it again.")
    return 1 if total_bad else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
