"""Isolated MetaMorpheus/FlashLFQ adapter for four PTM business modules."""

from __future__ import annotations

import csv
import os
import re
import shutil
import subprocess
from collections import defaultdict
from pathlib import Path
from typing import Any

from backend.calculation_units import compare_multi_lot
from scripts.sage_to_biocompare_ptm import read_fasta


VARIABLE_MODS = {
    "PTM-01": "Common Variable\tOxidation on M\t\tLess Common\tOxidation on W",
    "PTM-02": "Common Artifact\tDeamidation on N",
    "PTM-03": "Common Biological\tGlu to PyroGlu on Q\t\tCommon Artifact\tWater Loss on E",
    "PTM-04": "Common Variable\tOxidation on M",
}


def _execute(command: list[str], cwd: Path, logs: list[dict[str, Any]], timeout: int) -> None:
    completed = subprocess.run(command, cwd=str(cwd), capture_output=True, text=True, timeout=timeout, check=False)
    logs.append({"command": command, "returnCode": completed.returncode, "stdout": (completed.stdout or "")[-12000:], "stderr": (completed.stderr or "")[-12000:]})
    if completed.returncode:
        raise RuntimeError(f"MetaMorpheus exited {completed.returncode}: {(completed.stderr or completed.stdout or '')[-1800:]}")


def _configure_task(dotnet: str, command_dll: str, module_code: str, folder: Path, parameters: dict[str, Any], logs: list[dict[str, Any]], timeout: int) -> Path:
    folder = folder.resolve()
    folder.mkdir()
    _execute([dotnet, command_dll, "-g", "-o", str(folder)], folder.parent, logs, timeout)
    task = folder / "SearchTask.toml"
    if not task.is_file():
        raise RuntimeError("MetaMorpheus did not generate SearchTask.toml")
    text = task.read_text(encoding="utf-8-sig")
    text = re.sub(r'^ListOfModsVariable = ".*"$', f'ListOfModsVariable = "{VARIABLE_MODS[module_code]}"', text, flags=re.MULTILINE)
    text = re.sub(r"^MaxThreadsToUsePerFile = \d+$", f"MaxThreadsToUsePerFile = {int(parameters.get('threads', 4))}", text, flags=re.MULTILINE)
    text = re.sub(r"^QValueThreshold = .+$", f"QValueThreshold = {float(parameters.get('qValueThreshold', 0.01))}", text, flags=re.MULTILINE)
    task.write_text(text, encoding="utf-8")
    return task


def _read_tsv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle, delimiter="\t"))


def _mod_positions(full_sequence: str) -> dict[int, list[str]]:
    positions: dict[int, list[str]] = defaultdict(list)
    local = 0
    index = 0
    while index < len(full_sequence):
        char = full_sequence[index]
        if "A" <= char <= "Z":
            local += 1
            index += 1
        elif char == "[":
            end = full_sequence.find("]", index + 1)
            if end < 0:
                break
            positions[local].append(full_sequence[index + 1:end])
            index = end + 1
        else:
            index += 1
    return positions


def _accession_sequences(fasta_path: Path) -> dict[str, str]:
    sequences = read_fasta(fasta_path)
    expanded = dict(sequences)
    for accession, sequence in sequences.items():
        expanded.setdefault(accession.split("|")[0], sequence)
        parts = accession.split("|")
        if len(parts) > 1:
            expanded.setdefault(parts[1], sequence)
    return expanded


def _locate(accessions: str, peptide: str, sequences: dict[str, str]) -> tuple[str, int, int, int] | None:
    for accession in re.split(r"[|;]", accessions):
        sequence = sequences.get(accession.strip())
        if not sequence:
            continue
        start = sequence.find(peptide)
        if start >= 0:
            return accession.strip(), start + 1, start + len(peptide), len(sequence)
    for accession, sequence in sequences.items():
        start = sequence.find(peptide)
        if start >= 0:
            return accession, start + 1, start + len(peptide), len(sequence)
    return None


def _cohort_columns(rows: list[dict[str, str]], grouped: dict[str, list[dict[str, Any]]]) -> list[tuple[str, str, str]]:
    if not rows:
        return []
    available = {key.removeprefix("Intensity_").lower(): key for key in rows[0] if key.startswith("Intensity_")}
    columns = []
    for role in ("reference", "candidate"):
        for index, item in enumerate(grouped[role], 1):
            stem = Path(item["path"]).stem.lower()
            key = available.get(stem) or next((value for name, value in available.items() if stem in name or name in stem), None)
            if key:
                columns.append((role, str(item.get("lotId") or f"{'R' if role == 'reference' else 'C'}{index:02d}"), key))
    return columns


def _ptm_site_rows(module_code: str, peptide_rows: list[dict[str, str]], grouped: dict[str, list[dict[str, Any]]], sequences: dict[str, str]) -> list[dict[str, Any]]:
    columns = _cohort_columns(peptide_rows, grouped)
    totals: dict[tuple[str, str, str, int, str], float] = defaultdict(float)
    modified: dict[tuple[str, str, str, int, str], float] = defaultdict(float)
    residue_targets = {"PTM-01": {"M", "W"}, "PTM-02": {"N"}, "PTM-03": {"Q", "E"}}[module_code]
    modification_label = {"PTM-01": "Oxidation", "PTM-02": "Deamidation", "PTM-03": "N-terminal pyroGlu"}[module_code]
    for row in peptide_rows:
        base, full = row.get("Base Sequence", ""), row.get("Sequence", "")
        located = _locate(row.get("Protein Groups", ""), base, sequences)
        if not base or not located:
            continue
        accession, start, _, _ = located
        mods = _mod_positions(full)
        for local, residue in enumerate(base, 1):
            if residue not in residue_targets or (module_code == "PTM-03" and (local != 1 or start != 1)):
                continue
            absolute = start + local - 1
            names = mods.get(local, [])
            is_modified = any("Oxidation" in name for name in names) if module_code == "PTM-01" else any("Deamidation" in name for name in names) if module_code == "PTM-02" else any("PyroGlu" in name or "Water Loss" in name for name in names)
            for cohort, lot_id, intensity_key in columns:
                intensity = max(float(row.get(intensity_key) or 0), 0)
                key = cohort, lot_id, accession, absolute, residue
                totals[key] += intensity
                if is_modified:
                    modified[key] += intensity
    output = []
    for (cohort, lot_id, accession, position, residue), total in sorted(totals.items()):
        if total <= 0:
            continue
        value = 100 * modified[(cohort, lot_id, accession, position, residue)] / total
        output.append({
            "cohort": cohort, "lotId": lot_id, "accession": accession, "residue": residue, "position": position,
            "modification": modification_label, "relativeAbundancePercent": value,
            "hotspot": module_code == "PTM-01" and residue == "M" and position in {252, 428},
            "isoAspStatus": "not-distinguished-by-standard-HCD" if module_code == "PTM-02" else None,
            "massShiftDa": 15.994915 if module_code == "PTM-01" else 0.984016 if module_code == "PTM-02" else (-17.026549 if residue == "Q" else -18.010565),
        })
    return output


def _terminal_lys_rows(peptide_rows: list[dict[str, str]], grouped: dict[str, list[dict[str, Any]]], sequences: dict[str, str]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    columns = _cohort_columns(peptide_rows, grouped)
    counts: dict[tuple[str, str], dict[str, float]] = defaultdict(lambda: {"retained": 0.0, "clipped": 0.0})
    for row in peptide_rows:
        base = row.get("Base Sequence", "")
        located = _locate(row.get("Protein Groups", ""), base, sequences)
        if not base or not located:
            continue
        _, _, end, length = located
        for cohort, lot_id, intensity_key in columns:
            intensity = max(float(row.get(intensity_key) or 0), 0)
            if end == length and base.endswith("K"):
                counts[(cohort, lot_id)]["retained"] += intensity
            elif end == length - 1:
                counts[(cohort, lot_id)]["clipped"] += intensity
    rows = []
    for (cohort, lot_id), values in sorted(counts.items()):
        total = values["retained"] + values["clipped"]
        if total <= 0:
            continue
        retained = values["retained"] / total
        rows.append({"cohort": cohort, "lotId": lot_id, "retainedLysPeptidePercent": 100 * retained, "clippedLysPeptidePercent": 100 * (1 - retained), "inferred0KPercent": 100 * (1 - retained) ** 2, "inferred1KPercent": 200 * retained * (1 - retained), "inferred2KPercent": 100 * retained ** 2, "distributionBasis": "binomial inference from terminal peptide ratio"})
    return rows, {"status": "not-provided", "message": "未提供亚基/完整质量谱；0K/1K/2K为肽段比例推算，不能替代UniDec直接去卷积证据。", "citation": "Marty et al., Anal. Chem. 2015, DOI 10.1021/acs.analchem.5b00140"}


def run_metamorpheus_ptm(module_code: str, grouped: dict[str, list[dict[str, Any]]], out: Path, work: Path, parameters: dict[str, Any], logs: list[dict[str, Any]], timeout: int) -> dict[str, Any]:
    out, work = out.resolve(), work.resolve()
    dotnet = os.getenv("DOTNET_BIN") or shutil.which("dotnet")
    command_dll = os.getenv("METAMORPHEUS_CMD")
    if not dotnet or not command_dll or not Path(command_dll).is_file():
        raise RuntimeError("DOTNET_BIN/METAMORPHEUS_CMD未配置")
    task = _configure_task(dotnet, command_dll, module_code, work / "metamorpheus-task", parameters, logs, timeout)
    raw_out = out / "metamorpheus"
    raw_out.mkdir()
    spectra = [str(item["path"]) for role in ("reference", "candidate") for item in grouped[role]]
    _execute([dotnet, command_dll, "-t", str(task), "-d", str(grouped["fasta"][0]["path"]), "-s", *spectra, "-o", str(raw_out), "-v", "minimal"], work, logs, timeout)
    peptide_path = next(iter(raw_out.rglob("AllQuantifiedPeptides.tsv")), None)
    psm_path = next(iter(raw_out.rglob("AllPSMs.psmtsv")), None)
    if not psm_path:
        raise RuntimeError("MetaMorpheus completed without the native AllPSMs.psmtsv audit table")
    peptide_rows = _read_tsv(peptide_path) if peptide_path else []
    psm_rows = _read_tsv(psm_path)
    accepted_psms = [row for row in psm_rows if float(row.get("QValue") or 1) <= float(parameters.get("qValueThreshold", 0.01)) and row.get("Decoy/Contaminant/Target") == "T"]
    sequences = _accession_sequences(grouped["fasta"][0]["path"])
    if module_code == "PTM-04":
        terminal_rows, unidec = _terminal_lys_rows(peptide_rows, grouped, sequences)
        result_rows = terminal_rows
        interval_reference = [{"lot_id": row["lotId"], "feature": "C-terminal-Lys-retained", "value": row["retainedLysPeptidePercent"]} for row in terminal_rows if row["cohort"] == "reference"]
        interval_candidate = [{"lot_id": row["lotId"], "feature": "C-terminal-Lys-retained", "value": row["retainedLysPeptidePercent"]} for row in terminal_rows if row["cohort"] == "candidate"]
    else:
        result_rows = _ptm_site_rows(module_code, peptide_rows, grouped, sequences)
        unidec = {"status": "not-applicable"} if module_code not in {"PTM-03"} else {"status": "not-provided", "message": "未提供完整/亚基质量谱，无法执行UniDec去卷积质量偏移核对。", "citation": "Marty et al., Anal. Chem. 2015, DOI 10.1021/acs.analchem.5b00140"}
        interval_reference = [{"lot_id": row["lotId"], "feature": f"{row['accession']}:{row['residue']}{row['position']}:{row['modification']}", "value": row["relativeAbundancePercent"]} for row in result_rows if row["cohort"] == "reference"]
        interval_candidate = [{"lot_id": row["lotId"], "feature": f"{row['accession']}:{row['residue']}{row['position']}:{row['modification']}", "value": row["relativeAbundancePercent"]} for row in result_rows if row["cohort"] == "candidate"]
    comparison = compare_multi_lot(interval_reference, interval_candidate, min_reference_lots=int(parameters.get("minReferenceLots", 3)), interval_method=parameters.get("intervalMethod", "observed-range"))
    quality_passed = bool(result_rows) and bool(accepted_psms)
    warnings = []
    if not peptide_rows:
        warnings.append({"code": "NO_QUANTIFIED_PEPTIDES", "severity": "high", "message": "专业引擎已执行，但未形成FlashLFQ定量肽段表；任务保留为质量阻断，不生成PTM丰度结论。"})
    elif not result_rows:
        warnings.append({"code": "NO_TARGET_PTM_EVIDENCE", "severity": "high", "message": "1% FDR后未获得本项目目标修饰的可定量证据；任务保留为质量阻断。"})
    if module_code == "PTM-02":
        warnings.append({"code": "ISOASP_NOT_DISTINGUISHED", "severity": "high", "message": "常规HCD与+0.9840 Da脱酰胺证据不能单独区分Asp/isoAsp；需ETD/ECD、特异酶法或正交方法。"})
    if unidec.get("status") == "not-provided":
        warnings.append({"code": "UNIDEC_EVIDENCE_NOT_PROVIDED", "severity": "medium", "message": unidec["message"]})
    return {
        "moduleCode": module_code, "status": "completed" if quality_passed else "quality-blocked",
        "professionalEngine": "MetaMorpheus 1.1.7 + FlashLFQ (isolated subprocess) + Pyteomics 5",
        "siteRows": result_rows, "comparison": comparison, "qualityGate": {"passed": quality_passed, "acceptedPsmCount": len(accepted_psms), "quantifiedPeptideCount": len(peptide_rows), "message": "1% FDR后获得可定量PTM证据" if quality_passed else "1% FDR后未获得目标PTM可定量证据"},
        "warnings": warnings, "unidecEvidence": unidec,
        "isoAspEvidence": {"status": "not-distinguished" if module_code == "PTM-02" else "not-applicable"},
        "openSearchSlot": {"status": "reserved", "engine": "Sage", "phase": "二期意外修饰发现"},
        "decision": None, "disclaimer": "仅展示专业引擎证据、相对丰度和参照区间标记，不自动给出生物相似性结论。",
    }
