"""S08b — UniDec 官方测试谱运行记录（部署层级判定用）

目的：记录 UniDec 的贝叶斯去卷积内核在本机对官方自带测试谱的实际运行情况。

输入数据来源：UniDec 官方 pip 包自带的测试谱
    site-packages/unidec/bin/TestSpectra/test_1.txt
    site-packages/unidec/bin/TestSpectra/test_2.txt

【关于部署层级的重要说明】
本脚本**不**声称达到 L2。理由如下，如实记录：

  L2 的定义是「官方示例数据跑通，得到与文档一致的输出」。
  UniDec 的 pip 包虽然自带测试谱，但**未随包提供任何权威的预期去卷积结果**。
  包内 `test_2.txt.out` 曾被本调研误当作参照输出，实际检查后确认它是一张
  包含 221 个不同质量、跨度 546～10269 Da 的峰匹配表（多数质量仅出现 1 次），
  并非该谱图的预期去卷积质量清单，不能作为正确性判据。
  详见 evidence/run_s08b_fail_reference.log。

  因此本脚本仅记录「引擎可执行」这一事实（拟合优度 R²、峰数、耗时），
  证据强度等同于 L1 之上、L2 未达。
  真正带已知真值的正确性验证放在 s09a（合成电荷态包络，真值由理论质量给定）。
"""

from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tempfile
import time
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"
ASCII_WORK_DIR = Path(tempfile.gettempdir()) / "unidec-poc-work"
TEST_SPECTRA = ["test_1.txt", "test_2.txt"]


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run_one(spectrum_name: str, package_dir: Path) -> dict:
    from unidec.engine import UniDec

    source_spectrum = package_dir / "bin" / "TestSpectra" / spectrum_name
    if not source_spectrum.is_file():
        return {"spectrum": spectrum_name, "status": "MISSING", "path": str(source_spectrum)}

    ASCII_WORK_DIR.mkdir(parents=True, exist_ok=True)
    work_spectrum = ASCII_WORK_DIR / spectrum_name
    shutil.copy2(source_spectrum, work_spectrum)

    data_point_count = len(source_spectrum.read_text().splitlines())
    print(f"\n--- {spectrum_name} ---")
    print(f"来源: {source_spectrum}")
    print(f"sha256: {sha256_of(source_spectrum)}")
    print(f"数据点: {data_point_count}")

    started = time.perf_counter()
    engine = UniDec()
    engine.open_file(work_spectrum.name, str(ASCII_WORK_DIR))
    engine.process_data()
    engine.run_unidec(silent=True)
    engine.pick_peaks()
    elapsed_seconds = time.perf_counter() - started

    # UniDec 8.2.1 把去卷积拟合优度存在 config.error 字段（命名与含义不一致，
    # 实际是引擎日志中打印的 "R Squared"）。
    r_squared = float(engine.config.error)
    peaks = sorted(engine.pks.peaks, key=lambda peak: float(peak.mass))
    masses = [float(peak.mass) for peak in peaks]
    heights = [float(peak.height) for peak in peaks]
    max_height = max(heights) if heights else 0.0

    print(f"耗时: {elapsed_seconds:.2f} s")
    print(f"拟合优度 R²: {r_squared:.6f}")
    print(f"检出质量峰: {len(masses)} 个")
    for mass, height in zip(masses, heights):
        relative = 100.0 * height / max_height if max_height else 0.0
        print(f"    {mass:12.2f} Da   相对强度 {relative:6.2f}%")

    return {
        "spectrum": spectrum_name,
        "status": "RAN",
        "sourcePath": str(source_spectrum),
        "sha256": sha256_of(source_spectrum),
        "dataPointCount": data_point_count,
        "elapsedSeconds": round(elapsed_seconds, 3),
        "rSquared": r_squared,
        "peakCount": len(masses),
        "deconvolvedMasses": masses,
        "relativeHeightsPercent": [
            round(100.0 * height / max_height, 2) if max_height else 0.0 for height in heights
        ],
    }


def main() -> int:
    import unidec

    package_dir = Path(unidec.__file__).resolve().parent
    print(f"UniDec {version('unidec')}")
    print(f"包目录: {package_dir}")
    print(f"ASCII 工作目录: {ASCII_WORK_DIR}")

    runs = [run_one(name, package_dir) for name in TEST_SPECTRA]
    all_ran = all(run["status"] == "RAN" for run in runs)

    report = {
        "script": Path(__file__).name,
        "runAt": datetime.now(timezone.utc).isoformat(),
        "tool": {"name": "UniDec", "version": version("unidec")},
        "dataSource": "official-package-test-spectra",
        "runs": runs,
        "allRan": all_ran,
        "deploymentLevelClaimed": "L1+",
        "deploymentLevelRationale": (
            "引擎在官方测试谱上可执行并给出拟合优度，但 UniDec 未随包提供权威的预期"
            "去卷积结果，无法据此判定输出正确性，因此不声称 L2。"
            "带已知真值的正确性验证见 s09a。"
        ),
        "disclaimer": "工具能运行不等于方法学已验证，更不等于符合 GxP。本输出不可用于任何相似性判定。",
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "s08b_unidec_official_example.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n判定部署层级: {report['deploymentLevelClaimed']}（理由见输出 JSON）")
    print(f"输出: {output_path}")
    return 0 if all_ran else 1


if __name__ == "__main__":
    sys.exit(main())
