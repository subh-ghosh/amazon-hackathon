from fastapi import APIRouter
from app.models.schemas import OptimizeRequest, OptimizeResponse
from app.services.optimizer import optimizer

router = APIRouter()

@router.post("/optimize", response_model=OptimizeResponse)
def optimize_recovery(request: OptimizeRequest):
    return optimizer.optimize(request)
