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
