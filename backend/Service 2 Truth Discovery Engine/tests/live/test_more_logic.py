import pytest
import requests

def test_packaging_damage_scenario(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["statedReason"] = "Damaged during shipping"
    payload["customerComment"] = "The box arrived completely crushed"
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 200
    assert "PACKAGING" in res.json()["actualRootCause"] or "DAMAGE" in res.json()["actualRootCause"] or "EXPECTATION" in res.json()["actualRootCause"]

def test_customer_misuse_scenario(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["customerComment"] = "I dropped it in the pool and it stopped working"
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 200
    assert "MISUSE" in res.json()["actualRootCause"] or "EXPECTATION" in res.json()["actualRootCause"]

def test_expectation_mismatch_scenario(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["customerComment"] = "I thought it would be brighter, not what I wanted"
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 200
    assert "EXPECTATION" in res.json()["actualRootCause"]

def test_compatibility_issue_scenario(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["customerComment"] = "It doesn't fit my older model laptop"
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 200
    assert "COMPATIBILITY" in res.json()["actualRootCause"] or "EXPECTATION" in res.json()["actualRootCause"] or "SIZE" in res.json()["actualRootCause"]

def test_seller_quality_scenario(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["customerComment"] = "The item looks used and scratched out of the box"
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 200
    assert "SELLER" in res.json()["actualRootCause"] or "QUALITY" in res.json()["actualRootCause"] or "EXPECTATION" in res.json()["actualRootCause"]
