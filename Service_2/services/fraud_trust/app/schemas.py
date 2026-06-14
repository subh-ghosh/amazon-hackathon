from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ReturnHistoryRecord(BaseModel):
    returnId: str = Field(..., example="RET-980123")
    status: str = Field(..., example="COMPLETED")
    daysToReturn: int = Field(..., example=3)
    refundIssued: bool = Field(default=True)

class FraudScoreRequest(BaseModel):
    customerId: str = Field(..., example="CUST-10928")
    productId: str = Field(..., example="PROD-B07XJ8C")
    returnId: str = Field(..., example="RET-990812")
    paymentMethodHash: Optional[str] = Field(None, example="pm_8a39df1c0")
    deviceId: Optional[str] = Field(None, example="dev_mac_990f11")
    returnHistory: List[ReturnHistoryRecord] = Field(default=[])
    images: List[str] = Field(default=[], example=[
        "s3://amazon-circular-intel-returns/returns/RET-990812/item_label.jpg",
        "s3://amazon-circular-intel-returns/returns/RET-990812/item_contents.jpg"
    ])

class FraudScoreResponse(BaseModel):
    returnId: str = Field(..., example="RET-990812")
    fraudScore: float = Field(..., example=0.84)
    trustScore: float = Field(..., example=0.18)
    riskLevel: str = Field(..., example="HIGH")
    recommendedAction: str = Field(..., example="Manual Review")
    riskFactors: List[str] = Field(default=[])
    timestamp: datetime = Field(default_factory=datetime.utcnow)
