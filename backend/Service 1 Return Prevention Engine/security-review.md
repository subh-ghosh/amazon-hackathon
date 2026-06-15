# Security Review - Return Prevention Engine (Service #1)

This report audits the security posture of the Return Prevention Engine (S1) microservice, identifying potential vulnerabilities and recommending robust mitigations.

---

## 1. Input Injection & Payloads

### SQL Injection (SQLi)
- **Status**: **Safe** (Low Risk)
- **Findings**: The Return Prevention Engine is currently stateless and does not query or write to any relational databases. Thus, SQL injection attempts (e.g., `' OR '1'='1`) will pass validation as strings but cannot cause SQL execution.
- **Recommendation**: Sanitization is still recommended if inputs are sent downstream to database services or logged into SQL-based log aggregators.

### Cross-Site Scripting (XSS)
- **Status**: **Medium Risk** (Log/Display vulnerabilities)
- **Findings**: If a client sends HTML or Javascript payload strings (e.g., `<script>alert(1)</script>`) in `customerId`, `productId`, or `category`, the FastAPI service parses it successfully. While S1 does not render HTML, returning this payload directly in the JSON output or printing it to standard logs could trigger XSS in customer support dashboards or log analytics.
- **Recommendation**: Sanitize input strings to strip html tags or escape them.

### Buffer Overflows / Memory Exhaustion
- **Status**: **Medium Risk**
- **Findings**: There are no length limits on string fields like `customerId` and `productId`. If an attacker submits a 10MB string, the Pydantic parser will ingest and process it, consuming substantial memory resources.
- **Recommendation**: Implement `max_length=100` on ID fields in the Pydantic model.

---

## 2. API Schema Integrity

### Malformed JSON
- **Status**: **Safe** (Handled by FastAPI)
- **Findings**: Sending malformed JSON (e.g. trailing commas, missing braces) triggers a standard `400 Bad Request` or `422 Unprocessable Entity` response from FastAPI/Uvicorn, preventing backend parsing errors.

### Null Values
- **Status**: **Safe** (Handled by Pydantic)
- **Findings**: Required fields configured without default values will reject `null` entries with HTTP `422`.

### Unexpected Fields
- **Status**: **Safe** (Ignored by default)
- **Findings**: Passing unexpected fields (e.g. `{"extra_field": "val"}`) does not cause crashes. Pydantic silently ignores extra fields during parsing.

---

## 3. Communication Security

### Unencrypted Ingress
- **Status**: **Risk**
- **Findings**: S1 exposes port `8001` via unencrypted HTTP.
- **Recommendation**: In production, terminate SSL (HTTPS) at the Application Load Balancer (ALB) before routing traffic to Fargate.

### Open CORS Policies
- **Status**: **Risk**
- **Findings**: The service enables `allow_origins=["*"]`.
- **Recommendation**: Restrict origins to the specific API Gateway or internal portal URL before deployment.
