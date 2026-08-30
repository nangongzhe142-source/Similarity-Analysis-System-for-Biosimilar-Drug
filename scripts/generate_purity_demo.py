"""Generate deterministic, nonclinical SEC and CE-SDS traces for toolchain tests."""

from __future__ import annotations

import csv
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "validation" / "purity-chromatography-example"


def write_trace(name: str, peaks: list[tuple[float, float, float]]) -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    with (ROOT / name).open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["time", "signal"])
        writer.writeheader()
        for index in range(1001):
            time = index * 0.02
            signal = 0.002 + sum(height * math.exp(-0.5 * ((time - center) / width) ** 2) for center, height, width in peaks)
            writer.writerow({"time": f"{time:.4f}", "signal": f"{signal:.8f}"})


write_trace("reference-sec.csv", [(7.5, 4.5, 0.18), (10.0, 100, 0.28), (13.0, 2.5, 0.20)])
write_trace("candidate-sec.csv", [(7.5, 8.0, 0.18), (10.0, 96, 0.28), (13.0, 3.0, 0.20), (14.2, 0.8, 0.15)])
write_trace("reference-reduced-ce.csv", [(3.0, 1.0, 0.16), (5.0, 44, 0.22), (7.0, 2.0, 0.18), (9.0, 54, 0.24)])
write_trace("candidate-reduced-ce.csv", [(3.0, 1.6, 0.16), (5.0, 42, 0.22), (7.0, 3.5, 0.18), (9.0, 52, 0.24), (12.0, 1.2, 0.18)])
write_trace("reference-nonreduced-ce.csv", [(5.0, 2.0, 0.18), (9.0, 95, 0.28), (13.0, 1.5, 0.18)])
write_trace("candidate-nonreduced-ce.csv", [(5.0, 3.0, 0.18), (9.0, 91, 0.28), (13.0, 2.0, 0.18), (14.5, 1.0, 0.16)])
