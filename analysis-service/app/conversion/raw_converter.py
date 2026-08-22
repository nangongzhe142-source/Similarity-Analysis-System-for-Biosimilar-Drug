# -*- coding: utf-8 -*-
"""Vendor RAW to mzML conversion via the ProteoWizard Docker image (D12)."""

from __future__ import annotations

import subprocess
from pathlib import Path

PWIZ_IMAGE = "chambm/pwiz-skyline-i-agree-to-the-vendor-licenses"
CONVERSION_TIMEOUT_SECONDS = 300

# msconvert is a Windows executable that the image runs under Wine, so it is not on
# the container PATH and a bare "msconvert" fails with exit 127.
#
# The image's own CMD is ["wine64_anyuser", "msconvert"], but that wrapper is broken
# in the current image: it shells out to `sudo wine64`, and Wine 10.6 (the version
# this image ships) merged wine64 into a single `wine` binary, so it exits 1 with
# "sudo: wine64: command not found". The `mywine` wrapper is used instead — it
# provisions a per-user wineprefix and invokes `wine` under its real name.
PWIZ_WINE_LAUNCHER = "mywine"
MSCONVERT_COMMAND = "msconvert"


class RawConversionError(RuntimeError):
    pass


def convert_raw_to_mzml(raw_path: Path, output_dir: Path) -> Path:
    """Convert a Thermo RAW file to mzML using msconvert inside Docker.

    Host paths may contain non-ASCII characters (D22); only in-container paths are
    used when invoking msconvert.
    """
    if not raw_path.is_file():
        raise RawConversionError("input RAW file not found")
    output_dir.mkdir(parents=True, exist_ok=True)

    input_mount = raw_path.parent.resolve()
    output_mount = output_dir.resolve()
    container_input = f"/in/{raw_path.name}"
    container_output = "/out"

    command = [
        "docker",
        "run",
        "--rm",
        "-v",
        f"{input_mount}:/in:ro",
        "-v",
        f"{output_mount}:/out",
        PWIZ_IMAGE,
        PWIZ_WINE_LAUNCHER,
        MSCONVERT_COMMAND,
        container_input,
        "-o",
        container_output,
        "--mzML",
    ]
    # No "-e" extension override: msconvert treats its argument as a literal suffix
    # rather than a format name, so "-e mzML" yields "BSA-FT-HCDmzML" with no dot.
    # The "--mzML" flag already selects both the format and the .mzML extension.

    try:
        completed = subprocess.run(
            command,
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=CONVERSION_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired as exc:
        raise RawConversionError("msconvert timed out") from exc
    except FileNotFoundError as exc:
        raise RawConversionError("docker CLI is not available") from exc

    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout or "").strip()
        message = f"msconvert failed with exit code {completed.returncode}"
        if detail:
            message = f"{message}: {detail[:500]}"
        raise RawConversionError(message)

    candidates = sorted(output_dir.glob("*.mzML"), key=lambda path: path.stat().st_mtime, reverse=True)
    if not candidates:
        raise RawConversionError("msconvert produced no mzML output")
    return candidates[0]
