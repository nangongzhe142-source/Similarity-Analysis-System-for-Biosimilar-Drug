# -*- coding: utf-8 -*-
"""UniDec deconvolution wrapper."""

from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.analysis.intact_mass.constants import (
    CHARGE_MAX,
    CHARGE_MIN,
    MASS_BIN_DA,
    MASS_SEARCH_LOWER_DA,
    MASS_SEARCH_UPPER_DA,
)
from app.security.ascii_workspace import ensure_ascii_directory


@dataclass(frozen=True)
class DeconvolutionResult:
    label: str
    status: str
    base_peak_mass_da: float | None = None
    all_peak_masses_da: tuple[float, ...] = ()
    peak_count: int = 0
    r_squared: float | None = None
    elapsed_seconds: float = 0.0
    spectrum_path: str | None = None


def deconvolve_spectrum(
    spectrum: np.ndarray,
    label: str,
    work_dir: Path | None = None,
    *,
    mass_range_da: tuple[float, float] = (MASS_SEARCH_LOWER_DA, MASS_SEARCH_UPPER_DA),
    charge_range: tuple[int, int] = (CHARGE_MIN, CHARGE_MAX),
    mass_bin_da: float = MASS_BIN_DA,
) -> DeconvolutionResult:
    from unidec.engine import UniDec  # noqa: WPS433 — optional heavy dependency

    mass_lower, mass_upper = mass_range_da
    charge_lower, charge_upper = charge_range
    assert mass_upper > mass_lower, "mass search upper bound must exceed the lower bound"
    assert charge_upper >= charge_lower, "charge upper bound must not be below the lower bound"

    ascii_work_dir = work_dir or ensure_ascii_directory()
    ascii_work_dir.mkdir(parents=True, exist_ok=True)
    spectrum_path = ascii_work_dir / f"{label}.txt"
    np.savetxt(spectrum_path, spectrum, fmt="%.6f")

    started = time.perf_counter()
    engine = UniDec()
    engine.open_file(spectrum_path.name, str(ascii_work_dir))
    engine.config.masslb = mass_lower
    engine.config.massub = mass_upper
    engine.config.massbins = mass_bin_da
    engine.config.startz = charge_lower
    engine.config.endz = charge_upper
    engine.process_data()
    engine.run_unidec(silent=True)
    engine.pick_peaks()
    elapsed_seconds = time.perf_counter() - started

    peaks = sorted(engine.pks.peaks, key=lambda peak: float(peak.height), reverse=True)
    if not peaks:
        return DeconvolutionResult(
            label=label,
            status="NO_PEAKS",
            elapsed_seconds=round(elapsed_seconds, 3),
            spectrum_path=str(spectrum_path),
        )

    return DeconvolutionResult(
        label=label,
        status="OK",
        base_peak_mass_da=float(peaks[0].mass),
        all_peak_masses_da=tuple(sorted(float(peak.mass) for peak in peaks)),
        peak_count=len(peaks),
        r_squared=float(engine.config.error),
        elapsed_seconds=round(elapsed_seconds, 3),
        spectrum_path=str(spectrum_path),
    )


def unidec_version() -> str:
    from importlib.metadata import version

    return version("unidec")
