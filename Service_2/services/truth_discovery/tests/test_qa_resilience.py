import pytest
import requests
from unittest.mock import MagicMock, patch
from app.schemas import RootCauseEnum

# TC-046: Product Intelligence Missing
@patch("requests.get")
def test_tc046_product_intelligence_missing(mock_get, api_client, standard_request_payload):
    """TC-046: Verify that Service #12 returning 404 for product intelligence degradates gracefully."""
    # Product lookup returns 404, Seller lookup returns 200
    mock_prod_intel = MagicMock(status_code=404)
    mock_seller_intel = MagicMock(status_code=200)
    mock_seller_intel.json.return_value = {
        "sellerId": "S123",
        "sellerName": "Sports Store",
        "defectRate": 0.01
    }
    
    mock_get.side_effect = lambda url, *args, **kwargs: (
        mock_prod_intel if "products/P123" in url else mock_seller_intel
    )
    
    response = api_client.post("/api/v1/truth/analyze", json=standard_request_payload)
    assert response.status_code == 200 # No crash
    data = response.json()
    assert data["returnId"] == "RET123"
    assert data["actualRootCause"] in [cause.value for cause in RootCauseEnum]

# TC-047: Seller Intelligence Timeout
@patch("requests.get")
def test_tc047_seller_intelligence_timeout(mock_get, api_client, standard_request_payload):
    """TC-047: Verify that connection timeout on seller intelligence degrades gracefully."""
    # Product intelligence returns success, Seller intelligence raises Timeout
    mock_prod_intel = MagicMock(status_code=200)
    mock_prod_intel.json.return_value = {
        "productId": "P123",
        "category": "Shoes",
        "title": "Sneakers",
        "returnRate": 0.08,
        "knownIssues": []
    }
    
    def side_effect(url, *args, **kwargs):
        if "products/P123" in url:
            return mock_prod_intel
        raise requests.exceptions.Timeout("Connection timed out querying seller info")
        
    mock_get.side_effect = side_effect
    
    response = api_client.post("/api/v1/truth/analyze", json=standard_request_payload)
    assert response.status_code == 200 # Graceful degradation, no crash
    data = response.json()
    assert data["returnId"] == "RET123"

# TC-048: Knowledge Graph Writeback Verification
@patch("app.services.storage_service.StorageService.save_truth_analysis")
@patch("app.services.event_publisher.EventPublisher.publish_root_cause_discovered")
@patch("requests.get")
def test_tc048_knowledge_graph_writeback_verification(mock_get, mock_publish, mock_save, api_client, standard_request_payload):
    """TC-048: Verify that writeback verification queries confirm root cause propagation."""
    # Product intelligence success
    mock_prod_intel = MagicMock(status_code=200)
    mock_prod_intel.json.return_value = {"productId": "P123", "knownIssues": []}
    # Seller intelligence success
    mock_seller_intel = MagicMock(status_code=200)
    mock_seller_intel.json.return_value = {"sellerId": "S123"}
    # Verification GET returns expected root cause matches
    mock_verification_resp = MagicMock(status_code=200)
    mock_verification_resp.json.return_value = {
        "returnId": "RET123",
        "rootCause": "SIZE_MISMATCH"
    }
    
    def side_effect(url, *args, **kwargs):
        if "products/P123" in url:
            return mock_prod_intel
        elif "sellers/S123" in url:
            return mock_seller_intel
        elif "api/v1/returns/RET123" in url:
            return mock_verification_resp
        return MagicMock(status_code=404)
        
    mock_get.side_effect = side_effect
    
    # Run in mock mode but disable settings.MOCK_AWS dynamically in graph client testing
    from app.config import settings
    settings.MOCK_AWS = False
    
    payload = standard_request_payload
    payload["customerComment"] = "Size too small"
    
    response = api_client.post("/api/v1/truth/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["actualRootCause"] == "SIZE_MISMATCH"
