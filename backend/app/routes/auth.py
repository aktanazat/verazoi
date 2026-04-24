import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
import asyncpg

from app.config import settings
from app.database import get_db
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse, PasswordResetRequest, PasswordResetConfirm, RefreshResponse
from app.services.auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    create_reset_token, hash_token, get_current_user,
    REFRESH_TOKEN_EXPIRE, RESET_TOKEN_EXPIRE, COOKIE_NAME,
)

router = APIRouter(prefix="/auth", tags=["auth"])

IS_PROD = settings.env == "production"


def _set_cookies(response: Response, access_token: str, refresh_raw: str):
    response.set_cookie(
        "verazoi_access",
        access_token,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )
    response.set_cookie(
        COOKIE_NAME,
        refresh_raw,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=int(REFRESH_TOKEN_EXPIRE.total_seconds()),
        path="/api/v1/auth",
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, response: Response, db: asyncpg.Connection = Depends(get_db)):
    existing = await db.fetchval("SELECT id FROM users WHERE email = $1", body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = await db.fetchval(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id::text",
        body.email,
        hash_password(body.password),
    )

    access_token = create_access_token(user_id)
    refresh_raw, refresh_hash = create_refresh_token()
    await db.execute(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1::uuid, $2, $3)",
        user_id, refresh_hash, datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRE,
    )

    _set_cookies(response, access_token, refresh_raw)
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, response: Response, db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("SELECT id::text, password_hash FROM users WHERE email = $1", body.email)
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = row["id"]
    access_token = create_access_token(user_id)
    refresh_raw, refresh_hash = create_refresh_token()
    await db.execute(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1::uuid, $2, $3)",
        user_id, refresh_hash, datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRE,
    )

    _set_cookies(response, access_token, refresh_raw)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(request: Request, response: Response, db: asyncpg.Connection = Depends(get_db)):
    raw_token = request.cookies.get(COOKIE_NAME)
    if not raw_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    token_hash = hash_token(raw_token)
    row = await db.fetchrow(
        """SELECT id, user_id::text, expires_at FROM refresh_tokens
           WHERE token_hash = $1 AND NOT revoked AND expires_at > now()""",
        token_hash,
    )
    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # Revoke old token (rotation)
    await db.execute("UPDATE refresh_tokens SET revoked = true WHERE id = $1", row["id"])

    user_id = row["user_id"]
    new_access = create_access_token(user_id)
    new_refresh_raw, new_refresh_hash = create_refresh_token()
    await db.execute(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1::uuid, $2, $3)",
        user_id, new_refresh_hash, datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRE,
    )

    _set_cookies(response, new_access, new_refresh_raw)
    return RefreshResponse(access_token=new_access)


@router.post("/logout")
async def logout(request: Request, response: Response, db: asyncpg.Connection = Depends(get_db)):
    raw_token = request.cookies.get(COOKIE_NAME)
    if raw_token:
        token_hash = hash_token(raw_token)
        await db.execute("UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1", token_hash)

    response.delete_cookie("verazoi_access", path="/")
    response.delete_cookie(COOKIE_NAME, path="/api/v1/auth")
    return {"status": "logged_out"}


@router.post("/password-reset")
async def request_password_reset(body: PasswordResetRequest, db: asyncpg.Connection = Depends(get_db)):
    # Always return success to prevent email enumeration
    user = await db.fetchrow("SELECT id::text FROM users WHERE email = $1", body.email)
    if user:
        raw, hashed = create_reset_token()
        await db.execute(
            "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1::uuid, $2, $3)",
            user["id"], hashed, datetime.now(timezone.utc) + RESET_TOKEN_EXPIRE,
        )
        # TODO: send email with reset link containing `raw` token
        if settings.env == "development":
            logging.getLogger("verazoi.auth").info("Reset token for %s: %s", body.email, raw)

    return {"status": "If that email exists, a reset link has been sent."}


@router.post("/password-reset/confirm")
async def confirm_password_reset(body: PasswordResetConfirm, db: asyncpg.Connection = Depends(get_db)):
    token_hash = hash_token(body.token)
    row = await db.fetchrow(
        """SELECT id, user_id::text FROM password_reset_tokens
           WHERE token_hash = $1 AND NOT used AND expires_at > now()""",
        token_hash,
    )
    if not row:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    new_hash = hash_password(body.new_password)
    await db.execute("UPDATE users SET password_hash = $1 WHERE id = $2::uuid", new_hash, row["user_id"])
    await db.execute("UPDATE password_reset_tokens SET used = true WHERE id = $1", row["id"])

    # Revoke all refresh tokens for this user (force re-login)
    await db.execute("UPDATE refresh_tokens SET revoked = true WHERE user_id = $1::uuid", row["user_id"])

    return {"status": "Password reset successfully"}


@router.get("/me", response_model=UserResponse)
async def me(user_id: str = Depends(get_current_user), db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("SELECT id::text, email, created_at FROM users WHERE id = $1::uuid", user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**dict(row))
