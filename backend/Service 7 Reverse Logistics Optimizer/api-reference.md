# API Reference

## GET /health
```json
{"status": "healthy", "service": "Reverse Logistics Optimizer"}
```

---

## POST /api/v1/logistics/optimize

### Request
```json
{
  "returnId": "RET123",
  "productId": "P123",
  "recommendedDecision": "REFURBISH",
  "customerLocation": "Kolkata",
  "conditionScore": 82,
  "estimatedValue": 15000,
  "warehouses": [
    {
      "warehouseId": "WH-KOL-01",
      "city": "Kolkata",
      "capacity": 85,
      "distanceKm": 25
    },
    {
      "warehouseId": "WH-BLR-01",
      "city": "Bangalore",
      "capacity": 60,
      "distanceKm": 1550
    }
  ]
}
```

### Response (200 OK)
```json
{
  "recommendedWarehouse": "WH-KOL-01",
  "recommendedRoute": "Kolkata → Kolkata Hub → Refurb Center",
  "estimatedCost": 100.0,
  "estimatedDays": 1,
  "carbonScore": 98.75,
  "reasoning": [
    "Lowest transport cost",
    "Shortest route",
    "Available warehouse capacity",
    "High carbon efficiency"
  ]
}
```

### Validation Errors (422)
- `warehouses` array is empty
- `distanceKm` is negative
- `capacity` is outside 0–100
- `conditionScore` is outside 0–100
