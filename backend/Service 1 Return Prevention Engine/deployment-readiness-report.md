# Service #1 — Return Prevention Engine: Deployment Readiness Report

This report outlines the configurations required for deploying the Return Prevention Engine (S1) to AWS ECS Fargate within the VPC-1 Intelligence Layer.

---

## 1. Containerization & Registry
The service is fully containerized using the provided `Dockerfile`.
- **Target Registry**: Amazon Elastic Container Registry (ECR).
- **Build Command**:
  ```bash
  docker build -t return-prevention-engine:latest ./Service_1
  ```
- **Tag & Push Command**:
  ```bash
  docker tag return-prevention-engine:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/return-prevention-engine:latest
  docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/return-prevention-engine:latest
  ```

---

## 2. AWS ECS Fargate Configuration
The task should run in **VPC-1 Private Subnets** with no public IP assigned. Traffic ingress must only be allowed from the Application Load Balancer (ALB).

### Task Definition Specifications
- **Compatibility**: `FARGATE`
- **Network Mode**: `awsvpc`
- **CPU**: `0.25 vCPU` (256 CPU units) - *Minimal resource footprint since scoring is deterministic and fast.*
- **Memory**: `0.5 GB` (512 MB)
- **Task Execution Role**: Needs permissions to pull the image from ECR and write log streams to CloudWatch.
- **Port Mappings**:
  - Container Port: `8001`
  - Host Port: `8001`
  - Protocol: `tcp`

---

## 3. Application Load Balancer (ALB) & Routing
The ALB sits in the **VPC-1 Public Subnets** and routes external API requests to the Fargate containers.
- **ALB Listener**: HTTP on Port 80 (or HTTPS on Port 443 with SSL certificate).
- **Target Group**:
  - Target Type: `ip`
  - Protocol: `HTTP`
  - Port: `8001`
- **Routing Rules**:
  - Path-based routing: Route `/api/v1/prevention/*` and `/health` to the target group.

---

## 4. ALB & ECS Health Check Configuration
The load balancer monitors the status of each container task using the `/health` endpoint.
- **Health Check Path**: `/health`
- **Protocol**: HTTP
- **Port**: `8001`
- **Healthy Threshold**: `2` consecutive successes
- **Unhealthy Threshold**: `3` consecutive failures
- **Timeout**: `3 seconds`
- **Interval**: `10 seconds`
- **Success Codes**: `200`
- **Dockerfile Healthcheck**: Standard Docker healthcheck uses python to verify endpoint accessibility within the container.

---

## 5. CloudWatch Logging & Observability
AWS Fargate outputs all stdout/stderr streams from the container to Amazon CloudWatch.
- **Log Driver**: `awslogs`
- **Log Group**: `/ecs/return-prevention-engine`
- **Log Stream Prefix**: `ecs`
- **Configuration Details**:
  ```json
  "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
          "awslogs-group": "/ecs/return-prevention-engine",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
      }
  }
  ```
The FastAPI application's logging is configured to write to stdout in the standard formats. CloudWatch automatically ingests this data, enabling full visibility and searchability.
