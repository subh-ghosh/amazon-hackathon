import os
try:
    from pydantic import BaseSettings
except ImportError:
    from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Truth Discovery Engine"
    AWS_REGION: str = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
    
    # Service #12 Graph Intelligence Endpoint
    GRAPH_SERVICE_URL: str = os.getenv("GRAPH_SERVICE_URL", "http://localhost:8012")
    
    # DynamoDB
    DYNAMODB_TABLE: str = os.getenv("DYNAMODB_TABLE", "CircularIntelOSStore")
    
    # EventBridge
    EVENT_BUS_NAME: str = os.getenv("EVENT_BUS_NAME", "default")
    
    # Bedrock configuration
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
    
    # Confidence threshold for manual review fallbacks
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
    
    # Local Mocks for Testing / Sandbox runs
    MOCK_AWS: bool = os.getenv("MOCK_AWS", "false").lower() == "true"
    MOCK_BEDROCK: bool = os.getenv("MOCK_BEDROCK", "false").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
