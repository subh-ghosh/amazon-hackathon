from pydantic import BaseModel, Field, field_validator
from typing import List

class SimulationInput(BaseModel):
    scenario: str
    recoveryValue: float = Field(ge=0.0)
    carbonImpact: float
    processingTimeDays: int
    confidence: float = Field(ge=0.0, le=1.0)

class OptimizeRequest(BaseModel):
    returnId: str
    productId: str
    fraudScore: int = Field(ge=0, le=100)
    sellerTrustScore: float = Field(ge=0.0, le=1.0)
    simulations: List[SimulationInput]

    @field_validator("simulations")
    def check_simulations_not_empty(cls, v):
        if len(v) == 0:
            raise ValueError("simulations list cannot be empty")
        return v

class OptimizeResponse(BaseModel):
    recommendedDecision: str
    expectedProfit: float
    carbonSavings: float
    processingDays: int
    confidence: float
    reasoning: List[str]
