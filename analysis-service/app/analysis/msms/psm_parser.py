# -*- coding: utf-8 -*-
"""Parse Comet SQT output into structured PSM records."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class PeptideSpectrumMatch:
    rank: int
    scan: int
    precursor_mz: float
    xcorr: float
    expect: float
    num_matched_ions: int
    num_total_ions: int
    peptide_sequence: str
    is_decoy: bool


def _bare_sequence(comet_sequence: str) -> str:
    """Convert Comet flanking format ``K.PEPTIDE.L`` to ``PEPTIDE``."""
    text = comet_sequence.strip()
    if "." in text:
        parts = text.split(".")
        if len(parts) >= 2:
            return parts[1]
    return text


def _is_decoy_sequence(sequence: str) -> bool:
    upper = sequence.upper()
    return upper.startswith("DECOY_") or upper.startswith("REV_")


def parse_sqt(path: Path) -> list[PeptideSpectrumMatch]:
    """Parse a Comet ``*.sqt`` file."""
    if not path.is_file():
        raise FileNotFoundError(f"SQT file not found: {path.name}")

    matches: list[PeptideSpectrumMatch] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        if not line.startswith("M\t"):
            continue
        parts = line.split("\t")
        if len(parts) < 10:
            continue
        comet_sequence = parts[8]
        bare = _bare_sequence(comet_sequence)
        matches.append(
            PeptideSpectrumMatch(
                rank=int(parts[1]),
                scan=int(parts[2]),
                precursor_mz=float(parts[3]),
                xcorr=float(parts[4]),
                expect=float(parts[5]),
                num_matched_ions=int(parts[6]),
                num_total_ions=int(parts[7]),
                peptide_sequence=bare,
                is_decoy=_is_decoy_sequence(comet_sequence) or _is_decoy_sequence(bare),
            )
        )
    return matches
