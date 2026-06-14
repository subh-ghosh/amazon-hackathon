import math
from pydantic import BaseModel, Field, field_validator
from typing import List

class PreventionRequest(BaseModel):
    customerId: str = Field(
        ..., 
        max_length=100, 
        description="Unique customer identifier, max 100 characters, cannot be empty or whitespace"
    )
    productId: str = Field(
        ..., 
        max_length=100, 
        description="Unique product identifier, max 100 characters, cannot be empty or whitespace"
    )
    category: str = Field(
        ..., 
        max_length=100, 
        description="Product category, max 100 characters, cannot be empty or whitespace"
    )
    productRating: float = Field(
        ..., 
        ge=0.0, 
        le=5.0, 
        description="Product rating must be between 0.0 and 5.0"
    )
    customerReturnRate: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Customer return rate must be between 0.0 and 1.0"
    )
    customerPurchaseCount: int = Field(
        ..., 
        ge=0, 
        description="Customer purchase count must be a non-negative integer"
    )
    productReturnRate: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Product return rate must be between 0.0 and 1.0"
    )
    sellerRating: float = Field(
        ..., 
        ge=0.0, 
        le=5.0, 
        description="Seller rating must be between 0.0 and 5.0"
    )
    price: float = Field(
        ..., 
        ge=0.0, 
        description="Product price must be a non-negative number"
    )

    @field_validator('customerId', 'productId', 'category')
    @classmethod
    def check_not_empty_or_whitespace(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Value cannot be empty or contain only whitespace")
        return v.strip()

    @field_validator('productRating', 'customerReturnRate', 'productReturnRate', 'sellerRating', 'price')
    @classmethod
    def check_numeric_safety(cls, v: float) -> float:
        if math.isnan(v) or math.isinf(v):
            raise ValueError("Value must be a finite number (cannot be NaN or Infinity)")
        return v

class PreventionResponse(BaseModel):
    returnRiskScore: int = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Calculated return risk score from 0 to 100"
    )
    riskLevel: str = Field(
        ..., 
        description="Categorized risk level: LOW, MEDIUM, or HIGH"
    )
    recommendedActions: List[str] = Field(
        ..., 
        description="List of actionable recommendations to prevent return"
    )
    confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Confidence score between 0.0 and 1.0"
    )
    explanation: List[str] = Field(
        ..., 
        description="Explanation factors contributing to the risk level"
    )
