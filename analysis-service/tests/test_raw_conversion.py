# -*- coding: utf-8 -*-

from __future__ import annotations

import importlib.util
import shutil
import subprocess
from pathlib import Path

import pytest

from app.conversion.raw_converter import RawConversionError, convert_raw_to_mzml
from app.security.ingest import validate_upload_content

FIXTURE_DIR = Path(__file__).resolve().parents[1] / "fixtures" / "pwiz-thermo"
PRIMARY_RAW = FIXTURE_DIR / "BSA-FT-HCD.raw"

# Measured after conversion: each vendor fixture is a single saved scan.
EXPECTED_SPECTRUM_COUNTS = {
    "BSA-FT-ETD.raw": (1, 2),
    "BSA-FT-HCD.raw": (1, 2),
    "FT-HCD-MSX.raw": (1, 2),
    "IT-HCD-SPS.raw": (1, 3),
}


def _docker_available() -> bool:
    try:
        completed = subprocess.run(
            ["docker", "info"],
            check=False,
            capture_output=True,
            timeout=30,
        )
        return completed.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


@pytest.mark.integration
def test_pwiz_thermo_raw_converts_to_mzml(tmp_path: Path) -> None:
    if shutil.which("docker") is None or not _docker_available():
        pytest.skip("docker is not available")
    if not PRIMARY_RAW.is_file():
        pytest.skip("pwiz-thermo fixtures missing; run scripts/fetch_pwiz_thermo_fixtures.py")

    output_dir = tmp_path / "converted"
    mzml_path = convert_raw_to_mzml(PRIMARY_RAW, output_dir)
    assert mzml_path.is_file()
    assert mzml_path.suffix.lower() == ".mzml"

    # The extension has to be a real ".mzML" suffix: msconvert's -e flag appends its
    # argument literally, which once produced "BSA-FT-HCDmzML" with no dot.
    assert mzml_path.name == "BSA-FT-HCD.mzML"

    validated = validate_upload_content(
        filename=mzml_path.name,
        content=mzml_path.read_bytes(),
    )
    assert validated.format == "mzml"
    assert validated.byte_size > 0


@pytest.mark.integration
@pytest.mark.parametrize("raw_name", sorted(EXPECTED_SPECTRUM_COUNTS))
def test_converted_mzml_is_readable_by_pyopenms(raw_name: str, tmp_path: Path) -> None:
    """A converted file is only useful if the analysis stack can read spectra from it."""
    if shutil.which("docker") is None or not _docker_available():
        pytest.skip("docker is not available")
    if importlib.util.find_spec("pyopenms") is None:
        pytest.skip("pyopenms not installed")

    raw_path = FIXTURE_DIR / raw_name
    if not raw_path.is_file():
        pytest.skip("pwiz-thermo fixtures missing; run scripts/fetch_pwiz_thermo_fixtures.py")

    from app.analysis.intact_mass.bootstrap import bootstrap_openms

    mzml_path = convert_raw_to_mzml(raw_path, tmp_path / "converted")

    bootstrap_openms()
    import pyopenms

    experiment = pyopenms.MSExperiment()
    pyopenms.MzMLFile().load(str(mzml_path), experiment)

    expected_count, expected_level = EXPECTED_SPECTRUM_COUNTS[raw_name]
    assert experiment.getNrSpectra() == expected_count

    spectrum = experiment.getSpectrum(0)
    assert spectrum.getMSLevel() == expected_level

    mz, intensity = spectrum.get_peaks()
    assert len(mz) > 0
    assert len(intensity) == len(mz)
    assert intensity.max() > 0
