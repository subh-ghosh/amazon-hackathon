"""
API request/response schemas — separated from domain models to allow
independent evolution of the API contract.
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.domain import (
    ReturnReason,
    FraudSeverity,
    RecoveryActionType,
)


# ═══════════════════════════════════════════════
#  REQUEST SCHEMAS (POST bodies)
# ═══════════════════════════════════════════════

class CustomerCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    customer_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    name: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    email: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    account_age_days: int = 0
    lifetime_value: float = 0.0


class ProductCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    product_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    title: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    category: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    brand: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    price: float = Field(allow_inf_nan=False)
    seller_id: str  # Creates SOLD_BY edge
    warehouse_id: Optional[str] = None  # Creates STORED_AT edge


class ReturnCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    return_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    order_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    customer_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    product_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    reason: ReturnReason
    condition_received: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    root_cause_id: Optional[str] = None  # Optional — can be discovered later


class FraudCaseCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    case_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    entity_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    entity_type: str = Field(..., pattern="^(Customer|Seller|Product)$")
    severity: FraudSeverity
    risk_score: int = Field(ge=0, le=100)
    related_return_ids: list[str] = Field(default_factory=list)


class RecoveryActionCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    return_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    action_type: RecoveryActionType
    estimated_value_recovered: float = 0.0
    cost_incurred: float = 0.0
    confidence: float = Field(1.0, ge=0.0, le=1.0, allow_inf_nan=False)


class RootCauseCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    cause_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    return_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    category: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    description: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    confidence: float = Field(1.0, ge=0.0, le=1.0, allow_inf_nan=False)


class ProductTwinCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    twin_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    product_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    lifecycle_state: str = Field(min_length=1, max_length=255, strip_whitespace=True)


# ═══════════════════════════════════════════════
#  RESPONSE SCHEMAS
# ═══════════════════════════════════════════════

class BaseResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: str = "success"
    message: str = ""


class EntityCreatedResponse(BaseResponse):
    entity_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    entity_type: str = Field(min_length=1, max_length=255, strip_whitespace=True)


class ProductIntelligenceResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    """Aggregated intelligence for a single product."""
    product_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    total_orders: int = 0
    total_returns: int = 0
    return_rate_percentage: float = 0.0
    top_root_causes: list[dict] = Field(default_factory=list)
    associated_fraud_cases: int = 0
    fraud_risk_level: str = "LOW"
    optimal_recovery_action: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    seller_id: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    seller_name: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    warehouse_locations: list[str] = Field(default_factory=list)


class SellerIntelligenceResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    """Aggregated intelligence for a single seller."""
    seller_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    seller_name: str = ""
    total_products: int = 0
    total_returns: int = 0
    return_rate_percentage: float = 0.0
    top_returned_products: list[dict] = Field(default_factory=list)
    top_root_causes: list[dict] = Field(default_factory=list)
    associated_fraud_cases: int = 0
    fraud_risk_level: str = "LOW"
    recovery_effectiveness: dict = Field(default_factory=dict)


class ReturnDetailResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    """Full detail for a single return — graph + DynamoDB combined."""
    return_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    order_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    customer_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    product_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    reason: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    condition_received: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    timestamp: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    root_causes: list[dict] = Field(default_factory=list)
    fraud_cases: list[dict] = Field(default_factory=list)
    recovery_actions: list[dict] = Field(default_factory=list)
    event_timeline: list[dict] = Field(default_factory=list)


class ReturnJourneyResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    """Journey of a return showing event timeline and current state."""
    return_id: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    timeline: list[str] = Field(default_factory=list)
    current_state: str = Field(min_length=1, max_length=255, strip_whitespace=True)


class GraphStatsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    """High-level graph statistics for the dashboard."""
    total_customers: int = 0
    total_products: int = 0
    total_sellers: int = 0
    total_orders: int = 0
    total_returns: int = 0
    total_fraud_cases: int = 0
    total_root_causes: int = 0
    total_recovery_actions: int = 0
