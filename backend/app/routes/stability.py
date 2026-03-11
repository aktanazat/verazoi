import json
import asyncio
from fastapi import APIRouter, Depends
from app.database import get_pool
from app.redis_client import get_redis
from app.models.schemas import StabilityResponse
from app.services.auth import get_current_user
from app.services import stability as algo

router = APIRouter(prefix="/stability", tags=["stability"])

CACHE_TTL = 30


@router.get("/score", response_model=StabilityResponse)
async def get_score(
    user_id: str = Depends(get_current_user),
):
    cache_key = f"stability:{user_id}"
    try:
        r = await get_redis()
        cached = await r.get(cache_key)
        if cached:
            return StabilityResponse(**json.loads(cached))
    except Exception:
        pass

    pool = await get_pool()

    async def fetch_glucose():
        return await pool.fetch(
            "SELECT value, timing FROM glucose_readings WHERE user_id = $1::uuid AND recorded_at >= now() - interval '7 days' ORDER BY recorded_at",
            user_id,
        )

    async def fetch_activities():
        return await pool.fetch(
            "SELECT activity_type, duration, intensity FROM activities WHERE user_id = $1::uuid AND recorded_at >= now() - interval '24 hours'",
            user_id,
        )

    async def fetch_sleep():
        return await pool.fetch(
            "SELECT hours, quality FROM sleep_entries WHERE user_id = $1::uuid ORDER BY recorded_at DESC LIMIT 1",
            user_id,
        )

    async def fetch_wearable():
        return await pool.fetchrow(
            "SELECT heart_rate, steps, active_minutes, sleep_hours FROM wearable_data WHERE user_id = $1::uuid ORDER BY recorded_at DESC LIMIT 1",
            user_id,
        )

    glucose_rows, activity_rows, sleep_rows, wearable_row = await asyncio.gather(
        fetch_glucose(), fetch_activities(), fetch_sleep(), fetch_wearable()
    )

    readings = [dict(r) for r in glucose_rows]
    activities = [dict(r) for r in activity_rows]
    sleep_entries = [dict(r) for r in sleep_rows]
    wh = dict(wearable_row) if wearable_row else {}

    result = algo.calculate(
        readings=readings,
        activities=activities,
        sleep_entries=sleep_entries,
        wearable_hr=wh.get("heart_rate"),
        wearable_steps=wh.get("steps"),
        wearable_active_min=wh.get("active_minutes"),
        wearable_sleep_hours=wh.get("sleep_hours"),
    )

    try:
        r = await get_redis()
        await r.setex(cache_key, CACHE_TTL, json.dumps(result))
    except Exception:
        pass

    return StabilityResponse(**result)
