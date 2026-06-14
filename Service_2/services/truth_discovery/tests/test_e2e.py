import os
import sys
import unittest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

# Mock environment variables to isolate execution for test run
os.environ["MOCK_AWS"] = "true"
os.environ["MOCK_BEDROCK"] = "true"
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.schemas import RootCauseEnum

class TestTDEEndToEndFlow(unittest.TestCase):
    def setUp(self):
        from app.config import settings
        settings.MOCK_AWS = True
        settings.MOCK_BEDROCK = True
        self.client = TestClient(app)

    @patch("requests.get")
    def test_e2e_successful_return_flow(self, mock_get):
        """Simulates: Return Initiated -> TDE Call -> Query Service 12 -> Bedrock -> DDB Log -> EventBridge."""
        
        # 1. Setup Mock responses for Service #12 Graph Intelligence GET endpoints
        # Mock Product Intelligence GET response
        mock_product_response = MagicMock()
        mock_product_response.status_code = 200
        mock_product_response.json.return_value = {
            "productId": "P123",
            "category": "Apparel",
            "title": "Running Shoes",
            "description": "Standard sizing sports footwear",
            "returnRate": 0.12,
            "knownIssues": ["Fits half size smaller than expected"]
        }

        # Mock Seller Intelligence GET response
        mock_seller_response = MagicMock()
        mock_seller_response.status_code = 200
        mock_seller_response.json.return_value = {
            "sellerId": "S123",
            "sellerName": "Footwear Outlet",
            "defectRate": 0.02,
            "counterfeitAlerts": 0,
            "trustScore": 0.94
        }

        # Side effect to handle multiple URLs queried during request
        def get_side_effect(url, *args, **kwargs):
            if "products/P123/intelligence" in url:
                return mock_product_response
            elif "sellers/S123/intelligence" in url:
                return mock_seller_response
            return MagicMock(status_code=404)

        mock_get.side_effect = get_side_effect

        # 2. Trigger TDE analyze endpoint with size mismatch comment
        payload = {
            "returnId": "RET123",
            "customerId": "C123",
            "productId": "P123",
            "sellerId": "S123",
            "statedReason": "Defective",
            "customerComment": "Too tight in the toes, size runs small",
            "images": ["s3://bucket/image.jpg"]
        }

        # 3. Call endpoint
        response = self.client.post("/api/v1/truth/analyze", json=payload)

        # 4. Verify end-to-end outcomes
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Schema checks
        self.assertEqual(data["returnId"], "RET123")
        self.assertEqual(data["actualRootCause"], RootCauseEnum.SIZE_MISMATCH.value)
        self.assertIn("size", data["evidence"][0]["description"].lower())
        
        # Confirm Service #12 REST calls were triggered
        self.assertEqual(mock_get.call_count, 2)

if __name__ == "__main__":
    sys.exit(unittest.main())
