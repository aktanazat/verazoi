from fastapi import APIRouter, Depends, HTTPException
import asyncpg
from app.database import get_db
from app.models.schemas import MedScheduleCreate, MedScheduleResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/medication-schedules", tags=["medication-schedules"])


@router.post("", response_model=MedScheduleResponse, status_code=201)
async def create_schedule(
    body: MedScheduleCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO medication_schedules (user_id, medication_name, dose_value, dose_unit, schedule_time, days_of_week)
           VALUES ($1::uuid, $2, $3, $4, $5::time, $6)
           RETURNING id::text, medication_name, dose_value, dose_unit, schedule_time::text, days_of_week, active""",
        user_id, body.medication_name, body.dose_value, body.dose_unit, body.schedule_time, body.days_of_week,
    )
    return MedScheduleResponse(**dict(row))


@router.get("", response_model=list[MedScheduleResponse])
async def list_schedules(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(
        """SELECT id::text, medication_name, dose_value, dose_unit, schedule_time::text, days_of_week, active
           FROM medication_schedules WHERE user_id = $1::uuid AND active ORDER BY schedule_time""",
        user_id,
    )
    return [MedScheduleResponse(**dict(r)) for r in rows]


@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    result = await db.execute(
        "UPDATE medication_schedules SET active = false WHERE id = $1::uuid AND user_id = $2::uuid",
        schedule_id, user_id,
    )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Schedule not found.")
    return {"status": "deleted"}
