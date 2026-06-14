import os
try:
    from pydantic import BaseSettings
except ImportError:
    from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Fraud & Trust Engine"
    AWS_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    
    # DynamoDB
    DYNAMODB_TABLE: str = os.getenv("DYNAMODB_TABLE", "CircularIntelOSStore")
    
    # Neptune Graph
    NEPTUNE_ENDPOINT: str = os.getenv("NEPTUNE_ENDPOINT", "mock-neptune.us-east-1.neptune.amazonaws.com")
    NEPTUNE_PORT: int = int(os.getenv("NEPTUNE_PORT", "8182"))
    
    # Bedrock Vision Model
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
    
    # S3 Bucket
    S3_BUCKET: str = os.getenv("S3_BUCKET", "amazon-circular-intel-returns")
    
    # EventBridge
    EVENT_BUS_NAME: str = os.getenv("EVENT_BUS_NAME", "default")
    
    # Dev Mode Configuration (Local Mocking)
    MOCK_AWS_SERVICES: bool = os.getenv("MOCK_AWS_SERVICES", "true").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
