# -*- coding: utf-8 -*-
"""Image similarity metrics for exploratory comparison only.

These numbers describe how alike two pictures look. They say nothing about whether
two products are biosimilar, and the plan forbids deriving a verdict from them.
Nothing in this module returns a pass/fail value.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.analysis.image_fallback.constants import (
    DTW_MAX_SERIES_POINTS,
    TRACE_SHAPE_CANVAS_PX,
)


@dataclass(frozen=True)
class SimilarityMetrics:
    ssim: float | None
    correlation: float | None
    dtw_distance: float | None


def compare_images(left_gray: np.ndarray, right_gray: np.ndarray) -> float | None:
    """Structural similarity between two grayscale images of equal shape."""
    from skimage.metrics import structural_similarity

    if left_gray.shape != right_gray.shape:
        import cv2

        height, width = left_gray.shape[:2]
        right_gray = cv2.resize(right_gray, (width, height), interpolation=cv2.INTER_AREA)

    if min(left_gray.shape[:2]) < 7:
        return None
    return float(structural_similarity(left_gray, right_gray))


def mirror_similarity(gray: np.ndarray) -> float | None:
    """Compare the upper half of a mirror plot against the flipped lower half."""
    half = gray.shape[0] // 2
    if half < 7:
        return None
    top = gray[:half]
    bottom = np.flipud(gray[half : half * 2])
    return compare_images(top, bottom)


def trace_shape_similarity(
    first_mask: np.ndarray,
    second_mask: np.ndarray,
    *,
    invert_second: bool,
) -> float | None:
    """Structural similarity of two curves, each on its own normalised canvas.

    Comparing halves of the rendered page instead would score the legend, the axis
    labels and the vertical gap between bands alongside the curves, which is why
    the whole-page variant returns roughly the same number for figures whose
    curves agree closely and for figures whose curves do not.

    `invert_second` is set for a mirrored figure, where the second trace is drawn
    upside down and must be flipped before the shapes are comparable.
    """
    first_canvas = _trace_canvas(first_mask, flip=False)
    second_canvas = _trace_canvas(second_mask, flip=invert_second)
    if first_canvas is None or second_canvas is None:
        return None
    return compare_images(first_canvas, second_canvas)


def _trace_canvas(mask: np.ndarray, *, flip: bool) -> np.ndarray | None:
    """Crop a trace to its bounding box and rescale it to a fixed square."""
    import cv2

    rows = np.nonzero(mask.any(axis=1))[0]
    columns = np.nonzero(mask.any(axis=0))[0]
    if rows.size == 0 or columns.size == 0:
        return None

    cropped = mask[rows.min() : rows.max() + 1, columns.min() : columns.max() + 1]
    if min(cropped.shape[:2]) < 2:
        return None

    if flip:
        cropped = np.flipud(cropped)

    canvas = (cropped.astype(np.uint8)) * 255
    return cv2.resize(
        canvas,
        (TRACE_SHAPE_CANVAS_PX, TRACE_SHAPE_CANVAS_PX),
        interpolation=cv2.INTER_AREA,
    )


def profile_correlation(left: np.ndarray, right: np.ndarray) -> float | None:
    """Pearson correlation between two 1-D profiles."""
    left_series, right_series = _align_lengths(left, right)
    if left_series.size < 2:
        return None
    if np.std(left_series) == 0 or np.std(right_series) == 0:
        return None
    return float(np.corrcoef(left_series, right_series)[0, 1])


def dtw_distance(left: np.ndarray, right: np.ndarray) -> float | None:
    """Dynamic time warping distance between two normalised profiles.

    DTW tolerates the horizontal shifts that retention-time drift produces, which
    plain correlation punishes. Series are downsampled first because the algorithm
    is quadratic and a full-width figure profile would dominate the runtime.
    """
    left_series = _downsample(left, DTW_MAX_SERIES_POINTS)
    right_series = _downsample(right, DTW_MAX_SERIES_POINTS)
    if left_series.size == 0 or right_series.size == 0:
        return None

    left_series = _normalise(left_series)
    right_series = _normalise(right_series)

    rows, columns = left_series.size, right_series.size
    previous = np.full(columns + 1, np.inf)
    previous[0] = 0.0

    for row in range(1, rows + 1):
        current = np.full(columns + 1, np.inf)
        for column in range(1, columns + 1):
            cost = abs(left_series[row - 1] - right_series[column - 1])
            current[column] = cost + min(
                previous[column],
                current[column - 1],
                previous[column - 1],
            )
        previous = current

    return float(previous[columns])


def _align_lengths(left: np.ndarray, right: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    length = min(left.size, right.size)
    return left[:length].astype(float), right[:length].astype(float)


def _downsample(series: np.ndarray, target: int) -> np.ndarray:
    values = np.asarray(series, dtype=float)
    if values.size <= target:
        return values
    indices = np.linspace(0, values.size - 1, target).astype(int)
    return values[indices]


def _normalise(series: np.ndarray) -> np.ndarray:
    peak = float(np.max(np.abs(series)))
    if peak == 0:
        return series
    return series / peak
