# Service #1 — Return Prevention Engine: Architecture Document

## Overview
The **Return Prevention Engine** (S1) is a microservice operating within the **VPC-1 Intelligence Layer** of the Amazon Circular Intelligence OS. Its main objective is to calculate return risks and generate customized recommendations for customers *prior* to a purchase decision, preventing avoidable returns at the source.

---

## VPC Architecture & Domain Design

The Circular Intelligence OS utilizes a 4-domain design to segregate services by concern. S1 resides in the **Intelligence Layer** (VPC-1) because it performs advanced predictive analysis on customer behavior, product metrics, and seller historical ratings.

```
+-------------------------------------------------------------+
|               VPC-1 Intelligence Layer                      |
|                                                             |
|   +---------------------------------------------------+     |
|   |         ECS Fargate (Return Prevention S1)        |     |
|   |                  [Port: 8001]                     |     |
|   +--------------------------+------------------------+     |
|                              |                              |
+------------------------------|------------------------------+
                               |
                               | (HTTP / JSON via ALB)
                               v
+-------------------------------------------------------------+
|               VPC-4 Central Knowledge Platform               |
|                                                             |
|   +---------------------------------------------------+     |
|   |      EventBridge + CloudWatch + Neptune Graph     |     |
|   +---------------------------------------------------+     |
+-------------------------------------------------------------+
```

---

## Technical Architecture & Request Flow

The service is built on a containerized FastAPI framework. It is stateless, making it fully horizontal-scalable and ideal for deployment on AWS ECS Fargate behind an Application Load Balancer (ALB).

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Return Prevention client
    participant ALB as Application Load Balancer
    participant S1 as Return Prevention Engine (S1)
    participant CW as AWS CloudWatch

    Customer->>ALB: POST /api/v1/prevention/analyze (Payload)
    ALB->>S1: Route traffic to Port 8001
    activate S1
    S1->>S1: Perform input validation (Pydantic v2)
    Note over S1: Reject negative price, invalid ratings, or return rates (422)
    
    S1->>S1: Run Deterministic Scoring Engine
    Note over S1: Calculate S_cr, S_pr, S_sr, S_ur, S_ph
    
    S1->>S1: Run Confidence Engine
    Note over S1: Calculate dataset reliability confidence (0.80 - 1.00)
    
    S1->>S1: Run Recommendation Rule Engine
    Note over S1: Generate tailored warnings & mitigation actions

    S1->>CW: Stream JSON logs (CloudWatch)
    S1->>ALB: HTTP 200 (PreventionResponse)
    deactivate S1
    ALB->>Customer: Return Risk Score & Recommendations
```

---

## Core Components

1. **API Router (`app/api/routes.py`)**: Exposes versioned endpoints `/api/v1/prevention/analyze` and the health endpoint `/health`.
2. **Pydantic Validation Layer (`app/models/schemas.py`)**: Uses Pydantic v2 to strictly validate input constraints at the controller level.
3. **Deterministic Scoring Engine (`app/services/scoring.py`)**: An isolated service module that computes individual risk scores and aggregates them using weighted algorithms.
4. **Recommendation Engine (`app/services/recommendations.py`)**: Analyzes risk drivers and customer purchase context to generate targeted mitigation warnings and explanations.
