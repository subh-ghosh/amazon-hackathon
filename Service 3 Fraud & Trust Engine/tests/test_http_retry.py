import pytest
from unittest.mock import patch, MagicMock
from requests.exceptions import RetryError, HTTPError
from app.clients.service12_client import service12

@patch("requests.Session.get")
def test_tc_001_http_retry(mock_get):
    customer_id = "CUST-RETRY"
    
    # Simulate a RetryError which happens when urllib3 exceeds max retries on 500s
    mock_get.side_effect = RetryError("Max retries exceeded with url")
    
    result = service12.get_customer_history(customer_id)
    
    # Validates the graceful fallback occurs when retries are exhausted
    assert result["return_rate"] == 0
    assert result["historical_returns"] == 0

