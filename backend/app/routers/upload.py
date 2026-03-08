"""
POST /upload — accepts a floor plan image or PDF, returns LayoutJSON + scene geometry.
"""
import io
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.models.schemas import SceneGeometry
from app.services.geometry import generate_scene_geometry
from app.services.vision_llm import extract_layout

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_MIME_TYPES = {
    "image/png": "image/png",
    "image/jpeg": "image/jpeg",
    "image/webp": "image/webp",
    "application/pdf": "image/png",  # PDF gets rasterized → PNG for LLM
}

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _rasterize_pdf(pdf_bytes: bytes) -> bytes:
    """Convert first page of PDF to PNG bytes using PyMuPDF."""
    import fitz  # PyMuPDF

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page = doc[0]
    mat = fitz.Matrix(2.0, 2.0)  # 2x scale for detail
    pix = page.get_pixmap(matrix=mat)
    return pix.tobytes("png")


@router.post("/", response_model=SceneGeometry)
async def upload_drawing(file: UploadFile = File(...)) -> SceneGeometry:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {list(ALLOWED_MIME_TYPES)}",
        )

    raw = await file.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 20 MB)")

    media_type = file.content_type
    image_bytes = raw

    if media_type == "application/pdf":
        image_bytes = _rasterize_pdf(raw)
        media_type = "image/png"

    layout = await extract_layout(image_bytes, media_type)
    scene = generate_scene_geometry(layout)
    return scene
