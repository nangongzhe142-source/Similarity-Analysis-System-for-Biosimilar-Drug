# -*- coding: utf-8 -*-
"""Job orchestration helpers used by the HTTP routes."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import UploadFile

from app.jobs.input_manifest import JobInputManifest, load_manifest, save_manifest
from app.jobs.queue import JobQueue, utc_now
from app.jobs.store import JobStore
from app.models.analysis_contract import (
    AnalysisInputFileDescriptor,
    AnalysisInputFileRole,
    AnalysisJobSnapshot,
    AnalysisJobStatus,
    AnalysisProfileId,
    LocalizedText,
)
from app.security.ingest import UploadRejectedError, detect_format, validate_upload_content
from app.security.limits import FORMAT_LIMITS
from app.security.paths import sanitize_filename, upload_path, artifact_file
from app.security.upload_io import read_upload_bounded


class JobService:
    def __init__(self, store: JobStore, queue: JobQueue) -> None:
        self.store = store
        self.queue = queue

    def create_job(
        self,
        *,
        job_id: str,
        item_id: str,
        method_id: str,
        profile: AnalysisProfileId,
        candidate_label: str,
        reference_label: str,
        pairing_description: LocalizedText,
        is_head_to_head_biosimilar_design: bool,
        parameters: dict,
    ) -> AnalysisJobSnapshot:
        now = utc_now()
        snapshot = AnalysisJobSnapshot(
            job_id=job_id,
            status=AnalysisJobStatus.QUEUED,
            item_id=item_id,
            method_id=method_id,
            profile=profile,
            created_at=now,
            updated_at=now,
        )
        self.store.save(snapshot)
        save_manifest(
            self.store.workspace_root,
            job_id,
            JobInputManifest(
                candidate_label=candidate_label,
                reference_label=reference_label,
                pairing_description=pairing_description,
                is_head_to_head_biosimilar_design=is_head_to_head_biosimilar_design,
                parameters=parameters,
            ),
        )
        return snapshot

    async def upload_file(
        self,
        job_id: str,
        role: AnalysisInputFileRole,
        upload: UploadFile,
    ) -> AnalysisJobSnapshot:
        snapshot = self.store.load(job_id)
        if snapshot.status != AnalysisJobStatus.QUEUED:
            raise ValueError("uploads are only accepted while the job is queued")

        manifest = load_manifest(self.store.workspace_root, job_id)
        workspace = self.store.workspace_for(job_id)
        original_name = upload.filename or "upload.bin"

        try:
            format_name = detect_format(original_name)
        except UploadRejectedError:
            raise

        limits = FORMAT_LIMITS[format_name]
        content = await read_upload_bounded(upload, limits.max_bytes)
        validated = validate_upload_content(
            filename=original_name,
            content=content,
            content_type=upload.content_type,
        )

        safe_base = sanitize_filename(validated.safe_name)
        destination = upload_path(workspace, role, safe_base)
        if destination.exists():
            raise UploadRejectedError("DUPLICATE_UPLOAD", "an upload with this name already exists")
        destination.write_bytes(validated.content)

        descriptor = AnalysisInputFileDescriptor(
            file_name=destination.name,
            sha256=validated.sha256,
            format=validated.format,
            byte_size=validated.byte_size,
            role=role,
        )

        if role == AnalysisInputFileRole.CANDIDATE:
            manifest.candidate_files.append(descriptor)
        elif role == AnalysisInputFileRole.REFERENCE:
            manifest.reference_files.append(descriptor)
        elif role == AnalysisInputFileRole.SEQUENCE:
            manifest.sequence_files.append(descriptor)
        else:
            raise ValueError(f"unsupported upload role: {role.value}")

        save_manifest(self.store.workspace_root, job_id, manifest)
        snapshot.updated_at = datetime.now(timezone.utc).isoformat()
        self.store.save(snapshot)
        return snapshot

    async def start_job(self, job_id: str) -> AnalysisJobSnapshot:
        snapshot = self.store.load(job_id)
        if snapshot.status != AnalysisJobStatus.QUEUED:
            raise ValueError("only queued jobs can be started")
        await self.queue.enqueue(job_id)
        return self.store.load(job_id)

    async def cancel_job(self, job_id: str) -> AnalysisJobSnapshot:
        return await self.queue.cancel(job_id)

    def get_job(self, job_id: str) -> AnalysisJobSnapshot:
        return self.store.load(job_id)

    def get_artifact(self, job_id: str, file_name: str) -> Path:
        self.store.load(job_id)
        workspace = self.store.workspace_for(job_id)
        target = artifact_file(workspace, file_name)
        if not target.is_file():
            raise FileNotFoundError(file_name)
        return target
