"""
Floor plan → structured JSON via Vision LLM.
Supports Google AI Studio (Gemini), Anthropic Claude, and OpenAI GPT-4o.
"""
import base64
import json
import re
import uuid
from pathlib import Path

import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.models.schemas import Door, LayoutJSON, Room, Wall, Window


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_api_key: str = ""
    vision_provider: str = "google"


settings = Settings()

EXTRACTION_PROMPT = """
You are an expert architectural drawing analyzer.

Analyze the provided floor plan image and extract all architectural elements into structured JSON.

Rules:
- Use a coordinate system where the bottom-left of the drawing is (0, 0)
- Express all measurements in meters
- Assign a unique string id to each element (e.g. "w1", "w2", "d1", "r1")
- For walls: start and end are 2D centerline points
- For doors and windows: position is the center point on the wall
- For rooms: polygon is a list of 2D corner points in order
- Estimate scale from any visible dimensions, scale bars, or room sizes
- If you cannot determine a measurement, use standard architectural defaults

Return ONLY valid JSON matching this exact schema — no markdown, no explanation:

{
  "walls": [{"id": "w1", "start": [x, y], "end": [x, y], "thickness": 0.2, "height": 3.0, "material": "concrete"}],
  "doors": [{"id": "d1", "position": [x, y], "width": 0.9, "height": 2.1, "rotation": 0.0, "wall_id": "w1"}],
  "windows": [{"id": "win1", "position": [x, y], "width": 1.2, "height": 1.2, "sill_height": 0.9, "wall_id": "w2"}],
  "rooms": [{"id": "r1", "name": "living room", "polygon": [[x,y], ...], "floor_material": "wood", "ceiling_height": 3.0}],
  "scale_meters_per_pixel": null
}
"""


def _encode_image(image_bytes: bytes) -> str:
    return base64.standard_b64encode(image_bytes).decode("utf-8")


def _parse_llm_output(text: str) -> LayoutJSON:
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    data = json.loads(text)
    return LayoutJSON(**data)


async def extract_layout_anthropic(image_bytes: bytes, media_type: str) -> LayoutJSON:
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    b64 = _encode_image(image_bytes)

    message = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64,
                        },
                    },
                    {"type": "text", "text": EXTRACTION_PROMPT},
                ],
            }
        ],
    )
    return _parse_llm_output(message.content[0].text)


async def extract_layout_google(image_bytes: bytes, media_type: str) -> LayoutJSON:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.google_api_key)
    aclient = client.aio

    try:
        response = await aclient.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=media_type),
                EXTRACTION_PROMPT,
            ],
            config=types.GenerateContentConfig(
                max_output_tokens=4096,
                temperature=0,
            ),
        )
        text = response.text
        if not text:
            raise ValueError("Empty response from Gemini")
        return _parse_llm_output(text)
    finally:
        await aclient.aclose()


async def extract_layout_openai(image_bytes: bytes, media_type: str) -> LayoutJSON:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    b64 = _encode_image(image_bytes)
    data_url = f"data:{media_type};base64,{b64}"

    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": data_url}},
                    {"type": "text", "text": EXTRACTION_PROMPT},
                ],
            }
        ],
    )
    return _parse_llm_output(response.choices[0].message.content)


async def extract_layout(image_bytes: bytes, media_type: str = "image/png") -> LayoutJSON:
    if settings.vision_provider == "google":
        return await extract_layout_google(image_bytes, media_type)
    if settings.vision_provider == "openai":
        return await extract_layout_openai(image_bytes, media_type)
    return await extract_layout_anthropic(image_bytes, media_type)
