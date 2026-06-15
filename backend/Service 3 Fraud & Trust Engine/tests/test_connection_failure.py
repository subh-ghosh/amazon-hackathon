import pytest
import requests_mock
from requests.exceptions import ConnectionError
from app.clients.service12_client import service12

def test_tc_003_connection_refused_fallback():
    seller_id = "SEL-CONN"
    url = f"{service12.base_url}/api/v1/sellers/{seller_id}/intelligence"
    
    with requests_mock.Mocker() as m:
        m.get(url, exc=ConnectionError)
        result = service12.get_seller_intelligence(seller_id)
        
        assert result == {"risk_level": "UNKNOWN", "return_rate": 0}
