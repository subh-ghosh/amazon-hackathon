import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    DYNAMODB_ENDPOINT_URL: str | None = os.getenv("DYNAMODB_ENDPOINT_URL", None)
    DYNAMODB_DECISIONS_TABLE: str = os.getenv("DYNAMODB_DECISIONS_TABLE", "CircularOS-CircularRoutingDecisions")
    DYNAMODB_ANALYTICS_TABLE: str = os.getenv("DYNAMODB_ANALYTICS_TABLE", "CircularOS-CircularRoutingAnalytics")
    DYNAMODB_AUDIT_TABLE: str = os.getenv("DYNAMODB_AUDIT_TABLE", "CircularOS-CircularRoutingAudit")


settings = Settings()
