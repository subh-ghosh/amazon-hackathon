# Integration Design: Service 2 (Truth Discovery Engine)

## Upstream Integrations
1. **Service #1 (Return Prevention)**: May directly trigger a truth discovery request if an immediate root cause is ambiguous during the return initiation.

## Downstream Integrations
1. **Service #12 (Knowledge Graph)**:
   - **Fetch**: S2 queries S12 via HTTP to gather context before running the Bedrock analysis.
   - **Writeback**: S2 updates S12 with the confirmed root cause after analysis.
2. **Service #3 (Fraud & Trust Engine)**:
   - **Event Driven**: Listens to the `RootCauseDiscovered` event emitted by S2 to recalculate fraud risk scores.

## Event Payload (`RootCauseDiscovered`)
```json
{
  "source": "com.amazon.circular.truth",
  "detail-type": "RootCauseDiscovered",
  "detail": {
    "returnId": "RET-001",
    "productId": "PROD-123",
    "rootCause": "USER_ERROR",
    "confidence": 0.95
  }
}
```
