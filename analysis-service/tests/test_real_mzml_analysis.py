# -*- coding: utf-8 -*-
"""Proof that real instrument mzML reaches the intact-mass toolchain.

These tests read actual mzML files with pyOpenMS and deconvolve them with the
compiled UniDec binary. They are the evidence that the analysis path is wired to
third-party software rather than to a reimplementation.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

OFFICIAL_DIR = Path(r"d:\生物类似药判别系统\数据分析提取系统\ms_analysis\official_data")
REAL_ANTIBODY_MZML = (
    Path(__file__).resolve().parents[1]
    / "fixtures"
    / "PXD063988"
    / "20241115_Z1_UM1_shamo002_EXT00_SA_TRYPSIN_EACID_RCE_KE9_100ng_03.mzML"
)


def _stack_available() -> bool:
    return (
        importlib.util.find_spec("pyopenms") is not None
        and importlib.util.find_spec("unidec") is not None
    )


pytestmark = pytest.mark.skipif(not _stack_available(), reason="pyopenms/unidec not installed")


def test_pyopenms_reads_official_mzml(tmp_path: Path) -> None:
    from app.analysis.intact_mass.spectrum import load_spectrum

    source = OFFICIAL_DIR / "small.mzML"
    if not source.is_file():
        pytest.skip(f"official fixture not present: {source}")

    spectrum, summary = load_spectrum(source, work_dir=tmp_path)

    assert summary is not None, "an mzML input must produce a read summary"
    assert summary.spectrum_count == 236
    assert summary.ms1_spectrum_count == 183
    assert summary.averaged_spectrum_count == 183
    assert spectrum.shape[1] == 2
    assert spectrum.shape[0] > 1000
    assert spectrum[:, 1].max() > 0


@pytest.mark.integration
def test_pyopenms_reads_real_antibody_mzml(tmp_path: Path) -> None:
    """The 702 MB PXD063988 tryptic run must stream without loading fully in memory."""
    if not REAL_ANTIBODY_MZML.is_file():
        pytest.skip("PXD063988 fixture not downloaded")

    from app.analysis.intact_mass.mzml_reader import stage_for_native_tool
    from app.analysis.intact_mass.bootstrap import bootstrap_openms

    bootstrap_openms()
    import pyopenms

    staged = stage_for_native_tool(REAL_ANTIBODY_MZML, tmp_path)
    experiment = pyopenms.OnDiscMSExperiment()
    assert experiment.openFile(str(staged)) is True
    assert experiment.getNrSpectra() == 33039

    spectrum = experiment.getSpectrum(0)
    mz, intensity = spectrum.get_peaks()
    assert spectrum.getMSLevel() == 1
    assert len(mz) > 0
    assert len(intensity) == len(mz)


def test_non_ascii_path_is_staged_before_native_read(tmp_path: Path) -> None:
    """pyOpenMS fails outright on Chinese paths, so staging is a correctness fix (D22)."""
    from app.analysis.intact_mass.mzml_reader import stage_for_native_tool
    from app.security.ascii_workspace import is_ascii_path

    chinese_dir = tmp_path / "生物类似药"
    chinese_dir.mkdir()
    source = chinese_dir / "spectrum.mzML"
    source.write_bytes(b"<mzML/>")

    assert is_ascii_path(source) is False
    staged = stage_for_native_tool(source)
    assert is_ascii_path(staged) is True
    assert staged.read_bytes() == source.read_bytes()


def test_unreliable_deconvolution_blocks_mass_conclusion() -> None:
    """A negative R-squared must not be reported as a measured mass."""
    from app.analysis.intact_mass.rules import (
        HeadToHeadShift,
        MassRecoveryCheck,
        decide_rule_outcome,
        deconvolution_is_reliable,
    )
    from app.models.analysis_contract import AnalysisVerdict, RuleEvaluationOutcome

    # Observed on the averaged MS1 of official small.mzML, which holds no single
    # protein charge envelope.
    assert deconvolution_is_reliable(-10.069178463342704) is False
    assert deconvolution_is_reliable(0.9997837493328852) is True
    assert deconvolution_is_reliable(None) is False

    decision = decide_rule_outcome(
        "intact-mass",
        recovery_checks=[
            MassRecoveryCheck(
                label="reference",
                truth_mass_da=66398.19,
                recovered_mass_da=17021.0,
                deviation_da=-49377.19,
                deviation_ppm=-743646.0,
                passed=False,
            )
        ],
        head_to_head=HeadToHeadShift(
            observed_shift_da=0.0,
            introduced_shift_da=None,
            shift_error_da=0.0,
            attributable_to_known_modification=False,
        ),
        synthetic_demo=False,
        deconvolution_reliable=False,
    )

    assert decision.outcome == RuleEvaluationOutcome.REVIEW
    assert decision.verdict == AnalysisVerdict.REVIEW
    assert "去卷积拟合质量低于可接受下限" in decision.rationale.zh
    assert decision.verdict != AnalysisVerdict.DIFFERENCE_DETECTED
