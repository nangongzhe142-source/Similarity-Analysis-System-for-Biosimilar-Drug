# -*- coding: utf-8 -*-
"""Theoretical mass computation via pyOpenMS."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.intact_mass.bootstrap import bootstrap_openms
from app.analysis.intact_mass.constants import HYDROGEN_AVERAGE_MASS, HYDROGEN_LOST_PER_DISULFIDE


@dataclass(frozen=True)
class TheoreticalMasses:
    reduced_average_mass_da: float
    reduced_monoisotopic_mass_da: float
    disulfide_count: int | None
    disulfide_mass_loss_da: float | None
    oxidized_average_mass_da: float | None


def compute_theoretical_masses(sequence: str, disulfide_count: int | None) -> TheoreticalMasses:
    bootstrap_openms()
    import pyopenms  # noqa: WPS433 — imported after OPENMS_DATA_PATH bootstrap

    aa_sequence = pyopenms.AASequence.fromString(sequence)
    reduced_average = aa_sequence.getAverageWeight()
    reduced_monoisotopic = aa_sequence.getMonoWeight()
    if disulfide_count is None:
        return TheoreticalMasses(
            reduced_average_mass_da=reduced_average,
            reduced_monoisotopic_mass_da=reduced_monoisotopic,
            disulfide_count=None,
            disulfide_mass_loss_da=None,
            oxidized_average_mass_da=None,
        )

    disulfide_mass_loss = disulfide_count * HYDROGEN_LOST_PER_DISULFIDE * HYDROGEN_AVERAGE_MASS
    return TheoreticalMasses(
        reduced_average_mass_da=reduced_average,
        reduced_monoisotopic_mass_da=reduced_monoisotopic,
        disulfide_count=disulfide_count,
        disulfide_mass_loss_da=disulfide_mass_loss,
        oxidized_average_mass_da=reduced_average - disulfide_mass_loss,
    )


def pyopenms_version() -> str:
    bootstrap_openms()
    import pyopenms  # noqa: WPS433

    return pyopenms.__version__
