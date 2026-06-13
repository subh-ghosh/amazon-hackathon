import json
import logging
from datetime import datetime
import boto3
from app.config import settings

logger = logging.getLogger(__name__)

class EventPublisher:
    def __init__(self):
        self._client = None
        logger.info("EventPublisher initialized (lazy-loading enabled)")

    @property
    def client(self):
        """Lazy-loads the EventBridge client dynamically when MOCK_AWS is disabled."""
        if not settings.MOCK_AWS and self._client is None:
            logger.info("Instantiating production EventBridge client connection")
            self._client = boto3.client("events", region_name=settings.AWS_REGION)
        return self._client

    def publish_root_cause_discovered(
        self,
        return_id: str,
        product_id: str,
        root_cause: str,
        confidence: float,
        evidence: list = None,
        recommendations: dict = None
    ) -> bool:
        """Publishes ReturnAnalysisCompleted event to AWS EventBridge bus."""
        
        # Mapping from programmatic uppercase snake_case enums to title-case strings in the contract
        ENUM_MAP = {
            "SIZE_MISMATCH": "Wrong Size",
            "EXPECTATION_MISMATCH": "Expectation Mismatch",
            "PACKAGING_DAMAGE": "Carrier Damage",
            "COMPATIBILITY_ISSUE": "Software Compatibility",
            "SELLER_QUALITY_ISSUE": "Misleading Listing",
            "MANUFACTURING_DEFECT": "Defective Component",
            "COUNTERFEIT": "Fraud Suspected",
            "CUSTOMER_MISUSE": "Expectation Mismatch"
        }
        actual_root_cause = ENUM_MAP.get(root_cause, root_cause)

        # Fallback values if evidence and recommendations are not supplied (backward compatibility)
        if not evidence:
            evidence = [f"Automated analysis completed for return {return_id}."]
        
        if not recommendations:
            if root_cause in ["SIZE_MISMATCH", "Wrong Size"]:
                routing = "RESTOCK_AS_NEW"
                seller = "INVENT_SIZE_GUIDE"
            elif root_cause in ["COMPATIBILITY_ISSUE", "Software Compatibility"]:
                routing = "REFURBISH_PROCESS"
                seller = "UPDATE_FIRMWARE"
            elif root_cause in ["PACKAGING_DAMAGE", "Carrier Damage"]:
                routing = "LIQUIDATE"
                seller = "CONTACT_CARRIER"
            else:
                routing = "RESTOCK_AS_NEW"
                seller = "UPDATE_LISTING_PHOTOS"
            
            recommendations = {
                "routingAction": routing,
                "sellerAction": seller
            }

        event_payload = {
            "returnId": return_id,
            "productId": product_id,
            "actualRootCause": actual_root_cause,
            "confidence": confidence,
            "evidence": evidence,
            "recommendations": recommendations,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

        if settings.MOCK_AWS:
            logger.info(f"Mock Event Publish: DetailType=ReturnAnalysisCompleted, Payload={json.dumps(event_payload)}")
            return True

        try:
            response = self.client.put_events(
                Entries=[
                    {
                        "Source": "aws.circular.intelligence.tde",
                        "DetailType": "ReturnAnalysisCompleted",
                        "Detail": json.dumps(event_payload),
                        "EventBusName": settings.EVENT_BUS_NAME
                    }
                ]
            )
            
            # Check if any events failed to publish
            failed_count = response.get("FailedEntryCount", 0)
            if failed_count > 0:
                logger.error(f"Failed to publish EventBridge event. Details: {response}")
                return False
                
            logger.info(f"Published ReturnAnalysisCompleted event successfully for return: {return_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error publishing EventBridge notification: {e}")
            return False
