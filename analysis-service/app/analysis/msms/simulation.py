# -*- coding: utf-8
"""Synthetic MS/MS PSM generation for demo and golden tests."""

from __future__ import annotations

import numpy as np

from app.analysis.ms1_coverage.constants import UNDETECTED_FRACTION
from app.analysis.ms1_coverage.digestion import TheoreticalPeptide, digest_sequence
from app.analysis.ms1_coverage.simulation import simulate_observed_masses
from app.analysis.ms1_coverage.substitution import (
    detect_substitution_exposure,
    introduce_substitution,
)
from app.analysis.msms.constants import (
    BIOSIMILAR_SIGNATURE_PEPTIDE,
    INNOVATOR_SIGNATURE_PEPTIDE,
    RANDOM_SEED,
)
from app.analysis.msms.fragment_ions import (
    annotate_fragment_ions,
    theoretical_fragment_mz_values,
)
from app.analysis.msms.psm_parser import PeptideSpectrumMatch


def _synthetic_psm(
    scan: int,
    peptide: TheoreticalPeptide,
    *,
    xcorr: float = 0.95,
    expect: float = 1e-6,
    matched_fraction: float = 0.55,
) -> PeptideSpectrumMatch:
    total_ions = max(len(theoretical_fragment_mz_values(peptide.sequence)), 8)
    matched = max(1, int(total_ions * matched_fraction))
    return PeptideSpectrumMatch(
        rank=1,
        scan=scan,
        precursor_mz=peptide.monoisotopic_mass_da,
        xcorr=xcorr,
        expect=expect,
        num_matched_ions=matched,
        num_total_ions=total_ions,
        peptide_sequence=peptide.sequence,
        is_decoy=False,
    )


def build_synthetic_psms(
    reference_peptides: list[TheoreticalPeptide],
    candidate_peptides: list[TheoreticalPeptide],
    rng: np.random.Generator,
) -> tuple[list[PeptideSpectrumMatch], list[PeptideSpectrumMatch]]:
    """Build rank-1 PSM lists from synthetic digestion coverage."""
    reference_observed = simulate_observed_masses(reference_peptides, rng)
    candidate_observed = simulate_observed_masses(candidate_peptides, rng)

    reference_by_mass = {
        round(peptide.monoisotopic_mass_da, 4): peptide for peptide in reference_peptides
    }
    candidate_by_mass = {
        round(peptide.monoisotopic_mass_da, 4): peptide for peptide in candidate_peptides
    }

    reference_psms: list[PeptideSpectrumMatch] = []
    candidate_psms: list[PeptideSpectrumMatch] = []
    scan = 1

    for observed_mass in reference_observed:
        peptide = min(
            reference_peptides,
            key=lambda item: abs(item.monoisotopic_mass_da - observed_mass),
        )
        if abs(peptide.monoisotopic_mass_da - observed_mass) / peptide.monoisotopic_mass_da > 5e-5:
            continue
        reference_psms.append(_synthetic_psm(scan, peptide))
        scan += 1

    for observed_mass in candidate_observed:
        peptide = min(
            candidate_peptides,
            key=lambda item: abs(item.monoisotopic_mass_da - observed_mass),
        )
        if abs(peptide.monoisotopic_mass_da - observed_mass) / peptide.monoisotopic_mass_da > 5e-5:
            continue
        candidate_psms.append(_synthetic_psm(scan, peptide))
        scan += 1

    return reference_psms, candidate_psms


def signature_fragment_annotation(*, tolerance_ppm: float):
    """Return b/y annotations for innovator vs biosimilar signature peptides (DOCX #5)."""
    innovator_mz = theoretical_fragment_mz_values(INNOVATOR_SIGNATURE_PEPTIDE)
    innovator = annotate_fragment_ions(
        INNOVATOR_SIGNATURE_PEPTIDE,
        innovator_mz,
        tolerance_ppm=tolerance_ppm,
    )
    biosimilar_mz = theoretical_fragment_mz_values(BIOSIMILAR_SIGNATURE_PEPTIDE)
    biosimilar = annotate_fragment_ions(
        BIOSIMILAR_SIGNATURE_PEPTIDE,
        biosimilar_mz,
        tolerance_ppm=tolerance_ppm,
    )
    return innovator, biosimilar


def substitution_site_from_peptides(
    *,
    substitution_position: int,
    reference_peptides: list[TheoreticalPeptide],
    candidate_unmatched: tuple[TheoreticalPeptide, ...],
) -> bool:
    return detect_substitution_exposure(
        substitution_position=substitution_position,
        reference_peptides=reference_peptides,
        candidate_coverage_unmatched=candidate_unmatched,
    )[0]
