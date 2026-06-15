"""
POST /products — Create product nodes with SOLD_BY and STORED_AT edges.
"""

from fastapi import APIRouter, Depends, status

from app.api.dependencies import get_graph_service
from app.models.schemas import ProductCreateRequest, ProductTwinCreateRequest, EntityCreatedResponse
from app.services.graph_service import GraphService

router = APIRouter()


@router.post(
    "/",
    response_model=EntityCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a product in the knowledge graph",
)
async def create_product(
    request: ProductCreateRequest,
    graph: GraphService = Depends(get_graph_service),
):
    entity_id = graph.create_product(request)
    return EntityCreatedResponse(
        entity_id=entity_id,
        entity_type="Product",
        message=f"Product {entity_id} created with SOLD_BY -> {request.seller_id}",
    )


@router.post(
    "/twins",
    response_model=EntityCreatedResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a product twin in the knowledge graph",
)
async def create_product_twin(
    request: ProductTwinCreateRequest,
    graph: GraphService = Depends(get_graph_service),
):
    entity_id = graph.create_product_twin(request)
    return EntityCreatedResponse(
        entity_id=entity_id,
        entity_type="ProductTwin",
        message=f"ProductTwin {entity_id} created for Product {request.product_id}",
    )
