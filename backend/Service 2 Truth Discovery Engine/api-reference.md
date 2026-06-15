# API Reference: Service 2 (Truth Discovery Engine)

## Overview
The Truth Discovery Engine determines the true root cause of a return by combining data from the Knowledge Graph (Product/Seller history) with an LLM analysis (Amazon Bedrock).

## Base URL
`http://<ALB-DNS>` (VPC-1)

---

## 1. Health Check
`GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Truth Discovery Engine",
  "region": "us-east-1"
}
```

---

## 2. Analyze Return
`POST /api/v1/truth/analyze`

**Request:**
```json
{
  "returnId": "RET-001",
  "productId": "PROD-123",
  "customerId": "CUST-456",
  "sellerId": "SELL-789",
  "claimedReason": "DEFECTIVE",
  "customerComments": "It doesn't turn on.",
  "inspectionNotes": "Box opened, minor scratch."
}
```

**Response:**
```json
{
  "returnId": "RET-001",
  "actualRootCause": "USER_ERROR",
  "confidence": 0.95,
  "requiresManualReview": false,
  "evidence": [
    {
      "type": "BEDROCK_ANALYSIS",
      "description": "Customer comments indicate confusion over power button location."
    }
  ]
}
```
