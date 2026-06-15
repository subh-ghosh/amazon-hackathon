# QA Gap Analysis - Return Prevention Engine (Service #1)

This document identifies gaps between the current implementation of the Return Prevention Engine (S1) and a fully production-ready, bulletproof microservice.

---

## 1. Validation Gaps
- **Category Validation**: The `category` field in `PreventionRequest` is defined as a plain `str` without any validation checks. A request with `category: "   "` or `category: ""` will bypass validation and could cause unexpected behavior in the recommendation engine (e.g. category matching).
- **String Length Limits**: The `customerId` and `productId` fields enforce `min_length=1` and whitespace checks, but do not set a `max_length`. This opens up vulnerability to extremely long string inputs (buffer/memory consumption risks).
- **String Character Set Rules**: The fields do not restrict characters. This allows XSS payloads or SQL injection syntax to pass validation (though they don't execute locally, they represent log injection risks).

---

## 2. Test Coverage Gaps
- **Untested Recommendation Branches**: The current test suite does not exercise:
  - High customer return rates on a non-electronics/non-apparel/non-home category (expecting `"Review specifications carefully"` and `"Verify size and dimensions"`).
  - Risk Level HIGH on a non-electronics category (expecting `"Confirm compatibility before purchase"` instead of `"Verify compatibility before purchase"`).
  - Seller rating in $[4.0, 4.5)$ (expecting `"Consider another seller"` instead of `"Check seller recommendations"`).
  - Product return rate $\ge 0.20$ (expecting `"Compare alternatives"` and `"Read recent reviews"`).
  - Product rating $< 4.0$ (expecting `"Review customer feedback"`).
- **Missing Integration & Security Tests**: The existing test suite has no tests for security payloads (SQLi, XSS, Buffer Overflow, Malformed JSON) or high-load conditions.

---

## 3. Deployment & Reliability Gaps
- **No Rate Limiting**: The API does not have throttling or rate limiting, leaving it vulnerable to DoS attacks.
- **Unprivileged User in Docker**: The `Dockerfile` runs the container as `root`. For production-grade security, the service should run under an unprivileged user (e.g. `nobody` or a custom system user).
- **No Auth Layer**: Endpoints are public, meaning any client can call `/api/v1/prevention/analyze` without an API key or IAM authentication.
- **CORS Configuration**: CORS allows all origins (`allow_origins=["*"]`), which is standard for a hackathon but should be restricted to trusted domains in production.
