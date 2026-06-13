from fastapi import APIRouter
from app.models.schemas import FraudScoreRequest, FraudScoreResponse, FraudScoreComputedEvent
from app.services.scoring_engine import scoring_engine
from app.handlers.eventbridge import event_publisher
from app.db.dynamodb import db_client

router = APIRouter()

@router.post("/score", response_model=FraudScoreResponse)
def score_fraud(request: FraudScoreRequest):
    # 1. Calculate Score
    response = scoring_engine.calculate_score(request)
    
    # 2. Store to DB
    db_client.store_fraud_score(request.customer_id, response.model_dump(mode='json'))
    
    # 3. Publish Event
    event = FraudScoreComputedEvent(
        return_id=request.return_id,
        customer_id=request.customer_id,
        fraud_score=response.fraud_score,
        trust_score=response.trust_score,
        risk_level=response.risk_level,
        risk_factors=response.risk_factors
    )
    event_publisher.publish_fraud_event(event.model_dump(mode='json'))
    
    return response
