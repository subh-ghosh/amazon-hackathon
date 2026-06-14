from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ProductTwin, CreateTwinInput, UpdateTwinInput,
    ReturnEventInput, FraudEventInput, RepairEventInput, RecoveryEventInput, LogisticsEventInput, UnifiedEventInput
)
from app.services.twin_service import twin_service, TwinNotFoundError

router = APIRouter()

@router.post("", response_model=ProductTwin, status_code=201)
def create_twin(data: CreateTwinInput):
    return twin_service.create_twin(data)

@router.get("/{product_id}", response_model=ProductTwin)
def get_twin(product_id: str):
    try:
        return twin_service.get_twin(product_id)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Product Twin not found")

@router.put("/{product_id}", response_model=ProductTwin)
def update_twin(product_id: str, data: UpdateTwinInput):
    try:
        return twin_service.update_twin(product_id, data)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Product Twin not found")

@router.post("/{product_id}/returns", response_model=ProductTwin)
def add_return_event(product_id: str, data: ReturnEventInput):
    try:
        return twin_service.add_return_event(product_id, data)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Product Twin not found")

@router.post("/{product_id}/fraud", response_model=ProductTwin)
def add_fraud_event(product_id: str, data: FraudEventInput):
    try:
        return twin_service.add_fraud_event(product_id, data)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Product Twin not found")

@router.post("/{product_id}/repairs", response_model=ProductTwin)
def add_repair_event(product_id: str, data: RepairEventInput):
    try:
        return twin_service.add_repair_event(product_id, data)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Product Twin not found")

@router.post("/{product_id}/recovery-actions", response_model=ProductTwin)
def add_recovery_event(product_id: str, data: RecoveryEventInput):
    try:
        return twin_service.add_recovery_event(product_id, data)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Product Twin not found")

@router.post("/{product_id}/logistics", response_model=ProductTwin)
def add_logistics_event(product_id: str, data: LogisticsEventInput):
    try:
        return twin_service.add_logistics_event(product_id, data)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Product Twin not found")

@router.post("/{product_id}/events", response_model=dict)
def add_unified_event(product_id: str, data: UnifiedEventInput):
    try:
        twin = twin_service.process_unified_event(product_id, data)
        return {"status": twin.currentStatus.value}
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Not Found")
        
@router.get("/{product_id}/timeline", response_model=list)
def get_timeline(product_id: str):
    try:
        return twin_service.get_timeline(product_id)
    except TwinNotFoundError:
        raise HTTPException(status_code=404, detail="Not Found")
