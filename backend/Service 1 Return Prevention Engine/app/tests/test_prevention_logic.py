import requests

def test_low_risk_customer(base_url, low_risk_payload):
    # TC-023
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=low_risk_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["riskLevel"] == "LOW"

def test_medium_risk_customer(base_url, medium_risk_payload):
    # TC-024
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=medium_risk_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["riskLevel"] == "MEDIUM"

def test_high_risk_customer(base_url, high_risk_payload):
    # TC-025
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=high_risk_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["riskLevel"] == "HIGH"

def test_fraud_like_customer(base_url, fraud_like_payload):
    # TC-026 High return frequency -> Higher risk score
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=fraud_like_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["returnRiskScore"] > 50

def test_excellent_purchase_history(base_url, low_risk_payload):
    # TC-027 Lower risk score
    payload = low_risk_payload.copy()
    payload["customerPurchaseCount"] = 500
    payload["customerReturnRate"] = 0.001
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["returnRiskScore"] < 30

def test_risk_score_bounds(base_url, high_risk_payload):
    # TC-028 0 <= riskScore <= 100
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=high_risk_payload)
    assert res.status_code == 200
    score = res.json()["returnRiskScore"]
    assert 0 <= score <= 100

def test_response_schema_validation(base_url, low_risk_payload):
    # TC-037 to TC-039 JSON Serialization & Deserialization (TC-060, TC-061)
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=low_risk_payload)
    assert res.status_code == 200
    data = res.json()
    
    expected_keys = {"returnRiskScore", "riskLevel", "recommendedActions", "confidence", "explanation"}
    
    for key in expected_keys:
        assert key in data
        
    assert isinstance(data["returnRiskScore"], int)
    assert isinstance(data["riskLevel"], str)
    assert isinstance(data["recommendedActions"], list)
    assert isinstance(data["confidence"], float)
    assert isinstance(data["explanation"], list)
