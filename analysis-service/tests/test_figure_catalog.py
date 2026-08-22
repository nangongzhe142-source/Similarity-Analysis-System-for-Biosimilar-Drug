# -*- coding: utf-8 -*-
"""P17-2 figure library catalog lookups."""

from __future__ import annotations

from pathlib import Path

from app.analysis.image_fallback.figure_catalog import (
    CATALOG_PATH,
    lookup_figure_library_entry,
    parse_colour_roles,
    resolve_colour_roles,
)

LIGHT_CHAIN_SHA = "86a22857dca91ab29993137349418325927078259f8677365ef1d7f9b47f91e2"
TRASTUZUMAB_PNG_SHA = "ca3dd1774d9903ac5eae258446a8e084f368b8b0d61ba4bb448df2814f66fca5"
FAB_SHA = "4d867c01c6eeff2600f2ba1028a2f10d1647f4b5afd31f8d70d2672bd7440985"
PEPTIDE_MAP_SHA = "396ebfac7db65bba5ede45ef0d05f9b177a711b10859781ffbf9e8b8385d1da3"


def test_catalog_json_is_present() -> None:
    assert CATALOG_PATH.is_file()


def test_lookup_by_sha256_does_not_need_the_chinese_file_name() -> None:
    entry = lookup_figure_library_entry(sha256=LIGHT_CHAIN_SHA)
    assert entry is not None
    assert entry.item_id == "light-chain-mass"
    assert entry.method_id == "light-chain-mass-primary-1"
    assert entry.colour_roles == {"red": "candidate", "blue": "reference"}
    assert entry.colour_role_source == "figure-legend"


def test_lookup_by_chinese_file_name() -> None:
    entry = lookup_figure_library_entry(file_name="轻链分子量.png")
    assert entry is not None
    assert entry.sha256 == LIGHT_CHAIN_SHA


def test_trastuzumab_roles_come_from_docx_body_not_hlx03_legend() -> None:
    entry = lookup_figure_library_entry(sha256=TRASTUZUMAB_PNG_SHA)
    assert entry is not None
    assert entry.colour_roles == {"red": "reference", "blue": "candidate"}
    assert entry.colour_role_source == "docx-body"
    assert entry.item_id == "intact-mass"


def test_peptide_map_hangs_on_intact_mass_orthogonal_only() -> None:
    entry = lookup_figure_library_entry(sha256=PEPTIDE_MAP_SHA)
    assert entry is not None
    assert entry.item_id == "intact-mass"
    assert entry.method_id == "intact-mass-orthogonal-1"
    assert entry.profile == "peptide-map"


def test_fab_is_catalogued_but_not_mapped() -> None:
    entry = lookup_figure_library_entry(sha256=FAB_SHA)
    assert entry is not None
    assert entry.mapped is False
    roles, resolved, warnings = resolve_colour_roles(sha256=FAB_SHA, parameters={})
    assert roles is None
    assert resolved is entry
    assert warnings


def test_job_parameter_colour_roles_override_the_catalog() -> None:
    override = {"red": "reference", "blue": "candidate"}
    roles, entry, warnings = resolve_colour_roles(
        sha256=LIGHT_CHAIN_SHA,
        parameters={"colourRoles": override},
    )
    assert roles == override
    assert entry is not None
    assert entry.item_id == "light-chain-mass"
    assert warnings == []


def test_parse_colour_roles_rejects_invented_keys() -> None:
    assert parse_colour_roles({"green": "candidate"}) is None
    assert parse_colour_roles({"red": "originator"}) is None
    assert parse_colour_roles({"red": "candidate"}) == {"red": "candidate"}


def test_library_file_bytes_still_match_frozen_hashes() -> None:
    root = Path(r"d:\生物类似药判别系统\图谱数据库")
    path = root / "轻链分子量.png"
    if not path.is_file():
        return
    import hashlib

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest == LIGHT_CHAIN_SHA
