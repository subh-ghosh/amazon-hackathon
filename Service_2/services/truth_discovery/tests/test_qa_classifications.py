import pytest
from unittest.mock import MagicMock, patch
from app.schemas import RootCauseEnum

# TC-037: Size Mismatch Detection
@patch("requests.get")
def test_tc037_size_mismatch_detection(mock_get, api_client, standard_request_payload):
    """TC-037: Verify too tight comment + runs small reviews maps to SIZE_MISMATCH."""
    # Mock Service #12 responses indicating sizing issues
    mock_prod_intel = MagicMock(status_code=200)
    mock_prod_intel.json.return_value = {
        "productId": "P123",
        "category": "Shoes",
        "title": "Sneakers",
        "returnRate": 0.08,
        "knownIssues": ["Runs small"]
    }
    
    mock_seller_intel = MagicMock(status_code=200)
    mock_seller_intel.json.return_value = {
        "sellerId": "S123",
        "sellerName": "Sports Store",
        "defectRate": 0.01
    }
    
    mock_get.side_effect = lambda url, *args, **kwargs: (
        mock_prod_intel if "products/P123" in url else mock_seller_intel
    )
    
    # Override request parameters
    payload = standard_request_payload
    payload["statedReason"] = "Defective"
    payload["customerComment"] = "The shoes are too tight"
    
    response = api_client.post("/api/v1/truth/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == RootCauseEnum.SIZE_MISMATCH.value
    assert not data["requiresManualReview"]

# TC-038: Packaging Damage Detection
def test_tc038_packaging_damage_detection(api_client, standard_request_payload):
    """TC-038: Verify 'Box arrived crushed' comment maps to PACKAGING_DAMAGE."""
    payload = standard_request_payload
    payload["customerComment"] = "Box arrived crushed"
    
    response = api_client.post("/api/v1/truth/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == RootCauseEnum.PACKAGING_DAMAGE.value
    assert not data["requiresManualReview"]

# TC-039: Compatibility Issue Detection
def test_tc039_compatibility_issue_detection(api_client, standard_request_payload):
    """TC-039: Verify 'Does not work with Android 14' comment maps to COMPATIBILITY_ISSUE."""
    payload = standard_request_payload
    payload["customerComment"] = "Does not work with Android 14"
    
    response = api_client.post("/api/v1/truth/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == RootCauseEnum.COMPATIBILITY_ISSUE.value
    assert not data["requiresManualReview"]

# TC-040: High Confidence Path
@patch("app.services.bedrock_service.BedrockService.discover_root_cause")
def test_tc040_high_confidence_path(mock_discover, api_client, standard_request_payload):
    """TC-040: Verify confidence > 0.9 returns requiresManualReview = False."""
    mock_discover.return_value = {
        "rootCause": "MANUFACTURING_DEFECT",
        "confidence": 0.95,
        "evidence": [
            {"type": "HEURISTIC_RULE", "description": "High confidence defect indicator", "weight": 0.80}
        ]
    }
    
    response = api_client.post("/api/v1/truth/analyze", json=standard_request_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == RootCauseEnum.MANUFACTURING_DEFECT.value
    assert data["confidence"] == 0.95
    assert data["requiresManualReview"] is False

# TC-041: Low Confidence Path
@patch("app.services.bedrock_service.BedrockService.discover_root_cause")
def test_tc041_low_confidence_path(mock_discover, api_client, standard_request_payload):
    """TC-041: Verify confidence < threshold returns requiresManualReview = True and overrides cause."""
    mock_discover.return_value = {
        "rootCause": "MANUFACTURING_DEFECT",
        "confidence": 0.55, # Less than 0.60
        "evidence": [
            {"type": "HEURISTIC_RULE", "description": "Low confidence indicator", "weight": 0.20}
        ]
    }
    
    response = api_client.post("/api/v1/truth/analyze", json=standard_request_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == RootCauseEnum.EXPECTATION_MISMATCH.value # Overridden
    assert data["confidence"] == 0.55
    assert data["requiresManualReview"] is True
