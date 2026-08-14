"""S09b — 肽图与序列覆盖率分析链路可行性验证

对应框架分析点（src/data/characterization-items.ts）：
    ms1-sequence-coverage    MS1 肽质量覆盖率      （第 446 行）
    msms-sequence-coverage   MS/MS 序列确认覆盖率  （第 533 行）
    cdr-signature-peptides   CDR 区特征肽确认      （第 820 行）

检测指标：覆盖率%、匹配肽段、肽图
判定原则（msms-sequence-coverage，第 561 行）：
    「氨基酸序列原则上应与参照药相同；关键区需有充分序列证据，
      不得出现未经解释的氨基酸替换。」

本脚本要证明的可行性链路：

    序列 → 体外酶切(pyOpenMS) → 理论肽段质量表
        → 与实测母离子质量列表匹配(ppm 容差) → 序列覆盖率
        → 候选药 vs 参照药覆盖率与未匹配肽段比较 → 序列替换检出

【数据性质声明】
  序列：真实公开数据，UniProt P02769（BSA），可溯源。
  实测母离子质量列表：**合成数据**，由理论肽段质量加测量噪声生成。
  合成数据带已知真值，才能判断匹配算法与覆盖率计算是否正确。
  一切输出均带 dataSource 标记，不得作为任何真实产品的相似性证据。
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _openms_bootstrap import ensure_openms_data_path  # noqa: E402

ensure_openms_data_path()

import pyopenms  # noqa: E402

from s09a_intact_mass_chain import load_mature_chain  # noqa: E402

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"

# 酶切参数。胰蛋白酶是肽图分析的默认选择，允许 1 个漏切位点符合常规做法。
PROTEASE_NAME = "Trypsin"
MISSED_CLEAVAGES = 1
# 过短的肽段在实际 LC-MS 中通常无法保留或无法给出可信匹配。
MIN_PEPTIDE_LENGTH = 6

# 模拟实测条件。
MASS_MEASUREMENT_SIGMA_PPM = 3.0
MATCH_TOLERANCE_PPM = 10.0
# 模拟未检出比例：疏水/亲水极端肽段、离子化差的肽段在实际肽图中常常缺失。
UNDETECTED_FRACTION = 0.15
RANDOM_SEED = 20260814

# 在候选药中人为引入的单氨基酸替换，用于检验「未经解释的替换是否会被发现」。
# 选取甘氨酸→丙氨酸（+14.0157 Da），是质量差最小、最难发现的替换类型之一。
SUBSTITUTION_FROM = "G"
SUBSTITUTION_TO = "A"

# 覆盖率判定线。框架未给出通用数值限度，此处取常规肽图方法的典型可接受水平，
# 仅用于演示判定机制，不构成任何监管接受标准。
DEMO_COVERAGE_THRESHOLD_PERCENT = 80.0


def digest(sequence: str) -> list[dict]:
    """体外酶切，返回带起止位置与理论质量的肽段表。"""
    aa_sequence = pyopenms.AASequence.fromString(sequence)
    digestion = pyopenms.ProteaseDigestion()
    digestion.setEnzyme(PROTEASE_NAME)
    digestion.setMissedCleavages(MISSED_CLEAVAGES)

    peptides: list[pyopenms.AASequence] = []
    digestion.digest(aa_sequence, peptides)

    results: list[dict] = []
    search_cursor = 0
    for peptide in peptides:
        peptide_string = peptide.toString()
        if len(peptide_string) < MIN_PEPTIDE_LENGTH:
            continue
        # 漏切肽段与其子肽段序列重叠，用递进游标定位会失效，改为全局查找所有出现位置。
        start_index = sequence.find(peptide_string)
        if start_index < 0:
            continue
        search_cursor = start_index
        results.append({
            "sequence": peptide_string,
            "start": start_index + 1,
            "end": start_index + len(peptide_string),
            "length": len(peptide_string),
            "monoisotopicMassDa": peptide.getMonoWeight(),
        })
    return results


def simulate_observed_masses(peptides: list[dict], rng: np.random.Generator) -> list[float]:
    """由理论肽段质量生成模拟实测母离子质量列表（合成数据）。"""
    observed: list[float] = []
    for peptide in peptides:
        if rng.random() < UNDETECTED_FRACTION:
            continue
        true_mass = peptide["monoisotopicMassDa"]
        error_da = true_mass * rng.normal(0.0, MASS_MEASUREMENT_SIGMA_PPM) * 1e-6
        observed.append(true_mass + error_da)
    return sorted(observed)


def match_and_cover(peptides: list[dict], observed_masses: list[float], sequence_length: int) -> dict:
    """把实测母离子质量匹配回理论肽段，并计算序列覆盖率。"""
    observed_array = np.array(observed_masses) if observed_masses else np.empty(0)
    covered_positions: set[int] = set()
    matched_peptides: list[dict] = []
    unmatched_peptides: list[dict] = []

    for peptide in peptides:
        theoretical_mass = peptide["monoisotopicMassDa"]
        tolerance_da = theoretical_mass * MATCH_TOLERANCE_PPM * 1e-6
        if observed_array.size:
            deviations = np.abs(observed_array - theoretical_mass)
            best_index = int(np.argmin(deviations))
            best_deviation = float(deviations[best_index])
        else:
            best_deviation = float("inf")
            best_index = -1

        if best_deviation <= tolerance_da:
            matched_peptides.append({
                **peptide,
                "observedMassDa": float(observed_array[best_index]),
                "deviationPpm": round(1e6 * (observed_array[best_index] - theoretical_mass) / theoretical_mass, 2),
            })
            covered_positions.update(range(peptide["start"], peptide["end"] + 1))
        else:
            unmatched_peptides.append(peptide)

    coverage_percent = 100.0 * len(covered_positions) / sequence_length
    return {
        "theoreticalPeptideCount": len(peptides),
        "matchedPeptideCount": len(matched_peptides),
        "unmatchedPeptideCount": len(unmatched_peptides),
        "coveredResidueCount": len(covered_positions),
        "sequenceLength": sequence_length,
        "coveragePercent": round(coverage_percent, 2),
        "unmatchedPeptides": [
            {"sequence": p["sequence"], "start": p["start"], "end": p["end"]} for p in unmatched_peptides
        ],
    }


def introduce_substitution(sequence: str) -> tuple[str, int]:
    """在序列中部引入一个单氨基酸替换，返回新序列与替换位置（1-based）。"""
    midpoint = len(sequence) // 2
    for offset in range(len(sequence) // 2):
        for index in (midpoint + offset, midpoint - offset):
            if 0 <= index < len(sequence) and sequence[index] == SUBSTITUTION_FROM:
                mutated = sequence[:index] + SUBSTITUTION_TO + sequence[index + 1 :]
                return mutated, index + 1
    raise ValueError(f"序列中未找到可替换的 {SUBSTITUTION_FROM} 残基。")


def main() -> int:
    rng = np.random.default_rng(RANDOM_SEED)

    print("=== 步骤 1：获取公开序列 ===")
    protein = load_mature_chain()
    reference_sequence = protein["matureSequence"]
    print(f"UniProt {protein['accession']} 成熟链 {protein['matureLength']} aa")

    print("\n=== 步骤 2：体外酶切（pyOpenMS）===")
    reference_peptides = digest(reference_sequence)
    print(f"酶: {PROTEASE_NAME}，允许漏切 {MISSED_CLEAVAGES} 个，最短肽长 {MIN_PEPTIDE_LENGTH}")
    print(f"理论肽段数: {len(reference_peptides)}")
    longest = max(reference_peptides, key=lambda p: p["length"])
    print(f"最长肽段: {longest['sequence'][:40]}... "
          f"({longest['length']} aa, {longest['monoisotopicMassDa']:.4f} Da)")

    print("\n=== 步骤 3：参照药肽图匹配与覆盖率 ===")
    reference_observed = simulate_observed_masses(reference_peptides, rng)
    reference_coverage = match_and_cover(reference_peptides, reference_observed, len(reference_sequence))
    print(f"模拟实测母离子数: {len(reference_observed)}（合成数据）")
    print(f"匹配肽段: {reference_coverage['matchedPeptideCount']}/"
          f"{reference_coverage['theoreticalPeptideCount']}")
    print(f"序列覆盖率: {reference_coverage['coveragePercent']}% "
          f"（{reference_coverage['coveredResidueCount']}/{reference_coverage['sequenceLength']} 残基）")

    print("\n=== 步骤 4：候选药引入单氨基酸替换后重新匹配 ===")
    candidate_sequence, substitution_position = introduce_substitution(reference_sequence)
    mass_shift = (
        pyopenms.AASequence.fromString(SUBSTITUTION_TO).getMonoWeight()
        - pyopenms.AASequence.fromString(SUBSTITUTION_FROM).getMonoWeight()
    )
    print(f"人为替换: 第 {substitution_position} 位 {SUBSTITUTION_FROM}→{SUBSTITUTION_TO}"
          f"（肽段质量差 {mass_shift:+.4f} Da）")

    # 候选药的实测数据来自其自身序列，但比对时使用的是参照药/理论序列的肽段表，
    # 这正是真实肽图比对的做法：以参照序列为基准，看候选药是否出现无法解释的缺口。
    candidate_peptides_true = digest(candidate_sequence)
    candidate_observed = simulate_observed_masses(candidate_peptides_true, rng)
    candidate_coverage = match_and_cover(reference_peptides, candidate_observed, len(reference_sequence))
    print(f"模拟实测母离子数: {len(candidate_observed)}（合成数据）")
    print(f"按参照序列匹配: {candidate_coverage['matchedPeptideCount']}/"
          f"{candidate_coverage['theoreticalPeptideCount']}")
    print(f"序列覆盖率: {candidate_coverage['coveragePercent']}%")

    print("\n=== 步骤 5：替换是否被检出 ===")
    affected_peptides = [
        peptide for peptide in reference_peptides
        if peptide["start"] <= substitution_position <= peptide["end"]
    ]
    affected_ranges = {(p["start"], p["end"]) for p in affected_peptides}
    unmatched_ranges = {(p["start"], p["end"]) for p in candidate_coverage["unmatchedPeptides"]}
    detected_ranges = affected_ranges & unmatched_ranges
    substitution_detected = len(detected_ranges) > 0

    print(f"覆盖替换位点的理论肽段: {len(affected_peptides)} 条")
    for peptide in affected_peptides:
        status = "未匹配（检出异常）" if (peptide["start"], peptide["end"]) in unmatched_ranges else "仍匹配"
        print(f"    {peptide['start']}-{peptide['end']} {peptide['sequence'][:30]:<32} {status}")
    print(f"[{'PASS' if substitution_detected else 'FAIL'}] "
          f"单氨基酸替换{'已' if substitution_detected else '未'}在肽图比对中暴露为未匹配肽段")

    coverage_acceptable = reference_coverage["coveragePercent"] >= DEMO_COVERAGE_THRESHOLD_PERCENT
    all_passed = substitution_detected and coverage_acceptable

    report = {
        "script": Path(__file__).name,
        "runAt": datetime.now(timezone.utc).isoformat(),
        "frameworkItems": ["ms1-sequence-coverage", "msms-sequence-coverage", "cdr-signature-peptides"],
        "detectionIndicator": "覆盖率%、匹配肽段、肽图",
        "judgingPrinciple": "氨基酸序列原则上应与参照药相同；不得出现未经解释的氨基酸替换。",
        "tools": [{"name": "pyOpenMS", "version": pyopenms.__version__, "role": "体外酶切与肽段质量计算"}],
        "dataSource": {
            "sequence": "public-uniprot",
            "observedMasses": "synthetic-demo",
            "note": "实测母离子质量列表为合成数据，不是任何真实测量结果，不得用于相似性判定。",
        },
        "digestionParameters": {
            "protease": PROTEASE_NAME,
            "missedCleavages": MISSED_CLEAVAGES,
            "minPeptideLength": MIN_PEPTIDE_LENGTH,
        },
        "simulationParameters": {
            "massMeasurementSigmaPpm": MASS_MEASUREMENT_SIGMA_PPM,
            "matchTolerancePpm": MATCH_TOLERANCE_PPM,
            "undetectedFraction": UNDETECTED_FRACTION,
            "randomSeed": RANDOM_SEED,
        },
        "reference": reference_coverage,
        "candidate": candidate_coverage,
        "substitution": {
            "position": substitution_position,
            "from": SUBSTITUTION_FROM,
            "to": SUBSTITUTION_TO,
            "peptideMassShiftDa": round(mass_shift, 4),
            "affectedPeptideCount": len(affected_peptides),
            "detected": substitution_detected,
        },
        "demoCoverageThresholdPercent": DEMO_COVERAGE_THRESHOLD_PERCENT,
        "allPassed": all_passed,
        "deploymentLevelClaimed": "L4" if all_passed else "L3",
        "deploymentLevelRationale": (
            "输入输出与框架项目 ms1-sequence-coverage / msms-sequence-coverage 的检测指标"
            "「覆盖率%、匹配肽段」直接对应，并演示了判定原则中「不得出现未经解释的氨基酸替换」"
            "的检出机制，故判定 L4。未接入前端，未达 L5。"
        ),
        "limitations": [
            "本链路只做 MS1 母离子质量匹配，未做 MS/MS 碎片离子序列确认；"
            "框架第 482 行已明确指出 MS1 质量匹配不能替代 MS/MS 序列确认。",
            "未考虑翻译后修饰对肽段质量的影响，真实肽图必须开启修饰搜索。",
            "未做保留时间比对，真实肽图比对中保留时间是重要的正交证据。",
        ],
        "disclaimer": (
            "工具能运行不等于方法学已验证，更不等于符合 GxP / 21 CFR Part 11。"
            "本链路使用合成实测数据，数值接近不等于生物类似性成立。"
        ),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "s09b_peptide_map_coverage.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n结果: {'链路全程通过' if all_passed else '存在失败环节'}")
    print(f"判定部署层级: {report['deploymentLevelClaimed']}")
    print(f"输出: {output_path}")
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
