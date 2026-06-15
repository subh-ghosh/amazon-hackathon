# Service #11 — Seller Intelligence Engine: API Reference

This document provides details for S11 REST endpoints. 
- **Base URL**: `http://localhost:8011`
- **Protocol**: HTTP/1.1
- **Content-Type**: `application/json`

---

## 1. Endpoints

### Health Check
`GET /health`
Returns the operational health of the S11 container. Used by AWS Application Load Balancers (ALBs) and ECS.

**Response (HTTP 200)**:
```json
{
  "status": "healthy",
  "service": "Seller Intelligence Engine",
  "version": "1.0.0"
}
```

---

### Analyze Seller
`POST /api/v1/seller/analyze`
Submits a seller's performance signals for evaluation. Calculates scores, tiers, trends, and recommendations. Saves results to the database to update historical dashboard logs.

**Request Body**:
```json
{
  "sellerId": "SELLER123",
  "sellerName": "TechStore",
  "totalOrders": 10000,
  "totalReturns": 850,
  "fraudCases": 35,
  "averageRating": 4.2,
  "packagingScore": 78,
  "products": [
    {
      "productId": "P123",
      "returnRate": 12.5,
      "category": "Electronics"
    }
  ],
  "donationRate": 80.0,
  "recyclingRate": 75.0,
  "rootCauseInsights": [
    {
      "insight": "Expectation mismatch drives 40% of returns",
      "severity": "MEDIUM"
    }
  ]
}
```

**Response (HTTP 200)**:
```json
{
  "sellerId": "SELLER123",
  "sellerHealthScore": 82,
  "sellerTier": "GOLD",
  "returnRiskScore": 65,
  "fraudRiskScore": 20,
  "sustainabilityScore": 78,
  "estimatedRevenueLoss": 12002.0,
  "returnsPer100Orders": 8.5,
  "highRiskProducts": [
    {
      "productId": "P123",
      "returnRate": 12.5,
      "riskLevel": "HIGH",
      "reason": "EXPECTATION_MISMATCH"
    }
  ],
  "fraudExposureLevel": "LOW",
  "sellerHealthTrend": "IMPROVING",
  "returnTrend": "STABLE",
  "fraudTrend": "DECLINING",
  "rootCauseInsights": [
    {
      "insight": "Expectation mismatch drives 40% of returns",
      "severity": "MEDIUM"
    }
  ],
  "fraudInsights": [
    {
      "insight": "Fraud incident frequency is stable",
      "severity": "LOW"
    }
  ],
  "lifecycleInsights": [
    {
      "insight": "Product P123 is experiencing a mature lifecycle stage",
      "severity": "LOW"
    }
  ],
  "packagingInsights": [
    {
      "insight": "Packaging inefficiency detected",
      "severity": "MEDIUM"
    }
  ],
  "historicalInsights": [
    {
      "insight": "Returns stable over past 3 months",
      "severity": "LOW"
    }
  ],
  "topIssues": [
    "High return rate in electronics",
    "Packaging inefficiency detected"
  ],
  "recommendations": [
    "Improve product descriptions",
    "Review high-return products",
    "Reduce packaging size",
    "Review customer feedback on packaging"
  ],
  "insights": [
    "Expectation mismatch drives 40% of returns",
    "Optimizing package volume could reduce shipping overhead by 12%"
  ],
  "dashboardGeneratedAt": "2026-06-14T16:45:00Z",
  "analysisVersion": "v1.0",
  "executiveSummary": "Seller health is strong with low fraud exposure and moderate return risk. Sustainability performance is good.",
  "priorityActions": [
    "Reduce size mismatch returns",
    "Improve packaging sustainability",
    "Investigate return fraud patterns"
  ],
  "riskBreakdown": {
    "returnsContribution": 53,
    "fraudContribution": 16,
    "sustainabilityContribution": 18,
    "ratingContribution": 13
  },
  "sellerBenchmark": {
    "healthPercentile": 82,
    "returnPerformance": "ABOVE_AVERAGE",
    "fraudPerformance": "EXCELLENT",
    "sustainabilityPerformance": "GOOD"
  },
  "confidenceScore": 87,
  "overallRiskLevel": "LOW",
  "historicalMetrics": {
    "healthScores": [],
    "returnRates": [],
    "fraudRates": []
  }
}
```

---

### Get Seller Dashboard
`GET /api/v1/seller/{sellerId}/dashboard`
Retrieves the complete frontend-ready metrics object for the requested seller without requiring recalculations.

**Response (HTTP 200)**:
Returns the exact same JSON response structure as `POST /api/v1/seller/analyze`.

---

## 2. Validation & Safeguard Rules
The API enforces strict validation rules to protect against malformed inputs and overflows:
- **Extra Fields**: Blocked using `ConfigDict(extra="forbid")`. Any extra field returns HTTP 422.
- **Empty / Whitespace Strings**: Blocked. Strings cannot consist only of whitespace characters.
- **Non-Finite Numbers**: Values like `NaN`, `Infinity`, or `-Infinity` are rejected with HTTP 422.
- **String Length Limits**:
  - `sellerId` max length: 100 characters.
  - `sellerName` max length: 200 characters.
  - `productId` max length: 100 characters.
  - `category` max length: 100 characters.
  - `insight` max length: 500 characters.
- **Numeric Limits**:
  - `totalOrders`, `totalReturns`, `fraudCases` must be $\ge 0$.
  - `averageRating` must be between $0.0$ and $5.0$.
  - `packagingScore`, `returnRate`, `donationRate`, `recyclingRate` must be between $0.0$ and $100.0$.
  - `totalReturns` cannot exceed `totalOrders`.
  - `fraudCases` cannot exceed `totalReturns`.

### Math Safeguards & Normalization
- **Division by Zero Protection**: If `totalOrders = 0`, the API executes zero-order safety overrides. Output metrics `returnsPer100Orders`, `fraudRiskScore`, `returnRiskScore`, and `estimatedRevenueLoss` are set to `0` or `0.0`.
- **Confidence Safety Cap**: `confidenceScore` is guaranteed to satisfy $0 \le \text{confidenceScore} \le 100$.
- **Risk Normalization**: The breakdown of risk contributions sums exactly to $100\%$. Rounding errors are absorbed by the largest contributor.
- **Reason Priority Rules**: Product return reasons are prioritized as:
  1. `QUALITY_DEFECT` (returnRate $\ge 15\%$)
  2. `TRANSIT_DAMAGE` (packaging category)
  3. `SIZE_MISMATCH` (apparel/fashion category)
  4. `EXPECTATION_MISMATCH` (fallback)

---

## 3. Error Responses

### Validation Error (HTTP 422)
Returned when request parameters violate schemas or constraints.
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "sellerName"],
      "msg": "String field cannot be empty or contain only whitespace",
      "input": "   "
    }
  ]
}
```

### Resource Not Found (HTTP 404)
Returned when calling `/dashboard` for a seller who hasn't been analyzed yet.
```json
{
  "detail": "Seller analysis not found for ID: SELLER999. Run analysis first to populate dashboard metrics."
}
```
