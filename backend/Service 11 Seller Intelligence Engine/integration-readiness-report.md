# Service #11 — Seller Intelligence Engine: Integration Readiness Report

This document outlines the integration patterns, communication structures, and API contracts connecting **Service #11** (S11) to the wider Amazon Circular Intelligence OS ecosystem.

---

## 1. Upstream Service Mappings

S11 aggregates data from five distinct upstream services and exposes the results directly in the seller response models.

| Source Service | Data Domain | S11 Mapping | Insight Objective |
|:---|:---|:---|:---|
| **S2 — Truth Discovery** | Root cause analysis | `rootCauseInsights` | Highlights primary reasons behind returns (e.g. expectation mismatch). |
| **S3 — Fraud & Trust** | Fraud metrics & signals | `fraudInsights` | Identifies return abuse patterns and trust thresholds. |
| **S4 — Product Digital Twin** | Product lifecycle states | `lifecycleInsights` | Tracks product support windows, repairs, and circular lifecycles. |
| **S10 — Packaging Intelligence**| Material efficiency & footprint| `packagingInsights` | Pinpoints package size mismatch and sustainability issues. |
| **S12 — Knowledge Graph** | Time-series history | `historicalInsights` | Provides context on long-term returns and seller trust trends. |

---

## 2. Integration Payloads & Mapped Schemas

To integrate an upstream service analysis with S11, compile the insights into the `SellerAnalysisRequest` JSON payload.

### Ingestion Schema Format:
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
  "rootCauseInsights": [
    {
      "insight": "Expectation mismatch drives 40% of returns",
      "severity": "MEDIUM"
    }
  ],
  "fraudInsights": [
    {
      "insight": "Fraud concentration observed in category Electronics",
      "severity": "HIGH"
    }
  ],
  "lifecycleInsights": [
    {
      "insight": "Product P123 near end of support window",
      "severity": "LOW"
    }
  ],
  "packagingInsights": [
    {
      "insight": "Packaging inefficiency detected in box volume",
      "severity": "MEDIUM"
    }
  ],
  "historicalInsights": [
    {
      "insight": "Return rates stable over past 3 months",
      "severity": "LOW"
    }
  ]
}
```

Upstream insights are parsed, processed, and returned under their respective lists in the response object, categorized by severity (`LOW`, `MEDIUM`, or `HIGH`).

---

## 3. Frontend Dashboard Integrations

S11 serves three distinct frontend dashboards, exposing structured keys that require no client-side conversion.

### A. Seller Dashboard
Provides sellers with operational metrics, sustainability performance, and action items.
- **KPIs**: `sellerHealthScore`, `sellerTier`, `sustainabilityScore`.
- **Action items**: `recommendations` (e.g. `"Reduce packaging size"`, `"Improve product descriptions"`).
- **Trends**: `sellerHealthTrend`, `returnTrend`, `fraudTrend`.

### B. Executive Dashboard
Exposes financial performance, risk levels, and high-level KPIs.
- **KPIs**: `estimatedRevenueLoss`, `returnsPer100Orders`, `confidenceScore`.
- **Summary**: `executiveSummary` (direct human-readable description).
- **Risk Indicators**: `overallRiskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `riskBreakdown` (returns, fraud, packaging, rating contributions).

### C. Operations Dashboard
Used by logistics and warehouse operations to track specific product issues.
- **Metrics**: `highRiskProducts` (lists products with return rates $>5.0\%$, their individual `riskLevel` and the operational `reason` like `SIZE_MISMATCH` or `QUALITY_DEFECT`).
- **Audit Trails**: `dashboardGeneratedAt` (ISO timestamp) and `analysisVersion` ("v1.0").

---

## 4. Database Migration Pathway (Future DynamoDB)

S11 currently stores seller dashboards in a thread-safe, in-memory Python dictionary cache.
For high-availability environments, the cache layer will be replaced with an **Amazon DynamoDB** database:
- **Connection SDK**: `boto3` (Python AWS SDK).
- **Operation**:
  - Upon calling `/analyze`, S11 writes the completed analysis model directly to a DynamoDB table.
  - Upon calling `/dashboard`, S11 queries DynamoDB for the latest partition key match (`sellerId`).
  - Historical arrays (`historicalMetrics`) are populated by querying the table using `sellerId` and sorting by `dashboardGeneratedAt`.
