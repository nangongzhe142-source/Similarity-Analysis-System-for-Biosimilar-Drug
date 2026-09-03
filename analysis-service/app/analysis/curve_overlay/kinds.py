# -*- coding: utf-8 -*-
"""Per-item axis labels and region windows for curve-overlay (P26)."""

from __future__ import annotations

from dataclasses import dataclass

from app.analysis.curve_overlay.constants import CURVE_OVERLAY_PROFILE


@dataclass(frozen=True)
class CurveRegion:
    region_id: str
    x_start: float
    x_end: float


@dataclass(frozen=True)
class CurveKind:
    item_id: str
    method_id: str
    x_label_zh: str
    x_label_en: str
    y_label_zh: str
    y_label_en: str
    plot_title_zh: str
    plot_title_en: str
    invert_for_peaks: bool
    regions: tuple[CurveRegion, ...]


CURVE_KINDS: dict[str, CurveKind] = {
    "sec-hmw-aggregates": CurveKind(
        item_id="sec-hmw-aggregates",
        method_id="sec-hmw-aggregates-primary-1",
        x_label_zh="保留时间 (min)",
        x_label_en="Retention time (min)",
        y_label_zh="吸光度 (相对)",
        y_label_en="Absorbance (relative)",
        plot_title_zh="SEC 叠加（合成演示）",
        plot_title_en="SEC overlay (synthetic demo)",
        invert_for_peaks=False,
        regions=(
            CurveRegion("HMW", 5.0, 8.4),
            CurveRegion("monomer", 8.4, 11.2),
            CurveRegion("LMW", 11.2, 16.0),
        ),
    ),
    "acidic-charge-variants": CurveKind(
        item_id="acidic-charge-variants",
        method_id="acidic-charge-variants-primary-1",
        x_label_zh="表观 pI",
        x_label_en="Apparent pI",
        y_label_zh="响应 (相对)",
        y_label_en="Response (relative)",
        plot_title_zh="电荷变异体叠加（合成演示）",
        plot_title_en="Charge-variant overlay (synthetic demo)",
        invert_for_peaks=False,
        regions=(
            CurveRegion("acidic", 7.4, 8.45),
            CurveRegion("main", 8.45, 8.95),
            CurveRegion("basic", 8.95, 9.8),
        ),
    ),
    "far-uv-cd": CurveKind(
        item_id="far-uv-cd",
        method_id="far-uv-cd-primary-1",
        x_label_zh="波长 (nm)",
        x_label_en="Wavelength (nm)",
        y_label_zh="椭圆度 (相对)",
        y_label_en="Ellipticity (relative)",
        plot_title_zh="远紫外 CD 叠加（合成演示）",
        plot_title_en="Far-UV CD overlay (synthetic demo)",
        invert_for_peaks=True,
        regions=(),
    ),
}


def get_curve_kind(item_id: str) -> CurveKind:
    kind = CURVE_KINDS.get(item_id)
    if kind is None:
        raise ValueError(
            f"profile {CURVE_OVERLAY_PROFILE} has no curve kind for item {item_id}"
        )
    return kind
