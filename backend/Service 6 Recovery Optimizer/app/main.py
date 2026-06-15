import math
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.api.recovery import router as recovery_router

app = FastAPI(title="Recovery Optimizer", version="1.0.0")

app.include_router(recovery_router, prefix="/api/v1/recovery", tags=["Recovery"])

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    for error in errors:
        if 'input' in error:
            val = error['input']
            if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                error['input'] = str(val)
    return JSONResponse(status_code=422, content={"detail": errors})

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Recovery Optimizer"}
