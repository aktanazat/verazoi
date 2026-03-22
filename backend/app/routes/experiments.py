from fastapi import APIRouter, Depends, HTTPException, Query
import asyncpg
from app.database import get_db
from app.models.schemas import (
    ExperimentCreate, ExperimentResponse, ExperimentEntryCreate,
    ExperimentEntryResponse, ExperimentComparison,
)
from app.services.auth import get_current_user

router = APIRouter(prefix="/experiments", tags=["experiments"])


@router.post("", response_model=ExperimentResponse, status_code=201)
async def create_experiment(
    body: ExperimentCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    row = await db.fetchrow(
        """INSERT INTO experiments (user_id, name, food_a, food_b)
           VALUES ($1::uuid, $2, $3, $4)
           RETURNING id::text, name, food_a, food_b, status, created_at""",
        user_id, body.name, body.food_a, body.food_b,
    )
    return ExperimentResponse(**dict(row))


@router.get("", response_model=list[ExperimentResponse])
async def list_experiments(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    limit: int = Query(20, le=50),
):
    rows = await db.fetch(
        """SELECT id::text, name, food_a, food_b, status, created_at
           FROM experiments WHERE user_id = $1::uuid ORDER BY created_at DESC LIMIT $2""",
        user_id, limit,
    )
    return [ExperimentResponse(**dict(r)) for r in rows]


@router.post("/{experiment_id}/entries", response_model=ExperimentEntryResponse, status_code=201)
async def add_entry(
    experiment_id: str,
    body: ExperimentEntryCreate,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    exp = await db.fetchval(
        "SELECT id FROM experiments WHERE id = $1::uuid AND user_id = $2::uuid",
        experiment_id, user_id,
    )
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    delta = body.peak_glucose - body.pre_glucose
    row = await db.fetchrow(
        """INSERT INTO experiment_entries (experiment_id, user_id, arm, pre_glucose, peak_glucose, glucose_delta)
           VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)
           RETURNING id::text, arm, pre_glucose, peak_glucose, glucose_delta, recorded_at""",
        experiment_id, user_id, body.arm, body.pre_glucose, body.peak_glucose, delta,
    )
    return ExperimentEntryResponse(**dict(row))


@router.get("/{experiment_id}", response_model=ExperimentComparison)
async def get_experiment(
    experiment_id: str,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    exp = await db.fetchrow(
        """SELECT id::text, name, food_a, food_b, status, created_at
           FROM experiments WHERE id = $1::uuid AND user_id = $2::uuid""",
        experiment_id, user_id,
    )
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found.")

    entries = await db.fetch(
        """SELECT id::text, arm, pre_glucose, peak_glucose, glucose_delta, recorded_at
           FROM experiment_entries WHERE experiment_id = $1::uuid ORDER BY recorded_at""",
        experiment_id,
    )

    arm_a = [ExperimentEntryResponse(**dict(e)) for e in entries if e["arm"] == "a"]
    arm_b = [ExperimentEntryResponse(**dict(e)) for e in entries if e["arm"] == "b"]

    avg_a = sum(e.glucose_delta for e in arm_a) / len(arm_a) if arm_a else None
    avg_b = sum(e.glucose_delta for e in arm_b) / len(arm_b) if arm_b else None

    return ExperimentComparison(
        experiment=ExperimentResponse(**dict(exp)),
        arm_a=arm_a, arm_b=arm_b,
        avg_delta_a=round(avg_a, 1) if avg_a is not None else None,
        avg_delta_b=round(avg_b, 1) if avg_b is not None else None,
    )


@router.post("/{experiment_id}/complete")
async def complete_experiment(
    experiment_id: str,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    result = await db.execute(
        "UPDATE experiments SET status = 'completed' WHERE id = $1::uuid AND user_id = $2::uuid",
        experiment_id, user_id,
    )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Experiment not found.")
    return {"status": "completed"}
