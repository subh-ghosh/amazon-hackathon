# Service #1 — Return Prevention Engine: API Reference

This document outlines the API endpoints, parameters, validation constraints, and response schemas for the Return Prevention Engine (S1).

---

## Base Configuration
- **Port**: `8001`
- **Protocol**: HTTP/1.1
- **Content-Type**: `application/json`

---

## Endpoints

### 1. Health Check
Retrieves the operational status of the microservice. Used by the Application Load Balancer (ALB) and ECS task definitions to monitor container health.

- **Method**: `GET`
- **Path**: `/health`
- **Headers**: None
- **Response**: `200 OK`
- **Payload**:
```json
{
  "status": "healthy",
  "service": "Return Prevention Engine",
  "version": "1.0.0"
}
```

---

### 2. Analyze Return Risk
Predicts the return risk score and generates prevention recommendations for a potential purchase.

- **Method**: `POST`
- **Path**: `/api/v1/prevention/analyze`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "customerId": "C123",
  "productId": "P456",
  "category": "Electronics",
  "productRating": 4.2,
  "customerReturnRate": 0.35,
  "customerPurchaseCount": 22,
  "productReturnRate": 0.18,
  "sellerRating": 4.7,
  "price": 15000
}
```

- **Request Fields Description**:
  - `customerId` (string, required): Unique customer identifier. Cannot be empty or contain only whitespace.
  - `productId` (string, required): Unique product identifier. Cannot be empty or contain only whitespace.
  - `category` (string, required): Product category (e.g. "Electronics", "Apparel").
  - `productRating` (float, required): Average product rating. Must be between `0.0` and `5.0`.
  - `customerReturnRate` (float, required): Historical return rate of the customer. Must be between `0.0` and `1.0`.
  - `customerPurchaseCount` (integer, required): Total purchases by the customer. Must be $\ge 0$.
  - `productReturnRate` (float, required): Historical return rate of the product. Must be between `0.0` and `1.0`.
  - `sellerRating` (float, required): Rating of the seller. Must be between `0.0` and `5.0`.
  - `price` (float, required): Unit price of the product. Must be $\ge 0.0$.

- **Response Body (200 OK)**:
```json
{
  "returnRiskScore": 72,
  "riskLevel": "HIGH",
  "recommendedActions": [
    "Verify compatibility before purchase",
    "Review product dimensions",
    "Check seller recommendations"
  ],
  "confidence": 0.91,
  "explanation": [
    "Customer has elevated return history",
    "Product category has above-average returns"
  ]
}
```

---

## Input Validation (HTTP 422 Unprocessable Entity)
If any validation constraints are violated (e.g., negative price, invalid ratings, empty IDs), the API rejects the request with a `422 Unprocessable Entity` status code and returns structured error details.

### Example Error Response:
```json
{
  "detail": [
    {
      "type": "greater_than_equal",
      "loc": ["body", "price"],
      "msg": "Input should be greater than or equal to 0",
      "input": -15000.0,
      "ctx": {"error": {}}
    }
  ]
}
```

---

## OpenAPI & Swagger Documentation
- **Swagger UI**: Access `http://localhost:8001/docs` in your browser.
- **OpenAPI Schema**: Retrieve the raw JSON specification at `http://localhost:8001/openapi.json`.
