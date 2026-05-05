from urllib.parse import urlparse

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import settings
from app.services.auth import COOKIE_NAME

UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
ACCESS_COOKIE_NAME = "verazoi_access"


def _origin_from_referer(referer: str | None) -> str | None:
    if not referer:
        return None
    parsed = urlparse(referer)
    if not parsed.scheme or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")


class OriginGuardMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method not in UNSAFE_METHODS or settings.env != "production":
            return await call_next(request)

        allowed = set(settings.allowed_origins)
        origin = request.headers.get("origin")
        request_origin = (origin.rstrip("/") if origin else _origin_from_referer(request.headers.get("referer")))
        has_auth_cookie = ACCESS_COOKIE_NAME in request.cookies or COOKIE_NAME in request.cookies

        if request_origin and request_origin not in allowed:
            return JSONResponse({"detail": "Origin not allowed"}, status_code=403)
        if has_auth_cookie and not request_origin:
            return JSONResponse({"detail": "Origin header required"}, status_code=403)

        return await call_next(request)
