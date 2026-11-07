from pydantic import BaseModel
from typing import Optional


class PlanetSummary(BaseModel):
    id: str
    name: str
    classification: str
    color: str
    type: str
    orbital_radius_visual: float
    size_visual: float
    has_rings: bool = False
    parent_id: Optional[str] = None
    orbital_period_days: float = 0


class PlanetDetail(BaseModel):
    id: str
    name: str
    classification: str
    description: str
    radius_km: float
    diameter_km: float
    mass_kg: str
    mass_value: float
    distance_from_sun_km: float
    distance_au: float
    orbital_period_days: float
    rotation_period: str
    axial_tilt_deg: float
    surface_temperature: str
    atmosphere: str
    known_moons: int
    color: str
    type: str
    has_rings: bool = False
    orbital_radius_visual: float
    size_visual: float
    parent_id: Optional[str] = None
    facts: list[str] = []


class ComparisonItem(BaseModel):
    label: str
    a_value: str
    b_value: str
    a_numeric: Optional[float] = None
    b_numeric: Optional[float] = None


class ComparisonResult(BaseModel):
    body_a: PlanetDetail
    body_b: PlanetDetail
    comparisons: list[ComparisonItem]
    insight: str


class HealthResponse(BaseModel):
    status: str
    version: str
    message: str


class SimulationConfig(BaseModel):
    simulation: dict
    camera: dict
    rendering: dict
    visual_scale: dict
    keyboard_shortcuts: dict