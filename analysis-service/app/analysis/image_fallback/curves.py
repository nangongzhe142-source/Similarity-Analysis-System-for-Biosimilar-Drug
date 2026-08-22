# -*- coding: utf-8 -*-
"""Trace separation and peak extraction for mirrored / overlaid spectra."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.analysis.image_fallback.calibration import (
    AxisCalibration,
    normalised_pixel,
)
from app.analysis.image_fallback.constants import (
    BASELINE_UPRIGHT_POSITION,
    BLUE_MIN_LEVEL,
    BLUE_VS_GREEN_MARGIN,
    BLUE_VS_RED_MARGIN,
    MIN_BASELINE_ROW_COLUMNS,
    MIN_PEAK_SEPARATION_PX,
    MIN_TRACE_PIXELS,
    MIRROR_BASELINE_ADJACENCY_FRACTION,
    PEAK_BASELINE_PERCENTILE,
    PEAK_PAIR_MAX_NORMALISED_SHIFT,
    PEAK_PROMINENCE_FRACTION,
    RED_CHANNEL_MARGIN,
    RED_MIN_LEVEL,
)

TRACE_ORIENTATION_UP = "up"
TRACE_ORIENTATION_DOWN = "down"
TRACE_ORIENTATION_UNKNOWN = "unknown"

FIGURE_LAYOUT_MIRROR = "mirror"
FIGURE_LAYOUT_STACKED = "stacked"
FIGURE_LAYOUT_UNKNOWN = "unknown"


@dataclass(frozen=True)
class ExtractedTrace:
    """One colour-separated curve, as a per-column profile in pixel space.

    `label` names the colour rather than the product. Which product a colour
    stands for belongs to the figure's legend, not to the extractor: the figures
    in 图谱数据库 draw the candidate in red and the reference in blue, and a
    different publication may reverse that. The caller supplies the mapping.
    """

    label: str
    colour: str
    pixel_count: int
    column_profile: np.ndarray
    present: bool
    mask: np.ndarray
    band_top: int | None = None
    band_bottom: int | None = None
    baseline_row: int | None = None
    baseline_columns: int = 0
    orientation: str = TRACE_ORIENTATION_UNKNOWN


@dataclass(frozen=True)
class ExtractedPeak:
    """A peak location, expressed in physical units only when calibration allows."""

    column_pixel: float
    height_fraction: float
    axis_value: float | None
    normalised_position: float


@dataclass(frozen=True)
class FigureLayout:
    """How the two traces are arranged relative to each other."""

    kind: str
    corroborated: bool
    reason: str


@dataclass(frozen=True)
class PeakPair:
    """One peak of the first trace against its counterpart in the second.

    Either side may be absent, which is the point: a peak present in one product
    and missing in the other is exactly what a head-to-head comparison must show.
    """

    first_peak: ExtractedPeak | None
    second_peak: ExtractedPeak | None
    normalised_shift: float | None
    axis_shift: float | None

    @property
    def matched(self) -> bool:
        return self.first_peak is not None and self.second_peak is not None


def separate_red_blue_traces(image_bgr: np.ndarray) -> tuple[ExtractedTrace, ExtractedTrace]:
    """Split a two-colour figure into its red and blue traces.

    Mirror and stacked figures in this document set encode the two products as red
    and blue curves, so channel dominance is a more robust separator than intensity
    thresholding, which would also pick up the black axes and text.
    """
    channels = image_bgr.astype(int)
    blue, green, red = channels[:, :, 0], channels[:, :, 1], channels[:, :, 2]

    red_mask = (
        (red > RED_MIN_LEVEL)
        & (red - green > RED_CHANNEL_MARGIN)
        & (red - blue > RED_CHANNEL_MARGIN)
    )
    blue_mask = (
        (blue > BLUE_MIN_LEVEL)
        & (blue - red > BLUE_VS_RED_MARGIN)
        & (blue - green > BLUE_VS_GREEN_MARGIN)
    )

    return (
        _trace_from_mask("red", red_mask),
        _trace_from_mask("blue", blue_mask),
    )


def _trace_from_mask(colour: str, mask: np.ndarray) -> ExtractedTrace:
    pixel_count = int(mask.sum())
    occupied_rows = np.nonzero(mask.any(axis=1))[0]
    band_top = int(occupied_rows.min()) if occupied_rows.size else None
    band_bottom = int(occupied_rows.max()) if occupied_rows.size else None

    baseline_row: int | None = None
    baseline_columns = 0
    orientation = TRACE_ORIENTATION_UNKNOWN

    if occupied_rows.size:
        columns_per_row = mask.sum(axis=1)
        baseline_row = int(np.argmax(columns_per_row))
        baseline_columns = int(columns_per_row[baseline_row])
        if baseline_columns >= MIN_BASELINE_ROW_COLUMNS:
            span = max((band_bottom or 0) - (band_top or 0), 1)
            position = (baseline_row - (band_top or 0)) / span
            orientation = (
                TRACE_ORIENTATION_UP
                if position > BASELINE_UPRIGHT_POSITION
                else TRACE_ORIENTATION_DOWN
            )

    return ExtractedTrace(
        label=colour,
        colour=colour,
        pixel_count=pixel_count,
        column_profile=mask.sum(axis=0).astype(float),
        present=pixel_count >= MIN_TRACE_PIXELS,
        mask=mask,
        band_top=band_top,
        band_bottom=band_bottom,
        baseline_row=baseline_row,
        baseline_columns=baseline_columns,
        orientation=orientation,
    )


def detect_layout(
    first: ExtractedTrace,
    second: ExtractedTrace,
    *,
    image_height: int,
) -> FigureLayout:
    """Decide whether the figure mirrors one trace or stacks both upright.

    Two independent signals must agree. The primary one is where each trace's
    baseline sits inside its own band: a mirrored trace hangs from the top of its
    band, an upright one stands on the bottom. The corroborating one is how far
    apart the two baselines are, because a mirror shares a single axis while a
    stack keeps a full band between them.

    Disagreement resolves to `stacked`, which compares the traces without
    inverting either. On a genuinely mirrored figure that understates similarity;
    the opposite default would manufacture agreement that is not there.
    """
    if not (first.present and second.present):
        return FigureLayout(
            FIGURE_LAYOUT_UNKNOWN,
            False,
            "fewer than two traces were detected, so there is no layout to determine",
        )

    if TRACE_ORIENTATION_UNKNOWN in {first.orientation, second.orientation}:
        return FigureLayout(
            FIGURE_LAYOUT_UNKNOWN,
            False,
            "a trace carries no baseline row wide enough to read its orientation",
        )

    by_orientation = (
        FIGURE_LAYOUT_MIRROR
        if first.orientation != second.orientation
        else FIGURE_LAYOUT_STACKED
    )

    adjacency = abs((first.baseline_row or 0) - (second.baseline_row or 0)) / max(image_height, 1)
    by_adjacency = (
        FIGURE_LAYOUT_MIRROR
        if adjacency <= MIRROR_BASELINE_ADJACENCY_FRACTION
        else FIGURE_LAYOUT_STACKED
    )

    if by_orientation == by_adjacency:
        return FigureLayout(
            by_orientation,
            True,
            f"baseline orientation and baseline adjacency ({adjacency:.3f}) agree",
        )

    return FigureLayout(
        FIGURE_LAYOUT_STACKED,
        False,
        f"baseline orientation says {by_orientation} but baseline adjacency "
        f"({adjacency:.3f}) says {by_adjacency}; the traces are compared without "
        "inversion, which understates rather than overstates similarity",
    )


def baseline_corrected_profile(profile: np.ndarray) -> np.ndarray:
    """Remove the trace's baseline offset from its column profile.

    Only columns the trace actually occupies contribute to the estimate; the empty
    margins outside the plotted range would otherwise drag the baseline to zero
    and reinstate the very bias this removes.
    """
    if profile.size == 0:
        return profile

    occupied = profile[profile > 0]
    if occupied.size == 0:
        return profile

    baseline = float(np.percentile(occupied, PEAK_BASELINE_PERCENTILE))
    return np.clip(profile - baseline, 0.0, None)


def pick_peaks(
    trace: ExtractedTrace,
    calibration: AxisCalibration,
) -> list[ExtractedPeak]:
    """Find local maxima in a column profile.

    Heights are measured above the trace's own baseline so that the two curves of
    one figure are cut by the same yardstick. Without the correction the thicker
    curve keeps minor peaks that the thinner one loses, and the difference then
    surfaces as peaks apparently present in one product only.

    Peaks are always reported with a normalised pixel position. The physical axis
    value is populated only when the calibration is reliable, which is how the
    "no Da without calibration" rule is enforced structurally.
    """
    profile = baseline_corrected_profile(trace.column_profile)
    if profile.size == 0:
        return []

    peak_max = float(profile.max())
    if peak_max <= 0:
        return []

    threshold = peak_max * PEAK_PROMINENCE_FRACTION
    candidate_columns: list[int] = []
    for column in range(1, profile.size - 1):
        value = profile[column]
        if value < threshold:
            continue
        if value >= profile[column - 1] and value >= profile[column + 1]:
            if candidate_columns and column - candidate_columns[-1] < MIN_PEAK_SEPARATION_PX:
                if value > profile[candidate_columns[-1]]:
                    candidate_columns[-1] = column
                continue
            candidate_columns.append(column)

    peaks: list[ExtractedPeak] = []
    for column in candidate_columns:
        axis_value = calibration.to_axis_value(column) if calibration.reliable else None
        peaks.append(
            ExtractedPeak(
                column_pixel=float(column),
                height_fraction=round(float(profile[column]) / peak_max, 4),
                axis_value=axis_value,
                normalised_position=round(normalised_pixel(column, profile.size), 6),
            )
        )
    return peaks


def pair_peaks(
    first_peaks: list[ExtractedPeak],
    second_peaks: list[ExtractedPeak],
    *,
    max_normalised_shift: float = PEAK_PAIR_MAX_NORMALISED_SHIFT,
) -> list[PeakPair]:
    """Match peaks across the two traces by horizontal position.

    Both traces share the figure's horizontal axis, so position is the only
    admissible matching key; heights are not comparable because each trace is
    normalised against its own maximum.
    """
    unclaimed = list(second_peaks)
    pairs: list[PeakPair] = []

    for peak in first_peaks:
        best: ExtractedPeak | None = None
        best_distance = max_normalised_shift
        for candidate in unclaimed:
            distance = abs(candidate.normalised_position - peak.normalised_position)
            if distance <= best_distance:
                best, best_distance = candidate, distance

        if best is None:
            pairs.append(PeakPair(peak, None, None, None))
            continue

        unclaimed.remove(best)
        axis_shift = None
        if peak.axis_value is not None and best.axis_value is not None:
            axis_shift = round(best.axis_value - peak.axis_value, 4)
        pairs.append(
            PeakPair(
                peak,
                best,
                round(best.normalised_position - peak.normalised_position, 6),
                axis_shift,
            )
        )

    pairs.extend(PeakPair(None, leftover, None, None) for leftover in unclaimed)
    pairs.sort(key=_pair_sort_key)
    return pairs


def _pair_sort_key(pair: PeakPair) -> float:
    anchor = pair.first_peak or pair.second_peak
    return anchor.normalised_position if anchor is not None else 0.0
