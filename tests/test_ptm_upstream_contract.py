from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.ptm_upstream_contract import FragPipePTMEvidence, GateEvidence, evaluate_fragpipe_ptm_evidence


PASS = GateEvidence(evaluated=True, passed=True)


class FragPipePTMContractTests(unittest.TestCase):
    def test_zero_exit_without_output_is_quality_blocked(self) -> None:
        decision = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(True, False))
        self.assertEqual(decision.business_status, "quality_blocked")
        self.assertFalse(decision.ptm_comparison_completed)
        self.assertIsNone(decision.comparison)

    def test_output_presence_alone_is_only_upstream_completed(self) -> None:
        decision = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(True, True))
        self.assertEqual(decision.business_status, "upstream_completed")
        self.assertEqual(decision.next_required_gate, "output_contract_parsing")

    def test_parsed_output_waits_for_quality_gate(self) -> None:
        decision = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(True, True, True))
        self.assertEqual(decision.business_status, "awaiting_quality_gate")
        self.assertEqual(decision.next_required_gate, "fdr")

    def test_failed_fdr_is_quality_blocked(self) -> None:
        decision = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(
            True, True, True, fdr=GateEvidence(evaluated=True, passed=False),
        ))
        self.assertEqual(decision.business_status, "quality_blocked")
        self.assertIn("FDR", decision.blocking_reasons[0])

    def test_identification_quality_passes_but_waits_for_xic(self) -> None:
        decision = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(
            True, True, True, fdr=PASS, localization=PASS, system_suitability=PASS,
        ))
        self.assertEqual(decision.business_status, "awaiting_quantification")
        self.assertEqual(decision.next_required_gate, "xic_quantification")

    def test_validated_ptm_table_waits_for_interval(self) -> None:
        decision = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(
            True, True, True, fdr=PASS, localization=PASS, system_suitability=PASS,
            quantification=PASS, unified_ptm_table_validated=True,
        ))
        self.assertEqual(decision.business_status, "awaiting_interval")
        self.assertFalse(decision.ptm_comparison_completed)
        self.assertIsNone(decision.comparison)

    def test_only_interval_result_can_complete_ptm_business_task(self) -> None:
        comparison = {"summary": {"outsideIntervalCount": 1}}
        decision = evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(
            True, True, True, fdr=PASS, localization=PASS, system_suitability=PASS,
            quantification=PASS, unified_ptm_table_validated=True,
            interval_completed=True, comparison=comparison,
        ))
        self.assertEqual(decision.business_status, "completed")
        self.assertTrue(decision.ptm_comparison_completed)
        self.assertEqual(decision.comparison, comparison)

    def test_comparison_cannot_exist_before_interval_completion(self) -> None:
        with self.assertRaisesRegex(ValueError, "不得附带comparison"):
            evaluate_fragpipe_ptm_evidence(FragPipePTMEvidence(
                True, True, comparison={"invalid": True},
            ))


if __name__ == "__main__":
    unittest.main()
