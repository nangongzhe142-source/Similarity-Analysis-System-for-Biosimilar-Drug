"""S08 — pyOpenMS 官方文档示例复现（部署层级 L2 判定用）

目的：证明 pyOpenMS 不仅装得上，而且能跑出与官方文档一致的输出。
仅仅「命令没报错」不算 L2，必须有可对照的预期值。

预期值来源：pyOpenMS 官方用户指南 "Peptides and Proteins" 与 "Digestion" 章节
  https://pyopenms.readthedocs.io/en/latest/user_guide/peptides_proteins.html
  https://pyopenms.readthedocs.io/en/latest/user_guide/digestion.html

判定规则：所有断言通过 → L2 成立；任一断言失败 → 记录失败原文，不得记为 L2。
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _openms_bootstrap import ensure_openms_data_path  # noqa: E402

OPENMS_SHARE_PATH = ensure_openms_data_path()

import pyopenms  # noqa: E402  必须在设置 OPENMS_DATA_PATH 之后导入

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"

# 官方文档 "Peptides and Proteins" 章节使用的示例肽段。
DOC_EXAMPLE_PEPTIDE = "DFPIANGER"
# 文档中给出的分子式与单同位素质量（Da）。
EXPECTED_FORMULA = "C44H67N13O15"
EXPECTED_MONO_WEIGHT = 1017.4879641373
# 质量比对容差：单同位素质量属于精确计算量，容差取 1e-6 Da 已远严于仪器精度。
MASS_TOLERANCE_DA = 1e-6


def check(label: str, actual: object, expected: object, passed: bool) -> dict:
    """记录一条断言结果。失败不抛异常，以便一次运行看到全部失败项。"""
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {label}\n        actual  = {actual!r}\n        expected= {expected!r}")
    return {"label": label, "actual": str(actual), "expected": str(expected), "passed": passed}


def main() -> int:
    results: list[dict] = []

    print(f"pyopenms {pyopenms.__version__} / OpenMS core {pyopenms.VersionInfo.getVersion()}")
    print(f"OPENMS_DATA_PATH: {OPENMS_SHARE_PATH}")
    print(f"官方示例肽段: {DOC_EXAMPLE_PEPTIDE}\n")

    sequence = pyopenms.AASequence.fromString(DOC_EXAMPLE_PEPTIDE)

    # --- 断言 1：序列往返解析一致 ---
    round_tripped = sequence.toString()
    results.append(
        check("AASequence 往返解析", round_tripped, DOC_EXAMPLE_PEPTIDE, round_tripped == DOC_EXAMPLE_PEPTIDE)
    )

    # --- 断言 2：分子式与文档一致 ---
    formula = sequence.getFormula().toString()
    results.append(check("分子式", formula, EXPECTED_FORMULA, formula == EXPECTED_FORMULA))

    # --- 断言 3：单同位素质量与文档一致 ---
    mono_weight = sequence.getMonoWeight()
    mass_ok = abs(mono_weight - EXPECTED_MONO_WEIGHT) < MASS_TOLERANCE_DA
    results.append(
        check(f"单同位素质量（容差 {MASS_TOLERANCE_DA} Da）", mono_weight, EXPECTED_MONO_WEIGHT, mass_ok)
    )

    # --- 断言 4：残基数正确 ---
    residue_count = sequence.size()
    results.append(
        check("残基数", residue_count, len(DOC_EXAMPLE_PEPTIDE), residue_count == len(DOC_EXAMPLE_PEPTIDE))
    )

    # --- 断言 5：胰蛋白酶体外酶切能切出已知位点 ---
    # 官方 Digestion 章节示例：胰蛋白酶在 K/R 后切开（P 前不切）。
    digest_input = pyopenms.AASequence.fromString("DFPIANGERDFPIANGERKDFPIANGER")
    digestion = pyopenms.ProteaseDigestion()
    digestion.setEnzyme("Trypsin")
    peptides: list[pyopenms.AASequence] = []
    digestion.digest(digest_input, peptides)
    peptide_strings = [peptide.toString() for peptide in peptides]
    expected_peptides = ["DFPIANGER", "DFPIANGER", "K", "DFPIANGER"]
    results.append(
        check("胰蛋白酶酶切产物", peptide_strings, expected_peptides, peptide_strings == expected_peptides)
    )

    # --- 断言 6：理论碎片谱可生成且非空（对应项目 7 MS/MS 序列确认） ---
    spectrum = pyopenms.MSSpectrum()
    generator = pyopenms.TheoreticalSpectrumGenerator()
    generator.getSpectrum(spectrum, sequence, 1, 1)
    peak_count = spectrum.size()
    # TheoreticalSpectrumGenerator 默认 add_b_ions / add_y_ions 为真，
    # 但 add_first_prefix_ion 默认为假，即不生成 b1。
    # 9 个残基 → y1..y8 共 8 个，b2..b8 共 7 个，合计 15 个。
    residue_number = len(DOC_EXAMPLE_PEPTIDE)
    expected_peak_count = (residue_number - 1) + (residue_number - 2)
    results.append(
        check("理论 b/y 碎片离子数", peak_count, expected_peak_count, peak_count == expected_peak_count)
    )

    all_passed = all(item["passed"] for item in results)

    report = {
        "script": Path(__file__).name,
        "runAt": datetime.now(timezone.utc).isoformat(),
        "tool": {"name": "pyOpenMS", "version": pyopenms.__version__, "openmsCore": pyopenms.VersionInfo.getVersion()},
        "dataSource": "official-documentation-example",
        "checks": results,
        "allPassed": all_passed,
        "deploymentLevelClaimed": "L2" if all_passed else "L1",
        "disclaimer": "工具能运行不等于方法学已验证，更不等于符合 GxP。本输出不可用于任何相似性判定。",
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "s08_pyopenms_official_example.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n结果: {'全部通过' if all_passed else '存在失败项'}")
    print(f"判定部署层级: {report['deploymentLevelClaimed']}")
    print(f"输出: {output_path}")
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
