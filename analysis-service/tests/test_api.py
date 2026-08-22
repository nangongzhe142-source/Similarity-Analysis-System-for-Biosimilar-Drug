# -*- coding: utf-8 -*-

from __future__ import annotations

import asyncio
from dataclasses import replace

import pytest
from httpx import ASGITransport, AsyncClient

from app.adapters.base import AdapterNotImplementedError
from app.adapters.registry import resolve_adapter
from app.main import create_app
from app.models.analysis_contract import AnalysisJobStatus


@pytest.mark.asyncio
async def test_health_endpoint(test_settings) -> None:
    app = create_app(test_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["schemaVersion"] == "1.0.0"


@pytest.mark.asyncio
async def test_job_lifecycle_with_stub_adapter(test_settings) -> None:
    app = create_app(test_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "intact-mass",
                "methodId": "intact-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "candidate-a",
                "referenceLabel": "reference-b",
                "pairingDescription": {
                    "zh": "测试配对，非头对头设计。",
                    "en": "Test pairing; not a head-to-head design.",
                },
                "isHeadToHeadBiosimilarDesign": False,
                "autoStart": True,
            },
        )
        assert create_response.status_code == 200
        job_id = create_response.json()["jobId"]

        for _ in range(50):
            snapshot_response = await client.get(f"/v1/jobs/{job_id}")
            snapshot = snapshot_response.json()
            if snapshot["status"] in {
                AnalysisJobStatus.SUCCEEDED.value,
                AnalysisJobStatus.FAILED.value,
                AnalysisJobStatus.CANCELLED.value,
            }:
                break
            await asyncio.sleep(0.05)
        else:
            pytest.fail("job did not reach a terminal state in time")

        assert snapshot["status"] == AnalysisJobStatus.SUCCEEDED.value
        assert snapshot["result"]["jobId"] == job_id
        assert "limitations" in snapshot["result"]


@pytest.mark.asyncio
async def test_cancel_queued_job(test_settings) -> None:
    app = create_app(test_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "intact-mass",
                "methodId": "intact-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "candidate-a",
                "referenceLabel": "reference-b",
                "pairingDescription": {"zh": "取消测试", "en": "cancel test"},
            },
        )
        job_id = create_response.json()["jobId"]
        cancel_response = await client.delete(f"/v1/jobs/{job_id}")
        assert cancel_response.status_code == 200
        assert cancel_response.json()["status"] == AnalysisJobStatus.CANCELLED.value


def test_adapter_not_implemented_for_unknown_profile(test_settings) -> None:
    no_stub_settings = replace(test_settings, allow_stub_adapter=False)
    with pytest.raises(AdapterNotImplementedError):
        resolve_adapter("disulfide-map", no_stub_settings)


@pytest.mark.asyncio
async def test_upload_rejects_invalid_extension(test_settings) -> None:
    app = create_app(test_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "intact-mass",
                "methodId": "intact-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "a",
                "referenceLabel": "b",
                "pairingDescription": {"zh": "上传测试", "en": "upload test"},
            },
        )
        job_id = create_response.json()["jobId"]
        files = {"file": ("payload.exe", b"MZ\x90", "application/octet-stream")}
        upload_response = await client.post(
            f"/v1/jobs/{job_id}/upload/candidate",
            files=files,
        )
    assert upload_response.status_code == 400
    assert upload_response.json()["error"]["code"] == "EXTENSION_NOT_ALLOWED"


@pytest.mark.asyncio
async def test_upload_accepts_valid_mzml(test_settings) -> None:
    app = create_app(test_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    mzml = b"""<?xml version="1.0"?><mzML><run id="r"><spectrumList count="0"/></run></mzML>"""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "intact-mass",
                "methodId": "intact-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "a",
                "referenceLabel": "b",
                "pairingDescription": {"zh": "mzML", "en": "mzML"},
            },
        )
        job_id = create_response.json()["jobId"]
        files = {"file": ("demo.mzML", mzml, "application/xml")}
        upload_response = await client.post(
            f"/v1/jobs/{job_id}/upload/candidate",
            files=files,
        )
    assert upload_response.status_code == 200
    assert upload_response.json()["status"] == "QUEUED"


@pytest.mark.asyncio
async def test_job_state_persists_to_disk(test_settings) -> None:
    app = create_app(test_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "intact-mass",
                "methodId": "intact-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "candidate-a",
                "referenceLabel": "reference-b",
                "pairingDescription": {"zh": "持久化测试", "en": "persistence test"},
            },
        )
        job_id = create_response.json()["jobId"]

    reloaded_app = create_app(test_settings)
    transport = ASGITransport(app=reloaded_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        snapshot_response = await client.get(f"/v1/jobs/{job_id}")
    assert snapshot_response.status_code == 200
    assert snapshot_response.json()["jobId"] == job_id
