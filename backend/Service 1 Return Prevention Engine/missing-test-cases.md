# Missing Test Cases - Return Prevention Engine (Service #1)

This document specifies the additional test cases required to achieve 100% path coverage, edge case robustness, and validation boundary completeness.

---

## 1. Additional Validation & Edge Cases

### TC-022: Maximum Values
- **Input**:
  - `customerReturnRate` = 1.0
  - `productReturnRate` = 1.0
  - `productRating` = 5.0
  - `sellerRating` = 5.0
  - `customerPurchaseCount` = 10000
  - `price` = 1000000000.0
- **Expectation**: HTTP 200 OK. Correct calculation with maximum bounded rates. Risk score should evaluate to 70 (HIGH). Confidence should cap at 0.91.

### TC-023: Minimum Values
- **Input**:
  - `customerReturnRate` = 0.0
  - `productReturnRate` = 0.0
  - `productRating` = 0.0
  - `sellerRating` = 0.0
  - `customerPurchaseCount` = 0
  - `price` = 0.0
- **Expectation**: HTTP 200 OK. Correct calculation with minimum rates. Risk score should evaluate to 35 (LOW). Confidence should evaluate to 0.80.

### TC-024: Zero Purchase Count
- **Input**: `customerPurchaseCount` = 0, other values normal.
- **Expectation**: HTTP 200 OK. Risk score calculated properly. Purchase history risk component S_ph = 100.

### TC-025: Extremely High Price
- **Input**: `price` = 99999999999.99
- **Expectation**: HTTP 200 OK. Verified float data type capacity.

---

## 2. Additional Recommendation Rules Path Cases

### TC-028: High Customer Return Rate (Non-Electronics/Non-Apparel/Non-Home Category)
- **Input**: `category` = "Books", `customerReturnRate` = 0.35 (>= 0.20).
- **Expectation**: recommendedActions contains:
  - `"Review specifications carefully"`
  - `"Verify size and dimensions"`
  - (No `"Review product dimensions"`).

### TC-029: High Risk (Non-Electronics Category)
- **Input**: `category` = "Books", `customerReturnRate` = 0.45, `productReturnRate` = 0.25 (forces HIGH risk).
- **Expectation**: recommendedActions contains `"Confirm compatibility before purchase"` (instead of `"Verify compatibility before purchase"`).

### TC-030: Low Seller Rating (Critical)
- **Input**: `sellerRating` = 3.5 (< 4.5).
- **Expectation**: recommendedActions contains `"Consider another seller"` (instead of `"Check seller recommendations"`).

---

## 3. Score Boundary Transition Cases

### TC-004a: LOW Risk Boundary
- **Input**: Scoring parameters designed to calculate a score of exactly `39.0`.
- **Expectation**: `returnRiskScore` = 39, `riskLevel` = "LOW".

### TC-004b: MEDIUM Risk Lower Boundary
- **Input**: Scoring parameters designed to calculate a score of exactly `40.0`.
- **Expectation**: `returnRiskScore` = 40, `riskLevel` = "MEDIUM".

### TC-004c: MEDIUM Risk Upper Boundary
- **Input**: Scoring parameters designed to calculate a score of exactly `69.0`.
- **Expectation**: `returnRiskScore` = 69, `riskLevel` = "MEDIUM".

### TC-004d: HIGH Risk Boundary
- **Input**: Scoring parameters designed to calculate a score of exactly `70.0`.
- **Expectation**: `returnRiskScore` = 70, `riskLevel` = "HIGH".
