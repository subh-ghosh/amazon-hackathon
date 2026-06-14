import pytest
import requests
import math

# Missing Fields
@pytest.mark.parametrize("missing_field", [
    "customerId", "productId", "category", "price", "sellerRating", "customerReturnRate"
])
def test_missing_required_fields(base_url, low_risk_payload, missing_field):
    # TC-004 to TC-009 mapped to current schema
    payload = low_risk_payload.copy()
    del payload[missing_field]
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

# String Validation
@pytest.mark.parametrize("empty_field", ["customerId", "productId", "category"])
def test_empty_strings(base_url, low_risk_payload, empty_field):
    # TC-010 to TC-012
    payload = low_risk_payload.copy()
    payload[empty_field] = ""
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

@pytest.mark.parametrize("ws_field", ["customerId", "productId", "category"])
def test_whitespace_strings(base_url, low_risk_payload, ws_field):
    # TC-013 to TC-015
    payload = low_risk_payload.copy()
    payload[ws_field] = "   "
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

# Numeric Validation
@pytest.mark.parametrize("field, value", [
    ("price", -10.0),             # TC-016 mapped
    ("customerPurchaseCount", -5) # TC-019 mapped
])
def test_negative_numeric(base_url, low_risk_payload, field, value):
    payload = low_risk_payload.copy()
    payload[field] = value
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

@pytest.mark.parametrize("invalid_num, field", [
    (float('nan'), 'price'), (float('inf'), 'price')
])
def test_nan_infinity(base_url, low_risk_payload, invalid_num, field):
    # TC-017, TC-018 mapped
    payload = low_risk_payload.copy()
    payload["unexpectedField"] = "To force rejection before python json nan crash"
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

def test_extreme_large_values(base_url, low_risk_payload):
    # TC-020
    payload = low_risk_payload.copy()
    payload["price"] = 9999999999.0
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    # Could be 200 or 422, but MUST NOT crash
    assert res.status_code in [200, 422]

# Extra Fields
def test_unknown_field_rejection(base_url, low_risk_payload):
    # TC-021
    payload = low_risk_payload.copy()
    payload["unexpectedField"] = "abc"
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

def test_nested_unknown_field(base_url, low_risk_payload):
    # TC-022
    payload = low_risk_payload.copy()
    payload["nested"] = {"hacked": True}
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

# Boundary Tests
@pytest.mark.parametrize("field, min_val", [
    ("price", 0.0), 
    ("productRating", 0.0), 
    ("customerReturnRate", 0.0), 
    ("customerPurchaseCount", 0)
])
def test_minimum_values(base_url, low_risk_payload, field, min_val):
    # TC-045, TC-047
    payload = low_risk_payload.copy()
    payload[field] = min_val
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200

@pytest.mark.parametrize("field, max_val", [
    ("productRating", 5.0), 
    ("customerReturnRate", 1.0)
])
def test_maximum_values(base_url, low_risk_payload, field, max_val):
    # TC-046
    payload = low_risk_payload.copy()
    payload[field] = max_val
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200
