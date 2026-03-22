from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
import asyncpg
from app.database import get_db
from app.models.schemas import CGMConnectRequest, CGMStatusResponse, GlucoseResponse
from app.services.auth import get_current_user
from app.services import dexcom

router = APIRouter(prefix="/cgm", tags=["cgm"])


@router.post("/connect", status_code=201)
async def connect_cgm(
    body: CGMConnectRequest,
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    if body.provider == "dexcom":
        try:
            session = await dexcom.authenticate(body.username, body.password)
        except Exception:
            raise HTTPException(status_code=400, detail="Dexcom authentication failed. Check credentials.")

        await db.execute(
            """INSERT INTO cgm_connections (user_id, provider, session_token, username, active)
               VALUES ($1::uuid, $2, $3, $4, true)
               ON CONFLICT (user_id, provider) DO UPDATE
               SET session_token = EXCLUDED.session_token, username = EXCLUDED.username, active = true""",
            user_id, body.provider, session, body.username,
        )
        return {"status": "connected", "provider": body.provider}

    raise HTTPException(status_code=400, detail=f"Provider {body.provider} not supported yet.")


@router.post("/sync")
async def sync_cgm(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    conn = await db.fetchrow(
        "SELECT provider, session_token FROM cgm_connections WHERE user_id = $1::uuid AND active",
        user_id,
    )
    if not conn:
        raise HTTPException(status_code=404, detail="No active CGM connection.")

    if conn["provider"] == "dexcom":
        try:
            readings = await dexcom.fetch_readings(conn["session_token"])
        except Exception:
            # Session expired, need re-auth
            raise HTTPException(status_code=401, detail="CGM session expired. Reconnect your device.")

        inserted = 0
        for r in readings:
            dt = datetime.fromtimestamp(r["epoch_ms"] / 1000, tz=timezone.utc)
            try:
                await db.execute(
                    """INSERT INTO glucose_readings (user_id, value, timing, recorded_at)
                       VALUES ($1::uuid, $2, 'cgm', $3)
                       ON CONFLICT DO NOTHING""",
                    user_id, r["value"], dt,
                )
                inserted += 1
            except Exception:
                pass

        await db.execute(
            "UPDATE cgm_connections SET last_sync = now() WHERE user_id = $1::uuid AND provider = 'dexcom'",
            user_id,
        )

        return {"status": "synced", "readings_imported": inserted}

    raise HTTPException(status_code=400, detail="Unsupported provider.")


@router.get("/status")
async def cgm_status(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    rows = await db.fetch(
        "SELECT provider, active, last_sync FROM cgm_connections WHERE user_id = $1::uuid",
        user_id,
    )
    return [CGMStatusResponse(provider=r["provider"], active=r["active"], last_sync=r["last_sync"]) for r in rows]


@router.delete("/disconnect")
async def disconnect_cgm(
    user_id: str = Depends(get_current_user),
    db: asyncpg.Connection = Depends(get_db),
):
    await db.execute(
        "UPDATE cgm_connections SET active = false, session_token = NULL WHERE user_id = $1::uuid",
        user_id,
    )
    return {"status": "disconnected"}
