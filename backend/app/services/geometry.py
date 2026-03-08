"""
Procedural 3D geometry generation from LayoutJSON.
Uses shapely for 2D ops; returns mesh data the frontend can consume.
"""
import math
from typing import Any

import numpy as np
from shapely.geometry import LineString, Polygon
from shapely.ops import unary_union

from app.models.schemas import LayoutJSON, SceneGeometry


def _wall_polygon(
    start: tuple[float, float],
    end: tuple[float, float],
    thickness: float,
) -> Polygon:
    """Return a 2D polygon representing the wall footprint."""
    line = LineString([start, end])
    return line.buffer(thickness / 2, cap_style=2)  # flat caps


def compute_bounding_box(layout: LayoutJSON) -> tuple[float, float, float, float]:
    all_points: list[tuple[float, float]] = []

    for wall in layout.walls:
        all_points.extend([wall.start, wall.end])
    for room in layout.rooms:
        all_points.extend(room.polygon)

    if not all_points:
        return (0.0, 0.0, 10.0, 10.0)

    xs = [p[0] for p in all_points]
    ys = [p[1] for p in all_points]
    return (min(xs), min(ys), max(xs), max(ys))


def generate_scene_geometry(layout: LayoutJSON) -> SceneGeometry:
    bbox = compute_bounding_box(layout)
    return SceneGeometry(layout=layout, bounding_box=bbox)


def layout_to_trimesh_scene(layout: LayoutJSON) -> dict[str, Any]:
    """
    Convert layout to a list of mesh descriptors that can be serialized to JSON
    and rendered in Three.js via BufferGeometry.

    Each mesh descriptor:
    {
        "id": str,
        "type": "wall" | "floor" | "ceiling",
        "vertices": [[x,y,z], ...],   # flat array of triangles
        "material": str,
    }
    """
    meshes = []

    for wall in layout.walls:
        footprint = _wall_polygon(wall.start, wall.end, wall.thickness)
        coords = list(footprint.exterior.coords)[:-1]  # drop duplicate closing point

        # Triangulate the top/bottom faces (simple fan triangulation for convex polys)
        base_verts = [(x, 0.0, y) for x, y in coords]
        top_verts = [(x, wall.height, y) for x, y in coords]

        tris: list[list[float]] = []

        # Bottom face (reversed winding for downward normal)
        _fan_triangulate(base_verts, tris, reverse=True)
        # Top face
        _fan_triangulate(top_verts, tris, reverse=False)
        # Side faces
        n = len(coords)
        for i in range(n):
            j = (i + 1) % n
            b0, b1 = base_verts[i], base_verts[j]
            t0, t1 = top_verts[i], top_verts[j]
            tris.extend([list(b0), list(b1), list(t0)])
            tris.extend([list(b1), list(t1), list(t0)])

        meshes.append(
            {
                "id": wall.id,
                "type": "wall",
                "vertices": tris,
                "material": wall.material,
            }
        )

    # Floor slabs per room
    for room in layout.rooms:
        if len(room.polygon) < 3:
            continue
        poly = Polygon(room.polygon)
        if not poly.is_valid:
            poly = poly.buffer(0)

        coords = list(poly.exterior.coords)[:-1]
        verts = [(x, 0.0, y) for x, y in coords]
        tris: list[list[float]] = []
        _fan_triangulate(verts, tris, reverse=True)

        meshes.append(
            {
                "id": f"floor_{room.id}",
                "type": "floor",
                "vertices": tris,
                "material": room.floor_material,
            }
        )

    return {"meshes": meshes}


def _fan_triangulate(
    verts: list[tuple[float, float, float]],
    out: list[list[float]],
    reverse: bool = False,
) -> None:
    """Simple fan triangulation from first vertex."""
    if len(verts) < 3:
        return
    pivot = verts[0]
    for i in range(1, len(verts) - 1):
        tri = [pivot, verts[i], verts[i + 1]]
        if reverse:
            tri = list(reversed(tri))
        out.extend([list(v) for v in tri])
