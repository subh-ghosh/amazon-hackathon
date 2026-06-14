from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_tc_001_restock_as_new():
    payload = {
        "returnId": "RET001",
        "productId": "P001",
        "category": "Electronics",
        "conditionScore": 98,
        "utilityScore": 95,
        "fraudScore": 5,
        "estimatedValue": 10000,
        "returnReason": "Changed Mind",
        "sellerTrustScore": 0.95
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    scenarios = [s["scenario"] for s in data["simulations"]]
    assert "Restock As New" in scenarios
    assert data["bestScenario"] == "Restock As New"

def test_tc_002_refurbish_candidate():
    payload = {
        "returnId": "RET002",
        "productId": "P002",
        "category": "Laptop",
        "conditionScore": 75,
        "utilityScore": 80,
        "fraudScore": 10,
        "estimatedValue": 50000,
        "returnReason": "Minor Defect",
        "sellerTrustScore": 0.90
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    scenarios = [s["scenario"] for s in data["simulations"]]
    assert "Refurbish" in scenarios
    assert "Outlet Sale" in scenarios
    assert "Restock As New" not in scenarios
    assert data["bestScenario"] == "Refurbish"

def test_tc_003_outlet_sale():
    payload = {
        "returnId": "RET003",
        "productId": "P003",
        "category": "Fashion",
        "conditionScore": 65,
        "utilityScore": 70,
        "fraudScore": 15,
        "estimatedValue": 3000,
        "returnReason": "Size Issue",
        "sellerTrustScore": 0.85
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    scenarios = [s["scenario"] for s in data["simulations"]]
    assert "Outlet Sale" in scenarios
    assert "Refurbish" in scenarios

def test_tc_004_high_fraud():
    payload = {
        "returnId": "RET004",
        "productId": "P004",
        "category": "Electronics",
        "conditionScore": 97,
        "utilityScore": 95,
        "fraudScore": 95,
        "estimatedValue": 20000,
        "returnReason": "Unknown",
        "sellerTrustScore": 0.50
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    scenarios = [s["scenario"] for s in data["simulations"]]
    assert "Restock As New" not in scenarios
    assert data["bestScenario"] != "Restock As New"

def test_tc_005_very_poor_condition():
    payload = {
        "returnId": "RET005",
        "productId": "P005",
        "category": "Furniture",
        "conditionScore": 20,
        "utilityScore": 25,
        "fraudScore": 10,
        "estimatedValue": 8000,
        "returnReason": "Damaged",
        "sellerTrustScore": 0.80
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    scenarios = [s["scenario"] for s in data["simulations"]]
    assert "Refurbish" not in scenarios
    assert "Outlet Sale" not in scenarios
    assert any(s in scenarios for s in ["Recycle", "Donate", "Return To Vendor"])

def test_tc_007_boundary_95():
    payload = {
        "returnId": "RET007",
        "productId": "P007",
        "category": "Test",
        "conditionScore": 95,
        "utilityScore": 90,
        "fraudScore": 19,
        "estimatedValue": 1000,
        "returnReason": "Test",
        "sellerTrustScore": 0.9
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    scenarios = [s["scenario"] for s in response.json()["simulations"]]
    assert "Restock As New" in scenarios

def test_tc_008_boundary_94():
    payload = {
        "returnId": "RET008",
        "productId": "P008",
        "category": "Test",
        "conditionScore": 94,
        "utilityScore": 90,
        "fraudScore": 19,
        "estimatedValue": 1000,
        "returnReason": "Test",
        "sellerTrustScore": 0.9
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    scenarios = [s["scenario"] for s in response.json()["simulations"]]
    assert "Restock As New" not in scenarios

def test_tc_009_invalid_condition():
    payload = {
        "returnId": "RET009",
        "productId": "P009",
        "category": "Test",
        "conditionScore": 120,
        "utilityScore": 90,
        "fraudScore": 10,
        "estimatedValue": 1000,
        "returnReason": "Test",
        "sellerTrustScore": 0.9
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 422

def test_tc_010_missing_field():
    payload = {"productId": "P010"}
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 422

def test_demo_case():
    payload = {
      "returnId": "RET-DEMO-001",
      "productId": "MACBOOK-001",
      "category": "Electronics",
      "conditionScore": 82,
      "utilityScore": 88,
      "fraudScore": 12,
      "estimatedValue": 75000,
      "returnReason": "Defective",
      "sellerTrustScore": 0.92
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["bestScenario"] == "Refurbish"
