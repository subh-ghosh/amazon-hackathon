from app.models.schemas import LogisticsRequest, LogisticsResponse, Warehouse
from typing import Tuple

# Cost per km by decision type (INR/km)
COST_PER_KM = {
    "RESTOCK_AS_NEW": 3.5,
    "REFURBISH": 4.0,
    "OUTLET_SALE": 3.0,
    "RETURN_TO_VENDOR": 5.0,
    "DONATE": 2.0,
    "RECYCLE": 2.5,
}

# Route templates by decision type
ROUTE_TEMPLATES = {
    "RESTOCK_AS_NEW":    "{customer} → {city} Hub → Restock Center",
    "REFURBISH":         "{customer} → {city} Hub → Refurb Center",
    "OUTLET_SALE":       "{customer} → {city} Hub → Outlet Store",
    "RETURN_TO_VENDOR":  "{customer} → {city} Hub → Vendor Return Dock",
    "DONATE":            "{customer} → {city} Hub → Donation Partner",
    "RECYCLE":           "{customer} → {city} Hub → Recycling Facility",
}

# Max km for "good" carbon score (100% at 0km, 0% at MAX_KM)
MAX_KM_FOR_CARBON = 2000.0


def _compute_scores(wh: Warehouse, decision: str) -> Tuple[float, float, float, float, float, float]:
    """
    Returns (carbon_score, speed_score, cost_efficiency, composite_score, estimated_cost, estimated_days)
    for a given warehouse and decision type.
    """
    # Carbon score: inversely proportional to distance (0-100)
    carbon_score = max(0.0, 100.0 - (wh.distanceKm / MAX_KM_FOR_CARBON) * 100.0)

    # Speed score: closer = faster (1 day per 500 km, min 1 day)
    estimated_days = max(1, int(wh.distanceKm / 500) + 1)
    speed_score = max(0.0, 100.0 - (estimated_days - 1) * 20.0)

    # Cost efficiency: lower cost = higher score
    rate = COST_PER_KM.get(decision, 4.0)
    estimated_cost = round(wh.distanceKm * rate, 2)
    # Normalise cost: assume max expected cost = MAX_KM_FOR_CARBON * max_rate (5.0)
    max_expected_cost = MAX_KM_FOR_CARBON * 5.0
    cost_efficiency = max(0.0, 100.0 - (estimated_cost / max_expected_cost) * 100.0)

    # Capacity score is already 0-100 directly
    capacity_score = wh.capacity

    # Composite score per formula
    composite = (
        capacity_score  * 0.25 +
        carbon_score    * 0.25 +
        speed_score     * 0.25 +
        cost_efficiency * 0.25
    )

    return carbon_score, speed_score, cost_efficiency, composite, estimated_cost, estimated_days


class LogisticsOptimizer:

    def optimize(self, request: LogisticsRequest) -> LogisticsResponse:
        decision = request.recommendedDecision.upper()
        route_tpl = ROUTE_TEMPLATES.get(decision, "{customer} → {city} Hub → Processing Center")

        best_wh = None
        best_score = float("-inf")
        best_carbon_score = 0.0
        best_cost = 0.0
        best_days = 1

        for wh in request.warehouses:
            carbon_score, speed_score, cost_efficiency, composite, estimated_cost, estimated_days = \
                _compute_scores(wh, decision)

            if composite > best_score:
                best_score = composite
                best_wh = wh
                best_carbon_score = carbon_score
                best_cost = estimated_cost
                best_days = estimated_days

        # Build dynamic reasoning
        reasoning = []
        all_distances = [w.distanceKm for w in request.warehouses]
        all_capacities = [w.capacity for w in request.warehouses]

        if best_wh.distanceKm == min(all_distances):
            reasoning.append("Lowest transport cost")
            reasoning.append("Shortest route")
        if best_wh.capacity == max(all_capacities):
            reasoning.append("Available warehouse capacity")
        if best_carbon_score >= 80:
            reasoning.append("High carbon efficiency")
        if not reasoning:
            reasoning.append("Best overall logistics score")

        route = route_tpl.format(customer=request.customerLocation, city=best_wh.city)

        return LogisticsResponse(
            recommendedWarehouse=best_wh.warehouseId,
            recommendedRoute=route,
            estimatedCost=best_cost,
            estimatedDays=best_days,
            carbonScore=round(best_carbon_score, 2),
            reasoning=reasoning,
        )


optimizer = LogisticsOptimizer()
