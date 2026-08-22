# -*- coding: utf-8 -*-
"""P14 frozen evidence: disulfide search remains Blocked/L0."""

from __future__ import annotations

import json
from pathlib import Path

EVIDENCE_PATH = (
    Path(__file__).resolve().parents[2]
    / "docs"
    / "tool-survey"
    / "evidence"
    / "p14_disulfide_license_check.json"
)


def test_p14_license_check_records_blocked_l0() -> None:
    payload = json.loads(EVIDENCE_PATH.read_text(encoding="utf-8"))
    assert payload["decision"].startswith("Blocked/L0")
    by_name = {row["fullName"]: row for row in payload["repos"]}
    assert by_name["pFindStudio/pLink2"]["licenseSpdx"] is None
    assert by_name["pFindStudio/pLink2"]["readmeExpiry"] == "2025-01-10"
    assert by_name["pFindStudio/pLink3"]["licenseSpdx"] is None
    assert by_name["Eugleo/dibby"]["licenseSpdx"] is None
    assert by_name["pLinkSS/pLink-SS"]["licenseSpdx"] == "GPL-3.0"
    assert by_name["pLinkSS/pLink-SS"]["pushedAt"].startswith("2014-")
