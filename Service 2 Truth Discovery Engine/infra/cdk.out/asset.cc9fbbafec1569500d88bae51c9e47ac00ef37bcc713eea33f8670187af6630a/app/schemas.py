from enum import Enum
from pydantic import BaseModel, Field, validator, field_validator, ConfigDict
from typing import List, Optional

class RootCauseEnum(str, Enum):
    SIZE_MISMATCH = "SIZE_MISMATCH"
    EXPECTATION_MISMATCH = "EXPECTATION_MISMATCH"
    PACKAGING_DAMAGE = "PACKAGING_DAMAGE"
    COMPATIBILITY_ISSUE = "COMPATIBILITY_ISSUE"
    SELLER_QUALITY_ISSUE = "SELLER_QUALITY_ISSUE"
    MANUFACTURING_DEFECT = "MANUFACTURING_DEFECT"
    COUNTERFEIT = "COUNTERFEIT"
    CUSTOMER_MISUSE = "CUSTOMER_MISUSE"

class EvidenceType(str, Enum):
    REVIEW_PATTERN = "REVIEW_PATTERN"
    SIMILAR_CASES = "SIMILAR_CASES"
    METADATA_DISCREPANCY = "METADATA_DISCREPANCY"
    IMAGE_ANOMALY = "IMAGE_ANOMALY"
    HEURISTIC_RULE = "HEURISTIC_RULE"

class Evidence(BaseModel):
    type: EvidenceType = Field(..., example=EvidenceType.REVIEW_PATTERN)
    description: str = Field(..., example="27 reviews mention size issues")
    weight: float = Field(..., ge=0.0, le=1.0, example=0.42)

class TruthAnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    returnId: str = Field(..., min_length=1, max_length=100, example="RET123")
    customerId: str = Field(..., min_length=1, max_length=100, example="C123")
    productId: str = Field(..., min_length=1, max_length=100, example="P123")
    sellerId: str = Field(..., min_length=1, max_length=100, example="S123")
    statedReason: str = Field(..., min_length=1, max_length=100, example="Defective")
    customerComment: str = Field(..., max_length=1000, example="Screen shows black lines")
    images: List[str] = Field(default=[], example=["s3://bucket/image.jpg"])

    @field_validator("returnId", "customerId", "productId", "sellerId", "statedReason", mode="before")
    def validate_not_blank(cls, value):
        if isinstance(value, str):
            value = value.strip()
            if not value:
                raise ValueError("Field cannot be blank or whitespace-only")
        return value

class TruthAnalyzeResponse(BaseModel):
    returnId: str = Field(..., example="RET123")
    actualRootCause: RootCauseEnum = Field(..., example=RootCauseEnum.COMPATIBILITY_ISSUE)
    confidence: float = Field(..., example=0.93)
    requiresManualReview: bool = Field(default=False)
    evidence: List[Evidence]

    @validator("evidence")
    def validate_total_weights(cls, v):
        total_weight = round(sum(item.weight for item in v), 4)
        if total_weight > 1.0:
            raise ValueError("Total evidence weights cannot exceed 1.0")
        return v

# Service #12 context integration Pydantic schemas
class ProductIntelligence(BaseModel):
    productId: str
    category: Optional[str] = "General"
    title: Optional[str] = ""
    description: Optional[str] = ""
    returnRate: Optional[float] = 0.0
    knownIssues: List[str] = Field(default=[])

class SellerIntelligence(BaseModel):
    sellerId: str
    sellerName: Optional[str] = ""
    defectRate: Optional[float] = 0.0
    counterfeitAlerts: Optional[int] = 0
    trustScore: Optional[float] = 1.0
