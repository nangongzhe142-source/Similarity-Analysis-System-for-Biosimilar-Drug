"""Generate a tiny non-reduced peptide-map-shaped mzML for connectivity smoke tests.

The spectra are synthetic and deliberately not suitable for scientific
acceptance.  They only verify that OpenMS/Kojak/xiSEARCH can be launched and
that an empty professional search is returned as quality-blocked.
"""

from pathlib import Path

import numpy as np
from psims.mzml.writer import MzMLWriter


def write(path: Path, scale: float) -> None:
    ms1_mz = np.array([500.2, 600.3, 700.35, 800.4, 900.45], dtype=float)
    ms1_i = np.array([1000, 2000, 3000, 9000, 1500], dtype=float) * scale
    ms2_mz = np.arange(100.0, 701.0, 20.0)
    ms2_i = np.array([200 + 4800 * (1 - abs(index - 15) / 16) for index in range(len(ms2_mz))], dtype=float) * scale
    with path.open("wb") as handle, MzMLWriter(handle) as writer:
        writer.controlled_vocabularies()
        writer.file_description(["MS1 spectrum", "MSn spectrum"])
        writer.software_list([writer.Software(id="BioCompareSmoke", version="1", params=["custom unreleased software tool"])])
        source = writer.Source(1, ["electrospray ionization"])
        analyzer = writer.Analyzer(2, ["orbitrap"])
        detector = writer.Detector(3, ["inductive detector"])
        writer.instrument_configuration_list([writer.InstrumentConfiguration(id="IC1", component_list=writer.ComponentList([source, analyzer, detector]))])
        processing = writer.DataProcessing(processing_methods=[writer.ProcessingMethod(order=1, software_reference="BioCompareSmoke", params=["Conversion to mzML"])], id="DP1")
        writer.data_processing_list([processing])
        with writer.run(id="covalent-smoke", instrument_configuration="IC1"):
            with writer.spectrum_list(count=2, data_processing_method="DP1"):
                writer.write_spectrum(ms1_mz, ms1_i, id="scan=1", params=[{"ms level": 1}, "MS1 spectrum", "centroid spectrum"], scan_start_time=10.0)
                writer.write_spectrum(ms2_mz, ms2_i, id="scan=2", params=[{"ms level": 2}, "MSn spectrum", "centroid spectrum"], precursor_information={"mz": 800.4, "intensity": 9000, "charge": 3, "scan_id": "scan=1"}, scan_start_time=10.1)


if __name__ == "__main__":
    target = Path(__file__).resolve().parents[1] / "samples" / "covalent"
    target.mkdir(parents=True, exist_ok=True)
    write(target / "reference-nonreduced.mzML", 1.0)
    write(target / "candidate-nonreduced.mzML", 1.03)
