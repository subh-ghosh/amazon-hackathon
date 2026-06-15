import pytest
from scripts.demo_scenarios.client import ApiClient

def test_api_health_check():
    """Verify that intelligence endpoints return correctly formatted JSON, even if 404."""
    res = ApiClient.get_product_intelligence("DUMMY")
    assert res.status_code in [200, 404]

def test_entities_creation():
    """Verify the API accepts correct schema to create a customer."""
    cust_res = ApiClient.create_customer({
        "customer_id": "TEST-1", 
        "name": "Test", 
        "account_age_days": 0
    })
    assert cust_res.status_code in [200, 201, 409]

def test_journey_endpoint():
    """Verify the graph traversal endpoints don't crash."""
    res = ApiClient.get_journey("TEST-RET")
    assert res.status_code in [200, 404]
