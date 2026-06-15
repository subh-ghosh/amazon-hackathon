"""
POST /fraud-cases — Create fraud case nodes + emit FraudDetected event.
"""

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_graph_service, get_event_service, get_metadata_service
from app.models.schemas import FraudCaseCreateRequest, EntityCreatedResponse
from app.services.graph_service import GraphService
from app.services.event_service import EventService
from app.services.metadata_service import MetadataService

router = APIRouter()


@router.post(
    "/",
    response_model=EntityCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a fraud case in the knowledge graph",
)
async def create_fraud_case(
    request: FraudCaseCreateRequest,
    graph: GraphService = Depends(get_graph_service),
    events: EventService = Depends(get_event_service),
    metadata: MetadataService = Depends(get_metadata_service),
):
    # 1. Write to Neptune
    entity_id = graph.create_fraud_case(request)

    # 2. Record fraud score in DynamoDB (best-effort)
    try:
        metadata.record_fraud_score(
            entity_id=request.entity_id,
            risk_score=request.risk_score,
            risk_factors=[f"severity:{request.severity.value}"],
        )
    except Exception:
        pass

    # 3. Emit event
    try:
        events.emit_fraud_detected(
            entity_id=request.entity_id,
            entity_type=request.entity_type,
            case_id=request.case_id,
            risk_score=request.risk_score,
        )
    except Exception:
        pass

    return EntityCreatedResponse(
        entity_id=entity_id,
        entity_type="FraudCase",
        message=f"FraudCase {entity_id} created — risk score {request.risk_score}",
    )
