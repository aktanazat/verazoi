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


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


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


# ── CGM ──

class CGMConnectRequest(BaseModel):
    provider: str = Field(pattern=r"^(dexcom|libre)$")
    username: str
    password: str


class CGMStatusResponse(BaseModel):
    provider: str
    active: bool
    last_sync: datetime | None


# ── Meal Photo Recognition ──

class FoodRecognitionResponse(BaseModel):
    foods: list[str]


# ── Pre-meal Playbook ──

class PlaybookEntry(BaseModel):
    food: str
    avg_delta: float
    occurrences: int
    suggestion: str | None = None


# ── Experiments ──

class ExperimentCreate(BaseModel):
    name: str
    food_a: str
    food_b: str


class ExperimentResponse(BaseModel):
    id: str
    name: str
    food_a: str
    food_b: str
    status: str
    created_at: datetime


class ExperimentEntryCreate(BaseModel):
    arm: str = Field(pattern=r"^(a|b)$")
    pre_glucose: int = Field(ge=20, le=500)
    peak_glucose: int = Field(ge=20, le=500)


class ExperimentEntryResponse(BaseModel):
    id: str
    arm: str
    pre_glucose: int
    peak_glucose: int
    glucose_delta: int
    recorded_at: datetime


class ExperimentComparison(BaseModel):
    experiment: ExperimentResponse
    arm_a: list[ExperimentEntryResponse]
    arm_b: list[ExperimentEntryResponse]
    avg_delta_a: float | None
    avg_delta_b: float | None


# ── Fasting ──

class FastingStartRequest(BaseModel):
    target_hours: float | None = None


class FastingSessionResponse(BaseModel):
    id: str
    started_at: datetime
    ended_at: datetime | None
    target_hours: float | None
    elapsed_hours: float
    glucose_readings: list[GlucoseResponse] = []


# ── Medication Schedules ──

class MedScheduleCreate(BaseModel):
    medication_name: str
    dose_value: float
    dose_unit: str = Field(pattern=r"^(units|mg)$")
    schedule_time: str
    days_of_week: list[int] = [0, 1, 2, 3, 4, 5, 6]


class MedScheduleResponse(BaseModel):
    id: str
    medication_name: str
    dose_value: float
    dose_unit: str
    schedule_time: str
    days_of_week: list[int]
    active: bool
