# -*- coding: utf-8 -*-
"""In-silico protease digestion via pyOpenMS."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.intact_mass.bootstrap import bootstrap_openms
from app.analysis.ms1_coverage.constants import (
    MIN_PEPTIDE_LENGTH,
    MISSED_CLEAVAGES,
    PROTEASE_NAME,
)


@dataclass(frozen=True)
class TheoreticalPeptide:
    sequence: str
    start: int
    end: int
    length: int
    monoisotopic_mass_da: float


def digest_sequence(sequence: str) -> list[TheoreticalPeptide]:
    """Digest a protein sequence in vitro and return theoretical peptide masses."""
    bootstrap_openms()
    import pyopenms  # noqa: WPS433

    aa_sequence = pyopenms.AASequence.fromString(sequence)
    digestion = pyopenms.ProteaseDigestion()
    digestion.setEnzyme(PROTEASE_NAME)
    digestion.setMissedCleavages(MISSED_CLEAVAGES)

    raw_peptides: list[pyopenms.AASequence] = []
    digestion.digest(aa_sequence, raw_peptides)

    results: list[TheoreticalPeptide] = []
    for peptide in raw_peptides:
        peptide_string = peptide.toString()
        if len(peptide_string) < MIN_PEPTIDE_LENGTH:
            continue
        start_index = sequence.find(peptide_string)
        if start_index < 0:
            continue
        results.append(
            TheoreticalPeptide(
                sequence=peptide_string,
                start=start_index + 1,
                end=start_index + len(peptide_string),
                length=len(peptide_string),
                monoisotopic_mass_da=float(peptide.getMonoWeight()),
            )
        )
    return results
