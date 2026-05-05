from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import RedirectResponse
import asyncpg
from app.database import get_db
from app.models.schemas import MealCreate, MealResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/meals", tags=["meals"])


def _redirect_to_origin(request: Request, path: str) -> str:
    origin = request.headers.get("origin")
    if origin:
        return f"{origin.rstrip('/')}{path}"
    return path


@router.post("", response_model=MealResponse, status_code=201)
async def create_meal(
    body: MealCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO meals (user_id, meal_type, foods, notes)
           VALUES ($1::uuid, $2, $3, $4)
           RETURNING id::text, meal_type, foods, notes, recorded_at""",
        user_id, body.meal_type, body.foods, body.notes,
    )
    return MealResponse(**dict(row))


@router.post("/form", include_in_schema=False)
async def create_meal_form(
    request: Request,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    form = await request.form()
    entries = [str(food).strip() for food in form.getlist("foods") if str(food).strip()]
    custom_food = str(form.get("custom_food", ""))
    if custom_food.strip():
        entries.append(custom_food.strip())
    entries = list(dict.fromkeys(entries))
    if not entries:
        return RedirectResponse(_redirect_to_origin(request, "/app/log/meals?meal_error=missing"), status_code=303)

    await db.execute(
        """INSERT INTO meals (user_id, meal_type, foods, notes)
           VALUES ($1::uuid, $2, $3, $4)""",
        user_id, str(form.get("meal_type", "Breakfast")), entries, str(form.get("notes", "")),
    )
    return RedirectResponse(_redirect_to_origin(request, "/app/log/meals"), status_code=303)


@router.get("", response_model=list[MealResponse])
async def list_meals(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(
        """SELECT id::text, meal_type, foods, notes, recorded_at
           FROM meals WHERE user_id = $1::uuid
           ORDER BY recorded_at DESC LIMIT $2 OFFSET $3""",
        user_id, limit, offset,
    )
    return [MealResponse(**dict(r)) for r in rows]
