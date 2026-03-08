# AI BIM Platform

**AI design agency for Building Information Model**

Upload a floor plan — we produce quick exterior pars and turn it into a 3D model for BIM workflows.

---

## Overview

This platform uses AI vision to interpret architectural floor plans and generate Building Information Models (BIM). You upload a floor plan (PNG, JPG, WebP, or PDF), and the system:

1. Extracts layout (walls, doors, windows, rooms)
2. Produces quick exterior parses and visualizations
3. Builds a procedural 3D scene
4. Exports industry-standard IFC for downstream BIM tools

---

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your API keys
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Run Both
```bash
./dev.sh
```

---

## MVP Phases

| Phase | Status |
|-------|--------|
| 1. Upload + AI extraction | scaffolded |
| 2. Procedural 3D + Three.js viewer | scaffolded |
| 3. Basic editing (select/properties) | scaffolded |
| 4. IFC export | scaffolded |

---

## Tech Stack

- **Frontend**: React, TypeScript, React Three Fiber, Tailwind, Zustand
- **Backend**: FastAPI, IfcOpenShell, Shapely, Trimesh
- **AI**: Google AI Studio (Gemini), Claude, or GPT-4o — configure via `VISION_PROVIDER` and `GOOGLE_API_KEY` in `.env`
