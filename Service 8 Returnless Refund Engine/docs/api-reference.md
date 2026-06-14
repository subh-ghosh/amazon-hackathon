# API Reference — Service #8: Returnless Refund Engine

This document defines the REST API endpoints and payload schemas for the Returnless Refund Engine microservice.

---

## 1. Global Request Headers
All API endpoints support the following header:
- `X-Correlation-ID` (String, Optional): Tracing identifier propagated to all responses, logs, and audit logs. If absent, a new UUID4 is generated.

---

## 2. API Endpoints

### GET /health
Returns general health information. Used for load balancers.
- **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "service": "Returnless Refund Engine",
    "version": "1.0.0"
  }
  ```

---

### GET /live
ECS container orchestration liveness probe.
- **Response (200 OK)**:
  ```json
  {"status": "alive"}
  ```

---

### GET /ready
ECS container orchestration readiness probe. Performs internal cache verification.
- **Response (200 OK)**:
  ```json
  {"status": "ready"}
  ```

---

### GET /metrics
Exposes Prometheus-compatible structured metrics.
- **Response (200 OK - text/plain)**: Exposes total evaluations, refunded value, shipping savings, CO₂ saved, and waste diverted.

---

### POST /api/v1/returnless/evaluate
Evaluates a single customer return request. Enforces idempotency via `requestId`.
- **Request Body**:
  ```json
  {
    "requestId": "RR123",
    "customerId": "CUST001",
    "productId": "PROD001",
    "orderValue": 25.0,
    "returnShippingCost": 12.0,
    "fraudRiskScore": 8,
    "returnRiskScore": 15,
    "condition": "OPEN_BOX",
    "sellerPolicy": "STANDARD",
    "customerTrustScore": 92,
    "category": "Apparel",
    "weightKg": 1.2,
    "sellerPolicyOverrides": {
      "maxReturnlessValue": 35.0,
      "allowDonation": true,
      "allowRecycling": true,
      "forceManualReviewCategories": ["Electronics"]
    }
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "requestId": "RR123",
    "decision": "RETURNLESS_REFUND",
    "confidenceScore": 88,
    "refundAmount": 25.0,
    "estimatedSavings": 12.0,
    "sustainabilityImpact": "POSITIVE",
    "businessReason": "Return shipping exceeds 30% of item value and fraud risk is low.",
    "overallRiskLevel": "LOW",
    "recommendedAction": "KEEP_ITEM",
    "decisionReason": "RETURNLESS_REFUND because Return shipping exceeds 30% of item value and fraud risk is low.",
    "decisionFactors": [
      { "factor": "Return Shipping Cost", "weight": 44 },
      { "factor": "Low Fraud Risk", "weight": 33 },
      { "factor": "Customer Trust", "weight": 23 }
    ],
    "decisionTimestamp": "2026-06-14T17:20:21Z",
    "rulesTriggered": ["LowValueHighShippingCostRule"],
    "modelVersion": "v1.0",
    "auditTrail": [
      {
        "timestamp": "2026-06-14T17:20:21Z",
        "event": "IDEMPOTENCY_CHECKED",
        "details": "Verified requestId 'RR123' is unique. Initializing evaluation.",
        "correlationId": "8da8c160-5f2c-4786-8d69-c6e3d23194a2"
      }
    ],
    "estimatedCO2Saved": 2.46,
    "estimatedWasteDivertedKg": 1.2,
    "circularityScore": 75,
    "recommendedDestination": "DONATION",
    "appealEligible": false,
    "appealReason": "Standard automated decision is final.",
    "estimatedProcessingCost": 0.0,
    "estimatedReverseLogisticsCost": 15.0,
    "netSavings": 15.0,
    "similarHistoricalDecisions": ["RETURNLESS_REFUND"],
    "historicalSuccessRate": 96,
    "recommendations": {
      "recommendedNextAction": "Approve returnless refund and instruct customer to keep the item.",
      "customerMessage": "We have processed your refund. You don't need to return the item. Please keep it.",
      "sellerAction": "Debit refund from balance. Return shipping cost saved."
    },
    "isDuplicateRequest": false,
    "originalDecisionTimestamp": null,
    "serviceVersion": "1.0.0",
    "environment": "production",
    "generatedAt": "2026-06-14T17:20:21Z"
  }
  ```

---

### POST /api/v1/returnless/batch-evaluate
Batch evaluate multiple requests.
- **Query Parameters**:
  - `asyncMode` (Boolean, default `false`): If `true`, runs the batch job asynchronously, returning a `jobId`.
- **Response (200 OK)**:
  - If `asyncMode=true`: returns `jobId` and status `"PENDING"`.
  - If `asyncMode=false`: returns status `"COMPLETED"` and the list of evaluations.

---

### GET /api/v1/returnless/jobs/{jobId}
Query the status and results of an asynchronous bulk evaluation job.
- **Response (200 OK)**: Returns status (`PENDING`, `COMPLETED`, `FAILED`) and evaluations if done.

---

### GET /api/v1/returnless/analytics
Retrieves global cumulative performance and circular metrics.
- **Response (200 OK)**:
  ```json
  {
    "totalEvaluations": 45,
    "decisionDistribution": {
      "RETURNLESS_REFUND": 20,
      "RETURN_REQUIRED": 15,
      "PARTIAL_REFUND": 5,
      "REFUND_AND_DONATE": 3,
      "REFUND_AND_RECYCLE": 2,
      "MANUAL_REVIEW": 0
    },
    "totalRefundValue": 450.00,
    "totalEstimatedSavings": 240.00,
    "totalCO2Saved": 85.50,
    "totalWasteDiverted": 54.00,
    "fraudPreventionStatistics": {
      "manualReviewCount": 0,
      "totalOrderValueShielded": 0.00
    }
  }
  ```

---

### GET /api/v1/returnless/{decisionId}
Lookup details of a past decision by its `requestId`.
- **Response (200 OK)**: Returns the complete cached `EvaluateResponse`.
