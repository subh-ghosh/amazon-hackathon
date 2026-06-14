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

        url = f"{self.base_url}/api/v1/intelligence/products/{product_id}"
        try:
            logger.info(f"Querying product intelligence from Service #12 for product: {product_id}")
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                
                # Adapt and map responses: Support both snake_case (Service #12) and camelCase (legacy/mocks)
                mapped_data = {}
                mapped_data["productId"] = data.get("productId") or data.get("product_id")
                mapped_data["category"] = data.get("category") or "General"
                mapped_data["title"] = data.get("title") or ""
                mapped_data["description"] = data.get("description") or ""
                
                if "returnRate" in data:
                    mapped_data["returnRate"] = data["returnRate"]
                elif "return_rate_percentage" in data:
                    mapped_data["returnRate"] = data["return_rate_percentage"]
                else:
                    mapped_data["returnRate"] = 0.0
                
                if "knownIssues" in data:
                    mapped_data["knownIssues"] = data["knownIssues"]
                elif "top_root_causes" in data:
                    mapped_data["knownIssues"] = [
                        rc.get("category")
                        for rc in data["top_root_causes"]
                        if isinstance(rc, dict) and rc.get("category")
                    ]
                else:
                    mapped_data["knownIssues"] = []
                
                return ProductIntelligence(**mapped_data)
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

        url = f"{self.base_url}/api/v1/intelligence/sellers/{seller_id}"
        try:
            logger.info(f"Querying seller intelligence from Service #12 for seller: {seller_id}")
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                
                # Adapt and map responses: Support both snake_case (Service #12) and camelCase (legacy/mocks)
                mapped_data = {}
                mapped_data["sellerId"] = data.get("sellerId") or data.get("seller_id")
                mapped_data["sellerName"] = data.get("sellerName") or data.get("seller_name") or ""
                
                if "defectRate" in data:
                    mapped_data["defectRate"] = data["defectRate"]
                elif "return_rate_percentage" in data:
                    mapped_data["defectRate"] = data["return_rate_percentage"]
                else:
                    mapped_data["defectRate"] = 0.0
                
                if "counterfeitAlerts" in data:
                    mapped_data["counterfeitAlerts"] = data["counterfeitAlerts"]
                elif "associated_fraud_cases" in data:
                    mapped_data["counterfeitAlerts"] = data["associated_fraud_cases"]
                else:
                    mapped_data["counterfeitAlerts"] = 0
                
                if "trustScore" in data:
                    mapped_data["trustScore"] = data["trustScore"]
                elif "fraud_risk_level" in data:
                    risk_level = str(data["fraud_risk_level"]).upper()
                    risk_to_score = {
                        "LOW": 0.9,
                        "MEDIUM": 0.6,
                        "HIGH": 0.3,
                        "CRITICAL": 0.1
                    }
                    mapped_data["trustScore"] = risk_to_score.get(risk_level, 0.9)
                else:
                    mapped_data["trustScore"] = 1.0
                
                return SellerIntelligence(**mapped_data)
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
                    
                    # Backwards compatibility check: handle both actual Service #12 (root_causes array)
                    # and legacy/mock formats (rootCause field)
                    root_causes = data.get("root_causes", [])
                    actual_causes = [rc.get("category") for rc in root_causes if isinstance(rc, dict) and rc.get("category")]
                    
                    legacy_cause = data.get("rootCause")
                    if legacy_cause:
                        actual_causes.append(legacy_cause)
                    
                    # Normalize strings for comparison
                    def normalize(s):
                        return s.replace("_", "").replace(" ", "").lower() if s else ""
                    
                    normalized_expected = normalize(expected_root_cause)
                    match_found = any(normalize(c) == normalized_expected for c in actual_causes if c)
                    
                    if match_found:
                        logger.info(f"Verification Success: Return {return_id} rootCause matches {expected_root_cause} in Service #12")
                        return True
                    else:
                        logger.warning(f"Verification Mismatch: Expected {expected_root_cause}, got {actual_causes or legacy_cause} in Service #12")
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
