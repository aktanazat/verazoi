import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import get_pool, close_pool
from app.redis_client import get_redis, close_redis
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes import auth, glucose, meals, activity, sleep, timeline, stability, sync, medications, goals, trends, correlations, insights, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    await asyncio.gather(get_pool(), get_redis())
    yield
    await asyncio.gather(close_pool(), close_redis())


app = FastAPI(
    title="Verazoi API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

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


@app.get("/health")
async def health():
    return {"status": "ok"}
