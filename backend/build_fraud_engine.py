import os

base_dir = "/home/subh/Desktop/amazon/amazon-hackathon/backend/Service 14 Pre-Order Fraud Detection"

dirs = [
    "database",
    "services",
    "training",
    "api",
    "utils",
    "models"
]

for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

files = {}

files["requirements.txt"] = """fastapi
uvicorn
sqlalchemy
pydantic
xgboost
scikit-learn
pandas
numpy
"""

files["config.py"] = """import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fraud_engine.db")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "xgboost_model.pkl")
"""

files["database/models.py"] = """from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import DATABASE_URL

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String, primary_key=True, index=True)
    account_age_days = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    total_returns = Column(Integer, default=0)
    fraud_flags = Column(Integer, default=0)
    avg_order_value = Column(Float, default=0.0)
    last_login_ip = Column(String)
    device_id = Column(String)

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    amount = Column(Float)
    category = Column(String)
    payment_method = Column(String)
    delivery_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)
"""

files["services/feature_engineering.py"] = """def compute_features(order_data, customer_data, db_session):
    return_rate = (customer_data.total_returns / customer_data.total_orders) * 100 if customer_data.total_orders > 0 else 0
    
    return {
        "account_age": customer_data.account_age_days,
        "return_rate": return_rate,
        "order_value": order_data["amount"],
        "orders_today": 1,  # Simplified for hackathon
        "shared_device": 0, # Simplified
        "shared_address": 0, # Simplified
        "payment_failures": 0, # Simplified
        "fraud_flags": customer_data.fraud_flags,
        "average_order_value": customer_data.avg_order_value
    }
"""

files["services/rule_engine.py"] = """def apply_rules(features):
    score = 0
    reasons = []

    if features["return_rate"] > 50:
        score += 30
        reasons.append("Return rate exceeds 50%")
    
    if features["account_age"] < 30:
        score += 20
        reasons.append("Account is less than 30 days old")
        
    if features["order_value"] > 50000:
        score += 15
        reasons.append("Order value unusually high (₹50,000+)")
        
    if features["shared_device"] > 2:
        score += 15
        reasons.append("Device linked with multiple accounts")
        
    if features["shared_address"] > 2:
        score += 10
        reasons.append("Address linked with multiple accounts")
        
    if features["fraud_flags"] > 0:
        score += 20
        reasons.append("Previous fraud flags detected")

    return min(score, 100), reasons
"""

files["services/ml_model.py"] = """import xgboost as xgb
import pandas as pd
import os
import pickle

class FraudMLModel:
    def __init__(self, model_path):
        self.model_path = model_path
        self.model = None
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)

    def predict(self, features):
        if not self.model:
            return 0.5  # default if no model
            
        feature_order = [
            "account_age", "return_rate", "order_value", "orders_today",
            "shared_device", "shared_address", "payment_failures",
            "fraud_flags", "average_order_value"
        ]
        
        df = pd.DataFrame([features])[feature_order]
        prob = self.model.predict_proba(df)[0][1]
        return prob
"""

files["services/decision_engine.py"] = """def make_decision(final_score):
    if final_score <= 30:
        return "Approve", "Low"
    elif final_score <= 60:
        return "OTP Verification", "Medium"
    elif final_score <= 80:
        return "Manual Review", "High"
    else:
        return "Reject", "Critical"
"""

files["services/explainability.py"] = """def generate_explanation(reasons, ml_prob):
    expl = list(reasons)
    if ml_prob > 0.7:
        expl.append("AI Model detected high probability of fraudulent patterns.")
    return expl
"""

files["training/generate_dataset.py"] = """import pandas as pd
import numpy as np
import os

def generate():
    np.random.seed(42)
    n = 100000
    
    account_age = np.random.randint(0, 3650, n)
    return_rate = np.random.uniform(0, 100, n)
    order_value = np.random.exponential(5000, n)
    orders_today = np.random.poisson(1, n)
    shared_device = np.random.poisson(0.5, n)
    shared_address = np.random.poisson(0.5, n)
    payment_failures = np.random.poisson(0.2, n)
    fraud_flags = np.random.poisson(0.1, n)
    average_order_value = np.random.exponential(4000, n)
    
    # Calculate synthetic fraud probability based on rules
    fraud_prob = (
        (return_rate > 50) * 0.3 + 
        (account_age < 30) * 0.2 + 
        (order_value > 50000) * 0.15 + 
        (shared_device > 2) * 0.15 + 
        (fraud_flags > 0) * 0.2
    )
    
    fraud = np.random.binomial(1, np.clip(fraud_prob, 0, 1))
    
    df = pd.DataFrame({
        "account_age": account_age,
        "return_rate": return_rate,
        "order_value": order_value,
        "orders_today": orders_today,
        "shared_device": shared_device,
        "shared_address": shared_address,
        "payment_failures": payment_failures,
        "fraud_flags": fraud_flags,
        "average_order_value": average_order_value,
        "fraud": fraud
    })
    
    os.makedirs(os.path.join(os.path.dirname(__file__), "data"), exist_ok=True)
    df.to_csv(os.path.join(os.path.dirname(__file__), "data", "fraud_dataset.csv"), index=False)
    print("Generated 100,000 synthetic rows.")

if __name__ == "__main__":
    generate()
"""

files["training/train_model.py"] = """import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
import pickle
import os

def train():
    data_path = os.path.join(os.path.dirname(__file__), "data", "fraud_dataset.csv")
    if not os.path.exists(data_path):
        print("Dataset not found. Run generate_dataset.py first.")
        return
        
    df = pd.read_csv(data_path)
    X = df.drop("fraud", axis=1)
    y = df["fraud"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = xgb.XGBClassifier(n_estimators=100, max_depth=5, learning_rate=0.1)
    model.fit(X_train, y_train)
    
    accuracy = model.score(X_test, y_test)
    print(f"Model trained with accuracy: {accuracy:.4f}")
    
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
    os.makedirs(model_dir, exist_ok=True)
    
    with open(os.path.join(model_dir, "xgboost_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    print("Model saved to models/xgboost_model.pkl")

if __name__ == "__main__":
    train()
"""

files["api/fraud_api.py"] = """from fastapi import APIRouter, Depends, HTTPException
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
"""

files["app.py"] = """from fastapi import FastAPI
from api.fraud_api import router as fraud_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Pre-Order Fraud Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fraud_router, prefix="/api/fraud")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8021, reload=True)
"""

for path, content in files.items():
    with open(os.path.join(base_dir, path), "w") as f:
        f.write(content)

print("Created all files successfully.")
