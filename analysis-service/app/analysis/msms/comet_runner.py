# -*- coding: utf-8 -*-
"""Comet search-engine wrapper with ASCII workspace staging (D22)."""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

from app.analysis.msms.constants import FDR_THRESHOLD, PRECURSOR_TOLERANCE_PPM
from app.analysis.msms.fdr import filter_psms_at_fdr
from app.analysis.msms.psm_parser import PeptideSpectrumMatch, parse_sqt
from app.security.ascii_workspace import ensure_ascii_directory, is_ascii_path


COMET_VERSION_PATTERN = re.compile(r'Comet version\s+"([^"]+)"')


@dataclass(frozen=True)
class CometSearchResult:
    input_label: str
    raw_psm_count: int
    filtered_psms: tuple[PeptideSpectrumMatch, ...]
    fdr_at_threshold: float
    sqt_path: Path | None
    pepxml_path: Path | None


def resolve_comet_executable() -> Path | None:
    """Locate Comet binary from env, bundled tools, or prior download."""
    env_path = os.environ.get("COMET_PATH")
    if env_path:
        candidate = Path(env_path)
        if candidate.is_file():
            return candidate.resolve()

    service_root = Path(__file__).resolve().parents[3]
    bundled = service_root / "tools" / "comet" / "win64" / "comet.exe"
    if bundled.is_file():
        return bundled.resolve()

    temp_candidate = Path(tempfile.gettempdir()) / "bsim-comet" / "comet.exe"
    if temp_candidate.is_file():
        return temp_candidate.resolve()
    return None


def comet_version() -> str | None:
    executable = resolve_comet_executable()
    if executable is None:
        return None
    completed = subprocess.run(
        [str(executable)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    combined = (completed.stdout or "") + (completed.stderr or "")
    match = COMET_VERSION_PATTERN.search(combined)
    return match.group(1) if match else None


def comet_available() -> bool:
    return resolve_comet_executable() is not None


def _stage_input(path: Path, ascii_dir: Path) -> Path:
    if is_ascii_path(path):
        return path.resolve()
    destination = ascii_dir / path.name
    shutil.copy2(path, destination)
    return destination


def _stage_fasta(path: Path, ascii_dir: Path) -> Path:
    staged = _stage_input(path, ascii_dir)
    text = staged.read_text(encoding="utf-8")
    if not text.startswith(">"):
        text = f">search_target\n{text.strip()}\n"
        staged.write_text(text, encoding="utf-8")
    return staged


def _write_params(params_path: Path, fasta_path: Path, comet_executable: Path) -> None:
    completed = subprocess.run(
        [str(comet_executable), "-p"],
        cwd=str(params_path.parent),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError("comet -p failed to generate default parameters")

    params_new = params_path.parent / "comet.params.new"
    if not params_new.is_file():
        raise FileNotFoundError("comet.params.new was not created")

    text = params_new.read_text(encoding="utf-8")
    replacements = {
        "database_name = /some/path/db.fasta": f"database_name = {fasta_path}",
        "decoy_search = 0": "decoy_search = 1",
        "output_sqtfile = 0": "output_sqtfile = 1",
        "output_pepxmlfile = 1": "output_pepxmlfile = 1",
        "peptide_mass_tolerance = 3.000000": f"peptide_mass_tolerance = {PRECURSOR_TOLERANCE_PPM:.6f}",
    }
    for old, new in replacements.items():
        if old in text:
            text = text.replace(old, new, 1)
    params_path.write_text(text, encoding="ascii")


def run_comet_search(
    *,
    spectra_path: Path,
    fasta_path: Path,
    work_dir: Path | None = None,
    input_label: str | None = None,
    fdr_threshold: float = FDR_THRESHOLD,
) -> CometSearchResult:
    comet_executable = resolve_comet_executable()
    if comet_executable is None:
        raise RuntimeError("Comet executable not found; set COMET_PATH or install under analysis-service/tools/comet/")

    ascii_dir = work_dir or ensure_ascii_directory()
    ascii_dir.mkdir(parents=True, exist_ok=True)

    staged_spectra = _stage_input(spectra_path, ascii_dir)
    staged_fasta = _stage_fasta(fasta_path, ascii_dir)
    params_path = ascii_dir / "comet.params"
    _write_params(params_path, staged_fasta, comet_executable)

    completed = subprocess.run(
        [str(comet_executable), str(staged_spectra)],
        cwd=str(ascii_dir),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=3600,
        check=False,
    )
    if completed.returncode != 0:
        tail = (completed.stderr or completed.stdout or "")[-500:]
        raise RuntimeError(f"Comet search failed: {tail}")

    sqt_path = ascii_dir / f"{staged_spectra.stem}.sqt"
    pepxml_path = ascii_dir / f"{staged_spectra.stem}.pep.xml"
    raw_psms = parse_sqt(sqt_path) if sqt_path.is_file() else []
    filtered = filter_psms_at_fdr(raw_psms, threshold=fdr_threshold)

    return CometSearchResult(
        input_label=input_label or staged_spectra.stem,
        raw_psm_count=len(raw_psms),
        filtered_psms=filtered.accepted,
        fdr_at_threshold=filtered.fdr_at_threshold,
        sqt_path=sqt_path if sqt_path.is_file() else None,
        pepxml_path=pepxml_path if pepxml_path.is_file() else None,
    )
