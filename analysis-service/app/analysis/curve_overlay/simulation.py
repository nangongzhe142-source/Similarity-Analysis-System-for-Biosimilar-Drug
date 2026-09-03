# -*- coding: utf-8 -*-
"""Deterministic synthetic traces for curve-overlay (P26)."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.analysis.curve_overlay.constants import RANDOM_SEED
from app.analysis.curve_overlay.kinds import CurveKind, get_curve_kind


@dataclass(frozen=True)
class CurveTrace:
    label: str
    points: tuple[tuple[float, float], ...]


def _gaussian(grid: np.ndarray, center: float, height: float, width: float) -> np.ndarray:
    return height * np.exp(-0.5 * ((grid - center) / width) ** 2)


def _with_noise(values: np.ndarray, scale: float, generator: np.random.Generator) -> np.ndarray:
    return values + generator.normal(0.0, scale, size=values.shape)


def _to_points(grid: np.ndarray, values: np.ndarray) -> tuple[tuple[float, float], ...]:
    return tuple(
        (round(float(x), 4), round(float(y), 5))
        for x, y in zip(grid, values, strict=True)
    )


def _sec_pair(generator: np.random.Generator) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    grid = np.linspace(5.0, 16.0, 220)
    reference = (
        _gaussian(grid, 7.05, 0.12, 0.35)
        + _gaussian(grid, 9.55, 1.0, 0.42)
        + _gaussian(grid, 12.7, 0.08, 0.40)
    )
    candidate = (
        _gaussian(grid, 7.08, 0.17, 0.35)
        + _gaussian(grid, 9.57, 1.0, 0.42)
        + _gaussian(grid, 12.72, 0.08, 0.40)
    )
    noise = 0.008
    return (
        grid,
        np.clip(_with_noise(reference, noise, generator), 0.0, None),
        np.clip(_with_noise(candidate, noise, generator), 0.0, None),
    )


def _cex_pair(generator: np.random.Generator) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    grid = np.linspace(7.4, 9.8, 220)
    reference = (
        _gaussian(grid, 8.18, 0.22, 0.12)
        + _gaussian(grid, 8.70, 1.0, 0.10)
        + _gaussian(grid, 9.18, 0.18, 0.11)
    )
    candidate = (
        _gaussian(grid, 8.19, 0.28, 0.12)
        + _gaussian(grid, 8.71, 1.0, 0.10)
        + _gaussian(grid, 9.17, 0.16, 0.11)
    )
    noise = 0.006
    return (
        grid,
        np.clip(_with_noise(reference, noise, generator), 0.0, None),
        np.clip(_with_noise(candidate, noise, generator), 0.0, None),
    )


def _cd_pair(generator: np.random.Generator) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    grid = np.linspace(190.0, 250.0, 240)
    reference = _gaussian(grid, 208.0, -12.0, 6.5) + _gaussian(grid, 222.0, -10.5, 7.5)
    candidate = 0.97 * reference
    noise = 0.12
    return grid, _with_noise(reference, noise, generator), _with_noise(candidate, noise, generator)


def simulate_curve_pair(
    item_id: str,
    *,
    rng: np.random.Generator | None = None,
) -> tuple[CurveKind, CurveTrace, CurveTrace]:
    kind = get_curve_kind(item_id)
    generator = rng or np.random.default_rng(RANDOM_SEED)
    if item_id == "sec-hmw-aggregates":
        grid, reference, candidate = _sec_pair(generator)
    elif item_id == "acidic-charge-variants":
        grid, reference, candidate = _cex_pair(generator)
    elif item_id == "far-uv-cd":
        grid, reference, candidate = _cd_pair(generator)
    else:
        raise ValueError(f"no synthetic generator for item {item_id}")
    return (
        kind,
        CurveTrace(label="reference", points=_to_points(grid, reference)),
        CurveTrace(label="candidate", points=_to_points(grid, candidate)),
    )
