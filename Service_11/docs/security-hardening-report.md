# Service #11 — Seller Intelligence Engine: Security Hardening Report

This report outlines the security measures, input validations, container controls, and serialization rules implemented to protect **Service #11** (S11) from common vulnerabilities and system exploits.

---

## 1. Container Isolation & Process Control
- **Non-Root User Context**: The container runs under a dedicated, low-privilege system account (`appuser` with UID/GID 10001). This prevents attackers from executing administrative operations inside the host system or reading host resource parameters if the container is compromised.
- **Port Exposure Policy**: The container strictly exposes Port `8011` to the private subnet of VPC-3. Direct public internet access is prohibited; traffic must traverse the Application Load Balancer (ALB).

---

## 2. Input Hardening & Parameter Sanitization
Pydantic v2 schemas (`app/models/schemas.py`) define strict boundaries on all fields:
- **String Length Enforcements**: To prevent buffer overflow attempts, memory exhaustion attacks, or database flooding, string attributes are capped:
  - `sellerId` $\le 100$ characters
  - `sellerName` $\le 200$ characters
  - `productId` $\le 100$ characters
  - `category` $\le 100$ characters
  - `insight` $\le 500$ characters
- **Empty & Whitespace Rejection**: Field validators trim inputs and reject string attributes that are empty or consist solely of whitespace, preventing empty database indexes.
- **Numeric Boundary Controls**: Range enforcements protect the scoring logic:
  - `totalOrders`, `totalReturns`, `fraudCases` must be $\ge 0$.
  - `averageRating` is bounded to $[0.0, 5.0]$.
  - `packagingScore`, `returnRate` are bounded to $[0.0, 100.0]$.
  - Cross-field validations ensure `totalReturns \le totalOrders` and `fraudCases \le totalReturns`, blocking logically corrupt inputs.

---

## 3. Malformed Request & Overflow Protection
- **Forbid Extra Attributes**: The Pydantic request models are configured with `model_config = ConfigDict(extra="forbid")`. If a client submits a payload containing unexpected properties, the request is immediately rejected with an `HTTP 422` error, preventing mass-assignment vulnerability exploits.
- **Non-Finite Float Rejection**: Standard JSON parsers may crash or misbehave when encountering non-finite float parameters like `NaN`, `Infinity`, or `-Infinity`. S11 registers custom float field validators that raise a validation exception if these values are passed, returning a clean validation error body.

---

## 4. Structured Exception Safety & Safe Serialization
- **Information Leakage Prevention**: In the main application (`app/main.py`), a global validation exception handler captures `RequestValidationError` errors and passes them through a clean-up handler (`clean_validation_error`). This replaces any raw Python exception references in the error message with clean strings, preventing the exposure of internal codebase paths or stack traces.
- **Internal Error Catching**: Route handlers wrap business operations in `try-except` blocks. If an unexpected error occurs, a generic `HTTP 500` error is returned, while the detailed trace is logged securely to `sys.stdout` for CloudWatch analysis.

---

## 5. Cross-Origin Resource Sharing (CORS) Security
- **Origin Control**: CORS is enabled to allow frontend dashboards to consume the API.
- **Next Steps**: For production environments, the allow-origins wildcard (`*`) should be replaced with the explicit domain names of the dashboard applications (e.g., `https://seller.circular-intelligence.amazon.com`).
