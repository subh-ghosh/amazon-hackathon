# Architecture: Service 2 (Truth Discovery Engine)

## Overview
Service 2 acts as the core intelligence engine within **VPC-1**. It evaluates customer return requests against historical product and seller data to ascertain the factual ground truth of a claim.

## Components
1. **FastAPI Application**: Exposes high-performance HTTP endpoints.
2. **Amazon Bedrock (Claude 3.5 Sonnet)**: Analyzes return notes, customer history, and images to predict the root cause.
3. **Service #12 Integration**: Fetches dynamic knowledge graphs for seller and product histories to contextualize the claim.
4. **EventBridge Publisher**: Emits asynchronous `RootCauseDiscovered` events for downstream processing (e.g. Service #3 Fraud Engine).
5. **DynamoDB**: Persists the raw analysis results.

## Deployment
Deployed on AWS ECS Fargate via AWS CDK, identical to other services in the Intelligence and Recovery layers.
