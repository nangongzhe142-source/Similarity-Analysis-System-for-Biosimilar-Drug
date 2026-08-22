# -*- coding: utf-8 -*-
"""Sequence-coverage figure reading.

image6.png prints five different coverage definitions side by side (Control,
Control unique, Combined, Common, Analyte, Analyte unique). OCR reads them cleanly,
so they are parsed as text rather than estimated from pixels.

Reading all definitions matters for a reason beyond completeness: on that figure
Analyte and Common coverage are both 0.0 while Control and Combined are 99.5/99.8.
A reader shown only "99.8%" would reasonably assume both products were covered to
99.8%, when in fact only one side carries data. The definition is therefore carried
alongside every percentage.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from app.analysis.image_fallback.constants import COVERAGE_DEFINITION_LABELS

COVERAGE_LINE_PATTERN = re.compile(
    r"(?P<label>[A-Za-z][A-Za-z ]*?coverage)\s*\(%\)\s*[:;]\s*(?P<value>\d+(?:\.\d+)?)",
    re.IGNORECASE,
)
CHAIN_HINT_PATTERN = re.compile(r"^\s*(LC|HC)\s*$", re.IGNORECASE)


@dataclass(frozen=True)
class CoverageReading:
    label: str
    definition: str
    percent: float


@dataclass(frozen=True)
class CoverageExtraction:
    readings: tuple[CoverageReading, ...]
    percent_by_definition: dict[str, float]
    has_analyte_side_data: bool
    definitions_found: tuple[str, ...]


def parse_coverage_text(text: str) -> CoverageExtraction:
    readings: list[CoverageReading] = []
    for match in COVERAGE_LINE_PATTERN.finditer(text):
        raw_label = " ".join(match.group("label").split()).lower()
        definition = COVERAGE_DEFINITION_LABELS.get(raw_label)
        if definition is None:
            continue
        readings.append(
            CoverageReading(
                label=raw_label,
                definition=definition,
                percent=float(match.group("value")),
            )
        )

    percent_by_definition: dict[str, float] = {}
    for reading in readings:
        # Keep the highest value seen for a definition; the figure repeats each
        # definition once per chain (LC and HC).
        current = percent_by_definition.get(reading.definition)
        if current is None or reading.percent > current:
            percent_by_definition[reading.definition] = reading.percent

    analyte_percent = percent_by_definition.get("analyte", 0.0)
    common_percent = percent_by_definition.get("common", 0.0)

    return CoverageExtraction(
        readings=tuple(readings),
        percent_by_definition=percent_by_definition,
        has_analyte_side_data=analyte_percent > 0.0 or common_percent > 0.0,
        definitions_found=tuple(sorted(percent_by_definition)),
    )


def count_shaded_residue_blocks(image_bgr) -> int:
    """Count the grey-shaded sequence blocks that mark covered residues.

    This is a structural cross-check on the OCR percentages: a figure reporting
    high coverage should also show many shaded blocks.
    """
    import cv2
    import numpy as np

    grey = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    # Shaded blocks sit between white background and black text.
    shaded = ((grey > 170) & (grey < 235)).astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3))
    closed = cv2.morphologyEx(shaded, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return sum(1 for contour in contours if cv2.contourArea(contour) > 400)
