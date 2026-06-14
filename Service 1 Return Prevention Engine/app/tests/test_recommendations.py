import requests

def test_confidence_score_exists_and_bounds(base_url, low_risk_payload):
    # TC-029, TC-030
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=low_risk_payload)
    assert res.status_code == 200
    data = res.json()
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0

def test_confidence_stability(base_url, medium_risk_payload):
    # TC-031
    res1 = requests.post(f"{base_url}/api/v1/prevention/analyze", json=medium_risk_payload)
    res2 = requests.post(f"{base_url}/api/v1/prevention/analyze", json=medium_risk_payload)
    assert res1.status_code == 200 and res2.status_code == 200
    assert res1.json()["confidence"] == res2.json()["confidence"]
    assert res1.json()["returnRiskScore"] == res2.json()["returnRiskScore"]

def test_recommendations_exist(base_url, high_risk_payload):
    # TC-032
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=high_risk_payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["recommendedActions"]) >= 1

def test_high_risk_recommendations(base_url, high_risk_payload):
    # TC-034
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=high_risk_payload)
    assert res.status_code == 200
    actions = res.json()["recommendedActions"]
    assert len(actions) > 0

def test_low_risk_recommendations(base_url, low_risk_payload):
    # TC-035
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=low_risk_payload)
    assert res.status_code == 200
    actions = res.json()["recommendedActions"]
    assert len(actions) == 0
