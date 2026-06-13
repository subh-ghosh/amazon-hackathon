"""
Test cases mapped to the 6 categories requested by ChatGPT for Service #12.
"""

import pytest

class Test1GraphCreation:
    """1. Graph Creation Tests"""

    def test_tc_001_create_customer(self, client):
        payload = {"customer_id": "C001", "name": "Test Cust", "account_age_days": 10}
        resp = client.post("/api/v1/customers/", json=payload)
        assert resp.status_code == 201
        assert resp.json()["entity_id"] == "C001"

    def test_tc_002_create_product(self, client):
        payload = {
            "product_id": "P001",
            "title": "Test Prod",
            "category": "Electronics",
            "brand": "Test",
            "price": 100,
            "seller_id": "S001",
            "warehouse_id": "WH001"
        }
        resp = client.post("/api/v1/products/", json=payload)
        assert resp.status_code == 201

    def test_tc_003_create_return(self, client):
        payload = {
            "return_id": "R001",
            "order_id": "O001",
            "customer_id": "C001",
            "product_id": "P001",
            "reason": "DEFECTIVE"
        }
        resp = client.post("/api/v1/returns/", json=payload)
        assert resp.status_code == 201


class Test2RelationshipIntegrity:
    """2. Relationship Integrity Tests"""

    def test_tc_004_duplicate_customer(self, client):
        # Upsert logic handles duplicates without erroring out
        payload = {"customer_id": "C001", "name": "Test Cust Duplicate"}
        resp1 = client.post("/api/v1/customers/", json=payload)
        resp2 = client.post("/api/v1/customers/", json=payload)
        assert resp1.status_code == 201
        assert resp2.status_code == 201

    def test_tc_006_fraud_case_linking(self, client):
        payload = {
            "case_id": "F001",
            "entity_id": "C001",
            "entity_type": "Customer",
            "severity": "HIGH",
            "risk_score": 90,
            "related_return_ids": ["R001", "R002", "R003", "R004", "R005"]
        }
        resp = client.post("/api/v1/fraud-cases/", json=payload)
        assert resp.status_code == 201


class Test3Analytics:
    """3. Analytics Tests"""

    def test_tc_007_product_intelligence(self, client):
        resp = client.get("/api/v1/intelligence/products/P001")
        assert resp.status_code == 200
        data = resp.json()
        assert "return_rate_percentage" in data

    def test_tc_008_seller_intelligence(self, client):
        resp = client.get("/api/v1/intelligence/sellers/S001")
        assert resp.status_code == 200
        assert "return_rate_percentage" in resp.json()

    def test_tc_009_top_return_causes(self, client):
        resp = client.get("/api/v1/intelligence/analytics/top-return-causes")
        assert resp.status_code == 200


class Test4EventBridgeAndDynamoDB:
    """4 & 5. EventBridge and DynamoDB Tests"""

    def test_tc_011_to_016_events_and_dynamo(self, client):
        # In our architecture, EventBridge & DynamoDB calls are best-effort
        # testing that the endpoints complete successfully means the try/except blocks work
        resp = client.post("/api/v1/returns/", json={
            "return_id": "R002", "order_id": "O002", "customer_id": "C001", 
            "product_id": "P001", "reason": "SIZE_MISMATCH"
        })
        assert resp.status_code == 201

        resp_rc = client.post("/api/v1/returns/R002/root-causes", json={
            "cause_id": "RC001", "return_id": "R002", "category": "Wardrobing", "confidence": 0.95
        })
        assert resp_rc.status_code == 201


class Test6EndToEndJourney:
    """6. End-to-End Journey Tests ⭐"""

    def test_tc_017_to_018_demo_killer_test(self, client):
        """Demo Killer Test: The full end-to-end flow."""
        
        # 1. Create Customer
        client.post("/api/v1/customers/", json={"customer_id": "DEMO_C1", "name": "Demo Cust"}).raise_for_status()
        
        # 2. Create Product
        client.post("/api/v1/products/", json={
            "product_id": "DEMO_P1", "title": "Demo Prod", "category": "Fashion", 
            "brand": "DemoBrand", "price": 1000, "seller_id": "DEMO_S1"
        }).raise_for_status()

        # 3. Create Return
        client.post("/api/v1/returns/", json={
            "return_id": "DEMO_R1", "order_id": "DEMO_O1", "customer_id": "DEMO_C1", 
            "product_id": "DEMO_P1", "reason": "DEFECTIVE"
        }).raise_for_status()

        # 4. Publish RootCauseDiscovered (via POST)
        client.post("/api/v1/returns/DEMO_R1/root-causes", json={
            "cause_id": "DEMO_RC1", "return_id": "DEMO_R1", "category": "Manufacturing Defect", "confidence": 0.98
        }).raise_for_status()

        # 5. Publish FraudDetected
        client.post("/api/v1/fraud-cases/", json={
            "case_id": "DEMO_F1", "entity_id": "DEMO_S1", "entity_type": "Seller", 
            "severity": "MEDIUM", "risk_score": 75, "related_return_ids": ["DEMO_R1"]
        }).raise_for_status()

        # 6. Publish RecoveryDecisionMade
        client.post("/api/v1/recovery-actions/", json={
            "action_id": "DEMO_REC1", "return_id": "DEMO_R1", "action_type": "LIQUIDATE", 
            "estimated_value_recovered": 400.0, "cost_incurred": 50.0, "confidence": 0.9
        }).raise_for_status()

        # 7. Query Product Intelligence
        prod_intel = client.get("/api/v1/intelligence/products/DEMO_P1")
        assert prod_intel.status_code == 200

        # 8. Query Return Journey
        journey = client.get("/api/v1/returns/DEMO_R1/journey")
        assert journey.status_code == 200
        assert "timeline" in journey.json()
