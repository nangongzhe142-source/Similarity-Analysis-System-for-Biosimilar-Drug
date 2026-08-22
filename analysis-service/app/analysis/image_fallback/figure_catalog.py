# -*- coding: utf-8 -*-
"""P17-2 catalog: 图谱数据库 figures → itemId / methodId / colour roles.

The extractor only sees red and blue pixels. Which product a colour stands for
is a property of the figure's legend (or, for the trastuzumab mirror, of the
DOCX body). This module is that mapping. It does not guess.

Chinese-only file names become `upload.png` after ingest sanitisation, so the
authoritative key is SHA-256 of the bytes. The original file name is a second
key for when the frontend sends `figureLibraryFileName` in job parameters.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

ALLOWED_ROLES = frozenset({"candidate", "reference"})
ALLOWED_COLOURS = frozenset({"red", "blue"})
COLOUR_ROLES_PARAMETER_KEY = "colourRoles"
FIGURE_LIBRARY_FILE_NAME_PARAMETER_KEY = "figureLibraryFileName"

_PROJECT_ROOT = Path(__file__).resolve().parents[4]
CATALOG_PATH = _PROJECT_ROOT / "src" / "data" / "figure-library-catalog.json"


@dataclass(frozen=True)
class FigureLibraryEntry:
    file_name: str
    sha256: str
    collection: str
    mapped: bool
    item_id: str | None
    method_id: str | None
    profile: str | None
    drug_annotation: str
    candidate_product: str
    reference_product: str
    colour_roles: dict[str, str]
    colour_role_source: str
    exclusion_reason: str | None

    def as_parameter_record(self) -> dict[str, Any]:
        return {
            "fileName": self.file_name,
            "sha256": self.sha256,
            "collection": self.collection,
            "mapped": self.mapped,
            "itemId": self.item_id,
            "methodId": self.method_id,
            "profile": self.profile,
            "drugAnnotation": self.drug_annotation,
            "candidateProduct": self.candidate_product,
            "referenceProduct": self.reference_product,
            "colourRoleSource": self.colour_role_source,
            "exclusionReason": self.exclusion_reason,
        }


def _entry_from_record(record: dict[str, Any]) -> FigureLibraryEntry:
    raw_roles = record.get("colourRoles") or {}
    roles = {
        str(colour): str(role)
        for colour, role in raw_roles.items()
        if colour in ALLOWED_COLOURS and role in ALLOWED_ROLES
    }
    return FigureLibraryEntry(
        file_name=str(record["fileName"]),
        sha256=str(record["sha256"]).lower(),
        collection=str(record["collection"]),
        mapped=bool(record["mapped"]),
        item_id=record.get("itemId"),
        method_id=record.get("methodId"),
        profile=record.get("profile"),
        drug_annotation=str(record.get("drugAnnotation") or ""),
        candidate_product=str(record.get("candidateProduct") or ""),
        reference_product=str(record.get("referenceProduct") or ""),
        colour_roles=roles,
        colour_role_source=str(record.get("colourRoleSource") or "none"),
        exclusion_reason=record.get("exclusionReason"),
    )


@lru_cache(maxsize=1)
def load_figure_library_catalog() -> tuple[FigureLibraryEntry, ...]:
    payload = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    return tuple(_entry_from_record(record) for record in payload["entries"])


def lookup_figure_library_entry(
    *,
    sha256: str | None = None,
    file_name: str | None = None,
) -> FigureLibraryEntry | None:
    """Prefer SHA-256; fall back to the basename of the original file name."""
    catalog = load_figure_library_catalog()
    if sha256:
        digest = sha256.lower()
        for entry in catalog:
            if entry.sha256 == digest:
                return entry
    if file_name:
        base = Path(file_name).name
        for entry in catalog:
            if entry.file_name == base:
                return entry
    return None


def parse_colour_roles(raw: object) -> dict[str, str] | None:
    if not isinstance(raw, dict):
        return None
    roles = {
        str(colour): str(role)
        for colour, role in raw.items()
        if colour in ALLOWED_COLOURS and role in ALLOWED_ROLES
    }
    return roles or None


def resolve_colour_roles(
    *,
    sha256: str | None,
    parameters: dict[str, Any],
    original_file_name: str | None = None,
) -> tuple[dict[str, str] | None, FigureLibraryEntry | None, list[str]]:
    """Job-parameter override wins; otherwise the catalog supplies the legend.

    Returns (roles, catalog entry, warnings). Roles stay None when the figure is
    unknown or excluded, so traces remain labelled by colour rather than guessed.
    """
    warnings: list[str] = []
    name_from_parameters = parameters.get(FIGURE_LIBRARY_FILE_NAME_PARAMETER_KEY)
    lookup_name = (
        str(name_from_parameters)
        if isinstance(name_from_parameters, str) and name_from_parameters
        else original_file_name
    )
    entry = lookup_figure_library_entry(sha256=sha256, file_name=lookup_name)

    override = parse_colour_roles(parameters.get(COLOUR_ROLES_PARAMETER_KEY))
    if override is not None:
        return override, entry, warnings

    if entry is None:
        return None, None, warnings

    if not entry.mapped:
        warnings.append(
            entry.exclusion_reason
            or f"{entry.file_name} is excluded from the first-phase figure mapping."
        )
        return None, entry, warnings

    roles = dict(entry.colour_roles) if entry.colour_roles else None
    return roles, entry, warnings


def item_method_mismatch_warnings(
    entry: FigureLibraryEntry | None,
    *,
    item_id: str,
    method_id: str,
) -> list[str]:
    if entry is None or not entry.mapped:
        return []
    warnings: list[str] = []
    if entry.item_id and entry.item_id != item_id:
        warnings.append(
            f"Library figure {entry.file_name} is catalogued for item {entry.item_id}, "
            f"but this job is {item_id}."
        )
    if entry.method_id and entry.method_id != method_id:
        warnings.append(
            f"Library figure {entry.file_name} is catalogued for method {entry.method_id}, "
            f"but this job is {method_id}."
        )
    return warnings
