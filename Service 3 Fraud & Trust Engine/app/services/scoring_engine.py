from app.models.schemas import FraudScoreRequest, FraudScoreResponse
from app.clients.service12_client import service12
from app.services.graph_analysis import graph_analyzer
from app.services.vision_analysis import vision_analyzer

class ScoringEngine:
    def calculate_score(self, req: FraudScoreRequest) -> FraudScoreResponse:
        score = 0
        factors = []
        
        # Wardrobing +30
        vision_indicators = vision_analyzer.analyze_images(req.images)
        if "USED_CONDITION" in vision_indicators:
            score += 30
            factors.append("Wardrobing Detected")
            
        if "EMPTY_BOX" in vision_indicators:
            score += 50
            factors.append("Empty Box Fraud")

        # Return Rate > 50%
        history = service12.get_customer_history(req.customer_id)
        if history.get("return_rate", 0) > 0.5:
            score += 20
            factors.append("High Return Rate")

        # Shared Device +20
        if graph_analyzer.analyze_device_sharing(req.customer_id, req.device_id):
            score += 20
            factors.append("Shared Device Detected")

        # Shared Payment +20
        if graph_analyzer.analyze_payment_sharing(req.customer_id, req.payment_method_hash):
            score += 20
            factors.append("Shared Payment Method Detected")

        # High Risk Seller +10
        # Placeholder seller_id (needs to be fetched from product graph)
        seller_intel = service12.get_seller_intelligence("SELL-123")
        if seller_intel.get("risk_level") == "HIGH":
            score += 10
            factors.append("High Risk Seller")

        # Cap
        score = min(score, 100)
        trust_score = 100 - score
        
        if score < 30:
            risk_level = "LOW"
            action = "AUTO_APPROVE"
        elif score < 60:
            risk_level = "MEDIUM"
            action = "INSPECT_RETURN"
        else:
            risk_level = "HIGH"
            action = "MANUAL_REVIEW"

        return FraudScoreResponse(
            fraud_score=score,
            trust_score=trust_score,
            risk_level=risk_level,
            recommended_action=action,
            risk_factors=factors
        )

scoring_engine = ScoringEngine()
