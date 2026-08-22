# -*- coding: utf-8 -*-
"""Per-format upload limits from decision D16."""

from __future__ import annotations

from dataclasses import dataclass

GI_B = 1024**3
MI_B = 1024**2

MAX_IMAGE_PIXELS = 4_000 * 4_000
MAX_CSV_ROWS = 100_000
MAX_CSV_COLUMNS = 256
MAX_FASTA_RECORDS = 10_000
MAX_MZML_PARSE_BYTES = 8 * MI_B


@dataclass(frozen=True)
class FormatLimits:
    extensions: frozenset[str]
    max_bytes: int
    mime_prefixes: frozenset[str]


FORMAT_LIMITS: dict[str, FormatLimits] = {
    "mzml": FormatLimits(
        extensions=frozenset({"mzml"}),
        max_bytes=2 * GI_B,
        mime_prefixes=frozenset({"application/xml", "text/xml", "application/octet-stream"}),
    ),
    "mzxml": FormatLimits(
        extensions=frozenset({"mzxml"}),
        max_bytes=2 * GI_B,
        mime_prefixes=frozenset({"application/xml", "text/xml", "application/octet-stream"}),
    ),
    "mgf": FormatLimits(
        extensions=frozenset({"mgf"}),
        max_bytes=1 * GI_B,
        mime_prefixes=frozenset({"text/plain", "application/octet-stream"}),
    ),
    "txt": FormatLimits(
        extensions=frozenset({"txt"}),
        max_bytes=20 * MI_B,
        mime_prefixes=frozenset({"text/plain", "application/octet-stream"}),
    ),
    "csv": FormatLimits(
        extensions=frozenset({"csv", "tsv"}),
        max_bytes=20 * MI_B,
        mime_prefixes=frozenset({"text/csv", "text/plain", "application/vnd.ms-excel", "application/octet-stream"}),
    ),
    "fasta": FormatLimits(
        extensions=frozenset({"fasta", "fa", "faa"}),
        max_bytes=2 * MI_B,
        mime_prefixes=frozenset({"text/plain", "application/octet-stream"}),
    ),
    "png": FormatLimits(
        extensions=frozenset({"png"}),
        max_bytes=20 * MI_B,
        mime_prefixes=frozenset({"image/png", "application/octet-stream"}),
    ),
    "jpeg": FormatLimits(
        extensions=frozenset({"jpg", "jpeg"}),
        max_bytes=20 * MI_B,
        mime_prefixes=frozenset({"image/jpeg", "application/octet-stream"}),
    ),
    "webp": FormatLimits(
        extensions=frozenset({"webp"}),
        max_bytes=20 * MI_B,
        mime_prefixes=frozenset({"image/webp", "application/octet-stream"}),
    ),
    "raw": FormatLimits(
        extensions=frozenset({"raw"}),
        max_bytes=4 * GI_B,
        mime_prefixes=frozenset({"application/octet-stream"}),
    ),
    "wiff": FormatLimits(
        extensions=frozenset({"wiff"}),
        max_bytes=4 * GI_B,
        mime_prefixes=frozenset({"application/octet-stream"}),
    ),
}

ALLOWED_EXTENSIONS = {ext for limits in FORMAT_LIMITS.values() for ext in limits.extensions}
