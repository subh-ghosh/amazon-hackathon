# Architecture Blueprint — Service #8: Returnless Refund Engine

The **Returnless Refund Engine (S8)** is deployed in the **VPC-4 Recovery & Circular Economy Layer** of the **Amazon Circular Intelligence OS**. It coordinates the decision tree to determine whether to approve a refund without requiring a return, request a physical return, offer a partial refund, or route the product to donation/recycling channels.

---

## Component Topology

```
             ┌──────────────────────────────────────────────────┐
             │                HTTP ALB Gateway                  │
             └────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌──────────────────────────────────────────────────┐
             │           FastAPI Web Application (S8)           │
             │   - Tracing & Logging Middleware (Traceability)  │
             │   - Token Bucket Rate Limiter (Input Protection) │
             └───────┬──────────────────────────────────┬───────┘
                     │                                  │
                     ▼                                  ▼
        ┌────────────────────────┐         ┌────────────────────────┐
        │  Idempotency Cache     │         │  Audit Trail Store     │
        │  - Thread-Safe (RLock) │         │  - Thread-Safe (RLock) │
        └────────────────────────┘         └────────────────────────┘
                     │                                  │
                     ▼                                  ▼
        ┌────────────────────────┐         ┌────────────────────────┐
        │  Evaluation Engine     │         │  Operational Analytics │
        │  - Decision Routing    │         │  - Prometheus metrics  │
        │  - Weight Normalizer   │         │  - Aggregated Metrics  │
        └────────────────────────┘         └────────────────────────┘
```

---

## Architectural Patterns

1. **Distributed Tracing & Correlation ID Middleware**
   - Automatically inspects incoming requests for an `X-Correlation-ID` header.
   - Generates a UUID4 if the header is absent and propagates it across all logs, audit trails, and background async batch jobs.
   
2. **Idempotency Protection Layer**
   - Implements a thread-safe registry utilizing `threading.RLock()` to map `requestId` to cached `EvaluateResponse` objects.
   - Prevents duplicate refund debits and ensures high availability under high concurrency.

3. **Concurrency-Safe Analytics Engine**
   - Manages circular economy indices (waste diverted, CO₂ saved, savings) and decision distributions under a lock to prevent count drift.

4. **Integration Interfaces**
   - Consumes context and intelligence dynamically from S2 (Truth Discovery), S3 (Fraud & Trust), S4 (Product Digital Twin), S10 (Packaging Intelligence), S11 (Seller Analytics), and S12 (Learning & Knowledge Graph).
