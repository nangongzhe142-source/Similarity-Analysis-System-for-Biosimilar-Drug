# -*- coding: utf-8 -*-
"""Uncovered-region reporting and N/C terminus hints."""

from __future__ import annotations

from app.analysis.ms1_coverage.constants import C_TERMINUS_HINT_RESIDUES, N_TERMINUS_HINT_RESIDUES
from app.analysis.ms1_coverage.matching import CoverageResult


def compress_uncovered_regions(covered_positions: set[int], sequence_length: int) -> list[str]:
    """Merge consecutive uncovered residues into ranges like '174-180'."""
    uncovered = [position for position in range(1, sequence_length + 1) if position not in covered_positions]
    if not uncovered:
        return []

    regions: list[str] = []
    start = uncovered[0]
    previous = uncovered[0]
    for position in uncovered[1:]:
        if position == previous + 1:
            previous = position
            continue
        regions.append(f"{start}-{previous}" if start != previous else str(start))
        start = position
        previous = position
    regions.append(f"{start}-{previous}" if start != previous else str(start))
    return regions


def covered_positions_from_result(result: CoverageResult) -> set[int]:
    positions: set[int] = set()
    for peptide in result.matched_peptides:
        positions.update(range(peptide.start, peptide.end + 1))
    return positions


def uncovered_regions_for_result(result: CoverageResult) -> list[str]:
    covered = covered_positions_from_result(result)
    return compress_uncovered_regions(covered, result.sequence_length)


def terminal_hints(
    uncovered_regions: list[str],
    sequence_length: int,
) -> dict[str, bool]:
    """Flag whether uncovered regions touch the N- or C-terminus."""
    n_terminal = set(range(1, min(N_TERMINUS_HINT_RESIDUES, sequence_length) + 1))
    c_terminal = set(
        range(max(1, sequence_length - C_TERMINUS_HINT_RESIDUES + 1), sequence_length + 1)
    )

    uncovered_positions: set[int] = set()
    for region in uncovered_regions:
        if "-" in region:
            start_text, end_text = region.split("-", 1)
            start, end = int(start_text), int(end_text)
            uncovered_positions.update(range(start, end + 1))
        else:
            uncovered_positions.add(int(region))

    return {
        "nTerminusUncovered": bool(uncovered_positions & n_terminal),
        "cTerminusUncovered": bool(uncovered_positions & c_terminal),
    }
