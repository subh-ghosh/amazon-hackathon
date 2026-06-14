from fastapi import APIRouter
from app.models.schemas import SimulationRequest, SimulationResponse
from app.services.simulator import simulator

router = APIRouter()

@router.post("/run", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest):
    return simulator.run_simulation(request)
