def test_tc_012_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy", "service": "Product Digital Twin"}

def test_tc_001_create_product_twin(client):
    res = client.post("/api/v1/products", json={
        "productId": "P123",
        "sku": "SKU-001",
        "category": "Electronics",
        "conditionScore": 100,
        "utilityScore": 100
    })
    assert res.status_code == 201
    data = res.json()
    assert data["productId"] == "P123"
    assert data["returnCount"] == 0
    assert data["currentStatus"] == "ACTIVE"

def test_tc_002_fetch_product_twin(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.get("/api/v1/products/P123")
    assert res.status_code == 200
    assert res.json()["productId"] == "P123"

def test_tc_003_update_product_twin(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.put("/api/v1/products/P123", json={
        "conditionScore": 85,
        "currentStatus": "UNDER_INSPECTION"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["conditionScore"] == 85
    assert data["currentStatus"] == "UNDER_INSPECTION"

def test_tc_004_add_return_event(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.post("/api/v1/products/P123/returns", json={
        "returnReason": "Defective",
        "conditionScore": 82
    })
    assert res.status_code == 200
    data = res.json()
    assert data["returnCount"] == 1
    assert data["conditionScore"] == 82
    assert data["currentStatus"] == "RETURNED"
    assert len(data["returnHistory"]) == 1
    assert data["returnHistory"][0]["returnReason"] == "Defective"

def test_tc_005_add_fraud_event(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.post("/api/v1/products/P123/fraud", json={
        "fraudScore": 50,
        "fraudType": "MINOR_DISCREPANCY"
    })
    assert res.status_code == 200
    data = res.json()
    assert "MINOR_DISCREPANCY" in data["fraudFlags"]
    assert data["currentStatus"] == "ACTIVE" # Score not > 70

def test_tc_011_fraud_score_triggers_review(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.post("/api/v1/products/P123/fraud", json={
        "fraudScore": 85,
        "fraudType": "SERIAL_RETURN_ABUSE"
    })
    assert res.status_code == 200
    data = res.json()
    assert "SERIAL_RETURN_ABUSE" in data["fraudFlags"]
    assert data["currentStatus"] == "FRAUD_REVIEW"

def test_tc_006_add_repair_event(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.post("/api/v1/products/P123/repairs", json={
        "repairType": "Screen Replacement",
        "cost": 2500
    })
    assert res.status_code == 200
    data = res.json()
    assert data["repairCount"] == 1
    assert data["repairHistory"][0]["repairType"] == "Screen Replacement"

def test_tc_007_add_recovery_event(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.post("/api/v1/products/P123/recovery-actions", json={
        "decision": "REFURBISH",
        "expectedProfit": 12000
    })
    assert res.status_code == 200
    data = res.json()
    assert data["currentStatus"] == "REFURBISHING"
    assert data["recoveryHistory"][0]["decision"] == "REFURBISH"

def test_tc_008_add_logistics_event(client):
    client.post("/api/v1/products", json={
        "productId": "P123", "sku": "SKU-001", "category": "Electronics"
    })
    
    res = client.post("/api/v1/products/P123/logistics", json={
        "warehouseId": "WH-KOL-01",
        "route": "Customer → Kolkata Hub"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["logisticsHistory"][0]["warehouseId"] == "WH-KOL-01"

def test_tc_009_invalid_product_id(client):
    res = client.get("/api/v1/products/INVALID-ID")
    assert res.status_code == 404

def test_tc_010_missing_required_fields(client):
    res = client.post("/api/v1/products", json={
        "productId": "P123"
        # missing sku, category
    })
    assert res.status_code == 422
