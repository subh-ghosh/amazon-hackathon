from fastapi import FastAPI, Request
from app.api.fraud import router as fraud_router
from app.core.logging import request_id_ctx, logger
import uuid

app = FastAPI(title="Fraud & Trust Engine", version="1.0.0")

@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    req_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    request_id_ctx.set(req_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    return response

app.include_router(fraud_router, prefix="/api/v1/fraud", tags=["Fraud"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Fraud & Trust Engine"}

@app.get("/metrics")
def metrics():
    return {"status": "healthy", "metrics_collected": True}

# Lambda handler for serverless deployment
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    pass  # Running in ECS, mangum not needed
