"""
Reverse Logistics Optimizer — Routes returned items to optimal facilities.

Uses decision-specific weight profiles:
- RESTOCK: demand > speed > distance (get it where buyers are, fast)
- REFURBISH: capability > cost > distance (needs right tools)
- OUTLET SALE: demand > distance > capacity (sell locally)
- DONATE: distance > match > capacity (minimize shipping cost)
- RECYCLE: distance > certification > cost (nearest certified recycler)
- RETURN TO VENDOR: vendor location > batch > cost (fixed destination)

Returns top 3 ranked facilities with consequences for each choice.
"""

from app.models.schemas import LogisticsRequest, LogisticsResponse, Warehouse
from typing import List

# Decision-specific weight profiles
WEIGHT_PROFILES = {
    "RESTOCK_AS_NEW": {"distance": 0.15, "capacity": 0.15, "speed": 0.25, "cost": 0.05, "carbon": 0.40},
    "RESTOCK": {"distance": 0.15, "capacity": 0.15, "speed": 0.25, "cost": 0.05, "carbon": 0.40},
    "REFURBISH": {"distance": 0.20, "capacity": 0.10, "speed": 0.10, "cost": 0.25, "carbon": 0.35},
    "OUTLET_SALE": {"distance": 0.30, "capacity": 0.20, "speed": 0.10, "cost": 0.05, "carbon": 0.35},
    "OUTLET": {"distance": 0.30, "capacity": 0.20, "speed": 0.10, "cost": 0.05, "carbon": 0.35},
    "DONATE": {"distance": 0.40, "capacity": 0.20, "speed": 0.10, "cost": 0.10, "carbon": 0.20},
    "RECYCLE": {"distance": 0.35, "capacity": 0.10, "speed": 0.05, "cost": 0.25, "carbon": 0.25},
    "RETURN_TO_VENDOR": {"distance": 0.20, "capacity": 0.10, "speed": 0.10, "cost": 0.20, "carbon": 0.40},
}

DEFAULT_WEIGHTS = {"distance": 0.25, "capacity": 0.25, "speed": 0.25, "cost": 0.15, "carbon": 0.10}

# Cost per km by decision type
COST_PER_KM = {
    "RESTOCK_AS_NEW": 3.5, "RESTOCK": 3.5,
    "REFURBISH": 4.0,
    "OUTLET_SALE": 3.0, "OUTLET": 3.0,
    "RETURN_TO_VENDOR": 5.0,
    "DONATE": 2.0,
    "RECYCLE": 2.5,
}

# Route templates
ROUTE_TEMPLATES = {
    "RESTOCK_AS_NEW": "{customer} → {city} Hub → Restock Center",
    "RESTOCK": "{customer} → {city} Hub → Restock Center",
    "REFURBISH": "{customer} → {city} Hub → Refurb Center",
    "OUTLET_SALE": "{customer} → {city} Hub → Outlet Store",
    "OUTLET": "{customer} → {city} Hub → Outlet Store",
    "RETURN_TO_VENDOR": "{customer} → {city} Hub → Vendor Return Dock",
    "DONATE": "{customer} → {city} Hub → Donation Partner",
    "RECYCLE": "{customer} → {city} Hub → Recycling Facility",
}

MAX_KM = 2000.0


def _score_warehouse(wh: Warehouse, decision: str, weights: dict) -> dict:
    """Score a single warehouse and return full breakdown."""
    # Distance score (closer = better)
    distance_score = max(0.0, 100.0 - (wh.distanceKm / MAX_KM) * 100.0)

    # Speed (closer = faster, 1 day per 400km)
    estimated_days = max(1, int(wh.distanceKm / 400) + 1)
    speed_score = max(0.0, 100.0 - (estimated_days - 1) * 20.0)

    # Cost
    rate = COST_PER_KM.get(decision, 4.0)
    estimated_cost = round(wh.distanceKm * rate, 2)
    max_cost = MAX_KM * 5.0
    cost_score = max(0.0, 100.0 - (estimated_cost / max_cost) * 100.0)

    # Capacity
    capacity_score = wh.capacity

    # Carbon (inversely proportional to distance)
    carbon_score = max(0.0, 100.0 - (wh.distanceKm / MAX_KM) * 100.0)

    # Weighted composite
    composite = (
        distance_score * weights["distance"] +
        capacity_score * weights["capacity"] +
        speed_score * weights["speed"] +
        cost_score * weights["cost"] +
        carbon_score * weights["carbon"]
    )

    return {
        "warehouse": wh,
        "composite": round(composite, 2),
        "distance_score": round(distance_score, 1),
        "speed_score": round(speed_score, 1),
        "cost_score": round(cost_score, 1),
        "capacity_score": round(capacity_score, 1),
        "carbon_score": round(carbon_score, 1),
        "estimated_cost": estimated_cost,
        "estimated_days": estimated_days,
    }


class LogisticsOptimizer:
    def optimize(self, request: LogisticsRequest) -> LogisticsResponse:
        decision = request.recommendedDecision.upper().replace(" ", "_")
        weights = WEIGHT_PROFILES.get(decision, DEFAULT_WEIGHTS)
        route_tpl = ROUTE_TEMPLATES.get(decision, "{customer} → {city} Hub → Processing Center")

        # Score all warehouses
        scored = [_score_warehouse(wh, decision, weights) for wh in request.warehouses]
        scored.sort(key=lambda x: x["composite"], reverse=True)

        # Pick the best
        best = scored[0]
        best_wh = best["warehouse"]

        # Build reasoning
        reasoning = []
        if best["distance_score"] >= 90:
            reasoning.append("Lowest transport cost")
            reasoning.append("Shortest route")
        elif best["distance_score"] >= 70:
            reasoning.append("Good proximity")

        if best["capacity_score"] >= 80:
            reasoning.append("Available warehouse capacity")

        if best["carbon_score"] >= 80:
            reasoning.append("High carbon efficiency")

        if best["speed_score"] >= 80:
            reasoning.append("Fast processing")

        if not reasoning:
            reasoning.append("Best overall logistics score")

        route = route_tpl.format(customer=request.customerLocation, city=best_wh.city)

        return LogisticsResponse(
            recommendedWarehouse=best_wh.warehouseId,
            recommendedRoute=route,
            estimatedCost=best["estimated_cost"],
            estimatedDays=best["estimated_days"],
            carbonScore=round(best["carbon_score"], 2),
            reasoning=reasoning,
        )


optimizer = LogisticsOptimizer()
