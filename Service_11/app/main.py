import logging
import sys
import math
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

# Configure structured logging to stdout for CloudWatch compatibility
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("seller_intelligence_service")
logger.info("Initializing Seller Intelligence Service...")

# Initialize FastAPI App
app = FastAPI(
    title="Seller Intelligence Service",
    description="S11 Microservice in VPC-3 Product & Business Layer. Aggregates returns, fraud, product lifecycle, packaging, and platform intelligence into seller dashboards.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Validation Exception Handler to prevent crashes on non-JSON compliant floats and raw exception objects in error details
def clean_validation_error(obj):
    if isinstance(obj, dict):
        return {k: clean_validation_error(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_validation_error(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj):
            return "NaN"
        elif math.isinf(obj):
            return "-Infinity" if obj < 0 else "Infinity"
    elif isinstance(obj, Exception):
        return str(obj)
    return obj

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = clean_validation_error(exc.errors())
    logger.warning(f"Request validation failed: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors}
    )

# Include Routes
app.include_router(router)

logger.info("Service routes registered successfully.")

if __name__ == "__main__":
    import uvicorn
    # Start the server locally on port 8011
    uvicorn.run("main:app", host="0.0.0.0", port=8011, reload=True)
