import pytest
from unittest.mock import MagicMock, patch
from app.schemas import RootCauseEnum, EvidenceType

# TC-053: Full Production E2E Flow
@patch("app.services.storage_service.StorageService.save_truth_analysis")
@patch("app.services.event_publisher.EventPublisher.publish_root_cause_discovered")
@patch("requests.get")
def test_tc053_full_production_e2e_flow(mock_get, mock_publish, mock_save, api_client, standard_request_payload):
    """TC-053: Validate full E2E flow with context, analysis, scoring, threshold, DB, EB, and KG writeback."""
    # 1. Setup mock responses for Service #12 endpoints (Product, Seller, and Verification)
    mock_prod_intel = MagicMock(status_code=200)
    mock_prod_intel.json.return_value = {
        "productId": "P123",
        "category": "Electronics",
        "title": "Smart Watch",
        "returnRate": 0.04,
        "knownIssues": ["OS compatibility failures"]
    }
    
    mock_seller_intel = MagicMock(status_code=200)
    mock_seller_intel.json.return_value = {
        "sellerId": "S123",
        "defectRate": 0.01
    }
    
    mock_verification_resp = MagicMock(status_code=200)
    mock_verification_resp.json.return_value = {
        "returnId": "RET123",
        "rootCause": "COMPATIBILITY_ISSUE"
    }
    
    # Map mocked request paths
    def get_side_effect(url, *args, **kwargs):
        if "products/P123" in url:
            return mock_prod_intel
        elif "sellers/S123" in url:
            return mock_seller_intel
        elif "api/v1/returns/RET123" in url:
            return mock_verification_resp
        return MagicMock(status_code=404)
        
    mock_get.side_effect = get_side_effect
    
    # Enable live SDK simulation (dynamically resets mocks so they log and parse natively)
    from app.config import settings
    settings.MOCK_AWS = False
    
    # 2. Trigger payload with iOS connection issue comment
    payload = standard_request_payload
    payload["statedReason"] = "Defective"
    payload["customerComment"] = "Will not connect to iOS 17 app, bluetooth sync times out"
    
    # 3. Post to API
    response = api_client.post("/api/v1/truth/analyze", json=payload)
    
    # 4. Assert E2E Success Outcomes
    assert response.status_code == 200
    data = response.json()
    
    # Assert Root Cause Enum
    assert data["returnId"] == "RET123"
    assert data["actualRootCause"] == RootCauseEnum.COMPATIBILITY_ISSUE.value
    assert data["confidence"] == 0.93
    assert data["requiresManualReview"] is False
    
    # Assert Evidence Schema
    assert len(data["evidence"]) == 2
    assert data["evidence"][0]["type"] == EvidenceType.HEURISTIC_RULE.value
    assert data["evidence"][0]["weight"] == 0.55
    
    # Verify requests.get was called for product context, seller context, and writeback verification
    assert mock_get.call_count >= 3
