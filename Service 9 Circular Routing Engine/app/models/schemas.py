import math
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional
from enum import Enum

class ConditionEnum(str, Enum):
    NEW = "NEW"
    OPEN_BOX = "OPEN_BOX"
    LIKE_NEW = "LIKE_NEW"
    USED = "USED"
    REFURBISHABLE = "REFURBISHABLE"
    DAMAGED = "DAMAGED"
    BROKEN = "BROKEN"
    LOW_VALUE = "LOW_VALUE"
    UNRECOVERABLE = "UNRECOVERABLE"

class FacilityTypeEnum(str, Enum):
    REFURBISHMENT = "REFURBISHMENT"
    DONATION = "DONATION"
    RECYCLING = "RECYCLING"
    LIQUIDATION = "LIQUIDATION"
    DISPOSAL = "DISPOSAL"

class FacilityOption(BaseModel):
    model_config = ConfigDict(extra="forbid")

    facilityId: str = Field(..., max_length=100, description="Facility ID")
    facilityType: FacilityTypeEnum
    distanceKm: float = Field(..., ge=0.0, description="Distance in KM")
    capacityAvailable: bool

    @field_validator('facilityId')
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("String field cannot be empty")
        return v.strip()

    @field_validator('distanceKm')
    @classmethod
    def check_finite(cls, v: float) -> float:
        if math.isnan(v) or math.isinf(v):
            raise ValueError("Numeric values must be finite")
        return v

class OptimizationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    requestId: str = Field(..., max_length=100)
    returnId: str = Field(..., max_length=100)
    productId: str = Field(..., max_length=100)
    category: str = Field(..., max_length=100)
    condition: ConditionEnum
    estimatedValue: float = Field(..., ge=0.0)
    weightKg: float = Field(..., ge=0.0)
    customerLatitude: float = Field(..., ge=-90.0, le=90.0)
    customerLongitude: float = Field(..., ge=-180.0, le=180.0)
    
    # S7 LogisticsResponse Output Fields (to allow unchanged pass-through)
    recommendedWarehouse: str = Field(default="", description="From S7")
    recommendedRoute: str = Field(default="", description="From S7")
    estimatedCost: float = Field(default=0.0, allow_inf_nan=False)
    estimatedDays: int = Field(default=0)
    carbonScore: float = Field(default=0.0, allow_inf_nan=False)
    reasoning: List[str] = Field(default_factory=list)
    
    facilityOptions: List[FacilityOption]

    @field_validator('requestId', 'returnId', 'productId', 'category')
    @classmethod
    def check_strings_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("String field cannot be empty")
        return v.strip()

    @field_validator('estimatedValue', 'weightKg', 'customerLatitude', 'customerLongitude')
    @classmethod
    def check_numeric_safety(cls, v: float) -> float:
        if math.isnan(v) or math.isinf(v):
            raise ValueError("Numeric values must be finite")
        return v

class BatchOptimizationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    requests: List[OptimizationRequest]

class SustainabilityMetrics(BaseModel):
    model_config = ConfigDict(extra="forbid")
    estimatedCO2Saved: float
    estimatedWasteDivertedKg: float
    circularityScore: int

class OptimizationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    decisionId: str
    requestId: str
    returnId: str
    selectedFacilityId: str
    selectedFacilityType: str
    optimizationScore: float
    routingReason: str
    sustainabilityMetrics: SustainabilityMetrics

class BatchOptimizationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    results: List[OptimizationResponse]

class AnalyticsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    totalOptimizations: int
    averageCostSavings: float
    averageCO2Saved: float
    circularityImpact: float
    facilityUtilization: dict
    recoveryPathDistribution: dict
