from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class FraudScoreRequest(BaseModel):
    customer_id: str
    product_id: str
    return_id: str
    device_id: str
    payment_method_hash: str
    images: List[str] = Field(default_factory=list)

class FraudScoreResponse(BaseModel):
    fraud_score: int
    trust_score: int
    risk_level: str
    recommended_action: str
    risk_factors: List[str]

class FraudScoreComputedEvent(BaseModel):
    event_type: str = "FraudScoreComputed"
    return_id: str
    customer_id: str
    fraud_score: int
    trust_score: int
    risk_level: str
    risk_factors: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
