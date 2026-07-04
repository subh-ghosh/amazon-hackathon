import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    DYNAMODB_ENDPOINT_URL: str | None = os.getenv("DYNAMODB_ENDPOINT_URL", None)
    DYNAMODB_DECISIONS_TABLE: str = os.getenv("DYNAMODB_DECISIONS_TABLE", "CircularOS-ReturnlessDecisions")
    DYNAMODB_JOBS_TABLE: str = os.getenv("DYNAMODB_JOBS_TABLE", "CircularOS-ReturnlessJobs")
    DYNAMODB_RATE_LIMITS_TABLE: str = os.getenv("DYNAMODB_RATE_LIMITS_TABLE", "CircularOS-ReturnlessRateLimits")
    DYNAMODB_ANALYTICS_TABLE: str = os.getenv("DYNAMODB_ANALYTICS_TABLE", "CircularOS-ReturnlessAnalytics")


settings = Settings()
