"""
API endpoint tests — validates request/response contracts.
Tests run against the FastAPI TestClient (no real Neptune/DynamoDB needed).
"""

import pytest


class TestHealthEndpoints:
    """Verify health and root endpoints always respond."""

    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "neptune_endpoint" in data

    def test_root(self, client):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Knowledge Graph Service"
        assert data["docs"] == "/docs"


class TestCustomerEndpoints:
    """Test POST /customers."""

    def test_create_customer(self, client):
        payload = {
            "customer_id": "CUST-TEST-001",
            "name": "Test User",
            "email": "test@example.com",
            "account_age_days": 100,
            "lifetime_value": 500.0,
        }
        response = client.post("/api/v1/customers", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["entity_id"] == "CUST-TEST-001"
        assert data["entity_type"] == "Customer"


class TestProductEndpoints:
    """Test POST /products."""

    def test_create_product(self, client):
        payload = {
            "product_id": "PROD-TEST-001",
            "title": "Test Widget",
            "category": "Electronics",
            "brand": "TestBrand",
            "price": 99.99,
            "seller_id": "SELL-TEST-001",
        }
        response = client.post("/api/v1/products", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["entity_id"] == "PROD-TEST-001"


class TestReturnEndpoints:
    """Test POST /returns and GET /returns/{id}."""

    def test_create_return(self, client):
        payload = {
            "return_id": "RTN-TEST-001",
            "order_id": "ORD-TEST-001",
            "customer_id": "CUST-TEST-001",
            "product_id": "PROD-TEST-001",
            "reason": "DEFECTIVE",
            "timestamp": "2026-06-13T10:00:00Z",
        }
        response = client.post("/api/v1/returns", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["entity_id"] == "RTN-TEST-001"

    def test_create_return_invalid_reason(self, client):
        payload = {
            "return_id": "RTN-TEST-002",
            "order_id": "ORD-TEST-002",
            "customer_id": "CUST-TEST-001",
            "product_id": "PROD-TEST-001",
            "reason": "INVALID_REASON",
        }
        response = client.post("/api/v1/returns", json=payload)
        assert response.status_code == 422  # Pydantic validation error


class TestFraudCaseEndpoints:
    """Test POST /fraud-cases."""

    def test_create_fraud_case(self, client):
        payload = {
            "case_id": "FRAUD-TEST-001",
            "entity_id": "CUST-TEST-001",
            "entity_type": "Customer",
            "severity": "HIGH",
            "risk_score": 85,
            "related_return_ids": ["RTN-TEST-001"],
        }
        response = client.post("/api/v1/fraud-cases", json=payload)
        assert response.status_code == 201


class TestRecoveryActionEndpoints:
    """Test POST /recovery-actions."""

    def test_create_recovery_action(self, client):
        payload = {
            "action_id": "REC-TEST-001",
            "return_id": "RTN-TEST-001",
            "action_type": "REFURBISH",
            "estimated_value_recovered": 75.0,
            "cost_incurred": 10.0,
        }
        response = client.post("/api/v1/recovery-actions", json=payload)
        assert response.status_code == 201


class TestIntelligenceEndpoints:
    """Test GET intelligence endpoints."""

    def test_product_intelligence(self, client):
        response = client.get("/api/v1/intelligence/products/PROD-TEST-001")
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == "PROD-TEST-001"

    def test_seller_intelligence(self, client):
        response = client.get("/api/v1/intelligence/sellers/SELL-TEST-001")
        assert response.status_code == 200

    def test_graph_stats(self, client):
        response = client.get("/api/v1/intelligence/analytics/graph-stats")
        assert response.status_code == 200
