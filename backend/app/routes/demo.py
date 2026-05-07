"""Demo data seeding for the current user.

Wipes the user's existing rows in the relevant tables and inserts a
deterministic 30-day demo dataset so the dashboard renders a populated
preview against the real backend.
"""

from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
import asyncpg

from app.database import get_db
from app.services.auth import get_current_user

router = APIRouter(prefix="/demo", tags=["demo"])

MEAL_PLANS = [
    ("breakfast", ["oatmeal", "berries", "almonds"], "Steady morning meal"),
    ("breakfast", ["eggs", "toast", "avocado"], "Higher protein start"),
    ("lunch", ["grilled chicken", "salad", "olive oil"], "Light lunch"),
    ("lunch", ["rice", "salmon", "broccoli"], "Balanced plate"),
    ("dinner", ["pasta", "vegetables", "cheese"], "Carb-forward dinner"),
    ("dinner", ["chicken", "sweet potato", "kale"], "Whole-food dinner"),
    ("snack", ["greek yogurt"], "Afternoon snack"),
]

ACTIVITY_PLANS = [
    ("Walking", 22, "Light"),
    ("Walking", 30, "Moderate"),
    ("Cycling", 35, "Moderate"),
    ("Yoga", 25, "Light"),
    ("Weights", 40, "Intense"),
]


@router.post("/seed", status_code=201)
async def seed_demo(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rng = random.Random(42)
    inserted = {
        "glucose": 0,
        "meals": 0,
        "activities": 0,
        "sleep": 0,
        "medications": 0,
        "timeline": 0,
        "wearable": 0,
    }

    async with db.transaction():
        # Wipe the current user's existing data.
        await db.execute("DELETE FROM glucose_readings WHERE user_id = $1::uuid", user_id)
        await db.execute("DELETE FROM meals WHERE user_id = $1::uuid", user_id)
        await db.execute("DELETE FROM activities WHERE user_id = $1::uuid", user_id)
        await db.execute("DELETE FROM sleep_entries WHERE user_id = $1::uuid", user_id)
        await db.execute("DELETE FROM medications WHERE user_id = $1::uuid", user_id)
        await db.execute("DELETE FROM timeline_events WHERE user_id = $1::uuid", user_id)
        await db.execute("DELETE FROM wearable_data WHERE user_id = $1::uuid", user_id)
        await db.execute("DELETE FROM user_goals WHERE user_id = $1::uuid", user_id)

        # Goals.
        await db.execute(
            """INSERT INTO user_goals (user_id, glucose_low, glucose_high, daily_steps, sleep_hours)
               VALUES ($1::uuid, 70, 140, 10000, 8)""",
            user_id,
        )

        now = datetime.now(timezone.utc)
        days = 30

        for d in range(days):
            day = now - timedelta(days=days - 1 - d)

            # ~6 glucose readings spread through the day with breakfast / dinner peaks.
            for slot, base, drift in [
                (7, 92, 6),
                (9, 138, 14),  # post-breakfast spike
                (12, 102, 8),
                (14, 128, 12),  # post-lunch
                (18, 96, 7),
                (20, 144, 16),  # post-dinner spike
            ]:
                ts = day.replace(hour=slot, minute=rng.randint(0, 55), second=0, microsecond=0)
                value = max(64, min(190, base + rng.randint(-drift, drift)))
                timing = (
                    "after" if slot in (9, 14, 20)
                    else "before" if slot in (12, 18)
                    else "fasting"
                )
                await db.execute(
                    """INSERT INTO glucose_readings (user_id, value, timing, recorded_at)
                       VALUES ($1::uuid, $2, $3, $4)""",
                    user_id, value, timing, ts,
                )
                inserted["glucose"] += 1
                await db.execute(
                    """INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
                       VALUES ($1::uuid, 'glucose', 'CGM reading', $2, $3)""",
                    user_id, f"{value} mg/dL", ts,
                )
                inserted["timeline"] += 1

            # 3 meals.
            for slot in (8, 13, 19):
                meal_type, foods, notes = MEAL_PLANS[rng.randint(0, len(MEAL_PLANS) - 1)]
                ts = day.replace(hour=slot, minute=rng.randint(0, 30), second=0, microsecond=0)
                await db.execute(
                    """INSERT INTO meals (user_id, meal_type, foods, notes, recorded_at)
                       VALUES ($1::uuid, $2, $3, $4, $5)""",
                    user_id, meal_type, foods, notes, ts,
                )
                inserted["meals"] += 1
                await db.execute(
                    """INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
                       VALUES ($1::uuid, 'meal', $2, $3, $4)""",
                    user_id, meal_type.capitalize(), ", ".join(foods), ts,
                )
                inserted["timeline"] += 1

            # Activity (most days).
            if d % 2 != 0 or rng.random() > 0.3:
                act_type, duration, intensity = ACTIVITY_PLANS[rng.randint(0, len(ACTIVITY_PLANS) - 1)]
                ts = day.replace(hour=17, minute=rng.randint(0, 50), second=0, microsecond=0)
                await db.execute(
                    """INSERT INTO activities (user_id, activity_type, duration, intensity, recorded_at)
                       VALUES ($1::uuid, $2, $3, $4, $5)""",
                    user_id, act_type, duration, intensity, ts,
                )
                inserted["activities"] += 1
                await db.execute(
                    """INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
                       VALUES ($1::uuid, 'activity', $2, $3, $4)""",
                    user_id, act_type, f"{duration} min, {intensity.lower()}", ts,
                )
                inserted["timeline"] += 1

            # Sleep entry.
            hours = round(rng.uniform(6.4, 7.9), 1)
            quality = rng.choice(["good", "good", "fair", "great"])
            sleep_ts = day.replace(hour=6, minute=30, second=0, microsecond=0)
            await db.execute(
                """INSERT INTO sleep_entries (user_id, hours, quality, recorded_at)
                   VALUES ($1::uuid, $2, $3, $4)""",
                user_id, hours, quality, sleep_ts,
            )
            inserted["sleep"] += 1
            await db.execute(
                """INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
                   VALUES ($1::uuid, 'sleep', 'Sleep', $2, $3)""",
                user_id, f"{hours}h, {quality}", sleep_ts,
            )
            inserted["timeline"] += 1

            # Daily medication.
            med_ts = day.replace(hour=8, minute=10, second=0, microsecond=0)
            await db.execute(
                """INSERT INTO medications (user_id, name, dose_value, dose_unit, timing, notes, recorded_at)
                   VALUES ($1::uuid, 'Metformin', 500, 'mg', 'morning', '', $2)""",
                user_id, med_ts,
            )
            inserted["medications"] += 1
            await db.execute(
                """INSERT INTO timeline_events (user_id, type, label, value, recorded_at)
                   VALUES ($1::uuid, 'medication', 'Metformin', '500mg', $2)""",
                user_id, med_ts,
            )
            inserted["timeline"] += 1

            # Wearable snapshot.
            await db.execute(
                """INSERT INTO wearable_data (user_id, heart_rate, steps, active_minutes, sleep_hours, sleep_quality, recorded_at)
                   VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)""",
                user_id,
                rng.randint(62, 76),
                rng.randint(5800, 11200),
                rng.randint(28, 62),
                hours,
                quality,
                day.replace(hour=22, minute=0, second=0, microsecond=0),
            )
            inserted["wearable"] += 1

    return {"status": "ok", "inserted": inserted}
