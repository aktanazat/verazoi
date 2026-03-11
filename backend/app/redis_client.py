import asyncio
import redis.asyncio as redis
from app.config import settings

_redis: redis.Redis | None = None
_lock = asyncio.Lock()


async def get_redis() -> redis.Redis:
    global _redis
    if _redis is None:
        async with _lock:
            if _redis is None:
                _redis = redis.from_url(
                    settings.redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    retry_on_timeout=True,
                )
    return _redis


async def close_redis():
    global _redis
    if _redis:
        await _redis.aclose()
        _redis = None
