# Service #11 — Seller Intelligence Engine: Scoring Model Document

This document outlines the mathematical formulas, rules, and logic used in the S11 scoring and analytics modules. The models are designed to be explainable, consistent, deterministic, and business-realistic.

---

## 1. Core Performance Scores

### Seller Health Score (0-100)
The Health Score is a weighted index representing the seller's overall operational health. It aggregates rating quality, packaging sustainability, return rate impact, and fraud exposure.
$$\text{Seller Health Score} = \text{round}(0.4 \cdot C_{\text{rating}} + 0.3 \cdot S_{\text{sustainability}} + 0.2 \cdot H_{\text{return}} + 0.1 \cdot H_{\text{fraud}})$$

Where:
- $C_{\text{rating}} = \frac{\text{averageRating}}{5.0} \cdot 100$
- $S_{\text{sustainability}} = \text{sustainabilityScore}$
- $H_{\text{return}} = \max(0.0, 100.0 - \text{returnsPer100Orders} \cdot 2.0)$
- $H_{\text{fraud}} = \max(0.0, 100.0 - \text{fraudRiskScore})$

> [!NOTE]
> **Division by Zero Protection & Zero Orders Handling**
> If `totalOrders = 0`, the Health Score immediately defaults to `0`, override checks are run, and no division by zero exceptions are thrown.

### Seller Tier
Health scores map directly to performance tiers:
- **Health Score $\ge$ 90**: `PLATINUM` (Top tier operational status)
- **Health Score $\ge$ 80**: `GOLD` (Stable and healthy)
- **Health Score $\ge$ 70**: `SILVER` (Minor inefficiencies detected)
- **Health Score $<$ 70**: `NEEDS_ATTENTION` (High risk / operational review required)

---

## 2. Risk Scoring Models

### Return Risk Score (0-100)
Indicates the level of risk associated with product returns.
$$\text{Return Risk Score} = \min(100.0, \text{returnsPer100Orders} \cdot 5.0 + R_{\text{max\_product}} \cdot 1.5 + 3.75) \quad (\text{if returns} > 0)$$
Where:
- $R_{\text{max\_product}}$ is the maximum return rate among the seller's individual products. If no products are specified, it defaults to the overall return rate percentage.
- If total returns is 0 or totalOrders is 0, the Return Risk Score is 0.

### Fraud Risk Score (0-100)
Reflects the threat level from return abuse and fraud incidents.
$$\text{Fraud Risk Score} = \min(100.0, \text{fraud\_rate} \cdot 40.0 + \text{fraudCases} \cdot 0.1 + 2.5) \quad (\text{if fraudCases} > 0)$$
Where:
- $\text{fraud\_rate} = \frac{\text{fraudCases}}{\text{totalOrders}} \cdot 100$
- If fraudCases is 0 or totalOrders is 0, the Fraud Risk Score is 0.

### Overall Risk Level
Classifies the seller into one of four overall risk bands:
- **`CRITICAL`**: If $\text{fraudRiskScore} \ge 50$ or $\text{returnRiskScore} \ge 75$
- **`HIGH`**: If $\text{fraudRiskScore} \ge 30$ or $\text{returnRiskScore} \ge 50$ or $\text{healthScore} < 70$
- **`MEDIUM`**: If $\text{fraudRiskScore} \ge 15$ or $\text{returnRiskScore} \ge 30$ or $\text{healthScore} < 80$
- **`LOW`**: Otherwise.

---

## 3. Sustainability Scoring & Indicators

### Sustainability Score (0-100)
Evaluates packaging sustainability combined with recovery outcomes:
$$\text{Sustainability Score} = \text{round}(0.8 \cdot \text{packagingScore} + 0.1 \cdot D_{\text{donation}} + 0.1 \cdot R_{\text{recycling}})$$
Where:
- $D_{\text{donation}}$ is the donationRate of returned stock. Defaults to `packagingScore` if unspecified.
- $R_{\text{recycling}}$ is the recyclingRate. Defaults to `packagingScore` if unspecified.

---

## 4. Executive KPIs & Benchmarking

### Estimated Revenue Loss
Represents the estimated direct financial impact from returned items:
$$\text{estimatedRevenueLoss} = \text{totalReturns} \cdot \text{AVG\_RETURN\_COST}$$
Where $\text{AVG\_RETURN\_COST} = \$14.12$, representing the industry average cost per return (comprising customer service, reverse transport, inspection, and write-down values). If `totalOrders = 0`, it defaults to `0.0`.

### Returns Per 100 Orders
Direct metric representing return frequency:
$$\text{returnsPer100Orders} = \frac{\text{totalReturns}}{\text{totalOrders}} \cdot 100.0 \quad (\text{if totalOrders} > 0 \text{ else } 0.0)$$

### High Risk Products Classification
Individual products are audited and flagged if their return rate is $> 5.0\%$:
- **Return Rate $> 10.0\%$**: `HIGH` risk level.
- **Return Rate $5.0\% \rightarrow 10.0\%$**: `MEDIUM` risk level.
- **Return Rate $\le 5.0\%$**: `LOW` risk level.

Reasons are assigned strictly by the following priority order (only one primary reason is assigned):
1. **`QUALITY_DEFECT`**: If the return rate of the product is $\ge 15.0\%$.
2. **`TRANSIT_DAMAGE`**: If the product category matches packaging materials (e.g., `"packaging"`, `"box"`).
3. **`SIZE_MISMATCH`**: If the product category matches apparel and fashion items (e.g., `"apparel"`, `"cloth"`, `"shoe"`, `"fashion"`).
4. **`EXPECTATION_MISMATCH`**: Default fallback reason for all other categories.

### Benchmarking Model
Sellers are compared dynamically to platform averages:
- **Health Percentile**: Directly represented by the calibrated Health Score.
- **Return Performance**:
  - $< 2\%$ returns: `EXCELLENT`
  - $2\% \rightarrow 5\%$: `ABOVE_AVERAGE`
  - $5\% \rightarrow 10\%$: `AVERAGE`
  - $10\% \rightarrow 15\%$: `BELOW_AVERAGE`
  - $\ge 15\%$: `POOR`
- **Fraud Performance**:
  - $< 0.2\%$ fraud rate: `EXCELLENT`
  - $0.2\% \rightarrow 0.5\%$: `GOOD`
  - $0.5\% \rightarrow 1.5\%$: `AVERAGE`
  - $\ge 1.5\%$: `POOR`
- **Sustainability Performance**:
  - Score $\ge 85$: `EXCELLENT`
  - Score $70 \rightarrow 85$: `GOOD`
  - Score $50 \rightarrow 70$: `AVERAGE`
  - Score $< 50$: `POOR`

---

## 5. Confidence Score (0-100)
Represents the reliability of the calculated metrics based on data availability and completeness:
- **Base Score**: 50
- **Orders completeness**: Up to $+15$ points based on scale: $\min(15, \text{round}(\log_{10}(\text{totalOrders}) \cdot 3.75))$.
- **Products granularity**: $+10$ points if detailed products are provided.
- **Rating metadata**: $+5$ points if ratings are provided ($> 0$).
- **Packaging metadata**: $+5$ points if packaging score is provided ($> 0$).
- **Returns validation**: $+2$ points if returns are greater than 0.

> [!IMPORTANT]
> **Safety Cap Rule**
> The confidence score is strictly capped to ensure it remains in the interval $[0, 100]$:
> $$\text{confidenceScore} = \max(0, \min(100, \text{calculated\_confidence}))$$

---

## 6. Risk Breakdown Normalization
The risk breakdown model tracks the relative contributions to the seller's overall risk:
- Returns Contribution
- Fraud Contribution
- Sustainability Contribution
- Rating Contribution

To ensure consistency in user dashboards, the sum of these contributions is mathematically normalized to sum exactly to 100:
$$\text{returnsContribution} + \text{fraudContribution} + \text{sustainabilityContribution} + \text{ratingContribution} = 100$$
Any rounding residues or deviations are dynamically absorbed by the largest risk contributor.

---

## 7. Executive Summary & Priority Action Ranking

### Executive Summary Generation
Dynamically builds a text summary:
`"Seller health is [health_desc] with [fraud_desc] and [ret_desc]. Sustainability performance [sust_desc]."`
This summary is displayed directly on executive panels.

### Priority Actions
Identifies and orders up to 3 actions based on their contribution weight (highest risk gets highest priority):
1. **Reduce size mismatch returns** (Triggered if returnRiskScore > 50)
2. **Improve packaging sustainability** (Triggered if packagingScore < 80)
3. **Investigate return fraud patterns** (Triggered if fraudRiskScore > 15)
4. **Enhance product description accuracy** (Triggered if averageRating < 4.5)
