# 🌐 Amazon Circular Intelligence OS — API Directory

This document serves as the central registry for all deployed microservices within the Circular Intelligence OS ecosystem. Use these endpoints to connect frontends, trigger events, and validate cross-service integrations.

---

## 🏗️ VPC Architecture (Domain-Driven)

| VPC | Domain | Services |
|:---|:---|:---|
| **VPC-1** `IntelligenceVpc` | Intelligence & Decisioning | S3 (Fraud & Trust) |
| **VPC-2** `RecoveryVpc` | Recovery Optimization | S5 (Future Simulator), S6 (Recovery Optimizer), S7 (Reverse Logistics) |
| **VPC-3** `ProductSellerVpc` | Product & Seller Domain | S4, S11 *(planned)* |
| **VPC-4** `SustainabilityVpc` | Action & Sustainability | S8, S9, S10 *(planned)* |
| **VPC-5** `CentralPlatformVpc` | Central Platform | S12 (Knowledge Graph) |

Communication: **EventBridge** + **HTTP via ALB** (no VPC peering required)

---

## 🛡️ Service #3: Fraud & Trust Engine
**VPC:** VPC-1 — Intelligence & Decisioning
**Status:** ✅ Deployed (AWS ECS Fargate)
**Base URL:** `http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com`

### Endpoints
* **Interactive API Docs (Swagger):** `http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com/docs`
* **Score Fraud (Core Logic):** `POST /api/v1/fraud/score`
* **Health Check:** `GET /health`
* **Metrics:** `GET /metrics`

---

## 🔮 Service #5: Future Simulator
**VPC:** VPC-2 — Recovery Optimization
**Status:** ✅ Deployed (AWS ECS Fargate)
**Base URL:** `http://Circul-Simul-a4nmYbuxVUrr-319139381.us-east-1.elb.amazonaws.com`

### Endpoints
* **Interactive API Docs (Swagger):** `http://Circul-Simul-a4nmYbuxVUrr-319139381.us-east-1.elb.amazonaws.com/docs`
* **Run Simulation (Core Logic):** `POST /api/v1/simulation/run`
* **Health Check:** `GET /health`

---

## ⚖️ Service #6: Recovery Optimizer
**VPC:** VPC-2 — Recovery Optimization
**Status:** ✅ Deployed (AWS ECS Fargate)
**Base URL:** `http://Circul-Optim-mcZ0NzPDZK07-890558390.us-east-1.elb.amazonaws.com`

### Endpoints
* **Interactive API Docs (Swagger):** `http://Circul-Optim-mcZ0NzPDZK07-890558390.us-east-1.elb.amazonaws.com/docs`
* **Optimize Recovery (Core Logic):** `POST /api/v1/recovery/optimize`
* **Health Check:** `GET /health`

---

## 🚚 Service #7: Reverse Logistics Optimizer
**VPC:** VPC-2 — Recovery Optimization
**Status:** ✅ Deployed (AWS ECS Fargate)
**Base URL:** `http://Circul-Logis-hgIeVqBbAk0h-362510022.us-east-1.elb.amazonaws.com`

### Endpoints
* **Interactive API Docs (Swagger):** `http://Circul-Logis-hgIeVqBbAk0h-362510022.us-east-1.elb.amazonaws.com/docs`
* **Optimize Logistics (Core Logic):** `POST /api/v1/logistics/optimize`
* **Health Check:** `GET /health`

---

## 🧠 Service #12: Learning & Knowledge Graph
**VPC:** VPC-5 — Central Platform
**Status:** ✅ Deployed (AWS ECS Fargate + Neptune Graph DB)
**Base URL:** `http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com`

### Endpoints
* **Interactive API Docs (Swagger):** `http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com/docs`
* **Create Fraud Case (Ingest from Service #3):** `POST /api/v1/fraud-cases/`
* **Graph Intelligence UI:** `GET /api/v1/intelligence`
* **Customers Graph:** `GET /api/v1/customers`
* **Products Graph:** `GET /api/v1/products`
* **Returns Graph:** `GET /api/v1/returns`
* **Recovery Actions:** `GET /api/v1/recovery-actions`
* **Health Check:** `GET /health`

---

*Note: All APIs natively support Cross-Origin Resource Sharing (CORS) for the hackathon and return standard HTTP 200/201 on success or 422 for Validation Errors.*
