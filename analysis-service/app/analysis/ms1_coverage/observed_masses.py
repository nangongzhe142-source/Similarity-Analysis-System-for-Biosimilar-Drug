# -*- coding: utf-8 -*-
"""Load observed precursor-mass lists from uploaded text/CSV files."""

from __future__ import annotations

from pathlib import Path

import numpy as np


def load_observed_masses(path: Path) -> list[float]:
    """Read a one- or two-column mass list from txt/csv/tsv."""
    suffix = path.suffix.lower()
    delimiter = "," if suffix == ".csv" else None
    data = np.loadtxt(path, dtype=float, delimiter=delimiter)
    if data.ndim == 0:
        return [float(data)]
    if data.ndim == 1:
        return sorted(float(value) for value in data)
    if data.ndim == 2 and data.shape[1] >= 1:
        column = 1 if data.shape[1] >= 2 else 0
        return sorted(float(value) for value in data[:, column])
    raise ValueError("observed mass file must contain one numeric column or m/z,mass pairs")
