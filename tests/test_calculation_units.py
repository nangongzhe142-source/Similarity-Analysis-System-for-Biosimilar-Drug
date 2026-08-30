import csv
import math
import tempfile
import unittest
from pathlib import Path

from backend.calculation_units import UNITS, adapt_openms_sage, compare_multi_lot
from worker.batch_pipeline_cli import _purity_peak_rows, chromatography_features, hplc_peaks, ingest_peak_area_table, normalize_glycresoft_csv, purity_csv_mode
from worker.sequence_evidence import build_sequence_coverage_from_tables


class CalculationUnitTests(unittest.TestCase):
    def test_first_batch_registry_is_complete(self):
        self.assertEqual({"SEQ-01", "SEQ-02", "SEQ-03", "SEQ-04", "COV-01", "COV-02", "PTM-01", "PTM-02", "PTM-03", "PTM-04"}, {code for code, unit in UNITS.items() if unit.batch == 1})

    def test_all_purity_units_share_the_chromatography_chain(self):
        for code in (f"PUR-{index:02d}" for index in range(1, 8)):
            self.assertIn("chromconverter", UNITS[code].pipeline)
            self.assertEqual(("reference", "candidate"), UNITS[code].required_roles)

    def test_reference_interval_is_primary_and_new_variant_is_warned(self):
        result = compare_multi_lot(
            [{"lot_id": "R1", "feature": "main", "value": 90}, {"lot_id": "R2", "feature": "main", "value": 91}, {"lot_id": "R3", "feature": "main", "value": 89}],
            [{"lot_id": "C1", "feature": "main", "value": 94}, {"lot_id": "C1", "feature": "novel", "value": 1}],
        )
        self.assertEqual("outside", result["candidateMarks"][0]["intervalStatus"])
        self.assertEqual("new-variant", result["candidateMarks"][1]["intervalStatus"])
        self.assertIsNone(result["decision"])

    def test_openms_sage_business_adapters(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            fasta = root / "target.fasta"
            fasta.write_text(">HC\nQMPEPTIDEK\n", encoding="utf-8")
            sage = root / "results.sage.tsv"
            fields = ["psm_id", "label", "spectrum_q", "filename", "peptide", "proteins", "ms2_intensity"]
            with sage.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=fields, delimiter="\t"); writer.writeheader()
                for index, filename in enumerate(("reference-001.mzML", "reference-002.mzML", "reference-003.mzML", "candidate-001.mzML"), 1):
                    writer.writerow({"psm_id": index, "label": 1, "spectrum_q": 0.001, "filename": filename, "peptide": "QM[+15.994915]PEPTIDEK", "proteins": "HC", "ms2_intensity": 100})
            ptm_fields = ["lot_id", "replicate_id", "protein_chain", "residue", "position", "modification", "value_percent", "identification_q_value", "risk_level", "quant_status"]
            reference_ptm, candidate_ptm = root / "reference.csv", root / "candidate.csv"
            with reference_ptm.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=ptm_fields); writer.writeheader()
                for index, value in enumerate((1.0, 1.1, 0.9), 1):
                    writer.writerow({"lot_id": f"R{index}", "replicate_id": 1, "protein_chain": "HC", "residue": "M", "position": 2, "modification": "Oxidation", "value_percent": value, "identification_q_value": 0.001, "risk_level": "medium", "quant_status": "quantified"})
            with candidate_ptm.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=ptm_fields); writer.writeheader(); writer.writerow({"lot_id": "C1", "replicate_id": 1, "protein_chain": "HC", "residue": "M", "position": 2, "modification": "Oxidation", "value_percent": 1.4, "identification_q_value": 0.001, "risk_level": "medium", "quant_status": "quantified"})
            seq = adapt_openms_sage("SEQ-02", sage, fasta, reference_ptm, candidate_ptm, {})
            cdr = adapt_openms_sage("SEQ-03", sage, fasta, reference_ptm, candidate_ptm, {"cdrRegions": [{"accession": "HC", "name": "CDR-H1", "start": 2, "end": 5}]})
            oxidation = adapt_openms_sage("PTM-01", sage, fasta, reference_ptm, candidate_ptm, {})
            self.assertEqual(100, seq["metrics"][0]["coveragePercent"])
            self.assertEqual(100, seq["comparisonTable"][0]["candidateCoveragePercent"])
            self.assertEqual(list(range(1, 11)), seq["sequenceCoverage"][0]["bothCoveredPositions"])
            self.assertGreater(cdr["metrics"]["matchingPeptideCount"], 0)
            self.assertEqual("outside", oxidation["comparison"]["candidateMarks"][0]["intervalStatus"])

    def test_hplc_py_and_glypy_result_adapters(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            trace = root / "canonical_trace.csv"
            with trace.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["time", "signal"]); writer.writeheader()
                for index in range(301):
                    x = index / 30
                    signal = 15 * math.exp(-0.5 * ((x - 3) / 0.2) ** 2) + 100 * math.exp(-0.5 * ((x - 5) / 0.25) ** 2) + 8 * math.exp(-0.5 * ((x - 7) / 0.2) ** 2)
                    writer.writerow({"time": x, "signal": signal})
            peaks = hplc_peaks(trace, {"prominence": 0.01, "approxPeakWidth": 0.5})
            self.assertGreaterEqual(len(peaks), 3)
            self.assertGreater(chromatography_features("PUR-02", peaks)["PUR-02"], 70)
            grouped, totals = _purity_peak_rows("PUR-01", peaks, {"peakWindows": {"HMW": [0, 4], "MAIN": [4, 6], "LMW": [6, 10]}})
            self.assertEqual(3, len(grouped))
            self.assertGreater(totals["MAIN"], 70)

            glyco = root / "glycresoft.csv"
            with glyco.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["glycan_composition", "abundance"]); writer.writeheader()
                writer.writerow({"glycan_composition": "{Hex:5; HexNAc:4; Fuc:1}", "abundance": 80})
                writer.writerow({"glycan_composition": "{Hex:5; HexNAc:4}", "abundance": 20})
            normalized = normalize_glycresoft_csv(glyco, "R01")
            self.assertAlmostEqual(100, sum(row["value"] for row in normalized))
            self.assertIn("Fuc", normalized[0]["feature"])

            exported = root / "analysis-glycopeptides.csv"
            with exported.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["glycopeptide", "total_signal"]); writer.writeheader()
                writer.writerow({"glycopeptide": "PEPTIDE{Hex:5; HexNAc:4}", "total_signal": 30})
                writer.writerow({"glycopeptide": "OTHER{Hex:5; HexNAc:4}", "total_signal": 20})
                writer.writerow({"glycopeptide": "PEPTIDE{Fuc:1; Hex:5; HexNAc:4}", "total_signal": 50})
            actual_export = normalize_glycresoft_csv(exported, "R02")
            self.assertEqual(2, len(actual_export))
            self.assertAlmostEqual(100, sum(row["value"] for row in actual_export))
            self.assertEqual(50, next(row["value"] for row in actual_export if "Fuc" not in row["feature"]))

    def test_purity_peak_area_table_signature_and_ingestion(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            report = root / "peak-area.csv"
            with report.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["峰名", "保留时间", "峰面积百分比", "峰分组"]); writer.writeheader()
                writer.writerows([
                    {"峰名": "HMW-1", "保留时间": 3, "峰面积百分比": 2, "峰分组": "HMW"},
                    {"峰名": "Monomer", "保留时间": 5, "峰面积百分比": 96, "峰分组": "MAIN"},
                    {"峰名": "LMW-1", "保留时间": 7, "峰面积百分比": 2, "峰分组": "LMW"},
                ])
            self.assertEqual("peak-table", purity_csv_mode(report))
            rows, totals = ingest_peak_area_table(report, "PUR-01", {})
            self.assertEqual(3, len(rows)); self.assertAlmostEqual(2, totals["HMW"])
            self.assertEqual("HMW-1", rows[0]["peakId"])
            bad = root / "bad.csv"; bad.write_text("foo,bar\n1,2\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "既不符合时间-信号曲线"):
                purity_csv_mode(bad)

    def test_external_peptide_table_coverage_and_q_filter(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            fasta = root / "antibody.fasta"; fasta.write_text(">HC\nMPEPTIDEKAAAAAAAKVVVVVVK\n>LC\nACDEFGHIKLMNPQRST\n", encoding="utf-8")
            reference, candidate = root / "reference.csv", root / "candidate.csv"
            fields = ["accession", "peptide_sequence", "q_value", "source_file"]
            with reference.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader()
                writer.writerow({"accession": "HC", "peptide_sequence": "MPEPTIDEK", "q_value": 0.005, "source_file": "R.raw"})
                writer.writerow({"accession": "LC", "peptide_sequence": "ACDEFGHIK", "q_value": 0.02, "source_file": "R.raw"})
            with candidate.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=fields); writer.writeheader()
                writer.writerow({"accession": "HC", "peptide_sequence": "MPEPTIDEK", "q_value": 0.001, "source_file": "C.raw"})
                writer.writerow({"accession": "LC", "peptide_sequence": "ACDEFGHIK", "q_value": 0.001, "source_file": "C.raw"})
            result = build_sequence_coverage_from_tables("SEQ-01", [("reference", "R01", reference), ("candidate", "C01", candidate)], fasta)
            hc = next(row for row in result["comparisonTable"] if row["accession"] == "HC")
            lc = next(row for row in result["comparisonTable"] if row["accession"] == "LC")
            self.assertAlmostEqual(37.5, hc["referenceCoveragePercent"])
            self.assertAlmostEqual(37.5, hc["candidateCoveragePercent"])
            self.assertEqual(0, lc["referenceCoveragePercent"])
            self.assertAlmostEqual(52.941176, lc["candidateCoveragePercent"])
            self.assertEqual(3, len(result["evidence"]))


if __name__ == "__main__":
    unittest.main()
