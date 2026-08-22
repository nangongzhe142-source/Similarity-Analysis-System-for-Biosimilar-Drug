# -*- coding: utf-8 -*-
"""Match observed precursor masses to theoretical peptides and compute coverage."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.analysis.ms1_coverage.constants import MATCH_TOLERANCE_PPM
from app.analysis.ms1_coverage.digestion import TheoreticalPeptide


@dataclass(frozen=True)
class MatchedPeptide:
    sequence: str
    start: int
    end: int
    theoretical_mass_da: float
    observed_mass_da: float
    deviation_ppm: float


@dataclass(frozen=True)
class CoverageResult:
    theoretical_peptide_count: int
    matched_peptide_count: int
    unmatched_peptide_count: int
    covered_residue_count: int
    sequence_length: int
    coverage_percent: float
    matched_peptides: tuple[MatchedPeptide, ...]
    unmatched_peptides: tuple[TheoreticalPeptide, ...]


def match_and_cover(
    peptides: list[TheoreticalPeptide],
    observed_masses: list[float],
    sequence_length: int,
) -> CoverageResult:
    """Map observed MS1 masses onto theoretical peptides and derive residue coverage."""
    observed_array = np.array(observed_masses, dtype=float) if observed_masses else np.empty(0)
    covered_positions: set[int] = set()
    matched: list[MatchedPeptide] = []
    unmatched: list[TheoreticalPeptide] = []

    for peptide in peptides:
        theoretical_mass = peptide.monoisotopic_mass_da
        tolerance_da = theoretical_mass * MATCH_TOLERANCE_PPM * 1e-6
        if observed_array.size:
            deviations = np.abs(observed_array - theoretical_mass)
            best_index = int(np.argmin(deviations))
            best_deviation = float(deviations[best_index])
        else:
            best_deviation = float("inf")
            best_index = -1

        if best_deviation <= tolerance_da and best_index >= 0:
            observed_mass = float(observed_array[best_index])
            matched.append(
                MatchedPeptide(
                    sequence=peptide.sequence,
                    start=peptide.start,
                    end=peptide.end,
                    theoretical_mass_da=theoretical_mass,
                    observed_mass_da=observed_mass,
                    deviation_ppm=round(1e6 * (observed_mass - theoretical_mass) / theoretical_mass, 2),
                )
            )
            covered_positions.update(range(peptide.start, peptide.end + 1))
        else:
            unmatched.append(peptide)

    coverage_percent = 100.0 * len(covered_positions) / sequence_length if sequence_length else 0.0
    return CoverageResult(
        theoretical_peptide_count=len(peptides),
        matched_peptide_count=len(matched),
        unmatched_peptide_count=len(unmatched),
        covered_residue_count=len(covered_positions),
        sequence_length=sequence_length,
        coverage_percent=round(coverage_percent, 2),
        matched_peptides=tuple(matched),
        unmatched_peptides=tuple(unmatched),
    )
