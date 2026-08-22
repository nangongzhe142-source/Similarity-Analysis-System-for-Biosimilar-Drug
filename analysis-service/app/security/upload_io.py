# -*- coding: utf-8 -*-
"""Bounded async reads for multipart uploads."""

from __future__ import annotations

from fastapi import UploadFile

from app.security.ingest import UploadRejectedError


async def read_upload_bounded(upload: UploadFile, max_bytes: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await upload.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            raise UploadRejectedError(
                "FILE_TOO_LARGE",
                "file exceeds the allowed size for its format",
            )
        chunks.append(chunk)
    return b"".join(chunks)
