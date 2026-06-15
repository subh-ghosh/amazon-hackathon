from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class SimulationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    returnId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    productId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    category: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    conditionScore: int = Field(ge=0, le=100)
    utilityScore: int = Field(ge=0, le=100)
    fraudScore: int = Field(ge=0, le=100)
    estimatedValue: float = Field(allow_inf_nan=False)
    returnReason: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    sellerTrustScore: float = Field(ge=0.0, le=1.0, allow_inf_nan=False)

class ScenarioResult(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    recoveryValue: float = Field(allow_inf_nan=False)
    carbonImpact: float = Field(allow_inf_nan=False)
    processingTimeDays: int
    confidence: float = Field(allow_inf_nan=False)

class SimulationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    bestScenario: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    recommendedAction: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    simulations: List[ScenarioResult]
