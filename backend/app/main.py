import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings, log
from app.database import get_pool, close_pool
from app.middleware.origin import OriginGuardMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes import (
    auth, glucose, meals, activity, sleep, timeline,
    stability, sync, medications, goals, trends,
    correlations, insights, export,
    recognize, playbook, experiments, fasting, med_schedules, cgm,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting Verazoi API (env=%s)", settings.env)

    # Keep startup non-blocking so Render can serve /health even while external
    # services are cold-starting or degraded. Route handlers initialize DB/Redis lazily.
    yield

    log.info("Shutting down")
    await close_pool()


app = FastAPI(
    title="Verazoi API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.env == "development" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(OriginGuardMiddleware)

prefix = "/api/v1"
app.include_router(auth.router, prefix=prefix)
app.include_router(glucose.router, prefix=prefix)
app.include_router(meals.router, prefix=prefix)
app.include_router(activity.router, prefix=prefix)
app.include_router(sleep.router, prefix=prefix)
app.include_router(timeline.router, prefix=prefix)
app.include_router(stability.router, prefix=prefix)
app.include_router(sync.router, prefix=prefix)
app.include_router(medications.router, prefix=prefix)
app.include_router(goals.router, prefix=prefix)
app.include_router(trends.router, prefix=prefix)
app.include_router(correlations.router, prefix=prefix)
app.include_router(insights.router, prefix=prefix)
app.include_router(export.router, prefix=prefix)
app.include_router(recognize.router, prefix=prefix)
app.include_router(playbook.router, prefix=prefix)
app.include_router(experiments.router, prefix=prefix)
app.include_router(fasting.router, prefix=prefix)
app.include_router(med_schedules.router, prefix=prefix)
app.include_router(cgm.router, prefix=prefix)


@app.get("/health")
async def health():
    checks = {"api": "ok"}
    try:
        pool = await asyncio.wait_for(get_pool(), timeout=5)
        async with pool.acquire() as conn:
            await asyncio.wait_for(conn.fetchval("SELECT 1"), timeout=5)
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "error"

    status = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return {"status": status, "checks": checks}
