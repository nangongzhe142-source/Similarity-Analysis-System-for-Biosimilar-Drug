# -*- coding: utf-8 -*-
"""P20 protective tests: no silent BSA slicing, per-item search windows, vendor formats."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.analysis.intact_mass.analyte_profiles import (
    ANALYTE_PROFILES,
    derive_mass_window,
    resolve_deconvolution_settings,
)
from app.analysis.intact_mass.sequence import (
    SequenceLoadOptions,
    accession_from_header,
    load_bsa_demo_fixture,
    load_fasta_file,
    parse_fasta_records,
)
from app.analysis.intact_mass.theory import TheoreticalMasses
from app.models.analysis_contract import ThresholdKind
from app.security.ingest import UploadRejectedError, validate_upload_content


def test_generic_fasta_is_not_sliced_as_bsa(tmp_path: Path) -> None:
    sequence = "DIQMTQSPSSLSASVGDRVTITCRASQDVNTAVAWYQQKPGKAPKLLIYSASFLYSGVPSR"
    fasta = tmp_path / "light-chain.fasta"
    fasta.write_text(f">user|LC_DEMO light chain\n{sequence}\n", encoding="utf-8")
    protein = load_fasta_file(fasta)
    assert protein.mature_sequence == sequence
    assert protein.mature_length == len(sequence)
    assert protein.accession == "user"
    assert protein.disulfide_count is None
    assert protein.sequence_source == "user-fasta"
    assert protein.mature_start is None


def test_uniprot_accession_is_read_from_header() -> None:
    assert accession_from_header(">sp|P01857|IGHG1_HUMAN Ig gamma-1") == "P01857"
    assert accession_from_header(">custom_chain") == "custom_chain"


def test_multi_record_fasta_is_refused_without_index(tmp_path: Path) -> None:
    fasta = tmp_path / "mab.fasta"
    fasta.write_text(">LC\nDIQMTQ\n>HC\nEVQLVES\n", encoding="utf-8")
    with pytest.raises(ValueError, match="fastaRecordIndex"):
        load_fasta_file(fasta)
    protein = load_fasta_file(fasta, SequenceLoadOptions(record_index=1))
    assert protein.mature_sequence == "EVQLVES"


def test_bsa_demo_fixture_still_uses_annotated_mature_chain() -> None:
    protein = load_bsa_demo_fixture()
    assert protein.accession == "P02769"
    assert protein.mature_length == 583
    assert protein.disulfide_count == 17
    assert protein.sequence_source == "bsa-demo-fixture"
    assert protein.mature_start == 25
    assert protein.mature_end == 607


def test_user_p02769_fasta_is_not_auto_matured() -> None:
    fixture = Path(__file__).resolve().parents[1] / "fixtures" / "P02769.fasta"
    protein = load_fasta_file(fixture)
    records = parse_fasta_records(fixture.read_text(encoding="utf-8"))
    assert protein.mature_length == len(records[0][1])
    assert protein.mature_length == 607
    assert protein.disulfide_count is None
    assert protein.accession == "P02769"


def test_five_mass_items_have_distinct_default_windows() -> None:
    windows = {
        item_id: ANALYTE_PROFILES[item_id].default_mass_window_da
        for item_id in (
            "intact-mass",
            "deglycosylated-intact-mass",
            "light-chain-mass",
            "non-deglycosylated-heavy-chain-mass",
            "deglycosylated-heavy-chain-mass",
        )
    }
    assert windows["intact-mass"][0] >= 100000
    assert windows["light-chain-mass"][1] <= 35000
    assert windows["light-chain-mass"] != windows["intact-mass"]
    assert windows["deglycosylated-heavy-chain-mass"] != windows["non-deglycosylated-heavy-chain-mass"]


def test_search_window_follows_theoretical_mass_not_item_default() -> None:
    theoretical = TheoreticalMasses(
        reduced_average_mass_da=66432.46,
        reduced_monoisotopic_mass_da=66400.0,
        disulfide_count=17,
        disulfide_mass_loss_da=34.27,
        oxidized_average_mass_da=66398.19,
    )
    settings = resolve_deconvolution_settings("intact-mass", theoretical)
    lower, upper = settings.mass_range_da
    assert lower < 66398.19 < upper
    assert upper < 100000
    assert settings.window_source == "theoretical-mass"
    light = resolve_deconvolution_settings("light-chain-mass", None)
    assert light.mass_range_da == ANALYTE_PROFILES["light-chain-mass"].default_mass_window_da


def test_derived_window_is_an_algorithm_envelope() -> None:
    lower, upper = derive_mass_window(148000.0, glycosylated=True)
    assert lower < 148000.0 < upper


def test_wiff_and_raw_uploads_are_rejected() -> None:
    with pytest.raises(UploadRejectedError) as wiff:
        validate_upload_content(filename="sample.wiff", content=b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1" + b"0" * 64)
    assert wiff.value.code == "VENDOR_FORMAT_NOT_ANALYSABLE"

    with pytest.raises(UploadRejectedError) as raw:
        validate_upload_content(filename="sample.raw", content=b"\x01\xa1F\x00i\x00n\x00" + b"0" * 64)
    assert raw.value.code == "VENDOR_FORMAT_NOT_ANALYSABLE"


def test_quality_gate_enum_cannot_pose_as_similarity() -> None:
    assert ThresholdKind.ALGORITHM_QUALITY_GATE.value == "algorithmQualityGate"
    assert ThresholdKind.SIMILARITY_BOUNDARY.value == "similarityBoundary"
