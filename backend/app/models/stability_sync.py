from datetime import datetime

from pydantic import BaseModel, Field


class StabilityResponse(BaseModel):
    score: int
    glucose_component: float
    activity_component: float
    sleep_component: float
    heart_rate_component: float
    spike_risk: float
    spike_factors: list[dict]


class GlucoseSyncReading(BaseModel):
    value: int = Field(ge=20, le=500)
    recorded_at: datetime


class WearableSyncRequest(BaseModel):
    heart_rate: int | None = None
    steps: int | None = None
    active_minutes: int | None = None
    sleep_hours: float | None = None
    sleep_quality: str | None = None
    glucose_readings: list[GlucoseSyncReading] | None = None


class CGMConnectRequest(BaseModel):
    provider: str = Field(pattern=r"^(dexcom|libre)$")
    username: str
    password: str


class CGMStatusResponse(BaseModel):
    provider: str
    active: bool
    last_sync: datetime | None
