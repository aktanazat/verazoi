from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import SleepCreate, SleepResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/sleep", tags=["sleep"])


@router.post("", response_model=SleepResponse, status_code=201)
async def create_sleep(
    body: SleepCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO sleep_entries (user_id, hours, quality)
           VALUES ($1::uuid, $2, $3)
           RETURNING id::text, hours, quality, recorded_at""",
        user_id, body.hours, body.quality,
    )
    return SleepResponse(**dict(row))


@router.get("", response_model=list[SleepResponse])
async def list_sleep(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(
        """SELECT id::text, hours, quality, recorded_at
           FROM sleep_entries WHERE user_id = $1::uuid
           ORDER BY recorded_at DESC LIMIT $2 OFFSET $3""",
        user_id, limit, offset,
    )
    return [SleepResponse(**dict(r)) for r in rows]
