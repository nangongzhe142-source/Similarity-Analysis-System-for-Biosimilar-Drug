# -*- coding: utf-8 -*-
"""Peptide-table OCR with arithmetic cross-validation.

This is the one figure type that can leave the image-only evidence tier, because a
printed table of numbers reconstructs into an actual data table rather than an
estimate read off a curve. That upgrade is only justified if OCR errors are caught,
and on image4.png they are frequent: Tesseract read 1544.7 as "15447", 19.8 as
"198" and HT01 as "HTO1".

Two properties of the figure are used to catch those errors, and the difference
between them decides what may be reported:

* Each row prints a theoretical mass beside the observed masses, and the two must
  agree to within instrument accuracy. That redundancy is a checksum, so a dropped
  decimal point shows up as a tenfold disagreement. The checksum is only trusted
  when the theoretical value is itself plausible — validating against a corrupted
  reference otherwise "confirms" two equally wrong numbers.
* Retention time has no such redundancy. A dropped decimal there is undetectable,
  so retention times are range-checked and permanently flagged unvalidated rather
  than presented as clean measurements.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from app.analysis.image_fallback.constants import (
    MAX_PLAUSIBLE_PEPTIDE_MASS_DA,
    MAX_PLAUSIBLE_RETENTION_TIME_MIN,
    MAX_TABLE_MASS_RELATIVE_ERROR,
    MIN_PLAUSIBLE_PEPTIDE_MASS_DA,
    OCR_DIGIT_CONFUSIONS,
    TESSERACT_WINDOWS_PATH,
)

NOT_DETECTED_TOKENS = frozenset({"N/D", "ND", "N/A", "-", "—"})
# Peptide identifiers run HT01 through HT17 and also appear as merged pairs such as
# HT08-HT09. The digit class admits the letter O because OCR reads HT01 as "HTO1",
# and a trailing asterisk is allowed because the figure footnotes HT06 that way.
PEPTIDE_ID_PATTERN = re.compile(r"^HT[\dO]{2}\*?(?:-HT[\dO]{2}\*?)?$", re.IGNORECASE)
NUMERIC_TOKEN_PATTERN = re.compile(r"^\d+(?:[.,]\d+)?$")


@dataclass(frozen=True)
class PeptideTableRow:
    peptide_id: str
    theoretical_mass_da: float | None
    reference_observed_mass_da: float | None
    candidate_observed_mass_da: float | None
    reference_retention_time_min: float | None
    candidate_retention_time_min: float | None
    repaired_fields: tuple[str, ...]
    rejected_fields: tuple[str, ...]
    retention_times_validated: bool = False


@dataclass(frozen=True)
class PeptideTableExtraction:
    rows: tuple[PeptideTableRow, ...]
    ocr_line_count: int
    repaired_field_count: int
    rejected_field_count: int
    not_detected_count: int
    unusable_theoretical_count: int


def _configure_tesseract() -> None:
    import pytesseract

    if Path(TESSERACT_WINDOWS_PATH).is_file():
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_WINDOWS_PATH


def ocr_text(image_path) -> str:
    import pytesseract

    _configure_tesseract()
    return pytesseract.image_to_string(str(image_path))


def _normalise_peptide_id(token: str) -> str:
    """HT01 is printed with a zero but is frequently read as the letter O."""
    return token.upper().replace("HTO", "HT0").rstrip("*")


def _parse_number(token: str) -> float | None:
    cleaned = "".join(OCR_DIGIT_CONFUSIONS.get(char, char) for char in token)
    cleaned = cleaned.replace(",", ".").strip()
    if not NUMERIC_TOKEN_PATTERN.match(cleaned):
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def _theoretical_is_usable(value: float | None) -> bool:
    return (
        value is not None
        and MIN_PLAUSIBLE_PEPTIDE_MASS_DA <= value <= MAX_PLAUSIBLE_PEPTIDE_MASS_DA
    )


def _repair_against_reference(value: float, reference: float) -> float | None:
    """Recover a dropped decimal point by testing decimal shifts against the reference."""
    if reference == 0:
        return None
    for exponent in range(1, 4):
        for candidate in (value / (10**exponent), value * (10**exponent)):
            if abs(candidate - reference) / reference <= MAX_TABLE_MASS_RELATIVE_ERROR:
                return candidate
    return None


def _validate_mass(
    observed: float | None,
    theoretical: float | None,
) -> tuple[float | None, str]:
    if observed is None:
        return None, "none"
    if not _theoretical_is_usable(theoretical):
        # Without a trustworthy checksum the observed value cannot be confirmed,
        # and reporting it unchecked is what this module exists to prevent.
        return None, "rejected"
    assert theoretical is not None
    if abs(observed - theoretical) / theoretical <= MAX_TABLE_MASS_RELATIVE_ERROR:
        return observed, "ok"
    repaired = _repair_against_reference(observed, theoretical)
    if repaired is not None:
        return repaired, "repaired"
    return None, "rejected"


def _validate_retention_time(value: float | None) -> float | None:
    if value is None:
        return None
    if 0.0 <= value <= MAX_PLAUSIBLE_RETENTION_TIME_MIN:
        return value
    return None


def _record(flag: str, field: str, repaired: list[str], rejected: list[str]) -> None:
    if flag == "repaired":
        repaired.append(field)
    elif flag == "rejected":
        rejected.append(field)


def parse_peptide_table(text: str) -> PeptideTableExtraction:
    """Turn OCR text of the peptide-mapping table into validated rows."""
    rows: list[PeptideTableRow] = []
    repaired_total = 0
    rejected_total = 0
    not_detected_total = 0
    unusable_theoretical_total = 0
    lines = [line for line in text.splitlines() if line.strip()]

    for line in lines:
        tokens = line.split()
        if not tokens or not PEPTIDE_ID_PATTERN.match(tokens[0]):
            continue
        peptide_id = _normalise_peptide_id(tokens[0])

        values: list[float | None] = []
        for token in tokens[1:]:
            if token.upper() in NOT_DETECTED_TOKENS:
                values.append(None)
                not_detected_total += 1
                continue
            if "-" in token:
                # The amino-acid range column ("1-3") carries no mass information.
                continue
            parsed = _parse_number(token)
            if parsed is not None:
                values.append(parsed)

        def at(index: int) -> float | None:
            return values[index] if len(values) > index else None

        theoretical = at(0)
        if not _theoretical_is_usable(theoretical):
            unusable_theoretical_total += 1

        repaired: list[str] = []
        rejected: list[str] = []

        reference_mass, flag = _validate_mass(at(1), theoretical)
        _record(flag, "referenceObservedMass", repaired, rejected)
        candidate_mass, flag = _validate_mass(at(3), theoretical)
        _record(flag, "candidateObservedMass", repaired, rejected)

        repaired_total += len(repaired)
        rejected_total += len(rejected)

        rows.append(
            PeptideTableRow(
                peptide_id=peptide_id,
                theoretical_mass_da=theoretical if _theoretical_is_usable(theoretical) else None,
                reference_observed_mass_da=reference_mass,
                candidate_observed_mass_da=candidate_mass,
                reference_retention_time_min=_validate_retention_time(at(2)),
                candidate_retention_time_min=_validate_retention_time(at(4)),
                repaired_fields=tuple(repaired),
                rejected_fields=tuple(rejected),
                retention_times_validated=False,
            )
        )

    return PeptideTableExtraction(
        rows=tuple(rows),
        ocr_line_count=len(lines),
        repaired_field_count=repaired_total,
        rejected_field_count=rejected_total,
        not_detected_count=not_detected_total,
        unusable_theoretical_count=unusable_theoretical_total,
    )
