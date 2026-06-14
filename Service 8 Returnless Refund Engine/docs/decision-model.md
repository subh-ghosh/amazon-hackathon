# Decision Model Blueprint — Service #8: Returnless Refund Engine

This document details the mathematical formulations, threshold configurations, and logic matrices used to make decisions.

---

## 1. Mathematical Formulations

### Confidence Score
$$\text{confidenceScore} = \max\left(0, \min\left(100, \text{customerTrustScore} - \lfloor\text{fraudRiskScore} \times 0.5\rfloor\right)\right)$$

### Decision Factor Weight Normalization
For any generated list of weights $\{w_1, w_2, \dots, w_n\}$ corresponding to decision factors, we normalize them to ensure they sum to exactly 100%:
$$w_i' = \lfloor \frac{w_i}{\sum_{j=1}^n w_j} \times 100 \rfloor$$
The remaining difference $R = 100 - \sum_{i=1}^n w_i'$ is added to the factor with the largest weight to guarantee compliance.

### Cost Optimization Metrics
- **Reverse Logistics Cost**:
  $$\text{reverseLogisticsCost} = \text{returnShippingCost} + \text{processingFee}_{\text{category}}$$
- **Processing Cost**:
  - `RETURN_REQUIRED`: equal to $\text{processingFee}_{\text{category}}$
  - `MANUAL_REVIEW`: $\$2.00$
  - `REFUND_AND_DONATE` / `REFUND_AND_RECYCLE`: $\$1.00$
  - `RETURNLESS_REFUND` / `PARTIAL_REFUND`: $\$0.00$
- **Net Savings**:
  - For returnless decisions:
    $$\text{netSavings} = \text{reverseLogisticsCost} - \text{processingCost} + (\text{orderValue} - \text{refundAmount})$$
  - For standard return / manual reviews:
    $$\text{netSavings} = 0.00$$

---

## 2. Decision Tree Logic Matrix

```
                      [Is Category Forced Review?]
                                /      \
                             YES        NO
                             /            \
                [MANUAL_REVIEW]         [Is Fraud Escalated?]
                                              /      \
                                           YES        NO
                                           /            \
                              [MANUAL_REVIEW]       [Is Value >= Threshold?]
                                                          /      \
                                                       YES        NO
                                                       /            \
                                          [RETURN_REQUIRED]         [Is Grocery/Beauty?]
                                                                          /      \
                                                                       YES        NO
                                                                       /            \
                                                        [REFUND_AND_RECYCLE]      [Is Donation Eligible?]
                                                                                        /      \
                                                                                     YES        NO
                                                                                     /            \
                                                                        [REFUND_AND_DONATE]       [Is Recycling Eligible?]
                                                                                                        /      \
                                                                                                     YES        NO
                                                                                                     /            \
                                                                                        [REFUND_AND_RECYCLE]      [Is Low Value & High Shipping?]
                                                                                                                        /      \
                                                                                                                     YES        NO
                                                                                                                     /            \
                                                                                                        [RETURNLESS_REFUND]     [Is Mod Value & High Shipping?]
                                                                                                                                      /      \
                                                                                                                                   YES        NO
                                                                                                                                   /            \
                                                                                                                      [PARTIAL_REFUND]    [RETURN_REQUIRED]
```

---

## 3. Recommended Destination Matrix

| Decision | Condition | Category | Destination |
| :--- | :--- | :--- | :--- |
| **REFUND_AND_DONATE** | Any | Any | `DONATION` |
| **REFUND_AND_RECYCLE** | Any | Any | `RECYCLING` |
| **RETURNLESS_REFUND / PARTIAL_REFUND** | `NEW, OPEN_BOX, LIKE_NEW` | Electronics, Home Goods | `LIQUIDATION` |
| **RETURNLESS_REFUND / PARTIAL_REFUND** | `NEW, OPEN_BOX, LIKE_NEW` | Other | `DONATION` |
| **RETURNLESS_REFUND / PARTIAL_REFUND** | `USED, REFURBISHED` | Any | `LIQUIDATION` |
| **RETURNLESS_REFUND / PARTIAL_REFUND** | `DAMAGED` | Any | `RECYCLING` |
| **RETURN_REQUIRED** | `NEW, OPEN_BOX, LIKE_NEW, USED` | Any | `LIQUIDATION` |
| **RETURN_REQUIRED** | `DAMAGED` | Any | `RECYCLING` |
| **MANUAL_REVIEW** | Any | Any | `DISPOSAL` |
