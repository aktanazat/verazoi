import anthropic
from datetime import date, timedelta
import asyncpg
from app.config import settings


async def generate_insight(user_id: str, db: asyncpg.Connection, week_start: date) -> str:
    week_end = week_start + timedelta(days=6)

    glucose = await db.fetch(
        """SELECT value, timing, recorded_at FROM glucose_readings
           WHERE user_id = $1::uuid AND recorded_at::date BETWEEN $2 AND $3
           ORDER BY recorded_at""",
        user_id, week_start, week_end,
    )

    meals = await db.fetch(
        """SELECT meal_type, foods, recorded_at FROM meals
           WHERE user_id = $1::uuid AND recorded_at::date BETWEEN $2 AND $3
           ORDER BY recorded_at""",
        user_id, week_start, week_end,
    )

    activities = await db.fetch(
        """SELECT activity_type, duration, intensity, recorded_at FROM activities
           WHERE user_id = $1::uuid AND recorded_at::date BETWEEN $2 AND $3
           ORDER BY recorded_at""",
        user_id, week_start, week_end,
    )

    sleep = await db.fetch(
        """SELECT hours, quality, recorded_at FROM sleep_entries
           WHERE user_id = $1::uuid AND recorded_at::date BETWEEN $2 AND $3
           ORDER BY recorded_at""",
        user_id, week_start, week_end,
    )

    medications = await db.fetch(
        """SELECT name, dose_value, dose_unit, timing, recorded_at FROM medications
           WHERE user_id = $1::uuid AND recorded_at::date BETWEEN $2 AND $3
           ORDER BY recorded_at""",
        user_id, week_start, week_end,
    )

    def fmt_glucose(rows):
        return "\n".join(f"  {r['recorded_at'].strftime('%a %H:%M')} - {r['value']} mg/dL ({r['timing']})" for r in rows)

    def fmt_meals(rows):
        return "\n".join(f"  {r['recorded_at'].strftime('%a %H:%M')} - {r['meal_type']}: {', '.join(r['foods'])}" for r in rows)

    def fmt_activities(rows):
        return "\n".join(f"  {r['recorded_at'].strftime('%a %H:%M')} - {r['activity_type']} {r['duration']}min ({r['intensity']})" for r in rows)

    def fmt_sleep(rows):
        return "\n".join(f"  {r['recorded_at'].strftime('%a')} - {r['hours']}hrs ({r['quality']})" for r in rows)

    def fmt_meds(rows):
        return "\n".join(f"  {r['recorded_at'].strftime('%a %H:%M')} - {r['name']} {r['dose_value']}{r['dose_unit']} ({r['timing']})" for r in rows)

    data_text = f"""Week: {week_start} to {week_end}

Glucose readings ({len(glucose)}):
{fmt_glucose(glucose) if glucose else "  None"}

Meals ({len(meals)}):
{fmt_meals(meals) if meals else "  None"}

Activities ({len(activities)}):
{fmt_activities(activities) if activities else "  None"}

Sleep ({len(sleep)}):
{fmt_sleep(sleep) if sleep else "  None"}

Medications ({len(medications)}):
{fmt_meds(medications) if medications else "  None"}"""

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    response = await client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=1024,
        system="You are a metabolic health analyst for the Verazoi app. Analyze the user's weekly health data and provide a concise, actionable summary. Focus on: glucose patterns and what influences them, meal-glucose correlations, activity impact on metabolic stability, sleep quality trends, and medication timing effects. Be specific with numbers. Keep it to 3-4 short paragraphs. No greetings or sign-offs.",
        messages=[{"role": "user", "content": data_text}],
    )
    return response.content[0].text
