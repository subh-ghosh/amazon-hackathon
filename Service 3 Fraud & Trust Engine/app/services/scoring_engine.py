from app.models.schemas import FraudScoreRequest, FraudScoreResponse
from app.clients.service12_client import service12
from app.services.graph_analysis import graph_analyzer
from app.services.vision_analysis import vision_analyzer
from app.core.logging import logger

class ScoringEngine:
    def calculate_score(self, req: FraudScoreRequest) -> FraudScoreResponse:
        score = 0
        factors = []
        
        # Capability 7: Visual Return Inspection
        vision_indicators = vision_analyzer.analyze_images(req.images)
        
        # Capability 1: Wardrobing Detection
        if "USED_CONDITION" in vision_indicators or "WEAR_INDICATORS" in req.images:
            score += 30
            factors.append("Wardrobing Detected")
            
        if "EMPTY_BOX" in vision_indicators:
            score += 50
            factors.append("Empty Box Fraud")

        # Capability 2: Serial Return Abuse Detection
        history = service12.get_customer_history(req.customer_id)
        if history.get("return_rate", 0) > 0.5:
            score += 20
            factors.append("High Return Rate (Serial Abuse)")

        # Capability 3 & 6: Shared Device & Fraud Ring Detection
        if graph_analyzer.analyze_device_sharing(req.customer_id, req.device_id):
            score += 20
            factors.append("Shared Device Detected (Fraud Ring Indicator)")

        # Capability 4: Shared Payment Method Detection
        if graph_analyzer.analyze_payment_sharing(req.customer_id, req.payment_method_hash):
            score += 20
            factors.append("Shared Payment Method Detected")

        # Capability 5: High Risk Seller Detection
        seller_intel = service12.get_seller_intelligence("SELL-123")
        if seller_intel.get("risk_level") == "HIGH":
            score += 10
            factors.append("High Risk Seller")

        # Capability 8: Trust Score Generation
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

        logger.info(f"Score calculated: Fraud={score}, Trust={trust_score}, Risk={risk_level}")
        return FraudScoreResponse(
            fraud_score=score,
            trust_score=trust_score,
            risk_level=risk_level,
            recommended_action=action,
            risk_factors=factors
        )

scoring_engine = ScoringEngine()
