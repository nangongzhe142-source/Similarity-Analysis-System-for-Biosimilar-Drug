# -*- coding: utf-8 -*-
"""Secure upload validation for the analysis service (P6)."""

from __future__ import annotations

import csv
import hashlib
import io
import re
from dataclasses import dataclass
from pathlib import Path

from defusedxml import ElementTree as DefusedElementTree
from defusedxml.common import EntitiesForbidden
from PIL import Image

from app.security.limits import (
    FORMAT_LIMITS,
    MAX_CSV_COLUMNS,
    MAX_CSV_ROWS,
    MAX_FASTA_RECORDS,
    MAX_IMAGE_PIXELS,
    MAX_MZML_PARSE_BYTES,
)

XML_HEADER = re.compile(rb"<\?xml", re.IGNORECASE)
MZML_ROOT = re.compile(rb"<mzml[\s>]", re.IGNORECASE)
MGF_BEGIN = re.compile(rb"(?im)^BEGIN IONS")
FASTA_HEADER = re.compile(rb"(?m)^>")

MAGIC_SIGNATURES: dict[str, tuple[bytes, ...]] = {
    "mzml": (b"<?xml", b"<mzML"),
    "mzxml": (b"<?xml", b"<mzXML"),
    "mgf": (b"BEGIN IONS", b"##"),
    "png": (b"\x89PNG\r\n\x1a\n",),
    "jpeg": (b"\xff\xd8\xff",),
    "webp": (b"RIFF",),
    "raw": (b"\x01\xa1F\x00i\x00n\x00",),
    "wiff": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),
}

DISALLOWED_CONTAINER_MAGIC = (
    b"PK\x03\x04",  # zip
    b"\x1f\x8b",  # gzip
    b"Rar!",  # rar
    b"7z\xbc\xaf\x27\x1c",  # 7z
)


class UploadRejectedError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


@dataclass(frozen=True)
class ValidatedUpload:
    original_name: str
    safe_name: str
    format: str
    sha256: str
    byte_size: int
    content: bytes


def detect_format(filename: str) -> str:
    extension = Path(filename).suffix.lstrip(".").lower()
    if not extension:
        raise UploadRejectedError("EXTENSION_REQUIRED", "file name must include an extension")
    for format_name, limits in FORMAT_LIMITS.items():
        if extension in limits.extensions:
            return format_name
    raise UploadRejectedError("EXTENSION_NOT_ALLOWED", f"extension .{extension} is not allowed")


def _match_magic(format_name: str, content: bytes) -> None:
    if len(content) < 8:
        raise UploadRejectedError("FILE_TOO_SMALL", "file is too small to validate")

    if content.startswith(DISALLOWED_CONTAINER_MAGIC):
        raise UploadRejectedError("CONTAINER_FORMAT_BLOCKED", "archive containers are not accepted")

    signatures = MAGIC_SIGNATURES.get(format_name, ())
    if format_name in {"txt", "csv", "fasta"}:
        return

    if not signatures:
        return

    if not any(content.startswith(signature) for signature in signatures):
        if format_name in {"mzml", "mzxml"} and XML_HEADER.search(content[:256]):
            return
        if format_name == "mgf" and MGF_BEGIN.search(content[:4096]):
            return
        raise UploadRejectedError("MAGIC_BYTES_MISMATCH", "file content does not match its extension")


def _validate_mime(format_name: str, content_type: str | None) -> None:
    if not content_type:
        return
    mime = content_type.split(";", 1)[0].strip().lower()
    limits = FORMAT_LIMITS[format_name]
    if any(mime.startswith(prefix) for prefix in limits.mime_prefixes):
        return
    raise UploadRejectedError("MIME_NOT_ALLOWED", f"MIME type {mime!r} is not allowed for .{format_name}")


def _validate_text_encoding(content: bytes) -> None:
    try:
        content.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise UploadRejectedError("TEXT_ENCODING_INVALID", "text file must be valid UTF-8") from exc


def _validate_csv(content: bytes) -> None:
    _validate_text_encoding(content)
    text = content.decode("utf-8")
    try:
        dialect = csv.Sniffer().sniff(text[:8192])
    except csv.Error:
        dialect = csv.excel
    reader = csv.reader(io.StringIO(text), dialect)
    for row_number, row in enumerate(reader, start=1):
        if row_number > MAX_CSV_ROWS:
            raise UploadRejectedError("CSV_TOO_MANY_ROWS", "CSV exceeds the allowed row count")
        if len(row) > MAX_CSV_COLUMNS:
            raise UploadRejectedError("CSV_TOO_MANY_COLUMNS", "CSV exceeds the allowed column count")


def _validate_fasta(content: bytes) -> None:
    _validate_text_encoding(content)
    if not FASTA_HEADER.search(content[:4096]):
        raise UploadRejectedError("FASTA_INVALID", "FASTA file must contain at least one header line")
    record_count = content.count(b">")
    if record_count > MAX_FASTA_RECORDS:
        raise UploadRejectedError("FASTA_TOO_MANY_RECORDS", "FASTA exceeds the allowed record count")


def _validate_mgf(content: bytes) -> None:
    _validate_text_encoding(content)
    if not MGF_BEGIN.search(content[:8192]):
        raise UploadRejectedError("MGF_INVALID", "MGF file must contain BEGIN IONS")


ALLOWED_SPECTRUM_ROOTS = {
    "mzml": frozenset({"mzml", "indexedmzml"}),
    "mzxml": frozenset({"mzxml", "indexedmzxml"}),
}


def _validate_spectrum_xml(content: bytes, format_name: str) -> None:
    if not XML_HEADER.search(content[:128]) and not content.lstrip().startswith(b"<"):
        raise UploadRejectedError("XML_INVALID", "spectrum XML must begin with an XML declaration or root element")

    header = content[:8192]
    if b"<!DOCTYPE" in header or b"<!ENTITY" in header:
        raise UploadRejectedError("XML_ENTITY_BLOCKED", "DOCTYPE and external entities are not allowed")

    allowed_roots = ALLOWED_SPECTRUM_ROOTS[format_name]
    if not any(token in header.lower() for token in (f"<{name}".encode() for name in allowed_roots)):
        raise UploadRejectedError("XML_ROOT_MISMATCH", "spectrum XML root element was not recognised")

    if len(content) > MAX_MZML_PARSE_BYTES:
        return

    parse_slice = content[: min(len(content), MAX_MZML_PARSE_BYTES)]
    try:
        root = DefusedElementTree.fromstring(parse_slice)
    except EntitiesForbidden as exc:
        raise UploadRejectedError("XML_ENTITY_BLOCKED", "external entities are not allowed") from exc
    except Exception as exc:  # noqa: BLE001
        raise UploadRejectedError("XML_INVALID", "spectrum XML could not be parsed safely") from exc

    tag = root.tag.split("}", 1)[-1].lower()
    if tag not in allowed_roots:
        raise UploadRejectedError("XML_ROOT_MISMATCH", "spectrum XML root element was not recognised")


def _validate_image(content: bytes, format_name: str) -> None:
    with Image.open(io.BytesIO(content)) as image:
        image.load()
        width, height = image.size
    if width * height > MAX_IMAGE_PIXELS:
        raise UploadRejectedError(
            "IMAGE_TOO_LARGE",
            f"image pixel count {width}x{height} exceeds the 4000x4000 limit",
        )


def validate_upload_content(
    *,
    filename: str,
    content: bytes,
    content_type: str | None = None,
) -> ValidatedUpload:
    format_name = detect_format(filename)
    if format_name == "wiff":
        raise UploadRejectedError(
            "VENDOR_FORMAT_NOT_ANALYSABLE",
            "SCIEX WIFF conversion has not been verified; export mzML or TXT/CSV first.",
        )
    if format_name == "raw":
        raise UploadRejectedError(
            "VENDOR_FORMAT_NOT_ANALYSABLE",
            "Thermo RAW is not analysed in-place. The P6 msconvert path is not wired into "
            "this adapter; export mzML or TXT/CSV first.",
        )
    limits = FORMAT_LIMITS[format_name]
    if len(content) > limits.max_bytes:
        raise UploadRejectedError("FILE_TOO_LARGE", "file exceeds the allowed size for its format")

    _validate_mime(format_name, content_type)
    _match_magic(format_name, content)

    if format_name in {"mzml", "mzxml"}:
        _validate_spectrum_xml(content, format_name)
    elif format_name == "csv":
        _validate_csv(content)
    elif format_name == "txt":
        _validate_text_encoding(content)
    elif format_name == "fasta":
        _validate_fasta(content)
    elif format_name == "mgf":
        _validate_mgf(content)
    elif format_name in {"png", "jpeg", "webp"}:
        _validate_image(content, format_name)

    digest = hashlib.sha256(content).hexdigest()
    safe_name = Path(filename).name
    return ValidatedUpload(
        original_name=filename,
        safe_name=safe_name,
        format=format_name,
        sha256=digest,
        byte_size=len(content),
        content=content,
    )
