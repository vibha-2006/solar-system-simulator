import json
from pathlib import Path

_DATA_FILE = Path(__file__).parent.parent.parent / "shared" / "planetary_data" / "planets.json"
_CONFIG_FILE = Path(__file__).parent.parent.parent / "shared" / "simulation_config" / "config.json"


def load_planets() -> list[dict]:
    with open(_DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["planets"]


def load_config() -> dict:
    with open(_CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


PLANETS = load_planets()
CONFIG = load_config()
PLANETS_BY_ID = {p["id"]: p for p in PLANETS}