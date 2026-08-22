# -*- coding: utf-8 -*-

from __future__ import annotations

import io

import pytest
from PIL import Image

from app.security.ingest import UploadRejectedError, validate_upload_content

MINIMAL_MZML = b"""<?xml version="1.0" encoding="UTF-8"?>
<mzML version="1.1.0">
  <run id="run1"><spectrumList count="0"/></run>
</mzML>
"""

XXE_MZML = b"""<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<mzML><cvParam value="&xxe;"/></mzML>
"""

ZIP_AS_MZML = b"PK\x03\x04" + b"0" * 64

TOO_WIDE_CSV = (",".join(["x"] * 300) + "\n").encode()

VALID_FASTA = b">seq1\nACDEFG\n"

VALID_MGF = b"BEGIN IONS\nTITLE=demo\nEND IONS\n"


def test_accepts_minimal_mzml() -> None:
    result = validate_upload_content(filename="demo.mzML", content=MINIMAL_MZML)
    assert result.format == "mzml"
    assert len(result.sha256) == 64


def test_rejects_xxe_mzml() -> None:
    with pytest.raises(UploadRejectedError) as exc:
        validate_upload_content(filename="evil.mzML", content=XXE_MZML)
    assert exc.value.code == "XML_ENTITY_BLOCKED"


def test_rejects_zip_container_disguised_as_mzml() -> None:
    with pytest.raises(UploadRejectedError) as exc:
        validate_upload_content(filename="bomb.mzML", content=ZIP_AS_MZML)
    assert exc.value.code == "CONTAINER_FORMAT_BLOCKED"


def test_rejects_csv_with_too_many_columns() -> None:
    with pytest.raises(UploadRejectedError) as exc:
        validate_upload_content(filename="wide.csv", content=TOO_WIDE_CSV)
    assert exc.value.code == "CSV_TOO_MANY_COLUMNS"


def test_rejects_oversized_image_pixels() -> None:
    image = Image.new("RGB", (4001, 4001), color="red")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    with pytest.raises(UploadRejectedError) as exc:
        validate_upload_content(filename="wide.png", content=buffer.getvalue())
    assert exc.value.code == "IMAGE_TOO_LARGE"


def test_accepts_valid_fasta_and_mgf() -> None:
    assert validate_upload_content(filename="seq.fasta", content=VALID_FASTA).format == "fasta"
    assert validate_upload_content(filename="peaks.mgf", content=VALID_MGF).format == "mgf"


def test_rejects_unknown_extension() -> None:
    with pytest.raises(UploadRejectedError) as exc:
        validate_upload_content(filename="payload.exe", content=b"MZ")
    assert exc.value.code == "EXTENSION_NOT_ALLOWED"
