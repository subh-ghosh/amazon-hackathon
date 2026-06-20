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

## 🛡️ Service #1: Return Prevention Engine
**VPC:** VPC-1 — Intelligence Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Preve-LR6DbKamKWdv-928899529.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/prevention/analyze` | Assess return risk & generate confidence-backed prevention actions |
| `GET` | `/docs` | Swagger UI |

---
## 🔍 Service #2: Truth Discovery Engine
**VPC:** VPC-1 — Intelligence Layer
**Status:** ✅ Live (AWS ECS Fargate) — *Validation & Security Hardened* 🔒
**Base URL:** `http://Circul-Truth-h1F0FkRvcVsk-801111338.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/truth/analyze` | Run AI-driven root cause detection on a customer return |
| `GET` | `/docs` | Swagger UI |

---

## 🛡️ Service #3: Fraud & Trust Engine
**VPC:** VPC-1 — Intelligence Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Fraud-XcBUDzI1MwrU-1950216713.us-east-1.elb.amazonaws.com`

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
**Base URL:** `http://Circul-Digit-1KUgWt1Obxuk-628222820.us-east-1.elb.amazonaws.com`

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
**Base URL:** `http://Circul-Simul-4WKIzeeG23Pg-1522722278.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/simulation/run` | Run multi-scenario recovery simulation |
| `GET` | `/docs` | Swagger UI |

---

## ⚖️ Service #6: Recovery Optimizer
**VPC:** VPC-2 — Recovery Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Optim-VznHSwftfNgj-1405514615.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/recovery/optimize` | Select optimal recovery decision |
| `GET` | `/docs` | Swagger UI |

---

## 🚚 Service #7: Reverse Logistics Optimizer
**VPC:** VPC-2 — Recovery Layer
**Status:** ✅ Live (AWS ECS Fargate)
**Base URL:** `http://Circul-Logis-tlTDwNs1Omzx-39457157.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/logistics/optimize` | Determine optimal warehouse route & cost |
| `GET` | `/docs` | Swagger UI |

---

## 💸 Service #8: Returnless Refund Engine
**VPC:** VPC-2 — Recovery Layer
**Status:** ✅ Live (AWS ECS Fargate) — *Validation & Security Hardened* 🔒
**Base URL:** `http://Circul-Retur-3aJGuOitxrQQ-1157813753.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/returnless/evaluate` | Evaluates if a return qualifies for a Returnless Refund, Partial Refund, or Donation |
| `POST` | `/api/v1/returnless/batch-evaluate` | Bulk evaluations (Sync or Async) |
| `GET` | `/docs` | Swagger UI |

---

## 🔄 Service #9: Circular Routing Engine
**VPC:** VPC-4 — Central Knowledge Platform (Cross-Layer Circular Economy)
**Status:** ✅ Live (AWS ECS Fargate) — *Validation & Security Hardened* 🔒
**Base URL:** `http://Circul-Circu-jsU6YMlH3H2K-853712911.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/logistics/optimize` | Determines the optimal facility factoring Recovery, Cost, Carbon, and Capacity |
| `POST` | `/api/v1/logistics/batch-optimize` | Bulk array optimization |
| `GET` | `/api/v1/logistics/analytics` | Real-time Thread-safe Ops Metrics |
| `GET` | `/docs` | Swagger UI |

---

## ♻️ Service #10: Packaging Intelligence
**VPC:** VPC-1 — Intelligence Layer
**Status:** ✅ Live (AWS ECS Fargate) — *Validation & Security Hardened* 🔒
**Base URL:** `http://Circul-Packa-ZPto7mjaCRIO-560627207.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/packaging/analyze` | Analyzes sustainability, efficiency, recyclability, carbon footprint, and returns optimization recommendations. |
| `GET` | `/docs` | Swagger UI |

---

## 📈 Service #11: Seller Intelligence Engine
**VPC:** VPC-3 — Product & Business Layer
**Status:** ✅ Live (AWS ECS Fargate) — *Validation & Security Hardened* 🔒
**Base URL:** `http://Circul-Selle-VYLlrHB2ylcJ-1969622883.us-east-1.elb.amazonaws.com`

| Method | Endpoint | Purpose |
|:---|:---|:---|
| `GET` | `/health` | Health Check |
| `POST` | `/api/v1/seller/analyze` | Generates seller health, fraud, return, and sustainability scores based on historical behavior |
| `GET` | `/api/v1/seller/{sellerId}/dashboard` | Retrieves the aggregated Seller Intelligence Dashboard and insights |
| `GET` | `/docs` | Swagger UI |

---

## 🧠 Service #12: Learning & Knowledge Graph
**VPC:** VPC-4 — Central Knowledge Platform
**Status:** ✅ Live (AWS ECS Fargate + Neptune Graph DB)
**Base URL:** `http://Circul-Graph-IIxBpeJf0S3j-1441021229.us-east-1.elb.amazonaws.com`

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

*All APIs support CORS. Success responses return HTTP 200/201. Validation errors return HTTP 422.*
