"""
POST /export/ifc — accepts LayoutJSON, returns IFC file download.
"""
from fastapi import APIRouter
from fastapi.responses import Response

from app.models.schemas import ExportRequest
from app.services.ifc_export import export_to_ifc

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/ifc")
async def export_ifc(body: ExportRequest) -> Response:
    ifc_bytes = export_to_ifc(body.layout, body.project_name)
    filename = body.project_name.replace(" ", "_") + ".ifc"
    return Response(
        content=ifc_bytes,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
