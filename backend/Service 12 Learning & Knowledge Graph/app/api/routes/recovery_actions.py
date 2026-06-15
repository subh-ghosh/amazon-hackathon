"""
POST /recovery-actions — Create recovery action nodes + emit RecoveryDecisionMade.
"""

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_graph_service, get_event_service, get_metadata_service
from app.models.schemas import RecoveryActionCreateRequest, EntityCreatedResponse
from app.services.graph_service import GraphService
from app.services.event_service import EventService
from app.services.metadata_service import MetadataService

router = APIRouter()


@router.post(
    "/",
    response_model=EntityCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a recovery action in the knowledge graph",
)
async def create_recovery_action(
    request: RecoveryActionCreateRequest,
    graph: GraphService = Depends(get_graph_service),
    events: EventService = Depends(get_event_service),
    metadata: MetadataService = Depends(get_metadata_service),
):
    # 1. Write to Neptune
    entity_id = graph.create_recovery_action(request)

    # 2. Record in DynamoDB (best-effort)
    try:
        metadata.record_recovery_decision(
            return_id=request.return_id,
            action_id=request.action_id,
            action_type=request.action_type.value,
            estimated_value=request.estimated_value_recovered,
            cost=request.cost_incurred,
        )
    except Exception:
        pass

    # 3. Emit event
    try:
        events.emit_recovery_decision_made(
            return_id=request.return_id,
            action_id=request.action_id,
            decision=request.action_type.value,
            expected_value=request.estimated_value_recovered,
        )
    except Exception:
        pass

    return EntityCreatedResponse(
        entity_id=entity_id,
        entity_type="RecoveryAction",
        message=f"RecoveryAction {entity_id} for Return {request.return_id}",
    )
