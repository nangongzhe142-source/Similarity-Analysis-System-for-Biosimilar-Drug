"""Convert Sage PSM TSV output into BioCompare PTM interval-engine tables.

The converter uses MS2 intensity as a technical abundance proxy.  It is a
plumbing-validation adapter, not a replacement for validated MAM XIC peak-area
integration and site-localization workflows.
"""

from __future__ import annotations

import argparse
import csv
import re
from collections import defaultdict
from pathlib import Path


TRACKED_MASSES = {
    -17.026549: "Pyroglutamate",
    0.984016: "Deamidation",
    15.994915: "Oxidation",
}
MOD_RE = re.compile(r"([A-Z])(?:\[([+-]?[0-9.]+)\])?")


def read_fasta(path: Path) -> dict[str, str]:
    sequences: dict[str, list[str]] = {}
    aliases: dict[str, str] = {}
    accession = ""
    with path.open(encoding="utf-8", errors="replace") as handle:
        for raw in handle:
            line = raw.strip()
            if line.startswith(">"):
                accession = line[1:].split()[0]
                sequences.setdefault(accession, [])
                parts = accession.split("|")
                if len(parts) >= 3:
                    aliases["|".join(parts[1:])] = accession
                    aliases[parts[1]] = accession
            elif accession and line:
                sequences[accession].append(line)
    joined = {key: "".join(value) for key, value in sequences.items()}
    for alias, target in aliases.items():
        joined.setdefault(alias, joined[target])
    return joined


def parse_peptide(peptide: str) -> tuple[str, list[tuple[int, str, str]]]:
    residues: list[str] = []
    modifications: list[tuple[int, str, str]] = []
    for match in MOD_RE.finditer(peptide):
        residue, mass_raw = match.groups()
        residues.append(residue)
        if mass_raw:
            mass = float(mass_raw)
            for target_mass, name in TRACKED_MASSES.items():
                if abs(mass - target_mass) <= 0.002:
                    modifications.append((len(residues), residue, name))
                    break
    return "".join(residues), modifications


def protein_sequence(proteins: str, sequences: dict[str, str], peptide: str) -> tuple[str, str, int] | None:
    for protein in proteins.split(";"):
        protein = protein.strip()
        sequence = sequences.get(protein)
        if not sequence:
            continue
        start = sequence.find(peptide)
        if start >= 0:
            return protein, sequence, start
    return None


def build_rows(tsv: Path, fasta: Path, q_threshold: float) -> dict[str, list[dict[str, object]]]:
    sequences = read_fasta(fasta)
    denominators: dict[tuple[str, str, str], float] = defaultdict(float)
    numerators: dict[tuple[str, str, int, str], float] = defaultdict(float)
    q_values: dict[tuple[str, str, int, str], list[float]] = defaultdict(list)
    parsed: list[tuple[dict[str, str], str, list[tuple[int, str, str]], str, int, float]] = []
    with tsv.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle, delimiter="\t"):
            if not row.get("psm_id") or row.get("label") != "1":
                continue
            q_value = float(row.get("spectrum_q") or 1)
            if q_value > q_threshold:
                continue
            clean, modifications = parse_peptide(row["peptide"])
            match = protein_sequence(row.get("proteins", ""), sequences, clean)
            if not match:
                continue
            protein, _, start = match
            intensity = max(float(row.get("ms2_intensity") or 0), 0.0)
            denominators[(row["filename"], protein, clean)] += intensity
            parsed.append((row, clean, modifications, protein, start, intensity))
    for row, clean, modifications, protein, start, intensity in parsed:
        for local_position, residue, modification in modifications:
            key = (row["filename"], protein, start + local_position, modification)
            numerators[key] += intensity
            q_values[key].append(float(row.get("spectrum_q") or 1))

    output: dict[str, list[dict[str, object]]] = defaultdict(list)
    for (run, protein, position, modification), numerator in sorted(numerators.items()):
        denominator_keys: set[tuple[str, str, str]] = set()
        for row, clean, modifications, row_protein, start, _ in parsed:
            if row["filename"] != run or row_protein != protein:
                continue
            if any(start + local == position and name == modification for local, _, name in modifications):
                denominator_keys.add((run, protein, clean))
        denominator = sum(denominators[key] for key in denominator_keys)
        if denominator <= 0:
            continue
        sequence = sequences[protein]
        residue = sequence[position - 1]
        output[run].append({
            "protein_chain": protein,
            "residue": residue,
            "position": position,
            "modification": modification,
            "value_percent": round(100 * numerator / denominator, 6),
            "identification_q_value": round(max(q_values[(run, protein, position, modification)]), 8),
            "risk_level": "medium",
            "quant_status": "quantified",
        })
    return output


def write_table(path: Path, run_rows: dict[str, list[dict[str, object]]], lots: list[tuple[str, str]]) -> None:
    fields = ["lot_id", "replicate_id", "protein_chain", "residue", "position", "modification", "value_percent", "identification_q_value", "risk_level", "quant_status"]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for lot_id, run in lots:
            for row in run_rows.get(run, []):
                writer.writerow({"lot_id": lot_id, "replicate_id": "1", **row})


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sage-tsv", type=Path, required=True)
    parser.add_argument("--fasta", type=Path, required=True)
    parser.add_argument("--reference-out", type=Path, required=True)
    parser.add_argument("--candidate-out", type=Path, required=True)
    parser.add_argument("--q-threshold", type=float, default=0.01)
    parser.add_argument("--candidate-run", default="BSA3.mzML")
    args = parser.parse_args()
    run_rows = build_rows(args.sage_tsv, args.fasta, args.q_threshold)
    reference_lots = [("R01", "BSA1.mzML"), ("R02", "BSA2.mzML"), ("R03", "BSA3.mzML")]
    write_table(args.reference_out, run_rows, reference_lots)
    write_table(args.candidate_out, run_rows, [("C01", args.candidate_run)])
    print({"runs": {run: len(rows) for run, rows in run_rows.items()}, "q_threshold": args.q_threshold})


if __name__ == "__main__":
    main()
