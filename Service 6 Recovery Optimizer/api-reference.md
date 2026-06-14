# API Reference

## GET /health
Returns the operational status of the service.

**Response (200 OK)**
```json
{
  "status": "healthy",
  "service": "Recovery Optimizer"
}
```

---

## POST /api/v1/recovery/optimize
Evaluates an array of potential recovery simulations and returns the mathematically optimal decision.

**Request Payload**
```json
{
  "returnId": "RET123",
  "productId": "P123",
  "fraudScore": 15,
  "sellerTrustScore": 0.92,
  "simulations": [
    {
      "scenario": "Refurbish",
      "recoveryValue": 11000,
      "carbonImpact": 12,
      "processingTimeDays": 4,
      "confidence": 0.91
    },
    {
      "scenario": "Outlet Sale",
      "recoveryValue": 8500,
      "carbonImpact": 5,
      "processingTimeDays": 2,
      "confidence": 0.88
    }
  ]
}
```

**Response (200 OK)**
```json
{
  "recommendedDecision": "REFURBISH",
  "expectedProfit": 11000.0,
  "carbonSavings": -12.0,
  "processingDays": 4,
  "confidence": 0.91,
  "reasoning": [
    "Highest recovery value",
    "Acceptable carbon impact",
    "Low fraud risk"
  ]
}
```

**Validation Errors (422 Unprocessable Entity)**
Pydantic automatically rejects requests with:
* Empty `simulations` array
* Negative `recoveryValue`
* `confidence` outside the `[0, 1]` boundary
* Missing required fields
