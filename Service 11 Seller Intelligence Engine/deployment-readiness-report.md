# Service #11 — Seller Intelligence Engine: Deployment Readiness Report

This report evaluates the deployment readiness of **Service #11** (S11) for containerized hosting on AWS ECS Fargate, routing via Application Load Balancers (ALB), logging in CloudWatch, and handling CORS requests.

---

## 1. Containerization (Docker)
The service is containerized using a secure, lightweight, and hardened configuration.
- **Base Image**: `python:3.11-slim` (minimal image size, reducing attack surface).
- **Environment Settings**:
  - `PYTHONDONTWRITEBYTECODE=1`: Disables writing `.pyc` files, keeping the filesystem clean.
  - `PYTHONUNBUFFERED=1`: Ensures stdout/stderr logs are flushed immediately to CloudWatch without buffering.
  - `PORT=8011`: Maps to the container port.
- **Security Hardening**:
  - Group `appgroup` (GID 10001) and User `appuser` (UID 10001) are created.
  - All project files under `/app` are owned by `appuser`.
  - The image switches to `appuser` (`USER appuser`) prior to execution, preventing root-access escalation vulnerabilities.
- **Port Exposure**: Exposes Port `8011`.

---

## 2. AWS ECS Fargate Configuration
The service is fully compatible with serverless AWS ECS Fargate tasks:
- **Network Mode**: `awsvpc` (assigns a dedicated ENI with a private IP address in VPC-3).
- **Resource Allocation**:
  - CPU: `256` (0.25 vCPU)
  - Memory: `512` (512 MB)
  - This allocation is optimal for stateless HTTP API routing and deterministic calculations.
- **Essential Mappings**: The container is flagged as essential, meaning the task terminates if this container crashes.

---

## 3. Application Load Balancer (ALB) Routing
The service integrates behind the VPC-3 Application Load Balancer:
- **Port Target**: ALB forwards requests on path `/api/v1/seller/*` and `/health` to container port `8011`.
- **Health Check Configuration**:
  - Protocol: `HTTP`
  - Path: `/health`
  - Port: `8011`
  - Interval: 10s
  - Timeout: 3s
  - Retries: 3
  - Start Period: 5s
- **CORS Configuration**:
  - Built-in FastAPI `CORSMiddleware` configured to allow traffic from dashboard origins (`allow_origins=["*"]`). All request headers and methods are accepted.

---

## 4. CloudWatch Log Configuration
Structured logging is enabled out-of-the-box:
- **Log Driver**: `awslogs`
- **Stream Target**: `/ecs/seller-intelligence-service`
- **Region**: `us-east-1` (or local region)
- **Formatting**: Logs are printed as structured key-value lines to standard output (`sys.stdout`) for instant ingestion and parsing by CloudWatch Insights.

---

## 5. Health Check Verification Command
Local health checks can be simulated within the ECS host using the following Python command (which does not depend on external tools like `curl` or `wget`):
```bash
python -c "import urllib.request; urllib.request.urlopen('http://localhost:8011/health')"
```
This is configured as the Docker container `HEALTHCHECK` and ECS task definition health check command, returning exit code 0 if healthy, or 1 if failing.

---

## 6. Deployment Command Checklist
To deploy S11 to AWS ECR and ECS Fargate:

1. **Build the Docker Image**:
   ```bash
   docker build -t seller-intelligence-service:latest -f Dockerfile .
   ```
2. **Authenticate with AWS ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   ```
3. **Tag and Push Image**:
   ```bash
   docker tag seller-intelligence-service:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/seller-intelligence-service:latest
   docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/seller-intelligence-service:latest
   ```
4. **Register ECS Task Definition**:
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```
5. **Update ECS Service**:
   ```bash
   aws ecs update-service --cluster business-analytics-cluster --service seller-intelligence-service --force-new-deployment
   ```
