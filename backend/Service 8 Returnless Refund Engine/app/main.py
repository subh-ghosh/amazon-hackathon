import logging
import sys
import math
import time
import uuid
import json
from datetime import datetime, timezone
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

# Configure base logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("returnless_refund_service")
logger.info("Initializing Returnless Refund Service...")

# Initialize FastAPI App
app = FastAPI(
    title="Returnless Refund Service",
    description="S8 Microservice in VPC-4 Recovery & Circular Economy Layer. Analyzes return shipping costs, product values, fraud scores, customer trust, and condition to evaluate optimal circular routing.",
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

# Custom Validation Exception Handler to prevent crashes on non-JSON compliant floats
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

# Tracing and Structured Logging Middleware
@app.middleware("http")
async def correlation_id_and_logging_middleware(request: Request, call_next):
    # Capture or generate Correlation ID
    corr_id = request.headers.get("X-Correlation-ID") or request.headers.get("x-correlation-id")
    if not corr_id:
        corr_id = str(uuid.uuid4())
        
    request.state.correlation_id = corr_id
    request.state.requestId = "N/A"
    request.state.decision = "N/A"
    
    start_time = time.perf_counter()
    
    try:
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = corr_id
        status_code = response.status_code
        return response
    except Exception as e:
        logger.error(f"Request failed processing: {str(e)}", exc_info=True)
        status_code = 500
        # Return standard internal error response with correlation header
        response = JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred while processing your request."}
        )
        response.headers["X-Correlation-ID"] = corr_id
        return response
    finally:
        latency = int((time.perf_counter() - start_time) * 1000)
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Output structured request log to stdout
        log_data = {
            "timestamp": timestamp,
            "correlationId": corr_id,
            "requestId": getattr(request.state, "requestId", "N/A"),
            "decision": getattr(request.state, "decision", "N/A"),
            "statusCode": status_code,
            "latencyMs": latency
        }
        # Print JSON string representation to stdout
        print(json.dumps(log_data), flush=True)

# Include Router
app.include_router(router)

logger.info("Service routes registered successfully.")

if __name__ == "__main__":
    import uvicorn
    # Start server locally on port 8008
    uvicorn.run("main:app", host="0.0.0.0", port=8008, reload=True)

# Lambda serverless handler
from mangum import Mangum
handler = Mangum(app)
