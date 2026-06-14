import uuid
from app.models.schemas import OptimizationRequest, OptimizationResponse, SustainabilityMetrics, FacilityOption
from app.services.audit import audit_service

def calculate_circularity_score(facility_type: str) -> int:
    scores = {
        "REFURBISHMENT": 95,
        "DONATION": 90,
        "RECYCLING": 80,
        "LIQUIDATION": 60,
        "DISPOSAL": 20
    }
    return scores.get(facility_type, 0)

def score_facility(req: OptimizationRequest, facility: FacilityOption) -> float:
    # 40% Recovery Value
    recovery_value_score = 0
    if facility.facilityType == "REFURBISHMENT" and req.condition in ["USED", "LIKE_NEW", "REFURBISHABLE"]:
        recovery_value_score = 100
    elif facility.facilityType == "DONATION" and req.condition in ["NEW", "OPEN_BOX", "LIKE_NEW"]:
        recovery_value_score = 90
    elif facility.facilityType == "RECYCLING" and req.condition in ["DAMAGED", "BROKEN"]:
        recovery_value_score = 80
    elif facility.facilityType == "LIQUIDATION" and req.condition in ["USED", "LOW_VALUE"]:
        recovery_value_score = 60
    elif facility.facilityType == "DISPOSAL" and req.condition == "UNRECOVERABLE":
        recovery_value_score = 50
    else:
        # If it doesn't match optimal routing rules, lower the recovery score significantly
        recovery_value_score = 10
        
    # 25% Logistics Cost (inversely proportional to distance)
    # Assume max distance 2000km for scoring
    cost_score = max(0, 100 - (facility.distanceKm / 20))
    
    # 20% Carbon Efficiency (similar to cost, based on distance)
    carbon_score = cost_score
    
    # 15% Facility Capacity
    capacity_score = 100 if facility.capacityAvailable else 0
    
    total_score = (
        (0.40 * recovery_value_score) +
        (0.25 * cost_score) +
        (0.20 * carbon_score) +
        (0.15 * capacity_score)
    )
    
    return min(100.0, max(0.0, total_score))

def optimize_route(req: OptimizationRequest, correlation_id: str = None) -> OptimizationResponse:
    audit_service.log_audit("OPTIMIZATION_STARTED", f"Evaluating {len(req.facilityOptions)} facilities for return {req.returnId}", correlation_id)
    
    if not req.facilityOptions:
        raise ValueError("No facility options provided")
        
    best_facility = None
    best_score = -1
    
    for facility in req.facilityOptions:
        if not facility.capacityAvailable:
            continue
            
        score = score_facility(req, facility)
        audit_service.log_audit("FACILITY_EVALUATED", f"Facility {facility.facilityId} scored {score:.2f}", correlation_id)
        
        if score > best_score:
            best_score = score
            best_facility = facility
            
    if not best_facility:
        # Fallback if no capacity
        best_facility = req.facilityOptions[0]
        best_score = score_facility(req, best_facility)
        audit_service.log_audit("CAPACITY_WARNING", "No facilities with capacity, routing to fallback", correlation_id)
        
    audit_service.log_audit("OPTIMIZATION_COMPLETE", f"Selected {best_facility.facilityId}", correlation_id)
    
    circularity = calculate_circularity_score(best_facility.facilityType)
    # Simulated CO2 saved (inverse to distance)
    co2_saved = max(0, 50 - (best_facility.distanceKm * 0.05))
    waste_diverted = req.weightKg if best_facility.facilityType != "DISPOSAL" else 0.0
    
    metrics = SustainabilityMetrics(
        estimatedCO2Saved=round(co2_saved, 2),
        estimatedWasteDivertedKg=waste_diverted,
        circularityScore=circularity
    )
    
    decision_id = f"DEC-{uuid.uuid4()}"
    
    resp = OptimizationResponse(
        decisionId=decision_id,
        requestId=req.requestId,
        returnId=req.returnId,
        selectedFacilityId=best_facility.facilityId,
        selectedFacilityType=best_facility.facilityType,
        optimizationScore=round(best_score, 2),
        routingReason=f"Optimal routing based on condition '{req.condition}' and distance {best_facility.distanceKm}km",
        sustainabilityMetrics=metrics
    )
    
    audit_service.cache_decision(decision_id, resp.model_dump())
    audit_service.record_analytics(best_facility.facilityType, best_facility.facilityId, co2_saved, circularity)
    
    return resp
