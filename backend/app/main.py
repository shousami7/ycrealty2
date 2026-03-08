from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import export, scene, upload

app = FastAPI(title="AI BIM Platform", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(scene.router)
app.include_router(export.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
