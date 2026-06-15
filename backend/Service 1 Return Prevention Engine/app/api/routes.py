from fastapi import APIRouter, HTTPException, status
from app.models.schemas import PreventionRequest, PreventionResponse
from app.services.scoring import ScoringEngine
from app.services.recommendations import RecommendationEngine
import logging

# Initialize logger
logger = logging.getLogger("return_prevention_engine")
logger.setLevel(logging.INFO)

router = APIRouter()

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health Check Endpoint",
    description="Returns the health status of the Return Prevention Engine."
)
async def health_check():
    logger.info("Health check endpoint accessed")
    return {
        "status": "healthy",
        "service": "Return Prevention Engine",
        "version": "1.0.0"
    }

@router.post(
    "/api/v1/prevention/analyze",
    response_model=PreventionResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Return Risk",
    description="Predicts return risk, generates recommendations, and provides explanation drivers for a prospective purchase."
)
async def analyze_prevention(request: PreventionRequest):
    logger.info(
        f"Processing prevention analysis for customer={request.customerId}, product={request.productId}"
    )
    try:
        # 1. Run deterministic risk scoring engine
        risk_score, risk_level, confidence = ScoringEngine.calculate_scores(request)

        # 2. Run recommendation engine based on risk drivers
        recommended_actions, explanation = RecommendationEngine.generate_recommendations(
            request, risk_score, risk_level
        )

        logger.info(
            f"Analysis completed: score={risk_score}, level={risk_level}, confidence={confidence}"
        )

        return PreventionResponse(
            returnRiskScore=risk_score,
            riskLevel=risk_level,
            recommendedActions=recommended_actions,
            confidence=confidence,
            explanation=explanation
        )
    except Exception as e:
        logger.error(f"Error executing analysis: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while calculating the return risk."
        )
