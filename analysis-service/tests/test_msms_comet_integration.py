# -*- coding: utf-8
"""Integration tests for real Comet search (D5)."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.analysis.msms.comet_runner import comet_available, run_comet_search
from app.conversion.raw_converter import convert_raw_to_mzml


pytestmark = pytest.mark.integration


@pytest.mark.skipif(not comet_available(), reason="Comet executable not installed")
def test_comet_search_on_bsa_ft_hcd_mzml(tmp_path: Path) -> None:
    service_root = Path(__file__).resolve().parents[1]
    raw_path = service_root / "fixtures" / "pwiz-thermo" / "BSA-FT-HCD.raw"
    fasta_path = service_root / "fixtures" / "P02769.fasta"
    if not raw_path.is_file():
        pytest.skip("Thermo RAW fixture missing")

    mzml_path = convert_raw_to_mzml(raw_path, tmp_path / "converted")
    result = run_comet_search(
        spectra_path=mzml_path,
        fasta_path=fasta_path,
        work_dir=tmp_path / "comet-work",
    )

    assert result.raw_psm_count >= 1
    assert len(result.filtered_psms) >= 1
    assert any(
        "YICDNQDTISSK" in psm.peptide_sequence for psm in result.filtered_psms
    )
