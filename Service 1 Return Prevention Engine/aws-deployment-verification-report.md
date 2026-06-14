# Service #1 — Return Prevention Engine: AWS Deployment Verification Report

This report outlines the post-deployment verification checks to be run against the live AWS Application Load Balancer (ALB) endpoint.

---

## 1. Live Endpoint Verification Guide (TC-029)

Once the service is deployed to ECS Fargate, execute the following CLI commands (replacing `<BASE_URL>` with the live ALB DNS name) to ensure the service is fully operational:

### Step 1: Health Verification
```bash
curl -i -X GET http://<BASE_URL>/health
```
- **Expectation**: HTTP `200 OK`. Response body:
  ```json
  {"status": "healthy", "service": "Return Prevention Engine", "version": "1.0.0"}
  ```

### Step 2: Documentation Availability
```bash
curl -i -X GET http://<BASE_URL>/docs
curl -i -X GET http://<BASE_URL>/openapi.json
```
- **Expectation**: HTTP `200 OK` for both.

### Step 3: Valid Payload Verification (Demo Scenario)
```bash
curl -i -X POST http://<BASE_URL>/api/v1/prevention/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "C123",
    "productId": "P456",
    "category": "Electronics",
    "productRating": 4.2,
    "customerReturnRate": 0.35,
    "customerPurchaseCount": 22,
    "productReturnRate": 0.18,
    "sellerRating": 4.7,
    "price": 15000
  }'
```
- **Expectation**: HTTP `200 OK`. Output risk score is `72`, level `HIGH`, confidence `0.91`, and recommended actions match.

### Step 4: Invalid Payload Rejection (Boundary Fail)
```bash
curl -i -X POST http://<BASE_URL>/api/v1/prevention/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "C123",
    "productId": "P456",
    "category": "Electronics",
    "productRating": 4.2,
    "customerReturnRate": 0.35,
    "customerPurchaseCount": 22,
    "productReturnRate": 0.18,
    "sellerRating": 4.7,
    "price": -150.0
  }'
```
- **Expectation**: HTTP `422 Unprocessable Entity` (due to negative price).

---

## 2. Verdict

The verification test scripts successfully simulated these tests locally, returning exact status codes (200 for valid, 422 for invalid payloads). This sequence is certified for live validation.
