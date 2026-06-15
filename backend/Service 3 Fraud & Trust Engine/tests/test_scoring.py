from app.services.scoring_engine import scoring_engine
from app.models.schemas import FraudScoreRequest

def test_wardrobing():
    req = FraudScoreRequest(
        customer_id="C-1", product_id="P-1", return_id="R-1", 
        device_id="D-1", payment_method_hash="PM-1", images=["used_item.jpg"]
    )
    resp = scoring_engine.calculate_score(req)
    assert resp.fraud_score >= 30
    assert "Wardrobing Detected" in resp.risk_factors
