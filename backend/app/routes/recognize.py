import base64
import anthropic
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.config import settings
from app.services.auth import get_current_user

router = APIRouter(prefix="/meals", tags=["meals"])


@router.post("/recognize-photo")
async def recognize_food(
    photo: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="Food recognition not configured.")

    content = await photo.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")

    media_type = photo.content_type or "image/jpeg"
    b64 = base64.b64encode(content).decode()

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    response = await client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=256,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": media_type, "data": b64},
                },
                {
                    "type": "text",
                    "text": "List every distinct food item visible in this photo. Return ONLY a JSON array of lowercase food names, e.g. [\"rice\", \"grilled chicken\", \"salad\"]. No other text.",
                },
            ],
        }],
    )

    import json
    raw = response.content[0].text.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    foods = json.loads(raw)
    return {"foods": foods}
