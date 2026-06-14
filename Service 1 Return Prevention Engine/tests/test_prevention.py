import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ==========================================
# PHASE 1: Health & OpenAPI (TC-009, TC-010)
# ==========================================
def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Return Prevention Engine"
    assert data["version"] == "1.0.0"

def test_openapi_endpoint():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "paths" in data
    assert "/api/v1/prevention/analyze" in data["paths"]

# ==========================================
# PHASE 2: Risk Scoring Verification (TC-001, TC-002, TC-003)
# ==========================================
def test_low_risk_customer():
    payload = {
        "customerId": "C_LOW",
        "productId": "P_LOW",
        "category": "Books",
        "productRating": 4.8,
        "customerReturnRate": 0.05,
        "customerPurchaseCount": 50,
        "productReturnRate": 0.02,
        "sellerRating": 4.9,
        "price": 500.0
    }
    response = client.post("/api/v1/prevention/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["returnRiskScore"] < 40
    assert data["riskLevel"] == "LOW"

def test_medium_risk_customer():
    payload = {
        "customerId": "C_MED",
        "productId": "P_MED",
        "category": "Home Goods",
        "productRating": 4.0,
        "customerReturnRate": 0.15,
        "customerPurchaseCount": 12,
        "productReturnRate": 0.10,
        "sellerRating": 4.2,
        "price": 2500.0
    }
    response = client.post("/api/v1/prevention/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 40 <= data["returnRiskScore"] < 70
    assert data["riskLevel"] == "MEDIUM"

def test_high_risk_customer():
    payload = {
        "customerId": "C_HIGH",
        "productId": "P_HIGH",
        "category": "Apparel",
        "productRating": 3.0,
        "customerReturnRate": 0.40,
        "customerPurchaseCount": 2,
        "productReturnRate": 0.20,
        "sellerRating": 3.5,
        "price": 8000.0
    }
    response = client.post("/api/v1/prevention/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["returnRiskScore"] >= 70
    assert data["riskLevel"] == "HIGH"

# ==========================================
# PHASE 3: Boundary Transitions (39, 40, 69, 70)
# ==========================================
def test_boundary_score_transitions():
    def check_score_level(customer_return_rate, product_return_rate, seller_rating, product_rating, purchase_count):
        payload = {
            "customerId": "C_BOUND",
            "productId": "P_BOUND",
            "category": "Electronics",
            "productRating": product_rating,
            "customerReturnRate": customer_return_rate,
            "customerPurchaseCount": purchase_count,
            "productReturnRate": product_return_rate,
            "sellerRating": seller_rating,
            "price": 100.0
        }
        res = client.post("/api/v1/prevention/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        return data["returnRiskScore"], data["riskLevel"]

    # 1. Target Score = 39 (LOW)
    # S_cr = 100 (rate 0.35) -> contribution = 35
    # S_pr = 0 -> contribution = 0
    # S_sr = 0 (rating 5.0) -> contribution = 0
    # S_ur = 0 (rating 5.0) -> contribution = 0
    # S_ph = 40 (purchase count 24 -> 100 - 60 = 40) -> contribution = 4.0
    # Total Score = 39
    score, level = check_score_level(0.35, 0.0, 5.0, 5.0, 24)
    assert score == 39
    assert level == "LOW"

    # 2. Target Score = 40 (MEDIUM)
    # S_cr = 100 (rate 0.35) -> contribution = 35
    # S_pr = 0 -> contribution = 0
    # S_sr = 0 (rating 5.0) -> contribution = 0
    # S_ur = 0 (rating 5.0) -> contribution = 0
    # S_ph = 50 (purchase count 20 -> 100 - 50 = 50) -> contribution = 5.0
    # Total Score = 40
    score, level = check_score_level(0.35, 0.0, 5.0, 5.0, 20)
    assert score == 40
    assert level == "MEDIUM"

    # 3. Target Score = 69 (MEDIUM)
    # S_cr = 100 (rate 0.35) -> contribution = 35
    # S_pr = 100 (rate 0.18) -> contribution = 30
    # S_sr = 0 (rating 5.0) -> contribution = 0
    # S_ur = 0 (rating 5.0) -> contribution = 0
    # S_ph = 40 (purchase count 24 -> 100 - 60 = 40) -> contribution = 4.0
    # Total Score = 69
    score, level = check_score_level(0.35, 0.18, 5.0, 5.0, 24)
    assert score == 69
    assert level == "MEDIUM"

    # 4. Target Score = 70 (HIGH)
    # S_cr = 100 (rate 0.35) -> contribution = 35
    # S_pr = 100 (rate 0.18) -> contribution = 30
    # S_sr = 0 (rating 5.0) -> contribution = 0
    # S_ur = 0 (rating 5.0) -> contribution = 0
    # S_ph = 50 (purchase count 20 -> 100 - 50 = 50) -> contribution = 5.0
    # Total Score = 70
    score, level = check_score_level(0.35, 0.18, 5.0, 5.0, 20)
    assert score == 70
    assert level == "HIGH"

# ==========================================
# PHASE 4: Confidence Engine Validation (TC-005, TC-006, TC-007, TC-008)
# ==========================================
def test_confidence_engine_bonuses():
    def get_confidence(purchase_count, product_rating, seller_rating):
        payload = {
            "customerId": "C", "productId": "P", "category": "Books",
            "productRating": product_rating, "customerReturnRate": 0.0,
            "customerPurchaseCount": purchase_count, "productReturnRate": 0.0,
            "sellerRating": seller_rating, "price": 100.0
        }
        res = client.post("/api/v1/prevention/analyze", json=payload)
        return res.json()["confidence"]

    # Base Confidence (0.80)
    assert get_confidence(10, 3.5, 4.0) == 0.80

    # Purchase Count Bonus (+0.05) -> 0.85
    assert get_confidence(20, 3.5, 4.0) == 0.85

    # Product Rating Bonus (+0.03) -> 0.83
    assert get_confidence(10, 4.0, 4.0) == 0.83

    # Seller Rating Bonus (+0.03) -> 0.83
    assert get_confidence(10, 3.5, 4.5) == 0.83

    # Maximum Bounded Confidence (capped at 1.00)
    assert get_confidence(25, 4.8, 4.9) == 0.91

# ==========================================
# PHASE 5: Recommendation Engine Validation (TC-012, TC-013)
# ==========================================
def test_recommendation_paths():
    # 1. High Customer Return Rate for Electronics
    payload = {
        "customerId": "C", "productId": "P", "category": "Electronics",
        "productRating": 4.8, "customerReturnRate": 0.35, "customerPurchaseCount": 20,
        "productReturnRate": 0.0, "sellerRating": 5.0, "price": 100.0
    }
    data = client.post("/api/v1/prevention/analyze", json=payload).json()
    assert "Review product dimensions" in data["recommendedActions"]

    # High Customer Return Rate for Non-Electronics/Non-Apparel/Non-Home (e.g. Books)
    payload["category"] = "Books"
    data = client.post("/api/v1/prevention/analyze", json=payload).json()
    assert "Review specifications carefully" in data["recommendedActions"]
    assert "Verify size and dimensions" in data["recommendedActions"]

    # 2. High Product Return Rate
    payload = {
        "customerId": "C", "productId": "P", "category": "Books",
        "productRating": 4.8, "customerReturnRate": 0.0, "customerPurchaseCount": 20,
        "productReturnRate": 0.25, "sellerRating": 5.0, "price": 100.0
    }
    data = client.post("/api/v1/prevention/analyze", json=payload).json()
    assert "Compare alternatives" in data["recommendedActions"]
    assert "Read recent reviews" in data["recommendedActions"]

    # 3. Low Seller Rating (< 4.8)
    # Case A: Between 4.5 and 4.8
    payload["sellerRating"] = 4.6
    payload["productReturnRate"] = 0.0
    data = client.post("/api/v1/prevention/analyze", json=payload).json()
    assert "Check seller recommendations" in data["recommendedActions"]
    
    # Case B: Below 4.5
    payload["sellerRating"] = 4.2
    data = client.post("/api/v1/prevention/analyze", json=payload).json()
    assert "Consider another seller" in data["recommendedActions"]

    # 4. Low Product Rating (< 4.0)
    payload = {
        "customerId": "C", "productId": "P", "category": "Books",
        "productRating": 3.8, "customerReturnRate": 0.0, "customerPurchaseCount": 20,
        "productReturnRate": 0.0, "sellerRating": 5.0, "price": 100.0
    }
    data = client.post("/api/v1/prevention/analyze", json=payload).json()
    assert "Review customer feedback" in data["recommendedActions"]

    # 5. Combined Risk Scenario (no duplicates)
    payload = {
        "customerId": "C", "productId": "P", "category": "Electronics",
        "productRating": 3.5,
        "customerReturnRate": 0.35,
        "customerPurchaseCount": 22,
        "productReturnRate": 0.25,
        "sellerRating": 3.2,
        "price": 15000.0
    }
    data = client.post("/api/v1/prevention/analyze", json=payload).json()
    actions = data["recommendedActions"]
    assert len(actions) == len(set(actions))

# ==========================================
# PHASE 6: Input Validation (Empty, Whitespace, Length, Numeric)
# ==========================================
def test_validation_empty_category():
    payload = {
        "customerId": "C123", "productId": "P456",
        "category": "",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }
    assert client.post("/api/v1/prevention/analyze", json=payload).status_code == 422

def test_validation_whitespace_category():
    payload = {
        "customerId": "C123", "productId": "P456",
        "category": "    ",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }
    assert client.post("/api/v1/prevention/analyze", json=payload).status_code == 422

def test_validation_exact_100_chars():
    payload = {
        "customerId": "C" * 100,
        "productId": "P" * 100,
        "category": "E" * 100,
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }
    assert client.post("/api/v1/prevention/analyze", json=payload).status_code == 200

def test_validation_101_chars_fails():
    base_payload = {
        "customerId": "C", "productId": "P", "category": "Electronics",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }

    # TC-014: customerId > 100 chars (101)
    payload1 = base_payload.copy()
    payload1["customerId"] = "C" * 101
    assert client.post("/api/v1/prevention/analyze", json=payload1).status_code == 422

    # TC-015: productId > 100 chars (101)
    payload2 = base_payload.copy()
    payload2["productId"] = "P" * 101
    assert client.post("/api/v1/prevention/analyze", json=payload2).status_code == 422

    # TC-016: category > 100 chars (101)
    payload3 = base_payload.copy()
    payload3["category"] = "E" * 101
    assert client.post("/api/v1/prevention/analyze", json=payload3).status_code == 422

def test_validation_numeric_safety():
    # Pass NaN and Infinity using raw JSON strings to bypass HTTPX client-side validation errors
    headers = {"Content-Type": "application/json"}

    # TC-017: NaN Product Rating
    raw_payload_nan = '{"customerId": "C123", "productId": "P456", "category": "Electronics", "productRating": NaN, "customerReturnRate": 0.10, "customerPurchaseCount": 5, "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0}'
    res = client.post("/api/v1/prevention/analyze", data=raw_payload_nan, headers=headers)
    assert res.status_code == 422

    # TC-018: Infinity Product Rating
    raw_payload_inf = '{"customerId": "C123", "productId": "P456", "category": "Electronics", "productRating": Infinity, "customerReturnRate": 0.10, "customerPurchaseCount": 5, "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0}'
    res = client.post("/api/v1/prevention/analyze", data=raw_payload_inf, headers=headers)
    assert res.status_code == 422

    # TC-019: Negative Infinity Product Rating
    raw_payload_neginf = '{"customerId": "C123", "productId": "P456", "category": "Electronics", "productRating": -Infinity, "customerReturnRate": 0.10, "customerPurchaseCount": 5, "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0}'
    res = client.post("/api/v1/prevention/analyze", data=raw_payload_neginf, headers=headers)
    assert res.status_code == 422

    # TC-020: NaN Return Rate
    raw_payload_nan_rr = '{"customerId": "C123", "productId": "P456", "category": "Electronics", "productRating": 4.2, "customerReturnRate": NaN, "customerPurchaseCount": 5, "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0}'
    res = client.post("/api/v1/prevention/analyze", data=raw_payload_nan_rr, headers=headers)
    assert res.status_code == 422

    # TC-021: Infinity Return Rate
    raw_payload_inf_rr = '{"customerId": "C123", "productId": "P456", "category": "Electronics", "productRating": 4.2, "customerReturnRate": Infinity, "customerPurchaseCount": 5, "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0}'
    res = client.post("/api/v1/prevention/analyze", data=raw_payload_inf_rr, headers=headers)
    assert res.status_code == 422

# ==========================================
# PHASE 7: Edge Cases (TC-022 - TC-027)
# ==========================================
def test_edge_case_max_values():
    # TC-022
    payload = {
        "customerId": "C_MAX", "productId": "P_MAX", "category": "Electronics",
        "productRating": 5.0, "customerReturnRate": 1.0, "customerPurchaseCount": 10000,
        "productReturnRate": 1.0, "sellerRating": 5.0, "price": 1000000.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    # S_cr = 100 (35%), S_pr = 100 (30%), S_sr = 0 (15%), S_ur = 0 (10%), S_ph = 0 (10%).
    # 0.35*100 + 0.30*100 = 65.
    assert data["returnRiskScore"] == 65
    assert data["riskLevel"] == "MEDIUM"

def test_edge_case_min_values():
    # TC-023
    payload = {
        "customerId": "C_MIN", "productId": "P_MIN", "category": "Electronics",
        "productRating": 0.0, "customerReturnRate": 0.0, "customerPurchaseCount": 0,
        "productReturnRate": 0.0, "sellerRating": 0.0, "price": 0.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    # S_cr = 0, S_pr = 0, S_sr = 100 (15), S_ur = 100 (10), S_ph = 100 (10). Total = 35.
    assert data["returnRiskScore"] == 35
    assert data["riskLevel"] == "LOW"

def test_edge_case_new_customer():
    # TC-026
    payload = {
        "customerId": "C_NEW", "productId": "P_NEW", "category": "Books",
        "productRating": 4.5, "customerReturnRate": 0.0, "customerPurchaseCount": 0,
        "productReturnRate": 0.05, "sellerRating": 4.8, "price": 100.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200
    assert "Customer has limited purchase history" in res.json()["explanation"]

def test_edge_case_repeat_return_customer():
    # TC-027
    payload = {
        "customerId": "C_REP", "productId": "P_REP", "category": "Books",
        "productRating": 4.5, "customerReturnRate": 1.0, "customerPurchaseCount": 10,
        "productReturnRate": 0.05, "sellerRating": 4.8, "price": 100.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200
    assert "Customer has elevated return history" in res.json()["explanation"]

# ==========================================
# PHASE 8: Security Payloads
# ==========================================
def test_security_payload_xss():
    payload = {
        "customerId": "<script>alert('x')</script>",
        "productId": "P123",
        "category": "Electronics",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200

def test_security_payload_sqli():
    payload = {
        "customerId": "C123",
        "productId": "' OR 1=1 --",
        "category": "Electronics",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200

def test_security_payload_path_traversal():
    payload = {
        "customerId": "C123",
        "productId": "P123",
        "category": "../../../etc/passwd",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200

def test_security_unexpected_json_fields():
    payload = {
        "customerId": "C123", "productId": "P456", "category": "Electronics",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0,
        "unexpected_field_1": "some_value",
        "unexpected_field_2": 999.9
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 200

def test_security_malformed_json():
    raw_payload = "{ 'customerId': 'C123', 'productId': 'P456', "
    res = client.post("/api/v1/prevention/analyze", data=raw_payload, headers={"Content-Type": "application/json"})
    assert res.status_code in [400, 422]

def test_security_null_values():
    payload = {
        "customerId": None,
        "productId": "P456",
        "category": "Electronics",
        "productRating": 4.2, "customerReturnRate": 0.10, "customerPurchaseCount": 5,
        "productReturnRate": 0.05, "sellerRating": 4.5, "price": 100.0
    }
    res = client.post("/api/v1/prevention/analyze", json=payload)
    assert res.status_code == 422

# ==========================================
# PHASE 9: Determinism (TC-008 Loop 100x)
# ==========================================
def test_determinism_loop():
    payload = {
        "customerId": "C123",
        "productId": "P456",
        "category": "Electronics",
        "productRating": 4.2,
        "customerReturnRate": 0.35,
        "customerPurchaseCount": 22,
        "productReturnRate": 0.18,
        "sellerRating": 4.7,
        "price": 15000.0
    }
    
    first_response = client.post("/api/v1/prevention/analyze", json=payload).json()
    
    for _ in range(100):
        current_response = client.post("/api/v1/prevention/analyze", json=payload).json()
        assert current_response["returnRiskScore"] == first_response["returnRiskScore"]
        assert current_response["riskLevel"] == first_response["riskLevel"]
        assert current_response["confidence"] == first_response["confidence"]
        assert current_response["recommendedActions"] == first_response["recommendedActions"]
        assert current_response["explanation"] == first_response["explanation"]
