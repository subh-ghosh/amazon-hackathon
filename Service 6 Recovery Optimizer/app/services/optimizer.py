from app.models.schemas import OptimizeRequest, OptimizeResponse

class RecoveryOptimizer:
    def optimize(self, request: OptimizeRequest) -> OptimizeResponse:
        best_scenario = None
        best_score = float('-inf')
        best_reasoning = []
        
        fraud_penalty = request.fraudScore > 70
        trust_penalty = request.sellerTrustScore < 0.5
        
        for sim in request.simulations:
            reasoning = []
            
            # Base variables
            rec_val = sim.recoveryValue
            carbon_savings = -sim.carbonImpact
            conf = sim.confidence
            proc_days = sim.processingTimeDays
            
            # Adjustments
            if trust_penalty:
                conf = conf * 0.8
                reasoning.append("Confidence reduced due to low seller trust")
                
            if fraud_penalty and rec_val > 5000:
                rec_val = rec_val * 0.5
                reasoning.append("High fraud risk heavily penalized expensive recovery path")
                
            if sim.scenario in ["Recycle", "Donate"]:
                carbon_savings += 50 # Sustainability bonus
                reasoning.append("Sustainability bonus applied")
                
            # Core formula
            score = (rec_val * 0.50) + (carbon_savings * 0.20) + (conf * 100 * 0.20) - (proc_days * 10 * 0.10)
            
            if score > best_score:
                best_score = score
                best_scenario = sim
                
                # Dynamic reasoning generation for the best scenario
                current_best_reasoning = []
                if sim.recoveryValue >= max([s.recoveryValue for s in request.simulations]):
                    current_best_reasoning.append("Highest recovery value")
                if sim.carbonImpact <= min([s.carbonImpact for s in request.simulations]):
                    current_best_reasoning.append("Best carbon impact")
                elif sim.carbonImpact < 20:
                    current_best_reasoning.append("Acceptable carbon impact")
                
                if not fraud_penalty:
                    current_best_reasoning.append("Low fraud risk")
                    
                best_reasoning = current_best_reasoning + reasoning

        if not best_reasoning:
            best_reasoning.append("Selected as the optimal mathematical baseline")

        return OptimizeResponse(
            recommendedDecision=best_scenario.scenario.upper().replace(" ", "_"),
            expectedProfit=best_scenario.recoveryValue,
            carbonSavings=-best_scenario.carbonImpact,
            processingDays=best_scenario.processingTimeDays,
            confidence=best_scenario.confidence,
            reasoning=best_reasoning
        )

optimizer = RecoveryOptimizer()
