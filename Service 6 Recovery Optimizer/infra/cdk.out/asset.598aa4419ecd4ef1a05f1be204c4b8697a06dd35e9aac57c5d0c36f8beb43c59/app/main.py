from fastapi import FastAPI
from app.api.recovery import router as recovery_router

app = FastAPI(title="Recovery Optimizer", version="1.0.0")

app.include_router(recovery_router, prefix="/api/v1/recovery", tags=["Recovery"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Recovery Optimizer"}
