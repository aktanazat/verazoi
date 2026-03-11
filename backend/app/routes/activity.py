from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import ActivityCreate, ActivityResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/activities", tags=["activities"])


@router.post("", response_model=ActivityResponse, status_code=201)
async def create_activity(
    body: ActivityCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO activities (user_id, activity_type, duration, intensity)
           VALUES ($1::uuid, $2, $3, $4)
           RETURNING id::text, activity_type, duration, intensity, recorded_at""",
        user_id, body.activity_type, body.duration, body.intensity,
    )
    return ActivityResponse(**dict(row))


@router.get("", response_model=list[ActivityResponse])
async def list_activities(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(
        """SELECT id::text, activity_type, duration, intensity, recorded_at
           FROM activities WHERE user_id = $1::uuid
           ORDER BY recorded_at DESC LIMIT $2 OFFSET $3""",
        user_id, limit, offset,
    )
    return [ActivityResponse(**dict(r)) for r in rows]
