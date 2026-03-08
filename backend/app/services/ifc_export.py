"""
IFC export via IfcOpenShell.
Converts LayoutJSON into a valid IFC 4 file.
"""
import math
import tempfile
import uuid
from datetime import datetime
from pathlib import Path

import ifcopenshell
import ifcopenshell.api.aggregate
import ifcopenshell.api
import ifcopenshell.api.context
import ifcopenshell.api.geometry
import ifcopenshell.api.project
import ifcopenshell.api.root
import ifcopenshell.api.spatial
import ifcopenshell.api.unit
import ifcopenshell.geom
import ifcopenshell.util.placement
import ifcopenshell.util.shape_builder as sb
import numpy as np

from app.models.schemas import LayoutJSON, Wall


def _guid() -> str:
    return ifcopenshell.guid.compress(uuid.uuid4().hex)


def export_to_ifc(layout: LayoutJSON, project_name: str = "BIM Export") -> bytes:
    model = ifcopenshell.api.run("project.create_file", version="IFC4")

    project = ifcopenshell.api.run(
        "root.create_entity",
        model,
        ifc_class="IfcProject",
        name=project_name,
    )
    length_unit = ifcopenshell.api.unit.add_si_unit(model, unit_type="LENGTHUNIT")
    area_unit = ifcopenshell.api.unit.add_si_unit(model, unit_type="AREAUNIT")
    volume_unit = ifcopenshell.api.unit.add_si_unit(model, unit_type="VOLUMEUNIT")
    ifcopenshell.api.unit.assign_unit(model, units=[length_unit, area_unit, volume_unit])

    # Geometric contexts
    model3d = ifcopenshell.api.run(
        "context.add_context", model, context_type="Model"
    )
    body = ifcopenshell.api.run(
        "context.add_context",
        model,
        context_type="Model",
        context_identifier="Body",
        target_view="MODEL_VIEW",
        parent=model3d,
    )

    site = ifcopenshell.api.run(
        "root.create_entity", model, ifc_class="IfcSite", name="Site"
    )
    building = ifcopenshell.api.run(
        "root.create_entity", model, ifc_class="IfcBuilding", name="Building"
    )
    storey = ifcopenshell.api.run(
        "root.create_entity",
        model,
        ifc_class="IfcBuildingStorey",
        name="Ground Floor",
    )

    ifcopenshell.api.run(
        "aggregate.assign_object", model, relating_object=project, products=[site]
    )
    ifcopenshell.api.run(
        "aggregate.assign_object", model, relating_object=site, products=[building]
    )
    ifcopenshell.api.run(
        "aggregate.assign_object", model, relating_object=building, products=[storey]
    )

    builder = sb.ShapeBuilder(model)

    for wall in layout.walls:
        _create_ifc_wall(model, builder, body, storey, wall)

    with tempfile.NamedTemporaryFile(suffix=".ifc", delete=False) as tmp:
        model.write(tmp.name)
        return Path(tmp.name).read_bytes()


def _create_ifc_wall(
    model: ifcopenshell.file,
    builder: "sb.ShapeBuilder",
    body_context,
    storey,
    wall: Wall,
) -> None:
    dx = wall.end[0] - wall.start[0]
    dy = wall.end[1] - wall.start[1]
    length = math.sqrt(dx * dx + dy * dy)
    if length < 1e-6:
        return

    angle = math.atan2(dy, dx)

    ifc_wall = ifcopenshell.api.run(
        "root.create_entity", model, ifc_class="IfcWall", name=wall.id
    )

    # Placement: position at wall start, rotated along wall direction
    matrix = ifcopenshell.util.placement.a2p(
        np.array((wall.start[0], wall.start[1], 0.0)),
        np.array((0.0, 0.0, 1.0)),
        np.array((math.cos(angle), math.sin(angle), 0.0)),
    )
    ifcopenshell.api.run(
        "geometry.edit_object_placement", model, product=ifc_wall, matrix=matrix
    )

    # Center the wall thickness around its axis while keeping the wall start at X=0.
    profile_curve = builder.rectangle(size=(length, wall.thickness), position=(0.0, -wall.thickness / 2))
    profile = builder.profile(profile_curve)
    extrusion = builder.extrude(profile, magnitude=wall.height)
    representation = builder.get_representation(body_context, [extrusion])

    ifcopenshell.api.run(
        "geometry.assign_representation",
        model,
        product=ifc_wall,
        representation=representation,
    )
    ifcopenshell.api.run(
        "spatial.assign_container", model, relating_structure=storey, products=[ifc_wall]
    )
