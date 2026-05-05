from datetime import datetime

from pydantic import BaseModel, Field


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
