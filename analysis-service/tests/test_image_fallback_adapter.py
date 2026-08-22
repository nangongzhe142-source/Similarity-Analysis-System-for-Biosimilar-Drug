# -*- coding: utf-8 -*-
"""End-to-end: a real DOCX figure uploaded through the API reaches the fallback adapter."""

from __future__ import annotations

import asyncio
import importlib.util
import zipfile
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from app.config import Settings, reset_settings_cache
from app.main import create_app
from app.models.analysis_contract import AnalysisJobStatus

COMPARISON_DOCX = Path(
    r"d:\生物类似药判别系统\生物类似药评价指导原则\生物类似药药学评价比较.docx"
)


def _stack_available() -> bool:
    return all(
        importlib.util.find_spec(module) is not None
        for module in ("cv2", "skimage", "pytesseract")
    )


pytestmark = pytest.mark.skipif(
    not _stack_available(),
    reason="opencv/scikit-image/pytesseract not installed",
)


@pytest.fixture
def image_settings(tmp_path) -> Settings:
    reset_settings_cache()
    return Settings(
        host="127.0.0.1",
        port=8766,
        workspace_root=tmp_path / "workspaces",
        max_concurrent_jobs=1,
        cors_origins=["http://localhost:3000"],
        job_timeout_seconds=120,
        allow_stub_adapter=False,
    )


@pytest.fixture
def coverage_figure_bytes() -> bytes:
    if not COMPARISON_DOCX.is_file():
        pytest.skip("comparison DOCX not present")
    with zipfile.ZipFile(COMPARISON_DOCX) as archive:
        return archive.read("word/media/image6.png")


@pytest.mark.asyncio
async def test_image_upload_routes_to_fallback_adapter(
    image_settings, coverage_figure_bytes
) -> None:
    app = create_app(image_settings)
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
                    "zh": "文献插图，非头对头设计。",
                    "en": "Publication figure; not head-to-head.",
                },
                "isHeadToHeadBiosimilarDesign": False,
                "autoStart": False,
            },
        )
        assert create_response.status_code == 200
        job_id = create_response.json()["jobId"]

        for role in ("candidate", "reference"):
            upload = await client.post(
                f"/v1/jobs/{job_id}/upload/{role}",
                files={"file": ("image6.png", coverage_figure_bytes, "image/png")},
            )
            assert upload.status_code == 200, upload.text

        start_response = await client.post(f"/v1/jobs/{job_id}/start")
        assert start_response.status_code == 200

        snapshot = None
        for _ in range(300):
            snapshot = (await client.get(f"/v1/jobs/{job_id}")).json()
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
    assert result["inputEvidence"]["dataSource"] == "image-only"
    assert result["inputEvidence"]["evidenceLevel"] == "image-only-exploratory"
    assert result["verdict"] == "REVIEW"
    assert result["evidence"]["parameters"]["figureKind"] == "sequence-coverage"
    assert result["evidence"]["parameters"]["calibrationReliable"] is False
    assert result["extractedFeatures"]["imageMetrics"]["calibrationReliable"] is False

    coverage = result["extractedFeatures"]["coveragePercentByDefinition"]
    assert coverage["analyte"] == 0.0
    assert coverage["combined"] == 99.8

    assert "OpenCV" in result["evidence"]["toolVersions"]
    assert "Tesseract" in result["evidence"]["toolVersions"]
    assert any("head-to-head" in warning for warning in result["warnings"])


@pytest.fixture
def trastuzumab_mirror_bytes() -> bytes:
    if not COMPARISON_DOCX.is_file():
        pytest.skip("comparison DOCX not present")
    with zipfile.ZipFile(COMPARISON_DOCX) as archive:
        return archive.read("word/media/image1.jpeg")


@pytest.mark.asyncio
async def test_docx_image1_receives_trastuzumab_colour_roles(
    image_settings, trastuzumab_mirror_bytes
) -> None:
    app = create_app(image_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "intact-mass",
                "methodId": "intact-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "biosimilar",
                "referenceLabel": "originator",
                "pairingDescription": {
                    "zh": "文献插图，非头对头设计。",
                    "en": "Publication figure; not head-to-head.",
                },
                "isHeadToHeadBiosimilarDesign": False,
                "autoStart": False,
            },
        )
        assert create_response.status_code == 200
        job_id = create_response.json()["jobId"]
        upload = await client.post(
            f"/v1/jobs/{job_id}/upload/candidate",
            files={"file": ("image1.jpeg", trastuzumab_mirror_bytes, "image/jpeg")},
        )
        assert upload.status_code == 200, upload.text
        start_response = await client.post(f"/v1/jobs/{job_id}/start")
        assert start_response.status_code == 200

        snapshot = None
        for _ in range(300):
            snapshot = (await client.get(f"/v1/jobs/{job_id}")).json()
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
    assert result["verdict"] == "REVIEW"
    assert result["evidence"]["parameters"]["colourRoles"] == {
        "red": "reference",
        "blue": "candidate",
    }
    library = result["evidence"]["parameters"]["figureLibrary"]
    assert library["fileName"] == "image1.jpeg"
    assert library["colourRoleSource"] == "docx-body"
    assert result["evidence"]["parameters"]["ocrCalibrationApplied"] is False


@pytest.mark.asyncio
async def test_library_figure_on_wrong_item_warns(
    image_settings, trastuzumab_mirror_bytes
) -> None:
    app = create_app(image_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "light-chain-mass",
                "methodId": "light-chain-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "candidate-a",
                "referenceLabel": "reference-b",
                "pairingDescription": {
                    "zh": "文献插图，非头对头设计。",
                    "en": "Publication figure; not head-to-head.",
                },
                "isHeadToHeadBiosimilarDesign": False,
                "autoStart": False,
            },
        )
        job_id = create_response.json()["jobId"]
        await client.post(
            f"/v1/jobs/{job_id}/upload/candidate",
            files={"file": ("image1.jpeg", trastuzumab_mirror_bytes, "image/jpeg")},
        )
        await client.post(f"/v1/jobs/{job_id}/start")
        snapshot = None
        for _ in range(300):
            snapshot = (await client.get(f"/v1/jobs/{job_id}")).json()
            if snapshot["status"] in {
                AnalysisJobStatus.SUCCEEDED.value,
                AnalysisJobStatus.FAILED.value,
            }:
                break
            await asyncio.sleep(0.1)
        else:
            pytest.fail("job did not reach a terminal state in time")

    assert snapshot["status"] == AnalysisJobStatus.SUCCEEDED.value
    warnings = snapshot["result"]["warnings"]
    assert any("intact-mass" in warning and "light-chain-mass" in warning for warning in warnings)


@pytest.mark.asyncio
async def test_operator_two_point_calibration_reaches_the_adapter(
    image_settings, trastuzumab_mirror_bytes
) -> None:
    app = create_app(image_settings)
    app.state.job_queue.start()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_response = await client.post(
            "/v1/jobs",
            json={
                "itemId": "intact-mass",
                "methodId": "intact-mass-primary-1",
                "profile": "intact-mass",
                "candidateLabel": "biosimilar",
                "referenceLabel": "originator",
                "pairingDescription": {
                    "zh": "文献插图，非头对头设计。",
                    "en": "Publication figure; not head-to-head.",
                },
                "isHeadToHeadBiosimilarDesign": False,
                "parameters": {
                    "imageCalibration": {
                        "axisName": "mass",
                        "unit": "Da",
                        "points": [
                            {"pixel": 63.0, "axisValue": 147600.0},
                            {"pixel": 404.0, "axisValue": 148800.0},
                        ],
                    }
                },
                "autoStart": False,
            },
        )
        job_id = create_response.json()["jobId"]
        upload = await client.post(
            f"/v1/jobs/{job_id}/upload/candidate",
            files={"file": ("image1.jpeg", trastuzumab_mirror_bytes, "image/jpeg")},
        )
        assert upload.status_code == 200, upload.text
        await client.post(f"/v1/jobs/{job_id}/start")
        snapshot = None
        for _ in range(300):
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
    assert result["verdict"] == "REVIEW"
    assert result["extractedFeatures"]["imageMetrics"]["calibrationReliable"] is True
    masses = result["extractedFeatures"]["deconvolvedMassesDa"]
    assert masses
    assert all(147000.0 < mass < 149500.0 for mass in masses)
    assert result["evidence"]["parameters"]["ocrCalibrationApplied"] is False
