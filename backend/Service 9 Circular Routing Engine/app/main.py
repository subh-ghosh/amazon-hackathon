import logging
import sys
import math
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.middleware import CorrelationIdMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("circular_routing_engine")

app = FastAPI(
    title="Circular Routing Engine",
    description="S9 Microservice determining optimal circular economy recovery paths.",
    version="1.0.0"
)

app.add_middleware(CorrelationIdMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors}
    )

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8009, reload=True)

# Lambda serverless handler
from mangum import Mangum
handler = Mangum(app)
