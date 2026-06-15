from app.models.schemas import PreventionRequest
from typing import List

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(request: PreventionRequest, risk_score: int, risk_level: str) -> tuple[List[str], List[str]]:
        """
        Generates rule-based recommended actions and explanations based on the input drivers.
        Returns:
            Tuple containing:
            - recommended_actions (List[str])
            - explanation (List[str])
        """
        recommended_actions = []
        explanation = []

        # ==========================================
        # 1. Generate Explanations (Risk Drivers)
        # ==========================================
        
        # High Customer Return Rate Driver
        if request.customerReturnRate > 0.30:
            explanation.append("Your return history is elevated")
        
        # High Product Return Rate or Electronics Category Driver
        if request.category.lower() == "electronics" or request.productReturnRate > 0.15:
            explanation.append("Product category has above-average returns")
        
        # Low Product Rating Driver
        if request.productRating < 4.0:
            explanation.append("Product rating is below average")
            
        # Low Seller Rating Driver
        if request.sellerRating < 4.5:
            explanation.append("Seller rating is below average")
            
        # New Customer Driver
        if request.customerPurchaseCount < 5:
            explanation.append("You have a limited purchase history")

        # ==========================================
        # 2. Generate Recommended Actions
        # ==========================================

        # High Risk Recommendation
        if risk_level == "HIGH":
            if request.category.lower() == "electronics":
                recommended_actions.append("Verify compatibility before purchase")
            else:
                recommended_actions.append("Confirm compatibility before purchase")

        # High Customer Return Rate Recommendation
        if request.customerReturnRate >= 0.20:
            if request.category.lower() in ["electronics", "apparel", "home"]:
                recommended_actions.append("Review product dimensions")
            else:
                recommended_actions.append("Review specifications carefully")
                recommended_actions.append("Verify size and dimensions")

        # Low Seller Rating Recommendation
        if request.sellerRating < 4.8:
            if request.sellerRating < 4.5:
                recommended_actions.append("Consider another seller")
            else:
                recommended_actions.append("Check seller recommendations")

        # High Product Return Rate Recommendation
        if request.productReturnRate >= 0.20:
            recommended_actions.append("Compare alternatives")
            recommended_actions.append("Read recent reviews")

        # Low Product Rating Recommendation
        if request.productRating < 4.0:
            recommended_actions.append("Review customer feedback")

        return recommended_actions, explanation
