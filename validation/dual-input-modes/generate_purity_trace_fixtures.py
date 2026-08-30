"""Generate deterministic SEC time-signal fixtures for dual-input regression."""

import csv
import math
from pathlib import Path


def write(path: Path, hmw_scale: float) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["time", "signal"])
        writer.writeheader()
        for index in range(601):
            time = index / 60
            signal = (
                hmw_scale * 4 * math.exp(-0.5 * ((time - 3.0) / 0.18) ** 2)
                + 100 * math.exp(-0.5 * ((time - 5.0) / 0.24) ** 2)
                + 3 * math.exp(-0.5 * ((time - 7.0) / 0.20) ** 2)
            )
            writer.writerow({"time": f"{time:.6f}", "signal": f"{signal:.9f}"})


if __name__ == "__main__":
    root = Path(__file__).resolve().parent / "fixtures"
    root.mkdir(parents=True, exist_ok=True)
    write(root / "purity-reference-trace.csv", 1.0)
    write(root / "purity-candidate-trace.csv", 1.25)
