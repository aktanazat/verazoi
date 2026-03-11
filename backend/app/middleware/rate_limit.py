import time
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.redis_client import get_redis
from app.config import settings

RATE_LIMIT_SCRIPT = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
    redis.call('EXPIRE', KEYS[1], 60)
end
return current
"""


class RateLimitMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"

        auth_header = request.headers.get("authorization", "")
        is_authenticated = auth_header.startswith("Bearer ") and len(auth_header) > 10
        limit = settings.rate_limit_authenticated if is_authenticated else settings.rate_limit_public

        key = f"rl:{client_ip}:{int(time.time()) // 60}"
        current = 0

        try:
            r = await get_redis()
            current = await r.eval(RATE_LIMIT_SCRIPT, 1, key)
            if current > limit:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Max {limit} requests per minute.",
                    headers={"Retry-After": "60"},
                )
        except HTTPException:
            raise
        except Exception:
            pass

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - current))
        return response
