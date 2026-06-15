import pytest
import requests

# Missing Fields
@pytest.mark.parametrize("missing_field", [
    "returnId", "customerId", "productId", "sellerId", "statedReason", "customerComment"
])
def test_missing_required_fields(base_url, defective_payload, missing_field):
    payload = defective_payload.copy()
    del payload[missing_field]
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422

# String Validation
@pytest.mark.parametrize("empty_field", [
    "returnId", "customerId", "productId", "sellerId", "statedReason"
])
def test_empty_strings(base_url, defective_payload, empty_field):
    payload = defective_payload.copy()
    payload[empty_field] = ""
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422

@pytest.mark.parametrize("ws_field", [
    "returnId", "customerId", "productId", "sellerId", "statedReason"
])
def test_whitespace_strings(base_url, defective_payload, ws_field):
    payload = defective_payload.copy()
    payload[ws_field] = "   "
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422

# Extra Fields
def test_unknown_field_rejection(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["unexpectedField"] = "abc"
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422

def test_nested_unknown_field(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["nested"] = {"hacked": True}
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422
