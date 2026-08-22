# -*- coding: utf-8 -*-
"""PNG writers for P12 visualization artifacts."""

from __future__ import annotations

from pathlib import Path

from app.analysis.plots import (
    write_chromatogram_overlay_plot,
    write_fragment_ion_plot,
    write_mirror_mass_plot,
    write_sequence_coverage_plot,
)
from app.analysis.peptide_map.simulation import simulate_tic_pair


def test_each_plot_type_writes_a_png(tmp_path: Path) -> None:
    mirror = write_mirror_mass_plot(
        [66398.0, 66560.0],
        [66560.0],
        tmp_path / "mirror-plot.png",
        reference_label="reference",
        candidate_label="candidate",
    )
    reference_trace, candidate_trace = simulate_tic_pair()
    overlay = write_chromatogram_overlay_plot(
        list(reference_trace.points),
        list(candidate_trace.points),
        tmp_path / "overlay-plot.png",
        reference_label="reference",
        candidate_label="candidate",
        x_label="Retention time (min)",
        title="LC-MS TIC overlay (synthetic fixture)",
    )
    coverage = write_sequence_coverage_plot(
        80,
        ["10-14", "70-80"],
        tmp_path / "sequence-coverage-plot.png",
        coverage_percent=82.5,
    )
    fragments = write_fragment_ion_plot(
        [("b", 2, 261.08), ("y", 2, 278.15), ("b", 3, 390.17)],
        tmp_path / "fragment-ion-plot.png",
        peptide_sequence="EEMTK",
    )
    for path in (mirror, overlay, coverage, fragments):
        assert path.is_file()
        assert path.stat().st_size > 1000
