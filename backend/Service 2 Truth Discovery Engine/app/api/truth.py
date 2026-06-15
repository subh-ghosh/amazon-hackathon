import logging
from fastapi import APIRouter, HTTPException, status

from app.config import settings
from app.schemas import (
    TruthAnalyzeRequest, 
    TruthAnalyzeResponse, 
    Evidence, 
    RootCauseEnum
)
from app.services.graph_client import GraphClient
from app.services.bedrock_service import BedrockService
from app.services.storage_service import StorageService
from app.services.event_publisher import EventPublisher

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/truth", tags=["Truth Discovery"])

# Instantiate all engine services
graph_client = GraphClient()
bedrock_service = BedrockService()
storage_service = StorageService()
event_publisher = EventPublisher()

@router.post(
    "/analyze",
    response_model=TruthAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Run AI-driven root cause detection on a customer return with improvements"
)
async def analyze_return_truth(payload: TruthAnalyzeRequest):
    try:
        logger.info(f"Received production Truth Discovery request for return: {payload.returnId}")

        # 1. Integrate with Service #12 (Knowledge Graph) for Product context
        product_intel = graph_client.get_product_intelligence(payload.productId)

        # 2. Integrate with Service #12 (Knowledge Graph) for Seller context
        seller_intel = graph_client.get_seller_intelligence(payload.sellerId)

        # 3. Analyze with Bedrock Claude 3.5 Sonnet using strict prompts and context
        analysis_result = bedrock_service.discover_root_cause(
            request=payload,
            product_intel=product_intel,
            seller_intel=seller_intel
        )

        root_cause = analysis_result.get("rootCause")
        confidence = float(analysis_result.get("confidence", 0.90))
        evidence_raw = analysis_result.get("evidence", [])

        # Parse evidence into Evidence Pydantic models
        evidence = [Evidence(**ev) if isinstance(ev, dict) else ev for ev in evidence_raw]

        # 4. Confidence Threshold + Manual Review Check
        requires_manual_review = False
        if confidence < settings.CONFIDENCE_THRESHOLD:
            logger.info(
                f"Confidence score {confidence} is below threshold {settings.CONFIDENCE_THRESHOLD}. "
                f"Forcing EXPECTATION_MISMATCH and marking requiresManualReview=True"
            )
            root_cause = RootCauseEnum.EXPECTATION_MISMATCH.value
            requires_manual_review = True

        # 5. Log results to DynamoDB
        storage_service.save_truth_analysis(
            return_id=payload.returnId,
            product_id=payload.productId,
            customer_id=payload.customerId,
            root_cause=root_cause,
            confidence=confidence,
            evidence=evidence
        )

        # 6. Emit EventBridge RootCauseDiscovered event
        event_publisher.publish_root_cause_discovered(
            return_id=payload.returnId,
            product_id=payload.productId,
            root_cause=root_cause,
            confidence=confidence
        )

        # 7. Verify Knowledge Graph writeback on Service #12 (with retries)
        verification_success = graph_client.verify_writeback(
            return_id=payload.returnId,
            expected_root_cause=root_cause
        )
        if verification_success:
            logger.info(f"Successfully verified writeback on Service #12 for return {payload.returnId}")
        else:
            logger.error(f"Failed writeback verification on Service #12 for return {payload.returnId}")

        # 8. Formulate response
        return TruthAnalyzeResponse(
            returnId=payload.returnId,
            actualRootCause=root_cause,
            confidence=confidence,
            requiresManualReview=requires_manual_review,
            evidence=evidence
        )

    except Exception as e:
        logger.error(f"Failed to process return truth analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing Truth Discovery Engine: {str(e)}"
        )
