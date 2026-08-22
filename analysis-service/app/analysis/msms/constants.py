# -*- coding: utf-8 -*-
"""Shared constants for MS/MS sequence confirmation (P9)."""

from __future__ import annotations

RANDOM_SEED = 20260814

PROTEASE_NAME = "trypsin"
MISSED_CLEAVAGES = 1
MIN_PEPTIDE_LENGTH = 6

PRECURSOR_TOLERANCE_PPM = 20.0
FRAGMENT_TOLERANCE_PPM = 20.0
FDR_THRESHOLD = 0.01
COVERAGE_INSUFFICIENT_PERCENT = 90.0
COVERAGE_DROP_SANITY_PERCENT = 5.0

COVERAGE_NUMERIC_BOUNDARY_ZH = (
    "无序列覆盖率的统一合格判定阈值，应获得足以确认一级结构的 MS/MS 覆盖"
)

# DOCX figure 5 — HT35 innovator vs biosimilar signature peptides
INNOVATOR_SIGNATURE_PEPTIDE = "EEMTK"
BIOSIMILAR_SIGNATURE_PEPTIDE = "DELTK"

MSMS_ITEM_RULES: dict[str, dict[str, object]] = {
    "msms-sequence-coverage": {
        "ruleId": "msms-sequence-coverage-sheet3-row8",
        "sourceRow": 8,
        "sourceCells": ["G8", "N8"],
        "finalRuleZh": "序列确认充分+无序列异常→PASS；覆盖不足→REVIEW；确认关键序列差异→FAIL",
    },
    "cdr-signature-peptides": {
        "ruleId": "cdr-signature-peptides-rule-not-defined",
        "sourceRow": 0,
        "sourceCells": [],
        "finalRuleZh": "",
    },
    "n-c-terminal-sequence": {
        "ruleId": "n-c-terminal-sequence-rule-not-defined",
        "sourceRow": 0,
        "sourceCells": [],
        "finalRuleZh": "",
    },
    "free-thiol-orthogonal-1": {
        "ruleId": "free-thiol-orthogonal-1-rule-not-defined",
        "sourceRow": 0,
        "sourceCells": [],
        "finalRuleZh": "",
    },
    "disulfide-bonds-primary-1": {
        "ruleId": "disulfide-bonds-primary-1-rule-not-defined",
        "sourceRow": 0,
        "sourceCells": [],
        "finalRuleZh": "",
    },
}
