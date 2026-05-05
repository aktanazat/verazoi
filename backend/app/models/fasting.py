from datetime import datetime

from pydantic import BaseModel, Field

from app.models.tracking import GlucoseResponse


class FastingStartRequest(BaseModel):
    target_hours: float | None = None


class FastingSessionResponse(BaseModel):
    id: str
    started_at: datetime
    ended_at: datetime | None
    target_hours: float | None
    elapsed_hours: float
    glucose_readings: list[GlucoseResponse] = Field(default_factory=list)
