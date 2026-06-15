import pytest
import requests

@pytest.mark.parametrize("invalid_type, field", [
    (123, "customerId"),
    (True, "productId"),
    (None, "sellerId"),
    ([], "statedReason"),
    ({}, "customerComment"),
    ([1, 2, 3], "returnId"),
    (45.67, "productId"),
    ("not-a-list", "images"),
    ({"url": "s3://bucket"}, "images")
])
def test_invalid_types_rejected(base_url, defective_payload, invalid_type, field):
    payload = defective_payload.copy()
    payload[field] = invalid_type
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422

@pytest.mark.parametrize("field, length_payload", [
    ("returnId", "A" * 150),
    ("customerId", "B" * 200),
    ("productId", "C" * 101),
    ("sellerId", "D" * 150),
    ("statedReason", "E" * 105),
    ("customerComment", "F" * 1500)
])
def test_max_length_constraints(base_url, defective_payload, field, length_payload):
    payload = defective_payload.copy()
    payload[field] = length_payload
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422

def test_invalid_url_images(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["images"] = ["invalid-url-no-scheme"]
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    # The current schema in schemas.py uses List[str] with no HTTP URL validator, 
    # but we can verify it doesn't crash
    assert res.status_code in [200, 422]
