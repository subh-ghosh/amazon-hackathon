import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DYNAMODB_TABLE_NAME: str = os.getenv("DYNAMODB_TABLE_NAME", "ProductDigitalTwin")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "local")
    DYNAMODB_ENDPOINT_URL: str | None = os.getenv("DYNAMODB_ENDPOINT_URL", None)

settings = Settings()
