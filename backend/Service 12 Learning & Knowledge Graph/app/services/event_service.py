"""
Event Service — publishes domain events to Amazon EventBridge.

Every state change in the Knowledge Graph emits an event so other
microservices in the Circular Intelligence OS can react.
"""

import json
import logging
from datetime import datetime

import boto3
from botocore.exceptions import ClientError

from app.core.config import get_settings
from app.core.exceptions import EventPublishException

logger = logging.getLogger(__name__)
settings = get_settings()


class EventService:
    """Publishes structured events to the EventBridge bus."""

    def __init__(self):
        self._client = boto3.client("events", region_name=settings.AWS_REGION)
        self._bus_name = settings.EVENTBRIDGE_BUS_NAME
        self._source = settings.EVENTBRIDGE_SOURCE

    def _publish(self, detail_type: str, detail: dict) -> str:
        """
        Core publish method.
        Returns the EventBridge event ID on success.
        """
        try:
            response = self._client.put_events(Entries=[{
                "Source": self._source,
                "DetailType": detail_type,
                "Detail": json.dumps(detail, default=str),
                "EventBusName": self._bus_name,
            }])
            failed = response.get("FailedEntryCount", 0)
            if failed > 0:
                logger.error(f"EventBridge: {failed} entries failed for {detail_type}")
                raise EventPublishException(f"Failed to publish {detail_type}")

            event_id = response["Entries"][0]["EventId"]
            logger.info(f"EventBridge: Published {detail_type} -> {event_id}")
            return event_id

        except ClientError as e:
            logger.error(f"EventBridge publish error: {e}")
            raise EventPublishException(str(e))

    # ═══════════════════════════════════════════════
    #  Domain Events
    # ═══════════════════════════════════════════════

    def emit_return_created(self, return_id: str, product_id: str,
                            customer_id: str, reason: str) -> str:
        return self._publish("ReturnCreated", {
            "returnId": return_id,
            "productId": product_id,
            "customerId": customer_id,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def emit_root_cause_discovered(self, return_id: str, root_cause_id: str,
                                    confidence_score: float) -> str:
        return self._publish("RootCauseDiscovered", {
            "returnId": return_id,
            "rootCauseId": root_cause_id,
            "confidenceScore": confidence_score,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def emit_fraud_detected(self, entity_id: str, entity_type: str,
                            case_id: str, risk_score: int) -> str:
        return self._publish("FraudDetected", {
            "entityId": entity_id,
            "entityType": entity_type,
            "caseId": case_id,
            "riskScore": risk_score,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def emit_recovery_decision_made(self, return_id: str, action_id: str,
                                     decision: str, expected_value: float) -> str:
        return self._publish("RecoveryDecisionMade", {
            "returnId": return_id,
            "actionId": action_id,
            "decision": decision,
            "expectedValue": expected_value,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def emit_product_twin_updated(self, product_id: str, new_status: str,
                                   location: str) -> str:
        return self._publish("ProductTwinUpdated", {
            "productId": product_id,
            "newStatus": new_status,
            "location": location,
            "timestamp": datetime.utcnow().isoformat(),
        })
