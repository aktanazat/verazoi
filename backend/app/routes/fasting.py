from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg
from app.database import get_db
from app.models.schemas import FastingStartRequest, FastingSessionResponse, GlucoseResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/fasting", tags=["fasting"])


@router.post("/start", status_code=201)
async def start_fast(
    body: FastingStartRequest,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    # End any active fast
    await db.execute(
        "UPDATE fasting_sessions SET ended_at = now() WHERE user_id = $1::uuid AND ended_at IS NULL",
        user_id,
    )

    row = await db.fetchrow(
        """INSERT INTO fasting_sessions (user_id, started_at, target_hours)
           VALUES ($1::uuid, now(), $2)
           RETURNING id::text, started_at, ended_at, target_hours""",
        user_id, body.target_hours,
    )
    elapsed = (datetime.now(timezone.utc) - row["started_at"]).total_seconds() / 3600
    return FastingSessionResponse(
        id=row["id"], started_at=row["started_at"], ended_at=None,
        target_hours=row["target_hours"], elapsed_hours=round(elapsed, 2),
    )


@router.post("/end")
async def end_fast(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """UPDATE fasting_sessions SET ended_at = now()
           WHERE user_id = $1::uuid AND ended_at IS NULL
           RETURNING id::text, started_at, ended_at, target_hours""",
        user_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="No active fast.")

    elapsed = (row["ended_at"] - row["started_at"]).total_seconds() / 3600
    return FastingSessionResponse(
        id=row["id"], started_at=row["started_at"], ended_at=row["ended_at"],
        target_hours=row["target_hours"], elapsed_hours=round(elapsed, 2),
    )


@router.get("/active")
async def get_active_fast(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """SELECT id::text, started_at, target_hours
           FROM fasting_sessions WHERE user_id = $1::uuid AND ended_at IS NULL""",
        user_id,
    )
    if not row:
        return {"active": False}

    elapsed = (datetime.now(timezone.utc) - row["started_at"]).total_seconds() / 3600

    # Get glucose readings during this fast
    glucose = await db.fetch(
        """SELECT id::text, value, timing, recorded_at FROM glucose_readings
           WHERE user_id = $1::uuid AND recorded_at >= $2 ORDER BY recorded_at""",
        user_id, row["started_at"],
    )

    return FastingSessionResponse(
        id=row["id"], started_at=row["started_at"], ended_at=None,
        target_hours=row["target_hours"], elapsed_hours=round(elapsed, 2),
        glucose_readings=[GlucoseResponse(**dict(g)) for g in glucose],
    )


@router.get("/history")
async def fasting_history(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    limit: int = Query(10, le=50),
):
    rows = await db.fetch(
        """SELECT id::text, started_at, ended_at, target_hours
           FROM fasting_sessions WHERE user_id = $1::uuid AND ended_at IS NOT NULL
           ORDER BY started_at DESC LIMIT $2""",
        user_id, limit,
    )
    return [
        FastingSessionResponse(
            id=r["id"], started_at=r["started_at"], ended_at=r["ended_at"],
            target_hours=r["target_hours"],
            elapsed_hours=round((r["ended_at"] - r["started_at"]).total_seconds() / 3600, 2),
        )
        for r in rows
    ]
