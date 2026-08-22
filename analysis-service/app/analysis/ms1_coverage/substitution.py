# -*- coding: utf-8 -*-
"""Substitution helpers for synthetic substitution-detection demos."""

from __future__ import annotations

from app.analysis.intact_mass.bootstrap import bootstrap_openms
from app.analysis.ms1_coverage.constants import SUBSTITUTION_FROM, SUBSTITUTION_TO
from app.analysis.ms1_coverage.digestion import TheoreticalPeptide


def introduce_substitution(sequence: str) -> tuple[str, int]:
    """Introduce a single G→A substitution near the sequence midpoint (1-based position)."""
    midpoint = len(sequence) // 2
    for offset in range(len(sequence) // 2):
        for index in (midpoint + offset, midpoint - offset):
            if 0 <= index < len(sequence) and sequence[index] == SUBSTITUTION_FROM:
                mutated = sequence[:index] + SUBSTITUTION_TO + sequence[index + 1 :]
                return mutated, index + 1
    raise ValueError(f"sequence contains no substitutable {SUBSTITUTION_FROM} residue")


def substitution_mass_shift_da() -> float:
    bootstrap_openms()
    import pyopenms  # noqa: WPS433

    from_mass = pyopenms.AASequence.fromString(SUBSTITUTION_FROM).getMonoWeight()
    to_mass = pyopenms.AASequence.fromString(SUBSTITUTION_TO).getMonoWeight()
    return float(to_mass - from_mass)


def detect_substitution_exposure(
    *,
    substitution_position: int,
    reference_peptides: list[TheoreticalPeptide],
    candidate_coverage_unmatched: tuple[TheoreticalPeptide, ...],
) -> tuple[bool, tuple[TheoreticalPeptide, ...]]:
    """Return whether peptides spanning the substitution site are unmatched in candidate data."""
    affected = [
        peptide
        for peptide in reference_peptides
        if peptide.start <= substitution_position <= peptide.end
    ]
    unmatched_ranges = {(peptide.start, peptide.end) for peptide in candidate_coverage_unmatched}
    detected = any((peptide.start, peptide.end) in unmatched_ranges for peptide in affected)
    return detected, tuple(affected)
