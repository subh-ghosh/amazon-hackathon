from pydantic import BaseModel, Field
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
    timestamp: str

class ReturnEvent(HistoryEvent):
    returnReason: str
    conditionScore: float

class FraudEvent(HistoryEvent):
    fraudScore: float
    fraudType: Optional[str] = None

class RepairEvent(HistoryEvent):
    repairType: str
    cost: float

class RecoveryEvent(HistoryEvent):
    decision: str
    expectedProfit: float

class LogisticsEvent(HistoryEvent):
    warehouseId: str
    route: str

# Inputs
class ReturnEventInput(BaseModel):
    returnReason: str
    conditionScore: float

class FraudEventInput(BaseModel):
    fraudScore: float
    fraudType: str

class RepairEventInput(BaseModel):
    repairType: str
    cost: float

class RecoveryEventInput(BaseModel):
    decision: str
    expectedProfit: float

class LogisticsEventInput(BaseModel):
    warehouseId: str
    route: str

class UnifiedEventInput(BaseModel):
    eventType: str
    fraudScore: Optional[float] = None
    fraudType: Optional[str] = None
    decision: Optional[str] = None
    expectedProfit: Optional[float] = None

class CreateTwinInput(BaseModel):
    productId: str
    name: Optional[str] = None
    sku: Optional[str] = None
    category: str
    conditionScore: float = Field(default=100.0)
    utilityScore: float = Field(default=100.0)

class UpdateTwinInput(BaseModel):
    conditionScore: Optional[float] = None
    utilityScore: Optional[float] = None
    currentStatus: Optional[ProductStatus] = None

class ProductTwin(BaseModel):
    productId: str
    name: Optional[str] = None
    sku: Optional[str] = None
    category: str
    conditionScore: float
    utilityScore: float
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
    createdAt: str
    updatedAt: str
