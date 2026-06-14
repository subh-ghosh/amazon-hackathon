import pytest
import requests

def test_defective_product_scenario(base_url, defective_payload):
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=defective_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["actualRootCause"] in ["MANUFACTURING_DEFECT", "EXPECTATION_MISMATCH"]
    assert "evidence" in data
    assert len(data["evidence"]) >= 1

def test_size_mismatch_scenario(base_url, size_mismatch_payload):
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=size_mismatch_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["actualRootCause"] in ["SIZE_MISMATCH", "EXPECTATION_MISMATCH"]
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0

def test_counterfeit_scenario(base_url, counterfeit_payload):
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=counterfeit_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["actualRootCause"] in ["COUNTERFEIT", "SELLER_QUALITY_ISSUE", "EXPECTATION_MISMATCH"]
    assert data["requiresManualReview"] is True or "counterfeit" in str(data["evidence"]).lower()

def test_response_schema_validation(base_url, defective_payload):
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=defective_payload)
    assert res.status_code == 200
    data = res.json()
    
    expected_keys = {"returnId", "actualRootCause", "confidence", "requiresManualReview", "evidence"}
    for key in expected_keys:
        assert key in data
        
    assert isinstance(data["confidence"], float)
    assert 0 <= data["confidence"] <= 1
    assert isinstance(data["evidence"], list)
    
    # Evidence weights should not exceed 1.0
    total_weight = sum(e["weight"] for e in data["evidence"])
    assert total_weight <= 1.0001 # slight float tolerance
