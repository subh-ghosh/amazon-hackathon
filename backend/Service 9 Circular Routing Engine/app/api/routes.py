from fastapi import APIRouter, HTTPException, Request
from typing import List
from app.models.schemas import (
    OptimizationRequest, 
    OptimizationResponse, 
    BatchOptimizationRequest, 
    BatchOptimizationResponse,
    AnalyticsResponse
)
from app.services.optimizer import optimize_route
from app.services.audit import audit_service

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok"}

@router.get("/live")
def liveness_probe():
    return {"status": "alive"}

@router.get("/ready")
def readiness_probe():
    return {"status": "ready"}

@router.post("/api/v1/logistics/optimize", response_model=OptimizationResponse)
def optimize_logistics(payload: OptimizationRequest, request: Request):
    correlation_id = getattr(request.state, "correlation_id", "local")
    return optimize_route(payload, correlation_id)

@router.post("/api/v1/logistics/batch-optimize", response_model=BatchOptimizationResponse)
def batch_optimize_logistics(payload: BatchOptimizationRequest, request: Request):
    correlation_id = getattr(request.state, "correlation_id", "local")
    results = [optimize_route(req, correlation_id) for req in payload.requests]
    return BatchOptimizationResponse(results=results)

@router.get("/api/v1/logistics/analytics", response_model=AnalyticsResponse)
def get_analytics():
    return AnalyticsResponse(**audit_service.get_analytics())

@router.get("/api/v1/logistics/{decisionId}", response_model=OptimizationResponse)
def get_decision(decisionId: str):
    decision = audit_service.get_decision(decisionId)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return OptimizationResponse(**decision)

@router.get("/metrics")
def get_metrics():
    # Simple metrics endpoint for Prometheus
    analytics = audit_service.get_analytics()
    return {
        "optimizations_total": analytics["totalOptimizations"],
        "co2_saved_total": analytics["averageCO2Saved"] * analytics["totalOptimizations"]
    }
