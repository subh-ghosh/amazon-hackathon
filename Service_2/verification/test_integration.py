import os
import sys
import unittest
from datetime import datetime

# Force mock mode for integration test suite
os.environ["MOCK_AWS"] = "true"
os.environ["MOCK_BEDROCK"] = "true"
os.environ["MOCK_AWS_SERVICES"] = "true"

# Configure sys.path and load apps from different folders while avoiding collisions
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

try:
    from fastapi.testclient import TestClient
except ImportError:
    print("Please run: pip install fastapi uvicorn requests pydantic pydantic-settings")
    sys.exit(1)

import importlib.util

def load_module_from_path(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

# 1. Load Truth Discovery App
sys.path.insert(0, os.path.join(BASE_DIR, "services", "truth_discovery"))
truth_main = load_module_from_path("truth_main", os.path.join(BASE_DIR, "services", "truth_discovery", "app", "main.py"))

# Clean up sys.modules cache for 'app' and its children to avoid import collisions
for key in list(sys.modules.keys()):
    if key == 'app' or key.startswith('app.'):
        del sys.modules[key]
sys.path.pop(0)

# 2. Load Fraud Trust App
sys.path.insert(0, os.path.join(BASE_DIR, "services", "fraud_trust"))
fraud_main = load_module_from_path("fraud_main", os.path.join(BASE_DIR, "services", "fraud_trust", "app", "main.py"))
sys.path.pop(0)

class TestCircularIntelligenceOS(unittest.TestCase):
    def setUp(self):
        self.truth_client = TestClient(truth_main.app)
        self.fraud_client = TestClient(fraud_main.app)

    def test_truth_discovery_health(self):
        response = self.truth_client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")
        self.assertTrue(response.json()["mock_mode"])

    def test_fraud_trust_health(self):
        response = self.fraud_client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")
        self.assertTrue(response.json()["mock_mode"])

    def test_truth_discovery_analysis_sizing(self):
        payload = {
            "returnId": "RET-990812",
            "customerId": "CUST-10928",
            "productId": "PROD-B07XJ8C",
            "statedReason": "Defective",
            "customerComment": "The shirt is beautiful but unfortunately it runs way too small around the chest.",
            "images": ["s3://amazon-circular-intel-returns/returns/RET-990812/item_front.jpg"]
        }
        response = self.truth_client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["returnId"], "RET-990812")
        self.assertEqual(data["actualRootCause"], "SIZE_MISMATCH")
        self.assertGreater(data["confidence"], 0.8)
        self.assertTrue(any("size" in e["description"].lower() or "fit" in e["description"].lower() for e in data["evidence"]))
        self.assertEqual(data["recommendations"]["routingAction"], "RESTOCK_AS_NEW")
        self.assertEqual(data["recommendations"]["sellerAction"], "INVENT_SIZE_GUIDE")

    def test_truth_discovery_analysis_compatibility(self):
        payload = {
            "returnId": "RET-990813",
            "customerId": "CUST-10928",
            "productId": "PROD-B07XJ8C",
            "statedReason": "Defective",
            "customerComment": "Will not connect to my iOS 17 device. Blue tooth times out.",
            "images": []
        }
        response = self.truth_client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["actualRootCause"], "COMPATIBILITY_ISSUE")
        self.assertEqual(data["recommendations"]["routingAction"], "REFURBISH_PROCESS")

    def test_fraud_scoring_high_risk(self):
        # customerId "CUST-10928" triggers mock high risk customer profile
        payload = {
            "customerId": "CUST-10928",
            "productId": "PROD-B07XJ8C",
            "returnId": "RET-990812",
            "paymentMethodHash": "pm_8a39df1c0", # Triggers shared card link
            "deviceId": "dev_mac_990f11", # Triggers shared device link
            "returnHistory": [
                {
                    "returnId": "RET-980123",
                    "status": "COMPLETED",
                    "daysToReturn": 3,
                    "refundIssued": True
                }
            ],
            "images": [
                "s3://amazon-circular-intel-returns/returns/RET-990812/item_label.jpg"
            ]
        }
        response = self.fraud_client.post("/api/v1/fraud/score", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["returnId"], "RET-990812")
        self.assertGreaterEqual(data["fraudScore"], 0.7)
        self.assertEqual(data["riskLevel"], "HIGH")
        self.assertEqual(data["recommendedAction"], "Manual Review")
        self.assertTrue(any("Graph alert" in f for f in data["riskFactors"]))

    def test_fraud_scoring_low_risk(self):
        # Generic customer ID triggers safe defaults
        payload = {
            "customerId": "CUST-SAFE-01",
            "productId": "PROD-B07XNEW",
            "returnId": "RET-990899",
            "paymentMethodHash": "pm_safe_hash_1",
            "deviceId": "dev_safe_device",
            "returnHistory": [],
            "images": []
        }
        response = self.fraud_client.post("/api/v1/fraud/score", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["riskLevel"], "LOW")
        self.assertEqual(data["recommendedAction"], "Auto Refund")

if __name__ == "__main__":
    unittest.main()
