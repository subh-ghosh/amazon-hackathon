"""
Metadata Service — coordinates DynamoDB reads/writes for supplementary
data that doesn't belong in the graph (event timelines, fraud scores, etc.).
"""

import logging

from app.db.dynamodb_client import get_dynamodb_client, DynamoDBClient

logger = logging.getLogger(__name__)


class MetadataService:
    """Business logic layer over DynamoDB tables."""

    def __init__(self):
        self.dynamo: DynamoDBClient = get_dynamodb_client()

    # ── Return Events ────────────────────────────

    def record_return_event(self, return_id: str, event_type: str, payload: dict) -> None:
        """Append an event to the return's immutable timeline."""
        self.dynamo.put_return_event(return_id, event_type, payload)
        logger.info(f"DDB: Recorded {event_type} for Return {return_id}")

    def get_return_timeline(self, return_id: str) -> list[dict]:
        """Retrieve the full event timeline for a return."""
        return self.dynamo.get_return_timeline(return_id)

    # ── Product Twins ────────────────────────────

    def update_product_twin(self, product_id: str, status: str, location: str) -> None:
        """Update the digital twin state for a product."""
        self.dynamo.put_product_twin(product_id, "STATE#CURRENT", {
            "LifecycleStage": status,
            "CurrentLocation": location,
        })
        logger.info(f"DDB: Updated ProductTwin {product_id} -> {status}")

    def get_product_twin(self, product_id: str) -> dict | None:
        """Get current digital twin state."""
        return self.dynamo.get_product_twin(product_id, "STATE#CURRENT")

    # ── Fraud Scores ─────────────────────────────

    def record_fraud_score(self, entity_id: str, risk_score: int,
                           risk_factors: list[str]) -> None:
        """Store a new fraud risk score."""
        self.dynamo.put_fraud_score(entity_id, risk_score, risk_factors)
        logger.info(f"DDB: Recorded fraud score {risk_score} for {entity_id}")

    def get_fraud_score(self, entity_id: str) -> dict | None:
        """Get latest fraud score for an entity."""
        return self.dynamo.get_latest_fraud_score(entity_id)

    # ── Recovery Decisions ───────────────────────

    def record_recovery_decision(self, return_id: str, action_id: str,
                                  action_type: str, estimated_value: float,
                                  cost: float) -> None:
        """Record a recovery decision for a return."""
        self.dynamo.put_recovery_decision(return_id, action_id, {
            "ActionType": action_type,
            "EstimatedValueRecovered": str(estimated_value),
            "CostIncurred": str(cost),
            "Status": "PENDING",
        })
        logger.info(f"DDB: Recovery decision {action_id} for Return {return_id}")

    def get_recovery_decisions(self, return_id: str) -> list[dict]:
        """Get all recovery decisions for a return."""
        return self.dynamo.get_recovery_decisions(return_id)
