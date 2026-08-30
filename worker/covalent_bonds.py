"""Server-side adapters for BioCompare covalent-bond projects.

Kojak, xiSEARCH, OpenMS and Sage remain independent programs.  This module
only stages inputs, writes native configuration files, invokes CLIs and maps
their output into BioCompare's objective evidence contract.
"""

from __future__ import annotations

import csv
import json
import re
import shutil
import subprocess
from pathlib import Path
from typing import Any

from pyteomics import parser

from scripts.sage_to_biocompare_ptm import read_fasta


DISULFIDE_MASS = -2.01565


def _run(command: list[str], cwd: Path, logs: list[dict[str, Any]], timeout: int) -> None:
    completed = subprocess.run(command, cwd=str(cwd), capture_output=True, text=True, timeout=timeout, check=False)
    logs.append({"command": command, "returnCode": completed.returncode, "stdout": (completed.stdout or "")[-12000:], "stderr": (completed.stderr or "")[-12000:]})
    if completed.returncode:
        raise RuntimeError(f"外部程序退出码{completed.returncode}：{(completed.stderr or completed.stdout or '')[-1800:]}")


def theoretical_disulfide_peptides(fasta: Path, missed_cleavages: int = 3) -> list[dict[str, Any]]:
    """Generate Cys-bearing tryptic peptides and all chemically possible pairs."""
    sequences = read_fasta(fasta)
    peptides: list[dict[str, Any]] = []
    for accession, sequence in sequences.items():
        # read_fasta exposes aliases; retain only the canonical FASTA headers.
        if accession.count("|") == 1 or any(item["accession"] == accession for item in peptides):
            continue
        for peptide in sorted(parser.cleave(sequence, parser.expasy_rules["trypsin"], missed_cleavages=missed_cleavages)):
            start = sequence.find(peptide)
            if start < 0 or "C" not in peptide:
                continue
            for local in (index for index, residue in enumerate(peptide, 1) if residue == "C"):
                peptides.append({"accession": accession, "peptide": peptide, "start": start + 1, "end": start + len(peptide), "cysPosition": start + local})
    pairs: list[dict[str, Any]] = []
    for left_index, left in enumerate(peptides):
        for right in peptides[left_index:]:
            if left["accession"] == right["accession"] and left["cysPosition"] > right["cysPosition"]:
                continue
            pairs.append({
                "pairId": f"{left['accession']}:C{left['cysPosition']}--{right['accession']}:C{right['cysPosition']}",
                "protein1": left["accession"], "position1": left["cysPosition"], "peptide1": left["peptide"],
                "protein2": right["accession"], "position2": right["cysPosition"], "peptide2": right["peptide"],
                "linkMassDa": DISULFIDE_MASS,
            })
    return pairs


def _replace_setting(lines: list[str], key: str, value: str) -> list[str]:
    pattern = re.compile(rf"^\s*{re.escape(key)}\s*=")
    return [f"{key} = {value}" if pattern.match(line) else line for line in lines]


def write_kojak_config(template: Path, target: Path, data: Path, fasta: Path, output_dir: Path, threads: int) -> None:
    lines = template.read_text(encoding="utf-8", errors="replace").splitlines()
    for key, value in {
        "threads": str(threads), "MS_data_file": str(data), "database": str(fasta),
        "results_path": str(output_dir), "export_pepXML": "0", "export_percolator": "1",
        "max_miscleavages": "3", "decoy_filter": "DECOY 1",
        "max_mods_per_peptide": "1", "diff_mods_on_xl": "1",
    }.items():
        lines = _replace_setting(lines, key, value)
    # A non-reduced disulfide search must not impose carbamidomethylation on all Cys.
    lines = [f"# {line}" if re.match(r"^\s*fixed_modification\s*=\s*C\b", line) else line for line in lines]
    lines = [f"# {line}" if re.match(r"^\s*predefined_crosslink\s*=", line) else line for line in lines]
    insertion = next((index for index, line in enumerate(lines) if line.strip().startswith("predefined_crosslink")), 0) + 1
    lines.insert(insertion, f"cross_link = C C {DISULFIDE_MASS:.5f} DISULFIDE")
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_xi_config(java: Path, jar: Path, target: Path, work: Path, logs: list[dict[str, Any]], timeout: int, threads: int) -> None:
    _run([str(java), "-cp", str(jar), "rappsilber.applications.Xi", f"--exampleconfig={target}"], work, logs, timeout)
    lines = target.read_text(encoding="utf-8", errors="replace").splitlines()
    transformed: list[str] = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("crosslinker:") and not stripped.startswith("#"):
            transformed.append(f"# {line}")
        elif stripped.startswith("modification:fixed:") and "MODIFIED:C" in stripped:
            transformed.append(f"# {line}")
        elif stripped.startswith("modification:variable:") and "bs3" in stripped.lower():
            transformed.append(f"# {line}")
        elif stripped.startswith("UseCPUs:"):
            transformed.append(f"UseCPUs:{threads}")
        else:
            transformed.append(line)
    transformed.append(f"crosslinker:SymetricSingleAminoAcidRestrictedCrossLinker:Name:DISULFIDE;MASS:{DISULFIDE_MASS:.5f};LINKEDAMINOACIDS:C")
    target.write_text("\n".join(transformed) + "\n", encoding="utf-8")


def _read_delimited(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", errors="replace", newline="") as handle:
        sample = handle.read(4096); handle.seek(0)
        delimiter = "\t" if sample.count("\t") > sample.count(",") else ","
        return list(csv.DictReader(handle, delimiter=delimiter))


def _pick(row: dict[str, str], *needles: str) -> str:
    normalized = {re.sub(r"[^a-z0-9]", "", key.lower()): value for key, value in row.items() if isinstance(key, str)}
    for needle in needles:
        compact = re.sub(r"[^a-z0-9]", "", needle.lower())
        for key, value in normalized.items():
            if compact == key or compact in key:
                return value or ""
    return ""


def parse_crosslink_rows(path: Path, engine: str, cohort: str, lot_id: str, minimum_score: float) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for row in _read_delimited(path):
        protein1 = _pick(row, "protein1", "protein 1", "protein a")
        protein2 = _pick(row, "protein2", "protein 2", "protein b")
        peptide1 = _pick(row, "peptide1", "peptide 1", "peptide a")
        peptide2 = _pick(row, "peptide2", "peptide 2", "peptide b")
        position1 = _pick(row, "linkpos1", "link 1", "fromsite", "position1")
        position2 = _pick(row, "linkpos2", "link 2", "tosite", "position2")
        score_raw = _pick(row, "match score", "score", "xcorr")
        try: score = float(score_raw)
        except (TypeError, ValueError): score = 0.0
        if not protein1 or not protein2 or not peptide1 or not peptide2 or score < minimum_score:
            continue
        try: p1, p2 = int(float(position1)), int(float(position2))
        except (TypeError, ValueError): p1 = p2 = 0
        pair_id = "--".join(sorted((f"{protein1}:C{p1}", f"{protein2}:C{p2}")))
        output.append({"cohort": cohort, "lotId": lot_id, "engine": engine, "pairId": pair_id, "protein1": protein1, "position1": p1, "peptide1": peptide1, "protein2": protein2, "position2": p2, "peptide2": peptide2, "score": score})
    return output


def _expected_table(expected: list[dict[str, Any]], evidence: list[dict[str, Any]], cohort: str) -> list[dict[str, Any]]:
    rows = []
    for item in expected:
        pair = "--".join(sorted((f"{item['protein1']}:C{int(item['position1'])}", f"{item['protein2']}:C{int(item['position2'])}")))
        engines = sorted({row["engine"] for row in evidence if row["cohort"] == cohort and row["pairId"] == pair})
        rows.append({**item, "pairId": pair, "cohort": cohort, "observed": bool(engines), "engines": engines, "orthogonallyConfirmed": len(engines) >= 2})
    return rows


def run_disulfide_pipeline(module_code: str, grouped: dict[str, list[dict[str, Any]]], out: Path, work: Path, parameters: dict[str, Any], logs: list[dict[str, Any]], timeout: int) -> dict[str, Any]:
    kojak = Path(parameters.get("kojakBin") or __import__("os").environ.get("KOJAK_BIN", ""))
    java = Path(parameters.get("javaBin") or __import__("os").environ.get("JAVA_BIN", ""))
    xi = Path(parameters.get("xiSearchJar") or __import__("os").environ.get("XISEARCH_JAR", ""))
    openms = Path(__import__("os").environ.get("OPENMS_BIN_DIR", "")) / "FileConverter.exe"
    if not all(path.is_file() for path in (kojak, java, xi, openms)):
        raise RuntimeError("COV-02缺少KOJAK_BIN、JAVA_BIN、XISEARCH_JAR或OpenMS FileConverter")
    fasta = grouped["fasta"][0]["path"]
    theoretical = theoretical_disulfide_peptides(fasta, int(parameters.get("missedCleavages", 3)))
    with (out / "theoretical-disulfide-peptides.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(theoretical[0]) if theoretical else ["pairId"]); writer.writeheader(); writer.writerows(theoretical)
    all_evidence: list[dict[str, Any]] = []
    raw_outputs: list[str] = []
    for cohort in ("reference", "candidate"):
        for index, item in enumerate(grouped[cohort], 1):
            lot_id = str(item.get("lotId") or f"{'R' if cohort == 'reference' else 'C'}{index:02d}")
            run_dir = work / f"{cohort}-{index:03d}"; run_dir.mkdir()
            source = item["path"]
            mgf = run_dir / f"{source.stem}.mgf"
            kojak_input = source
            if source.suffix.lower() == ".mgf":
                shutil.copy2(source, mgf)
                kojak_input = run_dir / f"{source.stem}.mzML"
                _run([str(openms), "-in", str(mgf), "-out", str(kojak_input), "-no_progress"], run_dir, logs, timeout)
            else:
                _run([str(openms), "-in", str(source), "-out", str(mgf), "-no_progress"], run_dir, logs, timeout)
            koj_out = out / "kojak" / f"{cohort}-{index:03d}"; koj_out.mkdir(parents=True)
            koj_conf = run_dir / "kojak-disulfide.conf"
            write_kojak_config(kojak.with_name("kojak_default_params.conf"), koj_conf, kojak_input, fasta, koj_out, int(parameters.get("threads", 4)))
            _run([str(kojak), str(koj_conf)], run_dir, logs, timeout)
            koj_tables = sorted(path for path in koj_out.rglob("*") if path.is_file() and path.suffix.lower() in {".txt", ".tsv", ".csv"})
            for table in koj_tables:
                all_evidence.extend(parse_crosslink_rows(table, "Kojak", cohort, lot_id, float(parameters.get("kojakMinScore", 0.1))))
                raw_outputs.append(str(table.relative_to(out)))
            xi_out = out / "xisearch" / f"{cohort}-{index:03d}.csv"; xi_out.parent.mkdir(parents=True, exist_ok=True)
            xi_conf = run_dir / "xisearch-disulfide.conf"
            write_xi_config(java, xi, xi_conf, run_dir, logs, timeout, int(parameters.get("threads", 4)))
            _run([str(java), "-Xmx4G", "-cp", str(xi), "rappsilber.applications.Xi", f"--config={xi_conf}", f"--peaks={mgf}", f"--fasta={fasta}", f"--output={xi_out}", "--locale=en"], run_dir, logs, timeout)
            if xi_out.is_file():
                all_evidence.extend(parse_crosslink_rows(xi_out, "xiSEARCH", cohort, lot_id, float(parameters.get("xiMinScore", 0.0))))
                raw_outputs.append(str(xi_out.relative_to(out)))
    expected = parameters.get("expectedDisulfides") or []
    expected_rows = _expected_table(expected, all_evidence, "reference") + _expected_table(expected, all_evidence, "candidate") if expected else []
    observed_pairs = {row["pairId"] for row in all_evidence}
    expected_pairs = {row["pairId"] for row in expected_rows}
    unexpected = [row for row in all_evidence if row["pairId"] not in expected_pairs] if expected else all_evidence
    orthogonal = sorted(pair for pair in observed_pairs if {row["engine"] for row in all_evidence if row["pairId"] == pair} == {"Kojak", "xiSEARCH"})
    quality_messages = []
    if not expected: quality_messages.append("未提供品种专属expectedDisulfides配置，不能计算预期连接覆盖率。")
    if not all_evidence: quality_messages.append("两个专业引擎均未产生满足解析/分数阈值的连接肽证据。")
    if all_evidence and not orthogonal: quality_messages.append("尚无Kojak与xiSEARCH一致支持的连接位点。")
    result = {
        "moduleCode": module_code, "status": "quality-blocked" if quality_messages else "completed",
        "professionalEngine": "OpenMS FileConverter → Kojak 2.1.0 + xiSEARCH 1.8.13；Pyteomics理论酶切",
        "theoreticalPairCount": len(theoretical), "expectedCoverage": expected_rows,
        "identifiedLinks": all_evidence, "orthogonalPairIds": orthogonal, "unexpectedLinks": unexpected,
        "comparisonTable": expected_rows, "rawEngineOutputs": raw_outputs,
        "qualityGate": {"passed": not quality_messages, "messages": quality_messages, "note": "搜索程序退出成功不等同于二硫键确认；结果需结合FDR/谱图人工复核。"},
        "decision": None, "disclaimer": "仅报告专业引擎识别证据和客观差异，不自动给出生物相似性结论。",
    }
    (out / "disulfide-comparison.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return result


def calculate_ellman(payload: dict[str, Any]) -> dict[str, Any]:
    absorbance = float(payload["absorbance412"]); blank = float(payload.get("blankAbsorbance412", 0))
    dilution = float(payload.get("dilutionFactor", 1)); concentration = float(payload["proteinConcentrationMgMl"])
    volume_ml = float(payload.get("volumeMl", 1)); path_cm = float(payload.get("pathLengthCm", 1))
    molecular_weight = float(payload.get("proteinMolecularWeightDa", 150000)); epsilon = float(payload.get("epsilonTnb", 14150))
    if min(dilution, concentration, volume_ml, path_cm, molecular_weight, epsilon) <= 0 or absorbance < blank:
        raise ValueError("吸光度、浓度、体积、光程、分子量和消光系数必须满足物理有效范围")
    corrected = absorbance - blank
    thiol_molar = corrected * dilution / (epsilon * path_cm)
    protein_molar = concentration / molecular_weight  # mg/mL is numerically g/L
    ratio = thiol_molar / protein_molar
    threshold = payload.get("riskThresholdMolShPerMolProtein")
    hmw_percent = payload.get("hmwPercent")
    warnings: list[dict[str, Any]] = []
    if threshold is not None and ratio > float(threshold):
        warnings.append({
            "code": "FREE_THIOL_ABOVE_CONFIGURED_LINE",
            "severity": "high",
            "message": "游离巯基结果高于项目配置预警线；请结合错误折叠、二硫键交换及聚集风险复核。",
        })
    if hmw_percent is not None:
        warnings.append({
            "code": "HMW_CONTEXT_LINKED",
            "severity": "medium" if warnings else "low",
            "message": f"已关联纯度模块 HMW={float(hmw_percent):.4g}%；该值仅作为风险解释背景，不参与自动结论。",
        })
    return {
        "correctedAbsorbance412": corrected, "thiolConcentrationMolL": thiol_molar,
        "proteinConcentrationMolL": protein_molar, "molShPerMolProtein": ratio,
        "audit": {"dilutionFactor": dilution, "volumeMl": volume_ml, "pathLengthCm": path_cm, "proteinMolecularWeightDa": molecular_weight, "epsilonTnb": epsilon},
        "formula": "(A412-Ablank)×dilution×MW /(epsilon×path×protein concentration[g/L])",
        "riskThresholdMolShPerMolProtein": threshold, "hmwPercent": hmw_percent, "warnings": warnings,
        "decision": None, "disclaimer": "计算值仅作客观结果展示；风险阈值及相似性结论须由审评人员结合方法学和批次数据判断。",
    }
