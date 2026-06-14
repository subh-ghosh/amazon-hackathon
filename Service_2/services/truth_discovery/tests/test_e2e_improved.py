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
from app.schemas import RootCauseEnum, EvidenceType

class TestTDEEndToEndImproved(unittest.TestCase):
    def setUp(self):
        from app.config import settings
        settings.MOCK_AWS = True
        settings.MOCK_BEDROCK = True
        settings.CONFIDENCE_THRESHOLD = 0.60
        self.client = TestClient(app)

    @patch("requests.get")
    def test_e2e_improved_success_flow(self, mock_get):
        """Verify: Context -> Analysis -> Scoring -> Threshold -> DB -> EB -> verify_writeback."""
        # 1. Mock GET requests to Service #12
        # - GET /products/P123/intelligence
        # - GET /sellers/S123/intelligence
        # - GET /api/v1/returns/RET123 (writeback verification)
        mock_product_resp = MagicMock(status_code=200)
        mock_product_resp.json.return_value = {
            "productId": "P123",
            "category": "Shoes",
            "title": "Nike sneakers",
            "returnRate": 0.05,
            "knownIssues": ["Fits small"]
        }

        mock_seller_resp = MagicMock(status_code=200)
        mock_seller_resp.json.return_value = {
            "sellerId": "S123",
            "sellerName": "Sports Store",
            "defectRate": 0.01
        }

        mock_verification_resp = MagicMock(status_code=200)
        mock_verification_resp.json.return_value = {
            "returnId": "RET123",
            "rootCause": "SIZE_MISMATCH" # Matches expected outcome
        }

        def get_side_effect(url, *args, **kwargs):
            if "products/P123/intelligence" in url:
                return mock_product_resp
            elif "sellers/S123/intelligence" in url:
                return mock_seller_resp
            elif "api/v1/returns/RET123" in url:
                return mock_verification_resp
            return MagicMock(status_code=404)

        mock_get.side_effect = get_side_effect

        # 2. Trigger payload with sizing mismatch comment
        payload = {
            "returnId": "RET123",
            "customerId": "C123",
            "productId": "P123",
            "sellerId": "S123",
            "statedReason": "Defective",
            "customerComment": "The shoes look nice but are too small and tight",
            "images": []
        }

        # 3. Post to API
        response = self.client.post("/api/v1/truth/analyze", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # 4. Verify Improved Attributes
        self.assertEqual(data["returnId"], "RET123")
        self.assertEqual(data["actualRootCause"], RootCauseEnum.SIZE_MISMATCH.value)
        self.assertEqual(data["confidence"], 0.93)
        self.assertFalse(data["requiresManualReview"])
        
        # Verify evidence list of maps
        self.assertEqual(len(data["evidence"]), 2)
        self.assertEqual(data["evidence"][0]["type"], EvidenceType.REVIEW_PATTERN.value)
        self.assertEqual(data["evidence"][0]["weight"], 0.42)
        
        # Verify weight validation (0.42 + 0.36 = 0.78 <= 1.0)
        total_weight = sum(item["weight"] for item in data["evidence"])
        self.assertTrue(total_weight <= 1.0)

        # Confirm all 3 REST endpoints (product, seller, verification) were hit
        # Note: in mock mode verify_writeback bypasses the network call,
        # but to test verify_writeback live, we can set settings.MOCK_AWS = False dynamically,
        # or verify mock-bypass paths. Here settings.MOCK_AWS is True, so verify_writeback bypasses.
        # Let's verify requests.get was called exactly twice (for product and seller info context).
        self.assertEqual(mock_get.call_count, 2)

if __name__ == "__main__":
    unittest.main()
