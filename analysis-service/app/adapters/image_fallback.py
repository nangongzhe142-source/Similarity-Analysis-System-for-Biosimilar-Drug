# -*- coding: utf-8 -*-
"""Image-only fallback adapter (P10).

This adapter is selected by input format rather than by profile: any analysis item
whose uploads are figures instead of raw spectra degrades to image analysis. It is
therefore reachable for every profile, which is what lets the figure types in
生物类似药药学评价比较.docx enter the system at all.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from uuid import uuid4

from app.adapters.base import AdapterContext, AnalysisAdapter
from app.analysis.image_fallback.calibration import (
    CalibrationPoint,
    build_axis_calibration,
    unreliable_calibration,
)
from app.analysis.image_fallback.figure_catalog import (
    item_method_mismatch_warnings,
    resolve_colour_roles,
)
from app.analysis.image_fallback.pipeline import (
    analyse_figure,
    build_image_analysis_result,
    image_input_evidence_defaults,
    utc_now,
)
from app.jobs.input_manifest import JobInputManifest, manifest_path
from app.models.analysis_contract import (
    AnalysisInputEvidence,
    AnalysisResult,
    AnalysisSamplePairing,
)
from app.security.paths import uploads_dir

IMAGE_SUFFIXES = frozenset({".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".webp"})
IMAGE_FORMATS = frozenset({"png", "jpeg", "jpg", "tif", "tiff", "bmp", "webp"})
CALIBRATION_PARAMETER_KEY = "imageCalibration"


def looks_like_image(file_name: str, format_name: str | None = None) -> bool:
    if format_name and format_name.lower() in IMAGE_FORMATS:
        return True
    return Path(file_name).suffix.lower() in IMAGE_SUFFIXES


class ImageFallbackAdapter(AnalysisAdapter):
    profile = "image-fallback"

    async def run(self, context: AdapterContext) -> AnalysisResult:
        return await asyncio.to_thread(self._run_sync, context)

    def _run_sync(self, context: AdapterContext) -> AnalysisResult:
        started_at = utc_now()
        manifest = JobInputManifest.model_validate_json(
            manifest_path(context.workspace).read_text(encoding="utf-8")
        )

        image_descriptors = [
            descriptor
            for descriptor in (*manifest.candidate_files, *manifest.reference_files)
            if looks_like_image(descriptor.file_name, descriptor.format)
        ]
        if not image_descriptors:
            raise ValueError("image fallback adapter requires at least one image input")

        figure_path = uploads_dir(context.workspace) / image_descriptors[0].file_name
        calibration = self._calibration_from_parameters(manifest.parameters)
        outcome = analyse_figure(figure_path, calibration=calibration)

        roles, library_entry, catalog_warnings = resolve_colour_roles(
            sha256=image_descriptors[0].sha256,
            parameters=manifest.parameters,
        )
        outcome.warnings.extend(catalog_warnings)
        outcome.warnings.extend(
            item_method_mismatch_warnings(
                library_entry,
                item_id=context.job.item_id,
                method_id=context.job.method_id,
            )
        )

        data_source, evidence_level = image_input_evidence_defaults()
        input_evidence = AnalysisInputEvidence(
            data_source=data_source,
            evidence_level=evidence_level,
            candidate_files=manifest.candidate_files,
            reference_files=manifest.reference_files,
            sequence_files=manifest.sequence_files,
            sample_pairing=AnalysisSamplePairing(
                candidate_label=manifest.candidate_label,
                reference_label=manifest.reference_label,
                description=manifest.pairing_description,
                is_head_to_head_biosimilar_design=manifest.is_head_to_head_biosimilar_design,
            ),
        )

        artifacts_dir = context.workspace / "artifacts"
        artifacts_dir.mkdir(parents=True, exist_ok=True)

        extra_parameters = {}
        if library_entry is not None:
            extra_parameters["figureLibrary"] = library_entry.as_parameter_record()

        return build_image_analysis_result(
            job_id=context.job.job_id,
            item_id=context.job.item_id,
            method_id=context.job.method_id,
            profile=context.job.profile,
            outcome=outcome,
            input_evidence=input_evidence,
            trace_id=f"image-fallback-{uuid4().hex[:12]}",
            started_at=started_at,
            completed_at=utc_now(),
            artifacts_dir=artifacts_dir,
            colour_roles=roles,
            extra_parameters=extra_parameters or None,
        )

    def _calibration_from_parameters(self, parameters: dict):
        """Read operator-supplied calibration anchors, if any were provided.

        Absence of anchors is a normal state, not an error: the run proceeds and
        simply withholds physical units.
        """
        raw = parameters.get(CALIBRATION_PARAMETER_KEY)
        if not isinstance(raw, dict):
            return None

        points_raw = raw.get("points")
        if not isinstance(points_raw, list) or len(points_raw) < 2:
            return unreliable_calibration(
                str(raw.get("axisName", "x")),
                str(raw.get("unit", "unknown")),
                "fewer than two calibration anchors were supplied",
            )

        try:
            points = [
                CalibrationPoint(
                    pixel=float(entry["pixel"]),
                    axis_value=float(entry["axisValue"]),
                )
                for entry in points_raw
            ]
        except (KeyError, TypeError, ValueError):
            return unreliable_calibration(
                str(raw.get("axisName", "x")),
                str(raw.get("unit", "unknown")),
                "calibration anchors were malformed",
            )

        return build_axis_calibration(
            str(raw.get("axisName", "x")),
            str(raw.get("unit", "unknown")),
            points,
        )
