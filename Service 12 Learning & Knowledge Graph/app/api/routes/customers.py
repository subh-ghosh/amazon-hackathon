"""
POST /customers — Create customer nodes in the Knowledge Graph.
"""

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_graph_service
from app.models.schemas import CustomerCreateRequest, EntityCreatedResponse
from app.services.graph_service import GraphService

router = APIRouter()


@router.post(
    "/",
    response_model=EntityCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a customer in the knowledge graph",
)
async def create_customer(
    request: CustomerCreateRequest,
    graph: GraphService = Depends(get_graph_service),
):
    entity_id = graph.create_customer(request)
    return EntityCreatedResponse(
        entity_id=entity_id,
        entity_type="Customer",
        message=f"Customer {entity_id} created in graph",
    )
