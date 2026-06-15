# Routing Algorithm

## Composite Logistics Score Formula

```text
LogisticsScore =
  (capacity      * 0.25)  ← warehouse fill level (0-100)
+ (carbonScore   * 0.25)  ← eco-efficiency of route
+ (speedScore    * 0.25)  ← how fast the item arrives
+ (costEfficiency* 0.25)  ← how cheap the route is
```

All four dimensions are normalised to a 0-100 scale before weighting.

---

## Dimension Calculations

### 1. Carbon Score (0-100)
```text
carbonScore = max(0, 100 - (distanceKm / 2000) * 100)
```
A warehouse 2 000 km away scores 0; one at 0 km scores 100.

### 2. Speed Score (0-100)
```text
estimatedDays = max(1, int(distanceKm / 500) + 1)
speedScore    = max(0, 100 - (estimatedDays - 1) * 20)
```
Each additional day beyond 1 deducts 20 points.

### 3. Cost Efficiency (0-100)
```text
rate          = COST_PER_KM[decision]   # INR per km, varies by action
estimatedCost = distanceKm × rate
costEfficiency = max(0, 100 - (estimatedCost / 10000) * 100)
```
Decision-specific rates (INR/km):
| Decision | Rate |
| :--- | ---: |
| RESTOCK_AS_NEW | 3.5 |
| REFURBISH | 4.0 |
| OUTLET_SALE | 3.0 |
| RETURN_TO_VENDOR | 5.0 |
| DONATE | 2.0 |
| RECYCLE | 2.5 |

### 4. Capacity Score (0-100)
Directly uses the `capacity` field (percentage occupancy remaining). Higher = better.

---

## Route Templates
Each recovery decision maps to a human-readable route label:
| Decision | Route |
| :--- | :--- |
| REFURBISH | `Customer → {city} Hub → Refurb Center` |
| RESTOCK_AS_NEW | `Customer → {city} Hub → Restock Center` |
| OUTLET_SALE | `Customer → {city} Hub → Outlet Store` |
| RETURN_TO_VENDOR | `Customer → {city} Hub → Vendor Return Dock` |
| DONATE | `Customer → {city} Hub → Donation Partner` |
| RECYCLE | `Customer → {city} Hub → Recycling Facility` |
