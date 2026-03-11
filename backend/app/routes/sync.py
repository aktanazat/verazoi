import json
from fastapi import APIRouter, Depends
import asyncpg
from app.database import get_db
from app.redis_client import get_redis
from app.models.schemas import WearableSyncRequest
from app.services.auth import get_current_user

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/wearable", status_code=201)
async def sync_wearable(
    body: WearableSyncRequest,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    await db.execute(
        """INSERT INTO wearable_data (user_id, heart_rate, steps, active_minutes, sleep_hours, sleep_quality)
           VALUES ($1::uuid, $2, $3, $4, $5, $6)""",
        user_id, body.heart_rate, body.steps, body.active_minutes, body.sleep_hours, body.sleep_quality,
    )

    # Invalidate stability cache
    try:
        r = await get_redis()
        await r.delete(f"stability:{user_id}")
    except Exception:
        pass

    return {"status": "synced"}
