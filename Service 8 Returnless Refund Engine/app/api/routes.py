import logging
import threading
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Request, BackgroundTasks, Query, Response

from app.models.schemas import (
    EvaluateRequest,
    EvaluateResponse,
    BatchEvaluateRequest,
    BatchEvaluateResponse,
    JobStatusResponse,
    AnalyticsResponse
)
from app.services.evaluation import EvaluationEngine
from app.services.job_manager import job_manager
from app.services.rate_limiter import api_rate_limiter

# Set up logger
logger = logging.getLogger("returnless_refund_service")

router = APIRouter()

# --- Thread-Safe Cache and Analytics Store ---

class DecisionCacheStore:
    def __init__(self):
        self._cache = {}  # requestId -> {"response": response, "customerId": customerId}
        self._lock = threading.RLock()

    def get(self, request_id: str) -> Optional[EvaluateResponse]:
        with self._lock:
            data = self._cache.get(request_id)
            if data:
                return data["response"]
            return None

    def set(self, request_id: str, response: EvaluateResponse, customer_id: str):
        with self._lock:
            self._cache[request_id] = {
                "response": response,
                "customerId": customer_id
            }

    def get_customer_history(self, customer_id: str) -> List[str]:
        with self._lock:
            return [
                item["response"].decision
                for item in self._cache.values()
                if item["customerId"] == customer_id
            ]

    def clear(self):
        with self._lock:
            self._cache.clear()


class AnalyticsStore:
    def __init__(self):
        self.total_evaluations = 0
        self.decision_distribution = {
            "RETURNLESS_REFUND": 0,
            "RETURN_REQUIRED": 0,
            "PARTIAL_REFUND": 0,
            "REFUND_AND_DONATE": 0,
            "REFUND_AND_RECYCLE": 0,
            "MANUAL_REVIEW": 0
        }
        self.total_refund_value = 0.0
        self.total_estimated_savings = 0.0
        self.total_co2_saved = 0.0
        self.total_waste_diverted = 0.0
        self.manual_review_count = 0
        self.total_order_value_shielded = 0.0
        self._lock = threading.RLock()

    def record_evaluation(self, res: EvaluateResponse, order_value: float, fraud_score: int):
        with self._lock:
            self.total_evaluations += 1
            dec = res.decision
            self.decision_distribution[dec] = self.decision_distribution.get(dec, 0) + 1
            self.total_refund_value += res.refundAmount
            self.total_estimated_savings += res.estimatedSavings
            self.total_co2_saved += res.estimatedCO2Saved
            self.total_waste_diverted += res.estimatedWasteDivertedKg
            if dec == "MANUAL_REVIEW":
                self.manual_review_count += 1
                self.total_order_value_shielded += order_value

    def get_summary(self) -> dict:
        with self._lock:
            return {
                "totalEvaluations": self.total_evaluations,
                "decisionDistribution": dict(self.decision_distribution),
                "totalRefundValue": round(self.total_refund_value, 2),
                "totalEstimatedSavings": round(self.total_estimated_savings, 2),
                "totalCO2Saved": round(self.total_co2_saved, 2),
                "totalWasteDiverted": round(self.total_waste_diverted, 2),
                "fraudPreventionStatistics": {
                    "manualReviewCount": self.manual_review_count,
                    "totalOrderValueShielded": round(self.total_order_value_shielded, 2)
                }
            }

    def clear(self):
        with self._lock:
            self.total_evaluations = 0
            self.decision_distribution = {k: 0 for k in self.decision_distribution}
            self.total_refund_value = 0.0
            self.total_estimated_savings = 0.0
            self.total_co2_saved = 0.0
            self.total_waste_diverted = 0.0
            self.manual_review_count = 0
            self.total_order_value_shielded = 0.0


# Initialize store instances
decision_store = DecisionCacheStore()
analytics_store = AnalyticsStore()


# --- Endpoints ---

@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="General Health Check",
    description="Validates the general service settings."
)
async def health_check():
    return {
        "status": "healthy",
        "service": "Returnless Refund Engine",
        "version": "1.0.0"
    }


@router.get(
    "/live",
    status_code=status.HTTP_200_OK,
    summary="Liveness Probe",
    description="Liveness check for container orchestration."
)
async def live_check():
    return {"status": "alive"}


@router.get(
    "/ready",
    status_code=status.HTTP_200_OK,
    summary="Readiness Probe",
    description="Readiness check validating the internal stores are functional."
)
async def ready_check():
    # Verify we can access the lock on the stores
    try:
        with decision_store._lock:
            pass
        with analytics_store._lock:
            pass
    except Exception as e:
        logger.error(f"Readiness check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service dependencies not ready."
        )
    return {"status": "ready"}


@router.post(
    "/api/v1/returnless/evaluate",
    response_model=EvaluateResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Returnless Refund Request",
    description="Runs the evaluation decision rules engine on a return request, supporting idempotency protection."
)
async def evaluate_returnless(request_payload: EvaluateRequest, request: Request):
    # Enforce Rate Limiting
    client_ip = request.client.host if request.client else "127.0.0.1"
    if not api_rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for client IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Try again later."
        )

    correlation_id = getattr(request.state, "correlation_id", "N/A")
    request.state.requestId = request_payload.requestId

    # 1. Idempotency Check
    existing_response = decision_store.get(request_payload.requestId)
    if existing_response:
        logger.info(f"Duplicate request detected for requestId: {request_payload.requestId}. Returning cached response.")
        
        # Build duplicate response payload
        duplicate_res = EvaluateResponse(
            **existing_response.model_dump()
        )
        duplicate_res.isDuplicateRequest = True
        duplicate_res.originalDecisionTimestamp = existing_response.decisionTimestamp
        duplicate_res.generatedAt = datetime.now(timezone.utc).isoformat()
        
        request.state.decision = duplicate_res.decision
        return duplicate_res

    # 2. Get past history of the customer for fraud checks
    past_decisions = decision_store.get_customer_history(request_payload.customerId)

    # 3. Evaluate Request
    try:
        response_data = EvaluationEngine.evaluate(request_payload, correlation_id, past_decisions)
        
        # Save to cache store
        decision_store.set(request_payload.requestId, response_data, request_payload.customerId)
        
        # Record evaluation in analytics
        analytics_store.record_evaluation(response_data, request_payload.orderValue, request_payload.fraudRiskScore)
        
        request.state.decision = response_data.decision
        return response_data
    except Exception as e:
        logger.error(f"Error executing evaluation for requestId {request_payload.requestId}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during request evaluation."
        )


@router.post(
    "/api/v1/returnless/batch-evaluate",
    response_model=BatchEvaluateResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch Evaluate Returnless Refund Requests",
    description="Processes multiple return evaluations. Supports async mode for large workloads."
)
async def batch_evaluate(
    batch_payload: BatchEvaluateRequest, 
    request: Request, 
    background_tasks: BackgroundTasks,
    asyncMode: bool = Query(default=False)
):
    correlation_id = getattr(request.state, "correlation_id", "N/A")
    
    if asyncMode:
        job_id = job_manager.create_job(batch_payload.requests, correlation_id, background_tasks)
        return BatchEvaluateResponse(
            jobId=job_id,
            status="PENDING",
            responses=None
        )
    
    # Synchronous evaluation loop
    logger.info(f"Running synchronous batch evaluation for {len(batch_payload.requests)} requests.")
    results: List[EvaluateResponse] = []
    
    for req in batch_payload.requests:
        # Check cache/idempotency per request in sync batch
        existing = decision_store.get(req.requestId)
        if existing:
            duplicate_res = EvaluateResponse(**existing.model_dump())
            duplicate_res.isDuplicateRequest = True
            duplicate_res.originalDecisionTimestamp = existing.decisionTimestamp
            duplicate_res.generatedAt = datetime.now(timezone.utc).isoformat()
            results.append(duplicate_res)
        else:
            past_decisions = decision_store.get_customer_history(req.customerId)
            res = EvaluationEngine.evaluate(req, correlation_id, past_decisions)
            decision_store.set(req.requestId, res, req.customerId)
            analytics_store.record_evaluation(res, req.orderValue, req.fraudRiskScore)
            results.append(res)
            
    return BatchEvaluateResponse(
        jobId=None,
        status="COMPLETED",
        responses=results
    )


@router.get(
    "/api/v1/returnless/jobs/{jobId}",
    response_model=JobStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Asynchronous Job Status",
    description="Retrieves status and results of an asynchronous bulk evaluation job."
)
async def get_job_status(jobId: str, request: Request):
    correlation_id = getattr(request.state, "correlation_id", "N/A")
    job = job_manager.get_job(jobId)
    if not job:
        logger.warning(f"Async job {jobId} not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{jobId}' not found."
        )
        
    return JobStatusResponse(
        jobId=job["jobId"],
        status=job["status"],
        correlationId=job["correlationId"],
        responses=job["responses"]
    )


@router.get(
    "/api/v1/returnless/analytics",
    response_model=AnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Operational Analytics Dashboard",
    description="Returns aggregate circular economy and performance metrics."
)
async def get_analytics():
    summary = analytics_store.get_summary()
    return AnalyticsResponse(
        totalEvaluations=summary["totalEvaluations"],
        decisionDistribution=summary["decisionDistribution"],
        totalRefundValue=summary["totalRefundValue"],
        totalEstimatedSavings=summary["totalEstimatedSavings"],
        totalCO2Saved=summary["totalCO2Saved"],
        totalWasteDiverted=summary["totalWasteDiverted"],
        fraudPreventionStatistics=summary["fraudPreventionStatistics"]
    )


@router.get(
    "/api/v1/returnless/{decisionId}",
    response_model=EvaluateResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Decision Details",
    description="Fetch details of a historical evaluation using its requestId."
)
async def get_decision_details(decisionId: str):
    logger.info(f"Lookup request for decisionId: {decisionId}")
    cached_res = decision_store.get(decisionId)
    if not cached_res:
        logger.warning(f"Decision details not found for decisionId: {decisionId}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Decision with ID '{decisionId}' not found."
        )
    return cached_res


@router.get(
    "/metrics",
    summary="Prometheus Metrics",
    description="Exposes Prometheus-compatible structured metrics."
)
async def get_metrics():
    summary = analytics_store.get_summary()
    lines = [
        "# HELP returnless_evaluations_total Total number of refund evaluations",
        "# TYPE returnless_evaluations_total counter",
        f'returnless_evaluations_total{{env="production"}} {summary["totalEvaluations"]}',
        "",
        "# HELP returnless_refund_value_total_usd Total value of refunded orders in USD",
        "# TYPE returnless_refund_value_total_usd counter",
        f'returnless_refund_value_total_usd{{env="production"}} {summary["totalRefundValue"]}',
        "",
        "# HELP returnless_savings_total_usd Total estimated shipping savings in USD",
        "# TYPE returnless_savings_total_usd counter",
        f'returnless_savings_total_usd{{env="production"}} {summary["totalEstimatedSavings"]}',
        "",
        "# HELP returnless_co2_saved_total_kg Total CO2 emissions saved in kg",
        "# TYPE returnless_co2_saved_total_kg counter",
        f'returnless_co2_saved_total_kg{{env="production"}} {summary["totalCO2Saved"]}',
        "",
        "# HELP returnless_waste_diverted_total_kg Total waste diverted from landfills in kg",
        "# TYPE returnless_waste_diverted_total_kg counter",
        f'returnless_waste_diverted_total_kg{{env="production"}} {summary["totalWasteDiverted"]}',
        ""
    ]
    return Response(content="\n".join(lines), media_type="text/plain")
