from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.redis_client import get_redis
from app.models.schemas import InsightResponse
from app.services.auth import get_current_user
from app.services.insights import generate_insight

router = APIRouter(prefix="/insights", tags=["insights"])


def current_week_start() -> date:
    today = date.today()
    return today - timedelta(days=today.weekday())


@router.get("/weekly")
async def get_weekly(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    ws = current_week_start()
    row = await db.fetchrow(
        "SELECT id, week_start, summary, generated_at FROM ai_insights WHERE user_id = $1::uuid AND week_start = $2",
        user_id, ws,
    )
    if row:
        return InsightResponse(id=str(row["id"]), week_start=str(row["week_start"]),
                               summary=row["summary"], generated_at=row["generated_at"])
    return {"status": "no_insight", "message": "No insight generated yet for this week. Use POST to generate."}


@router.post("/weekly/generate", status_code=201)
async def generate_weekly(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    r = await get_redis()
    cache_key = f"insight_gen:{user_id}"
    if await r.exists(cache_key):
        return {"status": "rate_limited", "message": "Insight already generated recently. Try again later."}

    ws = current_week_start()
    summary = await generate_insight(user_id, db, ws)

    row = await db.fetchrow(
        """INSERT INTO ai_insights (user_id, week_start, summary)
           VALUES ($1::uuid, $2, $3)
           ON CONFLICT (user_id, week_start) DO UPDATE SET summary = EXCLUDED.summary, generated_at = now()
           RETURNING id, generated_at""",
        user_id, ws, summary,
    )

    await r.setex(cache_key, 3600, "1")

    return InsightResponse(id=str(row["id"]), week_start=str(ws),
                           summary=summary, generated_at=row["generated_at"])


@router.get("/history")
async def insight_history(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    limit: int = Query(10, le=52),
):
    rows = await db.fetch(
        """SELECT id, week_start, summary, generated_at FROM ai_insights
           WHERE user_id = $1::uuid ORDER BY week_start DESC LIMIT $2""",
        user_id, limit,
    )
    return [
        InsightResponse(id=str(r["id"]), week_start=str(r["week_start"]),
                        summary=r["summary"], generated_at=r["generated_at"])
        for r in rows
    ]
