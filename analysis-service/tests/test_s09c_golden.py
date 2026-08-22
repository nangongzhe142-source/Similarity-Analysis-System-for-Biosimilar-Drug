# -*- coding: utf-8 -*-
"""s09c quality-range oracle, kept as a PoC/live-demo check (D17: no analysis adapter)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ORACLE_PATH = PROJECT_ROOT / "tools-poc" / "output" / "s09c_free_thiol_quality_range.json"


def _sample_sd(values: np.ndarray) -> float:
    return float(values.std(ddof=1))


def test_s09c_quality_range_oracle_and_interval_distinction() -> None:
    """QR bounds and lot-in-range counts must match the s09c JSON; CI/TI are not QR."""
    oracle = json.loads(ORACLE_PATH.read_text(encoding="utf-8"))
    reference = np.array(oracle["reference"]["values"], dtype=float)
    mean_mu_r = float(reference.mean())
    sd_sigma_r = _sample_sd(reference)
    sigma_x = float(oracle["intervals"]["qualityRange"]["sigmaMultiplierX"])
    qr_lower = mean_mu_r - sigma_x * sd_sigma_r
    qr_upper = mean_mu_r + sigma_x * sd_sigma_r

    assert round(qr_lower, 4) == oracle["intervals"]["qualityRange"]["lower"]
    assert round(qr_upper, 4) == oracle["intervals"]["qualityRange"]["upper"]
    assert oracle["intervals"]["qualityRange"]["lower"] == 0.7548
    assert oracle["intervals"]["qualityRange"]["upper"] == 1.0884

    similar = np.array(oracle["candidateScenarios"]["similar"]["values"], dtype=float)
    shifted = np.array(oracle["candidateScenarios"]["shifted"]["values"], dtype=float)
    similar_inside = int(((similar >= qr_lower) & (similar <= qr_upper)).sum())
    shifted_inside = int(((shifted >= qr_lower) & (shifted <= qr_upper)).sum())
    assert similar_inside == 12
    assert shifted_inside == 4
    assert oracle["candidateScenarios"]["similar"]["meetsThreshold"] is True
    assert oracle["candidateScenarios"]["shifted"]["meetsThreshold"] is False

    ci_width = oracle["intervals"]["confidenceInterval"]["width"]
    ti_width = oracle["intervals"]["toleranceInterval"]["width"]
    qr_width = oracle["intervals"]["qualityRange"]["width"]
    assert ci_width < qr_width
    assert ti_width > qr_width
    assert oracle["intervals"]["confidenceInterval"]["lower"] != oracle["intervals"]["qualityRange"]["lower"]
    assert oracle["intervals"]["toleranceInterval"]["lower"] != oracle["intervals"]["qualityRange"]["lower"]
