from pydantic import BaseModel


class FoodRecognitionResponse(BaseModel):
    foods: list[str]


class PlaybookEntry(BaseModel):
    food: str
    avg_delta: float
    occurrences: int
    suggestion: str | None = None
