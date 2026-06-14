# API Reference

## Health Check
`GET /health`
Returns 200 OK if service is up.

---

## Create Twin
`POST /api/v1/products`
```json
{
  "productId": "P123",
  "sku": "SKU-001",
  "category": "Electronics"
}
```

---

## Fetch Twin
`GET /api/v1/products/{productId}`
Returns the full ProductTwin model including all historical arrays.

---

## Add Return Event
`POST /api/v1/products/{productId}/returns`
Increments `returnCount` and sets `currentStatus` to `RETURNED`.
```json
{
  "returnReason": "Defective",
  "conditionScore": 82
}
```

---

## Add Fraud Event
`POST /api/v1/products/{productId}/fraud`
Appends flag to `fraudFlags`. If `fraudScore` > 70, sets `currentStatus` to `FRAUD_REVIEW`.
```json
{
  "fraudScore": 85,
  "fraudType": "SERIAL_RETURN_ABUSE"
}
```

---

## Add Repair Event
`POST /api/v1/products/{productId}/repairs`
Increments `repairCount`.
```json
{
  "repairType": "Screen Replacement",
  "cost": 2500
}
```

---

## Add Recovery Decision
`POST /api/v1/products/{productId}/recovery-actions`
Updates `currentStatus` automatically based on the decision (e.g. `REFURBISH` → `REFURBISHING`).
```json
{
  "decision": "REFURBISH",
  "expectedProfit": 12000
}
```

---

## Add Logistics Route
`POST /api/v1/products/{productId}/logistics`
```json
{
  "warehouseId": "WH-KOL-01",
  "route": "Customer → Kolkata Hub"
}
```
