# Service #1 — Return Prevention Engine: Validation Report

This report documents the validation rules and testing outcomes of the Return Prevention Engine (S1).

---

## 1. Input Constraints & Validation Rules

The service validates all requests using Pydantic v2 schemas:

| Field | Type | Constraints | Validation Action on Failure |
| :--- | :--- | :--- | :--- |
| `customerId` | String | `min_length=1`, `max_length=100`, No whitespace-only | HTTP 422 |
| `productId` | String | `min_length=1`, `max_length=100`, No whitespace-only | HTTP 422 |
| `category` | String | `min_length=1`, `max_length=100`, No whitespace-only | HTTP 422 |
| `productRating` | Float | $0.0 \le Rating \le 5.0$, No `NaN`/`Infinity` | HTTP 422 |
| `sellerRating` | Float | $0.0 \le Rating \le 5.0$, No `NaN`/`Infinity` | HTTP 422 |
| `customerReturnRate`| Float | $0.0 \le Rate \le 1.0$, No `NaN`/`Infinity` | HTTP 422 |
| `productReturnRate` | Float | $0.0 \le Rate \le 1.0$, No `NaN`/`Infinity` | HTTP 422 |
| `price` | Float | $Price \ge 0.0$, No `NaN`/`Infinity` | HTTP 422 |
| `customerPurchaseCount`| Integer | $Count \ge 0$ | HTTP 422 |

---

## 2. Validation Test Cases & Results

All validation test cases passed successfully in the automated test run:
- **Empty Category (TC-012)**: Sending `category: ""` is rejected with HTTP 422.
- **Whitespace Category (TC-013)**: Sending `category: "   "` is rejected with HTTP 422.
- **100 Characters (Boundary Pass)**: Payload strings of exactly 100 characters validate and pass successfully (HTTP 200).
- **101 Characters (Boundary Fail)**: Payload strings of 101 characters for `customerId` (TC-014), `productId` (TC-015), or `category` (TC-016) are rejected with HTTP 422.
- **NaN / Infinity Validation (TC-017 to TC-021)**: Fields with `NaN`, `Infinity`, or `-Infinity` are blocked at schema level and return HTTP 422.
- **Null Fields**: Missing required fields or null required values are rejected with HTTP 422.
