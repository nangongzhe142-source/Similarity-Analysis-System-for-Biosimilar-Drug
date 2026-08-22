# -*- coding: utf-8 -*-
"""Build provenance inputHashes from uploaded file descriptors."""

from __future__ import annotations

from app.models.analysis_contract import AnalysisInputEvidence, AnalysisInputHash


def input_hashes_from_evidence(evidence: AnalysisInputEvidence) -> list[AnalysisInputHash]:
    descriptors = [
        *evidence.candidate_files,
        *evidence.reference_files,
        *evidence.sequence_files,
    ]
    return [
        AnalysisInputHash(label=f"{item.role.value}:{item.file_name}", sha256=item.sha256)
        for item in descriptors
    ]
