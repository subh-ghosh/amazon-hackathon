from fastapi import APIRouter, Request, Header
from app.models.schemas import FraudScoreRequest, FraudScoreResponse, FraudScoreComputedEvent
from app.services.scoring_engine import scoring_engine
from app.handlers.eventbridge import event_publisher
from app.db.dynamodb import db_client
from app.core.logging import logger, request_id_ctx
import uuid

router = APIRouter()

@router.post("/score", response_model=FraudScoreResponse)
async def score_fraud(request: FraudScoreRequest, x_correlation_id: str = Header(None)):
    req_id = x_correlation_id or str(uuid.uuid4())
    request_id_ctx.set(req_id)
    
    logger.info(f"Received fraud score request for return_id: {request.return_id}, customer: {request.customer_id}")
    
    # 1. Calculate Score (Capabilities 1-8)
    response = scoring_engine.calculate_score(request)
    
    # 2. Store to DB
    logger.info(f"Storing score {response.fraud_score} to DynamoDB")
    db_client.store_fraud_score(request.customer_id, response.model_dump(mode='json'))
    
    # 3. Publish Event (Capability 9)
    event = FraudScoreComputedEvent(
        return_id=request.return_id,
        customer_id=request.customer_id,
        fraud_score=response.fraud_score,
        trust_score=response.trust_score,
        risk_level=response.risk_level,
        risk_factors=response.risk_factors
    )
    event_publisher.publish_fraud_event(event.model_dump(mode='json'))
    logger.info("Published FraudScoreComputed event to EventBridge")
    
    # 4. Knowledge Graph Feedback (Capability 10)
    if response.fraud_score >= 60:
        logger.info(f"Knowledge Graph Feedback: Emitting high-risk fraud case for {request.customer_id}")
        # In a real impl, this calls Service 12 POST /api/v1/fraud_cases
    
    return response
