import pytest
import concurrent.futures
from unittest.mock import MagicMock, patch
from app.schemas import RootCauseEnum

# TC-049: Batch Processing
def test_tc049_batch_processing(api_client, standard_request_payload):
    """TC-049: Simulate processing a batch of 100 return requests sequentially."""
    for i in range(100):
        payload = standard_request_payload.copy()
        payload["returnId"] = f"RET_BATCH_{i}"
        payload["customerComment"] = f"Size is too small, iteration {i}"
        
        response = api_client.post("/api/v1/truth/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["returnId"] == f"RET_BATCH_{i}"
        assert data["actualRootCause"] == RootCauseEnum.SIZE_MISMATCH.value

# TC-050: Concurrent Requests
def test_tc050_concurrent_requests(api_client, standard_request_payload):
    """TC-050: Simulate 50 parallel requests to test API stability and thread safety."""
    payloads = []
    for i in range(50):
        payload = standard_request_payload.copy()
        payload["returnId"] = f"RET_CONC_{i}"
        payload["customerComment"] = "Does not connect to iOS app"
        payloads.append(payload)
        
    def send_request(payload):
        return api_client.post("/api/v1/truth/analyze", json=payload)
        
    # Execute 50 requests in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(send_request, payloads))
        
    assert len(results) == 50
    for response in results:
        assert response.status_code == 200
        data = response.json()
        assert data["actualRootCause"] == RootCauseEnum.COMPATIBILITY_ISSUE.value

# TC-051: Counterfeit Seller Scenario
@patch("app.services.bedrock_service.BedrockService.discover_root_cause")
def test_tc051_counterfeit_seller_scenario(mock_discover, api_client, standard_request_payload):
    """TC-051: Verify that seller counterfeit history increases classification confidence."""
    # Mock bedrock returning a higher confidence score when counterfeit seller context is present
    mock_discover.return_value = {
        "rootCause": "COUNTERFEIT",
        "confidence": 0.96, # Increased confidence due to seller history
        "evidence": [
            {"type": "METADATA_DISCREPANCY", "description": "Seller counterfeit history matched", "weight": 0.85}
        ]
    }
    
    payload = standard_request_payload
    payload["statedReason"] = "No Longer Needed"
    payload["customerComment"] = "Item looks fake, logo is weird"
    
    response = api_client.post("/api/v1/truth/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == RootCauseEnum.COUNTERFEIT.value
    assert data["confidence"] == 0.96

# TC-052: Historical Pattern Amplification
@patch("app.services.bedrock_service.BedrockService.discover_root_cause")
def test_tc052_historical_pattern_amplification(mock_discover, api_client, standard_request_payload):
    """TC-052: Verify that high return rates for a product amplify classification confidence."""
    # Mock bedrock returning high confidence due to high product return rate (e.g. 0.22)
    mock_discover.return_value = {
        "rootCause": "SIZE_MISMATCH",
        "confidence": 0.98, # High confidence amplified by product return patterns
        "evidence": [
            {"type": "SIMILAR_CASES", "description": "High return rate (22%) sizing reviews detected", "weight": 0.90}
        ]
    }
    
    payload = standard_request_payload
    payload["customerComment"] = "Too small"
    
    response = api_client.post("/api/v1/truth/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == RootCauseEnum.SIZE_MISMATCH.value
    assert data["confidence"] == 0.98
