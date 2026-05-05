import logging
import time
from collections import defaultdict

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from app.redis_client import get_redis
from app.config import settings
from app.services.auth import decode_token

log = logging.getLogger("verazoi.ratelimit")

RATE_LIMIT_SCRIPT = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], 60)
end
return current
"""

_local_counts: dict[str, int] = defaultdict(int)
_local_window = 0


def _validated_user_id(request: Request) -> str | None:
    token = None
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.removeprefix("Bearer ").strip()
    if not token:
        token = request.cookies.get("verazoi_access")
    if not token:
        return None
    try:
        return decode_token(token)
    except HTTPException:
        return None


def _local_increment(key: str, window: int) -> int:
    global _local_window, _local_counts
    if _local_window != window:
        _local_counts = defaultdict(int)
        _local_window = window
    _local_counts[key] += 1
    return _local_counts[key]


class RateLimitMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        user_id = _validated_user_id(request)
        limit = settings.rate_limit_authenticated if user_id else settings.rate_limit_public

        window = int(time.time()) // 60
        identity = f"user:{user_id}" if user_id else f"ip:{client_ip}"
        key = f"rl:{identity}:{window}"
        current = 0

        try:
            r = await get_redis()
            if r is None:
                raise RuntimeError("Redis unavailable")
            current = await r.eval(RATE_LIMIT_SCRIPT, 1, key)
        except Exception as exc:
            current = _local_increment(key, window)
            log.warning("Rate limit using local fallback: %s", exc)

        if current > limit:
            log.warning("Rate limit exceeded: identity=%s count=%d limit=%d", identity, current, limit)
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {limit} requests per minute.",
                headers={"Retry-After": "60"},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - current))
        return response
