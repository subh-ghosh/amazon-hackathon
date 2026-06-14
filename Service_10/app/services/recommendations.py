from app.models.schemas import PackagingRequest
from typing import List, Dict, Any, Tuple

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(
        request: PackagingRequest, 
        scores: Dict[str, Any]
    ) -> Tuple[List[str], List[str]]:
        """
        Generates actionable recommendations and explanations based on the analysis scores.
        """
        recommendations = []
        explanations = []

        material = request.packagingMaterial.lower().strip()

        # ==========================================
        # 1. Explanations (Key Drivers)
        # ==========================================
        
        # High Packaging Weight explanation
        if scores["rWeight"] > 0.3:
            explanations.append("Packaging weight exceeds recommended threshold of 30% of product weight")
            
        # Low Recyclability explanation
        if scores["recyclabilityScore"] < 70:
            explanations.append("Material has low recyclability")
            
        # Significant Empty Space explanation
        if scores["emptySpaceRatio"] > 0.5:
            explanations.append("Significant empty space detected inside the packaging")
            
        # Low Sustainability explanation
        if scores["sustainabilityScore"] < 50:
            explanations.append("Packaging materials are not environmentally sustainable")
            
        # High Carbon Footprint explanation
        if scores["carbonImpactScore"] < 50:
            explanations.append("High estimated carbon footprint due to packaging material or weight")

        # ==========================================
        # 2. Recommendations
        # ==========================================
        
        # Oversized Packaging / Dimension Optimization recommendation
        if scores["ratioDim"] > 1.5 or scores["emptySpaceRatio"] > 0.5:
            recommendations.append("Oversized packaging detected. Optimize package dimensions to reduce empty space and shipping volume")
            
        # Poor Sustainability / Material Replacement / Reduce plastic usage recommendation
        is_plastic_or_styrofoam = any(
            p_keyword in material 
            for p_keyword in ["plastic", "polyethylene", "bubble wrap", "styrofoam", "eps", "polystyrene"]
        )
        if is_plastic_or_styrofoam:
            recommendations.append("Reduce plastic usage by transitioning to paper or cardboard packaging")
            
        # Low Recyclability / Styrofoam warning recommendation
        if "styrofoam" in material or "eps" in material:
            recommendations.append("Avoid Styrofoam (EPS) due to extremely low recyclability and high environmental persistence")
            
        # High Packaging Weight / Waste Reduction recommendation
        if scores["rWeight"] > 0.2:
            recommendations.append("Reduce packaging weight relative to product weight")
            
        # Low Recyclability recommendation
        if scores["recyclabilityScore"] < 70:
            recommendations.append("Use highly recyclable materials like cardboard, paper, or bamboo")
            
        # High Carbon Impact recommendation
        if scores["carbonImpactScore"] < 50:
            recommendations.append("Use materials with lower carbon footprints to reduce emissions")

        # Positive optimization recommendation (if all scores are high)
        all_optimized = (
            scores["sustainabilityScore"] >= 80 and
            scores["packagingEfficiencyScore"] >= 80 and
            scores["carbonImpactScore"] >= 80 and
            scores["recyclabilityScore"] >= 80
        )
        if all_optimized and not recommendations:
            recommendations.append("Packaging design is highly optimized for sustainability and efficiency")

        return recommendations, explanations
