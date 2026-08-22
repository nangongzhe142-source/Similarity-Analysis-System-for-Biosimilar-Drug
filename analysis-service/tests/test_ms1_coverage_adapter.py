# -*- coding: utf-8 -*-
"""Integration test for the ms1-coverage adapter through the job queue."""

from __future__ import annotations

import asyncio
import importlib.util

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings, reset_settings_cache
from app.main import create_app
from app.models.analysis_contract import AnalysisJobStatus


def _scientific_stack_available() -> bool:
    return importlib.util.find_spec("pyopenms") is not None


@pytest.fixture
def ms1_settings(tmp_path) -> Settings:
    reset_settings_cache()
    return Settings(
        host="127.0.0.1",
        port=8767,
        workspace_root=tmp_path / "workspaces",
        max_concurrent_jobs=1,
        cors_origins=["http://localhost:3000"],
        job_timeout_seconds=120,
        allow_stub_adapter=False,
    )


@pytest.mark.skipif(not _scientific_stack_available(), reason="pyopenms not installed")
@pytest.mark.asyncio
async def test_ms1_coverage_job_runs_real_adapter(ms1_settings) -> None:
    app = create_app(ms1_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "ms1-sequence-coverage",
                "methodId": "ms1-sequence-coverage-primary-1",
                "profile": "ms1-coverage",
                "candidateLabel": "candidate-a",
                "referenceLabel": "reference-b",
                "pairingDescription": {
                    "zh": "合成演示配对，非头对头设计。",
                    "en": "Synthetic demo pairing; not head-to-head.",
                },
                "isHeadToHeadBiosimilarDesign": False,
                "autoStart": True,
            },
        )
        assert create_response.status_code == 200
        job_id = create_response.json()["jobId"]

        snapshot = None
        for _ in range(200):
            snapshot_response = await client.get(f"/v1/jobs/{job_id}")
            snapshot = snapshot_response.json()
            if snapshot["status"] in {
                AnalysisJobStatus.SUCCEEDED.value,
                AnalysisJobStatus.FAILED.value,
            }:
                break
            await asyncio.sleep(0.1)
        else:
            pytest.fail("job did not reach a terminal state in time")

    assert snapshot is not None
    assert snapshot["status"] == AnalysisJobStatus.SUCCEEDED.value, snapshot.get("error")
    result = snapshot["result"]
    assert result["profile"] == "ms1-coverage"
    assert result["extractedFeatures"]["coveragePercent"] == pytest.approx(96.57, abs=0.01)
    assert result["inputEvidence"]["dataSource"] == "synthetic-demo"
    assert "不能替代 MS/MS 序列确认" in result["limitations"][0]
    assert result["verdict"] == "REVIEW"
