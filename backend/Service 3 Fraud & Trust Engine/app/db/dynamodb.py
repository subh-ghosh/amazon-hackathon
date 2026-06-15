import boto3
from app.core.config import settings

# Mock DynamoDB for hackathon fallbacks if not configured
class DynamoDBClient:
    def __init__(self):
        self.mock_store = {}
        try:
            self.client = boto3.client('dynamodb', region_name=settings.AWS_REGION)
        except:
            self.client = None

    def store_fraud_score(self, customer_id: str, profile_data: dict):
        pk = f"CUSTOMER#{customer_id}"
        sk = "RISK#PROFILE"
        self.mock_store[f"{pk}_{sk}"] = profile_data
        if self.client:
            # Add actual boto3 put_item here if in AWS
            pass

db_client = DynamoDBClient()
