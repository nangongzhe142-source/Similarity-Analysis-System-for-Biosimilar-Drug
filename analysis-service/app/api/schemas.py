# -*- coding: utf-8 -*-
"""HTTP request/response models for the analysis API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.analysis_contract import AnalysisProfileId, LocalizedText


class CreateJobRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    item_id: str = Field(alias="itemId")
    method_id: str = Field(alias="methodId")
    profile: AnalysisProfileId
    candidate_label: str = Field(alias="candidateLabel")
    reference_label: str = Field(alias="referenceLabel")
    pairing_description: LocalizedText = Field(alias="pairingDescription")
    is_head_to_head_biosimilar_design: bool = Field(
        default=False, alias="isHeadToHeadBiosimilarDesign"
    )
    parameters: dict[str, Any] = Field(default_factory=dict)
    auto_start: bool = Field(default=False, alias="autoStart")


class HealthResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    status: str
    service: str
    schema_version: str = Field(alias="schemaVersion")
