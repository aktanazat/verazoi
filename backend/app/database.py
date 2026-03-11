import asyncio
import asyncpg
from app.config import settings

pool: asyncpg.Pool | None = None
_lock = asyncio.Lock()


async def get_pool() -> asyncpg.Pool:
    global pool
    if pool is None:
        async with _lock:
            if pool is None:
                pool = await asyncpg.create_pool(
                    settings.database_url,
                    min_size=2,
                    max_size=10,
                    command_timeout=10,
                )
    return pool


async def close_pool():
    global pool
    if pool:
        await pool.close()
        pool = None


async def get_db() -> asyncpg.Connection:
    p = await get_pool()
    async with p.acquire() as conn:
        yield conn
