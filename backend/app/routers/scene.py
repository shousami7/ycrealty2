"""
POST /scene/geometry — returns Three.js-ready mesh data for a given LayoutJSON.
Useful when the frontend has edited the scene and needs re-rendered geometry.
"""
from fastapi import APIRouter

from app.models.schemas import LayoutJSON
from app.services.geometry import layout_to_trimesh_scene

router = APIRouter(prefix="/scene", tags=["scene"])


@router.post("/geometry")
async def get_geometry(layout: LayoutJSON) -> dict:
    return layout_to_trimesh_scene(layout)
