# 🌐 Amazon Circular Intelligence OS — API Directory

This document is the **single source of truth** for all deployed microservices in the Circular Intelligence OS ecosystem. Use these endpoints to connect frontends, trigger events, and validate cross-service integrations.

---

## 🏗️ VPC Architecture (4-Domain Design)

```
VPC-1 Intelligence Layer
        │
        ▼
VPC-4 Central Knowledge Platform
        ▲
        │
VPC-2 Recovery Layer
        │
        ▼
VPC-3 Product & Business Layer
```

| VPC | Domain | Services | Purpose |
|:---|:---|:---|:---|
| **VPC-1** `IntelligenceLayer` | Intelligence | S1, S2, S3, S10 | AI/ML, Risk Analysis, Root Cause Detection |
| **VPC-2** `RecoveryLayer` | Recovery | S5, S6, S7, S8, S9 | Recovery Decisions, Routing, Optimization, Sustainability |
| **VPC-3** `ProductBusinessLayer` | Product & Business | S4, S11 | Product Lifecycle, Seller Analytics, Business Dashboards |
| **VPC-4** `CentralPlatform` | Central Knowledge | S12 + EventBridge + DynamoDB + CloudWatch | System of Record, Knowledge Graph, Cross-Service Learning |

> **Communication:** EventBridge + HTTP via ALB. No VPC peering required.

---

## 🔍 Service #2: Truth Discovery Engine
**VPC:** VPC-1 — Intelligence Layer
**Status:** ✅ Live (AWS ECS Fargate) — *Validation & Security Hardened* 🔒
**Base URL:** `http://Circul-Truth-HR7ES9usthBv-33182633.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/truth/analyze` | Run AI-driven root cause detection on a customer return |
| `GET` | `/docs` | Swagger UI |

---

## 🛡️ Service #3: Fraud & Trust Engine
**VPC:** VPC-1 — Intelligence Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/fraud/score` | Score a return for fraud risk |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/metrics` | Service Metrics |

---

## 📦 Service #4: Product Digital Twin
**VPC:** VPC-3 — Product & Business Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Digit-XXDMcCWoqhd0-1019952249.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET`  | `/health` | Health Check |
| `POST` | `/api/v1/products` | Create a new Digital Twin |
| `GET`  | `/api/v1/products/{product_id}` | Fetch full Twin state |
| `POST` | `/api/v1/products/{product_id}/events` | Process FRAUD or RECOVERY events |
| `GET`  | `/api/v1/products/{product_id}/timeline` | Fetch chronological event timeline |
| `GET`  | `/docs` | Swagger UI |

---

## 🔮 Service #5: Future Simulator
**VPC:** VPC-2 — Recovery Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Simul-a4nmYbuxVUrr-319139381.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/simulation/run` | Run multi-scenario recovery simulation |
| `GET` | `/docs` | Swagger UI |

---

## ⚖️ Service #6: Recovery Optimizer
**VPC:** VPC-2 — Recovery Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Optim-mcZ0NzPDZK07-890558390.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/recovery/optimize` | Select optimal recovery decision |
| `GET` | `/docs` | Swagger UI |

---

## 🚚 Service #7: Reverse Logistics Optimizer
**VPC:** VPC-2 — Recovery Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Logis-hgIeVqBbAk0h-362510022.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/logistics/optimize` | Determine optimal warehouse route & cost |
| `GET` | `/docs` | Swagger UI |

---

## 🧠 Service #12: Learning & Knowledge Graph
**VPC:** VPC-4 — Central Knowledge Platform
**Status:** ✅ Live (AWS ECS Fargate + Neptune Graph DB)
**Base URL:** `http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/fraud-cases/` | Ingest fraud case from Service #3 |
| `GET` | `/api/v1/intelligence` | Graph Intelligence UI |
| `GET` | `/api/v1/customers` | Customer graph |
| `GET` | `/api/v1/products` | Product graph |
| `GET` | `/api/v1/returns` | Returns graph |
| `GET` | `/api/v1/recovery-actions` | Recovery actions graph |
| `GET` | `/docs` | Swagger UI |

---

## 📦 Service #10: Packaging Intelligence
**VPC:** VPC-1 — Intelligence Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Packa-b3m8VxW0Yk7t-294029482.us-east-1.elb.amazonaws.com`
**Swagger URL:** `http://Circul-Packa-b3m8VxW0Yk7t-294029482.us-east-1.elb.amazonaws.com/docs`
**Health URL:** `http://Circul-Packa-b3m8VxW0Yk7t-294029482.us-east-1.elb.amazonaws.com/health`
**Owner:** AI Solutions Architect Team
**VPC Assignment:** VPC-1 Intelligence Layer

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/packaging/analyze` | Analyze packaging sustainability, efficiency, and carbon footprint |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/openapi.json` | OpenAPI JSON Schema |

---

*All APIs support CORS. Success responses return HTTP 200/201. Validation errors return HTTP 422.*
