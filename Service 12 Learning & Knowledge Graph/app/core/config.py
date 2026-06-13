"""
Centralized configuration — loaded from environment variables.
All AWS resource names, endpoints, and feature flags live here.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Service ──────────────────────────────────
    PROJECT_NAME: str = "Knowledge Graph Service"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    API_V1_PREFIX: str = "/api/v1"

    # ── Amazon Neptune ───────────────────────────
    NEPTUNE_ENDPOINT: str = "localhost"
    NEPTUNE_PORT: int = 8182
    NEPTUNE_USE_IAM: bool = False

    # ── Amazon DynamoDB ──────────────────────────
    AWS_REGION: str = "us-east-1"
    DYNAMODB_TABLE_RETURN_EVENTS: str = "CircularOS-ReturnEvents"
    DYNAMODB_TABLE_PRODUCT_TWINS: str = "CircularOS-ProductTwinReferences"
    DYNAMODB_TABLE_FRAUD_SCORES: str = "CircularOS-FraudScores"
    DYNAMODB_TABLE_RECOVERY_DECISIONS: str = "CircularOS-RecoveryDecisions"

    # ── Amazon EventBridge ───────────────────────
    EVENTBRIDGE_BUS_NAME: str = "circular-intelligence-bus"
    EVENTBRIDGE_SOURCE: str = "circular-os.knowledge-graph"

    # ── Amazon S3 ────────────────────────────────
    S3_BUCKET_GRAPH_EXPORTS: str = "circular-os-graph-exports"

    @property
    def neptune_wss_url(self) -> str:
        """WebSocket Secure URL for Gremlin connections."""
        protocol = "ws" if self.NEPTUNE_ENDPOINT == "localhost" else "wss"
        return f"{protocol}://{self.NEPTUNE_ENDPOINT}:{self.NEPTUNE_PORT}/gremlin"

    @property
    def neptune_https_url(self) -> str:
        """HTTPS URL for openCypher queries."""
        protocol = "http" if self.NEPTUNE_ENDPOINT == "localhost" else "https"
        return f"{protocol}://{self.NEPTUNE_ENDPOINT}:{self.NEPTUNE_PORT}/openCypher"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton — avoids re-parsing env on every request."""
    return Settings()
