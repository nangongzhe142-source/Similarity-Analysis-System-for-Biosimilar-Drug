# -*- coding: utf-8 -*-
"""Theoretical and observed b/y fragment ion annotation via pyOpenMS."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.intact_mass.bootstrap import bootstrap_openms
from app.models.analysis_contract import AnalysisFragmentIon


@dataclass(frozen=True)
class FragmentAnnotationResult:
    peptide_sequence: str
    matched_ion_count: int
    total_theoretical_ions: int
    ions: tuple[AnalysisFragmentIon, ...]


def _ppm_error(observed_mz: float, theoretical_mz: float) -> float:
    return ((observed_mz - theoretical_mz) / theoretical_mz) * 1e6


def annotate_fragment_ions(
    peptide_sequence: str,
    observed_mz_values: list[float],
    *,
    tolerance_ppm: float,
) -> FragmentAnnotationResult:
    bootstrap_openms()
    import pyopenms

    sequence = pyopenms.AASequence.fromString(peptide_sequence)
    theoretical = pyopenms.MSSpectrum()
    generator = pyopenms.TheoreticalSpectrumGenerator()
    generator.getSpectrum(theoretical, sequence, 1, 1)

    theoretical_ions: list[tuple[str, int, float]] = []
    for index in range(theoretical.size()):
        mz = float(theoretical[index].getMZ())
        meta = theoretical.getStringDataArrays()[0][index] if theoretical.getStringDataArrays() else ""
        ion_label = str(meta) if meta else "?"
        ion_type = ion_label[0].lower() if ion_label else "?"
        ordinal_text = "".join(character for character in ion_label[1:] if character.isdigit())
        ordinal = int(ordinal_text) if ordinal_text else index + 1
        theoretical_ions.append((ion_type, ordinal, mz))

    matched: list[AnalysisFragmentIon] = []
    used_observed: set[int] = set()
    for ion_type, ordinal, theoretical_mz in theoretical_ions:
        best_index: int | None = None
        best_error = tolerance_ppm + 1.0
        for observed_index, observed_mz in enumerate(observed_mz_values):
            if observed_index in used_observed:
                continue
            error = abs(_ppm_error(observed_mz, theoretical_mz))
            if error <= tolerance_ppm and error < best_error:
                best_index = observed_index
                best_error = error
        if best_index is None:
            continue
        used_observed.add(best_index)
        observed_mz = observed_mz_values[best_index]
        matched.append(
            AnalysisFragmentIon(
                ion_type=ion_type,
                ordinal=ordinal,
                theoretical_mz=round(theoretical_mz, 4),
                observed_mz=round(observed_mz, 4),
                error_ppm=round(_ppm_error(observed_mz, theoretical_mz), 2),
            )
        )

    return FragmentAnnotationResult(
        peptide_sequence=peptide_sequence,
        matched_ion_count=len(matched),
        total_theoretical_ions=len(theoretical_ions),
        ions=tuple(matched),
    )


def theoretical_fragment_mz_values(peptide_sequence: str) -> list[float]:
    """Return theoretical b/y m/z values for synthetic MS2 generation."""
    bootstrap_openms()
    import pyopenms

    sequence = pyopenms.AASequence.fromString(peptide_sequence)
    theoretical = pyopenms.MSSpectrum()
    generator = pyopenms.TheoreticalSpectrumGenerator()
    generator.getSpectrum(theoretical, sequence, 1, 1)
    return [float(theoretical[index].getMZ()) for index in range(theoretical.size())]
