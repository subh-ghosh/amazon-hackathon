import os
import sys
import unittest
from fastapi.testclient import TestClient

# Mock environment before importing app
os.environ["MOCK_AWS"] = "true"
os.environ["MOCK_BEDROCK"] = "true"

# Setup sys.path to resolve truth_discovery folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

class TestTruthDiscoveryAPI(unittest.TestCase):
    def setUp(self):
        from app.config import settings
        settings.MOCK_AWS = True
        settings.MOCK_BEDROCK = True
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_analyze_endpoint_sizing(self):
        payload = {
            "returnId": "RET123",
            "customerId": "C123",
            "productId": "P123",
            "sellerId": "S123",
            "statedReason": "Defective",
            "customerComment": "Item runs extremely tight, size is too small",
            "images": ["s3://bucket/image.jpg"]
        }
        response = self.client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["returnId"], "RET123")
        self.assertEqual(data["actualRootCause"], "SIZE_MISMATCH")
        self.assertIn("size", data["evidence"][0]["description"].lower())

    def test_analyze_invalid_payload(self):
        # Missing required productId
        payload = {
            "returnId": "RET123",
            "customerId": "C123",
            "sellerId": "S123",
            "statedReason": "Defective",
            "customerComment": "Too small"
        }
        response = self.client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 422) # Unprocessable Entity validation error

if __name__ == "__main__":
    unittest.main()
