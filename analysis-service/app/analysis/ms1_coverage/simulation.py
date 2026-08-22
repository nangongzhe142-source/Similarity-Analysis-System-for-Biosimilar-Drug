# -*- coding: utf-8 -*-
"""Synthetic observed-mass generation for demo and golden tests."""

from __future__ import annotations

import numpy as np

from app.analysis.ms1_coverage.constants import (
    MASS_MEASUREMENT_SIGMA_PPM,
    RANDOM_SEED,
    UNDETECTED_FRACTION,
)
from app.analysis.ms1_coverage.digestion import TheoreticalPeptide


def simulate_observed_masses(
    peptides: list[TheoreticalPeptide],
    rng: np.random.Generator | None = None,
) -> list[float]:
    """Generate a synthetic MS1 precursor-mass list from theoretical peptides."""
    generator = rng or np.random.default_rng(RANDOM_SEED)
    observed: list[float] = []
    for peptide in peptides:
        if generator.random() < UNDETECTED_FRACTION:
            continue
        true_mass = peptide.monoisotopic_mass_da
        error_da = true_mass * generator.normal(0.0, MASS_MEASUREMENT_SIGMA_PPM) * 1e-6
        observed.append(true_mass + error_da)
    return sorted(observed)
