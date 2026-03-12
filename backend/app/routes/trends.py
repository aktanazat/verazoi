from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import GlucoseTrendPoint, StabilityTrendPoint
from app.services.auth import get_current_user

router = APIRouter(prefix="/trends", tags=["trends"])


@router.get("/glucose")
async def glucose_trend(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    days: int = Query(7, le=90),
):
    rows = await db.fetch(
        """SELECT date_trunc('day', recorded_at)::date AS d,
                  AVG(value)::double precision AS avg, MIN(value) AS min, MAX(value) AS max, COUNT(*) AS count
           FROM glucose_readings WHERE user_id = $1::uuid
           AND recorded_at >= CURRENT_DATE - $2::int * interval '1 day'
           GROUP BY d ORDER BY d""",
        user_id, days,
    )
    return [
        GlucoseTrendPoint(date=str(r["d"]), avg=round(r["avg"], 1), min=r["min"], max=r["max"], count=r["count"])
        for r in rows
    ]


@router.get("/stability")
async def stability_trend(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    days: int = Query(30, le=90),
):
    rows = await db.fetch(
        """SELECT snapshot_date, score FROM stability_snapshots
           WHERE user_id = $1::uuid AND snapshot_date >= CURRENT_DATE - $2::int * interval '1 day'
           ORDER BY snapshot_date""",
        user_id, days,
    )
    return [StabilityTrendPoint(date=str(r["snapshot_date"]), score=r["score"]) for r in rows]
