import logging
from datetime import datetime
from typing import Dict, Any, List
import boto3
from app.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self._dynamodb = None
        self._table = None
        logger.info("StorageService initialized (lazy-loading enabled)")

    @property
    def table(self):
        """Lazy-loads the DynamoDB table client dynamically when MOCK_AWS is disabled."""
        if not settings.MOCK_AWS and self._table is None:
            logger.info("Instantiating production DynamoDB client connection")
            self._dynamodb = boto3.resource("dynamodb", region_name=settings.AWS_REGION)
            self._table = self._dynamodb.Table(settings.DYNAMODB_TABLE)
        return self._table

    def save_truth_analysis(
        self,
        return_id: str,
        product_id: str,
        customer_id: str,
        root_cause: str,
        confidence: float,
        evidence: List[Any]
    ):
        """Saves return root cause results to DynamoDB table using single-table keys."""
        
        if settings.MOCK_AWS:
            logger.info(f"Mock DB Save: {return_id} -> rootCause={root_cause}, confidence={confidence}")
            return

        try:
            from decimal import Decimal
            # Serialize structured evidence objects into dictionaries for DynamoDB List of Maps
            serialized_evidence = []
            for item in evidence:
                if hasattr(item, "model_dump"):
                    item_dict = item.model_dump()
                elif hasattr(item, "dict"):
                    item_dict = item.dict()
                elif isinstance(item, dict):
                    item_dict = item.copy()
                else:
                    item_dict = {"description": str(item), "weight": Decimal("0.0"), "type": "HEURISTIC_RULE"}
                    serialized_evidence.append(item_dict)
                    continue

                if "weight" in item_dict and isinstance(item_dict["weight"], float):
                    item_dict["weight"] = Decimal(str(item_dict["weight"]))
                serialized_evidence.append(item_dict)

            # Write key transactional logs
            self.table.put_item(
                Item={
                    "PK": f"RETURN#{return_id}",
                    "SK": "ANALYSIS#TRUTH",
                    "ProductId": product_id,
                    "CustomerId": customer_id,
                    "ActualRootCause": root_cause,
                    "Confidence": Decimal(str(confidence)),
                    "Evidence": serialized_evidence,
                    "ProcessedAt": datetime.utcnow().isoformat()
                }
            )
            logger.info(f"Successfully saved truth analysis for {return_id} in DynamoDB")
        except Exception as e:
            logger.error(f"Failed to save truth analysis record in DynamoDB: {e}")
            raise e
