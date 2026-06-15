# AWS Deployment Risk Review - Return Prevention Engine (S1)

This report evaluates AWS Fargate deployment parameters and highlights potential risks for Service #1.

---

## 1. Container Security Risks

### Privileged Container Execution
- **Risk**: High
- **Description**: The Dockerfile uses `FROM python:3.11-slim` and does not define a `USER` instruction, meaning the application process runs as the root user. If the container is compromised, the attacker has root privileges inside the container.
- **Mitigation**: Create an unprivileged user (e.g. `appuser`) in the Dockerfile and switch to it before the execution command:
  ```dockerfile
  RUN groupadd -r appgroup && useradd -r -g appgroup appuser
  USER appuser
  ```

---

## 2. Resource Sizing & Autoscaling

### Fargate Sizing Discrepancies
- **Risk**: Low
- **Description**: Since the scoring engine is entirely deterministic and requires no external database connections or CPU-bound model training, the resource requirements are extremely low. A task size of 0.25 vCPU and 512 MB memory is appropriate.
- **Mitigation**: Monitor CPU and Memory utilization under real production traffic. Set autoscaling triggers on Fargate tasks if CPU/Memory utilization exceeds 70%.

---

## 3. ALB Health Checking & Timeouts

### Connection Ingress Restrictions
- **Risk**: Medium
- **Description**: The container listens on port `8001`. Security Groups must be configured to block all inbound traffic except from the Application Load Balancer (ALB) Security Group. If public IPs are enabled, the microservice could be accessed directly, bypassing ALB protections.
- **Mitigation**: Deploy Fargate tasks in **Private Subnets** only, and block public IP associations.

### Health Check Path Availability
- **Risk**: Low
- **Description**: S1 provides an active, light health check path at `/health` returning status `healthy` and HTTP 200. This is compatible with ALB health checking.
- **Mitigation**: Ensure the health check interval is set to 10 seconds with a timeout of 3 seconds to quickly isolate and replace failed tasks.

---

## 4. Observability & Logging

### CloudWatch Stream Volume
- **Risk**: Low
- **Description**: The application writes structural logs to stdout using Python's standard `logging` library. CloudWatch logs will capture this.
- **Mitigation**: Configure Log retention on the `/ecs/return-prevention-engine` log group (e.g., 30 days) to optimize CloudWatch storage costs.
