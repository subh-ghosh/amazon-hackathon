import boto3
from botocore.exceptions import ClientError
from app.config import settings
from typing import Optional, Dict, Any

class DynamoDBService:
    def __init__(self):
        # Allow endpoint override for local testing (moto)
        kwargs = {"region_name": settings.AWS_REGION}
        if settings.DYNAMODB_ENDPOINT_URL:
            kwargs["endpoint_url"] = settings.DYNAMODB_ENDPOINT_URL
            
        self.dynamodb = boto3.resource('dynamodb', **kwargs)
        self.table_name = settings.DYNAMODB_TABLE_NAME
        self.table = self.dynamodb.Table(self.table_name)
        
    def get_item(self, product_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.table.get_item(Key={'productId': product_id})
            return response.get('Item')
        except ClientError as e:
            print(f"Error getting item: {e}")
            return None

    def put_item(self, item: Dict[str, Any]) -> bool:
        import json
        from decimal import Decimal
        # Convert floats to Decimals
        item_decimal = json.loads(json.dumps(item), parse_float=Decimal)
        try:
            self.table.put_item(Item=item_decimal)
            return True
        except ClientError as e:
            print(f"Error putting item: {e}")
            return False

dynamodb_service = DynamoDBService()
