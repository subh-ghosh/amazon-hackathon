"""
Domain entities — these represent the business concepts in the Knowledge Graph.
Each maps to a Neptune node label.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


# ── Enums ────────────────────────────────────────

class ReturnReason(str, Enum):
    DEFECTIVE = "DEFECTIVE"
    WRONG_ITEM = "WRONG_ITEM"
    SIZE_MISMATCH = "SIZE_MISMATCH"
    DESCRIPTION_MISMATCH = "DESCRIPTION_MISMATCH"
    DAMAGED_IN_TRANSIT = "DAMAGED_IN_TRANSIT"
    CHANGED_MIND = "CHANGED_MIND"
    FRAUDULENT = "FRAUDULENT"
    OTHER = "OTHER"


class FraudSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RecoveryActionType(str, Enum):
    REFURBISH = "REFURBISH"
    LIQUIDATE = "LIQUIDATE"
    DESTROY = "DESTROY"
    RESELL = "RESELL"
    DONATE = "DONATE"
    RETURN_TO_SELLER = "RETURN_TO_SELLER"


class LifecycleStage(str, Enum):
    NEW = "NEW"
    IN_USE = "IN_USE"
    RETURNED = "RETURNED"
    INSPECTED = "INSPECTED"
    REFURBISHED = "REFURBISHED"
    LIQUIDATED = "LIQUIDATED"
    DESTROYED = "DESTROYED"


# ── Node Models ──────────────────────────────────

class Customer(BaseModel):
    customer_id: str = Field(..., description="Unique customer identifier")
    name: str
    email: Optional[str] = None
    account_age_days: int = 0
    lifetime_value: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Product(BaseModel):
    product_id: str = Field(..., description="ASIN or internal product ID")
    title: str
    category: str
    brand: str
    price: float
    condition: str = "NEW"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Seller(BaseModel):
    seller_id: str
    name: str
    rating: float = 0.0
    location: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Order(BaseModel):
    order_id: str
    customer_id: str
    total_amount: float
    order_date: datetime
    items: list[str] = Field(default_factory=list, description="List of product IDs")


class Return(BaseModel):
    return_id: str
    order_id: str
    customer_id: str
    product_id: str
    reason: ReturnReason
    condition_received: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class RootCause(BaseModel):
    cause_id: str
    category: str  # e.g. "Defective", "Sizing", "Fraud"
    description: Optional[str] = None
    confidence_score: float = 0.0


class FraudCase(BaseModel):
    case_id: str
    entity_id: str   # Customer / Seller / Product ID
    entity_type: str  # "Customer" | "Seller" | "Product"
    severity: FraudSeverity
    risk_score: int = Field(ge=0, le=100)
    status: str = "OPEN"
    detected_at: datetime = Field(default_factory=datetime.utcnow)


class RecoveryAction(BaseModel):
    action_id: str
    return_id: str
    action_type: RecoveryActionType
    estimated_value_recovered: float = 0.0
    cost_incurred: float = 0.0
    status: str = "PENDING"
    decided_at: datetime = Field(default_factory=datetime.utcnow)


class ProductTwin(BaseModel):
    twin_id: str
    product_id: str
    lifecycle_state: LifecycleStage = LifecycleStage.NEW
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Warehouse(BaseModel):
    warehouse_id: str
    name: str
    region: str
    capacity: Optional[int] = None
