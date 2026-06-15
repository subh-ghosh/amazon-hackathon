from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_run_simulation_valid():
    payload = {
        "returnId": "RET123",
        "productId": "P123",
        "category": "Electronics",
        "conditionScore": 82,
        "utilityScore": 88,
        "fraudScore": 15,
        "estimatedValue": 15000,
        "returnReason": "Defective",
        "sellerTrustScore": 0.92
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "bestScenario" in data
    assert "recommendedAction" in data
    assert "simulations" in data
    assert len(data["simulations"]) > 0

def test_run_simulation_invalid():
    payload = {
        "returnId": "RET123"
        # Missing required fields
    }
    response = client.post("/api/v1/simulation/run", json=payload)
    assert response.status_code == 422
