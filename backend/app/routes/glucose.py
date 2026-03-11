from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import GlucoseCreate, GlucoseResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/glucose", tags=["glucose"])


@router.post("", response_model=GlucoseResponse, status_code=201)
async def create_reading(
    body: GlucoseCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO glucose_readings (user_id, value, timing)
           VALUES ($1::uuid, $2, $3)
           RETURNING id::text, value, timing, recorded_at""",
        user_id, body.value, body.timing,
    )
    return GlucoseResponse(**dict(row))


@router.get("", response_model=list[GlucoseResponse])
async def list_readings(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(
        """SELECT id::text, value, timing, recorded_at
           FROM glucose_readings WHERE user_id = $1::uuid
           ORDER BY recorded_at DESC LIMIT $2 OFFSET $3""",
        user_id, limit, offset,
    )
    return [GlucoseResponse(**dict(r)) for r in rows]
