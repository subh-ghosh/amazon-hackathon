from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy", "service": "Recovery Optimizer"}

def test_tc_001_highest_profit_wins():
    payload = {
      "returnId": "RET001", "productId": "P001", "fraudScore": 10, "sellerTrustScore": 0.95,
      "simulations": [
        {"scenario": "Refurbish", "recoveryValue": 12000, "carbonImpact": 10, "processingTimeDays": 4, "confidence": 0.95},
        {"scenario": "Outlet Sale", "recoveryValue": 7000, "carbonImpact": 5, "processingTimeDays": 2, "confidence": 0.90}
      ]
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 200
    assert res.json()["recommendedDecision"] == "REFURBISH"

def test_tc_002_carbon_friendly_wins():
    payload = {
      "returnId": "RET002", "productId": "P002", "fraudScore": 5, "sellerTrustScore": 0.95,
      "simulations": [
        {"scenario": "Recycle", "recoveryValue": 2000, "carbonImpact": -5, "processingTimeDays": 1, "confidence": 0.95},
        {"scenario": "Return To Vendor", "recoveryValue": 2500, "carbonImpact": 30, "processingTimeDays": 10, "confidence": 0.80}
      ]
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 200
    assert res.json()["recommendedDecision"] == "RECYCLE"
    assert "Sustainability bonus applied" in res.json()["reasoning"]

def test_tc_003_high_fraud_penalty():
    payload = {
      "returnId": "RET003", "productId": "P003", "fraudScore": 90, "sellerTrustScore": 0.90,
      "simulations": [
        {"scenario": "Refurbish", "recoveryValue": 15000, "carbonImpact": 12, "processingTimeDays": 4, "confidence": 0.90}
      ]
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 200
    assert "High fraud risk heavily penalized expensive recovery path" in res.json()["reasoning"]

def test_tc_004_low_seller_trust():
    payload = {
      "returnId": "RET004", "productId": "P004", "fraudScore": 20, "sellerTrustScore": 0.30,
      "simulations": [
        {"scenario": "Outlet Sale", "recoveryValue": 6000, "carbonImpact": 5, "processingTimeDays": 2, "confidence": 0.90}
      ]
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 200
    assert "Confidence reduced due to low seller trust" in res.json()["reasoning"]

def test_tc_005_demo_scenario():
    payload = {
      "returnId": "RET-DEMO-001", "productId": "MACBOOK-001", "fraudScore": 12, "sellerTrustScore": 0.92,
      "simulations": [
        {"scenario": "Refurbish", "recoveryValue": 56000, "carbonImpact": 12, "processingTimeDays": 4, "confidence": 0.91},
        {"scenario": "Outlet Sale", "recoveryValue": 42000, "carbonImpact": 5, "processingTimeDays": 2, "confidence": 0.88}
      ]
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 200
    assert res.json()["recommendedDecision"] == "REFURBISH"

def test_tc_006_empty_simulations():
    payload = {
      "returnId": "RET006", "productId": "P006", "fraudScore": 10, "sellerTrustScore": 0.90,
      "simulations": []
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 422

def test_tc_007_negative_recovery():
    payload = {
      "returnId": "RET007", "productId": "P007", "fraudScore": 10, "sellerTrustScore": 0.90,
      "simulations": [
        {"scenario": "Refurbish", "recoveryValue": -1000, "carbonImpact": 10, "processingTimeDays": 4, "confidence": 0.90}
      ]
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 422

def test_tc_008_invalid_confidence():
    payload = {
      "returnId": "RET008", "productId": "P008", "fraudScore": 10, "sellerTrustScore": 0.90,
      "simulations": [
        {"scenario": "Refurbish", "recoveryValue": 1000, "carbonImpact": 10, "processingTimeDays": 4, "confidence": 1.5}
      ]
    }
    res = client.post("/api/v1/recovery/optimize", json=payload)
    assert res.status_code == 422
