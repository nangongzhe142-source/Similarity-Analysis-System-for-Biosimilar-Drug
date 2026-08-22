# -*- coding: utf-8 -*-
"""pyOpenMS bootstrap for non-ASCII workspace paths (D22)."""

from __future__ import annotations

import site
from pathlib import Path

from app.security.ascii_workspace import ensure_openms_data_path


def bootstrap_openms() -> Path:
    """Set OPENMS_DATA_PATH before importing pyopenms."""
    for base in site.getsitepackages():
        share = Path(base) / "pyopenms" / "share" / "OpenMS"
        if share.is_dir():
            return ensure_openms_data_path(share)
    raise FileNotFoundError("pyopenms OpenMS share directory not found; install pyopenms first")
