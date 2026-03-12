from fastapi import APIRouter, Depends
import asyncpg
from app.database import get_db
from app.models.schemas import GoalsUpsert, GoalsResponse, GoalProgress
from app.services.auth import get_current_user

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("")
async def get_goals(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        "SELECT id, glucose_low, glucose_high, daily_steps, sleep_hours FROM user_goals WHERE user_id = $1::uuid",
        user_id,
    )
    if not row:
        return GoalsUpsert()
    return GoalsResponse(
        id=str(row["id"]), glucose_low=row["glucose_low"], glucose_high=row["glucose_high"],
        daily_steps=row["daily_steps"], sleep_hours=row["sleep_hours"],
    )


@router.put("")
async def upsert_goals(
    body: GoalsUpsert,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO user_goals (user_id, glucose_low, glucose_high, daily_steps, sleep_hours)
           VALUES ($1::uuid, $2, $3, $4, $5)
           ON CONFLICT (user_id) DO UPDATE SET
             glucose_low = EXCLUDED.glucose_low, glucose_high = EXCLUDED.glucose_high,
             daily_steps = EXCLUDED.daily_steps, sleep_hours = EXCLUDED.sleep_hours,
             updated_at = now()
           RETURNING id""",
        user_id, body.glucose_low, body.glucose_high, body.daily_steps, body.sleep_hours,
    )
    return GoalsResponse(id=str(row["id"]), **body.model_dump())


@router.get("/progress")
async def get_progress(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    goals = await db.fetchrow(
        "SELECT glucose_low, glucose_high, daily_steps, sleep_hours FROM user_goals WHERE user_id = $1::uuid",
        user_id,
    )
    gl, gh = (goals["glucose_low"], goals["glucose_high"]) if goals else (70, 140)
    step_target = goals["daily_steps"] if goals else 10000
    sleep_target = goals["sleep_hours"] if goals else 8.0

    glucose_rows = await db.fetch(
        """SELECT value FROM glucose_readings WHERE user_id = $1::uuid
           AND recorded_at >= CURRENT_DATE ORDER BY recorded_at DESC""",
        user_id,
    )
    total = len(glucose_rows)
    in_range = sum(1 for r in glucose_rows if gl <= r["value"] <= gh)
    tir = (in_range / total * 100) if total > 0 else 0.0

    wearable = await db.fetchrow(
        """SELECT steps, sleep_hours FROM wearable_data WHERE user_id = $1::uuid
           ORDER BY recorded_at DESC LIMIT 1""",
        user_id,
    )
    steps = wearable["steps"] if wearable and wearable["steps"] else 0

    sleep_row = await db.fetchrow(
        """SELECT hours FROM sleep_entries WHERE user_id = $1::uuid
           ORDER BY recorded_at DESC LIMIT 1""",
        user_id,
    )
    sleep_last = sleep_row["hours"] if sleep_row else 0.0

    return GoalProgress(
        glucose_in_range_pct=round(tir, 1),
        steps_today=steps, steps_target=step_target,
        sleep_last=sleep_last, sleep_target=sleep_target,
    )
