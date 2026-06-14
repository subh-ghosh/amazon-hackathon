from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class FraudScoreRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    customer_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    product_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    return_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    device_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    payment_method_hash: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    images: List[str] = Field(default_factory=list)

class FraudScoreResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fraud_score: int
    trust_score: int
    risk_level: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    recommended_action: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    risk_factors: List[str]

class FraudScoreComputedEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")
    event_type: str = "FraudScoreComputed"
    return_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    customer_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    fraud_score: int
    trust_score: int
    risk_level: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    risk_factors: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
