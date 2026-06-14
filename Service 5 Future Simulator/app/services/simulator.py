from app.models.schemas import SimulationRequest, ScenarioResult, SimulationResponse

class SimulationEngine:
    def __init__(self):
        self.scenarios = [
            "Restock As New",
            "Refurbish",
            "Return To Vendor",
            "Donate",
            "Recycle",
            "Outlet Sale"
        ]

    def run_simulation(self, request: SimulationRequest) -> SimulationResponse:
        results = []
        
        for scenario in self.scenarios:
            result = self._simulate_scenario(scenario, request)
            if result:
                results.append(result)
        
        # Sort by best combined score (Recovery Value - Carbon Impact penalty + Confidence Bonus)
        results.sort(key=lambda x: (x.recoveryValue - (x.carbonImpact * 10)) * x.confidence, reverse=True)
        
        best_scenario = results[0]
        
        return SimulationResponse(
            bestScenario=best_scenario.scenario,
            recommendedAction=best_scenario.scenario.upper().replace(" ", "_"),
            simulations=results
        )

    def _simulate_scenario(self, scenario: str, request: SimulationRequest) -> ScenarioResult:
        base_value = request.estimatedValue
        condition = request.conditionScore / 100.0
        fraud_penalty = max(0, request.fraudScore / 100.0)
        
        recovery_value = 0.0
        carbon_impact = 0.0
        processing_time = 0
        confidence = 0.0
        
        if scenario == "Restock As New":
            if condition < 0.95 or fraud_penalty > 0.2:
                return None
            recovery_value = base_value * 0.95
            carbon_impact = 2.0
            processing_time = 1
            confidence = request.sellerTrustScore * 0.95
            
        elif scenario == "Refurbish":
            if condition < 0.4:
                return None
            recovery_value = base_value * 0.75 * condition
            carbon_impact = 15.0
            processing_time = 5
            confidence = 0.85
            
        elif scenario == "Return To Vendor":
            recovery_value = base_value * 0.5
            carbon_impact = 25.0
            processing_time = 10
            confidence = request.sellerTrustScore
            
        elif scenario == "Outlet Sale":
            if condition < 0.6:
                return None
            recovery_value = base_value * 0.6 * condition
            carbon_impact = 5.0
            processing_time = 3
            confidence = 0.90
            
        elif scenario == "Donate":
            recovery_value = base_value * 0.1 # Tax write-off equivalent
            carbon_impact = 1.0
            processing_time = 7
            confidence = 0.99
            
        elif scenario == "Recycle":
            recovery_value = base_value * 0.05
            carbon_impact = -5.0 # Negative is good (carbon saved)
            processing_time = 14
            confidence = 1.0
            
        return ScenarioResult(
            scenario=scenario,
            recoveryValue=round(recovery_value, 2),
            carbonImpact=round(carbon_impact, 2),
            processingTimeDays=processing_time,
            confidence=round(confidence, 2)
        )

simulator = SimulationEngine()
