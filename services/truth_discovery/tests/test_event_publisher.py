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
        self.assertEqual(entry["DetailType"], "ReturnAnalysisCompleted")
        
        detail = json.loads(entry["Detail"])
        self.assertEqual(detail["returnId"], "RET123")
        self.assertEqual(detail["productId"], "P123")
        self.assertEqual(detail["actualRootCause"], "Software Compatibility")
        self.assertEqual(detail["confidence"], 0.93)
        self.assertIn("timestamp", detail)
        self.assertIn("evidence", detail)
        self.assertIn("recommendations", detail)
        self.assertEqual(detail["recommendations"]["routingAction"], "REFURBISH_PROCESS")
        self.assertEqual(detail["recommendations"]["sellerAction"], "UPDATE_FIRMWARE")

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

    def test_event_payload_schema_contract_validation(self):
        """Validates that the emitted payload strictly conforms to analysis_completed_event.json schema contract."""
        self.mock_client.put_events.return_value = {"FailedEntryCount": 0, "Entries": []}
        
        # 1. Load the actual JSON Schema Contract
        test_dir = os.path.dirname(os.path.abspath(__file__))
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(test_dir)))
        schema_path = os.path.join(base_dir, "events", "analysis_completed_event.json")
        
        with open(schema_path, "r") as f:
            schema = json.load(f)
            
        # 2. Publish an event to capture the generated detail payload
        self.publisher.publish_root_cause_discovered(
            return_id="RET123",
            product_id="P123",
            root_cause="SIZE_MISMATCH",
            confidence=0.95,
            evidence=["Item runs small in chest"],
            recommendations={"routingAction": "RESTOCK_AS_NEW", "sellerAction": "INVENT_SIZE_GUIDE"}
        )
        
        called_args = self.mock_client.put_events.call_args[1]
        entry = called_args["Entries"][0]
        
        # 3. Validate outer envelope matching the JSON schema
        self.assertEqual(entry["Source"], schema["properties"]["Source"]["const"])
        self.assertEqual(entry["DetailType"], schema["properties"]["DetailType"]["const"])
        
        # 4. Validate detail fields and required properties
        detail = json.loads(entry["Detail"])
        detail_schema = schema["properties"]["Detail"]
        required_fields = detail_schema["required"]
        
        for field in required_fields:
            self.assertIn(field, detail, f"Required field '{field}' is missing from detail payload.")
            
        # 5. Validate enums
        allowed_causes = detail_schema["properties"]["actualRootCause"]["enum"]
        self.assertIn(detail["actualRootCause"], allowed_causes, f"actualRootCause '{detail['actualRootCause']}' is not in the allowed schema enums.")
        
        # 6. Validate types
        self.assertIsInstance(detail["returnId"], str)
        self.assertIsInstance(detail["productId"], str)
        self.assertIsInstance(detail["confidence"], (int, float))
        self.assertIsInstance(detail["evidence"], list)
        self.assertIsInstance(detail["recommendations"], dict)
        self.assertIsInstance(detail["timestamp"], str)
        
        # Validate timestamp ends with Z or has date-time shape
        self.assertTrue(detail["timestamp"].endswith("Z"))

if __name__ == "__main__":
    unittest.main()
