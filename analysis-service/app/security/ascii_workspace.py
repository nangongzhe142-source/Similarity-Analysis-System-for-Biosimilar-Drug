# -*- coding: utf-8 -*-
"""ASCII workspace helpers for native binaries that break on Chinese paths (D22).

Ported from tools-poc/scripts/_openms_bootstrap.py and generalised so adapters can
request an ASCII staging directory without importing pyopenms first.
"""

from __future__ import annotations

import os
import shutil
import tempfile
import uuid
from pathlib import Path


def is_ascii_path(path: str | Path) -> bool:
    return all(ord(character) < 128 for character in str(path))


def ensure_ascii_directory(preferred: Path | None = None) -> Path:
    """Return a directory guaranteed to live under an ASCII path."""
    if preferred is not None and preferred.is_dir() and is_ascii_path(preferred):
        return preferred.resolve()

    base = Path(tempfile.gettempdir())
    if not is_ascii_path(base):
        raise RuntimeError("system temp directory is not ASCII-safe for native tools")

    target = base / "bsim-analysis-ascii" / uuid.uuid4().hex
    target.mkdir(parents=True, exist_ok=False)
    return target


def stage_tree(source: Path, preferred_parent: Path | None = None) -> Path:
    """Copy a directory tree into an ASCII workspace and return the new root."""
    if not source.is_dir():
        raise FileNotFoundError(f"source directory not found: {source.name}")
    destination_root = ensure_ascii_directory(preferred_parent)
    destination = destination_root / source.name
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination)
    return destination


def ensure_openms_data_path(source_share: Path) -> Path:
    """Point OPENMS_DATA_PATH at an ASCII copy of the pyopenms share directory."""
    if not source_share.is_dir():
        raise FileNotFoundError(f"OpenMS share directory not found: {source_share.name}")

    if is_ascii_path(source_share):
        os.environ["OPENMS_DATA_PATH"] = str(source_share)
        return source_share

    target_share = ensure_ascii_directory() / "OpenMS"
    if target_share.exists():
        shutil.rmtree(target_share)
    shutil.copytree(source_share, target_share)
    os.environ["OPENMS_DATA_PATH"] = str(target_share)
    return target_share
