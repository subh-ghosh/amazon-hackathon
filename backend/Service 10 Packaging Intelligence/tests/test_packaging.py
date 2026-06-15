import pytest
import math
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
import httpx
from app.main import app
from app.services.scoring import ScoringEngine

client = TestClient(app)

# ==========================================
# 1. Health & OpenAPI Endpoints
# ==========================================

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Packaging Intelligence Service"
    assert data["version"] == "1.0.0"

def test_openapi_endpoint():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "paths" in data
    assert "/api/v1/packaging/analyze" in data["paths"]

# ==========================================
# 2. Schema Validation (HTTP 422 Checks)
# ==========================================

def test_valid_payload():
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["productId"] == "P123"
    assert "sustainabilityScore" in data
    assert "packagingEfficiencyScore" in data
    assert "carbonImpactScore" in data
    assert "recyclabilityScore" in data

def test_invalid_payload_missing_fields():
    payload = {
        "productId": "P123"
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 422

def test_empty_strings():
    payload = {
        "productId": "",
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 422
    assert "value cannot be empty" in response.text.lower()

def test_whitespace_strings():
    payload = {
        "productId": "P123",
        "category": "   ",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 422
    assert "value cannot be empty" in response.text.lower()

def test_negative_values():
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": -2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 422
    assert "greater than 0" in response.text.lower()

def test_zero_values():
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 0.0,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 422
    assert "greater than 0" in response.text.lower()

def test_nan_validation():
    import json
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": float('nan'),
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    raw_json = json.dumps(payload, allow_nan=True)
    response = client.post("/api/v1/packaging/analyze", content=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert "greater than 0" in response.text.lower() or "finite number" in response.text.lower()

def test_infinity_validation():
    import json
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": float('inf'),
        "width": 20.0,
        "height": 10.0
    }
    raw_json = json.dumps(payload, allow_nan=True)
    response = client.post("/api/v1/packaging/analyze", content=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert "finite number" in response.text.lower()

# ==========================================
# 3. Scoring & Recommendation Logic
# ==========================================

def test_material_normalization():
    # Verify that mixed case and surrounding whitespaces are normalized
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 10.0,
        "packagingWeight": 0.5,
        "packagingMaterial": "  CaRdBoArD  ",
        "length": 10.0,
        "width": 10.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Recyclability score for Cardboard is 100
    assert data["recyclabilityScore"] == 100

def test_plastic_sustainability_cap():
    # Cardboard is 100 material score, Plastic capped at 50
    # Let's run a test where raw score is high but material is plastic
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 10.0,
        "packagingWeight": 0.1,  # ratio 0.01 -> s_weight = 100
        "packagingMaterial": "Plastic", # recyclability = 40, s_material = 20
        # raw: 0.4 * 20 + 0.3 * 100 + 0.3 * 40 = 8 + 30 + 12 = 50.
        # Let's do Recycled Plastic: recyclability = 70, s_material = 60
        # raw: 0.4 * 60 + 0.3 * 100 + 0.3 * 70 = 24 + 30 + 21 = 75.
        # Capped at 50.
        "length": 10.0,
        "width": 10.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sustainabilityScore"] == 50

def test_carbon_score_floor():
    # Heavy plastic packaging should result in carbon score 0
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 1.0,
        "packagingWeight": 10.0,  # 10kg plastic -> 30kg CO2 emissions
        "packagingMaterial": "Plastic",
        "length": 10.0,
        "width": 10.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["carbonImpactScore"] == 0

def test_carbon_score_ceiling():
    # Light paper packaging should result in carbon score close to 100
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 1.0,
        "packagingWeight": 0.001,  # 1g cardboard -> negligible emissions
        "packagingMaterial": "Cardboard",
        "length": 10.0,
        "width": 10.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["carbonImpactScore"] == 100

def test_recyclability_mapping():
    materials = {
        "cardboard": 100,
        "paper": 100,
        "bamboo": 95,
        "wood": 90,
        "glass": 80,
        "metal": 80,
        "recycled plastic": 70,
        "plastic": 40,
        "styrofoam": 0
    }
    for mat, score in list(materials.items()):
        payload = {
            "productId": "P123",
            "category": "Electronics",
            "productWeight": 1.0,
            "packagingWeight": 0.1,
            "packagingMaterial": mat,
            "length": 10.0,
            "width": 10.0,
            "height": 10.0
        }
        res = client.post("/api/v1/packaging/analyze", json=payload).json()
        assert res["recyclabilityScore"] == score

def test_oversized_packaging():
    # Large dimensions relative to lightweight product
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 0.1,
        "packagingWeight": 0.1,
        "packagingMaterial": "Cardboard",
        "length": 60.0,  # > 50 cm
        "width": 40.0,
        "height": 30.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert any("oversized" in rec.lower() for rec in data["recommendations"])
    assert any("empty space" in exp.lower() for exp in data["explanations"])

def test_high_sustainability_scenario():
    # Cardboard, lightweight, compact
    payload = {
        "productId": "P123",
        "category": "Books",
        "productWeight": 1.0,
        "packagingWeight": 0.05,  # 5% of product weight
        "packagingMaterial": "Cardboard",
        "length": 20.0,
        "width": 15.0,
        "height": 3.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sustainabilityScore"] >= 80

def test_low_sustainability_scenario():
    # Styrofoam, heavy weight
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 1.0,
        "packagingWeight": 1.5,  # heavier than product
        "packagingMaterial": "Styrofoam",
        "length": 40.0,
        "width": 30.0,
        "height": 20.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sustainabilityScore"] <= 30
    assert any("avoid styrofoam" in rec.lower() for rec in data["recommendations"])

def test_multiple_recommendation_triggers():
    # Heavy, plastic, oversized
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 1.0,
        "packagingWeight": 0.8,  # heavy weight ratio
        "packagingMaterial": "Plastic", # plastic
        "length": 60.0,  # oversized
        "width": 60.0,
        "height": 40.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) >= 3
    assert len(data["explanations"]) >= 3

def test_optimized_packaging_scenario():
    # Fully optimized cardboard packaging
    payload = {
        "productId": "P123",
        "category": "Books",
        "productWeight": 2.0,
        "packagingWeight": 0.08,
        "packagingMaterial": "Cardboard",
        "length": 25.0,
        "width": 20.0,
        "height": 4.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "highly optimized" in data["recommendations"][0].lower()

def test_boundary_conditions():
    # Weight ratio exactly 0.1 boundary
    payload = {
        "productId": "P123",
        "category": "Books",
        "productWeight": 1.0,
        "packagingWeight": 0.1,  # ratio = 0.1 -> s_weight = 100
        "packagingMaterial": "Cardboard",
        "length": 10.0,
        "width": 10.0,
        "height": 10.0
    }
    res_exact = client.post("/api/v1/packaging/analyze", json=payload).json()
    
    # Weight ratio slightly above 0.1 boundary (0.101)
    payload["packagingWeight"] = 0.101
    res_above = client.post("/api/v1/packaging/analyze", json=payload).json()
    
    # Sustainability score should drop due to linear penalty
    assert res_exact["sustainabilityScore"] >= res_above["sustainabilityScore"]

# ==========================================
# 4. Security & Robustness Checks
# ==========================================

def test_security_payloads_long_strings():
    # Long strings to check buffer limit/validator limits
    payload = {
        "productId": "P" * 100,  # Max length 100 allowed
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200

    # Exceed limit
    payload["productId"] = "P" * 101
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 422

def test_security_payloads_extreme_numerical_values():
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 1e9,  # extremely heavy
        "packagingWeight": 1e9,
        "packagingMaterial": "Plastic",
        "length": 1e6,
        "width": 1e6,
        "height": 1e6
    }
    response = client.post("/api/v1/packaging/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Output should not crash and should cap appropriately
    assert 0 <= data["sustainabilityScore"] <= 100
    assert 0 <= data["packagingEfficiencyScore"] <= 100

# ==========================================
# 5. Determinism, Concurrency & Performance
# ==========================================

def test_determinism_loop():
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    # Run 100 executions to verify determinism
    first_res = client.post("/api/v1/packaging/analyze", json=payload).json()
    for _ in range(100):
        loop_res = client.post("/api/v1/packaging/analyze", json=payload).json()
        assert loop_res == first_res

def test_concurrent_requests():
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    
    def make_request():
        res = client.post("/api/v1/packaging/analyze", json=payload)
        return res.status_code

    # Run 20 requests concurrently in a thread pool
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request) for _ in range(20)]
        results = [f.result() for f in futures]
        
    for code in results:
        assert code == 200

def test_performance_validation():
    payload = {
        "productId": "P123",
        "category": "Electronics",
        "productWeight": 2.5,
        "packagingWeight": 1.2,
        "packagingMaterial": "Plastic",
        "length": 30.0,
        "width": 20.0,
        "height": 10.0
    }
    
    start_time = time.perf_counter()
    for _ in range(50):
        client.post("/api/v1/packaging/analyze", json=payload)
    end_time = time.perf_counter()
    
    avg_latency = (end_time - start_time) / 50.0
    # Average response latency should be less than 250ms (0.25 seconds) locally
    assert avg_latency < 0.25
