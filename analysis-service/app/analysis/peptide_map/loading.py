# -*- coding: utf-8 -*-
"""Load two-column retention-time / intensity chromatograms."""

from __future__ import annotations

import csv
from pathlib import Path


def load_chromatogram_points(path: Path) -> list[tuple[float, float]]:
    """Parse a UTF-8 CSV/TSV/TXT with retention time and intensity columns."""
    if not path.is_file():
        raise FileNotFoundError(path.name)
    text = path.read_text(encoding="utf-8")
    try:
        dialect = csv.Sniffer().sniff(text[:4096], delimiters=",\t; ")
    except csv.Error:
        dialect = csv.excel
    points: list[tuple[float, float]] = []
    for row in csv.reader(text.splitlines(), dialect):
        if len(row) < 2:
            continue
        try:
            retention_time = float(row[0])
            intensity = float(row[1])
        except ValueError:
            continue
        points.append((retention_time, intensity))
    if len(points) < 2:
        raise ValueError("chromatogram file must contain at least two numeric rows")
    return points
