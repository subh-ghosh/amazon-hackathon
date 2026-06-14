import json
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
import boto3

from app.config import settings
from app.schemas import FraudScoreRequest, FraudScoreResponse
from app.services.bedrock_vision import BedrockVisionService
from app.services.neptune_service import NeptuneService
from app.services.dynamodb_service import DynamoDBService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/fraud", tags=["Fraud & Trust"])

# Initialize services
bedrock_vision = BedrockVisionService()
neptune_service = NeptuneService()
db_service = DynamoDBService()

if not settings.MOCK_AWS_SERVICES:
    eventbridge = boto3.client("events", region_name=settings.AWS_REGION)
else:
    eventbridge = None

@router.post(
    "/score",
    response_model=FraudScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Compute fraud, trust, and authenticity metrics for returns"
)
async def score_return(payload: FraudScoreRequest):
    try:
        logger.info(f"Computing fraud score for return ID: {payload.returnId}")

        # 1. Query Neptune Graph for link connection risk (e.g., shared card or device)
        graph_results = neptune_service.check_fraud_network_risk(
            customer_id=payload.customerId,
            payment_hash=payload.paymentMethodHash or "",
            device_id=payload.deviceId or ""
        )
        graph_score = float(graph_results.get("graphRiskScore", 0.0))

        # 2. Query DynamoDB for customer historical profile return frequency
        customer_profile = db_service.get_customer_risk_profile(payload.customerId)
        
        # Calculate historical returns risk score (ratio of returns to orders)
        total_returns = customer_profile.get("totalReturns", 0)
        total_orders = customer_profile.get("totalOrders", 1)
        return_ratio = total_returns / max(1, total_orders)
        
        history_score = 0.0
        if return_ratio > 0.75:
            history_score = 0.90
        elif return_ratio > 0.50:
            history_score = 0.60
        elif return_ratio > 0.25:
            history_score = 0.30

        # 3. Query Bedrock Vision for return product comparison details
        visual_results = bedrock_vision.inspect_return_images(
            images=payload.images,
            product_id=payload.productId
        )
        visual_score = float(visual_results.get("visualScore", 0.0))

        # 4. Score Aggregation Algorithm
        # Weights: Graph Connections (40%), Vision Mismatch (40%), Customer Profile History (20%)
        aggregated_fraud_score = (graph_score * 0.4) + (visual_score * 0.4) + (history_score * 0.2)
        aggregated_fraud_score = round(min(1.0, max(0.0, aggregated_fraud_score)), 2)

        # Compute trust score (inverse of fraud)
        trust_score = round(max(0.0, 1.0 - aggregated_fraud_score), 2)

        # Define Risk Level
        if aggregated_fraud_score >= 0.75:
            risk_level = "HIGH"
            recommended_action = "Manual Review"
        elif aggregated_fraud_score >= 0.40:
            risk_level = "MEDIUM"
            recommended_action = "Hold Refund Verification"
        else:
            risk_level = "LOW"
            recommended_action = "Auto Refund"

        # Accumulate Risk Factors
        risk_factors = []
        if graph_score > 0.50:
            risk_factors.extend(graph_results.get("evidence", []))
        if visual_score > 0.50:
            risk_factors.extend(visual_results.get("evidence", []))
        if return_ratio > 0.50:
            risk_factors.append(f"Serial Return Abuse: Return rate is {int(return_ratio * 100)}% ({total_returns} returns out of {total_orders} orders).")
            
        if not risk_factors:
            risk_factors.append("No active fraud signatures detected.")

        # Build Response
        response_data = FraudScoreResponse(
            returnId=payload.returnId,
            fraudScore=aggregated_fraud_score,
            trustScore=trust_score,
            riskLevel=risk_level,
            recommendedAction=recommended_action,
            riskFactors=risk_factors
        )

        # 5. Persist FTE outcomes to DynamoDB (and increment customer counters)
        db_service.save_fraud_scoring(
            return_id=payload.returnId,
            customer_id=payload.customerId,
            scores={
                "fraudScore": aggregated_fraud_score,
                "trustScore": trust_score,
                "riskLevel": risk_level,
                "recommendedAction": recommended_action,
                "riskFactors": risk_factors
            }
        )

        # 6. Publish FraudScoreComputed event to EventBridge
        if not settings.MOCK_AWS_SERVICES and eventbridge:
            try:
                # Map recommended action to event enum
                action_map = {
                    "Auto Refund": "AUTO_REFUND",
                    "Hold Refund Verification": "HOLD_REFUND_VERIFICATION",
                    "Manual Review": "MANUAL_REVIEW"
                }
                
                flags = []
                if visual_results.get("productSwapped"): flags.append("PRODUCT_SWAP")
                if visual_results.get("wardrobingDetected"): flags.append("WARDROBING")
                if visual_results.get("emptyBoxDetected"): flags.append("EMPTY_BOX")
                if graph_score > 0.50: flags.append("FRAUD_RING_MATCH")

                event_detail = {
                    "returnId": response_data.returnId,
                    "customerId": payload.customerId,
                    "productId": payload.productId,
                    "fraudScore": response_data.fraudScore,
                    "trustScore": response_data.trustScore,
                    "authenticityScore": round(1.0 - visual_score, 2),
                    "riskLevel": response_data.riskLevel,
                    "recommendedAction": action_map.get(response_data.recommendedAction, "MANUAL_REVIEW"),
                    "flags": flags,
                    "timestamp": response_data.timestamp.isoformat()
                }

                eventbridge.put_events(
                    Entries=[
                        {
                            "Source": "aws.circular.intelligence.fte",
                            "DetailType": "FraudScoreComputed",
                            "Detail": json.dumps(event_detail),
                            "EventBusName": settings.EVENT_BUS_NAME
                        }
                    ]
                )
            except Exception as e:
                logger.error(f"Failed to publish FraudScoreComputed event: {e}")

        return response_data

    except Exception as e:
        logger.error(f"Internal error scoring return: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scoring return fraud: {str(e)}"
        )
