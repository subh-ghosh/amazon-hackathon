# DynamoDB Schema: ProductDigitalTwin

## Core Design
- **Table Name:** `ProductDigitalTwin`
- **Partition Key:** `productId` (String)
- **Billing Mode:** PAY_PER_REQUEST (On-Demand)

## Data Structure Example
DynamoDB uses schema-less JSON documents. The structure managed by our application code looks like this:

```json
{
  "productId": "P123",
  "sku": "SKU-001",
  "category": "Electronics",
  "conditionScore": 92.5,
  "utilityScore": 96.0,
  "returnCount": 1,
  "repairCount": 0,
  "fraudFlags": ["SERIAL_RETURN_ABUSE"],
  "currentStatus": "FRAUD_REVIEW",
  "createdAt": "2026-06-14T05:00:00Z",
  "updatedAt": "2026-06-14T06:00:00Z",
  
  "returnHistory": [
    {
      "timestamp": "2026-06-14T05:30:00Z",
      "returnReason": "Defective",
      "conditionScore": 92.5
    }
  ],
  "repairHistory": [],
  "fraudHistory": [],
  "recoveryHistory": [],
  "logisticsHistory": []
}
```

## Technical Notes
- **Float Handling:** DynamoDB strictly requires floating-point numbers to be cast as `Decimal`. The `dynamodb_service.py` automatically intercepts and sanitizes Pydantic floats using `json.loads(json.dumps(item), parse_float=Decimal)` before pushing to AWS.
- **Scalability:** Event histories (e.g. `returnHistory`) are stored as lists of maps within the same item for high-speed, single-read access to a product's entire lifecycle.
