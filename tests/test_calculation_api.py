import unittest

from backend.calculation_router import calculation_units
from backend.service import app


class CalculationApiTests(unittest.TestCase):
    def test_unified_registry_and_readiness_are_exposed(self):
        self.assertIn("/calculation-units", {route.path for route in app.routes})
        payload = calculation_units()
        self.assertEqual(26, len(payload["units"]))
        self.assertTrue({f"GLY-{index:02d}" for index in range(2, 7)} <= {unit["code"] for unit in payload["units"]})
        self.assertTrue({f"PTM-{index:02d}" for index in range(1, 5)} <= {unit["code"] for unit in payload["units"]})
        self.assertTrue({f"PUR-{index:02d}" for index in range(1, 8)} <= {unit["code"] for unit in payload["units"]})
        self.assertIn("/api/jobs", {route.path for route in app.routes})
        self.assertEqual("implemented", payload["adapterRegistry"]["adapters"][0]["status"])
        self.assertTrue(payload["readiness"]["batch1"]["technicalReady"])
        self.assertTrue(payload["readiness"]["batch2"]["technicalReadyForCanonicalCsv"])
        self.assertTrue(payload["readiness"]["batch2"]["technicalReadyForPurityCsv"])
        self.assertTrue(payload["readiness"]["batch2"]["technicalReadyForVendorRaw"])
        self.assertTrue(payload["readiness"]["batch3"]["technicalReady"])


if __name__ == "__main__":
    unittest.main()
