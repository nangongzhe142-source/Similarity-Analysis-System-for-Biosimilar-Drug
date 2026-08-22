# -*- coding: utf-8 -*-
"""MS1 peptide-map coverage adapter (P8)."""

from __future__ import annotations

import asyncio
from pathlib import Path
from uuid import uuid4

from app.adapters.base import AdapterContext, AnalysisAdapter, raise_if_incomplete_upload
from app.analysis.ms1_coverage.pipeline import (
    build_analysis_result,
    build_input_evidence,
    run_synthetic_demo,
    run_uploaded_masses,
    utc_now,
)
from app.jobs.input_manifest import JobInputManifest, manifest_path
from app.models.analysis_contract import AnalysisProfileId, AnalysisResult
from app.security.paths import uploads_dir


class Ms1CoverageAdapter(AnalysisAdapter):
    profile = AnalysisProfileId.MS1_COVERAGE.value

    async def run(self, context: AdapterContext) -> AnalysisResult:
        return await asyncio.to_thread(self._run_sync, context)

    def _run_sync(self, context: AdapterContext) -> AnalysisResult:
        started_at = utc_now()
        manifest = JobInputManifest.model_validate_json(
            manifest_path(context.workspace).read_text(encoding="utf-8")
        )
        artifacts_dir = context.workspace / "artifacts"
        artifacts_dir.mkdir(parents=True, exist_ok=True)

        inputs_dir = uploads_dir(context.workspace)
        sequence_files = [inputs_dir / item.file_name for item in manifest.sequence_files]
        reference_files = [inputs_dir / item.file_name for item in manifest.reference_files]
        candidate_files = [inputs_dir / item.file_name for item in manifest.candidate_files]

        if candidate_files and reference_files and sequence_files:
            pipeline = run_uploaded_masses(
                item_id=context.job.item_id,
                sequence_path=sequence_files[0],
                reference_masses_path=reference_files[0],
                candidate_masses_path=candidate_files[0],
                work_dir=artifacts_dir,
                parameters=context.parameters,
            )
            synthetic_demo = False
        else:
            raise_if_incomplete_upload(False, manifest)
            sequence_path = sequence_files[0] if sequence_files else None
            pipeline = run_synthetic_demo(
                item_id=context.job.item_id,
                sequence_path=sequence_path,
                work_dir=artifacts_dir,
                parameters=context.parameters,
            )
            synthetic_demo = True

        input_evidence = build_input_evidence(
            candidate_label=manifest.candidate_label,
            reference_label=manifest.reference_label,
            pairing_description=manifest.pairing_description,
            is_head_to_head_biosimilar_design=manifest.is_head_to_head_biosimilar_design,
            candidate_files=manifest.candidate_files,
            reference_files=manifest.reference_files,
            sequence_files=manifest.sequence_files,
            synthetic_demo=synthetic_demo,
        )

        return build_analysis_result(
            job_id=context.job.job_id,
            item_id=context.job.item_id,
            method_id=context.job.method_id,
            pipeline=pipeline,
            input_evidence=input_evidence,
            trace_id=f"ms1-coverage-{uuid4().hex[:12]}",
            started_at=started_at,
            completed_at=utc_now(),
            artifacts_dir=artifacts_dir,
        )
