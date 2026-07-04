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


class ReturnlessPersistence:
    def __init__(self):
        kwargs: Dict[str, Any] = {"region_name": settings.AWS_REGION}
        if settings.DYNAMODB_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT_URL

        resource = boto3.resource("dynamodb", **kwargs)
        self._decisions = resource.Table(settings.DYNAMODB_DECISIONS_TABLE)
        self._jobs = resource.Table(settings.DYNAMODB_JOBS_TABLE)
        self._rate_limits = resource.Table(settings.DYNAMODB_RATE_LIMITS_TABLE)
        self._analytics = resource.Table(settings.DYNAMODB_ANALYTICS_TABLE)

    def _empty_analytics(self) -> Dict[str, Any]:
        return {
            "totalEvaluations": 0,
            "decisionDistribution": {
                "RETURNLESS_REFUND": 0,
                "RETURN_REQUIRED": 0,
                "PARTIAL_REFUND": 0,
                "REFUND_AND_DONATE": 0,
                "REFUND_AND_RECYCLE": 0,
                "MANUAL_REVIEW": 0,
            },
            "totalRefundValue": 0.0,
            "totalEstimatedSavings": 0.0,
            "totalCO2Saved": 0.0,
            "totalWasteDiverted": 0.0,
            "fraudPreventionStatistics": {
                "manualReviewCount": 0,
                "totalOrderValueShielded": 0.0,
            },
        }

    def get_decision(self, request_id: str) -> Optional[Dict[str, Any]]:
        response = self._decisions.get_item(Key={"requestId": request_id})
        item = response.get("Item")
        return _from_dynamodb(item.get("response")) if item else None

    def put_decision(self, request_id: str, customer_id: str, response: Dict[str, Any]) -> None:
        self._decisions.put_item(Item=_to_dynamodb({
            "requestId": request_id,
            "customerId": customer_id,
            "response": response,
        }))

    def get_customer_history(self, customer_id: str) -> list[str]:
        response = self._decisions.scan(
            FilterExpression="customerId = :customer_id",
            ExpressionAttributeValues={":customer_id": customer_id},
        )
        items = [_from_dynamodb(item) for item in response.get("Items", [])]
        return [item["response"]["decision"] for item in items if item.get("response", {}).get("decision")]

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        response = self._jobs.get_item(Key={"jobId": job_id})
        item = response.get("Item")
        return _from_dynamodb(item) if item else None

    def put_job(self, job: Dict[str, Any]) -> None:
        self._jobs.put_item(Item=_to_dynamodb(job))

    def update_job(self, job_id: str, updates: Dict[str, Any]) -> None:
        job = self.get_job(job_id) or {"jobId": job_id}
        job.update(updates)
        self.put_job(job)

    def get_rate_limit(self, client_ip: str) -> Optional[Dict[str, Any]]:
        response = self._rate_limits.get_item(Key={"clientIp": client_ip})
        item = response.get("Item")
        return _from_dynamodb(item) if item else None

    def put_rate_limit(self, client_ip: str, state: Dict[str, Any]) -> None:
        self._rate_limits.put_item(Item=_to_dynamodb({"clientIp": client_ip, **state}))

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

    def reset_analytics(self) -> None:
        self.put_analytics(self._empty_analytics())

    def clear(self) -> None:
        self.reset_analytics()


persistence = ReturnlessPersistence()
