from datetime import datetime

from pydantic import BaseModel


class InsightResponse(BaseModel):
    id: str
    week_start: str
    summary: str
    generated_at: datetime


class InsightPreviewResponse(BaseModel):
    week_start: str
    week_end: str
    system_prompt: str
    user_prompt: str


class InsightGenerateRequest(BaseModel):
    week_start: str
    user_prompt: str
