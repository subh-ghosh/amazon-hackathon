from fastapi import APIRouter
from app.models.schemas import LogisticsRequest, LogisticsResponse
from app.services.logistics import optimizer

router = APIRouter()


@router.post("/optimize", response_model=LogisticsResponse)
def optimize_logistics(request: LogisticsRequest):
    return optimizer.optimize(request)
