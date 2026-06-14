# Architecture: Service #4 — Product Digital Twin

## 🏢 Domain: VPC-3 Product & Business Layer

Service #4 acts as the central persistent memory for products in the Circular Intelligence OS ecosystem. As products flow through returns, fraud detection, logistics, and recovery, their "Digital Twin" is constantly updated here.

## Component Design
| File | Role |
| :--- | :--- |
| `app/main.py` | FastAPI application, health check, router registration. |
| `app/api/products.py` | Controller layer defining all lifecycle API endpoints. |
| `app/services/twin_service.py` | Core business logic handling state transitions and score modifications. |
| `app/services/dynamodb_service.py` | Low-level DynamoDB interface with Decimal type safety. |
| `app/models/schemas.py` | Strict Pydantic models for request validation and state representation. |

## Data Flow
```
External Service (e.g. Fraud Engine)
      │
      ▼
POST /api/v1/products/{id}/fraud
      │
      ▼
Pydantic Validation
      │
      ▼
TwinService.add_fraud_event()
      ├── Get current Twin state from DynamoDB
      ├── Append new event to history
      ├── Evaluate condition (if fraudScore > 70 -> update currentStatus)
      └── Persist updated Twin state
      │
      ▼
DynamoDB put_item
      │
      ▼
Return 200 OK + Updated Twin JSON
```

## Infrastructure Specs
- **Framework:** FastAPI (Python 3.11)
- **Database:** Amazon DynamoDB (On-Demand Capacity)
- **Compute:** AWS ECS Fargate (256 CPU / 512 MB)
- **Network:** Deployed natively into the new `VPC-3-ProductBusinessLayer`
