from pydantic import BaseModel, Field, field_validator
from typing import List


class Warehouse(BaseModel):
    warehouseId: str
    city: str
    capacity: float = Field(ge=0.0, le=100.0)
    distanceKm: float = Field(ge=0.0)


class LogisticsRequest(BaseModel):
    returnId: str
    productId: str
    recommendedDecision: str
    customerLocation: str
    conditionScore: float = Field(ge=0.0, le=100.0)
    estimatedValue: float = Field(ge=0.0)
    warehouses: List[Warehouse]

    @field_validator("warehouses")
    def check_warehouses_not_empty(cls, v):
        if len(v) == 0:
            raise ValueError("warehouses list cannot be empty")
        return v


class LogisticsResponse(BaseModel):
    recommendedWarehouse: str
    recommendedRoute: str
    estimatedCost: float
    estimatedDays: int
    carbonScore: float
    reasoning: List[str]
