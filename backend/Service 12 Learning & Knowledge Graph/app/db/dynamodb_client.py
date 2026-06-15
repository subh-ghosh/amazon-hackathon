"""
Amazon DynamoDB Client — manages all four tables:
  - ReturnEvents
  - ProductTwinReferences
  - FraudScores
  - RecoveryDecisions
"""

import logging
from datetime import datetime
from typing import Any

import boto3
from botocore.exceptions import ClientError

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class DynamoDBClient:
    """Thin wrapper over Boto3 DynamoDB resource for the four service tables."""

    def __init__(self):
        self._resource = boto3.resource("dynamodb", region_name=settings.AWS_REGION)

    # ── Table References ─────────────────────────

    @property
    def return_events_table(self):
        return self._resource.Table(settings.DYNAMODB_TABLE_RETURN_EVENTS)

    @property
    def product_twins_table(self):
        return self._resource.Table(settings.DYNAMODB_TABLE_PRODUCT_TWINS)

    @property
    def fraud_scores_table(self):
        return self._resource.Table(settings.DYNAMODB_TABLE_FRAUD_SCORES)

    @property
    def recovery_decisions_table(self):
        return self._resource.Table(settings.DYNAMODB_TABLE_RECOVERY_DECISIONS)

    # ═══════════════════════════════════════════════
    #  ReturnEvents   PK=ReturnID  SK=Timestamp
    # ═══════════════════════════════════════════════

    def put_return_event(self, return_id: str, event_type: str, payload: dict) -> None:
        """Append an immutable event to the ReturnEvents timeline."""
        try:
            self.return_events_table.put_item(Item={
                "ReturnID": return_id,
                "Timestamp": datetime.utcnow().isoformat(),
                "EventType": event_type,
                **payload,
            })
        except ClientError as e:
            logger.error(f"DynamoDB put_return_event failed: {e}")
            raise

    def get_return_timeline(self, return_id: str) -> list[dict]:
        """Fetch all events for a given return, ordered by timestamp."""
        try:
            resp = self.return_events_table.query(
                KeyConditionExpression="ReturnID = :rid",
                ExpressionAttributeValues={":rid": return_id},
                ScanIndexForward=True,  # ascending time
            )
            return resp.get("Items", [])
        except ClientError as e:
            logger.error(f"DynamoDB get_return_timeline failed: {e}")
            return []

    # ═══════════════════════════════════════════════
    #  ProductTwinReferences   PK=ProductID  SK=RecordType
    # ═══════════════════════════════════════════════

    def put_product_twin(self, product_id: str, record_type: str, data: dict) -> None:
        """Create or update a product digital twin record."""
        try:
            self.product_twins_table.put_item(Item={
                "ProductID": product_id,
                "RecordType": record_type,
                "UpdatedAt": datetime.utcnow().isoformat(),
                **data,
            })
        except ClientError as e:
            logger.error(f"DynamoDB put_product_twin failed: {e}")
            raise

    def get_product_twin(self, product_id: str, record_type: str = "METADATA") -> dict | None:
        """Fetch a specific record for a product twin."""
        try:
            resp = self.product_twins_table.get_item(Key={
                "ProductID": product_id,
                "RecordType": record_type,
            })
            return resp.get("Item")
        except ClientError as e:
            logger.error(f"DynamoDB get_product_twin failed: {e}")
            return None

    # ═══════════════════════════════════════════════
    #  FraudScores   PK=EntityID  SK=Timestamp
    # ═══════════════════════════════════════════════

    def put_fraud_score(self, entity_id: str, risk_score: int,
                        risk_factors: list[str], model_version: str = "v1") -> None:
        """Record a fraud risk score for a customer, seller, or product."""
        try:
            self.fraud_scores_table.put_item(Item={
                "EntityID": entity_id,
                "Timestamp": datetime.utcnow().isoformat(),
                "RiskScore": risk_score,
                "RiskFactors": risk_factors,
                "ModelVersion": model_version,
            })
        except ClientError as e:
            logger.error(f"DynamoDB put_fraud_score failed: {e}")
            raise

    def get_latest_fraud_score(self, entity_id: str) -> dict | None:
        """Get the most recent fraud score for an entity."""
        try:
            resp = self.fraud_scores_table.query(
                KeyConditionExpression="EntityID = :eid",
                ExpressionAttributeValues={":eid": entity_id},
                ScanIndexForward=False,  # descending — latest first
                Limit=1,
            )
            items = resp.get("Items", [])
            return items[0] if items else None
        except ClientError as e:
            logger.error(f"DynamoDB get_latest_fraud_score failed: {e}")
            return None

    # ═══════════════════════════════════════════════
    #  RecoveryDecisions   PK=ReturnID  SK=RecoveryActionID
    # ═══════════════════════════════════════════════

    def put_recovery_decision(self, return_id: str, action_id: str, data: dict) -> None:
        """Record a recovery decision for a return."""
        try:
            self.recovery_decisions_table.put_item(Item={
                "ReturnID": return_id,
                "RecoveryActionID": action_id,
                "DecisionTimestamp": datetime.utcnow().isoformat(),
                **data,
            })
        except ClientError as e:
            logger.error(f"DynamoDB put_recovery_decision failed: {e}")
            raise

    def get_recovery_decisions(self, return_id: str) -> list[dict]:
        """Fetch all recovery decisions for a return."""
        try:
            resp = self.recovery_decisions_table.query(
                KeyConditionExpression="ReturnID = :rid",
                ExpressionAttributeValues={":rid": return_id},
            )
            return resp.get("Items", [])
        except ClientError as e:
            logger.error(f"DynamoDB get_recovery_decisions failed: {e}")
            return []


# ── Singleton ────────────────────────────────────

_dynamodb_client: DynamoDBClient | None = None


def get_dynamodb_client() -> DynamoDBClient:
    """Return global DynamoDBClient singleton."""
    global _dynamodb_client
    if _dynamodb_client is None:
        _dynamodb_client = DynamoDBClient()
    return _dynamodb_client
