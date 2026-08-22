# -*- coding: utf-8 -*-
"""FASTA / sequence helpers for intact-mass and peptide analyses.

The generic loaders use the sequence the caller provided. BSA mature-chain
slicing (UniProt 25–607, 17 disulfides) exists only as an explicit demo-fixture
loader and is never applied to an arbitrary FASTA.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.analysis.intact_mass.constants import (
    BSA_CHAIN_END,
    BSA_CHAIN_START,
    BSA_DISULFIDE_COUNT,
    BSA_UNIPROT_ACCESSION,
)

UNIPROT_HEADER = re.compile(r"^(?:sp|tr)\|([A-Z0-9]+)\|", re.IGNORECASE)
UNKNOWN_ACCESSION = "unknown"
UNKNOWN_DISULFIDE = "unknown"


@dataclass(frozen=True)
class SequenceLoadOptions:
    """Task-level overrides. None means 'not supplied' and must not be invented."""

    accession: str | None = None
    disulfide_count: int | None = None
    mature_start: int | None = None
    mature_end: int | None = None
    record_index: int | None = None


@dataclass(frozen=True)
class ProteinSequence:
    accession: str
    header: str
    mature_sequence: str
    mature_length: int
    cysteine_count: int
    disulfide_count: int | None
    sequence_source: str
    source_path: str | None = None
    precursor_length: int | None = None
    mature_start: int | None = None
    mature_end: int | None = None

    @property
    def disulfide_known(self) -> bool:
        return self.disulfide_count is not None


def parse_fasta_records(text: str) -> list[tuple[str, str]]:
    records: list[tuple[str, str]] = []
    header: str | None = None
    chunks: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith(">"):
            if header is not None:
                sequence = re.sub(r"[^A-Za-z*]", "", "".join(chunks))
                if not sequence:
                    raise ValueError("FASTA sequence is empty")
                records.append((header, sequence))
            header = stripped
            chunks = []
            continue
        if header is None:
            raise ValueError("FASTA must begin with a header line")
        chunks.append(stripped)
    if header is not None:
        sequence = re.sub(r"[^A-Za-z*]", "", "".join(chunks))
        if not sequence:
            raise ValueError("FASTA sequence is empty")
        records.append((header, sequence))
    if not records:
        raise ValueError("FASTA sequence is empty")
    return records


def parse_fasta_text(text: str) -> tuple[str, str]:
    header, sequence = parse_fasta_records(text)[0]
    return header, sequence


def accession_from_header(header: str) -> str:
    text = header[1:].strip() if header.startswith(">") else header.strip()
    if not text:
        return UNKNOWN_ACCESSION
    match = UNIPROT_HEADER.match(text)
    if match:
        return match.group(1)
    token = text.split()[0]
    if "|" in token:
        parts = [part for part in token.split("|") if part]
        if len(parts) >= 2 and parts[0].lower() in {"sp", "tr"}:
            return parts[1]
        return parts[0]
    return token or UNKNOWN_ACCESSION


def sequence_options_from_parameters(parameters: dict[str, Any] | None) -> SequenceLoadOptions:
    params = parameters or {}
    accession = params.get("accession")
    disulfide_raw = params.get("disulfideCount", params.get("disulfide_count"))
    start_raw = params.get("matureStart", params.get("mature_start"))
    end_raw = params.get("matureEnd", params.get("mature_end"))
    index_raw = params.get("fastaRecordIndex", params.get("record_index"))
    disulfide_count: int | None
    if disulfide_raw is None or disulfide_raw == UNKNOWN_DISULFIDE:
        disulfide_count = None
    else:
        disulfide_count = int(disulfide_raw)
        if disulfide_count < 0:
            raise ValueError("disulfideCount must be >= 0 or omitted")
    return SequenceLoadOptions(
        accession=str(accession) if accession else None,
        disulfide_count=disulfide_count,
        mature_start=int(start_raw) if start_raw is not None else None,
        mature_end=int(end_raw) if end_raw is not None else None,
        record_index=int(index_raw) if index_raw is not None else None,
    )


def _apply_mature_range(sequence: str, start: int | None, end: int | None) -> tuple[str, int | None, int | None]:
    if start is None and end is None:
        return sequence, None, None
    if start is None or end is None:
        raise ValueError("matureStart and matureEnd must be supplied together")
    if start < 1 or end < start or end > len(sequence):
        raise ValueError(
            f"mature range {start}-{end} is outside the sequence length {len(sequence)}"
        )
    return sequence[start - 1 : end], start, end


def _build_protein(
    *,
    header: str,
    full_sequence: str,
    options: SequenceLoadOptions,
    sequence_source: str,
    source_path: str | None,
    default_accession: str | None = None,
    default_disulfide: int | None = None,
) -> ProteinSequence:
    mature, mature_start, mature_end = _apply_mature_range(
        full_sequence, options.mature_start, options.mature_end
    )
    accession = options.accession or default_accession or accession_from_header(header)
    disulfide_count = (
        options.disulfide_count if options.disulfide_count is not None else default_disulfide
    )
    return ProteinSequence(
        accession=accession or UNKNOWN_ACCESSION,
        header=header,
        mature_sequence=mature,
        mature_length=len(mature),
        cysteine_count=mature.count("C"),
        disulfide_count=disulfide_count,
        sequence_source=sequence_source,
        source_path=source_path,
        precursor_length=len(full_sequence),
        mature_start=mature_start,
        mature_end=mature_end,
    )


def load_fasta_file(path: Path, options: SequenceLoadOptions | None = None) -> ProteinSequence:
    load_options = options or SequenceLoadOptions()
    records = parse_fasta_records(path.read_text(encoding="utf-8"))
    if len(records) > 1 and load_options.record_index is None:
        raise ValueError(
            "FASTA contains multiple records; supply fastaRecordIndex rather than concatenating chains"
        )
    record_index = 0 if load_options.record_index is None else load_options.record_index
    if record_index < 0 or record_index >= len(records):
        raise ValueError(
            f"fastaRecordIndex {record_index} is outside 0..{len(records) - 1}"
        )
    header, full_sequence = records[record_index]
    return _build_protein(
        header=header,
        full_sequence=full_sequence,
        options=load_options,
        sequence_source="user-fasta",
        source_path=str(path),
    )


def load_protein_from_json(path: Path, options: SequenceLoadOptions | None = None) -> ProteinSequence:
    load_options = options or SequenceLoadOptions()
    record = json.loads(path.read_text(encoding="utf-8"))
    annotated = record.get("annotatedDisulfideCount")
    default_disulfide = int(annotated) if annotated is not None else None
    return _build_protein(
        header=str(record.get("header", "")),
        full_sequence=str(record["matureSequence"]),
        options=load_options,
        sequence_source="user-json",
        source_path=str(path),
        default_accession=str(record.get("accession") or UNKNOWN_ACCESSION),
        default_disulfide=default_disulfide,
    )


def default_bsa_fasta() -> Path:
    service_root = Path(__file__).resolve().parents[3]
    fixture = service_root / "fixtures" / "P02769.fasta"
    if not fixture.is_file():
        raise FileNotFoundError("BSA FASTA fixture missing at analysis-service/fixtures/P02769.fasta")
    return fixture


def load_bsa_demo_fixture(path: Path | None = None) -> ProteinSequence:
    """Load the project BSA fixture as the annotated mature chain.

    This is the only path allowed to apply UniProt 25–607 / 17 disulfides.
    Callers analysing user FASTA must use `load_fasta_file` instead.
    """
    fixture = path or default_bsa_fasta()
    header, full_sequence = parse_fasta_text(fixture.read_text(encoding="utf-8"))
    return _build_protein(
        header=header,
        full_sequence=full_sequence,
        options=SequenceLoadOptions(
            accession=BSA_UNIPROT_ACCESSION,
            disulfide_count=BSA_DISULFIDE_COUNT,
            mature_start=BSA_CHAIN_START,
            mature_end=BSA_CHAIN_END,
        ),
        sequence_source="bsa-demo-fixture",
        source_path=str(fixture),
        default_accession=BSA_UNIPROT_ACCESSION,
        default_disulfide=BSA_DISULFIDE_COUNT,
    )


def load_protein_file(path: Path, options: SequenceLoadOptions | None = None) -> ProteinSequence:
    suffix = path.suffix.lower()
    if suffix == ".json":
        return load_protein_from_json(path, options)
    if suffix in {".fasta", ".fa", ".faa"}:
        return load_fasta_file(path, options)
    raise ValueError(f"unsupported sequence format: {suffix or 'unknown'}")
