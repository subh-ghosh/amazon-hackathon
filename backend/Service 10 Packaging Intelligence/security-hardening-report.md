# Service #10 — Packaging Intelligence: Security Hardening Report

This report outlines the security design, mitigations, and hardening steps implemented in the Packaging Intelligence Service (S10).

---

## 1. Input Validation & Type Safety (Pydantic v2)
S10 strictly validates all inputs at the API ingress layer to prevent malformed or malicious payloads from reaching downstream business logic.

- **String Constraints**: `productId`, `category`, and `packagingMaterial` are bounded with a maximum length of 100 characters using Pydantic `Field(..., max_length=100)`. This prevents extremely large string injection attacks designed to consume excessive RAM or cause buffer overflows.
- **Empty & Whitespace Rejection**: Custom validators verify that strings are not empty or filled only with whitespace characters.
- **Numeric Limits**: All float inputs (`productWeight`, `packagingWeight`, `length`, `width`, `height`) must be strictly positive (`gt=0.0`). Negative or zero values are rejected immediately with HTTP 422.

---

## 2. Prevention of NaN and Infinity Crashes
In standard Python/FastAPI, unvalidated float fields can accept `NaN` (Not a Number) or `Infinity` inputs, which can propagate through mathematical logic and lead to division-by-zero errors or crash calculations (returning HTTP 500 or leaving the process hung).

- **Mitigation**: A custom Pydantic validator `check_numeric_safety` intercepts all floats. If `math.isnan(v)` or `math.isinf(v)` is detected, it raises a validation exception.
- **Error Safety**: The custom exception handler sanitizes validation errors to ensure raw exception structures or raw float representations of NaN/Inf do not leak details in HTTP responses.

---

## 3. Container Security & Non-Root Execution
Running a Docker container as `root` is a significant security risk, as any remote code execution vulnerability in the application could give the attacker root privileges on the underlying host.

- **Non-Root User Configuration**: The Dockerfile builds a group `appgroup` (GID 10001) and a user `appuser` (UID 10001).
- **Permissions**: Ownership of the `/app` working directory is recursively transferred to `appuser:appgroup`.
- **Instruction**: The `USER appuser` directive enforces that the application process runs with restricted permissions.
- **Container Hardening**: No shell access is granted to `appuser` (`/bin/sh` shell is restricted).

---

## 4. Secure JSON Serialization
To prevent JSON serialization issues when returning responses that might contain float-like calculations, the FastAPI exception handler uses a clean validation error scanner. This ensures that any unexpected calculation outputs (e.g. if NaN/Inf were to occur downstream) are mapped to standard string representations rather than crashing the JSON serializer.

---

## 5. Denial of Service (DoS) Ingress Mitigations
- **Small Task Footprint**: Fargate tasks are allocated `0.25 vCPU` and `512 MB` of memory.
- **ALB Request Buffering**: The AWS Application Load Balancer buffers incoming requests and filters out invalid HTTP verbs, protecting the service from direct slowloris or malformed packet flood attacks.
