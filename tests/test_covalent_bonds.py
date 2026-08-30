import tempfile
import unittest
from pathlib import Path

from worker.covalent_bonds import calculate_ellman, theoretical_disulfide_peptides, write_kojak_config


class CovalentBondTests(unittest.TestCase):
    def test_ellman_formula_uses_blank_dilution_and_protein_mw(self):
        result = calculate_ellman({
            "absorbance412": 0.25, "blankAbsorbance412": 0.02,
            "dilutionFactor": 2, "proteinConcentrationMgMl": 1,
            "volumeMl": 1, "pathLengthCm": 1,
            "proteinMolecularWeightDa": 150000, "epsilonTnb": 14150,
        })
        self.assertAlmostEqual((0.23 * 2 * 150000) / 14150, result["molShPerMolProtein"], places=8)
        self.assertIsNone(result["decision"])

    def test_ellman_configured_warning_and_hmw_context(self):
        result = calculate_ellman({
            "absorbance412": 0.25, "blankAbsorbance412": 0.02,
            "dilutionFactor": 2, "proteinConcentrationMgMl": 1,
            "volumeMl": 1, "pathLengthCm": 1,
            "proteinMolecularWeightDa": 150000, "epsilonTnb": 14150,
            "riskThresholdMolShPerMolProtein": 0.5, "hmwPercent": 1.2,
        })
        self.assertEqual(
            {"FREE_THIOL_ABOVE_CONFIGURED_LINE", "HMW_CONTEXT_LINKED"},
            {item["code"] for item in result["warnings"]},
        )
        self.assertIsNone(result["decision"])

    def test_theoretical_pairs_are_cysteine_specific(self):
        with tempfile.TemporaryDirectory() as temporary:
            fasta = Path(temporary) / "antibody.fasta"
            fasta.write_text(">HC\nACKCDEFGK\n>LC\nRACFGK\n", encoding="utf-8")
            pairs = theoretical_disulfide_peptides(fasta)
            self.assertTrue(pairs)
            self.assertTrue(all("C" in item["peptide1"] and "C" in item["peptide2"] for item in pairs))
            self.assertTrue(all(item["linkMassDa"] == -2.01565 for item in pairs))

    def test_kojak_config_removes_fixed_cys_and_adds_disulfide(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary); template = root / "default.conf"; target = root / "run.conf"
            template.write_text("threads = 8\nMS_data_file = x\ndatabase = x\nresults_path = .\nexport_pepXML = 1\nexport_percolator = 0\npredefined_crosslink = 1\nfixed_modification = C 57.02146\nmax_miscleavages = 2\ndecoy_filter = DECOY 0\nmax_mods_per_peptide = 0\ndiff_mods_on_xl = 0\n", encoding="utf-8")
            write_kojak_config(template, target, root / "data.mzML", root / "a.fasta", root, 4)
            text = target.read_text(encoding="utf-8")
            self.assertIn("cross_link = C C -2.01565 DISULFIDE", text)
            self.assertIn("# fixed_modification = C 57.02146", text)
            self.assertIn("# predefined_crosslink = 1", text)


if __name__ == "__main__":
    unittest.main()
