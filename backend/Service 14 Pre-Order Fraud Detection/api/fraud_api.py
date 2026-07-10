from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.models import SessionLocal, Customer
from services.feature_engineering import compute_features
from services.rule_engine import apply_rules
from services.ml_model import FraudMLModel
from services.decision_engine import make_decision
from services.explainability import generate_explanation
from config import MODEL_PATH

router = APIRouter()
ml_model = FraudMLModel(MODEL_PATH)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class OrderRequest(BaseModel):
    customer_id: str
    amount: float
    category: str
    payment_method: str
    delivery_address: str

@router.post("/predict")
def predict_fraud(order: OrderRequest, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_id == order.customer_id).first()
    if not customer:
        # Mock a new customer if not found
        customer = Customer(
            customer_id=order.customer_id,
            account_age_days=0,
            total_orders=0,
            total_returns=0,
            fraud_flags=0,
            avg_order_value=0.0
        )
    
    features = compute_features(order.dict(), customer, db)
    
    rule_score, rules_reasons = apply_rules(features)
    ml_prob = ml_model.predict(features)
    
    ml_score = ml_prob * 100
    final_score = (rule_score * 0.6) + (ml_score * 0.4)
    
    decision, risk_level = make_decision(final_score)
    reasons = generate_explanation(rules_reasons, ml_prob)
    
    return {
        "risk_score": round(final_score, 2),
        "decision": decision,
        "risk_level": risk_level,
        "reasons": reasons,
        "details": {
            "rule_score": round(rule_score, 2),
            "ml_probability": round(ml_prob, 4),
            "features": features
        }
    }

@router.get("/health")
def health():
    return {"status": "ok"}
