from datetime import datetime

from pydantic import BaseModel


class GoalsUpsert(BaseModel):
    glucose_low: int = 70
    glucose_high: int = 140
    daily_steps: int = 10000
    sleep_hours: float = 8


class GoalsResponse(GoalsUpsert):
    id: str


class GoalProgress(BaseModel):
    glucose_in_range_pct: float
    steps_today: int
    steps_target: int
    sleep_last: float
    sleep_target: float


class GlucoseTrendPoint(BaseModel):
    date: str
    avg: float
    min: int
    max: int
    count: int


class StabilityTrendPoint(BaseModel):
    date: str
    score: int


class MealGlucoseCorrelation(BaseModel):
    meal_id: str
    meal_type: str
    foods: list[str]
    recorded_at: datetime
    pre_meal_glucose: int | None
    peak_glucose: int | None
    glucose_delta: int | None


class FoodImpact(BaseModel):
    food: str
    avg_delta: float
    occurrences: int
