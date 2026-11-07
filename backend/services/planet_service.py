from backend.data.planets_data import PLANETS, PLANETS_BY_ID, CONFIG
from backend.models.planet import (
    PlanetSummary, PlanetDetail, ComparisonResult, ComparisonItem
)
from fastapi import HTTPException


def get_all_planets() -> list[PlanetSummary]:
    return [PlanetSummary(**{
        "id": p["id"],
        "name": p["name"],
        "classification": p["classification"],
        "color": p["color"],
        "type": p["type"],
        "orbital_radius_visual": p["orbital_radius_visual"],
        "size_visual": p["size_visual"],
        "has_rings": p.get("has_rings", False),
        "parent_id": p.get("parent_id"),
        "orbital_period_days": p.get("orbital_period_days", 0),
    }) for p in PLANETS]


def get_planet_by_id(planet_id: str) -> PlanetDetail:
    planet = PLANETS_BY_ID.get(planet_id)
    if not planet:
        raise HTTPException(status_code=404, detail=f"Planet '{planet_id}' not found")
    return PlanetDetail(**{
        "id": planet["id"],
        "name": planet["name"],
        "classification": planet["classification"],
        "description": planet["description"],
        "radius_km": planet["radius_km"],
        "diameter_km": planet["diameter_km"],
        "mass_kg": planet["mass_kg"],
        "mass_value": planet["mass_value"],
        "distance_from_sun_km": planet["distance_from_sun_km"],
        "distance_au": planet["distance_au"],
        "orbital_period_days": planet["orbital_period_days"],
        "rotation_period": planet["rotation_period"],
        "axial_tilt_deg": planet["axial_tilt_deg"],
        "surface_temperature": planet["surface_temperature"],
        "atmosphere": planet["atmosphere"],
        "known_moons": planet["known_moons"],
        "color": planet["color"],
        "type": planet["type"],
        "has_rings": planet.get("has_rings", False),
        "orbital_radius_visual": planet["orbital_radius_visual"],
        "size_visual": planet["size_visual"],
        "parent_id": planet.get("parent_id"),
        "facts": planet.get("facts", []),
    })


def get_planet_facts(planet_id: str) -> list[str]:
    planet = PLANETS_BY_ID.get(planet_id)
    if not planet:
        raise HTTPException(status_code=404, detail=f"Planet '{planet_id}' not found")
    return planet.get("facts", [])


def compare_planets(body_a_id: str, body_b_id: str) -> ComparisonResult:
    a = PLANETS_BY_ID.get(body_a_id)
    b = PLANETS_BY_ID.get(body_b_id)
    if not a:
        raise HTTPException(status_code=404, detail=f"Body '{body_a_id}' not found")
    if not b:
        raise HTTPException(status_code=404, detail=f"Body '{body_b_id}' not found")

    comparisons = [
        ComparisonItem(
            label="Radius",
            a_value=f"{a['radius_km']:,.1f} km",
            b_value=f"{b['radius_km']:,.1f} km",
            a_numeric=a["radius_km"],
            b_numeric=b["radius_km"],
        ),
        ComparisonItem(
            label="Diameter",
            a_value=f"{a['diameter_km']:,.1f} km",
            b_value=f"{b['diameter_km']:,.1f} km",
            a_numeric=a["diameter_km"],
            b_numeric=b["diameter_km"],
        ),
        ComparisonItem(
            label="Mass",
            a_value=a["mass_kg"],
            b_value=b["mass_kg"],
            a_numeric=a["mass_value"],
            b_numeric=b["mass_value"],
        ),
        ComparisonItem(
            label="Distance from Sun",
            a_value=f"{a['distance_au']:.3f} AU",
            b_value=f"{b['distance_au']:.3f} AU",
            a_numeric=a["distance_au"],
            b_numeric=b["distance_au"],
        ),
        ComparisonItem(
            label="Orbital Period",
            a_value=f"{a['orbital_period_days']:.2f} days" if a["orbital_period_days"] > 0 else "N/A",
            b_value=f"{b['orbital_period_days']:.2f} days" if b["orbital_period_days"] > 0 else "N/A",
            a_numeric=a["orbital_period_days"],
            b_numeric=b["orbital_period_days"],
        ),
        ComparisonItem(
            label="Rotation Period",
            a_value=a["rotation_period"],
            b_value=b["rotation_period"],
        ),
        ComparisonItem(
            label="Axial Tilt",
            a_value=f"{a['axial_tilt_deg']:.2f}°",
            b_value=f"{b['axial_tilt_deg']:.2f}°",
            a_numeric=a["axial_tilt_deg"],
            b_numeric=b["axial_tilt_deg"],
        ),
        ComparisonItem(
            label="Surface Temperature",
            a_value=a["surface_temperature"],
            b_value=b["surface_temperature"],
        ),
        ComparisonItem(
            label="Known Moons",
            a_value=str(a["known_moons"]),
            b_value=str(b["known_moons"]),
            a_numeric=float(a["known_moons"]),
            b_numeric=float(b["known_moons"]),
        ),
    ]

    # Generate insight
    if a["radius_km"] > 0 and b["radius_km"] > 0:
        ratio = max(a["radius_km"], b["radius_km"]) / min(a["radius_km"], b["radius_km"])
        bigger = a["name"] if a["radius_km"] > b["radius_km"] else b["name"]
        smaller = b["name"] if a["radius_km"] > b["radius_km"] else a["name"]
        insight = (
            f"{bigger} is approximately {ratio:.1f}x larger than {smaller} in radius. "
            f"{a['name']} is a {a['classification']} while {b['name']} is a {b['classification']}."
        )
    else:
        insight = f"Comparing {a['name']} and {b['name']} reveals fascinating differences in size, mass, and orbital properties."

    return ComparisonResult(
        body_a=get_planet_by_id(body_a_id),
        body_b=get_planet_by_id(body_b_id),
        comparisons=comparisons,
        insight=insight,
    )


def get_simulation_config() -> dict:
    return CONFIG