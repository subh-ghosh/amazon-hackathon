import os
import sys
import json
import unittest
from unittest.mock import MagicMock, patch

# Force production imports paths but with mock toggled for manual control
os.environ["MOCK_AWS"] = "false"
os.environ["MOCK_BEDROCK"] = "false"
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas import (
    TruthAnalyzeRequest, 
    ProductIntelligence, 
    SellerIntelligence, 
    RootCauseEnum
)
from app.services.bedrock_service import BedrockService

class TestBedrockMockReasoning(unittest.TestCase):
    def setUp(self):
        from app.config import settings
        settings.MOCK_AWS = False
        settings.MOCK_BEDROCK = False
        
        # We patch boto3 client creation to return mock runtime client
        self.mock_boto_patcher = patch("boto3.client")
        self.mock_boto = self.mock_boto_patcher.start()
        
        self.mock_client = MagicMock()
        self.mock_boto.return_value = self.mock_client
        
        self.service = BedrockService()
        
        self.request = TruthAnalyzeRequest(
            returnId="RET123",
            customerId="C123",
            productId="P123",
            sellerId="S123",
            statedReason="Defective",
            customerComment="Item does not connect to iPad iOS 17 app.",
            images=[]
        )
        self.product_intel = ProductIntelligence(
            productId="P123",
            category="Electronics",
            title="Smart Camera",
            description="Reference device",
            returnRate=0.03,
            knownIssues=["Bluetooth sync fails frequently"]
        )
        self.seller_intel = SellerIntelligence(
            sellerId="S123",
            defectRate=0.01
        )

    def tearDown(self):
        self.mock_boto_patcher.stop()

    def test_successful_bedrock_parse(self):
        # Setup mock response body return values
        mock_response = MagicMock()
        mock_body = MagicMock()
        
        # Claude response details with structured evidence maps
        claude_response_json = {
            "rootCause": "COMPATIBILITY_ISSUE",
            "confidence": 0.95,
            "evidence": [
                {"type": "REVIEW_PATTERN", "description": "Customer iPad reports sync issues", "weight": 0.45},
                {"type": "METADATA_DISCREPANCY", "description": "Known bluetooth firmware bugs active", "weight": 0.40}
            ]
        }
        
        # Format for bedrock response
        mock_body.read.return_value = json.dumps({
            "content": [
                {
                    "text": json.dumps(claude_response_json)
                }
            ]
        }).encode("utf-8")
        
        mock_response.get.return_value = mock_body
        self.mock_client.invoke_model.return_value = mock_response

        # Execute
        result = self.service.discover_root_cause(self.request, self.product_intel, self.seller_intel)

        # Assertions
        self.assertEqual(result["rootCause"], RootCauseEnum.COMPATIBILITY_ISSUE.value)
        self.assertEqual(result["confidence"], 0.95)
        self.assertEqual(len(result["evidence"]), 2)
        self.assertEqual(result["evidence"][0]["type"], "REVIEW_PATTERN")
        self.mock_client.invoke_model.assert_called_once()

    def test_bedrock_invalid_enum_fallback(self):
        mock_response = MagicMock()
        mock_body = MagicMock()
        
        # Return an invalid rootCause NOT in specified ENUM list
        claude_response_json = {
            "rootCause": "SOME_RANDOM_REASON",
            "confidence": 0.90,
            "evidence": [
                {"type": "HEURISTIC_RULE", "description": "Failed test case", "weight": 0.50}
            ]
        }
        
        mock_body.read.return_value = json.dumps({
            "content": [
                {
                    "text": json.dumps(claude_response_json)
                }
            ]
        }).encode("utf-8")
        
        mock_response.get.return_value = mock_body
        self.mock_client.invoke_model.return_value = mock_response

        # Execute
        result = self.service.discover_root_cause(self.request, self.product_intel, self.seller_intel)

        # Assertions
        # Should fall back to EXPECTATION_MISMATCH when invalid ENUM is parsed
        self.assertEqual(result["rootCause"], RootCauseEnum.EXPECTATION_MISMATCH.value)
        self.assertEqual(result["confidence"], 0.90)

if __name__ == "__main__":
    unittest.main()
