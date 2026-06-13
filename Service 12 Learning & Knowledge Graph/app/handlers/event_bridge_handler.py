"""
AWS Lambda handler for EventBridge events.

This is the CONSUMER side — deployed as a separate Lambda function that
reacts to events from other Circular OS microservices and updates the
Knowledge Graph accordingly.

Supported events:
  - ReturnCreated       → creates Return node + edges
  - RootCauseDiscovered → links Return to RootCause
  - FraudDetected       → creates FraudCase node + edges
  - RecoveryDecisionMade → creates RecoveryAction node + edges
  - ProductTwinUpdated  → updates DynamoDB digital twin
"""

import json
import logging
from datetime import datetime

from app.services.graph_service import GraphService
from app.services.metadata_service import MetadataService
from app.models.schemas import (
    ReturnCreateRequest,
    FraudCaseCreateRequest,
    RecoveryActionCreateRequest,
)
from app.models.domain import ReturnReason, FraudSeverity, RecoveryActionType

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

graph_service = GraphService()
metadata_service = MetadataService()


def handler(event: dict, context) -> dict:
    """
    Lambda entry point.
    EventBridge delivers the event with:
      - detail-type: event name
      - detail: JSON payload
    """
    detail_type = event.get("detail-type", "")
    detail = event.get("detail", {})

    logger.info(f"Received event: {detail_type}")
    logger.info(f"Payload: {json.dumps(detail, default=str)}")

    try:
        if detail_type == "ReturnCreated":
            _handle_return_created(detail)
        elif detail_type == "RootCauseDiscovered":
            _handle_root_cause_discovered(detail)
        elif detail_type == "FraudDetected":
            _handle_fraud_detected(detail)
        elif detail_type == "RecoveryDecisionMade":
            _handle_recovery_decision_made(detail)
        elif detail_type == "ProductTwinUpdated":
            _handle_product_twin_updated(detail)
        else:
            logger.warning(f"Unknown event type: {detail_type}")

        return {"statusCode": 200, "body": f"Processed {detail_type}"}

    except Exception as e:
        logger.error(f"Failed to process {detail_type}: {e}", exc_info=True)
        return {"statusCode": 500, "body": str(e)}


def _handle_return_created(detail: dict):
    """A return was created — ingest into graph + DynamoDB."""
    req = ReturnCreateRequest(
        return_id=detail["returnId"],
        order_id=detail.get("orderId", ""),
        customer_id=detail["customerId"],
        product_id=detail["productId"],
        reason=ReturnReason(detail.get("reason", "OTHER")),
        timestamp=datetime.fromisoformat(detail.get("timestamp", datetime.utcnow().isoformat())),
    )
    graph_service.create_return(req)
    metadata_service.record_return_event(req.return_id, "CREATED_VIA_EVENT", {
        "ProductID": req.product_id,
        "CustomerID": req.customer_id,
    })


def _handle_root_cause_discovered(detail: dict):
    """Link a return to its discovered root cause."""
    graph_service.link_root_cause(
        return_id=detail["returnId"],
        cause_id=detail["rootCauseId"],
        confidence=detail.get("confidenceScore", 0.0),
    )
    metadata_service.record_return_event(detail["returnId"], "ROOT_CAUSE_LINKED", {
        "RootCauseID": detail["rootCauseId"],
        "Confidence": str(detail.get("confidenceScore", 0.0)),
    })


def _handle_fraud_detected(detail: dict):
    """A fraud case was detected — create node in graph."""
    req = FraudCaseCreateRequest(
        case_id=detail["caseId"],
        entity_id=detail["entityId"],
        entity_type=detail.get("entityType", "Customer"),
        severity=FraudSeverity.HIGH,
        risk_score=detail.get("riskScore", 50),
        related_return_ids=detail.get("relatedReturnIds", []),
    )
    graph_service.create_fraud_case(req)
    metadata_service.record_fraud_score(
        entity_id=detail["entityId"],
        risk_score=detail.get("riskScore", 50),
        risk_factors=detail.get("riskFactors", []),
    )


def _handle_recovery_decision_made(detail: dict):
    """A recovery decision was made — create node + DynamoDB record."""
    req = RecoveryActionCreateRequest(
        action_id=detail["actionId"],
        return_id=detail["returnId"],
        action_type=RecoveryActionType(detail.get("decision", "LIQUIDATE")),
        estimated_value_recovered=detail.get("expectedValue", 0.0),
        cost_incurred=detail.get("costIncurred", 0.0),
    )
    graph_service.create_recovery_action(req)
    metadata_service.record_recovery_decision(
        return_id=detail["returnId"],
        action_id=detail["actionId"],
        action_type=detail.get("decision", "LIQUIDATE"),
        estimated_value=detail.get("expectedValue", 0.0),
        cost=detail.get("costIncurred", 0.0),
    )


def _handle_product_twin_updated(detail: dict):
    """Product lifecycle state changed — update DynamoDB twin."""
    metadata_service.update_product_twin(
        product_id=detail["productId"],
        status=detail.get("newStatus", "UNKNOWN"),
        location=detail.get("location", ""),
    )
