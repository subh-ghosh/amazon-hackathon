"""
API request/response schemas — separated from domain models to allow
independent evolution of the API contract.
"""

from pydantic import BaseModel, Field
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
    customer_id: str
    name: str
    email: Optional[str] = None
    account_age_days: int = 0
    lifetime_value: float = 0.0


class ProductCreateRequest(BaseModel):
    product_id: str
    title: str
    category: str
    brand: str
    price: float
    seller_id: str  # Creates SOLD_BY edge
    warehouse_id: Optional[str] = None  # Creates STORED_AT edge


class ReturnCreateRequest(BaseModel):
    return_id: str
    order_id: str
    customer_id: str
    product_id: str
    reason: ReturnReason
    condition_received: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    root_cause_id: Optional[str] = None  # Optional — can be discovered later


class FraudCaseCreateRequest(BaseModel):
    case_id: str
    entity_id: str
    entity_type: str = Field(..., pattern="^(Customer|Seller|Product)$")
    severity: FraudSeverity
    risk_score: int = Field(ge=0, le=100)
    related_return_ids: list[str] = Field(default_factory=list)


class RecoveryActionCreateRequest(BaseModel):
    action_id: str
    return_id: str
    action_type: RecoveryActionType
    estimated_value_recovered: float = 0.0
    cost_incurred: float = 0.0
    confidence: float = Field(1.0, ge=0.0, le=1.0)


class RootCauseCreateRequest(BaseModel):
    cause_id: str
    return_id: str
    category: str
    description: Optional[str] = None
    confidence: float = Field(1.0, ge=0.0, le=1.0)


class ProductTwinCreateRequest(BaseModel):
    twin_id: str
    product_id: str
    lifecycle_state: str


# ═══════════════════════════════════════════════
#  RESPONSE SCHEMAS
# ═══════════════════════════════════════════════

class BaseResponse(BaseModel):
    status: str = "success"
    message: str = ""


class EntityCreatedResponse(BaseResponse):
    entity_id: str
    entity_type: str


class ProductIntelligenceResponse(BaseModel):
    """Aggregated intelligence for a single product."""
    product_id: str
    total_orders: int = 0
    total_returns: int = 0
    return_rate_percentage: float = 0.0
    top_root_causes: list[dict] = Field(default_factory=list)
    associated_fraud_cases: int = 0
    fraud_risk_level: str = "LOW"
    optimal_recovery_action: Optional[str] = None
    seller_id: Optional[str] = None
    seller_name: Optional[str] = None
    warehouse_locations: list[str] = Field(default_factory=list)


class SellerIntelligenceResponse(BaseModel):
    """Aggregated intelligence for a single seller."""
    seller_id: str
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
    """Full detail for a single return — graph + DynamoDB combined."""
    return_id: str
    order_id: str
    customer_id: str
    product_id: str
    reason: str
    condition_received: Optional[str] = None
    timestamp: str
    root_causes: list[dict] = Field(default_factory=list)
    fraud_cases: list[dict] = Field(default_factory=list)
    recovery_actions: list[dict] = Field(default_factory=list)
    event_timeline: list[dict] = Field(default_factory=list)


class ReturnJourneyResponse(BaseModel):
    """Journey of a return showing event timeline and current state."""
    return_id: str
    timeline: list[str] = Field(default_factory=list)
    current_state: str


class GraphStatsResponse(BaseModel):
    """High-level graph statistics for the dashboard."""
    total_customers: int = 0
    total_products: int = 0
    total_sellers: int = 0
    total_orders: int = 0
    total_returns: int = 0
    total_fraud_cases: int = 0
    total_root_causes: int = 0
    total_recovery_actions: int = 0
