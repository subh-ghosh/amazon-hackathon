from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SERVICE_12_URL: str = "http://localhost:8000"
    DYNAMODB_TABLE: str = "fraud_trust_engine_table"
    EVENT_BUS_NAME: str = "circular-intelligence-bus"
    AWS_REGION: str = "us-east-1"
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
