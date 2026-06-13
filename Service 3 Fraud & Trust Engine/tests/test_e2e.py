from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_fraud_flow():
    payload = {
        "customer_id": "CUST-001",
        "product_id": "PROD-001",
        "return_id": "RET-001",
        "device_id": "DEV-001",
        "payment_method_hash": "PM-001",
        "images": []
    }
    response = client.post("/api/v1/fraud/score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fraud_score" in data
    assert "trust_score" in data
