"""Unified public API for all three calculation-engine batches."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from backend.calculation_tasks import calculation_task_manager, engine_readiness
from backend.calculation_units import unit_catalog
from backend.engine_adapter_registry import adapter_catalog
from worker.covalent_bonds import calculate_ellman


router = APIRouter(tags=["calculation-engines"])


class EllmanRequest(BaseModel):
    absorbance412: float = Field(ge=0)
    blankAbsorbance412: float = Field(default=0, ge=0)
    dilutionFactor: float = Field(default=1, gt=0)
    proteinConcentrationMgMl: float = Field(gt=0)
    volumeMl: float = Field(default=1, gt=0)
    pathLengthCm: float = Field(default=1, gt=0)
    proteinMolecularWeightDa: float = Field(default=150000, gt=0)
    epsilonTnb: float = Field(default=14150, gt=0)
    riskThresholdMolShPerMolProtein: float | None = Field(default=None, gt=0)
    hmwPercent: float | None = Field(default=None, ge=0, le=100)


@router.post("/api/free-thiol/calculate")
def free_thiol_calculate(request: EllmanRequest) -> dict[str, Any]:
    try:
        return calculate_ellman(request.model_dump())
    except (KeyError, TypeError, ValueError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


def safe_name(value: str) -> str:
    name = Path(value).name
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name[:160] or "input.bin"


@router.get("/calculation-units")
def calculation_units() -> dict[str, Any]:
    return {"units": unit_catalog(), "readiness": engine_readiness(), "adapterRegistry": adapter_catalog(), "decisionPolicy": "objective-marking-only"}


@router.post("/calculation-jobs", status_code=202)
@router.post("/api/jobs", status_code=202)
async def create_calculation_job(
    files: list[UploadFile] = File(...), moduleCode: str = Form(...), inputManifestJson: str = Form(...),
    projectId: str = Form("biocompare"), parametersJson: str = Form("{}"),
) -> dict[str, Any]:
    try:
        input_manifest, parameters = json.loads(inputManifestJson), json.loads(parametersJson)
        if not isinstance(input_manifest, list) or not isinstance(parameters, dict):
            raise ValueError("inputManifestJson必须是数组，parametersJson必须是对象")
    except (json.JSONDecodeError, ValueError) as error:
        raise HTTPException(status_code=400, detail=f"参数格式错误：{error}") from error
    if len(files) != len(input_manifest) or not files:
        raise HTTPException(status_code=400, detail="上传文件与输入清单必须一一对应")
    try:
        state, folder = calculation_task_manager.prepare(projectId, moduleCode, parameters)
        metadata = []
        used: set[str] = set()
        for index, (upload, declared) in enumerate(zip(files, input_manifest, strict=True), 1):
            if not isinstance(declared, dict) or declared.get("role") not in {"reference", "candidate", "fasta", "glycan_source"}:
                raise ValueError("每个输入必须声明reference/candidate/fasta/glycan_source角色")
            name = safe_name(upload.filename or f"input-{index}")
            if name in used:
                name = f"{index:03d}-{name}"
            used.add(name)
            path = folder / "inputs" / name
            digest = hashlib.sha256(); size = 0
            with path.open("wb") as target:
                while chunk := await upload.read(1024 * 1024):
                    size += len(chunk)
                    if size > 4 * 1024 * 1024 * 1024:
                        raise ValueError("单文件不能超过4GB")
                    digest.update(chunk); target.write(chunk)
            metadata.append({"storedName": name, "originalName": upload.filename, "size": size, "sha256": digest.hexdigest(), "role": declared["role"], "lotId": declared.get("lotId"), "formatIn": declared.get("formatIn")})
        return calculation_task_manager.enqueue(folder, metadata)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/calculation-jobs")
@router.get("/api/jobs")
def list_calculation_jobs(projectId: str = "biocompare", moduleCode: str | None = None, limit: int = 100) -> dict[str, Any]:
    try:
        jobs = calculation_task_manager.list(projectId, moduleCode, limit)
        return {"projectId": projectId, "jobs": jobs, "count": len(jobs)}
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/calculation-jobs/{task_id}")
@router.get("/api/jobs/{task_id}")
def get_calculation_job(task_id: str, projectId: str | None = None) -> dict[str, Any]:
    try:
        return calculation_task_manager.get(projectId, task_id) if projectId else calculation_task_manager.get_any(task_id)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="计算任务不存在") from error


@router.get("/calculation-jobs/{task_id}/result")
@router.get("/api/jobs/{task_id}/result")
def get_calculation_result(task_id: str, projectId: str | None = None) -> dict[str, Any]:
    try:
        return calculation_task_manager.result(projectId, task_id) if projectId else calculation_task_manager.result_any(task_id)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="计算结果尚未生成") from error


@router.get("/calculation-jobs/{task_id}/artifacts/{artifact_path:path}")
def get_calculation_artifact(task_id: str, artifact_path: str, projectId: str) -> FileResponse:
    try:
        target = calculation_task_manager.artifact(projectId, task_id, artifact_path)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail="产物不存在或未登记") from error
    return FileResponse(target, filename=target.name)
