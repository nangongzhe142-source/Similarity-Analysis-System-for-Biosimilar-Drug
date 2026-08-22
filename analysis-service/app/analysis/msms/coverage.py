# -*- coding: utf-8 -*-
"""Residue-level MS/MS sequence coverage from confirmed PSMs."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.ms1_coverage.digestion import TheoreticalPeptide, digest_sequence
from app.analysis.msms.psm_parser import PeptideSpectrumMatch


@dataclass(frozen=True)
class MsmsCoverageResult:
    sequence_length: int
    covered_residue_count: int
    coverage_percent: float
    confirmed_peptide_count: int
    confirmed_peptides: tuple[TheoreticalPeptide, ...]
    uncovered_regions: tuple[str, ...]


def _find_peptide_position(sequence: str, peptide_sequence: str) -> tuple[int, int] | None:
    start = sequence.find(peptide_sequence)
    if start < 0:
        return None
    end = start + len(peptide_sequence)
    return start, end


def compute_msms_coverage(
    protein_sequence: str,
    psms: tuple[PeptideSpectrumMatch, ...],
) -> MsmsCoverageResult:
    theoretical = digest_sequence(protein_sequence)
    by_sequence: dict[str, TheoreticalPeptide] = {peptide.sequence: peptide for peptide in theoretical}

    covered = [False] * len(protein_sequence)
    confirmed: list[TheoreticalPeptide] = []
    seen_sequences: set[str] = set()

    for psm in psms:
        if psm.is_decoy:
            continue
        peptide = by_sequence.get(psm.peptide_sequence)
        if peptide is None:
            position = _find_peptide_position(protein_sequence, psm.peptide_sequence)
            if position is None:
                continue
            start, end = position
            peptide = TheoreticalPeptide(
                sequence=psm.peptide_sequence,
                start=start + 1,
                end=start + len(psm.peptide_sequence),
                length=len(psm.peptide_sequence),
                monoisotopic_mass_da=psm.precursor_mz,
            )
        if peptide.sequence in seen_sequences:
            continue
        seen_sequences.add(peptide.sequence)
        confirmed.append(peptide)
        for residue_index in range(peptide.start, peptide.end + 1):
            array_index = residue_index - 1
            if 0 <= array_index < len(covered):
                covered[array_index] = True

    covered_count = sum(1 for flag in covered if flag)
    sequence_length = len(protein_sequence)
    coverage_percent = round(100.0 * covered_count / sequence_length, 2) if sequence_length else 0.0

    uncovered_regions: list[str] = []
    start_index: int | None = None
    for index, flag in enumerate(covered):
        if not flag and start_index is None:
            start_index = index
        if flag and start_index is not None:
            uncovered_regions.append(f"{start_index + 1}-{index}")
            start_index = None
    if start_index is not None:
        uncovered_regions.append(f"{start_index + 1}-{sequence_length}")

    return MsmsCoverageResult(
        sequence_length=sequence_length,
        covered_residue_count=covered_count,
        coverage_percent=coverage_percent,
        confirmed_peptide_count=len(confirmed),
        confirmed_peptides=tuple(confirmed),
        uncovered_regions=tuple(uncovered_regions),
    )
