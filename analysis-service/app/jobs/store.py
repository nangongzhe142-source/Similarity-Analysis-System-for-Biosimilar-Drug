# -*- coding: utf-8 -*-
"""Disk-persisted job snapshots (D8)."""

from __future__ import annotations

import json
from pathlib import Path

from app.jobs.state_machine import assert_transition
from app.models.analysis_contract import AnalysisJobSnapshot, AnalysisJobStatus
from app.security.paths import job_state_path, job_workspace, uploads_dir


class JobNotFoundError(FileNotFoundError):
    pass


class JobStore:
    def __init__(self, workspace_root: Path) -> None:
        self.workspace_root = workspace_root
        self.workspace_root.mkdir(parents=True, exist_ok=True)

    def workspace_for(self, job_id: str) -> Path:
        workspace = job_workspace(self.workspace_root, job_id)
        workspace.mkdir(parents=True, exist_ok=True)
        uploads_dir(workspace).mkdir(parents=True, exist_ok=True)
        return workspace

    def save(self, snapshot: AnalysisJobSnapshot) -> None:
        workspace = self.workspace_for(snapshot.job_id)
        payload = snapshot.model_dump(mode="json", by_alias=True)
        job_state_path(workspace).write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    def load(self, job_id: str) -> AnalysisJobSnapshot:
        workspace = job_workspace(self.workspace_root, job_id)
        state_file = job_state_path(workspace)
        if not state_file.is_file():
            raise JobNotFoundError(job_id)
        return AnalysisJobSnapshot.model_validate_json(state_file.read_text(encoding="utf-8"))

    def transition(
        self,
        job_id: str,
        target: AnalysisJobStatus,
        *,
        updated_at: str,
        **updates: object,
    ) -> AnalysisJobSnapshot:
        snapshot = self.load(job_id)
        assert_transition(snapshot.status, target)
        data = snapshot.model_dump(mode="json", by_alias=True)
        data["status"] = target.value
        data["updatedAt"] = updated_at
        for key, value in updates.items():
            field_info = AnalysisJobSnapshot.model_fields.get(key)
            wire_key = field_info.alias if field_info and field_info.alias else key
            if value is None:
                data[wire_key] = None
            elif hasattr(value, "model_dump"):
                data[wire_key] = value.model_dump(mode="json", by_alias=True)
            else:
                data[wire_key] = value
        updated = AnalysisJobSnapshot.model_validate(data)
        self.save(updated)
        return updated

    def exists(self, job_id: str) -> bool:
        try:
            job_workspace(self.workspace_root, job_id)
        except ValueError:
            return False
        return job_state_path(job_workspace(self.workspace_root, job_id)).is_file()
