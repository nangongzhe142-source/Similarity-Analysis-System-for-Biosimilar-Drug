# -*- coding: utf-8 -*-
"""Shared constants for MS1 peptide-map coverage analysis (s09b lineage)."""

from __future__ import annotations

PROTEASE_NAME = "Trypsin"
MISSED_CLEAVAGES = 1
MIN_PEPTIDE_LENGTH = 6

MASS_MEASUREMENT_SIGMA_PPM = 3.0
MATCH_TOLERANCE_PPM = 10.0
UNDETECTED_FRACTION = 0.15
RANDOM_SEED = 20260814

SUBSTITUTION_FROM = "G"
SUBSTITUTION_TO = "A"

# s09b demo sanity floors only — not a regulatory acceptance threshold (Sheet3 K column).
DEMO_COVERAGE_SANITY_PERCENT = 80.0
COVERAGE_DROP_SANITY_PERCENT = 5.0

N_TERMINUS_HINT_RESIDUES = 10
C_TERMINUS_HINT_RESIDUES = 10

MS1_CANNOT_REPLACE_MSMS_ZH = (
    "MS1 质量匹配只能支持「可能对应该肽段」，不能替代 MS/MS 序列确认。"
)
COVERAGE_NUMERIC_BOUNDARY_ZH = (
    "无序列覆盖率（Sequence Coverage）的统一合格判定阈值，"
    "应获得足以支持一级结构确认的覆盖，尽可能实现完整覆盖"
)
