# -*- coding: utf-8 -*-
"""Spectrum synthesis and text-spectrum loading."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from app.analysis.intact_mass.mzml_reader import MzmlSummary, load_ms1_average_spectrum
from app.analysis.intact_mass.constants import (
    BASELINE_NOISE_FRACTION,
    CHARGE_CENTER,
    CHARGE_ENVELOPE_WIDTH,
    CHARGE_MAX,
    CHARGE_MIN,
    MZ_GRID_MAX,
    MZ_GRID_MIN,
    MZ_GRID_POINTS,
    PEAK_SIGMA_MZ,
    PROTON_MASS,
    RANDOM_SEED,
)


def synthesize_charge_envelope(
    neutral_mass: float,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    generator = rng or np.random.default_rng(RANDOM_SEED)
    mz_grid = np.linspace(MZ_GRID_MIN, MZ_GRID_MAX, MZ_GRID_POINTS)
    intensity = np.zeros_like(mz_grid)

    for charge in range(CHARGE_MIN, CHARGE_MAX + 1):
        mz = (neutral_mass + charge * PROTON_MASS) / charge
        if not (MZ_GRID_MIN <= mz <= MZ_GRID_MAX):
            continue
        envelope_weight = np.exp(-0.5 * ((charge - CHARGE_CENTER) / CHARGE_ENVELOPE_WIDTH) ** 2)
        intensity += envelope_weight * np.exp(-0.5 * ((mz_grid - mz) / PEAK_SIGMA_MZ) ** 2)

    peak_max = intensity.max()
    intensity += generator.normal(0.0, BASELINE_NOISE_FRACTION * peak_max, size=intensity.shape)
    intensity = np.clip(intensity, 0.0, None)
    return np.column_stack([mz_grid, intensity])


def load_text_spectrum(path: Path) -> np.ndarray:
    delimiter = "," if path.suffix.lower() in {".csv"} else None
    data = np.loadtxt(path, dtype=float, delimiter=delimiter)
    if data.ndim != 2 or data.shape[1] < 2:
        raise ValueError("text spectrum must have at least two columns (m/z, intensity)")
    return data[:, :2]


SPECTRUM_FILE_SUFFIXES = frozenset({".mzml", ".mzxml"})
TEXT_SPECTRUM_SUFFIXES = frozenset({".txt", ".csv", ".tsv"})
VENDOR_SPECTRUM_SUFFIXES = frozenset({".raw", ".wiff"})


def load_spectrum(
    path: Path,
    *,
    work_dir: Path | None = None,
) -> tuple[np.ndarray, MzmlSummary | None]:
    """Load a spectrum from either a raw mzML/mzXML run or a two-column text file."""
    suffix = path.suffix.lower()
    if suffix in SPECTRUM_FILE_SUFFIXES:
        return load_ms1_average_spectrum(path, work_dir=work_dir)
    if suffix in TEXT_SPECTRUM_SUFFIXES:
        return load_text_spectrum(path), None
    if suffix in VENDOR_SPECTRUM_SUFFIXES:
        raise ValueError(
            f"vendor format {suffix} is not analysed in-place; export mzML or TXT/CSV first. "
            "Thermo RAW conversion exists as a separate P6 msconvert step and is not invoked "
            "by this adapter. SCIEX WIFF conversion has not been verified."
        )
    raise ValueError(f"unsupported spectrum format for intact-mass analysis: {suffix or 'unknown'}")
