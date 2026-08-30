"""Pyteomics helpers for sequence-oriented BioCompare calculation units.

OpenMS/Sage remains responsible for professional spectrum search and FDR.  The
functions here only digest the supplied FASTA, extract narrow MS1 ion traces,
and map accepted peptide evidence back to protein residue coordinates.
"""

from __future__ import annotations

import csv
import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

import numpy as np
from pyteomics import mass, mzml, parser

from scripts.sage_to_biocompare_ptm import read_fasta


def _run_role(filename: str) -> tuple[str, str]:
    name = Path(filename).name
    lower = name.lower()
    if lower.startswith("reference-"):
        return "reference", Path(name).stem
    if lower.startswith("candidate-"):
        return "candidate", Path(name).stem
    return "unknown", Path(name).stem


def digest_fasta(fasta_path: Path, *, missed_cleavages: int = 1, min_length: int = 6, max_length: int = 45) -> list[dict[str, Any]]:
    peptides: list[dict[str, Any]] = []
    for accession, sequence in read_fasta(fasta_path).items():
        for peptide in sorted(parser.cleave(sequence, parser.expasy_rules["trypsin"], missed_cleavages=missed_cleavages)):
            if not min_length <= len(peptide) <= max_length:
                continue
            start = sequence.find(peptide)
            while start >= 0:
                peptides.append({
                    "accession": accession,
                    "peptide": peptide,
                    "start": start + 1,
                    "end": start + len(peptide),
                    "neutralMass": float(mass.fast_mass(peptide)),
                })
                start = sequence.find(peptide, start + 1)
    return peptides


def _scan_time(spec: dict[str, Any]) -> float | None:
    try:
        return float(spec["scanList"]["scan"][0]["scan start time"])
    except (KeyError, IndexError, TypeError, ValueError):
        return None


def extract_ms1_xic(
    mzml_paths: Iterable[Path | tuple[str, Path]],
    fasta_path: Path,
    *,
    ppm_tolerance: float = 10.0,
    charges: tuple[int, ...] = (2, 3, 4),
    min_scans: int = 2,
    min_intensity: float = 0.0,
) -> dict[str, Any]:
    theoretical = digest_fasta(fasta_path)
    if not theoretical:
        raise ValueError("FASTA经胰蛋白酶规则消化后没有可用理论肽段")
    targets: list[dict[str, Any]] = []
    for peptide in theoretical:
        for charge in charges:
            targets.append({**peptide, "charge": charge, "mz": float(mass.calculate_mass(sequence=peptide["peptide"], charge=charge))})

    evidence: list[dict[str, Any]] = []
    covered: dict[tuple[str, str], set[int]] = defaultdict(set)
    run_metrics: list[dict[str, Any]] = []
    sequences = read_fasta(fasta_path)
    role_counts: dict[str, int] = defaultdict(int)
    for source in mzml_paths:
        if isinstance(source, tuple):
            cohort, path = source
            role_counts[cohort] += 1
            run = f"{cohort}-{role_counts[cohort]:03d}"
        else:
            path = source
            cohort, run = _run_role(path.name)
        accumulators = [{"scanCount": 0, "xicArea": 0.0, "maxIntensity": 0.0, "firstRt": None, "lastRt": None} for _ in targets]
        ms1_count = 0
        with mzml.MzML(str(path), use_index=True) as reader:
            for spectrum in reader:
                if int(spectrum.get("ms level", 0)) != 1:
                    continue
                mz_array = np.asarray(spectrum.get("m/z array", []), dtype=float)
                intensity_array = np.asarray(spectrum.get("intensity array", []), dtype=float)
                if not len(mz_array) or len(mz_array) != len(intensity_array):
                    continue
                ms1_count += 1
                rt = _scan_time(spectrum)
                for index, target in enumerate(targets):
                    expected = target["mz"]
                    delta = expected * ppm_tolerance / 1_000_000
                    left, right = np.searchsorted(mz_array, (expected - delta, expected + delta))
                    if right <= left:
                        continue
                    signal = float(np.max(intensity_array[left:right]))
                    if signal <= min_intensity:
                        continue
                    item = accumulators[index]
                    item["scanCount"] += 1
                    item["xicArea"] += signal
                    item["maxIntensity"] = max(item["maxIntensity"], signal)
                    if rt is not None:
                        item["firstRt"] = rt if item["firstRt"] is None else min(item["firstRt"], rt)
                        item["lastRt"] = rt if item["lastRt"] is None else max(item["lastRt"], rt)
        best_by_peptide: dict[tuple[str, str, int, int], dict[str, Any]] = {}
        for target, item in zip(targets, accumulators, strict=True):
            if item["scanCount"] < min_scans:
                continue
            key = (target["accession"], target["peptide"], target["start"], target["end"])
            row = {"cohort": cohort, "run": run, **target, **item, "ppmTolerance": ppm_tolerance}
            current = best_by_peptide.get(key)
            if current is None or row["xicArea"] > current["xicArea"]:
                best_by_peptide[key] = row
        for row in best_by_peptide.values():
            evidence.append(row)
            covered[(run, row["accession"])].update(range(row["start"], row["end"] + 1))
        for accession, sequence in sequences.items():
            positions = covered[(run, accession)]
            run_metrics.append({
                "cohort": cohort,
                "run": run,
                "accession": accession,
                "sequenceLength": len(sequence),
                "coveredResidues": len(positions),
                "coveragePercent": round(100 * len(positions) / len(sequence), 6) if sequence else 0.0,
                "ms1SpectrumCount": ms1_count,
                "observedPeptideCount": sum(item["run"] == run and item["accession"] == accession for item in evidence),
            })
    return {
        "metrics": run_metrics,
        "evidence": evidence,
        "sequenceCoverage": build_sequence_coverage(sequences, evidence),
        "theoreticalPeptideCount": len(theoretical),
    }


def build_sequence_coverage(sequences: dict[str, str], evidence: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    evidence = list(evidence)
    positions: dict[tuple[str, str], set[int]] = defaultdict(set)
    for item in evidence:
        cohort = str(item.get("cohort", "unknown"))
        accession = str(item["accession"])
        positions[(cohort, accession)].update(range(int(item["start"]), int(item["end"]) + 1))
    observed_accessions = {str(item["accession"]) for item in evidence}
    # Antibody FASTA files normally contain only heavy/light chains, so retain
    # them even when a strict quality gate yields no PSM.  For search databases
    # with many proteins, return only accessions carrying accepted evidence to
    # prevent multi-megabyte sequence payloads and accidental database export.
    selected_accessions = set(sequences) if len(sequences) <= 10 else observed_accessions
    payload = []
    for accession, sequence in sequences.items():
        if accession not in selected_accessions:
            continue
        reference = positions[("reference", accession)]
        candidate = positions[("candidate", accession)]
        payload.append({
            "accession": accession,
            "sequence": sequence,
            "referenceCoveredPositions": sorted(reference),
            "candidateCoveredPositions": sorted(candidate),
            "bothCoveredPositions": sorted(reference & candidate),
            "referenceOnlyPositions": sorted(reference - candidate),
            "candidateOnlyPositions": sorted(candidate - reference),
        })
    return payload


def comparison_table(metrics: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
    for item in metrics:
        grouped[str(item["accession"])][str(item["cohort"])].append(float(item["coveragePercent"]))
    rows = []
    for accession, cohorts in sorted(grouped.items()):
        reference = cohorts.get("reference", [])
        candidate = cohorts.get("candidate", [])
        reference_mean = sum(reference) / len(reference) if reference else None
        candidate_mean = sum(candidate) / len(candidate) if candidate else None
        rows.append({
            "accession": accession,
            "referenceCoveragePercent": round(reference_mean, 6) if reference_mean is not None else None,
            "candidateCoveragePercent": round(candidate_mean, 6) if candidate_mean is not None else None,
            "differencePercentagePoints": round(candidate_mean - reference_mean, 6) if reference_mean is not None and candidate_mean is not None else None,
            "referenceRunCount": len(reference),
            "candidateRunCount": len(candidate),
        })
    return rows


def write_xic_csv(path: Path, evidence: Iterable[dict[str, Any]]) -> None:
    rows = list(evidence)
    fields = ["cohort", "run", "accession", "peptide", "start", "end", "charge", "mz", "scanCount", "xicArea", "maxIntensity", "firstRt", "lastRt", "ppmTolerance"]
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def _table_header(fieldnames: list[str], aliases: set[str]) -> str | None:
    def key(value: str) -> str:
        return "".join(character for character in value.strip().lower() if character.isalnum() or "\u4e00" <= character <= "\u9fff")
    return next((name for name in fieldnames if key(name) in aliases), None)


def build_sequence_coverage_from_tables(
    module_code: str,
    files: Iterable[tuple[str, str, Path]],
    fasta_path: Path,
    *,
    q_value_threshold: float = 0.01,
) -> dict[str, Any]:
    """Map externally accepted peptide rows to FASTA without re-running spectra."""
    sequences = read_fasta(fasta_path)
    evidence: list[dict[str, Any]] = []
    warnings: list[dict[str, str]] = [{
        "code": "EXTERNAL_TABLE_INPUT", "severity": "medium",
        "message": "本结果来自外部导出的肽段鉴定表，未经本平台谱图级搜索与FDR重算；请确认来源与质控。",
    }]
    accepted_rows = 0
    runs: list[tuple[str, str]] = []
    for cohort, run, path in files:
        runs.append((cohort, run))
        delimiter = "\t" if path.suffix.lower() == ".tsv" else ","
        with path.open(encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle, delimiter=delimiter)
            fieldnames = list(reader.fieldnames or [])
            accession_name = _table_header(fieldnames, {"accession", "protein", "proteins", "proteinaccession", "蛋白编号", "蛋白链"})
            peptide_name = _table_header(fieldnames, {"peptide", "peptidesequence", "sequence", "肽段", "肽段序列"})
            q_name = _table_header(fieldnames, {"qvalue", "spectrumq", "psmqvalue", "q值"})
            source_name = _table_header(fieldnames, {"sourcefile", "filename", "run", "源文件"})
            if not accession_name or not peptide_name:
                raise ValueError(f"{path.name}不是肽段鉴定表：至少需要accession和peptide_sequence列")
            if not q_name:
                warnings.append({"code": "Q_VALUE_MISSING", "severity": "medium", "message": f"{path.name}未提供q_value，已接收全部行；需人工确认上游FDR。"})
            for row_index, row in enumerate(reader, 2):
                raw_q = (row.get(q_name, "") if q_name else "").strip()
                if raw_q:
                    try:
                        if float(raw_q) > q_value_threshold:
                            continue
                    except ValueError as error:
                        raise ValueError(f"{path.name}第{row_index}行q_value不是数值") from error
                accepted_rows += 1
                accession = (row.get(accession_name) or "").strip().split(";")[0]
                raw_peptide = (row.get(peptide_name) or "").strip().upper()
                peptide = re.sub(r"\[[^\]]*\]|\([^)]*\)", "", raw_peptide)
                peptide = "".join(character for character in peptide if character in "ACDEFGHIKLMNPQRSTVWY")
                sequence = sequences.get(accession)
                if not sequence or not peptide:
                    continue
                start = sequence.find(peptide)
                if start < 0:
                    continue
                evidence.append({
                    "cohort": cohort, "run": run, "accession": accession, "peptide": peptide,
                    "start": start + 1, "end": start + len(peptide), "qValue": float(raw_q) if raw_q else None,
                    "sourceFile": (row.get(source_name) or path.name).strip() if source_name else path.name,
                    "evidenceType": "external-peptide-identification-table",
                })
    metrics = []
    for cohort, run in runs:
        for accession, sequence in sequences.items():
            positions: set[int] = set()
            run_evidence = [item for item in evidence if item["cohort"] == cohort and item["run"] == run and item["accession"] == accession]
            for item in run_evidence:
                positions.update(range(int(item["start"]), int(item["end"]) + 1))
            metrics.append({
                "cohort": cohort, "run": run, "accession": accession, "sequenceLength": len(sequence),
                "coveredResidues": len(positions), "coveragePercent": round(100 * len(positions) / len(sequence), 6) if sequence else 0.0,
                "observedPeptideCount": len(run_evidence),
            })
    return {
        "moduleCode": module_code, "status": "completed" if evidence else "quality-blocked",
        "professionalEngine": "外部肽段鉴定表通道（未经本平台谱图重算）",
        "processingBoundary": "平台按q_value阈值读取外部肽段表并映射FASTA覆盖率；未执行谱图搜索或谱图级FDR重算。",
        "metrics": metrics, "comparisonTable": comparison_table(metrics),
        "sequenceCoverage": build_sequence_coverage(sequences, evidence), "evidence": evidence, "warnings": warnings,
        "qualityGate": {"passed": bool(evidence), "qValueThreshold": q_value_threshold, "acceptedPsmCount": accepted_rows, "mappedPeptideCount": len(evidence), "message": "外部结果表通道" if evidence else "外部表中没有可映射到FASTA的合格肽段"},
        "decision": None, "disclaimer": "仅客观展示外部肽段证据与序列覆盖率，不自动给出生物相似性结论。",
    }
