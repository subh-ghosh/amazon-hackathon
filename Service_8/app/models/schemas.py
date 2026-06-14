import math
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional

# --- Input Schemas ---

class SellerPolicyOverrides(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    maxReturnlessValue: Optional[float] = Field(None, ge=0.0, description="Override value threshold for returnless refunds.")
    allowDonation: Optional[bool] = Field(True, description="Enable or disable donation path.")
    allowRecycling: Optional[bool] = Field(True, description="Enable or disable recycling path.")
    forceManualReviewCategories: Optional[List[str]] = Field(default=[], description="Categories that force manual review.")

    @field_validator('maxReturnlessValue')
    @classmethod
    def check_optional_numeric_safety(cls, v: Optional[float]) -> Optional[float]:
        if v is not None:
            if math.isnan(v) or math.isinf(v):
                raise ValueError("maxReturnlessValue must be finite (cannot be NaN or Infinity)")
        return v

    @field_validator('forceManualReviewCategories')
    @classmethod
    def check_categories_list(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is not None:
            for item in v:
                if not item or not item.strip():
                    raise ValueError("Category names in forceManualReviewCategories cannot be empty or whitespace")
        return v


class InsightInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    insight: str = Field(..., description="Insight message text.")
    severity: str = Field(..., description="Severity of the insight. Must be LOW, MEDIUM, or HIGH.")

    @field_validator('insight', 'severity')
    @classmethod
    def check_non_empty_strings(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("String fields inside insights cannot be empty or contain only whitespace")
        return v.strip()

    @field_validator('severity')
    @classmethod
    def check_severity_enum(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if cleaned not in ("LOW", "MEDIUM", "HIGH"):
            raise ValueError("severity must be one of: LOW, MEDIUM, HIGH")
        return cleaned


class EvaluateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    requestId: str = Field(..., max_length=100, description="Unique request identifier.")
    customerId: str = Field(..., max_length=100, description="Unique customer identifier.")
    productId: str = Field(..., max_length=100, description="Unique product identifier.")
    orderValue: float = Field(..., ge=0.0, description="Value of the order.")
    returnShippingCost: float = Field(..., ge=0.0, description="Shipping cost to return the product.")
    fraudRiskScore: int = Field(..., ge=0, le=100, description="Fraud risk score (0-100).")
    returnRiskScore: int = Field(..., ge=0, le=100, description="Return risk score (0-100).")
    condition: str = Field(..., max_length=50, description="Item condition (e.g. NEW, OPEN_BOX, USED, DAMAGED).")
    sellerPolicy: str = Field(..., max_length=50, description="Seller policy type (e.g. STANDARD, EASY_REFUND).")
    customerTrustScore: int = Field(..., ge=0, le=100, description="Customer trust score (0-100).")
    category: str = Field(..., max_length=100, description="Product category (e.g. Electronics, Apparel, Grocery).")
    weightKg: float = Field(1.0, ge=0.0, description="Product weight in kilograms.")
    
    sellerPolicyOverrides: Optional[SellerPolicyOverrides] = None
    
    # Integration insights
    rootCauseInsights: Optional[List[InsightInput]] = Field(default=[])
    fraudSignals: Optional[List[InsightInput]] = Field(default=[])
    lifecycleInsights: Optional[List[InsightInput]] = Field(default=[])
    packagingInsights: Optional[List[InsightInput]] = Field(default=[])
    sellerHealthInsights: Optional[List[InsightInput]] = Field(default=[])
    historicalKnowledgeInsights: Optional[List[InsightInput]] = Field(default=[])

    @field_validator('requestId', 'customerId', 'productId', 'condition', 'sellerPolicy', 'category')
    @classmethod
    def check_non_empty_strings(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("String field cannot be empty or contain only whitespace")
        return v.strip()

    @field_validator('orderValue', 'returnShippingCost', 'weightKg')
    @classmethod
    def check_numeric_safety(cls, v: float) -> float:
        if math.isnan(v) or math.isinf(v):
            raise ValueError("Float values must be finite (cannot be NaN or Infinity)")
        return v

    @field_validator('condition')
    @classmethod
    def check_condition_enum(cls, v: str) -> str:
        cleaned = v.strip().upper()
        if cleaned not in ("NEW", "OPEN_BOX", "LIKE_NEW", "USED", "REFURBISHED", "DAMAGED"):
            raise ValueError("condition must be one of: NEW, OPEN_BOX, LIKE_NEW, USED, REFURBISHED, DAMAGED")
        return cleaned


class BatchEvaluateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    requests: List[EvaluateRequest] = Field(..., min_length=1, description="List of requests to evaluate.")


# --- Output Schemas ---

class DecisionFactor(BaseModel):
    model_config = ConfigDict(extra="forbid")
    factor: str
    weight: int


class AuditEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")
    timestamp: str
    event: str
    details: str
    correlationId: str


class RecommendationDetails(BaseModel):
    model_config = ConfigDict(extra="forbid")
    recommendedNextAction: str
    customerMessage: str
    sellerAction: str


class EvaluateResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    requestId: str
    decision: str  # RETURNLESS_REFUND, RETURN_REQUIRED, PARTIAL_REFUND, REFUND_AND_DONATE, REFUND_AND_RECYCLE, MANUAL_REVIEW
    confidenceScore: int
    refundAmount: float
    estimatedSavings: float
    sustainabilityImpact: str  # POSITIVE, NEUTRAL, NEGATIVE
    businessReason: str
    overallRiskLevel: str  # LOW, MEDIUM, HIGH
    recommendedAction: str  # KEEP_ITEM, DONATE, RECYCLE, SHIP_BACK, HOLD_FOR_REVIEW
    
    # Explainable Engine
    decisionReason: str
    decisionFactors: List[DecisionFactor]
    
    # Audit Trail & Model Metadata
    decisionTimestamp: str
    rulesTriggered: List[str]
    modelVersion: str
    auditTrail: List[AuditEvent]
    
    # Circular Economy & Routing
    estimatedCO2Saved: float
    estimatedWasteDivertedKg: float
    circularityScore: int
    recommendedDestination: str  # DONATION | RECYCLING | LIQUIDATION | DISPOSAL
    
    # Appeal Support
    appealEligible: bool
    appealReason: str
    
    # Cost Optimization Metrics
    estimatedProcessingCost: float
    estimatedReverseLogisticsCost: float
    netSavings: float
    
    # Knowledge Graph Integration (S12)
    similarHistoricalDecisions: List[str]
    historicalSuccessRate: int
    
    # Recommendations
    recommendations: RecommendationDetails
    
    # Idempotency Protection
    isDuplicateRequest: bool
    originalDecisionTimestamp: Optional[str] = None
    
    # Response Metadata
    serviceVersion: str
    environment: str
    generatedAt: str


class BatchEvaluateResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    jobId: Optional[str] = None
    status: str  # COMPLETED | PENDING
    responses: Optional[List[EvaluateResponse]] = None


class JobStatusResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    jobId: str
    status: str  # PENDING | COMPLETED | FAILED
    correlationId: str
    responses: Optional[List[EvaluateResponse]] = None


class AnalyticsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    totalEvaluations: int
    decisionDistribution: dict
    totalRefundValue: float
    totalEstimatedSavings: float
    totalCO2Saved: float
    totalWasteDiverted: float
    fraudPreventionStatistics: dict
