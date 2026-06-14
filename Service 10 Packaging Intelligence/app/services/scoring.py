from app.models.schemas import PackagingRequest
import math
from typing import Dict, Any

class ScoringEngine:
    # Baseline material sustainability scores (0-100)
    MATERIAL_SUSTAINABILITY = {
        "cardboard": 100,
        "paper": 100,
        "corrugated": 100,
        "corrugated cardboard": 100,
        "biodegradable plastic": 85,
        "bioplastic": 85,
        "wood": 80,
        "bamboo": 80,
        "glass": 70,
        "metal": 70,
        "recycled plastic": 60,
        "plastic": 20,
        "polyethylene": 20,
        "bubble wrap": 20,
        "styrofoam": 0,
        "eps": 0,
        "expanded polystyrene": 0
    }

    # Recyclability scores (0-100)
    RECYCLABILITY_SCORES = {
        "cardboard": 100,
        "paper": 100,
        "corrugated": 100,
        "corrugated cardboard": 100,
        "bamboo": 95,
        "wood": 90,
        "glass": 80,
        "metal": 80,
        "recycled plastic": 70,
        "plastic": 40,
        "polyethylene": 40,
        "bubble wrap": 40,
        "styrofoam": 0,
        "eps": 0,
        "expanded polystyrene": 0
    }

    # CO2 Emission Factors (kg CO2 per kg material)
    CO2_EMISSION_FACTORS = {
        "styrofoam": 3.5,
        "eps": 3.5,
        "expanded polystyrene": 3.5,
        "plastic": 3.0,
        "polyethylene": 3.0,
        "bubble wrap": 3.0,
        "recycled plastic": 1.5,
        "glass": 1.2,
        "metal": 2.0,
        "biodegradable plastic": 1.2,
        "bioplastic": 1.2,
        "cardboard": 0.9,
        "paper": 0.9,
        "corrugated": 0.9,
        "corrugated cardboard": 0.9,
        "wood": 0.5,
        "bamboo": 0.5
    }

    # Category average density values (g/cm³) for empty space volume estimation
    CATEGORY_DENSITIES = {
        "electronics": 1.5,
        "apparel": 0.3,
        "home": 0.8,
        "books": 1.0,
        "food": 0.9
    }

    @classmethod
    def calculate_scores(cls, request: PackagingRequest) -> Dict[str, Any]:
        material = request.packagingMaterial.lower().strip()
        category = request.category.lower().strip()

        # ---------------------------------------------
        # 1. Recyclability Score (0-100)
        # ---------------------------------------------
        recyclability_score = cls.RECYCLABILITY_SCORES.get(material, 50)

        # ---------------------------------------------
        # 2. Sustainability Score (0-100)
        # ---------------------------------------------
        s_material = cls.MATERIAL_SUSTAINABILITY.get(material, 40)
        
        # Weight Ratio: Packaging Weight / Product Weight
        r_weight = request.packagingWeight / request.productWeight
        if r_weight <= 0.1:
            s_weight = 100.0
        else:
            s_weight = max(0.0, 100.0 - (r_weight - 0.1) * 150.0)

        raw_sustainability = 0.4 * s_material + 0.3 * s_weight + 0.3 * recyclability_score
        
        # Hard Cap at 50 for plastic-based materials or Styrofoam
        is_plastic_or_styrofoam = any(
            p_keyword in material 
            for p_keyword in ["plastic", "polyethylene", "bubble wrap", "styrofoam", "eps", "polystyrene"]
        )
        if is_plastic_or_styrofoam:
            sustainability_score = round(min(50.0, raw_sustainability))
        else:
            sustainability_score = round(raw_sustainability)

        # ---------------------------------------------
        # 3. Packaging Efficiency Score (0-100)
        # ---------------------------------------------
        # Package volume in cm³
        v_pkg = request.length * request.width * request.height
        
        # Carrier Dimensional Weight (DimWeight, standard denominator = 5000)
        dim_weight = v_pkg / 5000.0
        
        # Dimension Ratio: DimWeight / ProductWeight
        ratio_dim = dim_weight / request.productWeight
        if ratio_dim <= 1.2:
            s_volume = 100.0
        else:
            s_volume = max(0.0, 100.0 - (ratio_dim - 1.2) * 50.0)

        # Empty Space Ratio calculation
        # Approximate product volume: weight in grams / density in g/cm³
        density = cls.CATEGORY_DENSITIES.get(category, 1.0)
        v_product_est = (request.productWeight * 1000.0) / density
        
        empty_space_ratio = max(0.0, 1.0 - (v_product_est / v_pkg))
        if empty_space_ratio <= 0.3:
            s_emptyspace = 100.0
        else:
            s_emptyspace = max(0.0, 100.0 - (empty_space_ratio - 0.3) * 142.8)

        packaging_efficiency_score = round(0.5 * s_volume + 0.5 * s_emptyspace)

        # ---------------------------------------------
        # 4. Carbon Impact Score (0-100)
        # ---------------------------------------------
        ef = cls.CO2_EMISSION_FACTORS.get(material, 2.0)
        co2_emissions = request.packagingWeight * ef
        
        # Higher score = lower carbon footprint. Emits 5kg of CO2 -> score 0
        carbon_impact_score = max(0, round(100.0 - (co2_emissions * 20.0)))

        # ---------------------------------------------
        # 5. Confidence Score (0.0 - 1.0)
        # ---------------------------------------------
        confidence = 1.00

        # Unrecognized material penalty
        if material not in cls.MATERIAL_SUSTAINABILITY:
            confidence -= 0.15
            
        # Unrecognized category penalty
        if category not in cls.CATEGORY_DENSITIES:
            confidence -= 0.05
            
        # Outlier payload detection
        has_heavy_weight = request.productWeight > 100.0
        has_large_dimensions = (
            request.length > 100.0 or 
            request.width > 100.0 or 
            request.height > 100.0
        )
        if has_heavy_weight or has_large_dimensions:
            confidence -= 0.10

        confidence = round(max(0.10, confidence), 2)

        return {
            "sustainabilityScore": sustainability_score,
            "packagingEfficiencyScore": packaging_efficiency_score,
            "carbonImpactScore": carbon_impact_score,
            "recyclabilityScore": recyclability_score,
            "confidence": confidence,
            "emptySpaceRatio": empty_space_ratio,
            "ratioDim": ratio_dim,
            "rWeight": r_weight
        }
