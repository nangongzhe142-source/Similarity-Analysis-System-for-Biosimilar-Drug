"""S09a — 完整分子质量分析链路可行性验证

对应框架分析点（src/data/characterization-items.ts）：
    intact-mass                          完整分子质量        （第 11 行）
    deglycosylated-intact-mass           脱糖完整分子质量    （第 98 行）
    light-chain-mass                     轻链分子质量        （第 185 行）
    non-deglycosylated-heavy-chain-mass  未脱糖重链分子质量  （第 272 行）
    deglycosylated-heavy-chain-mass      脱糖重链分子质量    （第 359 行）

这 5 个项目的检测指标同为「去卷积完整质量（Da）」，
相似性评价方法同为「定性/图谱 ＋ 理论质量核对」，
判定原则同为「主要分子形式应对应，差异可由已知糖型或翻译后修饰解释，
不应出现无法解释的新分子形式」。

本脚本要证明的可行性链路：

    公开序列 → 理论质量计算(pyOpenMS) → 电荷态包络谱 → 去卷积(UniDec)
        → 回收质量 vs 理论质量偏差(Da/ppm) → 头对头质量差异归因

【数据性质声明】
  序列：真实公开数据，来自 UniProt P02769（牛血清白蛋白 BSA），可溯源。
  谱图：**合成数据**，由理论质量正演生成，不是任何真实测量结果。
        选择合成谱是因为它带已知真值，可以判断去卷积结果对不对；
        真实测量数据无法提供这种真值。
  一切输出均带 dataSource 标记，不得作为任何真实产品的相似性证据。

【为什么用 BSA 而不是治疗性抗体】
  BSA 是二硫键与游离巯基分析的经典模型蛋白（35 个半胱氨酸，17 对二硫键 + 1 个游离巯基），
  序列公开可溯源，且与本大类的项目 10、11 直接相关。
  本脚本只验证计算链路是否走得通，不涉及任何具体在研产品。
"""

from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tempfile
import time
import urllib.request
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _openms_bootstrap import ensure_openms_data_path  # noqa: E402

ensure_openms_data_path()

import pyopenms  # noqa: E402

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "output"
ASCII_WORK_DIR = Path(tempfile.gettempdir()) / "unidec-poc-work"

UNIPROT_ACCESSION = "P02769"
UNIPROT_FASTA_URL = f"https://rest.uniprot.org/uniprotkb/{UNIPROT_ACCESSION}.fasta"
UNIPROT_JSON_URL = f"https://rest.uniprot.org/uniprotkb/{UNIPROT_ACCESSION}.json"

# 每形成一对二硫键失去 2 个氢原子。
HYDROGEN_AVERAGE_MASS = 1.00794
HYDROGEN_LOST_PER_DISULFIDE = 2
PROTON_MASS = 1.007276467

# 合成谱参数。电荷态窗口按变性 ESI 下 ~66 kDa 蛋白的常见范围选取。
CHARGE_MIN = 30
CHARGE_MAX = 60
CHARGE_CENTER = 45
CHARGE_ENVELOPE_WIDTH = 7.0
MZ_GRID_MIN = 900.0
MZ_GRID_MAX = 2600.0
MZ_GRID_POINTS = 20000
PEAK_SIGMA_MZ = 0.8
BASELINE_NOISE_FRACTION = 0.002
RANDOM_SEED = 20260814

# 模拟的「候选药 vs 参照药」质量差异：一个己糖残基（+162.0528 Da），
# 属于框架判定原则中「可由已知糖型解释」的差异类型。
HEXOSE_MASS_SHIFT_DA = 162.0528

# 去卷积质量搜索窗口与分辨率。
MASS_SEARCH_LOWER_DA = 60000.0
MASS_SEARCH_UPPER_DA = 75000.0
MASS_BIN_DA = 1.0

# 判定容差。去卷积质量分辨率为 MASS_BIN_DA，取其 5 倍作为可接受的回收偏差，
# 对 66 kDa 蛋白相当于约 75 ppm，宽于高分辨仪器实际能力，属于宽松判定线。
MASS_RECOVERY_TOLERANCE_DA = 5 * MASS_BIN_DA


def sha256_of_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def fetch_with_cache(url: str, cache_path: Path) -> bytes:
    """下载并缓存公开数据，避免每次运行都联网，同时保证可溯源。"""
    if cache_path.is_file():
        return cache_path.read_bytes()
    with urllib.request.urlopen(url, timeout=60) as response:
        payload = response.read()
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_bytes(payload)
    return payload


def load_mature_chain() -> dict:
    """取 UniProt 记录中的成熟链序列与二硫键数量，全部来自公开数据库，可溯源。"""
    fasta_bytes = fetch_with_cache(UNIPROT_FASTA_URL, DATA_DIR / f"{UNIPROT_ACCESSION}.fasta")
    json_bytes = fetch_with_cache(UNIPROT_JSON_URL, DATA_DIR / f"{UNIPROT_ACCESSION}.json")

    fasta_lines = fasta_bytes.decode().splitlines()
    full_sequence = "".join(line for line in fasta_lines[1:] if line)

    record = json.loads(json_bytes.decode())
    features = record.get("features", [])

    chain_features = [f for f in features if f.get("type") == "Chain"]
    if not chain_features:
        raise ValueError("UniProt 记录中未找到 Chain 特征，无法确定成熟链范围。")
    chain = chain_features[0]
    chain_start = int(chain["location"]["start"]["value"])
    chain_end = int(chain["location"]["end"]["value"])
    mature_sequence = full_sequence[chain_start - 1 : chain_end]

    disulfide_count = sum(1 for f in features if f.get("type") == "Disulfide bond")

    return {
        "accession": UNIPROT_ACCESSION,
        "header": fasta_lines[0],
        "fastaSha256": sha256_of_bytes(fasta_bytes),
        "jsonSha256": sha256_of_bytes(json_bytes),
        "fullSequenceLength": len(full_sequence),
        "chainDescription": chain.get("description", ""),
        "chainStart": chain_start,
        "chainEnd": chain_end,
        "matureSequence": mature_sequence,
        "matureLength": len(mature_sequence),
        "cysteineCount": mature_sequence.count("C"),
        "annotatedDisulfideCount": disulfide_count,
    }


def compute_theoretical_masses(sequence: str, disulfide_count: int) -> dict:
    """用 pyOpenMS 计算理论质量。这是框架中「理论质量核对」的计算侧。"""
    aa_sequence = pyopenms.AASequence.fromString(sequence)
    reduced_average = aa_sequence.getAverageWeight()
    reduced_monoisotopic = aa_sequence.getMonoWeight()
    disulfide_mass_loss = disulfide_count * HYDROGEN_LOST_PER_DISULFIDE * HYDROGEN_AVERAGE_MASS
    return {
        "reducedAverageMassDa": reduced_average,
        "reducedMonoisotopicMassDa": reduced_monoisotopic,
        "disulfideCount": disulfide_count,
        "disulfideMassLossDa": disulfide_mass_loss,
        "oxidizedAverageMassDa": reduced_average - disulfide_mass_loss,
    }


def synthesize_charge_envelope(neutral_mass: float, rng: np.random.Generator) -> np.ndarray:
    """由中性质量正演生成电荷态包络谱（m/z, intensity）。

    这是合成数据。真实工作流中此处应替换为仪器导出的 mzML/RAW 转换结果。
    """
    mz_grid = np.linspace(MZ_GRID_MIN, MZ_GRID_MAX, MZ_GRID_POINTS)
    intensity = np.zeros_like(mz_grid)

    for charge in range(CHARGE_MIN, CHARGE_MAX + 1):
        mz = (neutral_mass + charge * PROTON_MASS) / charge
        if not (MZ_GRID_MIN <= mz <= MZ_GRID_MAX):
            continue
        envelope_weight = np.exp(-0.5 * ((charge - CHARGE_CENTER) / CHARGE_ENVELOPE_WIDTH) ** 2)
        intensity += envelope_weight * np.exp(-0.5 * ((mz_grid - mz) / PEAK_SIGMA_MZ) ** 2)

    peak_max = intensity.max()
    intensity += rng.normal(0.0, BASELINE_NOISE_FRACTION * peak_max, size=intensity.shape)
    intensity = np.clip(intensity, 0.0, None)
    return np.column_stack([mz_grid, intensity])


def deconvolve(spectrum: np.ndarray, label: str) -> dict:
    """调用 UniDec 对合成谱做电荷态去卷积。"""
    from unidec.engine import UniDec

    ASCII_WORK_DIR.mkdir(parents=True, exist_ok=True)
    spectrum_path = ASCII_WORK_DIR / f"{label}.txt"
    np.savetxt(spectrum_path, spectrum, fmt="%.6f")

    started = time.perf_counter()
    engine = UniDec()
    engine.open_file(spectrum_path.name, str(ASCII_WORK_DIR))
    engine.config.masslb = MASS_SEARCH_LOWER_DA
    engine.config.massub = MASS_SEARCH_UPPER_DA
    engine.config.massbins = MASS_BIN_DA
    engine.config.startz = CHARGE_MIN
    engine.config.endz = CHARGE_MAX
    engine.process_data()
    engine.run_unidec(silent=True)
    engine.pick_peaks()
    elapsed_seconds = time.perf_counter() - started

    peaks = sorted(engine.pks.peaks, key=lambda peak: float(peak.height), reverse=True)
    if not peaks:
        return {"label": label, "status": "NO_PEAKS", "elapsedSeconds": round(elapsed_seconds, 3)}

    return {
        "label": label,
        "status": "OK",
        "spectrumPath": str(spectrum_path),
        "spectrumSha256": sha256_of_bytes(spectrum_path.read_bytes()),
        "rSquared": float(engine.config.error),
        "elapsedSeconds": round(elapsed_seconds, 3),
        "basePeakMassDa": float(peaks[0].mass),
        "allPeakMassesDa": sorted(float(peak.mass) for peak in peaks),
        "peakCount": len(peaks),
    }


def main() -> int:
    rng = np.random.default_rng(RANDOM_SEED)

    print("=== 步骤 1：获取公开序列（真实数据，可溯源）===")
    protein = load_mature_chain()
    print(f"UniProt: {protein['header']}")
    print(f"全长: {protein['fullSequenceLength']} aa")
    print(f"成熟链: {protein['chainDescription']} 残基 {protein['chainStart']}-{protein['chainEnd']}"
          f"（{protein['matureLength']} aa）")
    print(f"半胱氨酸数: {protein['cysteineCount']}，注释二硫键数: {protein['annotatedDisulfideCount']}")
    free_cysteine_count = protein["cysteineCount"] - 2 * protein["annotatedDisulfideCount"]
    print(f"推算游离半胱氨酸数: {free_cysteine_count}（对应框架项目 free-thiol）")

    print("\n=== 步骤 2：计算理论质量（pyOpenMS）===")
    theoretical = compute_theoretical_masses(protein["matureSequence"], protein["annotatedDisulfideCount"])
    print(f"全还原态平均质量:   {theoretical['reducedAverageMassDa']:.2f} Da")
    print(f"二硫键失氢:         -{theoretical['disulfideMassLossDa']:.2f} Da"
          f"（{theoretical['disulfideCount']} 对 × 2H）")
    print(f"氧化态理论质量:     {theoretical['oxidizedAverageMassDa']:.2f} Da  ← 用作真值")

    truth_mass = theoretical["oxidizedAverageMassDa"]

    print("\n=== 步骤 3：正演合成电荷态包络谱（合成数据）===")
    reference_spectrum = synthesize_charge_envelope(truth_mass, rng)
    candidate_mass = truth_mass + HEXOSE_MASS_SHIFT_DA
    candidate_spectrum = synthesize_charge_envelope(candidate_mass, rng)
    print(f"参照药模拟谱: 真值 {truth_mass:.2f} Da，{len(reference_spectrum)} 个数据点，"
          f"电荷态 {CHARGE_MIN}+~{CHARGE_MAX}+")
    print(f"候选药模拟谱: 真值 {candidate_mass:.2f} Da"
          f"（人为引入 +{HEXOSE_MASS_SHIFT_DA} Da 己糖差异）")

    print("\n=== 步骤 4：去卷积（UniDec）===")
    reference_result = deconvolve(reference_spectrum, "poc_reference")
    candidate_result = deconvolve(candidate_spectrum, "poc_candidate")
    for result in (reference_result, candidate_result):
        if result["status"] != "OK":
            print(f"[FAIL] {result['label']} 未检出质量峰")
            return 1
        print(f"{result['label']}: 主峰 {result['basePeakMassDa']:.2f} Da，"
              f"R²={result['rSquared']:.6f}，耗时 {result['elapsedSeconds']:.2f}s，"
              f"共 {result['peakCount']} 个峰")

    print("\n=== 步骤 5：回收质量 vs 理论质量（对应「理论质量核对」）===")
    checks = []
    for result, truth in ((reference_result, truth_mass), (candidate_result, candidate_mass)):
        recovered = result["basePeakMassDa"]
        deviation_da = recovered - truth
        deviation_ppm = 1e6 * deviation_da / truth
        passed = abs(deviation_da) <= MASS_RECOVERY_TOLERANCE_DA
        flag = "PASS" if passed else "FAIL"
        print(f"  [{flag}] {result['label']}: 真值 {truth:.2f} Da，回收 {recovered:.2f} Da，"
              f"偏差 {deviation_da:+.2f} Da（{deviation_ppm:+.1f} ppm），"
              f"容差 ±{MASS_RECOVERY_TOLERANCE_DA} Da")
        checks.append({
            "label": result["label"],
            "truthMassDa": truth,
            "recoveredMassDa": recovered,
            "deviationDa": round(deviation_da, 4),
            "deviationPpm": round(deviation_ppm, 2),
            "passed": passed,
        })

    print("\n=== 步骤 6：头对头质量差异归因（对应判定原则）===")
    observed_shift = candidate_result["basePeakMassDa"] - reference_result["basePeakMassDa"]
    shift_error = observed_shift - HEXOSE_MASS_SHIFT_DA
    shift_resolved = abs(shift_error) <= MASS_RECOVERY_TOLERANCE_DA
    print(f"  候选药 − 参照药 实测质量差: {observed_shift:+.2f} Da")
    print(f"  人为引入的真实差异:         {HEXOSE_MASS_SHIFT_DA:+.2f} Da（己糖）")
    print(f"  差异还原误差:               {shift_error:+.2f} Da")
    print(f"  [{'PASS' if shift_resolved else 'FAIL'}] 该质量差可归因为已知糖型差异，"
          f"属于判定原则中「可解释的差异」")

    all_passed = all(item["passed"] for item in checks) and shift_resolved

    report = {
        "script": Path(__file__).name,
        "runAt": datetime.now(timezone.utc).isoformat(),
        "frameworkItems": [
            "intact-mass",
            "deglycosylated-intact-mass",
            "light-chain-mass",
            "non-deglycosylated-heavy-chain-mass",
            "deglycosylated-heavy-chain-mass",
        ],
        "detectionIndicator": "去卷积完整质量（Da）、主要质量峰、峰型",
        "similarityMethod": "定性/图谱 ＋ 理论质量核对",
        "tools": [
            {"name": "pyOpenMS", "version": pyopenms.__version__, "role": "理论质量计算"},
            {"name": "UniDec", "version": version("unidec"), "role": "电荷态去卷积"},
        ],
        "dataSource": {
            "sequence": "public-uniprot",
            "spectra": "synthetic-demo",
            "note": "谱图为由理论质量正演生成的合成数据，不是任何真实测量结果，不得用于相似性判定。",
        },
        "protein": {key: value for key, value in protein.items() if key != "matureSequence"},
        "derivedFreeCysteineCount": free_cysteine_count,
        "theoreticalMasses": theoretical,
        "syntheticSpectrumParameters": {
            "chargeRange": [CHARGE_MIN, CHARGE_MAX],
            "chargeCenter": CHARGE_CENTER,
            "mzRange": [MZ_GRID_MIN, MZ_GRID_MAX],
            "gridPoints": MZ_GRID_POINTS,
            "peakSigmaMz": PEAK_SIGMA_MZ,
            "baselineNoiseFraction": BASELINE_NOISE_FRACTION,
            "randomSeed": RANDOM_SEED,
        },
        "deconvolution": {
            "massSearchRangeDa": [MASS_SEARCH_LOWER_DA, MASS_SEARCH_UPPER_DA],
            "massBinDa": MASS_BIN_DA,
            "reference": reference_result,
            "candidate": candidate_result,
        },
        "massRecoveryChecks": checks,
        "headToHeadShift": {
            "observedShiftDa": round(observed_shift, 4),
            "introducedShiftDa": HEXOSE_MASS_SHIFT_DA,
            "shiftErrorDa": round(shift_error, 4),
            "attributableToKnownGlycoform": shift_resolved,
        },
        "toleranceDa": MASS_RECOVERY_TOLERANCE_DA,
        "allPassed": all_passed,
        "deploymentLevelClaimed": "L4" if all_passed else "L3",
        "deploymentLevelRationale": (
            "输入输出与框架项目 intact-mass 的检测指标「去卷积完整质量（Da）」直接对应，"
            "并完成了该项目相似性评价方法要求的「理论质量核对」，故判定 L4。"
            "尚未转为前端可消费的组件数据，未达 L5。"
        ),
        "disclaimer": (
            "工具能运行不等于方法学已验证，更不等于符合 GxP / 21 CFR Part 11。"
            "本链路使用合成谱图，数值接近不等于生物类似性成立。"
        ),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "s09a_intact_mass_chain.json"
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n结果: {'链路全程通过' if all_passed else '存在失败环节'}")
    print(f"判定部署层级: {report['deploymentLevelClaimed']}")
    print(f"输出: {output_path}")
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
