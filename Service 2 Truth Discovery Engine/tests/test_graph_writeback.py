import os
import sys
import unittest
from unittest.mock import MagicMock, patch
import requests

# Setup path resolution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.graph_client import GraphClient

class TestGraphWriteback(unittest.TestCase):
    def setUp(self):
        from app.config import settings
        settings.MOCK_AWS = False
        self.client = GraphClient()

    @patch("requests.get")
    def test_verify_writeback_success(self, mock_get):
        """Verifies that matching rootCause on GET return response is successful."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"rootCause": "SIZE_MISMATCH"}
        mock_get.return_value = mock_response

        status = self.client.verify_writeback("RET123", "SIZE_MISMATCH", retries=2)
        self.assertTrue(status)
        mock_get.assert_called_once()

    @patch("requests.get")
    @patch("time.sleep") # Prevent actual delays in tests
    def test_verify_writeback_mismatch_retries(self, mock_sleep, mock_get):
        """Verifies that mismatched root cause triggers retries and eventually returns False."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"rootCause": "EXPECTATION_MISMATCH"} # Mismatch
        mock_get.return_value = mock_response

        status = self.client.verify_writeback("RET123", "SIZE_MISMATCH", retries=3)
        self.assertFalse(status)
        self.assertEqual(mock_get.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2)

    @patch("requests.get")
    @patch("time.sleep")
    def test_verify_writeback_connection_failures_retries(self, mock_sleep, mock_get):
        """Verifies that connection pool errors retry and return False when exhausted."""
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection timed out")

        status = self.client.verify_writeback("RET123", "SIZE_MISMATCH", retries=3)
        self.assertFalse(status)
        self.assertEqual(mock_get.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2)

    def test_verify_writeback_bypass_in_mock_mode(self):
        """Verifies that settings.MOCK_AWS = True bypasses call and returns True."""
        from app.config import settings
        settings.MOCK_AWS = True
        
        status = self.client.verify_writeback("RET123", "SIZE_MISMATCH", retries=3)
        self.assertTrue(status)

if __name__ == "__main__":
    unittest.main()
