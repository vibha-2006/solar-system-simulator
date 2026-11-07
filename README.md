# Solar System Simulator — Interactive 3D Solar System Simulator

A complete interactive 3D Solar System Simulator with a desktop OpenGL application, browser-based WebGL app, and a REST API backend.

---

## Features

- **Interactive 3D Solar System** — All 8 planets, Sun, Moon, Saturn's rings, 3,000+ stars
- **Orbital simulation** — Real orbital periods, axial rotation, Moon orbiting Earth
- **Adjustable simulation speed** — 1× to 1000×, pause/resume at any time
- **Planet information panel** — Scientific stats, atmosphere, moons, educational facts
- **Planet comparison** — Side-by-side comparison of any two celestial bodies
- **Camera controls** — Orbit, pan, zoom, reset
- **Keyboard shortcuts** — Full keyboard navigation
- **Premium dark-space UI** — Glassmorphism, dark charcoal palette, blue accents

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Desktop app | Python 3.14, pygame-ce, ModernGL, OpenGL 3.3 Core, GLSL, NumPy, PyGLM, Pillow |
| Backend API | Python 3.14, FastAPI, Pydantic, Uvicorn |
| Browser frontend | React 18, TypeScript, Vite 6, Three.js, React Three Fiber, Zustand |

---

## Project Structure

```
Solar System Simulator/
├── refrences/              Reference design images
├── desktop/
│   ├── main.py             Desktop entry point
│   ├── core/               Window, camera
│   ├── rendering/          OpenGL renderer, geometry
│   ├── shaders/            GLSL shaders (planet, orbit, ring, star)
│   ├── ui/                 Pygame HUD overlay
│   └── controls/           Input handler, keyboard/mouse
├── backend/
│   ├── main.py             FastAPI app entry point
│   ├── routes/             API route handlers
│   ├── models/             Pydantic models
│   ├── services/           Business logic
│   └── data/               Data loader
├── frontend/
│   └── src/
│       ├── components/     Navbar, Sidebar, InfoPanel, ComparePanel
│       ├── three/          Three.js Solar System scene, Canvas
│       ├── hooks/          useStore (Zustand), usePlanetData, useKeyboard
│       ├── services/       API client (Axios)
│       ├── styles/         Global CSS design system
│       └── types/          TypeScript interfaces
├── shared/
│   ├── planetary_data/     planets.json — scientific data for all 10 bodies
│   └── simulation_config/  config.json — simulation parameters
├── start_backend.bat       Launch backend
├── start_frontend.bat      Launch frontend
├── start_desktop.bat       Launch desktop app
└── start_all.bat           Launch everything
```

---

## Quick Start

### Prerequisites
- Python 3.12+ with pip
- Node.js 18+ with npm

### Install

```bash
# Backend
pip install fastapi uvicorn pydantic

# Desktop
pip install pygame-ce moderngl numpy pillow pyglm

# Frontend
cd frontend
npm install
```

### Run

```bash
# Option 1: Use startup scripts (Windows)
start_all.bat        # Launches backend + frontend, then optionally desktop

# Option 2: Manual

# Backend (from project root)
python -m uvicorn backend.main:app --reload --port 8000

# Frontend (from frontend/)
npm run dev

# Desktop (from project root)
python desktop/main.py
```

---

## URLs

| Service | URL |
|---------|-----|
| Browser app | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API documentation | http://localhost:8000/docs |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/planets` | List all celestial bodies |
| GET | `/api/planets/{id}` | Get planet details |
| GET | `/api/planets/{id}/facts` | Get educational facts |
| GET | `/api/compare?body_a=X&body_b=Y` | Compare two bodies |
| GET | `/api/simulation/config` | Simulation configuration |

Planet IDs: `sun`, `mercury`, `venus`, `earth`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `moon`

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Pause / Resume simulation |
| R | Reset camera |
| O | Toggle orbital paths |
| C | Open comparison mode |
| F | Fullscreen |
| Escape | Close panel |
| ↑ / ↓ | Increase / Decrease speed |
| + / − | Zoom in / out |
| L | Cycle planet selection |
| 1–9, 0 | Select planet by number (desktop) |

---

## Desktop vs Browser Rendering

| | Desktop | Browser |
|---|---------|---------|
| Renderer | OpenGL 3.3 Core (via ModernGL) | WebGL (via Three.js) |
| Shaders | GLSL 330 core | Three.js ShaderMaterial / Standard |
| Window | pygame-ce | React + Vite |
| 2D UI | pygame Surface | React components |
| Planet textures | Procedural colors | Procedural colors |

The desktop app uses genuine **OpenGL 3.3 Core Profile** through **ModernGL** as required. The browser app uses **WebGL** through **Three.js** / **React Three Fiber**, which is the correct browser-compatible equivalent. Both render the same Solar System with the same data.

---

## Visual Scale Note

Visual scale is adjusted for aesthetics and visibility. Real scale would make the inner planets sub-pixel sized against the outer planets' orbital distances. Size exaggeration factor: ~25×. Distance compression: ~0.08× of actual AU.

---

## Known Limitations

1. **Planet textures**: Uses procedural solid/gradient colors rather than photographic textures (no external texture downloads required)
2. **Desktop on Python 3.14**: pygame binary wheels for Python 3.14 are only available via `pygame-ce` (community edition), which is functionally equivalent
3. **Desktop OpenGL**: Requires a display to run (cannot headless-test GPU rendering in CI)
4. **Browser fonts**: Inter and JetBrains Mono load from Google Fonts; may fall back to system fonts offline
