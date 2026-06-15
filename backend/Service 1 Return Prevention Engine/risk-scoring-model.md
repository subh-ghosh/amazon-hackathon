# Service #1 — Return Prevention Engine: Risk Scoring Model

## Mathematical Formula Design

The Return Prevention Engine calculates a **return risk score** ($RiskScore \in [0, 100]$) using a weighted combination of 5 distinct risk drivers.

### 1. Customer Return Rate Risk ($S_{cr}$)
Represents the historical return rate of the customer. The engine scales the return rate relative to a critical baseline of $35\%$.
$$S_{cr} = \min\left(100, \frac{customerReturnRate}{0.35} \times 100\right)$$
- **Weight**: $35\%$ ($0.35$)
- **Rationale**: A customer's historical return rate is the strongest predictor of their future return behavior. A return rate of $35\%$ or above represents critical risk, yielding $100$ points for this driver.

### 2. Product Return Rate Risk ($S_{pr}$)
Represents the historical return rate of the product. The engine scales this relative to a critical baseline of $18\%$.
$$S_{pr} = \min\left(100, \frac{productReturnRate}{0.18} \times 100\right)$$
- **Weight**: $30\%$ ($0.30$)
- **Rationale**: High return rates for individual items suggest sizing, description, or compatibility issues. A product return rate of $18\%$ or above represents maximum product risk, yielding $100$ points for this driver.

### 3. Seller Rating Risk ($S_{sr}$)
Represents the quality and trust of the seller. A high rating decreases risk.
$$S_{sr} = (5.0 - sellerRating) \times 20$$
- **Weight**: $15\%$ ($0.15$)
- **Rationale**: Low-rated sellers are more likely to ship products that do not match expectation or have defect issues. A rating of $5.0$ has $0$ risk, while a rating of $0.0$ has $100$ risk.

### 4. Product Rating Risk ($S_{ur}$)
Represents customer satisfaction with the product. A high rating decreases risk.
$$S_{ur} = (5.0 - productRating) \times 20$$
- **Weight**: $10\%$ ($0.10$)
- **Rationale**: Products with poor reviews indicate design issues, sizing discrepancies, or high return likelihood. A rating of $5.0$ has $0$ risk, while a rating of $0.0$ has $100$ risk.

### 5. Purchase History Risk ($S_{ph}$)
Measures how established the customer is. More purchases reduce the risk score.
$$S_{ph} = \max\left(0, 100 - (customerPurchaseCount \times 2.5)\right)$$
- **Weight**: $10\%$ ($0.10$)
- **Rationale**: Customers with extensive purchase histories are more familiar with the platform and display more stable purchasing habits. Customers with $40$ or more purchases have $0$ purchase history risk, whereas new customers ($0$ purchases) have $100$ risk.

---

## Final Risk Score Calculation

The final risk score is computed as:
$$RiskScore = 0.35 \times S_{cr} + 0.30 \times S_{pr} + 0.15 \times S_{sr} + 0.10 \times S_{ur} + 0.10 \times S_{ph}$$

The calculated score is rounded to the nearest integer.

---

## Risk Level Classification

| Score Range | Risk Level |
| :--- | :--- |
| $0$ - $39$ | **LOW** |
| $40$ - $69$ | **MEDIUM** |
| $70$ - $100$ | **HIGH** |

---

## Confidence Score Engine

The confidence score ($Confidence \in [0.80, 1.00]$) indicates the reliability of the prediction based on data completeness.

- **Base Confidence**: $0.80$
- **Purchase History Modifier**: $+0.05$ if $customerPurchaseCount \ge 20$
- **Product Review Count Modifier**: $+0.03$ if $productRating \ge 4.0$
- **Seller History Modifier**: $+0.03$ if $sellerRating \ge 4.5$

$$Confidence = \min(1.00, 0.80 + Modifier_{ph} + Modifier_{pr} + Modifier_{sr})$$

### Example (Demo Scenario):
- Input: `customerPurchaseCount` = 22, `productRating` = 4.2, `sellerRating` = 4.7
- Confidence: $0.80 + 0.05 + 0.03 + 0.03 = 0.91$
