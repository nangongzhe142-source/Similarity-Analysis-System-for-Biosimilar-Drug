# -*- coding: utf-8 -*-
"""Adapter resolution by analysis profile and input format."""

from __future__ import annotations

from pathlib import Path

from app.adapters.base import AdapterNotImplementedError, AnalysisAdapter
from app.adapters.image_fallback import ImageFallbackAdapter, looks_like_image
from app.adapters.intact_mass import IntactMassAdapter
from app.adapters.ms1_coverage import Ms1CoverageAdapter
from app.adapters.msms_sequence import MsmsSequenceAdapter
from app.adapters.peptide_map import PeptideMapAdapter
from app.adapters.stub import StubAdapter
from app.config import Settings
from app.jobs.input_manifest import JobInputManifest, manifest_path

PROFILE_ADAPTERS: dict[str, type[AnalysisAdapter]] = {
    "intact-mass": IntactMassAdapter,
    "peptide-map": PeptideMapAdapter,
    "ms1-coverage": Ms1CoverageAdapter,
    "msms-sequence": MsmsSequenceAdapter,
}


def inputs_are_images_only(workspace: Path) -> bool:
    """Whether every uploaded measurement file for this job is a figure.

    Resolution has to consider the inputs and not only the profile, because image
    fallback is a degraded mode of each profile rather than a profile of its own.
    A mixed upload is not treated as image-only: if real spectra are present the
    profile adapter should use them.
    """
    path = manifest_path(workspace)
    if not path.is_file():
        return False

    manifest = JobInputManifest.model_validate_json(path.read_text(encoding="utf-8"))
    measurement_files = [*manifest.candidate_files, *manifest.reference_files]
    if not measurement_files:
        return False
    return all(
        looks_like_image(descriptor.file_name, descriptor.format)
        for descriptor in measurement_files
    )


def resolve_adapter(
    profile: str,
    settings: Settings,
    workspace: Path | None = None,
) -> AnalysisAdapter:
    if settings.allow_stub_adapter:
        return StubAdapter()

    if workspace is not None and inputs_are_images_only(workspace):
        return ImageFallbackAdapter()

    adapter_type = PROFILE_ADAPTERS.get(profile)
    if adapter_type is not None:
        return adapter_type()

    raise AdapterNotImplementedError(
        f"No analysis adapter is implemented for profile '{profile}' yet."
    )
