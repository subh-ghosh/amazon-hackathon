# Integration Design

The Product Digital Twin acts as the "Event Sourcing" storage engine for the entire Circular Intelligence OS. It exposes isolated endpoints for other services to inject events, ensuring the Twin always reflects real-time reality.

### Integration Map

| Source Service | Endpoint Hit | Trigger Condition |
| :--- | :--- | :--- |
| **Frontend/Gateway** | `POST /api/v1/products/{id}/returns` | When customer initiates a return |
| **S3 Fraud Engine** | `POST /api/v1/products/{id}/fraud` | After fraud scoring is completed |
| **S6 Recovery Optimizer** | `POST /api/v1/products/{id}/recovery-actions` | After determining recovery decision |
| **S7 Reverse Logistics** | `POST /api/v1/products/{id}/logistics` | After warehouse routing is chosen |

### Future-Proofing (S12 Knowledge Graph)
Currently, S12 manually connects nodes using its own ingestion paths. In the future, Service #4 can be configured to emit an `EventBridge` event every time an update occurs, allowing S12 to automatically listen and update the Graph database in real-time.
