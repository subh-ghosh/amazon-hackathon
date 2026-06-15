# Service #10 — Packaging Intelligence: API Reference

This document outlines the API endpoints, parameters, validation constraints, and response schemas for the Packaging Intelligence Service (S10).

---

## Base Configuration
- **Port**: `8010`
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
  "service": "Packaging Intelligence Service",
  "version": "1.0.0"
}
```

---

### 2. Analyze Packaging
Analyzes the physical packaging attributes, calculates scores, and returns optimization recommendations.

- **Method**: `POST`
- **Path**: `/api/v1/packaging/analyze`
- **Headers**:
  - `Content-Type: application/json`
- **Request Body**:
```json
{
  "productId": "P123",
  "category": "Electronics",
  "productWeight": 2.5,
  "packagingWeight": 1.2,
  "packagingMaterial": "Plastic",
  "length": 30.0,
  "width": 20.0,
  "height": 10.0
}
```

- **Request Fields Description**:
  - `productId` (string, required): Unique product identifier. Max length: 100. Cannot be empty or contain only whitespace.
  - `category` (string, required): Product category. Max length: 100. Cannot be empty or contain only whitespace.
  - `productWeight` (float, required): Weight of the product in kg. Must be strictly positive ($> 0.0$).
  - `packagingWeight` (float, required): Weight of the packaging in kg. Must be strictly positive ($> 0.0$).
  - `packagingMaterial` (string, required): Packaging material name. Max length: 100. Cannot be empty or contain only whitespace.
  - `length` (float, required): Length of shipping box in cm. Must be strictly positive ($> 0.0$).
  - `width` (float, required): Width of shipping box in cm. Must be strictly positive ($> 0.0$).
  - `height` (float, required): Height of shipping box in cm. Must be strictly positive ($> 0.0$).

- **Response Body (200 OK)**:
```json
{
  "productId": "P123",
  "sustainabilityScore": 50,
  "packagingEfficiencyScore": 88,
  "carbonImpactScore": 28,
  "recyclabilityScore": 40,
  "confidence": 1.0,
  "recommendations": [
    "Reduce plastic usage by transitioning to paper or cardboard packaging",
    "Reduce packaging weight relative to product weight",
    "Use materials with lower carbon footprints to reduce emissions"
  ],
  "explanations": [
    "Packaging weight exceeds recommended threshold of 30% of product weight",
    "Material has low recyclability",
    "High estimated carbon footprint due to packaging material or weight"
  ]
}
```

---

## Input Validation (HTTP 422 Unprocessable Entity)
If any validation constraints are violated (e.g. negative values, zero dimensions, NaN, Infinity, empty strings), the API rejects the request with an HTTP 422 status and returns error details.

### Example Error Response:
```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "productWeight"],
      "msg": "Input should be greater than 0",
      "input": -2.5,
      "ctx": {"error": {}}
    }
  ]
}
```

---

## OpenAPI & Swagger Documentation
- **Swagger UI**: Access `http://localhost:8010/docs` in your browser.
- **OpenAPI Schema**: Retrieve the raw JSON specification at `http://localhost:8010/openapi.json`.
