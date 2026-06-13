import os
import sys
import json
import unittest
from unittest.mock import MagicMock, patch

# Force production imports paths but with mock toggled for manual control
os.environ["MOCK_AWS"] = "false"
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.event_publisher import EventPublisher

class TestEventPublisher(unittest.TestCase):
    def setUp(self):
        from app.config import settings
        settings.MOCK_AWS = False
        
        self.mock_boto_patcher = patch("boto3.client")
        self.mock_boto = self.mock_boto_patcher.start()
        
        self.mock_client = MagicMock()
        self.mock_boto.return_value = self.mock_client
        
        self.publisher = EventPublisher()

    def tearDown(self):
        self.mock_boto_patcher.stop()

    def test_publish_root_cause_discovered_success(self):
        # Setup mock return value for put_events
        self.mock_client.put_events.return_value = {
            "FailedEntryCount": 0,
            "Entries": [
                {
                    "EventId": "evt_123456789"
                }
            ]
        }

        # Execute
        status = self.publisher.publish_root_cause_discovered(
            return_id="RET123",
            product_id="P123",
            root_cause="COMPATIBILITY_ISSUE",
            confidence=0.93
        )

        # Assertions
        self.assertTrue(status)
        self.mock_client.put_events.assert_called_once()
        
        # Verify event parameters
        called_args = self.mock_client.put_events.call_args[1]
        entries = called_args["Entries"]
        self.assertEqual(len(entries), 1)
        
        entry = entries[0]
        self.assertEqual(entry["Source"], "aws.circular.intelligence.tde")
        self.assertEqual(entry["DetailType"], "RootCauseDiscovered")
        
        detail = json.loads(entry["Detail"])
        self.assertEqual(detail["returnId"], "RET123")
        self.assertEqual(detail["productId"], "P123")
        self.assertEqual(detail["rootCause"], "COMPATIBILITY_ISSUE")
        self.assertEqual(detail["confidence"], 0.93)
        self.assertIn("timestamp", detail)

    def test_publish_root_cause_failed_response(self):
        # Simulate a partial failure in put_events (FailedEntryCount > 0)
        self.mock_client.put_events.return_value = {
            "FailedEntryCount": 1,
            "Entries": [
                {
                    "ErrorCode": "InternalFailure",
                    "ErrorMessage": "Failed to process event entry."
                }
            ]
        }

        # Execute
        status = self.publisher.publish_root_cause_discovered(
            return_id="RET123",
            product_id="P123",
            root_cause="COMPATIBILITY_ISSUE",
            confidence=0.93
        )

        # Assertions
        self.assertFalse(status)

if __name__ == "__main__":
    unittest.main()
