# -*- coding: utf-8 -*-
"""Backend PNG writers for analysis artifacts (P12, D9)."""

from __future__ import annotations

from pathlib import Path

import numpy as np


def _prepare_axis(output_path: Path):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    output_path.parent.mkdir(parents=True, exist_ok=True)
    return plt


def write_mirror_mass_plot(
    reference_masses: list[float],
    candidate_masses: list[float],
    output_path: Path,
    *,
    reference_label: str,
    candidate_label: str,
) -> Path:
    plt = _prepare_axis(output_path)
    figure, axis = plt.subplots(figsize=(8, 4))
    for index, mass in enumerate(reference_masses):
        axis.vlines(
            mass,
            0,
            1,
            colors="tab:red",
            linewidth=1.5,
            label=reference_label if index == 0 else None,
        )
    for index, mass in enumerate(candidate_masses):
        axis.vlines(
            mass,
            0,
            -1,
            colors="tab:blue",
            linewidth=1.5,
            label=candidate_label if index == 0 else None,
        )
    axis.axhline(0, color="black", linewidth=0.8)
    axis.set_xlabel("Deconvolved mass (Da)")
    axis.set_ylabel("Relative intensity (mirrored)")
    axis.set_title("Intact mass mirror plot")
    axis.legend(loc="upper right")
    axis.grid(True, alpha=0.2)
    if reference_masses or candidate_masses:
        all_masses = reference_masses + candidate_masses
        span = max(all_masses) - min(all_masses)
        padding = max(span * 0.05, 50.0)
        axis.set_xlim(min(all_masses) - padding, max(all_masses) + padding)
    figure.tight_layout()
    figure.savefig(output_path, dpi=150)
    plt.close(figure)
    return output_path


def write_chromatogram_overlay_plot(
    reference_points: list[tuple[float, float]],
    candidate_points: list[tuple[float, float]],
    output_path: Path,
    *,
    reference_label: str,
    candidate_label: str,
    x_label: str,
    title: str,
    y_label: str = "Relative intensity",
) -> Path:
    plt = _prepare_axis(output_path)
    figure, axis = plt.subplots(figsize=(8, 4))
    if reference_points:
        xs, ys = zip(*reference_points)
        axis.plot(xs, ys, color="tab:red", linewidth=1.4, label=reference_label)
    if candidate_points:
        xs, ys = zip(*candidate_points)
        axis.plot(xs, ys, color="tab:blue", linewidth=1.4, label=candidate_label)
    axis.set_xlabel(x_label)
    axis.set_ylabel(y_label)
    axis.set_title(title)
    axis.legend(loc="upper right")
    axis.grid(True, alpha=0.2)
    figure.tight_layout()
    figure.savefig(output_path, dpi=150)
    plt.close(figure)
    return output_path


def write_sequence_coverage_plot(
    sequence_length: int,
    uncovered_regions: list[str],
    output_path: Path,
    *,
    coverage_percent: float,
    residues_per_row: int = 50,
) -> Path:
    assert sequence_length > 0, "sequence length must be positive"
    plt = _prepare_axis(output_path)
    uncovered = _expand_regions(uncovered_regions, sequence_length)
    row_count = int(np.ceil(sequence_length / residues_per_row))
    figure_height = max(2.5, 0.45 * row_count + 1.2)
    figure, axis = plt.subplots(figsize=(10, figure_height))

    for residue_index in range(sequence_length):
        row = residue_index // residues_per_row
        column = residue_index % residues_per_row
        covered = (residue_index + 1) not in uncovered
        axis.add_patch(
            plt.Rectangle(
                (column, -row - 1),
                1,
                1,
                facecolor="#cbd5e1" if covered else "#ffffff",
                edgecolor="#94a3b8",
                linewidth=0.3,
            )
        )

    axis.set_xlim(0, residues_per_row)
    axis.set_ylim(-row_count, 0)
    axis.set_aspect("equal")
    axis.set_xticks([0, residues_per_row])
    axis.set_yticks([])
    axis.set_xlabel("Residue index within row (50 per row)")
    axis.set_title(f"MS sequence coverage map ({coverage_percent:.2f}%)")
    figure.tight_layout()
    figure.savefig(output_path, dpi=150)
    plt.close(figure)
    return output_path


def write_fragment_ion_plot(
    ions: list[tuple[str, int, float]],
    output_path: Path,
    *,
    peptide_sequence: str,
) -> Path:
    """Draw b ions upward and y ions downward. Each ion is (ion_type, ordinal, mz)."""
    plt = _prepare_axis(output_path)
    figure, axis = plt.subplots(figsize=(8, 4))
    for ion_type, ordinal, mz in ions:
        direction = 1.0 if ion_type.lower().startswith("b") else -1.0
        colour = "tab:blue" if direction > 0 else "tab:red"
        axis.vlines(mz, 0, direction, colors=colour, linewidth=1.4)
        axis.text(
            mz,
            direction * 1.05,
            f"{ion_type}{ordinal}",
            ha="center",
            va="bottom" if direction > 0 else "top",
            fontsize=8,
        )
    axis.axhline(0, color="black", linewidth=0.8)
    axis.set_xlabel("m/z")
    axis.set_ylabel("b (up) / y (down)")
    axis.set_title(f"MS/MS fragment ions — {peptide_sequence}")
    axis.set_ylim(-1.4, 1.4)
    figure.tight_layout()
    figure.savefig(output_path, dpi=150)
    plt.close(figure)
    return output_path


def _expand_regions(regions: list[str], sequence_length: int) -> set[int]:
    uncovered: set[int] = set()
    for region in regions:
        if "-" in region:
            start_text, end_text = region.split("-", 1)
            start, end = int(start_text), int(end_text)
            uncovered.update(range(start, end + 1))
        elif region:
            uncovered.add(int(region))
    return {position for position in uncovered if 1 <= position <= sequence_length}
