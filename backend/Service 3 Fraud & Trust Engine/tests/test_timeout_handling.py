import pytest
import requests_mock
from requests.exceptions import Timeout
from app.clients.service12_client import service12

def test_tc_002_timeout_fallback():
    customer_id = "CUST-TIMEOUT"
    url = f"{service12.base_url}/api/v1/customers/{customer_id}/intelligence"
    
    with requests_mock.Mocker() as m:
        m.get(url, exc=Timeout)
        result = service12.get_customer_history(customer_id)
        
        assert result == {"return_rate": 0, "historical_returns": 0}
