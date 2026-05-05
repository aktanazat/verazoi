from datetime import datetime

from pydantic import BaseModel, Field


class GlucoseCreate(BaseModel):
    value: int = Field(ge=20, le=500)
    timing: str = Field(pattern=r"^(fasting|before|after)$")


class GlucoseResponse(BaseModel):
    id: str
    value: int
    timing: str
    recorded_at: datetime


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


class SleepCreate(BaseModel):
    hours: float = Field(ge=0, le=24)
    quality: str = Field(pattern=r"^(poor|fair|good|great)$")


class SleepResponse(BaseModel):
    id: str
    hours: float
    quality: str
    recorded_at: datetime


class TimelineEvent(BaseModel):
    id: str
    type: str
    label: str
    value: str
    recorded_at: datetime
