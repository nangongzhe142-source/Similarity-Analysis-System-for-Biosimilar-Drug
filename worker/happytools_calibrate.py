"""Small process boundary around HappyTools' official time calibration class."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--happytools-root", type=Path, required=True)
    parser.add_argument("--anchors-json", required=True)
    args = parser.parse_args()

    root = args.happytools_root.resolve()
    if not (root / "HappyTools" / "bin" / "chromatogram.py").is_file():
        raise FileNotFoundError("HappyTools official package was not found")
    sys.path.insert(0, str(root))
    from HappyTools.bin.chromatogram import Chromatogram

    anchors = json.loads(args.anchors_json)
    if len(anchors) < 3:
        raise ValueError("HappyTools quadratic calibration requires at least three anchors")
    with args.input.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    chromatogram = Chromatogram.__new__(Chromatogram)
    chromatogram.chrom_data = [(float(row["time"]), float(row["signal"])) for row in rows]
    chromatogram.calibration_time_pairs = [(float(item["expected"]), float(item["observed"])) for item in anchors]
    chromatogram.determine_calibration_function()
    chromatogram.calibrate_chromatogram()

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["time", "signal"])
        writer.writeheader()
        writer.writerows({"time": time, "signal": signal} for time, signal in chromatogram.chrom_data)
    args.metadata.write_text(json.dumps({
        "engine": "HappyTools", "source": str(root), "anchorCount": len(anchors),
        "anchors": anchors, "polynomialCoefficients": chromatogram.calibration_function.coefficients.tolist(),
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
