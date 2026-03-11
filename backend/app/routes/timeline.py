from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import TimelineEvent
from app.services.auth import get_current_user

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("", response_model=list[TimelineEvent])
async def get_timeline(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(
        """SELECT id::text, type, label, value, recorded_at
           FROM timeline_events WHERE user_id = $1::uuid
           ORDER BY recorded_at DESC LIMIT $2 OFFSET $3""",
        user_id, limit, offset,
    )
    return [TimelineEvent(**dict(r)) for r in rows]
