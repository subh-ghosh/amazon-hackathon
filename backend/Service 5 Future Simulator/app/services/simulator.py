"""
Future Simulator — generates recovery scenarios based on item characteristics.

Each scenario's viability and economics depend on:
- Item condition (can it be restocked? refurbished? only recycled?)
- Item value (is refurbishment cost-effective?)
- Category (electronics can be refurbished, food cannot)
- Fraud risk (high fraud = don't invest in expensive recovery)
- Seller trust (low trust = vendor return less viable)
"""

from app.models.schemas import SimulationRequest, ScenarioResult, SimulationResponse


# Category-specific recovery multipliers
# These reflect real-world economics: electronics hold value well,
# clothing depreciates fast, furniture is expensive to ship
CATEGORY_MULTIPLIERS = {
    "electronics": {"restock": 0.92, "refurbish": 0.75, "outlet": 0.65, "vendor": 0.50, "donate": 0.10, "recycle": 0.05},
    "smart home": {"restock": 0.90, "refurbish": 0.72, "outlet": 0.60, "vendor": 0.45, "donate": 0.10, "recycle": 0.05},
    "streaming": {"restock": 0.88, "refurbish": 0.65, "outlet": 0.55, "vendor": 0.40, "donate": 0.10, "recycle": 0.04},
    "e-readers": {"restock": 0.90, "refurbish": 0.70, "outlet": 0.60, "vendor": 0.45, "donate": 0.10, "recycle": 0.05},
    "footwear": {"restock": 0.85, "refurbish": 0.55, "outlet": 0.50, "vendor": 0.35, "donate": 0.15, "recycle": 0.03},
    "clothing": {"restock": 0.80, "refurbish": 0.45, "outlet": 0.40, "vendor": 0.30, "donate": 0.15, "recycle": 0.02},
    "home appliance": {"restock": 0.88, "refurbish": 0.70, "outlet": 0.55, "vendor": 0.40, "donate": 0.08, "recycle": 0.06},
    "furniture": {"restock": 0.85, "refurbish": 0.60, "outlet": 0.50, "vendor": 0.30, "donate": 0.12, "recycle": 0.04},
    "kitchen": {"restock": 0.90, "refurbish": 0.65, "outlet": 0.55, "vendor": 0.40, "donate": 0.10, "recycle": 0.05},
}

# Default if category not found
DEFAULT_MULTIPLIERS = {"restock": 0.85, "refurbish": 0.65, "outlet": 0.55, "vendor": 0.40, "donate": 0.10, "recycle": 0.04}

# Carbon impact by scenario (kg CO2) — refurbishment uses energy, recycling saves material
CARBON_IMPACTS = {
    "Restock As New": 2.0,
    "Refurbish": 12.0,
    "Outlet Sale": 4.0,
    "Return To Vendor": 22.0,
    "Donate": 1.5,
    "Recycle": -4.0,  # negative = saves carbon
}

# Processing days by scenario
PROCESSING_DAYS = {
    "Restock As New": 1,
    "Refurbish": 5,
    "Outlet Sale": 2,
    "Return To Vendor": 10,
    "Donate": 3,
    "Recycle": 7,
}


class SimulationEngine:
    def __init__(self):
        self.scenarios = [
            "Restock As New",
            "Refurbish",
            "Outlet Sale",
            "Donate",
            "Recycle",
            "Return To Vendor",
        ]

    def run_simulation(self, request: SimulationRequest) -> SimulationResponse:
        results = []
        category = request.category.lower().strip()
        multipliers = CATEGORY_MULTIPLIERS.get(category, DEFAULT_MULTIPLIERS)

        for scenario in self.scenarios:
            result = self._simulate_scenario(scenario, request, multipliers)
            if result:
                results.append(result)

        # Sort by recovery value * confidence (best economic outcome first)
        results.sort(key=lambda x: x.recoveryValue * x.confidence, reverse=True)

        best_scenario = results[0] if results else ScenarioResult(
            scenario="Recycle", recoveryValue=0, carbonImpact=-4, processingTimeDays=7, confidence=1.0
        )

        return SimulationResponse(
            bestScenario=best_scenario.scenario,
            recommendedAction=best_scenario.scenario.upper().replace(" ", "_"),
            simulations=results
        )

    def _simulate_scenario(self, scenario: str, request: SimulationRequest, multipliers: dict) -> ScenarioResult | None:
        base_value = request.estimatedValue
        condition = request.conditionScore / 100.0
        utility = request.utilityScore / 100.0
        fraud_risk = request.fraudScore / 100.0
        seller_trust = request.sellerTrustScore

        recovery_value = 0.0
        confidence = 0.0

        if scenario == "Restock As New":
            # Only viable if item is in near-perfect condition
            if condition < 0.90:
                return None
            if fraud_risk > 0.3:
                return None  # Don't restock potentially fraudulent returns
            recovery_value = base_value * multipliers["restock"] * condition
            confidence = min(0.98, seller_trust * 0.95 + 0.03)

        elif scenario == "Refurbish":
            # Viable if condition is above minimum repair threshold
            if condition < 0.30:
                return None  # Too damaged to refurbish economically
            # Recovery depends on both condition and utility
            refurb_factor = multipliers["refurbish"] * (0.5 + 0.5 * utility)
            recovery_value = base_value * refurb_factor
            # Lower confidence for lower condition items
            confidence = max(0.60, 0.85 * condition + 0.10)

        elif scenario == "Outlet Sale":
            # Viable if condition is decent
            if condition < 0.55:
                return None
            recovery_value = base_value * multipliers["outlet"] * condition
            confidence = 0.88 + (condition - 0.55) * 0.1

        elif scenario == "Return To Vendor":
            # Always possible but depends on seller trust
            if seller_trust < 0.3:
                return None  # Seller won't accept it back
            recovery_value = base_value * multipliers["vendor"] * seller_trust
            confidence = seller_trust * 0.9

        elif scenario == "Donate":
            # Always viable — tax write-off value
            recovery_value = base_value * multipliers["donate"]
            confidence = 0.99

        elif scenario == "Recycle":
            # Always viable — material recovery value
            recovery_value = base_value * multipliers["recycle"]
            confidence = 1.0

        # Apply fraud penalty to expensive recovery paths
        if fraud_risk > 0.6 and recovery_value > 50:
            recovery_value *= (1.0 - fraud_risk * 0.5)
            confidence *= 0.7

        carbon = CARBON_IMPACTS.get(scenario, 5.0)
        days = PROCESSING_DAYS.get(scenario, 5)

        return ScenarioResult(
            scenario=scenario,
            recoveryValue=round(max(0, recovery_value), 2),
            carbonImpact=round(carbon, 2),
            processingTimeDays=days,
            confidence=round(min(1.0, max(0.1, confidence)), 2)
        )


simulator = SimulationEngine()
