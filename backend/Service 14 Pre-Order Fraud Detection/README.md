# Service 14: Pre-Order Fraud Detection Engine

A complete AI-driven fraud detection service combining deterministic heuristics (Rule Engine) with probabilistic machine learning (XGBoost Classifier) to proactively detect and block fraudulent orders in real-time.

## Features
- **Feature Engineering**: Calculates velocity, account age, and return rates.
- **Rule Engine**: Deterministic points for suspicious flags.
- **XGBoost Classifier**: ML probability engine trained on 100,000 synthetic rows.
- **Explainability**: Human-readable JSON reasons for the generated score.
- **Dashboard API**: Fully typed FastAPI integration.

## Setup & Running

This service handles its own dataset generation and ML training at build time!

```bash
cd "Service 14 Pre-Order Fraud Detection"

# Build the container (this will generate 100k rows and train XGBoost automatically)
docker build -t fraud-engine .

# Run the API
docker run -p 8021:8021 fraud-engine
```

The API will be available at `http://localhost:8021/docs` (Swagger UI).
