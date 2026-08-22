# -*- coding: utf-8 -*-
"""Test-only adapter that returns the committed contract fixture.

Enabled only when ANALYSIS_ALLOW_STUB_ADAPTER=true. Production jobs without a
real adapter fail with ADAPTER_NOT_IMPLEMENTED instead of fabricating science.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from app.adapters.base import AdapterContext, AnalysisAdapter
from app.config import SERVICE_ROOT
from app.models.analysis_contract import AnalysisResult

FIXTURE_PATH = SERVICE_ROOT / "contracts" / "fixtures" / "minimal-analysis-result.json"


class StubAdapter(AnalysisAdapter):
    profile = "stub"

    async def run(self, context: AdapterContext) -> AnalysisResult:
        payload = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
        payload["jobId"] = context.job.job_id
        payload["itemId"] = context.job.item_id
        payload["methodId"] = context.job.method_id
        payload["profile"] = context.job.profile.value
        now = datetime.now(timezone.utc).isoformat()
        payload["evidence"]["traceId"] = f"stub-{context.job.job_id}"
        payload["evidence"]["startedAt"] = now
        payload["evidence"]["completedAt"] = now
        payload["limitations"] = list(payload.get("limitations", [])) + [
            "Stub adapter enabled for service tests only."
        ]
        return AnalysisResult.model_validate(payload)
