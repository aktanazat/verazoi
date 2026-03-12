import csv
import io
from datetime import date
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
import asyncpg
from app.database import get_db
from app.services.auth import get_current_user

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/csv")
async def export_csv(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
    from_date: date = Query(None),
    to_date: date = Query(None),
):
    date_filter = ""
    params = [user_id]
    if from_date:
        date_filter += " AND recorded_at::date >= $2"
        params.append(from_date)
    if to_date:
        idx = len(params) + 1
        date_filter += f" AND recorded_at::date <= ${idx}"
        params.append(to_date)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["--- Glucose Readings ---"])
    writer.writerow(["Date", "Value (mg/dL)", "Timing"])
    rows = await db.fetch(
        f"SELECT value, timing, recorded_at FROM glucose_readings WHERE user_id = $1::uuid{date_filter} ORDER BY recorded_at",
        *params,
    )
    for r in rows:
        writer.writerow([r["recorded_at"].isoformat(), r["value"], r["timing"]])

    writer.writerow([])

    writer.writerow(["--- Meals ---"])
    writer.writerow(["Date", "Type", "Foods", "Notes"])
    rows = await db.fetch(
        f"SELECT meal_type, foods, notes, recorded_at FROM meals WHERE user_id = $1::uuid{date_filter} ORDER BY recorded_at",
        *params,
    )
    for r in rows:
        writer.writerow([r["recorded_at"].isoformat(), r["meal_type"], ", ".join(r["foods"]), r["notes"]])

    writer.writerow([])

    writer.writerow(["--- Activities ---"])
    writer.writerow(["Date", "Type", "Duration (min)", "Intensity"])
    rows = await db.fetch(
        f"SELECT activity_type, duration, intensity, recorded_at FROM activities WHERE user_id = $1::uuid{date_filter} ORDER BY recorded_at",
        *params,
    )
    for r in rows:
        writer.writerow([r["recorded_at"].isoformat(), r["activity_type"], r["duration"], r["intensity"]])

    writer.writerow([])

    writer.writerow(["--- Sleep ---"])
    writer.writerow(["Date", "Hours", "Quality"])
    rows = await db.fetch(
        f"SELECT hours, quality, recorded_at FROM sleep_entries WHERE user_id = $1::uuid{date_filter} ORDER BY recorded_at",
        *params,
    )
    for r in rows:
        writer.writerow([r["recorded_at"].isoformat(), r["hours"], r["quality"]])

    writer.writerow([])

    writer.writerow(["--- Medications ---"])
    writer.writerow(["Date", "Name", "Dose", "Unit", "Timing", "Notes"])
    rows = await db.fetch(
        f"SELECT name, dose_value, dose_unit, timing, notes, recorded_at FROM medications WHERE user_id = $1::uuid{date_filter} ORDER BY recorded_at",
        *params,
    )
    for r in rows:
        writer.writerow([r["recorded_at"].isoformat(), r["name"], r["dose_value"], r["dose_unit"], r["timing"], r["notes"]])

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=verazoi_export.csv"},
    )
