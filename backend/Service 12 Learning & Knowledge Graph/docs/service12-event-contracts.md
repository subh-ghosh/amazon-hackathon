# Service #12: Event Contracts (Amazon EventBridge)

Service #12 utilizes AWS EventBridge to emit and consume domain events async.

## 1. ReturnCreated
- **Producer:** Service #12 (Knowledge Graph)
- **Consumers:** Truth Discovery Engine (Service #2), Fraud Engine, Logistics
- **JSON Schema:**
  ```json
  {
    "version": "1",
    "source": "circular.os.knowledge_graph",
    "detail-type": "ReturnCreated",
    "detail": {
      "return_id": "RET-123",
      "customer_id": "CUST-456",
      "product_id": "PROD-789",
      "timestamp": "2026-06-13T10:00:00Z"
    }
  }
  ```

## 2. RootCauseDiscovered
- **Producer:** Truth Discovery Engine (Service #2)
- **Consumers:** Knowledge Graph, Seller Intelligence
- **JSON Schema:**
  ```json
  {
    "source": "circular.os.truth_engine",
    "detail-type": "RootCauseDiscovered",
    "detail": {
      "return_id": "RET-123",
      "root_cause": "WARDROBING",
      "confidence": 0.98
    }
  }
  ```

## 3. FraudScoreComputed
- **Producer:** Fraud Engine
- **Consumers:** Knowledge Graph, Customer Support
- **JSON Schema:**
  ```json
  {
    "source": "circular.os.fraud_engine",
    "detail-type": "FraudScoreComputed",
    "detail": {
      "customer_id": "CUST-456",
      "risk_score": 85.5,
      "flagged_for_review": true
    }
  }
  ```

## 4. RecoveryDecisionMade
- **Producer:** Routing Engine
- **Consumers:** Logistics, Knowledge Graph
- **JSON Schema:**
  ```json
  {
    "source": "circular.os.routing_engine",
    "detail-type": "RecoveryDecisionMade",
    "detail": {
      "return_id": "RET-123",
      "action": "LIQUIDATION",
      "estimated_recovery": 45.00
    }
  }
  ```

## 5. TwinUpdated
- **Producer:** Service #12 / Operations
- **Consumers:** Supply Chain, Consumer Apps
- **JSON Schema:**
  ```json
  {
    "source": "circular.os.knowledge_graph",
    "detail-type": "TwinUpdated",
    "detail": {
      "twin_id": "TWIN-123",
      "new_status": "REFURBISHED"
    }
  }
  ```

## EventBridge Integration Guidelines
All microservices must inject the `EVENT_BUS_NAME` environment variable and utilize the `boto3` `put_events` API for publishing. All consumers must define AWS EventBridge Rules filtering by `source` and `detail-type` to trigger ECS Tasks or SQS Queues.
