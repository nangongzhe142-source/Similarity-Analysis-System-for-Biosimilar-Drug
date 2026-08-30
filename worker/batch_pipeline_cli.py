"""Isolated CLI runner for BioCompare calculation units."""

from __future__ import annotations

import argparse
import csv
import json
import os
import shutil
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.calculation_units import UNITS, adapt_openms_sage, compare_multi_lot, normalize_glycan_composition
from backend.external_engines import resolve_executable
from worker.sequence_evidence import build_sequence_coverage_from_tables, comparison_table, extract_ms1_xic, write_xic_csv
from worker.metamorpheus_ptm import run_metamorpheus_ptm
from worker.covalent_bonds import run_disulfide_pipeline


GLYCAN_LIBRARY = {
    "NANA": {"rt": 8.0, "composition": "{Neu5Ac:1}", "route": "DMB-FLD"},
    "NGNA": {"rt": 10.0, "composition": "{Neu5Gc:1}", "route": "DMB-FLD"},
    "Man5": {"rt": 16.0, "composition": "{Hex:5; HexNAc:2}", "route": "HILIC-FLD"},
    "G0": {"rt": 20.0, "composition": "{Hex:3; HexNAc:4}", "route": "HILIC-FLD"},
    "G0F": {"rt": 22.0, "composition": "{Hex:3; HexNAc:4; Fuc:1}", "route": "HILIC-FLD"},
    "G1F": {"rt": 24.5, "composition": "{Hex:4; HexNAc:4; Fuc:1}", "route": "HILIC-FLD"},
    "G2F": {"rt": 27.5, "composition": "{Hex:5; HexNAc:4; Fuc:1}", "route": "HILIC-FLD"},
}


def run(command: list[str], cwd: Path, log: list[dict[str, Any]], timeout: int) -> None:
    completed = subprocess.run(command, cwd=str(cwd), capture_output=True, text=True, check=False, timeout=timeout)
    log.append({"command": command, "returnCode": completed.returncode, "stdout": (completed.stdout or "")[-12000:], "stderr": (completed.stderr or "")[-12000:]})
    if completed.returncode:
        raise RuntimeError(f"external command exited {completed.returncode}: {(completed.stderr or completed.stdout or '')[-1800:]}")


def files_by_role(manifest: dict[str, Any], root: Path) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for item in manifest["files"]:
        value = {**item, "path": root / "inputs" / item["storedName"]}
        grouped.setdefault(item["role"], []).append(value)
    return grouped


def first_batch(module_code: str, grouped: dict[str, list[dict[str, Any]]], out: Path, work: Path, parameters: dict[str, Any], logs: list[dict[str, Any]], timeout: int) -> dict[str, Any]:
    upstream = out / "openms-sage"
    upstream.mkdir()
    decoy = resolve_executable("openms-sage", "DecoyDatabase")
    adapter = resolve_executable("openms-sage", "SageAdapter")
    sage = resolve_executable("openms-sage", "sage")
    converter = resolve_executable("openms-sage", "FileConverter")
    if not all((decoy, adapter, sage, converter)):
        raise RuntimeError("OpenMS/Sage executable set is incomplete")
    fasta = grouped["fasta"][0]["path"]
    command = [sys.executable, str(ROOT / "worker" / "openms_sage_cli.py")]
    for item in grouped["reference"]:
        command.extend(["--reference", str(item["path"])])
    for item in grouped["candidate"]:
        command.extend(["--candidate", str(item["path"])])
    command.extend([
        "--fasta", str(fasta), "--result-dir", str(upstream),
        "--work-root", str(work), "--decoy-database", str(decoy),
        "--sage-adapter", str(adapter), "--sage", str(sage),
        "--openms-data-path", str(Path(converter).resolve().parents[1]),
        "--q-threshold", str(parameters.get("qValueThreshold", 0.01)),
        "--min-reference-lots", str(parameters.get("minReferenceLots", 3)),
        "--interval-method", str(parameters.get("intervalMethod", "observed-range")),
        "--threads", str(parameters.get("threads", 4)),
    ])
    if module_code == "PTM-03":
        for modification in ("Oxidation (M)", "Deamidated (N)", "Deamidated (Q)", "Gln->pyro-Glu (N-term Q)", "Glu->pyro-Glu (N-term E)"):
            command.extend(["--variable-modification", modification])
    run(command, work, logs, timeout)
    if module_code == "SEQ-01":
        xic = extract_ms1_xic(
            [(role, item["path"]) for role in ("reference", "candidate") for item in grouped[role]],
            fasta,
            ppm_tolerance=float(parameters.get("ms1PpmTolerance", 10)),
            min_scans=int(parameters.get("minXicScans", 2)),
            min_intensity=float(parameters.get("minXicIntensity", 0)),
        )
        write_xic_csv(out / "ms1-xic-evidence.csv", xic["evidence"])
        result = {
            "moduleCode": module_code,
            "status": "completed" if xic["evidence"] else "quality-blocked",
            "metrics": xic["metrics"],
            "evidence": xic["evidence"],
            "comparisonTable": comparison_table(xic["metrics"]),
            "sequenceCoverage": xic["sequenceCoverage"],
            "theoreticalPeptideCount": xic["theoreticalPeptideCount"],
            "qualityGate": {"passed": bool(xic["evidence"]), "message": "已获得MS1 XIC肽质量证据" if xic["evidence"] else "未获得满足扫描数和强度阈值的MS1 XIC证据"},
            "decision": None,
            "disclaimer": "技术结果仅用于客观差异审阅，不自动给出生物相似性结论。",
        }
        result["professionalEngine"] = "OpenMS 3.5 输入标准化 + Pyteomics 5 MS1 XIC"
        result["processingBoundary"] = "OpenMS验证并标准化mzML输入；Pyteomics执行理论酶切、质量计算和XIC提取；BioCompare仅映射覆盖率与组间差异。"
    else:
        result = adapt_openms_sage(
            module_code, upstream / "results.sage.tsv", fasta,
            upstream / "reference-ptm.csv", upstream / "candidate-ptm.csv", parameters,
        )
        result["professionalEngine"] = "OpenMS 3.5 SageAdapter + Sage + Pyteomics 5"
        result["processingBoundary"] = "OpenMS/Sage负责数据库检索和FDR；Pyteomics辅助FASTA/肽段映射；BioCompare仅做业务字段适配与多批参照区间标记。"
    return result


def sequence_table_batch(module_code: str, grouped: dict[str, list[dict[str, Any]]], parameters: dict[str, Any]) -> dict[str, Any]:
    files = []
    for role in ("reference", "candidate"):
        for index, item in enumerate(grouped[role], 1):
            files.append((role, str(item.get("lotId") or f"{'R' if role == 'reference' else 'C'}{index:02d}"), item["path"]))
    return build_sequence_coverage_from_tables(module_code, files, grouped["fasta"][0]["path"], q_value_threshold=float(parameters.get("qValueThreshold", 0.01)))


def canonicalize_csv(source: Path, target: Path) -> None:
    with source.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    if not rows:
        raise ValueError(f"empty chromatogram: {source.name}")
    names = list(rows[0])
    time_name = next((name for name in names if name.lower() in {"time", "retention_time", "rt", "time_min"}), names[0])
    signal_name = next((name for name in names if name.lower() in {"signal", "intensity", "response", "absorbance", "intensity_mv"}), names[1] if len(names) > 1 else "")
    if not signal_name:
        raise ValueError("chromatogram requires time and signal columns")
    with target.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["time", "signal"])
        writer.writeheader()
        for row in rows:
            writer.writerow({"time": float(row[time_name]), "signal": float(row[signal_name])})


def _header_key(value: str) -> str:
    return "".join(character for character in value.strip().lower() if character.isalnum() or "\u4e00" <= character <= "\u9fff")


PEAK_TABLE_HEADERS = {
    "peak_id": {"peakid", "peakname", "峰编号", "峰名", "峰标识"},
    "time": {"retentiontime", "migrationtime", "time", "rt", "保留时间", "迁移时间"},
    "area_percent": {"areapercent", "peakareapercent", "峰面积", "峰面积百分比", "面积百分比"},
    "group": {"group", "peakgroup", "峰分组", "峰组"},
}
TRACE_HEADERS = {
    "time": {"time", "retentiontime", "migrationtime", "rt", "timemin", "保留时间", "迁移时间"},
    "signal": {"signal", "intensity", "response", "absorbance", "intensitymv", "信号", "强度", "响应"},
}


def _matched_header(fieldnames: list[str], aliases: set[str]) -> str | None:
    return next((name for name in fieldnames if _header_key(name) in aliases), None)


def purity_csv_mode(path: Path) -> str:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = list(reader.fieldnames or [])
    has_peak_table = bool(_matched_header(fieldnames, PEAK_TABLE_HEADERS["time"]) and _matched_header(fieldnames, PEAK_TABLE_HEADERS["area_percent"]))
    has_trace = bool(_matched_header(fieldnames, TRACE_HEADERS["time"]) and _matched_header(fieldnames, TRACE_HEADERS["signal"]))
    if has_peak_table and not has_trace:
        return "peak-table"
    if has_trace and not has_peak_table:
        return "trace"
    if has_peak_table:
        return "peak-table"
    raise ValueError(f"{path.name}表头既不符合时间-信号曲线，也不符合峰面积表；峰面积表至少需要峰名/峰编号、保留时间或迁移时间、峰面积百分比")


def ingest_peak_area_table(path: Path, module_code: str, parameters: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, float]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)
    if not rows:
        raise ValueError(f"峰面积表为空：{path.name}")
    time_name = _matched_header(fieldnames, PEAK_TABLE_HEADERS["time"])
    area_name = _matched_header(fieldnames, PEAK_TABLE_HEADERS["area_percent"])
    id_name = _matched_header(fieldnames, PEAK_TABLE_HEADERS["peak_id"])
    group_name = _matched_header(fieldnames, PEAK_TABLE_HEADERS["group"])
    if not time_name or not area_name:
        raise ValueError(f"峰面积表缺少保留/迁移时间或峰面积百分比：{path.name}")
    peaks = []
    for index, row in enumerate(rows, 1):
        try:
            time = float(row[time_name]); area = float(row[area_name])
        except (TypeError, ValueError) as error:
            raise ValueError(f"峰面积表第{index + 1}行时间或面积百分比不是数值：{path.name}") from error
        if area < 0:
            raise ValueError(f"峰面积百分比不得为负数：{path.name}第{index + 1}行")
        peaks.append({
            "retention_time": time,
            "area": area,
            "_provided_id": (row.get(id_name, "") if id_name else "").strip() or f"P{index:02d}",
            "_provided_group": (row.get(group_name, "") if group_name else "").strip().upper(),
        })
    return _purity_peak_rows(module_code, peaks, parameters)


def convert_chromatogram(item: dict[str, Any], target: Path, parameters: dict[str, Any], work: Path, logs: list[dict[str, Any]], timeout: int) -> None:
    source = item["path"]
    if source.suffix.lower() in {".csv", ".txt"}:
        canonicalize_csv(source, target)
        return
    rscript = os.getenv("RSCRIPT_BIN") or shutil.which("Rscript")
    if not rscript:
        raise RuntimeError("Rscript/chromConverter未配置；厂商原始文件不能转换。可先提交canonical CSV验证下游。")
    format_in = str(item.get("formatIn") or parameters.get("chromConverterFormat") or "")
    if not format_in:
        raise ValueError("vendor chromatogram input requires formatIn")
    run([rscript, str(ROOT / "scripts" / "chromconverter_to_canonical.R"), str(source), str(target), format_in], work, logs, timeout)


def hplc_peaks(path: Path, parameters: dict[str, Any]) -> list[dict[str, Any]]:
    os.environ.setdefault("MPLCONFIGDIR", str(path.parent / ".matplotlib"))
    import pandas as pd
    from hplc.quant import Chromatogram

    frame = pd.read_csv(path)
    approx_peak_width = float(parameters.get("approxPeakWidth", 1.0))
    # hplc-py deliberately detects both positive peaks and negative troughs.
    # Absorbance chromatograms may contain negative residuals after baseline
    # correction; treating those troughs as chromatographic peaks can create an
    # invalid width guess.  Keep hplc-py's own baseline algorithm, then suppress
    # only negative corrected residuals before its peak detection/fitting stage.
    baseline = Chromatogram(frame, cols={"time": "time", "signal": "signal"})
    baseline.correct_baseline(window=approx_peak_width, verbose=False, return_df=False)
    corrected = baseline.df.copy()
    corrected["signal"] = corrected["signal"].clip(lower=0)
    chrom = Chromatogram(corrected, cols={"time": "time", "signal": "signal"})
    peaks = chrom.fit_peaks(
        prominence=float(parameters.get("prominence", 0.01)),
        approx_peak_width=approx_peak_width,
        verbose=False, return_peaks=True, correct_baseline=False,
    )
    return [{key: (value.item() if hasattr(value, "item") else value) for key, value in row.items()} for row in peaks.to_dict(orient="records")]


def chromatography_features(code: str, peaks: list[dict[str, Any]]) -> dict[str, float]:
    if not peaks:
        raise ValueError("hplc-py did not detect peaks")
    area_key = next((key for key in peaks[0] if key.lower() in {"area", "peak_area"}), None)
    rt_key = next((key for key in peaks[0] if key.lower() in {"retention_time", "location", "rt"}), None)
    if not area_key or not rt_key:
        raise ValueError("hplc-py peak table lacks area or retention-time field")
    ordered = sorted(peaks, key=lambda item: float(item[rt_key]))
    main = max(ordered, key=lambda item: float(item[area_key]))
    total = sum(max(float(item[area_key]), 0) for item in ordered)
    if total <= 0:
        raise ValueError("total fitted peak area is zero")
    main_rt = float(main[rt_key])
    acidic = sum(float(item[area_key]) for item in ordered if float(item[rt_key]) < main_rt)
    basic = sum(float(item[area_key]) for item in ordered if float(item[rt_key]) > main_rt)
    main_pct = 100 * float(main[area_key]) / total
    values = {
        "PUR-01": 100 * acidic / total, "PUR-02": main_pct, "PUR-03": 100 * basic / total,
        "IEX-ACIDIC": 100 * acidic / total, "IEX-MAIN": main_pct, "IEX-BASIC": 100 * basic / total,
    }
    return {code: values[code]}


def happytools_calibrate(source: Path, target: Path, metadata: Path, parameters: dict[str, Any], work: Path, logs: list[dict[str, Any]], timeout: int) -> None:
    happytools_root = os.getenv("HAPPYTOOLS_ROOT")
    if not happytools_root or not (Path(happytools_root) / "HappyTools" / "bin" / "chromatogram.py").is_file():
        raise RuntimeError("HAPPYTOOLS_ROOT未配置或HappyTools本体不完整")
    frame = __import__("pandas").read_csv(source)
    lower, upper = float(frame["time"].min()), float(frame["time"].max())
    anchors = parameters.get("timeCalibrationPoints") or [
        {"observed": lower, "expected": lower},
        {"observed": (lower + upper) / 2, "expected": (lower + upper) / 2},
        {"observed": upper, "expected": upper},
    ]
    run([
        sys.executable, str(ROOT / "worker" / "happytools_calibrate.py"),
        "--input", str(source), "--output", str(target), "--metadata", str(metadata),
        "--happytools-root", happytools_root, "--anchors-json", json.dumps(anchors),
    ], work, logs, timeout)


def _purity_peak_rows(module_code: str, peaks: list[dict[str, Any]], parameters: dict[str, Any]) -> tuple[list[dict[str, Any]], dict[str, float]]:
    area_key, time_key = _peak_fields(peaks)
    positive = [peak for peak in peaks if float(peak[area_key]) > 0]
    total = sum(float(peak[area_key]) for peak in positive)
    if total <= 0:
        raise ValueError("total fitted peak area is zero")
    main = max(positive, key=lambda peak: float(peak[area_key]))
    main_time = float(main[time_key])
    configured = parameters.get("peakWindows") or {}
    if not isinstance(configured, dict):
        raise ValueError("peakWindows必须是对象")
    sec_tolerance = float(parameters.get("mainPeakHalfWindow", 0.35))

    def classify(time: float) -> str:
        for name, bounds in configured.items():
            if isinstance(bounds, list) and len(bounds) == 2 and float(bounds[0]) <= time <= float(bounds[1]):
                return str(name).upper()
        if module_code in {"PUR-01", "PUR-02", "PUR-03"}:
            return "HMW" if time < main_time - sec_tolerance else "LMW" if time > main_time + sec_tolerance else "MAIN"
        if module_code in {"PUR-04", "PUR-05"}:
            return "IMPURITY"
        return "MAIN" if abs(time - main_time) <= sec_tolerance else "IMPURITY"

    rows, totals = [], defaultdict(float)
    for index, peak in enumerate(sorted(positive, key=lambda value: float(value[time_key])), 1):
        time, area = float(peak[time_key]), float(peak[area_key])
        group = str(peak.get("_provided_group") or classify(time)).upper()
        area_percent = 100 * area / total
        totals[group] += area_percent
        rows.append({"peakId": str(peak.get("_provided_id") or f"P{index:02d}"), "peakGroup": group, "migrationTime": time, "peakArea": area, "areaPercent": area_percent})
    if module_code in {"PUR-04", "PUR-05"}:
        totals["PURITY"] = totals["LC"] + totals["HC"]
        totals["IMPURITY"] = max(0.0, 100.0 - totals["PURITY"])
    if module_code in {"PUR-06", "PUR-07"}:
        totals["IMPURITY"] = max(0.0, 100.0 - totals["MAIN"])
    return rows, dict(totals)


def _purity_target(module_code: str) -> str:
    return {"PUR-01": "HMW", "PUR-02": "MAIN", "PUR-03": "LMW", "PUR-04": "PURITY", "PUR-05": "IMPURITY", "PUR-06": "MAIN", "PUR-07": "IMPURITY"}[module_code]


def peak_area_second_batch(module_code: str, grouped: dict[str, list[dict[str, Any]]], out: Path, parameters: dict[str, Any]) -> dict[str, Any]:
    reference_rows, candidate_rows, peak_payload = [], [], []
    target = _purity_target(module_code)
    for role in ("reference", "candidate"):
        for index, item in enumerate(grouped[role], 1):
            lot_id = str(item.get("lotId") or f"{'R' if role == 'reference' else 'C'}{index:02d}")
            rows, totals = ingest_peak_area_table(item["path"], module_code, parameters)
            peak_payload.extend({"cohort": role, "lotId": lot_id, **row} for row in rows)
            (reference_rows if role == "reference" else candidate_rows).append({"lot_id": lot_id, "feature": target, "value": totals.get(target, 0.0)})
    with (out / "peaks.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        fields = sorted({key for row in peak_payload for key in row})
        writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader(); writer.writerows(peak_payload)
    comparison = compare_multi_lot(reference_rows, candidate_rows, min_reference_lots=int(parameters.get("minReferenceLots", 3)), interval_method=parameters.get("intervalMethod", "observed-range"))
    reference_mean = sum(row["value"] for row in reference_rows) / len(reference_rows)
    candidate_mean = sum(row["value"] for row in candidate_rows) / len(candidate_rows)
    loq = float(parameters.get("loqPercent", 0.1)); match_tolerance = float(parameters.get("peakMatchTolerance", 0.2))
    reference_times = [row["migrationTime"] for row in peak_payload if row["cohort"] == "reference"]
    new_peaks = [{**row, "reviewAction": "send-to-MS-identification"} for row in peak_payload if row["cohort"] == "candidate" and row["areaPercent"] >= loq and not any(abs(row["migrationTime"] - value) <= match_tolerance for value in reference_times)]
    warnings = [{"code": "EXTERNAL_TABLE_INPUT", "severity": "medium", "message": "本结果来自外部导出的峰面积表，未经本平台重新积分；请确认来源、积分参数与质控。"}]
    if module_code == "PUR-01" and candidate_mean > reference_mean + float(parameters.get("hmwRiskDeltaPercent", 0.2)):
        warnings.append({"code": "HMW_ELEVATED", "severity": "high", "message": "候选药HMW面积比例高于本次参照药均值，需结合多批参照区间和聚集风险审阅。"})
    relevant_new = [row for row in new_peaks if module_code != "PUR-03" or row["peakGroup"] == "LMW"]
    if relevant_new:
        warnings.append({"code": "NEW_PEAK_ABOVE_LOQ", "severity": "high" if module_code in {"PUR-03", "PUR-05", "PUR-07"} else "medium", "message": f"候选药出现{len(relevant_new)}个参照药未匹配且高于LOQ的新峰，已预留送MS鉴定入口。"})
    summary_rows = []
    for role in ("reference", "candidate"):
        values = reference_rows if role == "reference" else candidate_rows
        for lot_id in sorted({row["lotId"] for row in peak_payload if row["cohort"] == role}):
            lot_rows = [row for row in peak_payload if row["cohort"] == role and row["lotId"] == lot_id]
            groups = defaultdict(float)
            for row in lot_rows: groups[row["peakGroup"]] += row["areaPercent"]
            summary_rows.append({"cohort": role, "lotId": lot_id, "target": target, "targetPercent": next(row["value"] for row in values if row["lot_id"] == lot_id), "lcPlusHcPercent": groups["LC"] + groups["HC"] if module_code in {"PUR-04", "PUR-05"} else None, "lcHcRatio": groups["LC"] / groups["HC"] if groups["HC"] > 0 else None, "nghcPercent": groups["NGHC"] if module_code in {"PUR-04", "PUR-05"} else None})
    return {
        "moduleCode": module_code, "status": "completed", "professionalEngine": "外部峰面积表通道（未经本平台重新积分）",
        "methodRoute": "SEC-HPLC" if module_code in {"PUR-01", "PUR-02", "PUR-03"} else "reduced CE-SDS" if module_code in {"PUR-04", "PUR-05"} else "non-reduced CE-SDS",
        "targetMetric": target, "traces": [], "peakRows": peak_payload, "summaryRows": summary_rows,
        "comparisonTable": [{"metric": target, "referencePercent": reference_mean, "candidatePercent": candidate_mean, "differencePercentagePoints": candidate_mean - reference_mean, "intervalStatus": comparison["candidateMarks"][0]["intervalStatus"] if comparison["candidateMarks"] else "not-evaluated"}],
        "comparison": comparison, "warnings": warnings, "newCandidatePeaks": relevant_new, "calibration": [],
        "configUsed": {"peakWindows": parameters.get("peakWindows") or {}, "loqPercent": loq, "peakMatchTolerance": match_tolerance, "mainPeakHalfWindow": float(parameters.get("mainPeakHalfWindow", 0.35))},
        "manualReview": {"CEVal": "人工复核参考；外部峰面积表未在本平台重新积分"}, "decision": None,
        "disclaimer": "仅客观展示外部峰面积、纯度、多批参照区间符合性和新峰风险，不自动给出生物相似性结论。",
    }


def second_batch(module_code: str, grouped: dict[str, list[dict[str, Any]]], out: Path, work: Path, parameters: dict[str, Any], logs: list[dict[str, Any]], timeout: int) -> dict[str, Any]:
    input_modes = []
    for role in ("reference", "candidate"):
        for item in grouped[role]:
            input_modes.append(purity_csv_mode(item["path"]) if item["path"].suffix.lower() in {".csv", ".txt"} else "trace")
    if "peak-table" in input_modes and "trace" in input_modes:
        raise ValueError("候选药与参照药输入形态不一致：峰面积表不能与时间-信号曲线混用")
    if input_modes and all(mode == "peak-table" for mode in input_modes):
        return peak_area_second_batch(module_code, grouped, out, parameters)
    reference_rows, candidate_rows, peak_payload, traces, calibration = [], [], [], [], []
    canonical_dir = out / "canonical"
    canonical_dir.mkdir()
    for role in ("reference", "candidate"):
        for index, item in enumerate(grouped[role], 1):
            lot_id = str(item.get("lotId") or f"{'R' if role == 'reference' else 'C'}{index:02d}")
            canonical = canonical_dir / f"{role}-{index:03d}.csv"
            convert_chromatogram(item, canonical, parameters, work, logs, timeout)
            calibrated = canonical_dir / f"{role}-{index:03d}-calibrated.csv"
            calibration_meta = canonical_dir / f"{role}-{index:03d}-calibration.json"
            happytools_calibrate(canonical, calibrated, calibration_meta, parameters, work, logs, timeout)
            calibration.append({"cohort": role, "lotId": lot_id, **json.loads(calibration_meta.read_text(encoding="utf-8"))})
            traces.append(_read_trace(calibrated, role, lot_id))
            rows, totals = _purity_peak_rows(module_code, hplc_peaks(calibrated, parameters), parameters)
            for row in rows:
                peak_payload.append({"cohort": role, "lotId": lot_id, **row})
            target = _purity_target(module_code)
            (reference_rows if role == "reference" else candidate_rows).append({"lot_id": lot_id, "feature": target, "value": totals.get(target, 0.0)})
    with (out / "peaks.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        fields = sorted({key for row in peak_payload for key in row})
        writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader(); writer.writerows(peak_payload)
    comparison = compare_multi_lot(reference_rows, candidate_rows, min_reference_lots=int(parameters.get("minReferenceLots", 3)), interval_method=parameters.get("intervalMethod", "observed-range"))
    target = _purity_target(module_code)
    reference_mean = sum(row["value"] for row in reference_rows) / len(reference_rows)
    candidate_mean = sum(row["value"] for row in candidate_rows) / len(candidate_rows)
    loq = float(parameters.get("loqPercent", 0.1))
    match_tolerance = float(parameters.get("peakMatchTolerance", 0.2))
    reference_times = [row["migrationTime"] for row in peak_payload if row["cohort"] == "reference"]
    new_peaks = [{**row, "reviewAction": "send-to-MS-identification"} for row in peak_payload if row["cohort"] == "candidate" and row["areaPercent"] >= loq and not any(abs(row["migrationTime"] - value) <= match_tolerance for value in reference_times)]
    warnings = []
    if module_code == "PUR-01" and candidate_mean > reference_mean + float(parameters.get("hmwRiskDeltaPercent", 0.2)):
        warnings.append({"code": "HMW_ELEVATED", "severity": "high", "message": "候选药HMW面积比例高于本次参照药均值，需结合多批参照区间和聚集风险审阅。"})
    relevant_new = [row for row in new_peaks if module_code not in {"PUR-03"} or row["peakGroup"] == "LMW"]
    if relevant_new:
        warnings.append({"code": "NEW_PEAK_ABOVE_LOQ", "severity": "high" if module_code in {"PUR-03", "PUR-05", "PUR-07"} else "medium", "message": f"候选药出现{len(relevant_new)}个参照药未匹配且高于LOQ的新峰，已预留送MS鉴定入口。"})
    summary_rows = []
    for role in ("reference", "candidate"):
        for lot_id in sorted({row["lotId"] for row in peak_payload if row["cohort"] == role}):
            lot_rows = [row for row in peak_payload if row["cohort"] == role and row["lotId"] == lot_id]
            groups = defaultdict(float)
            for row in lot_rows:
                groups[row["peakGroup"]] += row["areaPercent"]
            summary_rows.append({"cohort": role, "lotId": lot_id, "target": target, "targetPercent": next(row["value"] for row in (reference_rows if role == "reference" else candidate_rows) if row["lot_id"] == lot_id), "lcPlusHcPercent": groups["LC"] + groups["HC"] if module_code in {"PUR-04", "PUR-05"} else None, "lcHcRatio": groups["LC"] / groups["HC"] if groups["HC"] > 0 else None, "nghcPercent": groups["NGHC"] if module_code in {"PUR-04", "PUR-05"} else None})
    return {
        "moduleCode": module_code, "status": "completed", "professionalEngine": "chromConverter (Rscript subprocess) → HappyTools calibration subprocess → hplc-py 0.2.8",
        "methodRoute": "SEC-HPLC" if module_code in {"PUR-01", "PUR-02", "PUR-03"} else "reduced CE-SDS" if module_code in {"PUR-04", "PUR-05"} else "non-reduced CE-SDS",
        "targetMetric": target, "traces": traces, "peakRows": peak_payload, "summaryRows": summary_rows,
        "comparisonTable": [{"metric": target, "referencePercent": reference_mean, "candidatePercent": candidate_mean, "differencePercentagePoints": candidate_mean - reference_mean, "intervalStatus": comparison["candidateMarks"][0]["intervalStatus"] if comparison["candidateMarks"] else "not-evaluated"}],
        "comparison": comparison, "warnings": warnings, "newCandidatePeaks": relevant_new, "calibration": calibration,
        "configUsed": {"peakWindows": parameters.get("peakWindows") or {}, "loqPercent": loq, "peakMatchTolerance": match_tolerance, "mainPeakHalfWindow": float(parameters.get("mainPeakHalfWindow", 0.35))},
        "manualReview": {"CEVal": "人工复核参考；无可自动调度CLI，未纳入服务器计算链"},
        "decision": None, "disclaimer": "仅客观展示峰面积、纯度、多批参照区间符合性和新峰风险，不自动给出生物相似性结论。",
    }


def _peak_fields(peaks: list[dict[str, Any]]) -> tuple[str, str]:
    if not peaks:
        raise ValueError("hplc-py did not detect peaks")
    area_key = next((key for key in peaks[0] if key.lower() in {"area", "peak_area"}), None)
    rt_key = next((key for key in peaks[0] if key.lower() in {"retention_time", "location", "rt"}), None)
    if not area_key or not rt_key:
        raise ValueError("hplc-py peak table lacks area or retention-time field")
    return area_key, rt_key


def _glycan_library(parameters: dict[str, Any]) -> dict[str, dict[str, Any]]:
    library = {name: dict(value) for name, value in GLYCAN_LIBRARY.items()}
    configured = parameters.get("glycanRetentionLibrary") or {}
    if not isinstance(configured, dict):
        raise ValueError("glycanRetentionLibrary must be an object")
    for name, value in configured.items():
        if name in library and isinstance(value, (int, float)):
            library[name]["rt"] = float(value)
        elif isinstance(value, dict) and "rt" in value:
            library[name] = {**library.get(name, {}), **value, "rt": float(value["rt"])}
    return library


def _read_trace(path: Path, role: str, lot_id: str) -> dict[str, Any]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        rows = list(csv.DictReader(handle))
    points = [{"time": float(row["time"]), "signal": float(row["signal"])} for row in rows]
    stride = max(1, len(points) // 1600)
    return {"cohort": role, "lotId": lot_id, "points": points[::stride]}


def _assign_glycan_peaks(peaks: list[dict[str, Any]], library: dict[str, dict[str, Any]], tolerance: float, route: str) -> list[dict[str, Any]]:
    from glypy.structure.glycan_composition import GlycanComposition

    area_key, rt_key = _peak_fields(peaks)
    positive = [peak for peak in peaks if float(peak[area_key]) > 0]
    total = sum(float(peak[area_key]) for peak in positive)
    if total <= 0:
        raise ValueError("total fitted peak area is zero")
    assignments = []
    for peak in positive:
        rt = float(peak[rt_key])
        candidates = [(abs(rt - float(spec["rt"])), name, spec) for name, spec in library.items() if spec.get("route") == route]
        distance, name, spec = min(candidates, default=(float("inf"), "Unassigned", {}))
        composition = str(spec.get("composition") or "")
        theoretical_mass = float(GlycanComposition.parse(composition).mass()) if composition else None
        matched = distance <= tolerance
        assignments.append({
            "glycoform": name if matched else "Unassigned", "retentionTime": rt,
            "peakArea": float(peak[area_key]), "areaPercent": 100.0 * float(peak[area_key]) / total,
            "composition": composition if matched else "", "theoreticalMass": theoretical_mass if matched else None,
            "assignmentBasis": "retention-time-library + glypy-composition-check" if matched else "unassigned-peak",
            "confirmationStatus": "provisional-retention-time" if matched else "unassigned",
            "rtDelta": distance if distance != float("inf") else None,
        })
    return assignments


def glycan_chromatography_batch(module_code: str, grouped: dict[str, list[dict[str, Any]]], out: Path, work: Path, parameters: dict[str, Any], logs: list[dict[str, Any]], timeout: int) -> dict[str, Any]:
    library = _glycan_library(parameters)
    route = "DMB-FLD" if module_code in {"GLY-05", "GLY-06"} else "HILIC-FLD"
    tolerance = float(parameters.get("retentionTimeToleranceMinutes", 0.7))
    target = {"GLY-02": "G0F", "GLY-03": "G0", "GLY-04": "all", "GLY-05": "NGNA", "GLY-06": "NANA"}[module_code]
    canonical_dir = out / "canonical"
    canonical_dir.mkdir()
    traces, all_assignments = [], []
    reference_rows, candidate_rows = [], []
    for role in ("reference", "candidate"):
        for index, item in enumerate(grouped[role], 1):
            lot_id = str(item.get("lotId") or f"{'R' if role == 'reference' else 'C'}{index:02d}")
            canonical = canonical_dir / f"{role}-{index:03d}.csv"
            convert_chromatogram(item, canonical, parameters, work, logs, timeout)
            traces.append(_read_trace(canonical, role, lot_id))
            assignments = _assign_glycan_peaks(hplc_peaks(canonical, parameters), library, tolerance, route)
            for assignment in assignments:
                all_assignments.append({"cohort": role, "lotId": lot_id, **assignment})
                if assignment["glycoform"] != "Unassigned":
                    row = {"lot_id": lot_id, "feature": assignment["glycoform"], "value": assignment["areaPercent"]}
                    (reference_rows if role == "reference" else candidate_rows).append(row)
    fields = ["cohort", "lotId", "glycoform", "retentionTime", "peakArea", "areaPercent", "composition", "theoreticalMass", "assignmentBasis", "confirmationStatus", "rtDelta"]
    with (out / "glycoform-results.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader(); writer.writerows(all_assignments)
    comparison = compare_multi_lot(reference_rows, candidate_rows, min_reference_lots=int(parameters.get("minReferenceLots", 3)), interval_method=parameters.get("intervalMethod", "observed-range"))
    comparison_table = []
    for glycoform in sorted({row["feature"] for row in reference_rows + candidate_rows}):
        ref = [row["value"] for row in reference_rows if row["feature"] == glycoform]
        cand = [row["value"] for row in candidate_rows if row["feature"] == glycoform]
        ref_mean, cand_mean = (sum(ref) / len(ref) if ref else None), (sum(cand) / len(cand) if cand else None)
        mark = next((item["intervalStatus"] for item in comparison["candidateMarks"] if item["feature"] == glycoform), "not-evaluated")
        comparison_table.append({"glycoform": glycoform, "referencePercent": ref_mean, "candidatePercent": cand_mean, "differencePercentagePoints": cand_mean - ref_mean if ref_mean is not None and cand_mean is not None else None, "intervalStatus": mark})
    warnings = []
    candidate_mean = {row["glycoform"]: row["candidatePercent"] for row in comparison_table}
    if module_code == "GLY-03" and (candidate_mean.get("G0") or 0) > float(parameters.get("nonFucosylatedNoticePercent", 0.1)):
        warnings.append({"code": "NON_FUCOSYLATED_GLYCAN", "severity": "medium", "message": "检测到无核心岩藻糖G0；该标记仅提示结合Fc效应功能进一步审阅。"})
    if module_code == "GLY-05" and (candidate_mean.get("NGNA") or 0) > float(parameters.get("ngnaRiskThresholdPercent", 0.1)):
        warnings.append({"code": "NGNA_IMMUNOGENICITY_REVIEW", "severity": "high", "message": "候选药NGNA高于平台风险提示阈值，需结合来源、批次分布和免疫原性资料审阅。"})
    total_sialylation = {
        cohort: sum(row["areaPercent"] for row in all_assignments if row["cohort"] == cohort and row["glycoform"] in {"NANA", "NGNA"}) / max(len({row["lotId"] for row in all_assignments if row["cohort"] == cohort}), 1)
        for cohort in ("reference", "candidate")
    }
    return {
        "moduleCode": module_code, "status": "completed", "professionalEngine": "chromConverter (Rscript subprocess) → hplc-py → glypy",
        "methodRoute": "DMB衍生化-FLD" if route == "DMB-FLD" else "释放N-糖链HILIC-FLD", "targetGlycoform": target,
        "traces": traces, "glycoformRows": all_assignments, "comparisonTable": comparison_table, "comparison": comparison,
        "warnings": warnings, "totalSialylationPercent": total_sialylation,
        "massRules": {"g0fMinusG0Da": 146.057909, "ngnaMinusNanaDa": 15.994915},
        "msConfirmation": parameters.get("glycresoftConfirmation") or {"status": "not-provided", "message": "本次未提供GlycReSoft上游确证结果；峰归属为保留时间推定，不等同MS确证。"},
        "decision": None, "disclaimer": "仅客观展示糖型定量、参照区间符合性和风险标记，不自动给出生物相似性结论。",
    }


def find_export_csv(folder: Path) -> Path:
    matches = sorted(folder.rglob("*.csv"))
    if not matches:
        raise RuntimeError("GlycReSoft completed without CSV export")
    return matches[-1]


def third_batch(grouped: dict[str, list[dict[str, Any]]], out: Path, work: Path, parameters: dict[str, Any], logs: list[dict[str, Any]], timeout: int) -> dict[str, Any]:
    glycresoft_appdata = Path(os.getenv("GLYCRESOFT_APPDATA", str(work / "glycresoft-appdata")))
    glycresoft_appdata.mkdir(parents=True, exist_ok=True)
    os.environ["APPDATA"] = str(glycresoft_appdata)
    executable = os.getenv("GLYCRESOFT_BIN") or shutil.which("glycresoft")
    if not executable:
        raise RuntimeError("GLYCRESOFT_BIN/glycresoft未配置")
    fasta, glycan_source = grouped["fasta"][0]["path"], grouped["glycan_source"][0]["path"]
    database = work / "glycopeptide-hypothesis.db"
    hypothesis_name = str(parameters.get("hypothesisName", "BioCompare Glycopeptide Hypothesis"))
    staged_runs: list[tuple[str, int, dict[str, Any], Path, Path]] = []
    processed_by_hash: dict[str, Path] = {}
    # The requested order is explicit: preprocess every mzML first, then build
    # the reusable hypothesis, then search and export each lot.
    for role in ("reference", "candidate"):
        for index, item in enumerate(grouped[role], 1):
            run_work = work / f"{role}-{index:03d}"
            run_work.mkdir()
            processed = run_work / "processed.mzML"
            input_hash = str(item.get("sha256") or "")
            if input_hash and input_hash in processed_by_hash:
                processed = processed_by_hash[input_hash]
                logs.append({
                    "command": ["reuse-preprocessed", input_hash], "returnCode": 0,
                    "stdout": f"Reused identical mzML from {processed}", "stderr": "",
                })
            else:
                run([executable, "mzml", "preprocess", str(item["path"]), str(processed)], run_work, logs, timeout)
                if input_hash:
                    processed_by_hash[input_hash] = processed
            staged_runs.append((role, index, item, run_work, processed))
    run([executable, "build-hypothesis", "glycopeptide-fa", str(fasta), str(database), "--glycan-source", str(glycan_source), "--name", hypothesis_name], work, logs, timeout)
    reference_rows, candidate_rows = [], []
    raw_exports = out / "glycresoft"
    raw_exports.mkdir()
    export_by_hash: dict[str, Path] = {}
    for role, index, item, run_work, processed in staged_runs:
        lot_id = str(item.get("lotId") or f"{'R' if role == 'reference' else 'C'}{index:02d}")
        result_db = run_work / "analysis.db"
        export_dir = raw_exports / f"{role}-{index:03d}"
        export_dir.mkdir()
        input_hash = str(item.get("sha256") or "")
        if input_hash and input_hash in export_by_hash:
            cached = export_by_hash[input_hash]
            target = export_dir / cached.name
            shutil.copy2(cached, target)
            logs.append({
                "command": ["reuse-glycresoft-export", input_hash], "returnCode": 0,
                "stdout": f"Reused identical mzML search export from {cached}", "stderr": "",
            })
        else:
            run([executable, "analyze", "search-glycopeptide", str(database), str(processed), str(parameters.get("hypothesisId", 1)), "--output-path", str(result_db), "--export", "csv"], run_work, logs, timeout)
            exported = find_export_csv(run_work)
            target = export_dir / exported.name
            shutil.copy2(exported, target)
            if input_hash:
                export_by_hash[input_hash] = target
        rows = normalize_glycresoft_csv(target, lot_id)
        (reference_rows if role == "reference" else candidate_rows).extend(rows)
    comparison = compare_multi_lot(reference_rows, candidate_rows, min_reference_lots=int(parameters.get("minReferenceLots", 3)), interval_method=parameters.get("intervalMethod", "observed-range"))
    return {"moduleCode": "GLYCO", "status": "completed", "professionalEngine": "GlycReSoft → glypy", "comparison": comparison, "decision": None}


def normalize_glycresoft_csv(path: Path, lot_id: str) -> list[dict[str, Any]]:
    from glypy.structure.glycan_composition import GlycanComposition
    import re

    with path.open(encoding="utf-8-sig", newline="") as handle:
        source = list(csv.DictReader(handle))
    aggregated: dict[str, float] = {}
    for row in source:
        composition_key = next((key for key in row if "composition" in key.lower()), None)
        abundance_key = next((key for key in row if key.lower() in {"abundance", "intensity", "area", "total_signal"}), None)
        raw = row.get(composition_key, "") if composition_key else ""
        # Glycopeptide CSV exports encode the glycan composition at the end of
        # the `glycopeptide` field instead of exposing a dedicated composition
        # column (e.g. PEPTIDE{Hex:5; HexNAc:4}).
        if not raw and row.get("glycopeptide"):
            match = re.search(r"(\{[^{}]+\})\s*$", row["glycopeptide"])
            raw = match.group(1) if match else ""
        if not abundance_key or not raw:
            continue
        try:
            canonical = str(GlycanComposition.parse(raw))
        except Exception:
            canonical = normalize_glycan_composition(raw)
        aggregated[canonical] = aggregated.get(canonical, 0.0) + max(float(row[abundance_key]), 0.0)
    if not aggregated:
        raise ValueError("GlycReSoft CSV lacks usable glycan-composition/abundance rows")
    total = sum(aggregated.values())
    if total <= 0:
        raise ValueError("GlycReSoft CSV glycan abundance total is zero")
    return [
        {"lot_id": lot_id, "feature": feature, "value": 100 * value / total}
        for feature, value in sorted(aggregated.items())
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    root = args.manifest.parent
    out, work = root / "outputs", root / "work"
    module_code = manifest["moduleCode"]
    unit = UNITS[module_code]
    grouped = files_by_role(manifest, root)
    parameters = manifest.get("parameters", {})
    logs: list[dict[str, Any]] = []
    timeout = int(parameters.get("engineTimeoutSeconds", 7200))
    missing = [role for role in unit.required_roles if not grouped.get(role)]
    if missing:
        raise ValueError(f"missing input roles: {', '.join(missing)}")
    if unit.pipeline == "metamorpheus-flashlfq-ptm":
        result = run_metamorpheus_ptm(module_code, grouped, out, work, parameters, logs, timeout)
    elif unit.pipeline == "disulfide-crosslink":
        result = run_disulfide_pipeline(module_code, grouped, out, work, parameters, logs, timeout)
    elif unit.pipeline == "sage-free-thiol-sites":
        result = first_batch("SEQ-02", grouped, out, work, parameters, logs, timeout)
        result.update({
            "moduleCode": "COV-01", "status": "quality-blocked",
            "professionalEngine": "OpenMS + Sage optional free-thiol site screen",
            "qualityGate": {"passed": False, "message": "已完成Sage技术搜库，但IAM/NEM位点修饰定位与相对丰度方法尚未验证；不得把普通序列检索误报为游离巯基位点鉴别完成。"},
        })
    elif unit.pipeline in {"glycan-hilic-fld", "glycan-dmb-fld"}:
        result = glycan_chromatography_batch(module_code, grouped, out, work, parameters, logs, timeout)
    elif unit.batch == 1:
        sequence_modes = {item["path"].suffix.lower() in {".csv", ".tsv"} for role in ("reference", "candidate") for item in grouped[role]}
        if module_code in {"SEQ-01", "SEQ-02"} and sequence_modes == {True}:
            result = sequence_table_batch(module_code, grouped, parameters)
        elif True in sequence_modes:
            raise ValueError("候选药与参照药输入形态不一致：肽段鉴定表不能与mzML混用")
        else:
            result = first_batch(module_code, grouped, out, work, parameters, logs, timeout)
    elif unit.batch == 2:
        result = second_batch(module_code, grouped, out, work, parameters, logs, timeout)
    else:
        result = third_batch(grouped, out, work, parameters, logs, timeout)
    (out / "command-log.json").write_text(json.dumps(logs, ensure_ascii=False, indent=2), encoding="utf-8")
    (out / "result.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"moduleCode": module_code, "status": result["status"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
