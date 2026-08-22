# -*- coding: utf-8 -*-
"""Integration test for the intact-mass adapter through the job queue."""

from __future__ import annotations

import asyncio
import importlib.util

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings, reset_settings_cache
from app.main import create_app
from app.models.analysis_contract import AnalysisJobStatus


def _scientific_stack_available() -> bool:
    return (
        importlib.util.find_spec("pyopenms") is not None
        and importlib.util.find_spec("unidec") is not None
    )


@pytest.fixture
def intact_mass_settings(tmp_path) -> Settings:
    reset_settings_cache()
    return Settings(
        host="127.0.0.1",
        port=8765,
        workspace_root=tmp_path / "workspaces",
        max_concurrent_jobs=1,
        cors_origins=["http://localhost:3000"],
        job_timeout_seconds=120,
        allow_stub_adapter=False,
    )


@pytest.mark.skipif(not _scientific_stack_available(), reason="pyopenms/unidec not installed")
@pytest.mark.asyncio
async def test_intact_mass_job_runs_real_adapter(intact_mass_settings) -> None:
    app = create_app(intact_mass_settings)
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
        assert snapshot["status"] == AnalysisJobStatus.SUCCEEDED.value
        result = snapshot["result"]
        plot_name = result["artifacts"]["mirrorPlot"]
        assert plot_name
        download = await client.get(f"/v1/jobs/{job_id}/artifacts/{plot_name}")
        assert download.status_code == 200
        assert download.content[:8] == b"\x89PNG\r\n\x1a\n"
        traversal = await client.get(f"/v1/jobs/{job_id}/artifacts/..%2Fjob.json")
        assert traversal.status_code in {400, 404}

    assert result["profile"] == "intact-mass"
    assert result["extractedFeatures"]["deconvolvedMassesDa"] == [66398.0, 66560.0]
    assert result["inputEvidence"]["dataSource"] == "synthetic-demo"
    assert result["verdict"] == "REVIEW"
    assert result["evidence"]["parameters"]["accession"] == "P02769"
    assert result["evidence"]["parameters"]["sequenceSource"] == "bsa-demo-fixture"
    gates = result["evidence"]["qualityGates"]
    assert gates
    assert all(gate["thresholdKind"] == "algorithmQualityGate" for gate in gates)
    assert "不是生物类似性数值合格线" in result["provenance"]["whatItIsNot"]["zh"]
