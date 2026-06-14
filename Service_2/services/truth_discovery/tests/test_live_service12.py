import os
import sys
import unittest
import requests

# Setup path resolution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.services.graph_client import GraphClient

class TestLiveService12Integration(unittest.TestCase):
    def setUp(self):
        # Point to the live deployed Service #12 load balancer
        self.original_url = settings.GRAPH_SERVICE_URL
        self.original_mock = settings.MOCK_AWS
        
        settings.GRAPH_SERVICE_URL = "http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com"
        settings.MOCK_AWS = False
        self.client = GraphClient()

    def tearDown(self):
        settings.GRAPH_SERVICE_URL = self.original_url
        settings.MOCK_AWS = self.original_mock

    def test_live_health_endpoint(self):
        """Verifies Service #12 health endpoint is reachable and reports healthy."""
        url = f"{settings.GRAPH_SERVICE_URL}/health"
        try:
            response = requests.get(url, timeout=5)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("status"), "healthy")
            self.assertEqual(data.get("service"), "Knowledge Graph Service")
        except requests.exceptions.RequestException as e:
            self.skipTest(f"Live Service #12 is unreachable: {e}")

    def test_live_product_intelligence_mapping(self):
        """Verifies that live product intelligence queries and response mapping work."""
        try:
            # We want to test that graph_client correctly translates and maps the response
            prod_intel = self.client.get_product_intelligence("PROD-B07XJ8C")
            self.assertIsNotNone(prod_intel.productId)
            self.assertEqual(prod_intel.productId, "PROD-B07XJ8C")
            self.assertIsInstance(prod_intel.returnRate, float)
            self.assertIsInstance(prod_intel.knownIssues, list)
        except requests.exceptions.RequestException as e:
            self.skipTest(f"Network error querying product intelligence: {e}")

    def test_live_seller_intelligence_mapping(self):
        """Verifies that live seller intelligence queries and response mapping work."""
        try:
            seller_intel = self.client.get_seller_intelligence("S123")
            self.assertIsNotNone(seller_intel.sellerId)
            self.assertEqual(seller_intel.sellerId, "S123")
            self.assertIsInstance(seller_intel.defectRate, float)
            self.assertIsInstance(seller_intel.trustScore, float)
            self.assertTrue(0.0 <= seller_intel.trustScore <= 1.0)
        except requests.exceptions.RequestException as e:
            self.skipTest(f"Network error querying seller intelligence: {e}")

    def test_verify_writeback_actual_contract(self):
        """Tests that verify_writeback successfully parses root_causes array."""
        # We simulate the exact payload structure returned by Service #12
        from unittest.mock import patch, MagicMock
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "return_id": "RET-100",
            "order_id": "ORD-100",
            "customer_id": "C-100",
            "product_id": "P-100",
            "reason": "DEFECTIVE",
            "timestamp": "2026-06-13T12:00:00Z",
            "root_causes": [
                {
                    "cause_id": "cause-1",
                    "return_id": "RET-100",
                    "category": "SIZE_MISMATCH",
                    "description": "Runs small",
                    "confidence": 0.95
                }
            ],
            "fraud_cases": [],
            "recovery_actions": [],
            "event_timeline": []
        }
        
        with patch("requests.get", return_value=mock_response) as mock_get:
            status = self.client.verify_writeback("RET-100", "SIZE_MISMATCH", retries=1)
            self.assertTrue(status)
            mock_get.assert_called_once_with(
                f"{settings.GRAPH_SERVICE_URL}/api/v1/returns/RET-100",
                timeout=5
            )

if __name__ == "__main__":
    unittest.main()
