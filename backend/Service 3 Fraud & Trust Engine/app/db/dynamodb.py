import boto3
import json
from decimal import Decimal
from datetime import datetime, timezone
from app.core.config import settings

class DynamoDBClient:
    def __init__(self):
        kwargs = {"region_name": settings.AWS_REGION}
        if settings.DYNAMODB_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT_URL
        self.resource = boto3.resource("dynamodb", **kwargs)
        self.table = self.resource.Table(settings.DYNAMODB_TABLE)

    def _to_dynamodb(self, payload: dict) -> dict:
        return json.loads(json.dumps(payload), parse_float=Decimal)

    def store_fraud_score(self, customer_id: str, profile_data: dict):
        item = {
            "EntityID": customer_id,
            "Timestamp": (
                profile_data.get("decision_timestamp")
                or profile_data.get("generated_at")
                or profile_data.get("timestamp")
                or datetime.now(timezone.utc).isoformat()
            ),
            "ProfileData": profile_data,
            "RiskScore": profile_data.get("fraud_score"),
            "RiskFactors": profile_data.get("risk_factors", []),
            "ModelVersion": "v1",
        }
        self.table.put_item(Item=self._to_dynamodb(item))

db_client = DynamoDBClient()
