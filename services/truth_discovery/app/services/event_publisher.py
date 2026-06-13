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
        confidence: float
    ) -> bool:
        """Publishes RootCauseDiscovered event to AWS EventBridge bus."""
        
        event_payload = {
            "returnId": return_id,
            "productId": product_id,
            "rootCause": root_cause,
            "confidence": confidence,
            "timestamp": datetime.utcnow().isoformat()
        }

        if settings.MOCK_AWS:
            logger.info(f"Mock Event Publish: DetailType=RootCauseDiscovered, Payload={json.dumps(event_payload)}")
            return True

        try:
            response = self.client.put_events(
                Entries=[
                    {
                        "Source": "aws.circular.intelligence.tde",
                        "DetailType": "RootCauseDiscovered",
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
                
            logger.info(f"Published RootCauseDiscovered event successfully for return: {return_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error publishing EventBridge notification: {e}")
            return False
