from __future__ import annotations

import csv
from pathlib import Path

from scripts.generate_glycan_hilic_example import main as generate_example
from worker.batch_pipeline_cli import glycan_chromatography_batch


def test_gly02_common_adapter_runs_real_hplc_and_glypy(tmp_path: Path) -> None:
    generate_example()
    source = Path(__file__).resolve().parents[1] / "validation" / "glycan-hilic-fld"
    out, work = tmp_path / "outputs", tmp_path / "work"
    out.mkdir(); work.mkdir()
    grouped = {
        "reference": [{"path": source / "reference-hilic-fld.csv", "lotId": "R01"}],
        "candidate": [{"path": source / "candidate-hilic-fld.csv", "lotId": "C01"}],
    }
    result = glycan_chromatography_batch("GLY-02", grouped, out, work, {"prominence": 0.003, "approxPeakWidth": 0.8, "minReferenceLots": 3}, [], 60)
    assert result["status"] == "completed"
    assert result["professionalEngine"].endswith("hplc-py → glypy")
    g0f = next(row for row in result["comparisonTable"] if row["glycoform"] == "G0F")
    assert 40 < g0f["candidatePercent"] < 70
    assert g0f["intervalStatus"] == "insufficient-reference"
    assert result["massRules"]["g0fMinusG0Da"] == 146.057909
    assert result["massRules"]["ngnaMinusNanaDa"] == 15.994915
    assert result["msConfirmation"]["status"] == "not-provided"
    with (out / "glycoform-results.csv").open(encoding="utf-8-sig") as handle:
        assert any(row["glycoform"] == "G0F" for row in csv.DictReader(handle))


def test_glycan_units_are_registered_without_replacing_glycopeptide_unit() -> None:
    from backend.calculation_units import UNITS
    assert UNITS["GLYCO"].pipeline == "glycresoft-glypy"
    assert {f"GLY-{index:02d}" for index in range(2, 7)} <= set(UNITS)
