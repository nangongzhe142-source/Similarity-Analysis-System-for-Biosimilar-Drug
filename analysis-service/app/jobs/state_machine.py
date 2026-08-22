# -*- coding: utf-8 -*-
"""Six-state analysis job lifecycle with explicit allowed transitions."""

from __future__ import annotations

from app.models.analysis_contract import AnalysisJobStatus

TERMINAL_STATUSES: frozenset[AnalysisJobStatus] = frozenset(
    {
        AnalysisJobStatus.SUCCEEDED,
        AnalysisJobStatus.FAILED,
        AnalysisJobStatus.CANCELLED,
    }
)

ALLOWED_TRANSITIONS: dict[AnalysisJobStatus, frozenset[AnalysisJobStatus]] = {
    AnalysisJobStatus.QUEUED: frozenset(
        {AnalysisJobStatus.VALIDATING, AnalysisJobStatus.CANCELLED}
    ),
    AnalysisJobStatus.VALIDATING: frozenset(
        {AnalysisJobStatus.RUNNING, AnalysisJobStatus.FAILED, AnalysisJobStatus.CANCELLED}
    ),
    AnalysisJobStatus.RUNNING: frozenset(
        {
            AnalysisJobStatus.SUCCEEDED,
            AnalysisJobStatus.FAILED,
            AnalysisJobStatus.CANCELLED,
        }
    ),
    AnalysisJobStatus.SUCCEEDED: frozenset(),
    AnalysisJobStatus.FAILED: frozenset(),
    AnalysisJobStatus.CANCELLED: frozenset(),
}


class InvalidJobTransition(ValueError):
    """Raised when a job status change is not permitted."""


def assert_transition(current: AnalysisJobStatus, target: AnalysisJobStatus) -> None:
    if current == target:
        return
    allowed = ALLOWED_TRANSITIONS.get(current, frozenset())
    if target not in allowed:
        raise InvalidJobTransition(
            f"cannot transition from {current.value} to {target.value}"
        )


def is_terminal(status: AnalysisJobStatus) -> bool:
    return status in TERMINAL_STATUSES
