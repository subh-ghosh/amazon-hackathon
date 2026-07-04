import json
from decimal import Decimal
from typing import Any, Dict, Optional

import boto3

from app.config import settings


def _to_dynamodb(value: Any) -> Any:
    return json.loads(json.dumps(value), parse_float=Decimal)


def _from_dynamodb(value: Any) -> Any:
    if isinstance(value, list):
        return [_from_dynamodb(item) for item in value]
    if isinstance(value, dict):
        return {key: _from_dynamodb(item) for key, item in value.items()}
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    return value


class CircularRoutingPersistence:
    def __init__(self):
        kwargs: Dict[str, Any] = {"region_name": settings.AWS_REGION}
        if settings.DYNAMODB_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT_URL

        resource = boto3.resource("dynamodb", **kwargs)
        self._decisions = resource.Table(settings.DYNAMODB_DECISIONS_TABLE)
        self._analytics = resource.Table(settings.DYNAMODB_ANALYTICS_TABLE)
        self._audit = resource.Table(settings.DYNAMODB_AUDIT_TABLE)

    def _empty_analytics(self) -> Dict[str, Any]:
        return {
            "totalOptimizations": 0,
            "totalCostSavings": 0.0,
            "totalCO2Saved": 0.0,
            "totalCircularity": 0.0,
            "facilityUtilization": {},
            "recoveryPathDistribution": {},
        }

    def log_audit(self, entry: Dict[str, Any]) -> None:
        self._audit.put_item(Item=_to_dynamodb({"auditId": f"{entry['timestamp']}#{entry['event']}", **entry}))

    def put_decision(self, decision_id: str, response: Dict[str, Any]) -> None:
        self._decisions.put_item(Item=_to_dynamodb({"decisionId": decision_id, "response": response}))

    def get_decision(self, decision_id: str) -> Optional[Dict[str, Any]]:
        response = self._decisions.get_item(Key={"decisionId": decision_id})
        item = response.get("Item")
        return _from_dynamodb(item.get("response")) if item else None

    def get_analytics(self) -> Dict[str, Any]:
        response = self._analytics.get_item(Key={"metricId": "global"})
        item = response.get("Item")
        if not item:
            return self._empty_analytics()
        normalized = _from_dynamodb(item)
        normalized.pop("metricId", None)
        return normalized

    def put_analytics(self, analytics: Dict[str, Any]) -> None:
        self._analytics.put_item(Item=_to_dynamodb({"metricId": "global", **analytics}))


persistence = CircularRoutingPersistence()
