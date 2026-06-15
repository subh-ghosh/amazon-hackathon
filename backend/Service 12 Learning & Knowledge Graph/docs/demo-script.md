# Amazon Circular Intelligence OS - Judge Demo Walkthrough

**Objective:** Prove the end-to-end viability of the Circular Intelligence OS using the Live Demo Framework.

## Step 1: Scenario Orchestration
- **Action:** Open your terminal and run the orchestrator:
  ```bash
  export PYTHONPATH=.
  python "Service 12 Learning & Knowledge Graph/scripts/demo_scenarios/runner.py"
  ```
- **Narrative:** "Judges, before we show you the UI, we are injecting dozens of live data points directly into our production Amazon Neptune Knowledge Graph. We are simulating 5 distinct business flows: Normal Returns, Size Mismatches, Counterfeit Selling, Wardrobing Fraud, and Transit Damage."

## Step 2: Show Customer Purchase & Return 
- **Action:** Open the Swagger UI and execute `GET /api/v1/returns/{return_id}` using one of the IDs from the logs.
- **Narrative:** "Here is the raw graph representation of the return. Notice how the return is cleanly mapped between the Customer and the Product without relying on heavy relational tables."

## Step 3: Show the Return Journey (Graph Traversal)
- **Action:** Hit `GET /api/v1/returns/{return_id}/journey`
- **Narrative:** "Here you can see the absolute power of the Graph. With a single `O(1)` query, we fetched the entire lifecycle of a returned shoe. From the exact timestamp the customer bought it, to the Truth Discovery engine assigning a `SIZE_MISMATCH` root cause, down to the routing engine successfully restocking the item."

## Step 4: Show Fraud Detection (Intelligence)
- **Action:** Hit `GET /api/v1/intelligence/sellers/{seller_id}`
- **Narrative:** "But the graph doesn't just track objects; it tracks behavior. By querying Seller Intelligence, we can see this seller is directly linked to a cluster of `COUNTERFEIT` root causes. Our Fraud Engine automatically computed a CRITICAL Risk Score, quarantining the seller from the platform without human intervention."

## Step 5: Show Recovery Decision Effectiveness
- **Action:** Hit `GET /api/v1/intelligence/analytics/recovery-effectiveness`
- **Narrative:** "Finally, because we map the Truth back to the Recovery Action, Amazon can measure the financial ROI of our decisions. You can see precisely how much revenue we salvage via liquidation versus refurbishment, strictly broken down by the root cause of the return."
