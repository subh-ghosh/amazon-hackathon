# Security Hardening Report — Service #8: Returnless Refund Engine

This document outlines the security controls implemented to protect Service 8 (Returnless Refund Engine) against common OWASP risks, inputs vulnerabilities, and operational threats.

---

## 1. Schema Hardening & Strict Validation

- **Pydantic ConfigDict**: Every model is configured with `ConfigDict(extra="forbid")`. Any request containing extra or unrecognized parameters is rejected with HTTP 422 immediately, preventing parameter injection attacks.
- **String Sanitization**: Validators reject empty strings and whitespace-only strings. All string fields undergo `.strip()` during parsing.
- **Numeric Verification**: Floats (`orderValue`, `returnShippingCost`, `weightKg`, `maxReturnlessValue`) reject `NaN` and `Infinity` explicitly, avoiding downstream computation errors or CPU denial-of-service.
- **Value Bounds**: Scores (`fraudRiskScore`, `returnRiskScore`, `customerTrustScore`) are capped between `0` and `100`.

---

## 2. Exception Sanitization & Serialization

- **Request Validation Exception Handler**: Intercepts Pydantic validation errors and converts them using a recursive `clean_validation_error` helper.
- **Prevention of Float Leakage**: Detects if error objects contain mathematical float values (`NaN`, `Infinity`) and serializes them as strings (`"NaN"`, `"Infinity"`) to comply with standard JSON parsing specifications.
- **No Traceback Exposure**: Ensures standard exceptions return a generic HTTP 500 error page with no stack traces or source paths leaked to the user.

---

## 3. Container Security Hardening

- **Non-Root Runtime**: The container switches to `appuser` (UID/GID 10001) before execution, ensuring the process has zero administrative privileges on the host system.
- **Read-Only Systems**: Base image uses `python:3.11-slim` to reduce package attack surface.

---

## 4. Rate Limiting Control

- **Token Bucket Limiter**: Protects REST endpoints using an in-memory client-IP token bucket.
- **Capacity limits**: Default rate allows `20` requests per second with a burst capacity of `50` requests. Clients exceeding limits are throttled with HTTP 429.

---

## 5. Tracing and Logging Protection

- **Correlation ID Middleware**: Generates and attaches tracing headers to log events.
- **Log Masking**: Prevents logging sensitive fields like raw customer names or card information.
