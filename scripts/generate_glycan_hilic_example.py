"""Generate deterministic, non-clinical HILIC-FLD example traces."""

from __future__ import annotations

import csv
import math
from pathlib import Path


PEAKS = {
    "reference": [(16.0, 8.0, 0.23), (20.0, 13.0, 0.20), (22.0, 62.0, 0.22), (24.5, 28.0, 0.25), (27.5, 12.0, 0.27)],
    "candidate": [(16.0, 8.5, 0.23), (20.0, 14.5, 0.20), (22.0, 58.0, 0.22), (24.5, 30.0, 0.25), (27.5, 12.5, 0.27)],
}


def signal_at(time: float, peaks: list[tuple[float, float, float]]) -> float:
    baseline = 0.25 + 0.008 * time + 0.025 * math.sin(time * 1.3)
    return baseline + sum(height * math.exp(-0.5 * ((time - center) / width) ** 2) for center, height, width in peaks)


def main() -> None:
    target = Path(__file__).resolve().parents[1] / "validation" / "glycan-hilic-fld"
    target.mkdir(parents=True, exist_ok=True)
    for cohort, peaks in PEAKS.items():
        path = target / f"{cohort}-hilic-fld.csv"
        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=["time", "signal"])
            writer.writeheader()
            for index in range(1601):
                time = index * 0.02
                writer.writerow({"time": f"{time:.2f}", "signal": f"{signal_at(time, peaks):.8f}"})
    print(target)


if __name__ == "__main__":
    main()
