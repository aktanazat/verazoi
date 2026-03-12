from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import MedicationCreate, MedicationResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/medications", tags=["medications"])


@router.post("", status_code=201)
async def create_medication(
    body: MedicationCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO medications (user_id, name, dose_value, dose_unit, timing, notes)
           VALUES ($1::uuid, $2, $3, $4, $5, $6) RETURNING id, recorded_at""",
        user_id, body.name, body.dose_value, body.dose_unit, body.timing, body.notes,
    )
    return MedicationResponse(
        id=str(row["id"]), name=body.name, dose_value=body.dose_value,
        dose_unit=body.dose_unit, timing=body.timing, notes=body.notes,
        recorded_at=row["recorded_at"],
    )


@router.get("")
async def list_medications(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    limit: int = Query(50, le=200),
):
    rows = await db.fetch(
        """SELECT id, name, dose_value, dose_unit, timing, notes, recorded_at
           FROM medications WHERE user_id = $1::uuid ORDER BY recorded_at DESC LIMIT $2""",
        user_id, limit,
    )
    return [
        MedicationResponse(
            id=str(r["id"]), name=r["name"], dose_value=r["dose_value"],
            dose_unit=r["dose_unit"], timing=r["timing"], notes=r["notes"],
            recorded_at=r["recorded_at"],
        )
        for r in rows
    ]
