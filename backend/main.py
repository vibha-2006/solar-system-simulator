from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.planets import router as planets_router
from backend.routes.simulation import router as simulation_router
from backend.models.planet import HealthResponse

app = FastAPI(
    title="Solar System Simulator — Solar System Simulator API",
    description="Backend API for the Solar System Simulator Interactive 3D Solar System Simulator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(planets_router)
app.include_router(simulation_router)


@app.get("/api/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        version="1.0.0",
        message="Solar System Simulator Solar System Simulator API is running",
    )
