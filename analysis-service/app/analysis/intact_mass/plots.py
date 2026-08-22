# -*- coding: utf-8 -*-
"""Mirror-plot rendering for intact-mass results."""

from __future__ import annotations

from pathlib import Path

from app.analysis.plots import write_mirror_mass_plot as write_shared_mirror_mass_plot


def write_mirror_mass_plot(
    reference_masses: list[float],
    candidate_masses: list[float],
    output_path: Path,
    *,
    reference_label: str,
    candidate_label: str,
) -> Path:
    return write_shared_mirror_mass_plot(
        reference_masses,
        candidate_masses,
        output_path,
        reference_label=reference_label,
        candidate_label=candidate_label,
    )
