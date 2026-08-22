# -*- coding: utf-8 -*-
"""D17: free-thiol has no analysis adapter and must not be an analyzable profile."""

from __future__ import annotations

from dataclasses import replace

from app.adapters.base import AdapterNotImplementedError
from app.adapters.registry import PROFILE_ADAPTERS, resolve_adapter
from app.config import Settings


def test_no_free_thiol_profile_adapter(test_settings: Settings) -> None:
    assert "free-thiol" not in PROFILE_ADAPTERS
    no_stub = replace(test_settings, allow_stub_adapter=False)
    try:
        resolve_adapter("free-thiol", no_stub)
    except AdapterNotImplementedError:
        return
    raise AssertionError("free-thiol must not resolve to an analysis adapter")


def test_no_disulfide_map_profile_adapter(test_settings: Settings) -> None:
    assert "disulfide-map" not in PROFILE_ADAPTERS
    no_stub = replace(test_settings, allow_stub_adapter=False)
    try:
        resolve_adapter("disulfide-map", no_stub)
    except AdapterNotImplementedError:
        return
    raise AssertionError("disulfide-map must not resolve to an analysis adapter")
