from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List


class Warehouse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    warehouseId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    city: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    capacity: float = Field(ge=0.0, le=100.0, allow_inf_nan=False)
    distanceKm: float = Field(ge=0.0, allow_inf_nan=False)


class LogisticsRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    returnId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    productId: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    recommendedDecision: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    customerLocation: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    conditionScore: float = Field(ge=0.0, le=100.0, allow_inf_nan=False)
    estimatedValue: float = Field(ge=0.0, allow_inf_nan=False)
    warehouses: List[Warehouse]

    @field_validator("warehouses")
    def check_warehouses_not_empty(cls, v):
        if len(v) == 0:
            raise ValueError("warehouses list cannot be empty")
        return v


class LogisticsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    recommendedWarehouse: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    recommendedRoute: str = Field(min_length=1, max_length=255, strip_whitespace=True)
    estimatedCost: float = Field(allow_inf_nan=False)
    estimatedDays: int
    carbonScore: float = Field(allow_inf_nan=False)
    reasoning: List[str]
