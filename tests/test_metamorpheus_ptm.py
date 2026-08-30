import unittest

from backend.calculation_units import UNITS
from worker.metamorpheus_ptm import _mod_positions


class MetaMorpheusPtmAdapterTests(unittest.TestCase):
    def test_all_four_ptm_projects_share_the_isolated_adapter(self):
        for code in ("PTM-01", "PTM-02", "PTM-03", "PTM-04"):
            unit = UNITS[code]
            self.assertEqual("metamorpheus-flashlfq-ptm", unit.pipeline)
            self.assertEqual(("reference", "candidate", "fasta"), unit.required_roles)

    def test_native_metamorpheus_mod_annotations_are_positioned(self):
        positions = _mod_positions("PEM[Common Variable:Oxidation on M]TIDE")
        self.assertEqual(["Common Variable:Oxidation on M"], positions[3])


if __name__ == "__main__":
    unittest.main()
