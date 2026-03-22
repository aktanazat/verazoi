"""Dexcom Share API client."""
import httpx

DEXCOM_BASE = "https://share2.dexcom.com/ShareWebServices/Services"
DEXCOM_APP_ID = "d89443d2-327c-4a6f-89e5-496bbb0317db"


async def authenticate(username: str, password: str) -> str:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{DEXCOM_BASE}/General/LoginPublisherAccountByName",
            json={
                "accountName": username,
                "password": password,
                "applicationId": DEXCOM_APP_ID,
            },
            headers={"Content-Type": "application/json"},
        )
        res.raise_for_status()
        return res.json()


async def fetch_readings(session_id: str, minutes: int = 1440, max_count: int = 288) -> list[dict]:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{DEXCOM_BASE}/Publisher/ReadPublisherLatestGlucoseValues",
            params={
                "sessionId": session_id,
                "minutes": minutes,
                "maxCount": max_count,
            },
        )
        res.raise_for_status()
        readings = res.json()

    result = []
    for r in readings:
        # Dexcom returns DT as "/Date(epoch)/"
        dt_str = r.get("DT", "")
        epoch_ms = int(dt_str.replace("/Date(", "").replace(")/", ""))
        result.append({
            "value": r["Value"],
            "trend": r.get("Trend"),
            "epoch_ms": epoch_ms,
        })
    return result
