"""
AWS CDK Infrastructure — Neptune + ECS Fargate + EventBridge

Defines:
  - Neptune cluster (db.r5.large for hackathon)
  - ECS Fargate service for the FastAPI app
  - EventBridge bus + rules
  - Lambda function for event consumption
"""

# Template — fill in VPC and account details before deployment

INFRA_NOTES = """
# ─────────────────────────────────────────────────────────
# Neptune Cluster Setup (via AWS Console or CLI)
# ─────────────────────────────────────────────────────────

# 1. Create a Neptune cluster:
aws neptune create-db-cluster \\
    --db-cluster-identifier circular-os-neptune \\
    --engine neptune \\
    --engine-version 1.3.1.0 \\
    --availability-zones us-east-1a us-east-1b

# 2. Create a Neptune instance:
aws neptune create-db-instance \\
    --db-instance-identifier circular-os-neptune-1 \\
    --db-cluster-identifier circular-os-neptune \\
    --db-instance-class db.r5.large \\
    --engine neptune

# ─────────────────────────────────────────────────────────
# EventBridge Bus + Rules
# ─────────────────────────────────────────────────────────

# 3. Create custom event bus:
aws events create-event-bus --name circular-intelligence-bus

# 4. Create rule for Knowledge Graph consumer:
aws events put-rule \\
    --name kg-event-consumer \\
    --event-bus-name circular-intelligence-bus \\
    --event-pattern '{
        "source": ["circular-os.returns", "circular-os.fraud", "circular-os.recovery", "circular-os.lifecycle"],
        "detail-type": ["ReturnCreated", "RootCauseDiscovered", "FraudDetected", "RecoveryDecisionMade", "ProductTwinUpdated"]
    }'

# 5. Add Lambda as target:
aws events put-targets \\
    --rule kg-event-consumer \\
    --event-bus-name circular-intelligence-bus \\
    --targets "Id"="kg-lambda","Arn"="arn:aws:lambda:us-east-1:ACCOUNT_ID:function:kg-event-handler"

# ─────────────────────────────────────────────────────────
# ECS Fargate Deployment
# ─────────────────────────────────────────────────────────

# 6. Build and push Docker image:
aws ecr create-repository --repository-name knowledge-graph-service
docker build -t knowledge-graph-service .
docker tag knowledge-graph-service:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/knowledge-graph-service:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/knowledge-graph-service:latest

# 7. Create ECS task definition and service (use Fargate launch type)
# Set environment variables from .env.example

# ─────────────────────────────────────────────────────────
# Lambda Deployment
# ─────────────────────────────────────────────────────────

# 8. Package and deploy event handler:
#    Use SAM CLI or CDK to deploy app/handlers/event_bridge_handler.py
#    Handler: app.handlers.event_bridge_handler.handler
"""

if __name__ == "__main__":
    print(INFRA_NOTES)
