"""
Intelligence endpoints — read-only graph analytics.

GET /products/{id}/intelligence
GET /sellers/{id}/intelligence
GET /analytics/top-return-causes
GET /analytics/fraudulent-products
GET /analytics/seller-return-analysis
GET /analytics/recovery-effectiveness
GET /analytics/graph-stats
"""

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_graph_service
from app.models.schemas import (
    ProductIntelligenceResponse,
    SellerIntelligenceResponse,
    GraphStatsResponse,
)
from app.services.graph_service import GraphService

router = APIRouter()


# ── Entity Intelligence ──────────────────────────

@router.get(
    "/products/{product_id}",
    response_model=ProductIntelligenceResponse,
    summary="Product intelligence — return rate, root causes, fraud risk",
)
async def get_product_intelligence(
    product_id: str,
    graph: GraphService = Depends(get_graph_service),
):
    return graph.get_product_intelligence(product_id)


@router.get(
    "/sellers/{seller_id}",
    response_model=SellerIntelligenceResponse,
    summary="Seller intelligence — return patterns, fraud association",
)
async def get_seller_intelligence(
    seller_id: str,
    graph: GraphService = Depends(get_graph_service),
):
    return graph.get_seller_intelligence(seller_id)


# ── Platform Analytics ───────────────────────────

@router.get(
    "/analytics/top-return-causes",
    summary="Platform-wide top root causes for returns",
)
async def top_return_causes(
    limit: int = Query(default=10, le=50),
    graph: GraphService = Depends(get_graph_service),
):
    if getattr(graph.neptune, "_offline", False):
        return {"status": "degraded", "data": []}
    return {"status": "ok", "data": graph.top_return_causes(limit)}


@router.get(
    "/analytics/fraudulent-products",
    summary="Products most associated with fraud",
)
async def fraudulent_products(
    limit: int = Query(default=10, le=50),
    graph: GraphService = Depends(get_graph_service),
):
    if getattr(graph.neptune, "_offline", False):
        return {"status": "degraded", "data": []}
    return {"status": "ok", "data": graph.most_fraudulent_products(limit)}


@router.get(
    "/analytics/seller-return-analysis",
    summary="Sellers ranked by defective returns",
)
async def seller_return_analysis(
    limit: int = Query(default=10, le=50),
    graph: GraphService = Depends(get_graph_service),
):
    if getattr(graph.neptune, "_offline", False):
        return {"status": "degraded", "data": []}
    return {"status": "ok", "data": graph.seller_return_analysis(limit)}


@router.get(
    "/analytics/recovery-effectiveness",
    summary="Recovery action effectiveness by root cause",
)
async def recovery_effectiveness(
    graph: GraphService = Depends(get_graph_service),
):
    if getattr(graph.neptune, "_offline", False):
        return {"status": "degraded", "data": []}
    return {"status": "ok", "data": graph.recovery_effectiveness()}


@router.get(
    "/analytics/graph-stats",
    summary="High-level knowledge graph statistics",
)
async def graph_stats(
    graph: GraphService = Depends(get_graph_service),
):
    return graph.get_graph_stats()
