# -*- coding: utf-8 -*-
"""Real mzML / mzXML spectrum reading via pyOpenMS.

Two facts drive this module's shape, both established by machine test rather than
assumption:

1. pyOpenMS raises `RuntimeError: IO error for file '...'` when the path contains
   non-ASCII characters, so every file is staged into an ASCII directory first (D22).
2. Production antibody files reach hundreds of megabytes (the PXD063988 tryptic run
   is 702 MB / 33,039 spectra), so spectra are streamed with OnDiscMSExperiment
   instead of loading the whole run into memory.
"""

from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.analysis.intact_mass.bootstrap import bootstrap_openms
from app.security.ascii_workspace import ensure_ascii_directory, is_ascii_path

MS1_LEVEL = 1
DEFAULT_MZ_BIN = 0.05
MIN_SPECTRA_FOR_AVERAGING = 1


@dataclass(frozen=True)
class MzmlSummary:
    """What was actually read out of the file, for the provenance panel."""

    file_name: str
    spectrum_count: int
    ms1_spectrum_count: int
    retention_time_range_s: tuple[float, float]
    mz_range: tuple[float, float]
    averaged_spectrum_count: int


def stage_for_native_tool(path: Path, work_dir: Path | None = None) -> Path:
    """Copy a file into an ASCII-safe directory when needed (D22)."""
    if is_ascii_path(path):
        return path
    destination_root = work_dir if work_dir is not None and is_ascii_path(work_dir) else ensure_ascii_directory()
    destination_root.mkdir(parents=True, exist_ok=True)
    destination = destination_root / _ascii_safe_name(path)
    if not destination.is_file() or destination.stat().st_size != path.stat().st_size:
        shutil.copy2(path, destination)
    return destination


def _ascii_safe_name(path: Path) -> str:
    stem = "".join(character if ord(character) < 128 else "_" for character in path.stem)
    return f"{stem or 'spectrum'}{path.suffix}"


def load_ms1_average_spectrum(
    path: Path,
    *,
    work_dir: Path | None = None,
    retention_time_range_s: tuple[float, float] | None = None,
    mz_bin: float = DEFAULT_MZ_BIN,
) -> tuple[np.ndarray, MzmlSummary]:
    """Average the MS1 spectra of a run into a single m/z-intensity array.

    Intact-mass deconvolution consumes one averaged MS1 spectrum, which is how the
    charge envelope of the eluting protein is normally summed before deconvolution.
    """
    bootstrap_openms()
    import pyopenms  # noqa: WPS433 — must follow the OPENMS_DATA_PATH bootstrap

    staged = stage_for_native_tool(path, work_dir)
    experiment = pyopenms.OnDiscMSExperiment()
    if not experiment.openFile(str(staged)):
        raise ValueError(f"pyOpenMS could not open spectra file: {path.name}")

    spectrum_count = experiment.getNrSpectra()
    if spectrum_count == 0:
        raise ValueError(f"spectra file contains no spectra: {path.name}")

    mz_arrays: list[np.ndarray] = []
    intensity_arrays: list[np.ndarray] = []
    retention_times: list[float] = []
    ms1_spectrum_count = 0

    for index in range(spectrum_count):
        spectrum = experiment.getSpectrum(index)
        if spectrum.getMSLevel() != MS1_LEVEL:
            continue
        ms1_spectrum_count += 1
        retention_time = spectrum.getRT()
        if retention_time_range_s is not None:
            low, high = retention_time_range_s
            if not (low <= retention_time <= high):
                continue
        mz, intensity = spectrum.get_peaks()
        if len(mz) == 0:
            continue
        mz_arrays.append(np.asarray(mz, dtype=float))
        intensity_arrays.append(np.asarray(intensity, dtype=float))
        retention_times.append(retention_time)

    if len(mz_arrays) < MIN_SPECTRA_FOR_AVERAGING:
        raise ValueError(f"no MS1 spectra selected in {path.name}")

    averaged = _bin_and_average(mz_arrays, intensity_arrays, mz_bin)
    summary = MzmlSummary(
        file_name=path.name,
        spectrum_count=spectrum_count,
        ms1_spectrum_count=ms1_spectrum_count,
        retention_time_range_s=(min(retention_times), max(retention_times)),
        mz_range=(float(averaged[:, 0].min()), float(averaged[:, 0].max())),
        averaged_spectrum_count=len(mz_arrays),
    )
    return averaged, summary


def _bin_and_average(
    mz_arrays: list[np.ndarray],
    intensity_arrays: list[np.ndarray],
    mz_bin: float,
) -> np.ndarray:
    """Sum spectra onto a shared m/z grid, then divide by the spectrum count.

    A shared grid is required because consecutive scans do not share m/z sampling
    points, so the arrays cannot be added element-wise.
    """
    assert mz_bin > 0, "mz_bin must be positive"

    mz_min = min(float(array.min()) for array in mz_arrays)
    mz_max = max(float(array.max()) for array in mz_arrays)
    if mz_max <= mz_min:
        raise ValueError("degenerate m/z range in spectra")

    bin_count = int(np.ceil((mz_max - mz_min) / mz_bin)) + 1
    grid = mz_min + mz_bin * np.arange(bin_count)
    accumulated = np.zeros(bin_count, dtype=float)

    for mz, intensity in zip(mz_arrays, intensity_arrays):
        indices = np.clip(((mz - mz_min) / mz_bin).astype(int), 0, bin_count - 1)
        np.add.at(accumulated, indices, intensity)

    accumulated /= len(mz_arrays)
    return np.column_stack([grid, accumulated])
