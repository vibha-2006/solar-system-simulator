from fastapi import APIRouter
from backend.services.planet_service import get_simulation_config

router = APIRouter(prefix="/api", tags=["simulation"])


@router.get("/simulation/config")
def simulation_config():
    return get_simulation_config()