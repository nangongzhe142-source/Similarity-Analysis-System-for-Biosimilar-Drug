"""Business calculation-unit registry and deterministic result adapters.

Professional tools own spectrum/chromatogram/glycopeptide computation.  This
module only maps their files into BioCompare's objective, multi-lot contract.
It deliberately never emits a final biosimilarity decision.
"""

from __future__ import annotations

import csv
import json
import math
import statistics
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable

from scripts.sage_to_biocompare_ptm import parse_peptide, read_fasta
from worker.sequence_evidence import build_sequence_coverage, comparison_table


@dataclass(frozen=True)
class CalculationUnit:
    code: str
    name: str
    batch: int
    pipeline: str
    accepted_suffixes: tuple[str, ...]
    required_roles: tuple[str, ...]


UNITS: dict[str, CalculationUnit] = {
    "SEQ-01": CalculationUnit("SEQ-01", "MS1肽质量覆盖率", 1, "openms-pyteomics-xic", (".mzml", ".csv", ".tsv", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "SEQ-02": CalculationUnit("SEQ-02", "肽图序列覆盖率", 1, "openms-sage", (".mzml", ".csv", ".tsv", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "SEQ-03": CalculationUnit("SEQ-03", "CDR特征肽确认", 1, "openms-sage", (".mzml", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "SEQ-04": CalculationUnit("SEQ-04", "末端序列异质性", 1, "openms-sage", (".mzml", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "COV-01": CalculationUnit("COV-01", "游离巯基位点鉴别", 1, "sage-free-thiol-sites", (".mzml", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "COV-02": CalculationUnit("COV-02", "二硫键连接图谱", 1, "disulfide-crosslink", (".mzml", ".mgf", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "PTM-01": CalculationUnit("PTM-01", "氧化", 1, "metamorpheus-flashlfq-ptm", (".mzml", ".raw", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "PTM-02": CalculationUnit("PTM-02", "Asn脱酰胺及异构化", 1, "metamorpheus-flashlfq-ptm", (".mzml", ".raw", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "PTM-03": CalculationUnit("PTM-03", "N端焦谷氨酸", 1, "metamorpheus-flashlfq-ptm", (".mzml", ".raw", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "PTM-04": CalculationUnit("PTM-04", "重链C端赖氨酸", 1, "metamorpheus-flashlfq-ptm", (".mzml", ".raw", ".fasta", ".fa"), ("reference", "candidate", "fasta")),
    "PUR-01": CalculationUnit("PUR-01", "高分子量物质", 2, "chromconverter-happytools-hplc", (".csv", ".txt", ".arw", ".ch", ".cdf", ".mzml"), ("reference", "candidate")),
    "PUR-02": CalculationUnit("PUR-02", "SEC主峰", 2, "chromconverter-happytools-hplc", (".csv", ".txt", ".arw", ".ch", ".cdf", ".mzml"), ("reference", "candidate")),
    "PUR-03": CalculationUnit("PUR-03", "低分子量物质", 2, "chromconverter-happytools-hplc", (".csv", ".txt", ".arw", ".ch", ".cdf", ".mzml"), ("reference", "candidate")),
    "PUR-04": CalculationUnit("PUR-04", "还原CE-SDS重链+轻链纯度", 2, "chromconverter-happytools-hplc", (".csv", ".txt", ".asc", ".ascii"), ("reference", "candidate")),
    "PUR-05": CalculationUnit("PUR-05", "还原CE-SDS片段/杂质", 2, "chromconverter-happytools-hplc", (".csv", ".txt", ".asc", ".ascii"), ("reference", "candidate")),
    "PUR-06": CalculationUnit("PUR-06", "非还原CE-SDS主峰", 2, "chromconverter-happytools-hplc", (".csv", ".txt", ".asc", ".ascii"), ("reference", "candidate")),
    "PUR-07": CalculationUnit("PUR-07", "非还原CE-SDS片段/杂质", 2, "chromconverter-happytools-hplc", (".csv", ".txt", ".asc", ".ascii"), ("reference", "candidate")),
    "IEX-ACIDIC": CalculationUnit("IEX-ACIDIC", "酸性电荷变异体", 2, "chromconverter-hplc", (".csv", ".txt", ".arw", ".ch", ".cdf", ".mzml"), ("reference", "candidate")),
    "IEX-MAIN": CalculationUnit("IEX-MAIN", "主电荷峰", 2, "chromconverter-hplc", (".csv", ".txt", ".arw", ".ch", ".cdf", ".mzml"), ("reference", "candidate")),
    "IEX-BASIC": CalculationUnit("IEX-BASIC", "碱性电荷变异体", 2, "chromconverter-hplc", (".csv", ".txt", ".arw", ".ch", ".cdf", ".mzml"), ("reference", "candidate")),
    "GLYCO": CalculationUnit("GLYCO", "糖基化/糖肽分析", 3, "glycresoft-glypy", (".mzml", ".mzml.gz", ".fasta", ".fa", ".txt", ".csv"), ("reference", "candidate", "fasta", "glycan_source")),
    "GLY-02": CalculationUnit("GLY-02", "G0F糖型比例", 2, "glycan-hilic-fld", (".csv", ".txt", ".arw", ".ch", ".cdf"), ("reference", "candidate")),
    "GLY-03": CalculationUnit("GLY-03", "G0糖型比例", 2, "glycan-hilic-fld", (".csv", ".txt", ".arw", ".ch", ".cdf"), ("reference", "candidate")),
    "GLY-04": CalculationUnit("GLY-04", "其他主要/次要N-糖型", 2, "glycan-hilic-fld", (".csv", ".txt", ".arw", ".ch", ".cdf"), ("reference", "candidate")),
    "GLY-05": CalculationUnit("GLY-05", "NGNA", 2, "glycan-dmb-fld", (".csv", ".txt", ".arw", ".ch", ".cdf"), ("reference", "candidate")),
    "GLY-06": CalculationUnit("GLY-06", "NANA", 2, "glycan-dmb-fld", (".csv", ".txt", ".arw", ".ch", ".cdf"), ("reference", "candidate")),
}


def unit_catalog() -> list[dict[str, Any]]:
    return [asdict(unit) for unit in UNITS.values()]


def _float(value: Any) -> float:
    return float(str(value).strip())


def compare_multi_lot(
    reference_rows: Iterable[dict[str, Any]],
    candidate_rows: Iterable[dict[str, Any]],
    *, feature_key: str = "feature", value_key: str = "value",
    lot_key: str = "lot_id", min_reference_lots: int = 3,
    interval_method: str = "observed-range",
) -> dict[str, Any]:
    """Construct reference-product natural ranges before marking candidates."""
    grouped: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    for row in reference_rows:
        grouped[str(row[feature_key])][str(row[lot_key])].append(_float(row[value_key]))
    candidate = list(candidate_rows)
    intervals: dict[str, dict[str, Any]] = {}
    for feature, lots in grouped.items():
        values = [statistics.fmean(replicates) for replicates in lots.values()]
        if len(values) < min_reference_lots:
            continue
        if interval_method == "mean-3sd" and len(values) >= 2:
            center, spread = statistics.fmean(values), statistics.stdev(values)
            lower, upper = center - 3 * spread, center + 3 * spread
        elif interval_method == "robust-mad" and len(values) >= 3:
            center = statistics.median(values)
            mad = statistics.median(abs(value - center) for value in values)
            lower, upper = center - 3 * 1.4826 * mad, center + 3 * 1.4826 * mad
        else:
            center, lower, upper = statistics.fmean(values), min(values), max(values)
        intervals[feature] = {
            "feature": feature, "referenceLotCount": len(values), "referenceValues": values,
            "center": center, "lower": lower, "upper": upper, "method": interval_method,
        }
    marks = []
    for row in candidate:
        feature, value = str(row[feature_key]), _float(row[value_key])
        interval = intervals.get(feature)
        if not interval:
            status = "new-variant" if feature not in grouped else "insufficient-reference"
            deviation = None
        else:
            status = "within" if interval["lower"] <= value <= interval["upper"] else "outside"
            deviation = value - interval["center"]
        marks.append({**row, "feature": feature, "value": value, "intervalStatus": status, "deviationFromReferenceCenter": deviation})
    counts = {name: sum(item["intervalStatus"] == name for item in marks) for name in ("within", "outside", "new-variant", "insufficient-reference")}
    return {
        "intervals": list(intervals.values()), "candidateMarks": marks, "summary": counts,
        "decision": None,
        "disclaimer": "仅客观标记候选药是否落入多批参照药区间，不自动给出生物相似性结论。",
    }


def _read_tsv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle, delimiter="\t"))


def _run_role(filename: str) -> tuple[str, str]:
    lower = Path(filename).name.lower()
    if lower.startswith("reference-"):
        return "reference", lower.split(".")[0]
    if lower.startswith("candidate-"):
        return "candidate", lower.split(".")[0]
    return "unknown", lower


def adapt_openms_sage(
    module_code: str, sage_tsv: Path, fasta_path: Path,
    reference_ptm: Path, candidate_ptm: Path, parameters: dict[str, Any],
) -> dict[str, Any]:
    rows = [row for row in _read_tsv(sage_tsv) if row.get("label") == "1" and _float(row.get("spectrum_q") or 1) <= _float(parameters.get("qValueThreshold", 0.01))]
    sequences = read_fasta(fasta_path)
    evidence: list[dict[str, Any]] = []
    coverage: dict[tuple[str, str], set[int]] = defaultdict(set)
    totals: dict[tuple[str, str], float] = defaultdict(float)
    for row in rows:
        clean, modifications = parse_peptide(row.get("peptide", ""))
        for accession in str(row.get("proteins", "")).split(";"):
            sequence = sequences.get(accession.strip())
            if not sequence:
                continue
            start = sequence.find(clean)
            if start < 0:
                continue
            role, run = _run_role(row.get("filename", ""))
            intensity = max(_float(row.get("ms2_intensity") or 0), 0)
            coverage[(run, accession)].update(range(start + 1, start + len(clean) + 1))
            totals[(run, accession)] += intensity
            evidence.append({
                "cohort": role, "run": run, "accession": accession, "peptide": clean,
                "start": start + 1, "end": start + len(clean), "intensity": intensity,
                "modifications": [{"localPosition": p, "residue": r, "name": n} for p, r, n in modifications],
            })
            break
    if module_code == "SEQ-02":
        metrics = []
        for (run, accession), positions in sorted(coverage.items()):
            sequence = sequences[accession]
            cohort, _ = _run_role(run + ".mzML")
            metrics.append({"cohort": cohort, "run": run, "accession": accession, "coveredResidues": len(positions), "sequenceLength": len(sequence), "coveragePercent": round(100 * len(positions) / len(sequence), 6)})
        result = _objective_result(
            module_code,
            metrics=metrics,
            evidence=evidence,
            comparisonTable=comparison_table(metrics),
            sequenceCoverage=build_sequence_coverage(sequences, evidence),
            qualityGate={
                "passed": bool(evidence),
                "qValueThreshold": _float(parameters.get("qValueThreshold", 0.01)),
                "acceptedPsmCount": len(rows),
                "mappedPeptideCount": len(evidence),
                "message": "1% FDR后已获得可映射序列肽段" if evidence else "1% FDR后未获得可映射序列肽段",
            },
        )
        if not evidence:
            result["status"] = "quality-blocked"
        return result
    if module_code == "SEQ-03":
        regions = parameters.get("cdrRegions") or []
        if not regions:
            return _blocked(module_code, "SEQ-03需要parametersJson.cdrRegions提供链、起止位点和名称；通用FASTA不能可靠自动推断CDR边界。")
        matches = []
        for region in regions:
            for item in evidence:
                if item["accession"] == region["accession"] and item["start"] <= int(region["end"]) and item["end"] >= int(region["start"]):
                    matches.append({**item, "region": region.get("name", "CDR"), "regionStart": int(region["start"]), "regionEnd": int(region["end"])})
        return _objective_result(module_code, metrics={"configuredRegionCount": len(regions), "matchingPeptideCount": len(matches)}, evidence=matches)
    if module_code in {"SEQ-04", "PTM-04"}:
        terminal = []
        for item in evidence:
            length = len(sequences[item["accession"]])
            if item["start"] == 1 or item["end"] == length:
                terminal.append({**item, "terminus": "N" if item["start"] == 1 else "C", "referenceTerminalResidue": sequences[item["accession"]][-1]})
        if module_code == "PTM-04" and not any(item["terminus"] == "C" and item["referenceTerminalResidue"] == "K" for item in terminal):
            return _blocked(module_code, "未获得带C端赖氨酸的末端肽证据；不能把搜索成功误报为C端赖氨酸定量完成。", evidence=terminal)
        if module_code == "SEQ-04" and not terminal:
            return _blocked(module_code, "1% FDR后未获得N端或C端肽证据；不能把搜库成功误报为末端序列确认完成。", metrics={"terminalEvidenceCount": 0}, evidence=[])
        return _objective_result(module_code, metrics={"terminalEvidenceCount": len(terminal)}, evidence=terminal)
    modification = {"PTM-01": "Oxidation", "PTM-03": "Pyroglutamate"}[module_code]
    reference_rows = _read_csv(reference_ptm)
    candidate_rows = _read_csv(candidate_ptm)
    reference_rows = [_ptm_interval_row(row) for row in reference_rows if row.get("modification") == modification]
    candidate_rows = [_ptm_interval_row(row) for row in candidate_rows if row.get("modification") == modification]
    if not reference_rows and not candidate_rows:
        return _blocked(module_code, f"严格FDR后未获得{modification}可定量位点。")
    comparison = compare_multi_lot(reference_rows, candidate_rows, min_reference_lots=int(parameters.get("minReferenceLots", 3)), interval_method=parameters.get("intervalMethod", "observed-range"))
    return _objective_result(module_code, comparison=comparison)


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _ptm_interval_row(row: dict[str, Any]) -> dict[str, Any]:
    return {"lot_id": row["lot_id"], "feature": f"{row['protein_chain']}:{row['residue']}{row['position']}:{row['modification']}", "value": _float(row["value_percent"]), **row}


def _objective_result(module_code: str, **payload: Any) -> dict[str, Any]:
    return {"moduleCode": module_code, "status": "completed", "decision": None, **payload, "disclaimer": "技术结果仅用于客观差异审阅，不自动给出生物相似性结论。"}


def _blocked(module_code: str, message: str, **payload: Any) -> dict[str, Any]:
    return {"moduleCode": module_code, "status": "quality-blocked", "qualityGate": {"passed": False, "message": message}, "decision": None, **payload}


def normalize_glycan_composition(value: str) -> str:
    """Canonical text form; glypy validation is performed in the worker."""
    tokens: dict[str, int] = defaultdict(int)
    import re
    for name, count in re.findall(r"([A-Za-z][A-Za-z0-9]*)(?:\((\d+)\)|:(\d+))?", value.replace(" ", "")):
        tokens[name] += int(count or 1)
    return "".join(f"{name}({tokens[name]})" for name in sorted(tokens))
