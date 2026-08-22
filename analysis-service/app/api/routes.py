# -*- coding: utf-8 -*-
"""FastAPI routes for the analysis service."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse

from app.api.schemas import CreateJobRequest, HealthResponse
from app.api.service import JobService
from app.models.analysis_contract import (
    ANALYSIS_RESULT_SCHEMA_VERSION,
    AnalysisInputFileRole,
    AnalysisJobSnapshot,
)
from app.security.paths import new_job_id

router = APIRouter()


def get_job_service(request: Request) -> JobService:
    return request.app.state.job_service


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="analysis-service",
        schema_version=ANALYSIS_RESULT_SCHEMA_VERSION,
    )


@router.post("/v1/jobs", response_model=AnalysisJobSnapshot)
async def create_job(
    body: CreateJobRequest,
    service: JobService = Depends(get_job_service),
) -> AnalysisJobSnapshot:
    job_id = new_job_id()
    snapshot = service.create_job(
        job_id=job_id,
        item_id=body.item_id,
        method_id=body.method_id,
        profile=body.profile,
        candidate_label=body.candidate_label,
        reference_label=body.reference_label,
        pairing_description=body.pairing_description,
        is_head_to_head_biosimilar_design=body.is_head_to_head_biosimilar_design,
        parameters=body.parameters,
    )
    if body.auto_start:
        snapshot = await service.start_job(job_id)
    return snapshot


@router.post("/v1/jobs/{job_id}/upload/{role}", response_model=AnalysisJobSnapshot)
async def upload_file(
    job_id: str,
    role: AnalysisInputFileRole,
    file: UploadFile,
    service: JobService = Depends(get_job_service),
) -> AnalysisJobSnapshot:
    try:
        return await service.upload_file(job_id, role, file)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.post("/v1/jobs/{job_id}/start", response_model=AnalysisJobSnapshot)
async def start_job(
    job_id: str,
    service: JobService = Depends(get_job_service),
) -> AnalysisJobSnapshot:
    try:
        return await service.start_job(job_id)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.get("/v1/jobs/{job_id}", response_model=AnalysisJobSnapshot)
async def get_job(
    job_id: str,
    service: JobService = Depends(get_job_service),
) -> AnalysisJobSnapshot:
    return service.get_job(job_id)


@router.get("/v1/jobs/{job_id}/artifacts/{file_name}")
async def download_artifact(
    job_id: str,
    file_name: str,
    service: JobService = Depends(get_job_service),
) -> FileResponse:
    try:
        path = service.get_artifact(job_id, file_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="artifact not found") from exc
    return FileResponse(path, filename=path.name)


@router.delete("/v1/jobs/{job_id}", response_model=AnalysisJobSnapshot)
async def cancel_job(
    job_id: str,
    service: JobService = Depends(get_job_service),
) -> AnalysisJobSnapshot:
    return await service.cancel_job(job_id)
