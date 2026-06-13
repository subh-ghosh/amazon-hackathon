import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as fraud_router
from app.config import settings

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Fraud & Trust scoring Engine for Amazon Circular Intelligence OS"
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(fraud_router)

@app.get("/health", tags=["Monitoring"])
def health_check():
    """Endpoint for health probes."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "mock_mode": settings.MOCK_AWS_SERVICES
    }

if __name__ == "__main__":
    import uvicorn
    # Local dev runner
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
