from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg
from app.database import get_db
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: asyncpg.Connection = Depends(get_db)):
    existing = await db.fetchval("SELECT id FROM users WHERE email = $1", body.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = await db.fetchval(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id::text",
        body.email,
        hash_password(body.password),
    )
    return TokenResponse(access_token=create_token(user_id))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("SELECT id::text, password_hash FROM users WHERE email = $1", body.email)
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_token(row["id"]))


@router.get("/me", response_model=UserResponse)
async def me(user_id: str = Depends(get_current_user), db: asyncpg.Connection = Depends(get_db)):
    row = await db.fetchrow("SELECT id::text, email, created_at FROM users WHERE id = $1::uuid", user_id)
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**dict(row))
