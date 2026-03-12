from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import MealGlucoseCorrelation, FoodImpact
from app.services.auth import get_current_user

router = APIRouter(prefix="/correlations", tags=["correlations"])


@router.get("/meal-glucose")
async def meal_glucose(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    days: int = Query(14, le=90),
):
    rows = await db.fetch(
        """SELECT m.id AS meal_id, m.meal_type, m.foods, m.recorded_at,
                  (SELECT value FROM glucose_readings g
                   WHERE g.user_id = m.user_id AND g.recorded_at BETWEEN m.recorded_at - interval '30 min' AND m.recorded_at
                   ORDER BY g.recorded_at DESC LIMIT 1) AS pre_glucose,
                  (SELECT MAX(value) FROM glucose_readings g
                   WHERE g.user_id = m.user_id AND g.recorded_at BETWEEN m.recorded_at AND m.recorded_at + interval '3 hours') AS peak_glucose
           FROM meals m
           WHERE m.user_id = $1::uuid AND m.recorded_at >= CURRENT_DATE - $2::int * interval '1 day'
           ORDER BY m.recorded_at DESC""",
        user_id, days,
    )
    results = []
    for r in rows:
        pre = r["pre_glucose"]
        peak = r["peak_glucose"]
        delta = (peak - pre) if pre and peak else None
        results.append(MealGlucoseCorrelation(
            meal_id=str(r["meal_id"]), meal_type=r["meal_type"], foods=r["foods"],
            recorded_at=r["recorded_at"], pre_meal_glucose=pre, peak_glucose=peak,
            glucose_delta=delta,
        ))
    return results


@router.get("/food-impact")
async def food_impact(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    days: int = Query(30, le=90),
):
    rows = await db.fetch(
        """WITH meal_deltas AS (
             SELECT m.foods,
                    (SELECT MAX(value) FROM glucose_readings g
                     WHERE g.user_id = m.user_id AND g.recorded_at BETWEEN m.recorded_at AND m.recorded_at + interval '3 hours')
                    -
                    (SELECT value FROM glucose_readings g
                     WHERE g.user_id = m.user_id AND g.recorded_at BETWEEN m.recorded_at - interval '30 min' AND m.recorded_at
                     ORDER BY g.recorded_at DESC LIMIT 1) AS delta
             FROM meals m
             WHERE m.user_id = $1::uuid AND m.recorded_at >= CURRENT_DATE - $2::int * interval '1 day'
           )
           SELECT food, AVG(delta)::double precision AS avg_delta, COUNT(*) AS occurrences
           FROM meal_deltas, unnest(foods) AS food
           WHERE delta IS NOT NULL
           GROUP BY food
           ORDER BY avg_delta DESC""",
        user_id, days,
    )
    return [FoodImpact(food=r["food"], avg_delta=round(r["avg_delta"], 1), occurrences=r["occurrences"]) for r in rows]
