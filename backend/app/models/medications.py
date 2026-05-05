from datetime import datetime

from pydantic import BaseModel, Field


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


class MedScheduleCreate(BaseModel):
    medication_name: str
    dose_value: float
    dose_unit: str = Field(pattern=r"^(units|mg)$")
    schedule_time: str
    days_of_week: list[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4, 5, 6])


class MedScheduleResponse(BaseModel):
    id: str
    medication_name: str
    dose_value: float
    dose_unit: str
    schedule_time: str
    days_of_week: list[int]
    active: bool
