"""Deterministic multi-lot PTM interval engine for the BioCompare pilot.

The engine reports interval conformity and data-integrity signals only. It must
not produce a biosimilarity conclusion.
"""

from __future__ import annotations

import csv
import hashlib
import math
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


HEADER_ALIASES = {
    "批号": "lot_id", "生产批号": "lot_id", "lot": "lot_id",
    "技术重复": "replicate_id", "重复编号": "replicate_id", "replicate": "replicate_id",
    "蛋白链": "protein_chain", "链": "protein_chain", "chain": "protein_chain",
    "氨基酸": "residue", "残基": "residue", "aa": "residue",
    "位点": "position", "位置": "position", "site_position": "position",
    "修饰类型": "modification", "修饰": "modification", "ptm": "modification",
    "定量值": "value_percent", "定量值(%)": "value_percent", "修饰比例": "value_percent",
    "修饰比例(%)": "value_percent", "value": "value_percent",
    "定量状态": "quant_status", "风险等级": "risk_level", "loq": "loq_percent",
    "loq(%)": "loq_percent", "鉴定q值": "identification_q_value",
    "定位概率": "localization_probability",
}
REQUIRED_COLUMNS = {"lot_id", "protein_chain", "residue", "position", "modification", "value_percent"}
RISK_ORDER = {"low": 1, "medium": 2, "high": 3}
RISK_ZH = {"低": "low", "中": "medium", "高": "high"}


class PTMInputError(ValueError):
    """Raised when an input table cannot be interpreted safely."""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _canonical_header(value: str) -> str:
    normalized = value.strip().lower().replace(" ", "_")
    return HEADER_ALIASES.get(value.strip(), HEADER_ALIASES.get(normalized, normalized))


def _optional_float(raw: str | None, field: str, row_number: int) -> float | None:
    if raw is None or not raw.strip():
        return None
    try:
        value = float(raw.strip().replace("%", ""))
    except ValueError as error:
        raise PTMInputError(f"第{row_number}行的{field}不是有效数字：{raw}") from error
    if not math.isfinite(value):
        raise PTMInputError(f"第{row_number}行的{field}不是有限数字")
    return value


def read_ptm_table(path: Path, role: str) -> list[dict[str, Any]]:
    delimiter = "\t" if path.suffix.lower() == ".tsv" else ","
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=delimiter)
        if not reader.fieldnames:
            raise PTMInputError(f"{role}文件没有表头")
        mapped_headers = {_canonical_header(name): name for name in reader.fieldnames}
        missing = sorted(REQUIRED_COLUMNS - set(mapped_headers))
        if missing:
            raise PTMInputError(f"{role}文件缺少必填列：{', '.join(missing)}")

        rows: list[dict[str, Any]] = []
        for row_number, raw in enumerate(reader, start=2):
            row = {_canonical_header(key): (value or "").strip() for key, value in raw.items() if key is not None}
            if not any(row.values()):
                continue
            lot_id = row.get("lot_id", "")
            chain = row.get("protein_chain", "")
            residue = row.get("residue", "").upper()
            modification = row.get("modification", "")
            if not all((lot_id, chain, residue, modification)):
                raise PTMInputError(f"第{row_number}行存在空的批号、蛋白链、氨基酸或修饰类型")
            try:
                position = int(float(row.get("position", "")))
            except ValueError as error:
                raise PTMInputError(f"第{row_number}行的位点不是有效整数：{row.get('position')}") from error
            value = _optional_float(row.get("value_percent"), "定量值", row_number)
            if value is None or not 0 <= value <= 100:
                raise PTMInputError(f"第{row_number}行的定量值必须在0至100%之间")
            loq = _optional_float(row.get("loq_percent"), "LOQ", row_number)
            q_value = _optional_float(row.get("identification_q_value"), "鉴定q值", row_number)
            localization = _optional_float(row.get("localization_probability"), "定位概率", row_number)
            if localization is not None and not 0 <= localization <= 1:
                raise PTMInputError(f"第{row_number}行的定位概率必须在0至1之间")
            risk_raw = row.get("risk_level", "medium").lower()
            risk = RISK_ZH.get(risk_raw, risk_raw if risk_raw in RISK_ORDER else "medium")
            quant_status = row.get("quant_status", "quantified").lower()
            quantifiable = quant_status not in {"below_loq", "not_detected", "低于loq", "未检出"} and (loq is None or value >= loq)
            quality_warnings: list[str] = []
            if q_value is not None and q_value > 0.01:
                quality_warnings.append("鉴定q值高于0.01")
            if localization is not None and localization < 0.75:
                quality_warnings.append("位点定位概率低于0.75")
            rows.append({
                "role": role, "lot_id": lot_id, "replicate_id": row.get("replicate_id") or "1",
                "protein_chain": chain, "residue": residue, "position": position,
                "modification": modification, "value_percent": value, "loq_percent": loq,
                "quantifiable": quantifiable, "risk_level": risk, "quality_warnings": quality_warnings,
            })
    if not rows:
        raise PTMInputError(f"{role}文件没有可读取的数据行")
    return rows


def _key(row: dict[str, Any]) -> tuple[str, str, int, str]:
    return row["protein_chain"], row["residue"], row["position"], row["modification"]


def _key_id(key: tuple[str, str, int, str]) -> str:
    return f"{key[0]}:{key[1]}{key[2]}:{key[3]}"


def _highest_risk(rows: list[dict[str, Any]]) -> str:
    return max((row["risk_level"] for row in rows), key=lambda value: RISK_ORDER.get(value, 2), default="medium")


def _aggregate_lots(rows: list[dict[str, Any]]) -> dict[tuple[str, str, int, str], list[dict[str, Any]]]:
    grouped: dict[tuple[tuple[str, str, int, str], str], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[(_key(row), row["lot_id"])].append(row)
    result: dict[tuple[str, str, int, str], list[dict[str, Any]]] = defaultdict(list)
    for (key, lot_id), replicates in grouped.items():
        quantifiable = [row for row in replicates if row["quantifiable"]]
        values = [row["value_percent"] for row in quantifiable]
        warnings = sorted({warning for row in replicates for warning in row["quality_warnings"]})
        result[key].append({
            "lotId": lot_id,
            "valuePercent": round(statistics.mean(values), 6) if values else None,
            "technicalReplicateCount": len(replicates),
            "quantifiable": bool(values),
            "qualityWarnings": warnings,
        })
    return result


def _build_interval(values: list[float], method: str) -> tuple[float, float, str | None]:
    note = None
    if method == "observed-range":
        lower, upper = min(values), max(values)
    elif method == "mean-3sd":
        mean = statistics.mean(values)
        deviation = statistics.stdev(values) if len(values) > 1 else 0
        lower, upper = mean - 3 * deviation, mean + 3 * deviation
    elif method == "robust-mad":
        median = statistics.median(values)
        mad = statistics.median(abs(value - median) for value in values)
        if mad == 0:
            lower, upper = min(values), max(values)
            note = "MAD为0，区间回退为观测范围"
        else:
            lower, upper = median - 3 * 1.4826 * mad, median + 3 * 1.4826 * mad
    else:
        raise PTMInputError(f"不支持的区间方法：{method}")
    return round(max(0, lower), 6), round(min(100, upper), 6), note


def analyze_ptm_files(reference_path: Path, candidate_path: Path, interval_method: str = "observed-range", min_reference_lots: int = 3) -> dict[str, Any]:
    if not 2 <= min_reference_lots <= 100:
        raise PTMInputError("项目最低参照药批次数必须在2至100之间")
    reference_rows = read_ptm_table(reference_path, "reference")
    candidate_rows = read_ptm_table(candidate_path, "candidate")
    reference = _aggregate_lots(reference_rows)
    candidate = _aggregate_lots(candidate_rows)
    all_reference_lots = sorted({row["lot_id"] for row in reference_rows})
    all_candidate_lots = sorted({row["lot_id"] for row in candidate_rows})
    integrity_warnings: list[dict[str, Any]] = []
    if len(all_reference_lots) == 1:
        integrity_warnings.append({"code": "single_reference_lot", "severity": "high", "message": "仅检测到1个独立参照药批次，不能构建多批参照药天然波动区间。"})
    elif len(all_reference_lots) < min_reference_lots:
        integrity_warnings.append({"code": "reference_lot_count_below_requirement", "severity": "high", "message": f"参照药仅有{len(all_reference_lots)}批，低于项目预设最低批次数{min_reference_lots}。"})

    analytes: list[dict[str, Any]] = []
    assessments_flat: list[dict[str, Any]] = []
    outside_count = within_count = indeterminate_count = 0
    novel_keys: set[tuple[str, str, int, str]] = set()
    all_keys = sorted(set(reference) | set(candidate), key=lambda item: (item[0], item[2], item[3]))
    for key in all_keys:
        ref_lots = reference.get(key, [])
        cand_lots = candidate.get(key, [])
        quant_ref = [lot for lot in ref_lots if lot["quantifiable"] and lot["valuePercent"] is not None]
        ref_values = [float(lot["valuePercent"]) for lot in quant_ref]
        observed_ref_lot_ids = {lot["lotId"] for lot in ref_lots}
        missing_lots = sorted(set(all_reference_lots) - observed_ref_lot_ids)
        if ref_lots and missing_lots:
            integrity_warnings.append({"code": "site_reference_lot_subset", "severity": "medium", "analyteId": _key_id(key), "message": f"该位点未覆盖全部参照药批次，缺少：{', '.join(missing_lots)}。"})
        sufficient = len(ref_values) >= min_reference_lots
        if ref_lots and not sufficient:
            integrity_warnings.append({"code": "site_quantifiable_reference_lots_below_requirement", "severity": "high", "analyteId": _key_id(key), "message": f"该位点仅有{len(ref_values)}个可定量参照药批次，低于项目预设最低批次数{min_reference_lots}，不构建区间。"})
        interval = None
        if sufficient:
            lower, upper, interval_note = _build_interval(ref_values, interval_method)
            interval = {"lowerPercent": lower, "upperPercent": upper, "method": interval_method, "note": interval_note}
        assessments: list[dict[str, Any]] = []
        for lot in cand_lots:
            value = lot["valuePercent"]
            if not lot["quantifiable"] or value is None:
                status, deviation = "indeterminate", None
                indeterminate_count += 1
            elif not ref_lots:
                status, deviation = "candidate_only_variant", None
                novel_keys.add(key)
            elif not sufficient or interval is None:
                status, deviation = "insufficient_reference", None
                indeterminate_count += 1
            elif value < interval["lowerPercent"]:
                status, deviation = "below_interval", round(interval["lowerPercent"] - value, 6)
                outside_count += 1
            elif value > interval["upperPercent"]:
                status, deviation = "above_interval", round(value - interval["upperPercent"], 6)
                outside_count += 1
            else:
                status, deviation = "within_interval", 0
                within_count += 1
            assessment = {"lotId": lot["lotId"], "valuePercent": value, "status": status, "deviationFromBoundaryPercent": deviation, "technicalReplicateCount": lot["technicalReplicateCount"], "qualityWarnings": lot["qualityWarnings"]}
            assessments.append(assessment)
            assessments_flat.append({"analyteId": _key_id(key), **assessment})
        combined_rows = [row for row in reference_rows + candidate_rows if _key(row) == key]
        risk = "high" if any(item["status"] == "candidate_only_variant" for item in assessments) else _highest_risk(combined_rows)
        candidate_values = [float(lot["valuePercent"]) for lot in cand_lots if lot["quantifiable"] and lot["valuePercent"] is not None]
        analytes.append({
            "analyteId": _key_id(key), "proteinChain": key[0], "residue": key[1], "position": key[2], "modification": key[3], "riskLevel": risk,
            "referenceLotCount": len(ref_values), "referenceLots": ref_lots, "referenceInterval": interval,
            "referenceMedianPercent": round(statistics.median(ref_values), 6) if ref_values else None,
            "candidateMedianPercent": round(statistics.median(candidate_values), 6) if candidate_values else None,
            "auxiliaryMedianDifferencePercent": round(statistics.median(candidate_values) - statistics.median(ref_values), 6) if candidate_values and ref_values else None,
            "candidateAssessments": assessments,
        })
    integrity_warnings = list({(warning["code"], warning.get("analyteId"), warning["message"]): warning for warning in integrity_warnings}.values())
    return {
        "engine": {"name": "BioCompare deterministic PTM interval engine", "version": "0.1.0"},
        "generatedAt": _now(), "intervalMethod": interval_method, "minReferenceLots": min_reference_lots,
        "inputs": {"reference": {"name": reference_path.name, "sha256": _sha256(reference_path), "lotCount": len(all_reference_lots)}, "candidate": {"name": candidate_path.name, "sha256": _sha256(candidate_path), "lotCount": len(all_candidate_lots)}},
        "summary": {"analyteCount": len(analytes), "referenceLotCount": len(all_reference_lots), "candidateLotCount": len(all_candidate_lots), "withinIntervalCount": within_count, "outsideIntervalCount": outside_count, "candidateOnlyVariantCount": len(novel_keys), "indeterminateCount": indeterminate_count, "integrityWarningCount": len(integrity_warnings)},
        "integrityWarnings": integrity_warnings, "analytes": analytes, "assessments": assessments_flat,
        "allowedStatuses": ["within_interval", "below_interval", "above_interval", "candidate_only_variant", "insufficient_reference", "indeterminate"],
        "disclaimer": "本结果仅客观标记修饰位点定量数据相对多批参照药区间的状态，不构成相似、不相似、批准或不批准结论。",
    }
