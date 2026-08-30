"""Generate deterministic intact-protein mzML fixtures for FlashDeconv smoke tests.

These spectra are synthetic validation artifacts, not scientific evidence.  They
contain a realistic multi-charge envelope for an 80 kDa protein so the existing
FlashDeconv adapter can be exercised without changing its production settings.
"""

from pathlib import Path

import numpy as np
from psims.mzml.writer import MzMLWriter


PROTON_MASS = 1.007276466621
ISOTOPE_MASS = 1.00335483507


def charge_envelope(neutral_mass: float, scan_scale: float) -> tuple[np.ndarray, np.ndarray]:
    mz_values: list[float] = []
    intensities: list[float] = []
    # An 80 kDa averagine envelope is broad and its modal isotope is far from
    # the monoisotopic peak.  A Gaussian approximation is sufficient for this
    # deterministic engine smoke test and avoids pretending this is research
    # data.
    isotope_indices = range(20, 91)
    for charge in range(14, 46):
        charge_weight = np.exp(-0.5 * ((charge - 29.0) / 6.0) ** 2)
        monoisotopic_mz = (neutral_mass + charge * PROTON_MASS) / charge
        for isotope_index in isotope_indices:
            isotope_weight = np.exp(-0.5 * ((isotope_index - 49.0) / 7.0) ** 2)
            mz_values.append(monoisotopic_mz + isotope_index * ISOTOPE_MASS / charge)
            intensities.append(2_000_000 * charge_weight * isotope_weight * scan_scale)

    order = np.argsort(mz_values)
    return np.asarray(mz_values)[order], np.asarray(intensities)[order]


def write(path: Path, neutral_mass: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("wb") as handle, MzMLWriter(handle) as writer:
        writer.controlled_vocabularies()
        writer.file_description(["MS1 spectrum"])
        writer.software_list(
            [writer.Software(id="BioCompareIntactSmoke", version="1", params=["custom unreleased software tool"])]
        )
        source = writer.Source(1, ["electrospray ionization"])
        analyzer = writer.Analyzer(2, ["orbitrap"])
        detector = writer.Detector(3, ["inductive detector"])
        writer.instrument_configuration_list(
            [
                writer.InstrumentConfiguration(
                    id="IC1", component_list=writer.ComponentList([source, analyzer, detector])
                )
            ]
        )
        processing = writer.DataProcessing(
            processing_methods=[
                writer.ProcessingMethod(
                    order=1,
                    software_reference="BioCompareIntactSmoke",
                    params=["Conversion to mzML"],
                )
            ],
            id="DP1",
        )
        writer.data_processing_list([processing])
        with writer.run(id="intact-mass-smoke", instrument_configuration="IC1"):
            with writer.spectrum_list(count=8, data_processing_method="DP1"):
                for scan_index in range(8):
                    scale = 0.85 + 0.15 * np.sin((scan_index + 1) * np.pi / 9)
                    mz_values, intensities = charge_envelope(neutral_mass, scale)
                    writer.write_spectrum(
                        mz_values,
                        intensities,
                        id=f"scan={scan_index + 1}",
                        params=[{"ms level": 1}, "MS1 spectrum", "centroid spectrum"],
                        scan_start_time=2.0 + scan_index * 0.15,
                    )


if __name__ == "__main__":
    output = Path(__file__).resolve().parent / "fixtures"
    write(output / "reference-intact.mzML", 80_000.0)
    write(output / "candidate-intact.mzML", 80_000.8)
