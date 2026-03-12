from datetime import datetime
from pydantic import BaseModel, Field


# ── Auth ──

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime


# ── Glucose ──

class GlucoseCreate(BaseModel):
    value: int = Field(ge=20, le=500)
    timing: str = Field(pattern=r"^(fasting|before|after)$")


class GlucoseResponse(BaseModel):
    id: str
    value: int
    timing: str
    recorded_at: datetime


# ── Meals ──

class MealCreate(BaseModel):
    meal_type: str
    foods: list[str]
    notes: str = ""


class MealResponse(BaseModel):
    id: str
    meal_type: str
    foods: list[str]
    notes: str
    recorded_at: datetime


# ── Activity ──

class ActivityCreate(BaseModel):
    activity_type: str
    duration: int = Field(ge=1, le=600)
    intensity: str = Field(pattern=r"^(Light|Moderate|Intense)$")


class ActivityResponse(BaseModel):
    id: str
    activity_type: str
    duration: int
    intensity: str
    recorded_at: datetime


# ── Sleep ──

class SleepCreate(BaseModel):
    hours: float = Field(ge=0, le=24)
    quality: str = Field(pattern=r"^(poor|fair|good|great)$")


class SleepResponse(BaseModel):
    id: str
    hours: float
    quality: str
    recorded_at: datetime


# ── Timeline ──

class TimelineEvent(BaseModel):
    id: str
    type: str
    label: str
    value: str
    recorded_at: datetime


# ── Stability ──

class StabilityResponse(BaseModel):
    score: int
    glucose_component: float
    activity_component: float
    sleep_component: float
    heart_rate_component: float
    spike_risk: float
    spike_factors: list[dict]


# ── Wearable ──

class WearableSyncRequest(BaseModel):
    heart_rate: int | None = None
    steps: int | None = None
    active_minutes: int | None = None
    sleep_hours: float | None = None
    sleep_quality: str | None = None


# ── Medications ──

class MedicationCreate(BaseModel):
    name: str
    dose_value: float
    dose_unit: str = Field(pattern=r"^(units|mg)$")
    timing: str = Field(pattern=r"^(before_meal|with_meal|after_meal|bedtime|morning|other)$")
    notes: str = ""


class MedicationResponse(BaseModel):
    id: str
    name: str
    dose_value: float
    dose_unit: str
    timing: str
    notes: str
    recorded_at: datetime


# ── Goals ──

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


# ── Trends ──

class GlucoseTrendPoint(BaseModel):
    date: str
    avg: float
    min: int
    max: int
    count: int


class StabilityTrendPoint(BaseModel):
    date: str
    score: int


# ── Correlations ──

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


# ── Insights ──

class InsightResponse(BaseModel):
    id: str
    week_start: str
    summary: str
    generated_at: datetime
