from fastapi import APIRouter, HTTPException, status
from app.models.schemas import PackagingRequest, PackagingResponse
from app.services.scoring import ScoringEngine
from app.services.recommendations import RecommendationEngine
import logging

# Initialize logger
logger = logging.getLogger("packaging_intelligence_service")
logger.setLevel(logging.INFO)

router = APIRouter()

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health Check Endpoint",
    description="Returns the health status of the Packaging Intelligence Service."
)
async def health_check():
    logger.info("Health check endpoint accessed")
    return {
        "status": "healthy",
        "service": "Packaging Intelligence Service",
        "version": "1.0.0"
    }

@router.post(
    "/api/v1/packaging/analyze",
    response_model=PackagingResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Packaging",
    description="Analyzes the sustainability, efficiency, recyclability, carbon footprint, and returns optimization recommendations."
)
async def analyze_packaging(request: PackagingRequest):
    logger.info(
        f"Processing packaging analysis for product={request.productId}, material={request.packagingMaterial}"
    )
    try:
        # 1. Run deterministic scoring engine
        scores = ScoringEngine.calculate_scores(request)
        
        # 2. Run recommendation engine
        recommendations, explanations = RecommendationEngine.generate_recommendations(request, scores)

        logger.info(
            f"Analysis completed for product={request.productId}: "
            f"sustainability={scores['sustainabilityScore']}, "
            f"efficiency={scores['packagingEfficiencyScore']}, "
            f"carbon={scores['carbonImpactScore']}, "
            f"recyclability={scores['recyclabilityScore']}, "
            f"confidence={scores['confidence']}"
        )

        packaging_insights = []
        for r in recommendations:
            packaging_insights.append({"insight": r, "severity": "MEDIUM"})
        for e in explanations:
            packaging_insights.append({"insight": e, "severity": "LOW"})

        return PackagingResponse(
            productId=request.productId,
            sustainabilityScore=scores["sustainabilityScore"],
            packagingEfficiencyScore=scores["packagingEfficiencyScore"],
            carbonImpactScore=scores["carbonImpactScore"],
            recyclabilityScore=scores["recyclabilityScore"],
            confidence=scores["confidence"],
            recommendations=recommendations,
            explanations=explanations,
            packagingInsights=packaging_insights
        )
    except Exception as e:
        logger.error(f"Error executing analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while calculating the packaging intelligence metrics."
        )
