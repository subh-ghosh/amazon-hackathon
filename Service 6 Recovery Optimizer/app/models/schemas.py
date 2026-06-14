from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List

class SimulationInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    recoveryValue: float = Field(ge=0.0, allow_inf_nan=False)
    carbonImpact: float = Field(allow_inf_nan=False)
    processingTimeDays: int
    confidence: float = Field(ge=0.0, le=1.0, allow_inf_nan=False)

class OptimizeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    returnId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    productId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    fraudScore: int = Field(ge=0, le=100)
    sellerTrustScore: float = Field(ge=0.0, le=1.0, allow_inf_nan=False)
    simulations: List[SimulationInput]

    @field_validator("simulations")
    def check_simulations_not_empty(cls, v):
        if len(v) == 0:
            raise ValueError("simulations list cannot be empty")
        return v

class OptimizeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    recommendedDecision: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    expectedProfit: float = Field(allow_inf_nan=False)
    carbonSavings: float = Field(allow_inf_nan=False)
    processingDays: int
    confidence: float = Field(allow_inf_nan=False)
    reasoning: List[str]
