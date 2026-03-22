from fastapi import APIRouter, Depends, Query
import asyncpg
from app.database import get_db
from app.models.schemas import PlaybookEntry
from app.services.auth import get_current_user

router = APIRouter(prefix="/meals", tags=["meals"])


@router.get("/playbook")
async def get_playbook(
    foods: str = Query(..., description="Comma-separated food names"),
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    food_list = [f.strip().lower() for f in foods.split(",") if f.strip()]

    rows = await db.fetch(
        """WITH meal_deltas AS (
             SELECT m.foods, peak.max_val - pre.value AS delta
             FROM meals m
             LEFT JOIN LATERAL (
                 SELECT value FROM glucose_readings g
                 WHERE g.user_id = m.user_id AND g.recorded_at BETWEEN m.recorded_at - interval '30 min' AND m.recorded_at
                 ORDER BY g.recorded_at DESC LIMIT 1
             ) pre ON true
             LEFT JOIN LATERAL (
                 SELECT MAX(value) AS max_val FROM glucose_readings g
                 WHERE g.user_id = m.user_id AND g.recorded_at BETWEEN m.recorded_at AND m.recorded_at + interval '3 hours'
             ) peak ON true
             WHERE m.user_id = $1::uuid AND m.recorded_at >= CURRENT_DATE - interval '90 days'
           )
           SELECT food, AVG(delta)::double precision AS avg_delta, COUNT(*) AS occurrences
           FROM meal_deltas, unnest(foods) AS food
           WHERE delta IS NOT NULL AND lower(food) = ANY($2)
           GROUP BY food
           ORDER BY avg_delta DESC""",
        user_id, food_list,
    )

    results = []
    for r in rows:
        delta = round(r["avg_delta"], 1)
        suggestion = None
        if delta > 30:
            suggestion = "A 15-min walk before or after eating typically reduces this spike."
        elif delta > 15:
            suggestion = "Pairing with protein or fiber may blunt the glucose response."

        results.append(PlaybookEntry(
            food=r["food"],
            avg_delta=delta,
            occurrences=r["occurrences"],
            suggestion=suggestion,
        ))

    return results
