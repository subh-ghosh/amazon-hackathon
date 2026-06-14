import logging
from datetime import datetime
from typing import Dict, Any, Optional
import boto3
from app.config import settings

logger = logging.getLogger(__name__)

class DynamoDBService:
    def __init__(self):
        if not settings.MOCK_AWS_SERVICES:
            self.dynamodb = boto3.resource("dynamodb", region_name=settings.AWS_REGION)
            self.table = self.dynamodb.Table(settings.DYNAMODB_TABLE)
            logger.info("DynamoDB connection initialized in Production mode")
        else:
            self.dynamodb = None
            self.table = None
            logger.info("DynamoDBService initialized in MOCK mode")

    def get_customer_risk_profile(self, customer_id: str) -> Dict[str, Any]:
        """Fetches aggregate customer return limits, previous trust levels, and return rates."""
        if settings.MOCK_AWS_SERVICES:
            return self._get_mock_customer_profile(customer_id)

        try:
            response = self.table.get_item(
                Key={
                    "PK": f"CUSTOMER#{customer_id}",
                    "SK": "RISK#PROFILE"
                }
            )
            if "Item" in response:
                item = response["Item"]
                return {
                    "trustScore": float(item.get("TrustScore", 0.9)),
                    "fraudIndex": float(item.get("FraudIndex", 0.05)),
                    "status": item.get("Status", "ACTIVE"),
                    "totalReturns": int(item.get("TotalReturns", 0)),
                    "totalOrders": int(item.get("TotalOrders", 1))
                }
        except Exception as e:
            logger.error(f"Error querying customer profile from DynamoDB: {e}")
            
        return self._get_mock_customer_profile(customer_id)

    def save_fraud_scoring(self, return_id: str, customer_id: str, scores: Dict[str, Any]):
        """Saves return analysis scores and updates the customer profile counters."""
        if settings.MOCK_AWS_SERVICES:
            logger.info(f"Mock Save: Saved scores for return {return_id} of customer {customer_id}")
            return

        try:
            # Save the transaction log
            self.table.put_item(
                Item={
                    "PK": f"RETURN#{return_id}",
                    "SK": "ANALYSIS#FRAUD",
                    "CustomerId": customer_id,
                    "FraudScore": str(scores["fraudScore"]),
                    "TrustScore": str(scores["trustScore"]),
                    "RiskLevel": scores["riskLevel"],
                    "RecommendedAction": scores["recommendedAction"],
                    "RiskFactors": scores.get("riskFactors", []),
                    "ProcessedAt": datetime.utcnow().isoformat()
                }
            )

            # Update customer return profile metrics atomically
            self.table.update_item(
                Key={
                    "PK": f"CUSTOMER#{customer_id}",
                    "SK": "RISK#PROFILE"
                },
                UpdateExpression="ADD TotalReturns :val1, ReturnVolumeValue :val2 SET LastUpdated = :time",
                ExpressionAttributeValues={
                    ":val1": 1,
                    ":val2": 1, # Increment count
                    ":time": datetime.utcnow().isoformat()
                }
            )
            logger.info(f"Successfully updated risk profile for {customer_id} in DynamoDB")
        except Exception as e:
            logger.error(f"Failed to record fraud scoring in DynamoDB: {e}")

    def _get_mock_customer_profile(self, customer_id: str) -> Dict[str, Any]:
        """Provides realistic mock customer profiles for testing."""
        if customer_id == "CUST-10928":
            return {
                "trustScore": 0.20,
                "fraudIndex": 0.78,
                "status": "FLAGGED",
                "totalReturns": 14,
                "totalOrders": 17 # High return rate: 82%!
            }
        return {
            "trustScore": 0.95,
            "fraudIndex": 0.02,
            "status": "ACTIVE",
            "totalReturns": 1,
            "totalOrders": 45
        }
