from pydantic import BaseModel, Field
from typing import Optional


class Wall(BaseModel):
    id: str
    start: tuple[float, float]
    end: tuple[float, float]
    thickness: float = 0.2
    height: float = 3.0
    material: str = "concrete"


class Door(BaseModel):
    id: str
    position: tuple[float, float]
    width: float = 0.9
    height: float = 2.1
    rotation: float = 0.0
    wall_id: Optional[str] = None


class Window(BaseModel):
    id: str
    position: tuple[float, float]
    width: float = 1.2
    height: float = 1.2
    sill_height: float = 0.9
    wall_id: Optional[str] = None


class Room(BaseModel):
    id: str
    name: str
    polygon: list[tuple[float, float]]
    floor_material: str = "wood"
    ceiling_height: float = 3.0


class LayoutJSON(BaseModel):
    walls: list[Wall] = []
    doors: list[Door] = []
    windows: list[Window] = []
    rooms: list[Room] = []
    scale_meters_per_pixel: Optional[float] = None


class SceneGeometry(BaseModel):
    """Geometry data sent to the frontend for Three.js rendering."""
    layout: LayoutJSON
    bounding_box: tuple[float, float, float, float]  # minX, minY, maxX, maxY


class ExportRequest(BaseModel):
    layout: LayoutJSON
    project_name: str = "BIM Export"
