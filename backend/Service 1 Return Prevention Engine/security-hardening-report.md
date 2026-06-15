# Service #1 — Return Prevention Engine: Security Hardening Report

This report documents the security-hardening modifications applied to the Return Prevention Engine (S1).

---

## 1. Input Validation Protections

- **String Length Limits**: Strict `max_length=100` constraints have been added to the `customerId`, `productId`, and `category` fields in the Pydantic schema (`app/models/schemas.py`). This prevents denial-of-service (DoS) attempts trying to flood the container's memory with very long payload strings.
- **Whitespace Sanitization**: Custom `@field_validator` checks ensure that `category` (along with `customerId` and `productId`) cannot be empty or contain only whitespace. The strings are stripped of leading/trailing spaces during validation.
- **Injection Safety**: SQL Injection (`' OR 1=1 --`), Path Traversal (`../../../etc/passwd`), and XSS script tags (`<script>alert('x')</script>`) are parsed and treated strictly as stateless string literals. They do not trigger local database calls or HTML rendering.

---

## 2. Container Privilege Isolation

To prevent potential host-level vulnerabilities, the process execution privilege has been isolated within the Docker container.
- **Dedicated User**: Created a dedicated system user `appuser` (UID 10001) and group `appgroup` (GID 10001).
- **Process Ownership**: Granted folder ownership of `/app` to `appuser` and switched container context using `USER appuser`. The FastAPI process runs as a non-root user.

---

## 3. Communication and Schema Security
- **Unexpected Fields**: The Pydantic model parses and discards unexpected fields, preventing request pollution.
- **Null Value Enforcement**: Null values passed to required fields are rejected with HTTP 422.
