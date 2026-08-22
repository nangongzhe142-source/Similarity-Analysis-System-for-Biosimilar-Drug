# -*- coding: utf-8 -*-
"""Per-item analyte profiles for intact / subunit mass deconvolution (F2 / F3).

Default mass windows and charge ranges are algorithm search parameters for
typical IgG1-sized analytes. They are not similarity boundaries. When a
theoretical mass is available it takes precedence over the tabulated window
so that a BSA demo (~66 kDa) is not searched in an intact-antibody window.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.analysis.intact_mass.constants import (
    CHARGE_MAX,
    CHARGE_MIN,
    GLYCAN_WINDOW_EXTRA_DA,
    MASS_SEARCH_LOWER_DA,
    MASS_SEARCH_UPPER_DA,
    MASS_WINDOW_MINIMUM_HALF_DA,
    MASS_WINDOW_RELATIVE_SPAN,
    MAX_CHARGE_FOR_SEARCH,
    MZ_GRID_MAX,
    MZ_GRID_MIN,
)
from app.analysis.intact_mass.theory import TheoreticalMasses


@dataclass(frozen=True)
class AnalyteProfile:
    item_id: str
    analyte_level: str
    treatment_state: str
    theoretical_mass_source: str
    default_mass_window_da: tuple[float, float]
    default_charge_range: tuple[int, int]
    observation_mz_range: tuple[float, float]
    glycosylated: bool
    allowed_modifications: tuple[str, ...]
    peak_assignment: str
    sheet3_row: int | None
    data_sufficiency: str


@dataclass(frozen=True)
class DeconvolutionSettings:
    mass_range_da: tuple[float, float]
    charge_range: tuple[int, int]
    window_source: str
    profile: AnalyteProfile


# Typical IgG1 envelopes. Bounds are deliberately wide; they only keep UniDec
# from searching the wrong mass decade.
ANALYTE_PROFILES: dict[str, AnalyteProfile] = {
    "intact-mass": AnalyteProfile(
        item_id="intact-mass",
        analyte_level="intact",
        treatment_state="native",
        theoretical_mass_source="user-sequence-or-declared-mass",
        default_mass_window_da=(140000.0, 160000.0),
        default_charge_range=(40, 80),
        observation_mz_range=(1500.0, 4000.0),
        glycosylated=True,
        allowed_modifications=("G0F", "G1F", "G2F", "C-term-Lys", "pyroGlu"),
        peak_assignment="major-glycoform-cluster",
        sheet3_row=2,
        data_sufficiency="paired candidate/reference deconvolved mass spectra plus sequence or declared theoretical mass",
    ),
    "deglycosylated-intact-mass": AnalyteProfile(
        item_id="deglycosylated-intact-mass",
        analyte_level="intact",
        treatment_state="deglycosylated",
        theoretical_mass_source="user-sequence-or-declared-mass",
        default_mass_window_da=(140000.0, 155000.0),
        default_charge_range=(40, 80),
        observation_mz_range=(1500.0, 4000.0),
        glycosylated=False,
        allowed_modifications=("C-term-Lys", "pyroGlu", "PNGaseF-deamidation"),
        peak_assignment="deglycosylated-backbone",
        sheet3_row=3,
        data_sufficiency="paired deglycosylated intact mass spectra plus sequence or declared theoretical mass",
    ),
    "light-chain-mass": AnalyteProfile(
        item_id="light-chain-mass",
        analyte_level="light-chain",
        treatment_state="reduced",
        theoretical_mass_source="user-sequence-or-declared-mass",
        default_mass_window_da=(20000.0, 30000.0),
        default_charge_range=(8, 30),
        observation_mz_range=(MZ_GRID_MIN, MZ_GRID_MAX),
        glycosylated=False,
        allowed_modifications=("pyroGlu",),
        peak_assignment="reduced-light-chain",
        sheet3_row=4,
        data_sufficiency="paired reduced light-chain mass spectra plus light-chain sequence",
    ),
    "non-deglycosylated-heavy-chain-mass": AnalyteProfile(
        item_id="non-deglycosylated-heavy-chain-mass",
        analyte_level="heavy-chain",
        treatment_state="reduced",
        theoretical_mass_source="user-sequence-or-declared-mass",
        default_mass_window_da=(45000.0, 60000.0),
        default_charge_range=(15, 50),
        observation_mz_range=(MZ_GRID_MIN, MZ_GRID_MAX),
        glycosylated=True,
        allowed_modifications=("G0F", "G1F", "G2F", "C-term-Lys"),
        peak_assignment="glycosylated-heavy-chain",
        sheet3_row=5,
        data_sufficiency="paired reduced heavy-chain mass spectra plus heavy-chain sequence",
    ),
    "deglycosylated-heavy-chain-mass": AnalyteProfile(
        item_id="deglycosylated-heavy-chain-mass",
        analyte_level="heavy-chain",
        treatment_state="reduced-deglycosylated",
        theoretical_mass_source="user-sequence-or-declared-mass",
        default_mass_window_da=(45000.0, 55000.0),
        default_charge_range=(15, 45),
        observation_mz_range=(MZ_GRID_MIN, MZ_GRID_MAX),
        glycosylated=False,
        allowed_modifications=("C-term-Lys",),
        peak_assignment="deglycosylated-heavy-chain",
        sheet3_row=6,
        data_sufficiency="paired reduced and deglycosylated heavy-chain mass spectra plus heavy-chain sequence",
    ),
    "fab-mass": AnalyteProfile(
        item_id="fab-mass",
        analyte_level="fab",
        treatment_state="fragment",
        theoretical_mass_source="user-sequence-or-declared-mass",
        default_mass_window_da=(40000.0, 55000.0),
        default_charge_range=(15, 45),
        observation_mz_range=(MZ_GRID_MIN, MZ_GRID_MAX),
        glycosylated=False,
        allowed_modifications=("pyroGlu",),
        peak_assignment="fab-fragment",
        sheet3_row=None,
        data_sufficiency="not in the first-phase Sheet3 item list; window reserved so Fab is not searched as intact IgG",
    ),
    "fc-mass": AnalyteProfile(
        item_id="fc-mass",
        analyte_level="fc",
        treatment_state="fragment",
        theoretical_mass_source="user-sequence-or-declared-mass",
        default_mass_window_da=(20000.0, 35000.0),
        default_charge_range=(8, 35),
        observation_mz_range=(MZ_GRID_MIN, MZ_GRID_MAX),
        glycosylated=True,
        allowed_modifications=("G0F", "G1F", "G2F"),
        peak_assignment="fc-fragment",
        sheet3_row=None,
        data_sufficiency="not in the first-phase Sheet3 item list; window reserved so Fc is not searched as intact IgG",
    ),
}

# BSA synthetic-demo fallback when no item profile applies.
BSA_DEMO_PROFILE = AnalyteProfile(
    item_id="bsa-demo",
    analyte_level="intact",
    treatment_state="native",
    theoretical_mass_source="uniprot-p02769-mature-chain",
    default_mass_window_da=(MASS_SEARCH_LOWER_DA, MASS_SEARCH_UPPER_DA),
    default_charge_range=(CHARGE_MIN, CHARGE_MAX),
    observation_mz_range=(MZ_GRID_MIN, MZ_GRID_MAX),
    glycosylated=False,
    allowed_modifications=("hexose-demo-shift",),
    peak_assignment="bsa-mature-chain",
    sheet3_row=None,
    data_sufficiency="synthetic BSA envelope only",
)


def get_analyte_profile(item_id: str) -> AnalyteProfile:
    return ANALYTE_PROFILES.get(item_id, BSA_DEMO_PROFILE)


def search_center_mass_da(theoretical: TheoreticalMasses | None) -> float | None:
    if theoretical is None:
        return None
    if theoretical.oxidized_average_mass_da is not None:
        return theoretical.oxidized_average_mass_da
    return theoretical.reduced_average_mass_da


def derive_mass_window(center_da: float, glycosylated: bool) -> tuple[float, float]:
    half = max(MASS_WINDOW_MINIMUM_HALF_DA, MASS_WINDOW_RELATIVE_SPAN * center_da)
    extra = GLYCAN_WINDOW_EXTRA_DA if glycosylated else 0.0
    lower = max(1.0, center_da - half)
    upper = center_da + half + extra
    if upper <= lower:
        raise ValueError("derived mass window is empty")
    return (lower, upper)


def derive_charge_range(center_da: float, mz_range: tuple[float, float]) -> tuple[int, int]:
    mz_lower, mz_upper = mz_range
    charge_min = max(1, int(center_da / mz_upper) - 2)
    charge_max = min(MAX_CHARGE_FOR_SEARCH, max(charge_min + 1, int(center_da / mz_lower) + 5))
    return (charge_min, charge_max)


def resolve_deconvolution_settings(
    item_id: str,
    theoretical: TheoreticalMasses | None,
    parameters: dict[str, Any] | None = None,
) -> DeconvolutionSettings:
    profile = get_analyte_profile(item_id)
    params = parameters or {}
    center = search_center_mass_da(theoretical)

    mass_lower = params.get("massLowerDa", params.get("mass_lower_da"))
    mass_upper = params.get("massUpperDa", params.get("mass_upper_da"))
    if mass_lower is not None and mass_upper is not None:
        mass_range = (float(mass_lower), float(mass_upper))
        window_source = "user-parameters"
    elif center is not None:
        mass_range = derive_mass_window(center, profile.glycosylated)
        window_source = "theoretical-mass"
    else:
        mass_range = profile.default_mass_window_da
        window_source = "analyte-profile-default"
    if mass_range[1] <= mass_range[0]:
        raise ValueError("mass search upper bound must exceed the lower bound")

    charge_min = params.get("chargeMin", params.get("charge_min"))
    charge_max = params.get("chargeMax", params.get("charge_max"))
    if charge_min is not None and charge_max is not None:
        charge_range = (int(charge_min), int(charge_max))
        window_source = f"{window_source}+user-charge"
    elif center is not None:
        charge_mz_range = profile.observation_mz_range
        default_lo, default_hi = profile.default_mass_window_da
        span = default_hi - default_lo
        in_profile_decade = (default_lo - 0.25 * span) <= center <= (default_hi + 0.25 * span)
        if not in_profile_decade:
            charge_mz_range = (MZ_GRID_MIN, MZ_GRID_MAX)
        charge_range = derive_charge_range(center, charge_mz_range)
    else:
        charge_range = profile.default_charge_range
    if charge_range[1] < charge_range[0]:
        raise ValueError("charge upper bound must not be below the lower bound")

    return DeconvolutionSettings(
        mass_range_da=mass_range,
        charge_range=charge_range,
        window_source=window_source,
        profile=profile,
    )
