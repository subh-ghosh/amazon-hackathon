from fastapi import FastAPI
from app.api.fraud import router as fraud_router

app = FastAPI(title="Fraud & Trust Engine", version="1.0.0")

app.include_router(fraud_router, prefix="/api/v1/fraud", tags=["Fraud"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Fraud & Trust Engine"}

@app.get("/metrics")
def metrics():
    return {"fraud_evaluations": 100}
