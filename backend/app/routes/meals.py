from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import MealCreate, MealResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/meals", tags=["meals"])


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
