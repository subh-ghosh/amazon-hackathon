# Optimization Formula

The Recovery Optimizer relies on a strictly deterministic scoring engine that evaluates 4 key dimensions of a returned product scenario.

### The Core Formula

```text
OptimizationScore = (recoveryValue * 0.50)
                  + (carbonSavings * 0.20)
                  + (confidence * 100 * 0.20)
                  - (processingTimeDays * 10 * 0.10)
```

**Note**: `carbonSavings` is calculated by directly negating the `carbonImpact` returned from Service 5 (Future Simulator).

### Conditional Modifiers

Before the formula runs, contextual risk factors aggressively modify the input variables:

#### 1. Seller Trust Penalty
If `sellerTrustScore < 0.5`:
* **Penalty**: `confidence = confidence * 0.8`
* **Reasoning**: Low-trust sellers introduce unseen quality risks that lower our certainty of successful recovery.

#### 2. Fraud Risk Penalty
If `fraudScore > 70` AND `recoveryValue > 5000`:
* **Penalty**: `recoveryValue = recoveryValue * 0.5`
* **Reasoning**: Extremely high fraud risk on expensive items means we must heavily discount the predicted recovery value to account for likely total loss or severe damage.

#### 3. Sustainability Bonus
If `scenario == "Recycle"` or `scenario == "Donate"`:
* **Bonus**: `carbonSavings += 50`
* **Reasoning**: Acts as an artificial weight to elevate pure sustainability plays when the profit margins of other paths are highly risky or marginal.
