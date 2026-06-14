import math
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional

class ProductInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    productId: str = Field(
        ...,
        max_length=100,
        description="Unique product identifier. Cannot be empty or contain only whitespace."
    )
    returnRate: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Return rate of the product in percentage. Must be between 0.0 and 100.0."
    )
    category: Optional[str] = Field(
        None,
        max_length=100,
        description="Product category (e.g. Electronics, Apparel)."
    )

    @field_validator('productId')
    @classmethod
    def check_not_empty_or_whitespace(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("productId cannot be empty or contain only whitespace")
        return v.strip()

    @field_validator('returnRate')
    @classmethod
    def check_numeric_safety(cls, v: float) -> float:
        if math.isnan(v) or math.isinf(v):
            raise ValueError("returnRate must be a finite number (cannot be NaN or Infinity)")
        return v

    @field_validator('category')
    @classmethod
    def check_optional_string(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("category cannot be empty or contain only whitespace if provided")
            return v.strip()
        return v


class InsightInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    insight: str = Field(
        ...,
        max_length=500,
        description="Dynamic insight text."
    )
    severity: str = Field(
        ...,
        description="Insight severity level. Must be LOW, MEDIUM, or HIGH."
    )

    @field_validator('insight')
    @classmethod
    def check_not_empty_or_whitespace(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("insight cannot be empty or contain only whitespace")
        return v.strip()

    @field_validator('severity')
    @classmethod
    def check_severity_values(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if cleaned not in ("LOW", "MEDIUM", "HIGH"):
            raise ValueError("severity must be one of: LOW, MEDIUM, HIGH")
        return cleaned


class SellerAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sellerId: str = Field(
        ...,
        max_length=100,
        description="Unique seller identifier. Cannot be empty or contain only whitespace."
    )
    sellerName: str = Field(
        ...,
        max_length=200,
        description="Display name of the seller. Cannot be empty or contain only whitespace."
    )
    totalOrders: int = Field(
        ...,
        ge=0,
        description="Total number of orders. Must be non-negative."
    )
    totalReturns: int = Field(
        ...,
        ge=0,
        description="Total number of customer returns. Must be non-negative."
    )
    fraudCases: int = Field(
        ...,
        ge=0,
        description="Total number of fraud cases. Must be non-negative."
    )
    averageRating: float = Field(
        ...,
        ge=0.0,
        le=5.0,
        description="Seller average customer rating. Must be between 0.0 and 5.0."
    )
    packagingScore: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Packaging intelligence score. Must be between 0.0 and 100.0."
    )
    products: List[ProductInput] = Field(
        default=[],
        description="List of product performance indicators."
    )
    
    # Optional parameters for advanced calculations
    donationRate: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Optional donation rate of returned stock."
    )
    recyclingRate: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Optional recycling rate of returned stock."
    )
    
    # Integration insights from other services (optional input triggers)
    rootCauseInsights: Optional[List[InsightInput]] = None
    fraudInsights: Optional[List[InsightInput]] = None
    lifecycleInsights: Optional[List[InsightInput]] = None
    packagingInsights: Optional[List[InsightInput]] = None
    historicalInsights: Optional[List[InsightInput]] = None

    @field_validator('sellerId', 'sellerName')
    @classmethod
    def check_strings_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("String field cannot be empty or contain only whitespace")
        return v.strip()

    @field_validator('averageRating', 'packagingScore', 'donationRate', 'recyclingRate')
    @classmethod
    def check_numeric_safety(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if math.isnan(v) or math.isinf(v):
                raise ValueError("Numeric values must be finite (cannot be NaN or Infinity)")
        return v

    @field_validator('totalReturns')
    @classmethod
    def check_returns_le_orders(cls, v: int, info) -> int:
        orders = info.data.get('totalOrders')
        if orders is not None and v > orders:
            raise ValueError("totalReturns cannot exceed totalOrders")
        return v

    @field_validator('fraudCases')
    @classmethod
    def check_fraud_le_returns(cls, v: int, info) -> int:
        returns = info.data.get('totalReturns')
        if returns is not None and v > returns:
            raise ValueError("fraudCases cannot exceed totalReturns")
        return v


# Response Schemas

class HighRiskProduct(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    productId: str
    returnRate: float
    riskLevel: str  # LOW, MEDIUM, HIGH
    reason: str


class RiskBreakdown(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    returnsContribution: int
    fraudContribution: int
    sustainabilityContribution: int
    ratingContribution: int


class SellerBenchmark(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    healthPercentile: int
    returnPerformance: str  # EXCELLENT, ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE, POOR
    fraudPerformance: str   # EXCELLENT, GOOD, AVERAGE, POOR
    sustainabilityPerformance: str  # EXCELLENT, GOOD, AVERAGE, POOR


class InsightOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    insight: str
    severity: str  # LOW, MEDIUM, HIGH


class HistoricalMetrics(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    healthScores: List[int]
    returnRates: List[float]
    fraudRates: List[float]


class SellerAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sellerId: str
    sellerHealthScore: int
    sellerTier: str  # PLATINUM, GOLD, SILVER, NEEDS_ATTENTION
    returnRiskScore: int
    fraudRiskScore: int
    sustainabilityScore: int
    estimatedRevenueLoss: float
    returnsPer100Orders: float
    highRiskProducts: List[HighRiskProduct]
    fraudExposureLevel: str  # LOW, MEDIUM, HIGH
    sellerHealthTrend: str   # IMPROVING, STABLE, DECLINING
    returnTrend: str         # IMPROVING, STABLE, DECLINING
    fraudTrend: str          # IMPROVING, STABLE, DECLINING
    
    # Source-specific Integration Mappings
    rootCauseInsights: List[InsightOutput]
    fraudInsights: List[InsightOutput]
    lifecycleInsights: List[InsightOutput]
    packagingInsights: List[InsightOutput]
    historicalInsights: List[InsightOutput]
    
    # General insights & recommendations
    topIssues: List[str]
    recommendations: List[str]
    insights: List[str]
    sellerHealthInsights: List[InsightOutput] = Field(
        default_factory=list,
        description="Integration-ready structured insights for Returnless Refund Engine (S8)."
    )
    
    # Dashboard enhancements
    dashboardGeneratedAt: str
    analysisVersion: str
    executiveSummary: str
    priorityActions: List[str]
    riskBreakdown: RiskBreakdown
    sellerBenchmark: SellerBenchmark
    confidenceScore: int
    overallRiskLevel: str
    historicalMetrics: HistoricalMetrics
