# -*- coding: utf-8 -*-
"""Synthetic LC-MS TIC traces for peptide-map overlay plots (P12 fixture)."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

RANDOM_SEED = 20260814
RT_START_MIN = 5.0
RT_END_MIN = 40.0
POINT_COUNT = 120
PEAK_WIDTH_MIN = 0.45
REFERENCE_PEAK_CENTERS_MIN = (8.2, 12.5, 18.1, 24.0, 31.4)
REFERENCE_PEAK_HEIGHTS = (0.55, 1.0, 0.72, 0.88, 0.64)
CANDIDATE_LAST_PEAK_SHIFT_MIN = 0.40


@dataclass(frozen=True)
class ChromatogramTrace:
    label: str
    points: tuple[tuple[float, float], ...]


def _gaussian_trace(
    rt_grid: np.ndarray,
    centers: tuple[float, ...],
    heights: tuple[float, ...],
) -> np.ndarray:
    intensity = np.zeros_like(rt_grid)
    for center, height in zip(centers, heights, strict=True):
        intensity += height * np.exp(-0.5 * ((rt_grid - center) / PEAK_WIDTH_MIN) ** 2)
    return intensity


def simulate_tic_pair(
    rng: np.random.Generator | None = None,
) -> tuple[ChromatogramTrace, ChromatogramTrace]:
    """Return labeled synthetic TICs. The last candidate peak is shifted on purpose."""
    generator = rng or np.random.default_rng(RANDOM_SEED)
    rt_grid = np.linspace(RT_START_MIN, RT_END_MIN, POINT_COUNT)
    noise_scale = 0.012
    reference_intensity = _gaussian_trace(
        rt_grid, REFERENCE_PEAK_CENTERS_MIN, REFERENCE_PEAK_HEIGHTS
    )
    candidate_centers = (
        *REFERENCE_PEAK_CENTERS_MIN[:-1],
        REFERENCE_PEAK_CENTERS_MIN[-1] + CANDIDATE_LAST_PEAK_SHIFT_MIN,
    )
    candidate_intensity = _gaussian_trace(rt_grid, candidate_centers, REFERENCE_PEAK_HEIGHTS)
    reference_intensity = np.clip(
        reference_intensity + generator.normal(0.0, noise_scale, size=rt_grid.shape),
        0.0,
        None,
    )
    candidate_intensity = np.clip(
        candidate_intensity + generator.normal(0.0, noise_scale, size=rt_grid.shape),
        0.0,
        None,
    )
    reference_points = tuple(
        (round(float(rt), 3), round(float(intensity), 4))
        for rt, intensity in zip(rt_grid, reference_intensity, strict=True)
    )
    candidate_points = tuple(
        (round(float(rt), 3), round(float(intensity), 4))
        for rt, intensity in zip(rt_grid, candidate_intensity, strict=True)
    )
    return (
        ChromatogramTrace(label="reference", points=reference_points),
        ChromatogramTrace(label="candidate", points=candidate_points),
    )
