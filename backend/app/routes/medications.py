from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import RedirectResponse
from app.routes.redirects import frontend_redirect
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


@router.post("/form", include_in_schema=False)
async def create_medication_form(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    form = await request.form()
    try:
        dose_value = float(str(form.get("dose_value", "")))
    except ValueError:
        return RedirectResponse(frontend_redirect("/app/log/medications?form_error=invalid"), status_code=303)
    if dose_value < 0:
        return RedirectResponse(frontend_redirect("/app/log/medications?form_error=range"), status_code=303)
    name = str(form.get("name", "")).strip()
    dose_unit = str(form.get("dose_unit", "mg"))
    timing = str(form.get("timing", "morning"))
    if not name or len(name) > 120 or dose_unit not in {"units", "mg"} or timing not in {"before_meal", "with_meal", "after_meal", "bedtime", "morning", "other"}:
        return RedirectResponse(frontend_redirect("/app/log/medications?form_error=invalid"), status_code=303)
    await db.execute(
        """INSERT INTO medications (user_id, name, dose_value, dose_unit, timing, notes)
           VALUES ($1::uuid, $2, $3, $4, $5, $6)""",
        user_id,
        name,
        dose_value,
        dose_unit,
        timing,
        str(form.get("notes", "")),
    )
    return RedirectResponse(frontend_redirect("/app/log/medications"), status_code=303)


@router.get("")
async def list_medications(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
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
