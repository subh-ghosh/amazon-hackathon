from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

BASE_WAREHOUSES = [
    {"warehouseId": "WH-KOL-01", "city": "Kolkata",   "capacity": 85, "distanceKm": 25},
    {"warehouseId": "WH-BLR-01", "city": "Bangalore",  "capacity": 60, "distanceKm": 1550},
]


def optimize(payload):
    return client.post("/api/v1/logistics/optimize", json=payload)


# ─── Health ───────────────────────────────────────────────────────────────────
def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy", "service": "Reverse Logistics Optimizer"}


# ─── TC-001 Nearest Warehouse Wins ────────────────────────────────────────────
def test_tc_001_nearest_wins():
    payload = {
        "returnId": "RET001", "productId": "P001",
        "recommendedDecision": "REFURBISH",
        "customerLocation": "Kolkata",
        "conditionScore": 82, "estimatedValue": 15000,
        "warehouses": BASE_WAREHOUSES,
    }
    res = optimize(payload)
    assert res.status_code == 200
    assert res.json()["recommendedWarehouse"] == "WH-KOL-01"


# ─── TC-002 Higher Capacity Warehouse Wins ────────────────────────────────────
def test_tc_002_capacity_wins():
    # Two warehouses at same distance, one with 90% capacity vs 40%
    payload = {
        "returnId": "RET002", "productId": "P002",
        "recommendedDecision": "OUTLET_SALE",
        "customerLocation": "Delhi",
        "conditionScore": 70, "estimatedValue": 8000,
        "warehouses": [
            {"warehouseId": "WH-A", "city": "CityA", "capacity": 90, "distanceKm": 200},
            {"warehouseId": "WH-B", "city": "CityB", "capacity": 40, "distanceKm": 200},
        ],
    }
    res = optimize(payload)
    assert res.status_code == 200
    assert res.json()["recommendedWarehouse"] == "WH-A"


# ─── TC-003 Carbon Efficient Route Wins ───────────────────────────────────────
def test_tc_003_carbon_efficient_wins():
    # Lower distance => better carbon score, even if capacity is slightly less
    payload = {
        "returnId": "RET003", "productId": "P003",
        "recommendedDecision": "RECYCLE",
        "customerLocation": "Mumbai",
        "conditionScore": 30, "estimatedValue": 3000,
        "warehouses": [
            {"warehouseId": "WH-NEAR", "city": "Mumbai",  "capacity": 70, "distanceKm": 10},
            {"warehouseId": "WH-FAR",  "city": "Chennai", "capacity": 75, "distanceKm": 1350},
        ],
    }
    res = optimize(payload)
    assert res.status_code == 200
    assert res.json()["recommendedWarehouse"] == "WH-NEAR"
    assert res.json()["carbonScore"] >= 90


# ─── TC-004 Tie Breaking (first wins) ────────────────────────────────────────
def test_tc_004_tie_breaking():
    payload = {
        "returnId": "RET004", "productId": "P004",
        "recommendedDecision": "DONATE",
        "customerLocation": "Pune",
        "conditionScore": 50, "estimatedValue": 2000,
        "warehouses": [
            {"warehouseId": "WH-X", "city": "CityX", "capacity": 80, "distanceKm": 300},
            {"warehouseId": "WH-Y", "city": "CityY", "capacity": 80, "distanceKm": 300},
        ],
    }
    res = optimize(payload)
    assert res.status_code == 200
    # Tie → first encountered wins
    assert res.json()["recommendedWarehouse"] == "WH-X"


# ─── TC-005 Empty Warehouse List (422) ───────────────────────────────────────
def test_tc_005_empty_warehouses():
    payload = {
        "returnId": "RET005", "productId": "P005",
        "recommendedDecision": "REFURBISH",
        "customerLocation": "Delhi",
        "conditionScore": 75, "estimatedValue": 10000,
        "warehouses": [],
    }
    res = optimize(payload)
    assert res.status_code == 422


# ─── TC-006 Invalid Distance (422) ───────────────────────────────────────────
def test_tc_006_invalid_distance():
    payload = {
        "returnId": "RET006", "productId": "P006",
        "recommendedDecision": "REFURBISH",
        "customerLocation": "Delhi",
        "conditionScore": 75, "estimatedValue": 10000,
        "warehouses": [
            {"warehouseId": "WH-BAD", "city": "X", "capacity": 80, "distanceKm": -50},
        ],
    }
    res = optimize(payload)
    assert res.status_code == 422


# ─── TC-007 Invalid Capacity (422) ───────────────────────────────────────────
def test_tc_007_invalid_capacity():
    payload = {
        "returnId": "RET007", "productId": "P007",
        "recommendedDecision": "REFURBISH",
        "customerLocation": "Delhi",
        "conditionScore": 75, "estimatedValue": 10000,
        "warehouses": [
            {"warehouseId": "WH-BAD", "city": "X", "capacity": 120, "distanceKm": 100},
        ],
    }
    res = optimize(payload)
    assert res.status_code == 422


# ─── TC-008 Demo Scenario ─────────────────────────────────────────────────────
def test_tc_008_demo_scenario():
    payload = {
        "returnId": "RET123", "productId": "P123",
        "recommendedDecision": "REFURBISH",
        "customerLocation": "Kolkata",
        "conditionScore": 82, "estimatedValue": 15000,
        "warehouses": [
            {"warehouseId": "WH-KOL-01", "city": "Kolkata",   "capacity": 85, "distanceKm": 25},
            {"warehouseId": "WH-BLR-01", "city": "Bangalore", "capacity": 60, "distanceKm": 1550},
        ],
    }
    res = optimize(payload)
    assert res.status_code == 200
    data = res.json()
    assert data["recommendedWarehouse"] == "WH-KOL-01"
    assert "Kolkata" in data["recommendedRoute"]
    assert data["estimatedCost"] < 500    # 25 km × ₹4 = ₹100
    assert data["estimatedDays"] == 1
    assert data["carbonScore"] >= 85
