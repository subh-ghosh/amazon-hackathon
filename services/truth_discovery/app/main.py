import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as truth_router
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
    description="Production-Grade Truth Discovery Engine for Amazon Circular Intelligence OS"
)

# CORS Policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(truth_router)

@app.get("/health", tags=["Monitoring"])
def health_check():
    """Service health probe endpoint."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "region": settings.AWS_REGION,
        "mock_aws": settings.MOCK_AWS,
        "mock_bedrock": settings.MOCK_BEDROCK
    }

if __name__ == "__main__":
    import uvicorn
    # Local dev runner
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
