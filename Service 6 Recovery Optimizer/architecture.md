# Service #6 Recovery Optimizer — Architecture

## Overview
The Recovery Optimizer acts as the final decision layer in the Circular Intelligence OS pipeline. It receives simulated recovery paths from Service #5 (Future Simulator) and applies a sophisticated, deterministic Operations Research algorithm to select the absolute best business outcome.

## Component Design
* **Framework**: FastAPI (Python 3.11)
* **Data Validation**: Pydantic strictly enforces mathematical boundaries (e.g. `confidence` between 0 and 1).
* **Core Service**: `RecoveryOptimizer` engine located in `app/services/optimizer.py`. This engine loops through simulations and calculates weighted multi-variate optimization scores.

## Data Flow
1. **Ingest**: Consumes JSON array of potential scenarios (Restock, Refurbish, Recycle, etc.)
2. **Penalty/Bonus Phase**: Mutates baseline variables based on external context (`fraudScore`, `sellerTrustScore`).
3. **Score Calculation**: Executes the math formula.
4. **Decision Output**: Selects the highest scoring scenario and auto-generates human-readable reasoning strings explaining exactly *why* the algorithm made that choice.

## Infrastructure
* **Container**: `python:3.11-slim`
* **Network Binding**: Exposed on `0.0.0.0:8006`
* **Target Environment**: AWS ECS Fargate
