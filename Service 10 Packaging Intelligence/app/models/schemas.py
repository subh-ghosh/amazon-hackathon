import math
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List

class PackagingRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    productId: str = Field(
        ..., 
        max_length=100, 
        description="Unique product identifier. Cannot be empty or contain only whitespace."
    )
    category: str = Field(
        ..., 
        max_length=100, 
        description="Product category (e.g., Electronics, Apparel, Home). Cannot be empty or contain only whitespace."
    )
    productWeight: float = Field(
        ..., 
        gt=0.0, 
        description="Weight of the product in kilograms. Must be strictly positive."
    )
    packagingWeight: float = Field(
        ..., 
        gt=0.0, 
        description="Weight of the packaging in kilograms. Must be strictly positive."
    )
    packagingMaterial: str = Field(
        ..., 
        max_length=100, 
        description="Packaging material (e.g., Cardboard, Plastic, Wood). Cannot be empty or contain only whitespace."
    )
    length: float = Field(
        ..., 
        gt=0.0, 
        description="Length of the package in centimeters. Must be strictly positive."
    )
    width: float = Field(
        ..., 
        gt=0.0, 
        description="Width of the package in centimeters. Must be strictly positive."
    )
    height: float = Field(
        ..., 
        gt=0.0, 
        description="Height of the package in centimeters. Must be strictly positive."
    )

    @field_validator('productId', 'category', 'packagingMaterial')
    @classmethod
    def check_not_empty_or_whitespace(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Value cannot be empty or contain only whitespace")
        return v.strip()

    @field_validator('productWeight', 'packagingWeight', 'length', 'width', 'height')
    @classmethod
    def check_numeric_safety(cls, v: float) -> float:
        if math.isnan(v) or math.isinf(v):
            raise ValueError("Value must be a finite number (cannot be NaN or Infinity)")
        return v

class InsightOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    insight: str
    severity: str  # LOW, MEDIUM, HIGH

class PackagingResponse(BaseModel):
    productId: str = Field(
        ..., 
        description="The product identifier associated with this packaging analysis."
    )
    sustainabilityScore: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Overall packaging sustainability score from 0 to 100."
    )
    packagingEfficiencyScore: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Packaging volumetric/gravimetric efficiency score from 0 to 100."
    )
    carbonImpactScore: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Estimated carbon impact score from 0 to 100, where 100 is best (lowest emissions)."
    )
    recyclabilityScore: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Calculated material recyclability score from 0 to 100."
    )
    confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Data trust confidence score between 0.0 and 1.0."
    )
    recommendations: List[str] = Field(
        ..., 
        description="List of actionable recommendations to optimize packaging."
    )
    explanations: List[str] = Field(
        ..., 
        description="List of explanations summarizing the key drivers behind the scores."
    )
    packagingInsights: List[InsightOutput] = Field(
        default_factory=list,
        description="Integration-ready structured insights for Returnless Refund Engine (S8)."
    )
