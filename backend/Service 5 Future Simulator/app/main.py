from fastapi import FastAPI
from app.api.simulation import router as simulation_router

app = FastAPI(title="Future Simulator", version="1.0.0")

app.include_router(simulation_router, prefix="/api/v1/simulation", tags=["Simulation"])

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Future Simulator"}

# Lambda handler for serverless deployment
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    pass  # Running in ECS, mangum not needed
