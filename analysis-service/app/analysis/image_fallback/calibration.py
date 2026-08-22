# -*- coding: utf-8 -*-
"""Pixel-to-axis calibration and the reliability gate it feeds.

The hard rule from the plan is enforced here rather than in documentation: when
calibration is not reliable, no Da / m·z⁻¹ / retention-time value may leave this
module. Callers receive normalised pixel coordinates instead, and there is no code
path that converts them into physical units.

Manual two-point calibration is the primary channel by deliberate choice. OCR of
axis ticks was measured against image1.jpeg and returned 147605, 147805, 148265,
148405, 148605, 148865 while the actual peak labels are 148059, 148221, 148383 and
148546 — it conflated axis ticks with peak annotations. An automatic channel that
wrong cannot be the default.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.analysis.image_fallback.constants import (
    MIN_CALIBRATION_PIXEL_SPAN,
    MIN_CALIBRATION_POINTS,
)

# Numbers printed on a figure. Used only as an untrusted OCR guess list; they
# must never be fed to build_axis_calibration. P10 measured image1 ticks as
# 147605…148865 while the peak labels are 148059…148546.
_OCR_NUMBER_PATTERN = re.compile(
    r"(?<![A-Za-z0-9.])(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?![A-Za-z0-9.])"
)


class CalibrationUnreliableError(RuntimeError):
    """Raised when a physical value is requested without a reliable calibration."""


@dataclass(frozen=True)
class CalibrationPoint:
    """One operator-supplied anchor: a pixel position and its axis value."""

    pixel: float
    axis_value: float


@dataclass(frozen=True)
class AxisCalibration:
    """An affine pixel-to-axis map, plus whether it may be trusted."""

    axis_name: str
    unit: str
    reliable: bool
    scale: float | None = None
    offset: float | None = None
    reason: str | None = None

    def to_axis_value(self, pixel: float) -> float:
        if not self.reliable or self.scale is None or self.offset is None:
            raise CalibrationUnreliableError(
                f"calibration for {self.axis_name} is unreliable; physical values are withheld"
            )
        return self.scale * pixel + self.offset


def build_axis_calibration(
    axis_name: str,
    unit: str,
    points: list[CalibrationPoint],
) -> AxisCalibration:
    """Fit an affine map from two or more anchors, refusing degenerate input."""
    if len(points) < MIN_CALIBRATION_POINTS:
        return AxisCalibration(
            axis_name=axis_name,
            unit=unit,
            reliable=False,
            reason=f"at least {MIN_CALIBRATION_POINTS} calibration points are required",
        )

    ordered = sorted(points, key=lambda point: point.pixel)
    first, last = ordered[0], ordered[-1]
    pixel_span = last.pixel - first.pixel
    axis_span = last.axis_value - first.axis_value

    if abs(pixel_span) < MIN_CALIBRATION_PIXEL_SPAN:
        return AxisCalibration(
            axis_name=axis_name,
            unit=unit,
            reliable=False,
            reason="calibration points are too close together to fix a scale",
        )
    if axis_span == 0:
        return AxisCalibration(
            axis_name=axis_name,
            unit=unit,
            reliable=False,
            reason="calibration points carry identical axis values",
        )

    scale = axis_span / pixel_span
    offset = first.axis_value - scale * first.pixel
    return AxisCalibration(
        axis_name=axis_name,
        unit=unit,
        reliable=True,
        scale=scale,
        offset=offset,
    )


def unreliable_calibration(axis_name: str, unit: str, reason: str) -> AxisCalibration:
    return AxisCalibration(axis_name=axis_name, unit=unit, reliable=False, reason=reason)


def ocr_numeric_tokens(text: str) -> tuple[float, ...]:
    """Parse digit tokens from OCR text. The values are guesses, not anchors."""
    values: list[float] = []
    for match in _OCR_NUMBER_PATTERN.finditer(text):
        try:
            values.append(float(match.group(1)))
        except ValueError:
            continue
    return tuple(values)


def ocr_guess_is_not_calibration() -> AxisCalibration:
    """P19: OCR may propose numbers; it is never a reliable axis."""
    return unreliable_calibration(
        "x",
        "unknown",
        "OCR axis tokens are untrusted guesses (P10: ticks were read as peak "
        "labels); physical units stay withheld until an operator supplies "
        "two-point calibration",
    )


def normalised_pixel(pixel: float, span_pixels: int) -> float:
    """Fallback output when calibration fails: a unit-interval pixel position."""
    assert span_pixels > 0, "pixel span must be positive"
    return max(0.0, min(1.0, pixel / span_pixels))
