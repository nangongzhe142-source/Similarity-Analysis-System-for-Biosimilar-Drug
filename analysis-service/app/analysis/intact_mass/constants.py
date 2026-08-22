# -*- coding: utf-8 -*-
"""Shared constants for intact / subunit mass analysis (s09a lineage)."""

from __future__ import annotations

HYDROGEN_AVERAGE_MASS = 1.00794
HYDROGEN_LOST_PER_DISULFIDE = 2
PROTON_MASS = 1.007276467

CHARGE_MIN = 30
CHARGE_MAX = 60
CHARGE_CENTER = 45
CHARGE_ENVELOPE_WIDTH = 7.0
MZ_GRID_MIN = 900.0
MZ_GRID_MAX = 2600.0
MZ_GRID_POINTS = 20000
PEAK_SIGMA_MZ = 0.8
BASELINE_NOISE_FRACTION = 0.002
RANDOM_SEED = 20260814

HEXOSE_MASS_SHIFT_DA = 162.0528

# Historic BSA-demo UniDec window. Intact / subunit jobs must not use this as a
# universal search range; `analyte_profiles.resolve_deconvolution_settings`
# derives the window from the analyte or from the theoretical mass.
MASS_SEARCH_LOWER_DA = 60000.0
MASS_SEARCH_UPPER_DA = 75000.0
MASS_BIN_DA = 1.0
MASS_RECOVERY_TOLERANCE_DA = 5 * MASS_BIN_DA

# Algorithm envelope around a theoretical mass when no user window is given.
# Relative span and the glycan extra are search parameters, not similarity limits.
MASS_WINDOW_RELATIVE_SPAN = 0.10
MASS_WINDOW_MINIMUM_HALF_DA = 5000.0
GLYCAN_WINDOW_EXTRA_DA = 4000.0
MAX_CHARGE_FOR_SEARCH = 120

# UniDec reports the fit quality of the deconvolution as R-squared. A charge
# envelope that deconvolves cleanly scores near 1.0; feeding it a spectrum that
# holds no single-protein envelope (a peptide LC-MS run, for instance) drives the
# value negative. Measured: the synthetic BSA envelope scores 0.9998, while the
# averaged MS1 of official small.mzML scores -10.07. Results below this floor are
# reported as unreliable rather than treated as a measured mass.
MIN_DECONVOLUTION_R_SQUARED = 0.9

# UniProt P02769 mature-chain annotation. Applied only by `load_bsa_demo_fixture`.
BSA_UNIPROT_ACCESSION = "P02769"
BSA_CHAIN_START = 25
BSA_CHAIN_END = 607
BSA_DISULFIDE_COUNT = 17
