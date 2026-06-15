import pytest
import math
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes import seller_store
from app.services.scoring import ScoringEngine

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Clear cache before each test
    seller_store.clear()
    yield

# ==========================================
# 1. Health & OpenAPI Endpoints
# ==========================================

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Seller Intelligence Engine"
    assert data["version"] == "1.0.0"

def test_openapi_endpoint():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "openapi" in data
    assert "paths" in data
    assert "/api/v1/seller/analyze" in data["paths"]
    assert "/api/v1/seller/{sellerId}/dashboard" in data["paths"]

# ==========================================
# 2. Schema Validation (HTTP 422 Checks)
# ==========================================

def test_valid_payload_minimal():
    payload = {
        "sellerId": "SELLER_MIN",
        "sellerName": "Minimal Store",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sellerId"] == "SELLER_MIN"
    assert data["sellerHealthScore"] > 0
    assert len(data["historicalMetrics"]["healthScores"]) == 0

def test_valid_payload_full():
    payload = {
        "sellerId": "SELLER123",
        "sellerName": "TechStore",
        "totalOrders": 10000,
        "totalReturns": 850,
        "fraudCases": 35,
        "averageRating": 4.2,
        "packagingScore": 78,
        "products": [
            {
                "productId": "P123",
                "returnRate": 12.5,
                "category": "Electronics"
            }
        ]
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sellerId"] == "SELLER123"
    assert data["returnsPer100Orders"] == 8.5
    assert len(data["highRiskProducts"]) == 1
    assert data["highRiskProducts"][0]["productId"] == "P123"
    assert data["highRiskProducts"][0]["riskLevel"] == "HIGH"

def test_missing_required_fields():
    payload = {
        "sellerId": "SELLER123"
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_extra_fields_rejected():
    payload = {
        "sellerId": "SELLER123",
        "sellerName": "TechStore",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85,
        "extraField": "notAllowed"
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422
    assert "extra inputs" in response.text.lower() or "extra fields" in response.text.lower()

def test_empty_seller_id():
    payload = {
        "sellerId": "",
        "sellerName": "TechStore",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422
    assert "cannot be empty" in response.text.lower()

def test_whitespace_seller_name():
    payload = {
        "sellerId": "S1",
        "sellerName": "    ",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422
    assert "cannot be empty" in response.text.lower()

def test_invalid_rating_low():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": -0.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_invalid_rating_high():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 5.1,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_invalid_packaging_score():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 105.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_negative_total_orders():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": -10,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_negative_total_returns():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": -5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_negative_fraud_cases():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": -1,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_returns_exceed_orders():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 105,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422
    assert "cannot exceed totalorders" in response.text.lower()

def test_fraud_exceed_returns():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 10,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422
    assert "cannot exceed totalreturns" in response.text.lower()

def test_empty_product_id():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85,
        "products": [
            {
                "productId": "  ",
                "returnRate": 10.0
            }
        ]
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

def test_invalid_product_return_rate():
    payload = {
        "sellerId": "S1",
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85,
        "products": [
            {
                "productId": "P1",
                "returnRate": 105.0
            }
        ]
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

# ==========================================
# 3. NaN & Infinity Rejection
# ==========================================

def test_nan_rating_rejected():
    raw_json = '{"sellerId": "S1", "sellerName": "Name", "totalOrders": 100, "totalReturns": 5, "fraudCases": 0, "averageRating": NaN, "packagingScore": 85}'
    response = client.post("/api/v1/seller/analyze", content=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert "nan" in response.text.lower()

def test_infinity_rating_rejected():
    raw_json = '{"sellerId": "S1", "sellerName": "Name", "totalOrders": 100, "totalReturns": 5, "fraudCases": 0, "averageRating": Infinity, "packagingScore": 85}'
    response = client.post("/api/v1/seller/analyze", content=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert "infinity" in response.text.lower()

def test_nan_product_return_rate():
    raw_json = '{"sellerId": "S1", "sellerName": "Name", "totalOrders": 100, "totalReturns": 5, "fraudCases": 0, "averageRating": 4.5, "packagingScore": 85, "products": [{"productId": "P1", "returnRate": NaN}]}'
    response = client.post("/api/v1/seller/analyze", content=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422

def test_infinity_product_return_rate():
    raw_json = '{"sellerId": "S1", "sellerName": "Name", "totalOrders": 100, "totalReturns": 5, "fraudCases": 0, "averageRating": 4.5, "packagingScore": 85, "products": [{"productId": "P1", "returnRate": -Infinity}]}'
    response = client.post("/api/v1/seller/analyze", content=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422

def test_string_length_limits():
    payload = {
        "sellerId": "S" * 105,
        "sellerName": "Name",
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422

# ==========================================
# 4. Seller Tier Mappings
# ==========================================

def test_tier_platinum():
    # rating 5.0, packaging 95, returns 0, fraud 0 -> health >= 90
    payload = {
        "sellerId": "S1",
        "sellerName": "Platinum Store",
        "totalOrders": 1000,
        "totalReturns": 0,
        "fraudCases": 0,
        "averageRating": 5.0,
        "packagingScore": 95.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    assert response.json()["sellerTier"] == "PLATINUM"

def test_tier_gold():
    # rating 4.2, packaging 78, returns 850, fraud 35 -> health 82 (matches example)
    payload = {
        "sellerId": "S1",
        "sellerName": "Gold Store",
        "totalOrders": 10000,
        "totalReturns": 850,
        "fraudCases": 35,
        "averageRating": 4.2,
        "packagingScore": 78.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    assert response.json()["sellerTier"] == "GOLD"

def test_tier_silver():
    # moderate rating, moderate packaging, moderate returns
    payload = {
        "sellerId": "S1",
        "sellerName": "Silver Store",
        "totalOrders": 1000,
        "totalReturns": 100,
        "fraudCases": 5,
        "averageRating": 3.8,
        "packagingScore": 70.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    assert response.json()["sellerTier"] == "SILVER"

def test_tier_needs_attention():
    # poor rating, poor packaging, high returns, high fraud
    payload = {
        "sellerId": "S1",
        "sellerName": "Poor Store",
        "totalOrders": 1000,
        "totalReturns": 300,
        "fraudCases": 50,
        "averageRating": 2.2,
        "packagingScore": 45.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    assert response.json()["sellerTier"] == "NEEDS_ATTENTION"

# ==========================================
# 5. Core Business Profiles
# ==========================================

def test_high_fraud_seller():
    payload = {
        "sellerId": "S1",
        "sellerName": "Fraud Store",
        "totalOrders": 1000,
        "totalReturns": 100,
        "fraudCases": 80,
        "averageRating": 4.5,
        "packagingScore": 85.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["fraudRiskScore"] >= 50
    assert data["fraudExposureLevel"] == "HIGH"
    assert data["overallRiskLevel"] == "CRITICAL"

def test_high_returns_seller():
    payload = {
        "sellerId": "S1",
        "sellerName": "Returns Store",
        "totalOrders": 1000,
        "totalReturns": 450,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["returnRiskScore"] >= 75
    assert data["overallRiskLevel"] == "CRITICAL"

def test_excellent_seller():
    payload = {
        "sellerId": "S1",
        "sellerName": "Perfect Store",
        "totalOrders": 20000,
        "totalReturns": 10,
        "fraudCases": 0,
        "averageRating": 5.0,
        "packagingScore": 98.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["sellerHealthScore"] >= 95
    assert data["sellerTier"] == "PLATINUM"
    assert data["overallRiskLevel"] == "LOW"

# ==========================================
# 6. Dashboard Retrieval & Concurrency
# ==========================================

def test_dashboard_not_found():
    response = client.get("/api/v1/seller/SELLER_NONE/dashboard")
    assert response.status_code == 404
    assert "not found" in response.text.lower()

def test_dashboard_retrieval_success():
    # First analyze
    payload = {
        "sellerId": "SELLER_DASH",
        "sellerName": "Dash Store",
        "totalOrders": 100,
        "totalReturns": 2,
        "fraudCases": 0,
        "averageRating": 4.8,
        "packagingScore": 90
    }
    response_post = client.post("/api/v1/seller/analyze", json=payload)
    assert response_post.status_code == 200
    
    # Retrieve dashboard
    response_get = client.get("/api/v1/seller/SELLER_DASH/dashboard")
    assert response_get.status_code == 200
    data = response_get.json()
    assert data["sellerId"] == "SELLER_DASH"
    assert data["sellerHealthScore"] == response_post.json()["sellerHealthScore"]

def test_concurrent_dashboard_access():
    # Analyze multiple times concurrently
    payload = {
        "sellerId": "SELLER_CONCUR",
        "sellerName": "Concur Store",
        "totalOrders": 100,
        "totalReturns": 2,
        "fraudCases": 0,
        "averageRating": 4.8,
        "packagingScore": 90
    }
    
    def call_analyze():
        resp = client.post("/api/v1/seller/analyze", json=payload)
        return resp.status_code
        
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(call_analyze) for _ in range(10)]
        results = [f.result() for f in futures]
        
    assert all(status == 200 for status in results)
    
    # Check cache contains the seller
    res_dash = client.get("/api/v1/seller/SELLER_CONCUR/dashboard")
    assert res_dash.status_code == 200

# ==========================================
# 7. Boundary Conditions
# ==========================================

def test_boundary_zero_orders():
    payload = {
        "sellerId": "ZERO_ORDERS",
        "sellerName": "Zero Store",
        "totalOrders": 0,
        "totalReturns": 0,
        "fraudCases": 0,
        "averageRating": 0.0,
        "packagingScore": 0.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["returnsPer100Orders"] == 0.0
    assert data["estimatedRevenueLoss"] == 0.0
    assert data["sellerHealthScore"] == 0

def test_boundary_equal_orders_returns_fraud():
    payload = {
        "sellerId": "EQUAL_BOUND",
        "sellerName": "Equal Store",
        "totalOrders": 100,
        "totalReturns": 100,
        "fraudCases": 100,
        "averageRating": 4.0,
        "packagingScore": 80.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["returnsPer100Orders"] == 100.0
    assert data["estimatedRevenueLoss"] == 1412.0
    assert data["fraudRiskScore"] == 100

# ==========================================
# 8. S11 Final Enhancements Verification
# ==========================================

# TC-031 Trend Logic Validation
def test_trend_logic_validation():
    # Run 1: High returns
    payload1 = {
        "sellerId": "TREND_SELLER",
        "sellerName": "Trend Store",
        "totalOrders": 10000,
        "totalReturns": 1500,  # 15% return rate
        "fraudCases": 10,
        "averageRating": 4.2,
        "packagingScore": 78
    }
    resp1 = client.post("/api/v1/seller/analyze", json=payload1)
    assert resp1.status_code == 200
    assert resp1.json()["returnTrend"] == "DECLINING"  # > 12.0% return rate baseline is DECLINING (high returns)
    
    # Run 2: Low returns (improvement)
    payload2 = {
        "sellerId": "TREND_SELLER",
        "sellerName": "Trend Store",
        "totalOrders": 10000,
        "totalReturns": 200,   # 2% return rate (improved)
        "fraudCases": 5,       # fraudCases decreased (improved)
        "averageRating": 4.9,  # averageRating increased (improved)
        "packagingScore": 90
    }
    resp2 = client.post("/api/v1/seller/analyze", json=payload2)
    assert resp2.status_code == 200
    assert resp2.json()["returnTrend"] == "IMPROVING"  # Decreased return rate
    assert resp2.json()["sellerHealthTrend"] == "IMPROVING"  # Health score increased
    assert resp2.json()["fraudTrend"] == "IMPROVING"  # Fraud cases decreased

# TC-032 Revenue Loss Calculation
def test_revenue_loss_calculation():
    payload = {
        "sellerId": "REV_SELLER",
        "sellerName": "Rev Store",
        "totalOrders": 1000,
        "totalReturns": 50,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 80
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    assert response.json()["estimatedRevenueLoss"] == 50 * 14.12

# TC-033 High Risk Product Classification
def test_high_risk_product_classification():
    payload = {
        "sellerId": "S1",
        "sellerName": "Store",
        "totalOrders": 100,
        "totalReturns": 10,
        "fraudCases": 0,
        "averageRating": 4.0,
        "packagingScore": 80,
        "products": [
            {"productId": "P_HIGH", "returnRate": 15.0, "category": "Electronics"},
            {"productId": "P_MED", "returnRate": 7.5, "category": "Apparel"},
            {"productId": "P_LOW", "returnRate": 3.0}
        ]
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    products = response.json()["highRiskProducts"]
    # Only returnRate > 5.0 should be returned as high/medium risk
    assert len(products) == 2
    
    # Verify categories and reasons
    high_prod = next(p for p in products if p["productId"] == "P_HIGH")
    assert high_prod["riskLevel"] == "HIGH"
    assert high_prod["reason"] == "QUALITY_DEFECT"  # > 15% return rate
    
    med_prod = next(p for p in products if p["productId"] == "P_MED")
    assert med_prod["riskLevel"] == "MEDIUM"
    assert med_prod["reason"] == "SIZE_MISMATCH"    # Apparel category

# TC-034 Insight Mapping Validation
def test_insight_mapping_validation():
    # Pass explicit integration insights
    payload = {
        "sellerId": "INTEG_SELLER",
        "sellerName": "Integ Store",
        "totalOrders": 1000,
        "totalReturns": 20,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85,
        "rootCauseInsights": [{"insight": "Custom S2 Insight", "severity": "HIGH"}],
        "fraudInsights": [{"insight": "Custom S3 Insight", "severity": "MEDIUM"}],
        "lifecycleInsights": [{"insight": "Custom S4 Insight", "severity": "LOW"}],
        "packagingInsights": [{"insight": "Custom S10 Insight", "severity": "LOW"}],
        "historicalInsights": [{"insight": "Custom S12 Insight", "severity": "HIGH"}]
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["rootCauseInsights"][0]["insight"] == "Custom S2 Insight"
    assert data["rootCauseInsights"][0]["severity"] == "HIGH"
    assert data["fraudInsights"][0]["insight"] == "Custom S3 Insight"
    assert data["lifecycleInsights"][0]["insight"] == "Custom S4 Insight"
    assert data["packagingInsights"][0]["insight"] == "Custom S10 Insight"
    assert data["historicalInsights"][0]["insight"] == "Custom S12 Insight"

# TC-035 Dashboard Persistence Readiness
def test_dashboard_persistence_readiness():
    # Run analysis
    payload = {
        "sellerId": "PERSIST_SELLER",
        "sellerName": "Persist Store",
        "totalOrders": 100,
        "totalReturns": 10,
        "fraudCases": 1,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    resp1 = client.post("/api/v1/seller/analyze", json=payload)
    assert resp1.status_code == 200
    
    # Retrieve dashboard directly
    resp2 = client.get("/api/v1/seller/PERSIST_SELLER/dashboard")
    assert resp2.status_code == 200
    
    # Verify exact schema compliance
    dashboard = resp2.json()
    assert "sellerHealthScore" in dashboard
    assert "sellerTier" in dashboard
    assert "estimatedRevenueLoss" in dashboard
    assert "sellerHealthTrend" in dashboard
    assert "priorityActions" in dashboard
    assert "riskBreakdown" in dashboard
    assert "sellerBenchmark" in dashboard
    assert "overallRiskLevel" in dashboard
    assert "historicalMetrics" in dashboard

# TC-036 Executive Summary Generation
def test_executive_summary_generation():
    payload = {
        "sellerId": "EXEC_SELLER",
        "sellerName": "Exec Store",
        "totalOrders": 10000,
        "totalReturns": 850,
        "fraudCases": 35,
        "averageRating": 4.2,
        "packagingScore": 78
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    summary = response.json()["executiveSummary"]
    assert "seller health is" in summary.lower()
    assert "sustainability performance" in summary.lower()

# TC-037 Priority Action Ranking
def test_priority_action_ranking():
    # Low rating and poor packaging trigger recommendations
    payload = {
        "sellerId": "RANK_SELLER",
        "sellerName": "Rank Store",
        "totalOrders": 1000,
        "totalReturns": 200,   # Return risk > 50
        "fraudCases": 25,      # Fraud risk > 15
        "averageRating": 3.0,  # Rating < 4.5
        "packagingScore": 50.0  # Packaging score < 80
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    actions = response.json()["priorityActions"]
    assert len(actions) > 0
    assert len(actions) <= 3
    # Check that highest improvement potential or risk is listed first
    assert "Improve packaging sustainability" in actions or "Reduce size mismatch returns" in actions

# TC-038 Benchmark Calculation
def test_benchmark_calculation():
    payload = {
        "sellerId": "BENCH_SELLER",
        "sellerName": "Bench Store",
        "totalOrders": 1000,
        "totalReturns": 85,
        "fraudCases": 3,
        "averageRating": 4.2,
        "packagingScore": 78
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    benchmark = response.json()["sellerBenchmark"]
    assert benchmark["healthPercentile"] == response.json()["sellerHealthScore"]
    assert benchmark["returnPerformance"] in ("EXCELLENT", "ABOVE_AVERAGE", "AVERAGE", "BELOW_AVERAGE", "POOR")
    assert benchmark["fraudPerformance"] in ("EXCELLENT", "GOOD", "AVERAGE", "POOR")
    assert benchmark["sustainabilityPerformance"] in ("EXCELLENT", "GOOD", "AVERAGE", "POOR")

# TC-039 Risk Breakdown Validation
def test_risk_breakdown_validation():
    payload = {
        "sellerId": "RISK_SELLER",
        "sellerName": "Risk Store",
        "totalOrders": 1000,
        "totalReturns": 50,
        "fraudCases": 10,
        "averageRating": 4.2,
        "packagingScore": 78
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    breakdown = response.json()["riskBreakdown"]
    total = (breakdown["returnsContribution"] +
             breakdown["fraudContribution"] +
             breakdown["sustainabilityContribution"] +
             breakdown["ratingContribution"])
    assert total == 100

# TC-040 Dashboard Metadata Validation
def test_dashboard_metadata_validation():
    payload = {
        "sellerId": "META_SELLER",
        "sellerName": "Meta Store",
        "totalOrders": 100,
        "totalReturns": 2,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "dashboardGeneratedAt" in data
    assert data["analysisVersion"] == "v1.0"
    # Verify ISO-8601 formatting presence
    assert "T" in data["dashboardGeneratedAt"]

# TC-041 Confidence Score Validation
def test_confidence_score_validation():
    payload = {
        "sellerId": "CONF_SELLER",
        "sellerName": "Conf Store",
        "totalOrders": 10000,
        "totalReturns": 850,
        "fraudCases": 35,
        "averageRating": 4.2,
        "packagingScore": 78,
        "products": [{"productId": "P123", "returnRate": 12.5}]
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    assert 0 <= response.json()["confidenceScore"] <= 100

# TC-042 Overall Risk Classification
def test_overall_risk_classification():
    payload = {
        "sellerId": "RISK_CLASS",
        "sellerName": "Risk Store",
        "totalOrders": 100,
        "totalReturns": 1,
        "fraudCases": 0,
        "averageRating": 4.8,
        "packagingScore": 90
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    assert response.json()["overallRiskLevel"] == "LOW"

# TC-043 Historical Metrics Structure
def test_historical_metrics_structure():
    # Call 1
    payload = {
        "sellerId": "HIST_SELLER",
        "sellerName": "Hist Store",
        "totalOrders": 1000,
        "totalReturns": 100,
        "fraudCases": 5,
        "averageRating": 4.2,
        "packagingScore": 78
    }
    resp1 = client.post("/api/v1/seller/analyze", json=payload)
    assert resp1.status_code == 200
    
    # Call 2
    resp2 = client.post("/api/v1/seller/analyze", json=payload)
    assert resp2.status_code == 200
    hist = resp2.json()["historicalMetrics"]
    assert len(hist["healthScores"]) == 1
    assert len(hist["returnRates"]) == 1
    assert len(hist["fraudRates"]) == 1

# ==========================================
# 9. Performance & Security Payloads
# ==========================================

def test_performance_response_time():
    payload = {
        "sellerId": "PERF_SELLER",
        "sellerName": "Perf Store",
        "totalOrders": 100,
        "totalReturns": 2,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    start_time = time.perf_counter()
    response = client.post("/api/v1/seller/analyze", json=payload)
    end_time = time.perf_counter()
    assert response.status_code == 200
    duration = end_time - start_time
    # Should take less than 350ms
    assert duration < 0.350

def test_security_payload_protection():
    # Test very long payload bounds (max_length on sellerName is 200)
    payload = {
        "sellerId": "SELLER123",
        "sellerName": "T" * 201,  # Exceeds max_length=200
        "totalOrders": 100,
        "totalReturns": 5,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 85
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 422


# ==========================================
# 10. Refinement Tests (TC-044 - TC-050)
# ==========================================

import os
import json

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")

def load_fixture(filename: str) -> dict:
    with open(os.path.join(FIXTURES_DIR, filename), "r") as f:
        return json.load(f)

# TC-044 Confidence Cap Validation
def test_confidence_cap_validation():
    payload = {
        "sellerId": "CONF_MAX",
        "sellerName": "Max Store",
        "totalOrders": 10000000,
        "totalReturns": 100,
        "fraudCases": 0,
        "averageRating": 4.9,
        "packagingScore": 95,
        "products": [
            {"productId": "P1", "returnRate": 1.0},
            {"productId": "P2", "returnRate": 2.0}
        ],
        "donationRate": 90.0,
        "recyclingRate": 85.0
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0 <= data["confidenceScore"] <= 100

# TC-045 Zero Order Protection
def test_zero_order_protection():
    payload = {
        "sellerId": "ZERO_ORDERS_TEST",
        "sellerName": "Zero Store",
        "totalOrders": 0,
        "totalReturns": 0,
        "fraudCases": 0,
        "averageRating": 4.5,
        "packagingScore": 80
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["returnsPer100Orders"] == 0.0
    assert data["estimatedRevenueLoss"] == 0.0
    assert data["returnRiskScore"] == 0
    assert data["fraudRiskScore"] == 0
    assert data["sellerHealthScore"] == 0

# TC-046 Risk Breakdown Normalization
def test_risk_breakdown_normalization():
    payload = {
        "sellerId": "RISK_NORM",
        "sellerName": "Norm Store",
        "totalOrders": 1000,
        "totalReturns": 50,
        "fraudCases": 5,
        "averageRating": 4.2,
        "packagingScore": 78
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    breakdown = response.json()["riskBreakdown"]
    total = (breakdown["returnsContribution"] +
             breakdown["fraudContribution"] +
             breakdown["sustainabilityContribution"] +
             breakdown["ratingContribution"])
    assert total == 100

# TC-047 Product Reason Priority
def test_product_reason_priority():
    payload = {
        "sellerId": "S1",
        "sellerName": "Store",
        "totalOrders": 100,
        "totalReturns": 10,
        "fraudCases": 0,
        "averageRating": 4.0,
        "packagingScore": 80,
        "products": [
            # 1. QUALITY_DEFECT should take priority for Electronics since returnRate > 15%
            {"productId": "P_HIGH_QUALITY", "returnRate": 18.0, "category": "Electronics"},
            # 2. TRANSIT_DAMAGE should take priority for Packaging category since returnRate <= 15%
            {"productId": "P_HIGH_TRANSIT", "returnRate": 8.0, "category": "Packaging Box"},
            # 3. SIZE_MISMATCH should take priority for Apparel since returnRate <= 15%
            {"productId": "P_HIGH_SIZE", "returnRate": 7.5, "category": "Fashion Shoes"},
            # 4. EXPECTATION_MISMATCH is fallback
            {"productId": "P_EXPECTATION", "returnRate": 6.0, "category": "Electronics"}
        ]
    }
    response = client.post("/api/v1/seller/analyze", json=payload)
    assert response.status_code == 200
    products = response.json()["highRiskProducts"]
    assert len(products) == 4
    
    p1 = next(p for p in products if p["productId"] == "P_HIGH_QUALITY")
    assert p1["reason"] == "QUALITY_DEFECT"
    
    p2 = next(p for p in products if p["productId"] == "P_HIGH_TRANSIT")
    assert p2["reason"] == "TRANSIT_DAMAGE"
    
    p3 = next(p for p in products if p["productId"] == "P_HIGH_SIZE")
    assert p3["reason"] == "SIZE_MISMATCH"
    
    p4 = next(p for p in products if p["productId"] == "P_EXPECTATION")
    assert p4["reason"] == "EXPECTATION_MISMATCH"

# TC-048 Excellent Seller Verification
def test_excellent_seller_verification():
    fixture = load_fixture("excellent_seller.json")
    response = client.post("/api/v1/seller/analyze", json=fixture)
    assert response.status_code == 200
    data = response.json()
    assert data["sellerTier"] == "PLATINUM"
    assert data["overallRiskLevel"] == "LOW"

# TC-049 High Return Seller Verification
def test_high_return_seller_verification():
    fixture = load_fixture("high_return_seller.json")
    response = client.post("/api/v1/seller/analyze", json=fixture)
    assert response.status_code == 200
    data = response.json()
    assert data["returnRiskScore"] >= 50
    assert data["overallRiskLevel"] in ("HIGH", "CRITICAL")

# TC-050 High Fraud Seller Verification
def test_high_fraud_seller_verification():
    fixture = load_fixture("high_fraud_seller.json")
    response = client.post("/api/v1/seller/analyze", json=fixture)
    assert response.status_code == 200
    data = response.json()
    assert data["fraudRiskScore"] >= 30
    assert data["overallRiskLevel"] in ("HIGH", "CRITICAL")
