"""
Recovery Optimizer — Selects the best recovery path for a returned item.

Scoring formula considers:
- Recovery value (how much money we get back)
- Carbon efficiency (negative carbon = good, but proportional to item value)
- Confidence (how likely this path succeeds)
- Processing speed (faster = better, penalize slow paths)
- Fraud risk (penalize high-value paths when fraud is suspected)
- Seller trust (reduce confidence when seller is unreliable)

The formula is designed so that:
- High-value items in good condition → RESELL or OUTLET SALE
- Repairable items → REFURBISH
- Low-value items where shipping > value → DONATE or RECYCLE
- Damaged beyond repair → RECYCLE
- Fraud-flagged items → penalize expensive recovery
"""

from app.models.schemas import OptimizeRequest, OptimizeResponse


class RecoveryOptimizer:
    def optimize(self, request: OptimizeRequest) -> OptimizeResponse:
        best_scenario = None
        best_score = float('-inf')
        best_reasoning: list[str] = []

        fraud_penalty = request.fraudScore > 70
        trust_penalty = request.sellerTrustScore < 0.5

        # Get the max recovery value across all scenarios for normalization
        max_recovery = max((s.recoveryValue for s in request.simulations), default=1.0)
        if max_recovery == 0:
            max_recovery = 1.0

        for sim in request.simulations:
            reasoning: list[str] = []

            # --- Base metrics ---
            recovery = sim.recoveryValue
            carbon = sim.carbonImpact  # positive = bad (emissions), negative = good (savings)
            conf = sim.confidence
            days = sim.processingTimeDays

            # --- Adjustments for risk ---
            if trust_penalty:
                conf = conf * 0.8
                reasoning.append("Confidence reduced due to low seller trust")

            if fraud_penalty and recovery > 100:
                recovery = recovery * 0.5
                reasoning.append("High fraud risk penalizes expensive recovery")

            # --- Scoring formula ---
            # Recovery value is the primary driver (normalized to 0-100 scale)
            recovery_score = (recovery / max_recovery) * 100

            # Carbon: small bonus for negative impact (savings), small penalty for positive
            # Proportional — not a flat bonus. Max ±15 points.
            carbon_score = max(-15, min(15, -carbon * 0.5))

            # Confidence bonus (0-20 points)
            confidence_score = conf * 20

            # Speed bonus: faster processing gets more points (0-10)
            speed_score = max(0, 10 - days)

            # Sustainability bonus for donate/recycle — BUT only when recovery value is low
            # This ensures donation only wins for low-value items, not high-value ones
            sustainability_bonus = 0
            if sim.scenario.lower() in ["recycle", "donate"]:
                # Only meaningful if the item's recovery value is low relative to max
                value_ratio = recovery / max_recovery if max_recovery > 0 else 0
                if value_ratio < 0.3:
                    sustainability_bonus = 12  # significant bonus for low-value items
                    reasoning.append("Sustainability bonus (low recovery value item)")
                elif value_ratio < 0.5:
                    sustainability_bonus = 5  # small bonus
                    reasoning.append("Minor sustainability bonus applied")
                # No bonus for high-value items — reselling them is better for everyone

            # --- Final score ---
            score = (
                recovery_score * 0.50 +      # Recovery value dominates
                confidence_score * 0.20 +    # Confidence matters
                speed_score * 0.15 +         # Speed matters
                carbon_score * 0.10 +        # Carbon is a factor, not the driver
                sustainability_bonus * 0.05  # Sustainability is a tiebreaker, not a winner
            )

            if score > best_score:
                best_score = score
                best_scenario = sim

                # Build reasoning for best
                best_reasoning = []
                if sim.recoveryValue >= max_recovery * 0.9:
                    best_reasoning.append("Highest recovery value")
                elif sim.recoveryValue >= max_recovery * 0.6:
                    best_reasoning.append("Strong recovery value")

                if sim.carbonImpact <= 0:
                    best_reasoning.append("Positive carbon impact")
                elif sim.carbonImpact <= 5:
                    best_reasoning.append("Acceptable carbon impact")

                if conf >= 0.9:
                    best_reasoning.append("High confidence path")

                if days <= 3:
                    best_reasoning.append("Fast processing")

                if not fraud_penalty:
                    best_reasoning.append("Low fraud risk")

                best_reasoning.extend(reasoning)

        if not best_reasoning:
            best_reasoning.append("Selected as optimal based on combined scoring")

        return OptimizeResponse(
            recommendedDecision=best_scenario.scenario.upper().replace(" ", "_"),
            expectedProfit=best_scenario.recoveryValue,
            carbonSavings=-best_scenario.carbonImpact,
            processingDays=best_scenario.processingTimeDays,
            confidence=best_scenario.confidence,
            reasoning=best_reasoning
        )


optimizer = RecoveryOptimizer()
