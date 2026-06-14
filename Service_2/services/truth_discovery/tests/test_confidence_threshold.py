import os
import sys
import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

# Mock environment before importing app
os.environ["MOCK_AWS"] = "true"
os.environ["MOCK_BEDROCK"] = "true"
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.schemas import RootCauseEnum

class TestConfidenceThreshold(unittest.TestCase):
    def setUp(self):
        from app.config import settings
        settings.MOCK_AWS = True
        settings.MOCK_BEDROCK = True
        settings.CONFIDENCE_THRESHOLD = 0.60
        self.client = TestClient(app)

    @patch("app.services.bedrock_service.BedrockService.discover_root_cause")
    def test_low_confidence_review_trigger(self, mock_discover):
        """Verify that confidence < 0.60 overrides cause to EXPECTATION_MISMATCH and sets requiresManualReview=True."""
        mock_discover.return_value = {
            "rootCause": "SIZE_MISMATCH",
            "confidence": 0.55,
            "evidence": [
                {"type": "REVIEW_PATTERN", "description": "Weak pattern matching reviews", "weight": 0.20}
            ]
        }

        payload = {
            "returnId": "RET123",
            "customerId": "C123",
            "productId": "P123",
            "sellerId": "S123",
            "statedReason": "Defective",
            "customerComment": "Too tight in the toe box",
            "images": []
        }

        response = self.client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Assertions
        self.assertEqual(data["confidence"], 0.55)
        self.assertEqual(data["actualRootCause"], RootCauseEnum.EXPECTATION_MISMATCH.value)
        self.assertTrue(data["requiresManualReview"])

    @patch("app.services.bedrock_service.BedrockService.discover_root_cause")
    def test_high_confidence_bypass(self, mock_discover):
        """Verify that confidence >= 0.60 preserves rootCause and sets requiresManualReview=False."""
        mock_discover.return_value = {
            "rootCause": "SIZE_MISMATCH",
            "confidence": 0.88,
            "evidence": [
                {"type": "REVIEW_PATTERN", "description": "Strong pattern matching reviews", "weight": 0.40}
            ]
        }

        payload = {
            "returnId": "RET123",
            "customerId": "C123",
            "productId": "P123",
            "sellerId": "S123",
            "statedReason": "Defective",
            "customerComment": "Too tight in the toe box",
            "images": []
        }

        response = self.client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Assertions
        self.assertEqual(data["confidence"], 0.88)
        self.assertEqual(data["actualRootCause"], RootCauseEnum.SIZE_MISMATCH.value)
        self.assertFalse(data["requiresManualReview"])

    @patch("app.services.bedrock_service.BedrockService.discover_root_cause")
    def test_custom_configurable_threshold(self, mock_discover):
        """Verify that threshold responds dynamically to custom Settings overrides."""
        from app.config import settings
        settings.CONFIDENCE_THRESHOLD = 0.80 # Increase threshold

        mock_discover.return_value = {
            "rootCause": "COMPATIBILITY_ISSUE",
            "confidence": 0.75, # Below new threshold, above old
            "evidence": [
                {"type": "HEURISTIC_RULE", "description": "Mismatched software versions", "weight": 0.50}
            ]
        }

        payload = {
            "returnId": "RET123",
            "customerId": "C123",
            "productId": "P123",
            "sellerId": "S123",
            "statedReason": "Defective",
            "customerComment": "App won't connect",
            "images": []
        }

        response = self.client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["actualRootCause"], RootCauseEnum.EXPECTATION_MISMATCH.value)
        self.assertTrue(data["requiresManualReview"])

if __name__ == "__main__":
    unittest.main()
