from fastapi import APIRouter, Query
from backend.models.planet import PlanetSummary, PlanetDetail, ComparisonResult
from backend.services.planet_service import (
    get_all_planets, get_planet_by_id, get_planet_facts, compare_planets
)

router = APIRouter(prefix="/api", tags=["planets"])


@router.get("/planets", response_model=list[PlanetSummary])
def list_planets():
    return get_all_planets()


@router.get("/planets/{planet_id}", response_model=PlanetDetail)
def get_planet(planet_id: str):
    return get_planet_by_id(planet_id)


@router.get("/planets/{planet_id}/facts", response_model=list[str])
def get_facts(planet_id: str):
    return get_planet_facts(planet_id)


@router.get("/compare", response_model=ComparisonResult)
def compare(
    body_a: str = Query(..., description="ID of the first celestial body"),
    body_b: str = Query(..., description="ID of the second celestial body"),
):
    return compare_planets(body_a, body_b)