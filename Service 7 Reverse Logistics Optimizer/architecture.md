# Service #7 — Reverse Logistics Optimizer — Architecture

## Overview
The Reverse Logistics Optimizer is the fourth stage in the Circular Intelligence OS pipeline. It consumes the recommended recovery decision from Service #6 (Recovery Optimizer) and determines the **optimal physical path** for a returned product — which warehouse to route it to, what the route looks like, what it costs, how long it takes, and its carbon footprint.

## Component Design
| File | Role |
| :--- | :--- |
| `app/main.py` | FastAPI bootstrap, health endpoint, router registration |
| `app/api/logistics.py` | HTTP controller — accepts and returns validated JSON |
| `app/models/schemas.py` | Pydantic input/output contract enforcement |
| `app/services/logistics.py` | Core multi-dimensional scoring engine |

## Scoring Engine Design
The engine loops over all submitted warehouses and calculates four independent dimension scores per warehouse, then combines them into a weighted `LogisticsScore`. It also applies decision-specific cost rates and route templates so the output route text precisely reflects the recovery action.

## Data Flow
```
POST /api/v1/logistics/optimize
        │
        ▼
 Pydantic Validation ── 422 if invalid
        │
        ▼
 LogisticsOptimizer.optimize()
  ├── For each warehouse → _compute_scores()
  │     ├── carbon_score     (distance penalty)
  │     ├── speed_score      (days estimate)
  │     ├── cost_efficiency  (rate × km)
  │     └── capacity_score   (direct 0-100)
  └── Select max composite score
        │
        ▼
 Build reasoning + route template
        │
        ▼
 Return LogisticsResponse
```

## Infrastructure
- **Framework:** FastAPI + Pydantic (Python 3.11)
- **Container:** `python:3.11-slim`, port `8007`
- **Platform:** AWS ECS Fargate behind an Application Load Balancer
