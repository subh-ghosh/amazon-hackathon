from fastapi import FastAPI
from app.api.logistics import router as logistics_router

app = FastAPI(title="Reverse Logistics Optimizer", version="1.0.0")

app.include_router(logistics_router, prefix="/api/v1/logistics", tags=["Logistics"])


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Reverse Logistics Optimizer"}
