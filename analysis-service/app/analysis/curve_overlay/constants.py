# -*- coding: utf-8 -*-
"""Named cut-offs for the curve-overlay demo (P26).

These numbers operate the algorithm. They are not biosimilarity limits.
"""

from __future__ import annotations

CURVE_OVERLAY_PROFILE = "curve-overlay"

RANDOM_SEED = 20260830
ALIGNMENT_GRID_POINTS = 256
SMOOTHING_WINDOW = 11
PEAK_PROMINENCE_FRACTION = 0.08
MIN_TRACE_POINTS = 8

# Algorithm quality gates only. Sheet3 has no program rule for these items.
PEARSON_QUALITY_GATE = 0.95
REGION_AREA_DELTA_PP_GATE = 2.0
