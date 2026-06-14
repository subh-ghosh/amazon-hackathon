from pydantic import BaseModel, Field
from typing import List, Optional

class SimulationRequest(BaseModel):
    returnId: str
    productId: str
    category: str
    conditionScore: int = Field(ge=0, le=100)
    utilityScore: int = Field(ge=0, le=100)
    fraudScore: int = Field(ge=0, le=100)
    estimatedValue: float
    returnReason: str
    sellerTrustScore: float = Field(ge=0.0, le=1.0)

class ScenarioResult(BaseModel):
    scenario: str
    recoveryValue: float
    carbonImpact: float
    processingTimeDays: int
    confidence: float

class SimulationResponse(BaseModel):
    bestScenario: str
    recommendedAction: str
    simulations: List[ScenarioResult]
