# -*- coding: utf-8 -*-

from __future__ import annotations

import pytest

from app.jobs.state_machine import InvalidJobTransition, assert_transition, is_terminal
from app.models.analysis_contract import AnalysisJobStatus


@pytest.mark.parametrize(
    ("current", "target"),
    [
        (AnalysisJobStatus.QUEUED, AnalysisJobStatus.VALIDATING),
        (AnalysisJobStatus.QUEUED, AnalysisJobStatus.CANCELLED),
        (AnalysisJobStatus.VALIDATING, AnalysisJobStatus.RUNNING),
        (AnalysisJobStatus.VALIDATING, AnalysisJobStatus.FAILED),
        (AnalysisJobStatus.VALIDATING, AnalysisJobStatus.CANCELLED),
        (AnalysisJobStatus.RUNNING, AnalysisJobStatus.SUCCEEDED),
        (AnalysisJobStatus.RUNNING, AnalysisJobStatus.FAILED),
        (AnalysisJobStatus.RUNNING, AnalysisJobStatus.CANCELLED),
    ],
)
def test_allowed_transitions(current: AnalysisJobStatus, target: AnalysisJobStatus) -> None:
    assert_transition(current, target)


@pytest.mark.parametrize(
    ("current", "target"),
    [
        (AnalysisJobStatus.QUEUED, AnalysisJobStatus.SUCCEEDED),
        (AnalysisJobStatus.QUEUED, AnalysisJobStatus.RUNNING),
        (AnalysisJobStatus.VALIDATING, AnalysisJobStatus.SUCCEEDED),
        (AnalysisJobStatus.RUNNING, AnalysisJobStatus.QUEUED),
        (AnalysisJobStatus.SUCCEEDED, AnalysisJobStatus.FAILED),
        (AnalysisJobStatus.FAILED, AnalysisJobStatus.RUNNING),
        (AnalysisJobStatus.CANCELLED, AnalysisJobStatus.QUEUED),
    ],
)
def test_disallowed_transitions(current: AnalysisJobStatus, target: AnalysisJobStatus) -> None:
    with pytest.raises(InvalidJobTransition):
        assert_transition(current, target)


def test_terminal_states() -> None:
    assert is_terminal(AnalysisJobStatus.SUCCEEDED)
    assert is_terminal(AnalysisJobStatus.FAILED)
    assert is_terminal(AnalysisJobStatus.CANCELLED)
    assert not is_terminal(AnalysisJobStatus.QUEUED)
