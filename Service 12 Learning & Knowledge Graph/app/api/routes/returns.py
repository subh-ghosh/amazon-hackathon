"""
POST /returns — Create return nodes + emit ReturnCreated event.
GET  /returns/{id} — Full return detail (graph + DynamoDB timeline).
"""

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_graph_service, get_event_service, get_metadata_service
from app.models.schemas import (
    ReturnCreateRequest,
    EntityCreatedResponse,
    ReturnDetailResponse,
    RootCauseCreateRequest,
    ReturnJourneyResponse,
)
from app.services.graph_service import GraphService
from app.services.event_service import EventService
from app.services.metadata_service import MetadataService

router = APIRouter()


@router.post(
    "/",
    response_model=EntityCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a return in the knowledge graph",
)
async def create_return(
    request: ReturnCreateRequest,
    graph: GraphService = Depends(get_graph_service),
    events: EventService = Depends(get_event_service),
    metadata: MetadataService = Depends(get_metadata_service),
):
    # 1. Write to Neptune graph
    entity_id = graph.create_return(request)

    # 2. Write to DynamoDB event timeline (best-effort in local dev)
    try:
        metadata.record_return_event(request.return_id, "INITIATED", {
            "OrderID": request.order_id,
            "CustomerID": request.customer_id,
            "ProductID": request.product_id,
            "Reason": request.reason.value,
        })
    except Exception:
        pass  # DynamoDB unavailable locally

    # 3. Emit domain event to EventBridge (best-effort)
    try:
        events.emit_return_created(
            return_id=request.return_id,
            product_id=request.product_id,
            customer_id=request.customer_id,
            reason=request.reason.value,
        )
    except Exception:
        pass  # EventBridge unavailable locally

    return EntityCreatedResponse(
        entity_id=entity_id,
        entity_type="Return",
        message=f"Return {entity_id} recorded in graph and event emitted",
    )


@router.get(
    "/{return_id}",
    response_model=ReturnDetailResponse,
    summary="Get full return detail — graph relationships + event timeline",
)
async def get_return_detail(
    return_id: str,
    graph: GraphService = Depends(get_graph_service),
    metadata: MetadataService = Depends(get_metadata_service),
):
    # Graph data (relationships)
    graph_data = graph.get_return_graph_data(return_id)

    # DynamoDB data (event timeline) — best-effort
    try:
        timeline = metadata.get_return_timeline(return_id)
    except Exception:
        timeline = []

    # Recovery decisions — best-effort
    try:
        recovery = metadata.get_recovery_decisions(return_id)
    except Exception:
        recovery = []

    return ReturnDetailResponse(
        return_id=return_id,
        order_id=graph_data.get("r", {}).get("orderId", ""),
        customer_id="",  # Resolved via graph traversal
        product_id="",   # Resolved via graph traversal
        reason=graph_data.get("r", {}).get("reason", ""),
        timestamp=graph_data.get("r", {}).get("timestamp", ""),
        root_causes=[
            {"cause_id": rc.get("id", ""), "category": rc.get("category", "")}
            for rc in graph_data.get("root_causes", [])
        ],
        fraud_cases=[
            {"case_id": fc.get("id", ""), "severity": fc.get("severity", "")}
            for fc in graph_data.get("fraud_cases", [])
        ],
        recovery_actions=[
            {"action_id": ra.get("id", ""), "type": ra.get("actionType", "")}
            for ra in graph_data.get("recovery_actions", [])
        ],
        event_timeline=timeline,
    )


@router.post(
    "/{return_id}/root-causes",
    response_model=EntityCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link a root cause to a return",
)
async def create_root_cause(
    return_id: str,
    request: RootCauseCreateRequest,
    graph: GraphService = Depends(get_graph_service),
):
    if return_id != request.return_id:
        request.return_id = return_id
    entity_id = graph.create_root_cause(request)
    return EntityCreatedResponse(
        entity_id=entity_id,
        entity_type="RootCause",
        message=f"RootCause {entity_id} linked to Return {return_id} with confidence {request.confidence}",
    )


@router.get(
    "/{return_id}/journey",
    response_model=ReturnJourneyResponse,
    summary="Get return journey — event timeline and current state",
)
async def get_return_journey(
    return_id: str,
    metadata: MetadataService = Depends(get_metadata_service),
):
    try:
        timeline = metadata.get_return_timeline(return_id)
    except Exception:
        timeline = []

    # Map the timeline items to string descriptions
    events = [item.get("EventType", "Unknown Event") for item in timeline]
    if not events:
        events = ["Return Created (Graph Only)"]

    current_state = events[-1] if events else "Initiated"

    return ReturnJourneyResponse(
        return_id=return_id,
        timeline=events,
        current_state=current_state,
    )
