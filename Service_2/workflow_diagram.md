# Amazon Circular Intelligence OS
## AI Intelligence Layer: End-to-End Workflow Diagram

This document illustrates the step-by-step workflow of the **Truth Discovery Engine (TDE)** and the **Fraud & Trust Engine (FTE)** as a customer return progresses from initial request to physical check-in and refund validation.

---

## 1. End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    actor Agent as Warehouse Agent
    participant App as Return Portal / Scanner App
    participant EB as AWS EventBridge
    participant TDE as Truth Discovery Engine (Port 8001)
    participant FTE as Fraud & Trust Engine (Port 8002)
    participant OS as Amazon OpenSearch (Vector DB)
    participant Neptune as Amazon Neptune (Graph DB)
    participant DDB as AWS DynamoDB (Single Table)
    participant Bedrock as AWS Bedrock (Claude 3.5 / Titan)

    %% PHASE 1: RETURN INITIATION
    Note over Customer, TDE: Phase 1: Return Request & Truth Discovery
    Customer->>App: Initiates Return (Inputs Stated Reason + Comment + Photos)
    App->>TDE: Trigger Analysis (POST /api/v1/truth/analyze)
    
    rect rgb(200, 220, 240)
        Note over TDE, Bedrock: TDE Processing Pipeline
        TDE->>Bedrock: Generate Titan Embeddings of Comment
        Bedrock-->>TDE: Returns Vector Embeddings (1024 dims)
        TDE->>OS: Query Semantically Similar Cases & Reviews
        OS-->>TDE: Returns matching historical reviews/cases
        TDE->>DDB: Fetch Catalog Product Details & Metadata
        DDB-->>TDE: Returns product specifications/description
        TDE->>Bedrock: Input context to Claude 3.5 Sonnet (Reasoning)
        Bedrock-->>TDE: Returns actualRootCause, confidence, evidence, actions
    end

    TDE->>DDB: Save Root Cause Result (SK: ANALYSIS#TRUTH)
    TDE->>EB: Publish ReturnAnalysisCompleted Event
    TDE-->>App: Return Root Cause Response (e.g. Expectation Mismatch)

    %% PHASE 2: WAREHOUSE CHECK-IN & FRAUD ASSESSMENT
    Note over Agent, FTE: Phase 2: Warehouse Check-in & Fraud Scoring
    Customer->>Agent: Ships/Drops off package
    Agent->>App: Scans item package & captures physical photos of item
    App->>FTE: Score Transaction Risk (POST /api/v1/fraud/score)

    rect rgb(240, 220, 200)
        Note over FTE, Bedrock: FTE Processing Pipeline
        FTE->>Neptune: Gremlin Query (Shared Device MAC / Credit Card Hash)
        Neptune-->>FTE: Returns linked accounts, blacklist matches, and neighborhood risk
        FTE->>DDB: Fetch Customer Profile History (Order Count, Past Returns)
        DDB-->>FTE: Returns totalReturns and totalOrders
        FTE->>Bedrock: Claude 3.5 Sonnet Multimodal Vision Inspection
        Bedrock-->>FTE: Returns visualScore (Swap / Wardrobe / Empty-box flags)
        FTE->>FTE: Score Aggregation (Graph 40% + Vision 40% + History 20%)
    end

    FTE->>DDB: Save Fraud Metrics & Increment Customer Return Counter
    FTE->>EB: Publish FraudScoreComputed Event (e.g. MANUAL_REVIEW)
    FTE-->>App: Fraud Scoring Response (e.g. Fraud Score: 0.84, Action: Manual Review)
```

---

## 2. Detailed Phase Breakdown

### Phase 1: Customer Request & Truth Discovery (Return portal)
1. **Intake**: A customer initiates a return online, choosing a checkbox reason (e.g., "Defective") and typing a comment (e.g., *"The camera screen won't turn on, it just displays black lines"*).
2. **Text Embedding**: The comment is vectorized into a 1024-dimensional vector using `amazon.titan-embed-text-v2`.
3. **Semantic Querying**: OpenSearch checks if other reviews or historical returns for that product category mention similar symptoms (e.g. a known hardware incompatibility or user manual error).
4. **Logical Inference**: Claude 3.5 evaluates all inputs. If reviews identify that a device does not pair with iOS 17, and the customer complains of connection failure, Claude corrects the stated "Defective" reason to a true root cause of **"Software Compatibility"**, saving downstream processing costs on intact electronics.
5. **Decoupled Egress**: The computed root cause is saved in DynamoDB and sent to EventBridge, which updates the seller dashboard to alert them to update their product listing.

### Phase 2: Warehouse Check-in & Fraud Prevention (Physical audit)
1. **Package Scan**: The package is received at the logistics node. The agent scans the package code and takes a photo of the contents.
2. **Graph Network Check**: Neptune checks if the customer's hardware fingerprint (`deviceId`) or payment options have been used by previously blocked return-abuser accounts.
3. **Multimodal Inspection**: Claude 3.5 Sonnet compares the physical return photo with catalog benchmarks:
   - **Wardrobing**: Scans for creasing, wrinkles, missing tags, or re-attached tags on clothing.
   - **Swapping**: Inspects if details like logos, model numbers, or casing colors deviate from standard catalog photos.
   - **Empty-box**: Scans if the package consists of empty cardboard/bubble-wrap.
4. **Score Merging**: The system aggregates Neptune Graph Risk, visual anomalies, and customer refund-to-order frequencies.
5. **Immediate Action**: If risk is `LOW`, an automated refund triggers. If `HIGH`, the refund is blocked, and the item is routed to inspection supervisors for manual review.
