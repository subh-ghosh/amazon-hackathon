# Service #1 — Return Prevention Engine: Edge Case Report

This report documents the edge cases and boundary conditions verified for the Return Prevention Engine (S1).

---

## 1. Score Boundary Transitions

We verified that the risk score transitions between designated risk levels at exact integer boundaries:
- **Score = 39**: Bounded at the upper limit of the LOW risk tier.
  - Calculated: `returnRiskScore` = 39
  - Level: `LOW`
- **Score = 40**: Bounded at the lower limit of the MEDIUM risk tier.
  - Calculated: `returnRiskScore` = 40
  - Level: `MEDIUM`
- **Score = 69**: Bounded at the upper limit of the MEDIUM risk tier.
  - Calculated: `returnRiskScore` = 69
  - Level: `MEDIUM`
- **Score = 70**: Bounded at the lower limit of the HIGH risk tier.
  - Calculated: `returnRiskScore` = 70
  - Level: `HIGH`

These boundaries ensure classification consistency without gaps.

---

## 2. Extreme and Bounded Inputs

- **Maximum Values (TC-022)**:
  - Input: `customerReturnRate` = 1.0, `productReturnRate` = 1.0, ratings = 5.0, count = 10000, price = 1000000.0.
  - Output: `returnRiskScore` = 65, `riskLevel` = "MEDIUM", `confidence` = 0.91.
- **Minimum Values (TC-023)**:
  - Input: rates = 0.0, ratings = 0.0, count = 0, price = 0.0.
  - Output: `returnRiskScore` = 35, `riskLevel` = "LOW", `confidence` = 0.80.
- **New Customer (TC-026)**:
  - Input: `customerPurchaseCount` = 0.
  - Output: Correctly triggers S_ph = 100 and appends explanation `"Customer has limited purchase history"`.
- **Repeat Return Customer (TC-027)**:
  - Input: `customerReturnRate` = 1.0.
  - Output: Triggers S_cr = 100 and appends explanation `"Customer has elevated return history"`.
