# 🌐 Amazon Circular Intelligence OS — API Directory

This document serves as the central registry for all deployed microservices within the Circular Intelligence OS ecosystem. Use these endpoints to connect frontends, trigger events, and validate cross-service integrations.

---

## 🛡️ Service #3: Fraud & Trust Engine
**Status:** ✅ Deployed (AWS ECS Fargate)
**Base URL:** `http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com`

### Endpoints
* **Interactive API Docs (Swagger):** `http://Circul-Fraud-Q25TuVtGjWhU-36938543.us-east-1.elb.amazonaws.com/docs`
* **Score Fraud (Core Logic):** `POST /api/v1/fraud/score`
* **Health Check:** `GET /health`
* **Metrics:** `GET /metrics`

---

## 🧠 Service #12: Learning & Knowledge Graph
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

## 🔮 Service #5: Future Simulator
**Status:** ✅ Deployed (AWS ECS Fargate)
**Base URL:** `http://Circul-Simul-SzjwBMv6t7vM-2094024921.us-east-1.elb.amazonaws.com`

### Endpoints
* **Interactive API Docs (Swagger):** `[Base_URL]/docs`
* **Run Simulation (Core Logic):** `POST /api/v1/simulation/run`
* **Health Check:** `GET /health`

---
*Note: All APIs natively support Cross-Origin Resource Sharing (CORS) for the hackathon and return standard HTTP 200/201 on success or 422 for Validation Errors.*
