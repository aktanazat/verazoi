from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.routes import insights, sync


class FakeRedis:
    def __init__(self, exists_result=False):
        self.exists_result = exists_result
        self.setex_calls = []
        self.deleted_keys = []

    async def exists(self, key):
        return self.exists_result

    async def setex(self, key, ttl, value):
        self.setex_calls.append((key, ttl, value))

    async def delete(self, key):
        self.deleted_keys.append(key)


class FakeDB:
    def __init__(self):
        self.inserted_summary = None
        self.inserted_week_start = None
        self.inserted_prompt_timestamp = None
        self.wearable_rows = []

    async def fetchrow(self, query, *args):
        if "INSERT INTO ai_insights" in query:
            self.inserted_week_start = args[1]
            self.inserted_summary = args[2]
            return {
                "id": "insight-1",
                "generated_at": datetime(2026, 3, 25, 19, 0, tzinfo=timezone.utc),
            }

        if "INSERT INTO glucose_readings" in query:
            self.inserted_prompt_timestamp = args[2]
            return {"inserted": 1}

        raise AssertionError(f"Unexpected fetchrow query: {query}")

    async def execute(self, query, *args):
        self.wearable_rows.append((query, args))


def make_client(db):
    app = FastAPI()
    app.include_router(insights.router, prefix="/api/v1")
    app.include_router(sync.router, prefix="/api/v1")

    async def override_user():
        return "00000000-0000-0000-0000-000000000001"

    async def override_db():
        return db

    app.dependency_overrides[insights.get_current_user] = override_user
    app.dependency_overrides[insights.get_db] = override_db
    app.dependency_overrides[sync.get_current_user] = override_user
    app.dependency_overrides[sync.get_db] = override_db
    return TestClient(app)


def test_generate_requires_reviewed_payload_body():
    client = make_client(FakeDB())

    response = client.post("/api/v1/insights/weekly/generate")

    assert response.status_code == 422


def test_preview_and_generate_use_same_reviewed_payload(monkeypatch):
    db = FakeDB()
    client = make_client(db)
    redis = FakeRedis()
    reviewed_prompt = "Week: reviewed payload"
    captured_prompts = []

    async def fake_get_redis():
        return redis

    async def fake_build_prompt(user_id, db_conn, week_start):
        return reviewed_prompt

    async def fake_generate_from_prompt(user_prompt):
        captured_prompts.append(user_prompt)
        return "Reviewed summary"

    monkeypatch.setattr(insights, "get_redis", fake_get_redis)
    monkeypatch.setattr(insights, "build_insight_user_prompt", fake_build_prompt)
    monkeypatch.setattr(insights, "generate_insight_from_prompt", fake_generate_from_prompt)

    preview = client.get("/api/v1/insights/weekly/preview")
    assert preview.status_code == 200

    preview_json = preview.json()
    response = client.post(
        "/api/v1/insights/weekly/generate",
        json={
            "week_start": preview_json["week_start"],
            "user_prompt": preview_json["user_prompt"],
        },
    )

    assert response.status_code == 201
    assert captured_prompts == [reviewed_prompt]
    assert db.inserted_summary == "Reviewed summary"
    assert redis.setex_calls == [("insight_gen:00000000-0000-0000-0000-000000000001", 3600, "1")]


def test_generate_rejects_stale_preview(monkeypatch):
    client = make_client(FakeDB())

    async def fake_get_redis():
        return FakeRedis()

    monkeypatch.setattr(insights, "get_redis", fake_get_redis)

    stale_week = (insights.current_week_start() - timedelta(days=7)).isoformat()
    response = client.post(
        "/api/v1/insights/weekly/generate",
        json={"week_start": stale_week, "user_prompt": "outdated"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Insight preview is out of date. Refresh and review it again."


def test_wearable_sync_accepts_iso_glucose_timestamps(monkeypatch):
    db = FakeDB()
    client = make_client(db)
    redis = FakeRedis()

    async def fake_get_redis():
        return redis

    monkeypatch.setattr(sync, "get_redis", fake_get_redis)

    response = client.post(
        "/api/v1/sync/wearable",
        json={
            "heart_rate": 58,
            "steps": 8421,
            "glucose_readings": [
                {"value": 112, "recorded_at": "2026-03-25T12:00:00Z"}
            ],
        },
    )

    assert response.status_code == 201
    assert response.json() == {"status": "synced", "glucose_readings_imported": 1}
    assert db.inserted_prompt_timestamp == datetime(2026, 3, 25, 12, 0, tzinfo=timezone.utc)
    assert redis.deleted_keys == ["stability:00000000-0000-0000-0000-000000000001"]
