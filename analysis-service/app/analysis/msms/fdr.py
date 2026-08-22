# -*- coding: utf-8 -*-
"""Target-decoy FDR filtering for Comet PSM lists."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.msms.psm_parser import PeptideSpectrumMatch


@dataclass(frozen=True)
class FilteredPsmSet:
    accepted: tuple[PeptideSpectrumMatch, ...]
    fdr_at_threshold: float
    target_count: int
    decoy_count: int


def best_rank_one_per_scan(psms: list[PeptideSpectrumMatch]) -> list[PeptideSpectrumMatch]:
    by_scan: dict[int, PeptideSpectrumMatch] = {}
    for psm in psms:
        existing = by_scan.get(psm.scan)
        if existing is None or psm.rank < existing.rank:
            by_scan[psm.scan] = psm
    return list(by_scan.values())


def filter_psms_at_fdr(
    psms: list[PeptideSpectrumMatch],
    *,
    threshold: float,
) -> FilteredPsmSet:
    """Apply a simple target-decoy FDR cutoff on rank-1 PSMs sorted by expect."""
    rank_one = best_rank_one_per_scan(psms)
    if not rank_one:
        return FilteredPsmSet(accepted=(), fdr_at_threshold=0.0, target_count=0, decoy_count=0)

    sorted_psms = sorted(rank_one, key=lambda psm: psm.expect)
    accepted: list[PeptideSpectrumMatch] = []
    targets = 0
    decoys = 0
    fdr_at_threshold = 0.0

    for index, psm in enumerate(sorted_psms, start=1):
        if psm.is_decoy:
            decoys += 1
        else:
            targets += 1
        current_fdr = decoys / max(targets, 1)
        if current_fdr <= threshold:
            accepted.append(psm)
            fdr_at_threshold = current_fdr
        else:
            break

    return FilteredPsmSet(
        accepted=tuple(accepted),
        fdr_at_threshold=round(fdr_at_threshold, 6),
        target_count=targets,
        decoy_count=decoys,
    )
