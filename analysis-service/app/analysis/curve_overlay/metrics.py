# -*- coding: utf-8 -*-
"""Grid alignment, correlation, peak picking and region areas (P26)."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.analysis.curve_overlay.constants import (
    ALIGNMENT_GRID_POINTS,
    PEAK_PROMINENCE_FRACTION,
    SMOOTHING_WINDOW,
)
from app.analysis.curve_overlay.kinds import CurveKind, CurveRegion
from app.analysis.curve_overlay.simulation import CurveTrace


@dataclass(frozen=True)
class DetectedPeak:
    x: float
    height: float


@dataclass(frozen=True)
class RegionArea:
    region_id: str
    reference_percent: float
    candidate_percent: float
    delta_pp: float


@dataclass(frozen=True)
class CurveMetrics:
    pearson_r: float
    rmse: float
    grid_x: tuple[float, ...]
    reference_y: tuple[float, ...]
    candidate_y: tuple[float, ...]
    reference_peaks: tuple[DetectedPeak, ...]
    candidate_peaks: tuple[DetectedPeak, ...]
    regions: tuple[RegionArea, ...]


def _xy(trace: CurveTrace) -> tuple[np.ndarray, np.ndarray]:
    xs = np.array([point[0] for point in trace.points], dtype=float)
    ys = np.array([point[1] for point in trace.points], dtype=float)
    order = np.argsort(xs)
    return xs[order], ys[order]


def _smooth(values: np.ndarray) -> np.ndarray:
    window = SMOOTHING_WINDOW if SMOOTHING_WINDOW % 2 == 1 else SMOOTHING_WINDOW + 1
    if values.size < window:
        return values
    kernel = np.ones(window) / window
    return np.convolve(values, kernel, mode="same")


def _pick_peaks(grid: np.ndarray, values: np.ndarray, *, invert: bool) -> tuple[DetectedPeak, ...]:
    work = -values if invert else values
    peak_max = float(np.max(work)) if work.size else 0.0
    if peak_max <= 0.0:
        return ()
    floor = PEAK_PROMINENCE_FRACTION * peak_max
    peaks: list[DetectedPeak] = []
    for index in range(1, work.size - 1):
        if work[index] < floor:
            continue
        if work[index] >= work[index - 1] and work[index] > work[index + 1]:
            peaks.append(
                DetectedPeak(x=round(float(grid[index]), 4), height=round(float(values[index]), 5))
            )
    return tuple(peaks)


def _region_percent(
    grid: np.ndarray,
    values: np.ndarray,
    region: CurveRegion,
    total: float,
) -> float:
    mask = (grid >= region.x_start) & (grid < region.x_end)
    if not np.any(mask) or total <= 0.0:
        return 0.0
    area = float(np.trapezoid(np.clip(values[mask], 0.0, None), grid[mask]))
    return round(100.0 * area / total, 3)


def compute_curve_metrics(
    kind: CurveKind,
    reference: CurveTrace,
    candidate: CurveTrace,
) -> CurveMetrics:
    reference_x, reference_y = _xy(reference)
    candidate_x, candidate_y = _xy(candidate)
    lo = float(min(reference_x[0], candidate_x[0]))
    hi = float(max(reference_x[-1], candidate_x[-1]))
    if hi <= lo:
        raise ValueError("curve x-range is degenerate")
    grid = np.linspace(lo, hi, ALIGNMENT_GRID_POINTS)
    aligned_reference = _smooth(np.interp(grid, reference_x, reference_y))
    aligned_candidate = _smooth(np.interp(grid, candidate_x, candidate_y))
    pearson = float(np.corrcoef(aligned_reference, aligned_candidate)[0, 1])
    rmse = float(np.sqrt(np.mean((aligned_reference - aligned_candidate) ** 2)))
    reference_total = float(np.trapezoid(np.clip(aligned_reference, 0.0, None), grid))
    candidate_total = float(np.trapezoid(np.clip(aligned_candidate, 0.0, None), grid))
    regions = tuple(
        RegionArea(
            region_id=region.region_id,
            reference_percent=_region_percent(grid, aligned_reference, region, reference_total),
            candidate_percent=_region_percent(grid, aligned_candidate, region, candidate_total),
            delta_pp=round(
                _region_percent(grid, aligned_candidate, region, candidate_total)
                - _region_percent(grid, aligned_reference, region, reference_total),
                3,
            ),
        )
        for region in kind.regions
    )
    return CurveMetrics(
        pearson_r=round(pearson, 6) if np.isfinite(pearson) else 0.0,
        rmse=round(rmse, 6),
        grid_x=tuple(round(float(value), 4) for value in grid),
        reference_y=tuple(round(float(value), 5) for value in aligned_reference),
        candidate_y=tuple(round(float(value), 5) for value in aligned_candidate),
        reference_peaks=_pick_peaks(grid, aligned_reference, invert=kind.invert_for_peaks),
        candidate_peaks=_pick_peaks(grid, aligned_candidate, invert=kind.invert_for_peaks),
        regions=regions,
    )
