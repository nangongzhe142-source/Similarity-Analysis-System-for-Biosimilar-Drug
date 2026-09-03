# -*- coding: utf-8 -*-
"""Job-queue integration for the P26 curve-overlay adapter."""

from __future__ import annotations

import asyncio

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings, reset_settings_cache
from app.main import create_app
from app.models.analysis_contract import AnalysisJobStatus


@pytest.fixture
def curve_overlay_settings(tmp_path) -> Settings:
    reset_settings_cache()
    return Settings(
        host="127.0.0.1",
        port=8765,
        workspace_root=tmp_path / "workspaces",
        max_concurrent_jobs=1,
        cors_origins=["http://localhost:3000"],
        job_timeout_seconds=60,
        allow_stub_adapter=False,
    )


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("item_id", "method_id"),
    [
        ("sec-hmw-aggregates", "sec-hmw-aggregates-primary-1"),
        ("acidic-charge-variants", "acidic-charge-variants-primary-1"),
        ("far-uv-cd", "far-uv-cd-primary-1"),
    ],
)
async def test_curve_overlay_synthetic_job(curve_overlay_settings, item_id, method_id) -> None:
    app = create_app(curve_overlay_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": item_id,
                "methodId": method_id,
                "profile": "curve-overlay",
                "candidateLabel": "illustrative-candidate",
                "referenceLabel": "illustrative-reference",
                "pairingDescription": {
                    "zh": "合成演示配对，非头对头设计。",
                    "en": "Synthetic demo pairing; not head-to-head.",
                },
                "isHeadToHeadBiosimilarDesign": False,
                "autoStart": True,
            },
        )
        assert create_response.status_code == 200, create_response.text
        job_id = create_response.json()["jobId"]
        snapshot = None
        for _ in range(200):
            snapshot = (await client.get(f"/v1/jobs/{job_id}")).json()
            if snapshot["status"] in {
                AnalysisJobStatus.SUCCEEDED.value,
                AnalysisJobStatus.FAILED.value,
            }:
                break
            await asyncio.sleep(0.1)
        else:
            pytest.fail("job did not reach a terminal state in time")

    assert snapshot["status"] == AnalysisJobStatus.SUCCEEDED.value, snapshot.get("error")
    result = snapshot["result"]
    assert result["profile"] == "curve-overlay"
    assert result["verdict"] == "REVIEW"
    assert result["inputEvidence"]["dataSource"] == "synthetic-demo"
    assert result["artifacts"]["overlayPlot"]
    gates = result["evidence"]["qualityGates"]
    assert gates
    assert all(gate["thresholdKind"] == "algorithmQualityGate" for gate in gates)
    assert result["evidence"]["parameters"]["pearsonR"] > 0.9
