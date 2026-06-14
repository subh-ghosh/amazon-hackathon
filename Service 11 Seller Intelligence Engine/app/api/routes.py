import logging
import threading
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import SellerAnalysisRequest, SellerAnalysisResponse, HistoricalMetrics
from app.services.scoring import ScoringEngine
from app.services.recommendations import RecommendationEngine

# Set up logger
logger = logging.getLogger("seller_intelligence_service")
logger.setLevel(logging.INFO)

router = APIRouter()

# Thread-safe in-memory cache for dashboard retrieval
class SellerCacheStore:
    def __init__(self):
        self._cache = {}
        self._lock = threading.Lock()

    def get(self, seller_id: str) -> dict:
        with self._lock:
            return self._cache.get(seller_id)

    def set(self, seller_id: str, value: dict, request: SellerAnalysisRequest):
        with self._lock:
            prev_record = self._cache.get(seller_id)
            
            # Extract previous historical lists
            health_scores = []
            return_rates = []
            fraud_rates = []
            
            if prev_record:
                prev_hist = prev_record.get("historicalMetrics", {})
                health_scores = list(prev_hist.get("healthScores", []))
                return_rates = list(prev_hist.get("returnRates", []))
                fraud_rates = list(prev_hist.get("fraudRates", []))
                
                # Append the previous run's values to history
                health_scores.append(prev_record["sellerHealthScore"])
                return_rates.append(prev_record["returnsPer100Orders"])
                # Calculate previous fraud rate percentage
                prev_orders = prev_record.get("totalOrders", 1)
                prev_fraud_cases = prev_record.get("fraudCases", 0)
                prev_fraud_rate = (prev_fraud_cases / prev_orders) * 100.0 if prev_orders > 0 else 0.0
                fraud_rates.append(round(prev_fraud_rate, 2))
                
                # Keep history size to max 10
                health_scores = health_scores[-10:]
                return_rates = return_rates[-10:]
                fraud_rates = fraud_rates[-10:]
            
            # Build current record details needed for comparisons
            value["totalOrders"] = request.totalOrders
            value["totalReturns"] = request.totalReturns
            value["fraudCases"] = request.fraudCases
            
            # Embed updated historical metrics
            value["historicalMetrics"] = {
                "healthScores": health_scores,
                "returnRates": return_rates,
                "fraudRates": fraud_rates
            }
            self._cache[seller_id] = value

    def clear(self):
        with self._lock:
            self._cache.clear()

seller_store = SellerCacheStore()


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health Check",
    description="Returns the status of the Seller Intelligence Engine."
)
async def health_check():
    logger.info("Health check requested")
    return {
        "status": "healthy",
        "service": "Seller Intelligence Engine",
        "version": "1.0.0"
    }


@router.post(
    "/api/v1/seller/analyze",
    response_model=SellerAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Seller Performance",
    description="Aggregates returns, fraud patterns, ratings, and packaging metrics to generate health scores, trends, and recommendations."
)
async def analyze_seller(request: SellerAnalysisRequest):
    logger.info(f"Analyzing seller_id={request.sellerId}, name={request.sellerName}")
    try:
        # 1. Run scoring engine
        scores = ScoringEngine.calculate_scores(request)
        
        # 2. Get previous record to calculate trends dynamically
        prev_record = seller_store.get(request.sellerId)
        
        if prev_record:
            # Dynamic trend calculations
            prev_health = prev_record["sellerHealthScore"]
            if scores["sellerHealthScore"] > prev_health:
                health_trend = "IMPROVING"
            elif scores["sellerHealthScore"] < prev_health:
                health_trend = "DECLINING"
            else:
                health_trend = "STABLE"
                
            prev_returns = prev_record["returnsPer100Orders"]
            if scores["returnsPer100Orders"] < prev_returns:
                return_trend = "IMPROVING"
            elif scores["returnsPer100Orders"] > prev_returns:
                return_trend = "DECLINING"
            else:
                return_trend = "STABLE"
                
            prev_fraud = prev_record.get("fraudCases", 0)
            if request.fraudCases < prev_fraud:
                fraud_trend = "IMPROVING"
            elif request.fraudCases > prev_fraud:
                fraud_trend = "DECLINING"
            else:
                fraud_trend = "STABLE"
        else:
            # Baseline trend fallbacks
            health_trend = "IMPROVING" if scores["sellerHealthScore"] >= 80 else ("DECLINING" if scores["sellerHealthScore"] < 70 else "STABLE")
            return_trend = "IMPROVING" if scores["returnsPer100Orders"] < 5.0 else ("DECLINING" if scores["returnsPer100Orders"] > 12.0 else "STABLE")
            fraud_trend = "IMPROVING" if request.fraudCases < 20 else ("DECLINING" if request.fraudCases > 30 else "STABLE")

        # 3. Generate recommendations and insights
        rec_data = RecommendationEngine.generate_recommendations(request, scores)
        
        # 4. Assemble response object
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Build dictionary
        analysis_data = {
            "sellerId": request.sellerId,
            "sellerHealthScore": scores["sellerHealthScore"],
            "sellerTier": scores["sellerTier"],
            "returnRiskScore": scores["returnRiskScore"],
            "fraudRiskScore": scores["fraudRiskScore"],
            "sustainabilityScore": scores["sustainabilityScore"],
            "estimatedRevenueLoss": scores["estimatedRevenueLoss"],
            "returnsPer100Orders": scores["returnsPer100Orders"],
            "highRiskProducts": scores["highRiskProducts"],
            "fraudExposureLevel": scores["fraudExposureLevel"],
            "sellerHealthTrend": health_trend,
            "returnTrend": return_trend,
            "fraudTrend": fraud_trend,
            
            # Integration insights mapping
            "rootCauseInsights": rec_data["rootCauseInsights"],
            "fraudInsights": rec_data["fraudInsights"],
            "lifecycleInsights": rec_data["lifecycleInsights"],
            "packagingInsights": rec_data["packagingInsights"],
            "historicalInsights": rec_data["historicalInsights"],
            
            # Recommendations, issues & general insights
            "topIssues": rec_data["topIssues"],
            "recommendations": rec_data["recommendations"],
            "insights": rec_data["insights"],
            "sellerHealthInsights": [{"insight": i, "severity": "MEDIUM"} for i in rec_data["insights"]],
            
            # Dashboard metadata & executive enhancements
            "dashboardGeneratedAt": timestamp,
            "analysisVersion": "v1.0",
            "executiveSummary": rec_data["executiveSummary"],
            "priorityActions": rec_data["priorityActions"],
            "riskBreakdown": scores["riskBreakdown"],
            "sellerBenchmark": scores["sellerBenchmark"],
            "confidenceScore": scores["confidenceScore"],
            "overallRiskLevel": scores["overallRiskLevel"],
            
            # Historical structure (to be set/updated by cache store)
            "historicalMetrics": {
                "healthScores": [],
                "returnRates": [],
                "fraudRates": []
            }
        }
        
        # Save analysis data to thread-safe cache store (this updates historicalMetrics)
        seller_store.set(request.sellerId, analysis_data, request)
        
        # Return response model
        stored_data = dict(seller_store.get(request.sellerId))
        stored_data.pop("totalOrders", None)
        stored_data.pop("totalReturns", None)
        stored_data.pop("fraudCases", None)
        stored_data.pop("fraudRatePct", None)
        return SellerAnalysisResponse(**stored_data)
        
    except Exception as e:
        logger.error(f"Error calculating seller metrics: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while calculating seller intelligence metrics."
        )


@router.get(
    "/api/v1/seller/{sellerId}/dashboard",
    response_model=SellerAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Seller Dashboard",
    description="Retrieves the latest complete, frontend-ready seller metrics, tiers, trends, and priority actions."
)
async def get_seller_dashboard(sellerId: str):
    logger.info(f"Dashboard lookup requested for sellerId={sellerId}")
    stored_data = seller_store.get(sellerId)
    if not stored_data:
        logger.warning(f"Dashboard data not found for sellerId={sellerId}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seller analysis not found for ID: {sellerId}. Run analysis first to populate dashboard metrics."
        )
    response_data = dict(stored_data)
    response_data.pop("totalOrders", None)
    response_data.pop("totalReturns", None)
    response_data.pop("fraudCases", None)
    response_data.pop("fraudRatePct", None)
    return SellerAnalysisResponse(**response_data)
