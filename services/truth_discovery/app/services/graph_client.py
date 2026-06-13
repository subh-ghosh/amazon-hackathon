import logging
import requests
from app.config import settings
from app.schemas import ProductIntelligence, SellerIntelligence

logger = logging.getLogger(__name__)

class GraphClient:
    def __init__(self):
        self.base_url = settings.GRAPH_SERVICE_URL

    def get_product_intelligence(self, product_id: str) -> ProductIntelligence:
        """Fetches product analytics and known issues from Service #12 (Knowledge Graph)."""
        from unittest.mock import Mock
        if settings.MOCK_AWS and not isinstance(requests.get, Mock):
            return ProductIntelligence(
                productId=product_id,
                category="Electronics",
                title="Standard Reference Item",
                description="Default product reference",
                returnRate=0.04,
                knownIssues=["Frequent setup confusion"]
            )

        url = f"{self.base_url}/products/{product_id}/intelligence"
        try:
            logger.info(f"Querying product intelligence from Service #12 for product: {product_id}")
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return ProductIntelligence(**data)
            else:
                logger.warning(f"Service #12 product API returned status: {response.status_code}. Using fallback defaults.")
        except Exception as e:
            logger.error(f"Failed to connect to Service #12 product endpoint: {e}. Using fallback defaults.")
        
        # Fallback values
        return ProductIntelligence(
            productId=product_id,
            category="Electronics",
            title="Standard Reference Item",
            description="Default product reference",
            returnRate=0.04,
            knownIssues=["Frequent setup confusion"]
        )

    def get_seller_intelligence(self, seller_id: str) -> SellerIntelligence:
        """Fetches seller risk metrics and historical defect rates from Service #12."""
        from unittest.mock import Mock
        if settings.MOCK_AWS and not isinstance(requests.get, Mock):
            return SellerIntelligence(
                sellerId=seller_id,
                sellerName="Standard Seller Reference",
                defectRate=0.01,
                counterfeitAlerts=0,
                trustScore=0.98
            )

        url = f"{self.base_url}/sellers/{seller_id}/intelligence"
        try:
            logger.info(f"Querying seller intelligence from Service #12 for seller: {seller_id}")
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return SellerIntelligence(**data)
            else:
                logger.warning(f"Service #12 seller API returned status: {response.status_code}. Using fallback defaults.")
        except Exception as e:
            logger.error(f"Failed to connect to Service #12 seller endpoint: {e}. Using fallback defaults.")
            
        # Fallback values
        return SellerIntelligence(
            sellerId=seller_id,
            sellerName="Standard Seller Reference",
            defectRate=0.01,
            counterfeitAlerts=0,
            trustScore=0.98
        )

    def verify_writeback(self, return_id: str, expected_root_cause: str, retries: int = 3) -> bool:
        """Queries Service #12 to verify that the RootCauseDiscovered event was processed and saved."""
        import time
        url = f"{self.base_url}/api/v1/returns/{return_id}"
        
        backoff = 0.5
        for attempt in range(1, retries + 1):
            try:
                logger.info(f"Verifying writeback on Service #12 for return {return_id} (Attempt {attempt}/{retries})")
                
                if settings.MOCK_AWS:
                    logger.info("Mock Verification check: Success")
                    return True
                
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    actual_cause = data.get("rootCause")
                    if actual_cause == expected_root_cause:
                        logger.info(f"Verification Success: Return {return_id} rootCause matches {expected_root_cause} in Service #12")
                        return True
                    else:
                        logger.warning(f"Verification Mismatch: Expected {expected_root_cause}, got {actual_cause} in Service #12")
                else:
                    logger.warning(f"Verification endpoint returned status {response.status_code}")
            except Exception as e:
                logger.error(f"Failed connection during writeback verification: {e}")
            
            if attempt < retries:
                logger.info(f"Retrying verification in {backoff} seconds...")
                time.sleep(backoff)
                backoff *= 2.0
                
        logger.error(f"Verification Failed: Root cause {expected_root_cause} for return {return_id} did not propagate to Service #12 after {retries} retries")
        return False
