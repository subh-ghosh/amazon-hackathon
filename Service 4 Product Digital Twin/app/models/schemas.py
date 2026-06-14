from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ProductStatus(str, Enum):
    ACTIVE = "ACTIVE"
    RETURNED = "RETURNED"
    UNDER_INSPECTION = "UNDER_INSPECTION"
    FRAUD_REVIEW = "FRAUD_REVIEW"
    REFURBISHING = "REFURBISHING"
    REFURBISHED = "REFURBISHED"
    OUTLET_READY = "OUTLET_READY"
    DONATED = "DONATED"
    RECYCLED = "RECYCLED"
    RETURN_TO_VENDOR = "RETURN_TO_VENDOR"

# History Event Base
class HistoryEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")
    timestamp: str = Field(min_length=1, max_length=255, strip_whitespace=True)

class ReturnEvent(HistoryEvent):
    returnReason: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    conditionScore: float = Field(allow_inf_nan=False)

class FraudEvent(HistoryEvent):
    fraudScore: float = Field(allow_inf_nan=False)
    fraudType: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)

class RepairEvent(HistoryEvent):
    repairType: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    cost: float = Field(allow_inf_nan=False)

class RecoveryEvent(HistoryEvent):
    decision: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    expectedProfit: float = Field(allow_inf_nan=False)

class LogisticsEvent(HistoryEvent):
    warehouseId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    route: str = Field(min_length=1, max_length=255, strip_whitespace=True)

# Inputs
class ReturnEventInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    returnReason: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    conditionScore: float = Field(allow_inf_nan=False)

class FraudEventInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fraudScore: float = Field(allow_inf_nan=False)
    fraudType: str = Field(min_length=1, max_length=255, strip_whitespace=True)

class RepairEventInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    repairType: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    cost: float = Field(allow_inf_nan=False)

class RecoveryEventInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    decision: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    expectedProfit: float = Field(allow_inf_nan=False)

class LogisticsEventInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    warehouseId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    route: str = Field(min_length=1, max_length=255, strip_whitespace=True)

class UnifiedEventInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    eventType: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    fraudScore: Optional[float] = None
    fraudType: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    decision: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    expectedProfit: Optional[float] = None

class CreateTwinInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    productId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    name: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    category: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    conditionScore: float = Field(default=100.0)
    utilityScore: float = Field(default=100.0)

class UpdateTwinInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    conditionScore: Optional[float] = None
    utilityScore: Optional[float] = None
    currentStatus: Optional[ProductStatus] = None

class ProductTwin(BaseModel):
    model_config = ConfigDict(extra="forbid")
    productId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    name: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    sku: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)
    category: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    conditionScore: float = Field(allow_inf_nan=False)
    utilityScore: float = Field(allow_inf_nan=False)
    returnCount: int = 0
    repairCount: int = 0
    fraudFlags: List[str] = []
    conditionHistory: List[dict] = []
    returnHistory: List[ReturnEvent] = []
    repairHistory: List[RepairEvent] = []
    fraudHistory: List[FraudEvent] = []
    recoveryHistory: List[RecoveryEvent] = []
    logisticsHistory: List[LogisticsEvent] = []
    currentStatus: ProductStatus = ProductStatus.ACTIVE
    createdAt: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    updatedAt: str = Field(min_length=1, max_length=255, strip_whitespace=True)
