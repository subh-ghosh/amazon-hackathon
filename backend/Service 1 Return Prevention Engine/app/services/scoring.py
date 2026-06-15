from app.models.schemas import PreventionRequest

class ScoringEngine:
    @staticmethod
    def calculate_scores(request: PreventionRequest) -> tuple[int, str, float]:
        """
        Calculates the risk score, risk level, and confidence for a purchase.
        Returns:
            Tuple containing:
            - return_risk_score (int)
            - risk_level (str)
            - confidence (float)
        """
        # 1. Calculate Component Risk Scores
        # S_cr = min(100, (customerReturnRate / 0.35) * 100)
        s_cr = min(100.0, (request.customerReturnRate / 0.35) * 100.0)

        # S_pr = min(100, (productReturnRate / 0.18) * 100)
        s_pr = min(100.0, (request.productReturnRate / 0.18) * 100.0)

        # S_sr = (5.0 - sellerRating) * 20
        s_sr = (5.0 - request.sellerRating) * 20.0

        # S_ur = (5.0 - productRating) * 20
        s_ur = (5.0 - request.productRating) * 20.0

        # S_ph = max(0, 100 - (customerPurchaseCount * 2.5))
        s_ph = max(0.0, 100.0 - (request.customerPurchaseCount * 2.5))

        # 2. Compute Final Weighted Score
        risk_score_float = (
            0.35 * s_cr +
            0.30 * s_pr +
            0.15 * s_sr +
            0.10 * s_ur +
            0.10 * s_ph
        )
        return_risk_score = round(risk_score_float)

        # 3. Determine Risk Level
        if return_risk_score < 40:
            risk_level = "LOW"
        elif return_risk_score < 70:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        # 4. Calculate Confidence Score
        confidence = 0.80
        if request.customerPurchaseCount >= 20:
            confidence += 0.05
        if request.productRating >= 4.0:
            confidence += 0.03
        if request.sellerRating >= 4.5:
            confidence += 0.03
        
        confidence = round(min(1.00, confidence), 2)

        return return_risk_score, risk_level, confidence
