"""Supabase Postgres connection pool + thin query helpers.

DATABASE_URL points at Supabase's pooler endpoint (port 6543, transaction mode).
Supabase's pooler supports prepared statements, so asyncpg's default cache works.
"""
from __future__ import annotations

import urllib.parse
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

import asyncpg

from app.config import settings

_pool: asyncpg.Pool | None = None


def _normalize_dsn(raw: str) -> tuple[str, str]:
    """Return (clean_dsn, ssl_mode) — asyncpg-compatible.

    Extracts `sslmode` so it can be passed as a keyword arg.
    """
    parsed = urllib.parse.urlparse(raw)
    qs = urllib.parse.parse_qs(parsed.query)
    sslmode = qs.pop("sslmode", ["require"])[0]
    cleaned = parsed._replace(query=urllib.parse.urlencode(qs, doseq=True))
    return urllib.parse.urlunparse(cleaned), sslmode


async def init_pool() -> None:
    global _pool
    if _pool is not None:
        return
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is not set")
    dsn, sslmode = _normalize_dsn(settings.database_url)
    ssl_arg: Any = sslmode if sslmode in ("require", "verify-ca", "verify-full") else False
    _pool = await asyncpg.create_pool(
        dsn,
        ssl=ssl_arg,
        min_size=1,
        max_size=5,
    )


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Supabase pool not initialized — call init_pool() first")
    return _pool


async def fetch(sql: str, *args: Any) -> list[dict]:
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(sql, *args)
        return [dict(r) for r in rows]


async def fetchrow(sql: str, *args: Any) -> dict | None:
    async with get_pool().acquire() as conn:
        row = await conn.fetchrow(sql, *args)
        return dict(row) if row else None


async def fetchval(sql: str, *args: Any) -> Any:
    async with get_pool().acquire() as conn:
        return await conn.fetchval(sql, *args)


async def execute(sql: str, *args: Any) -> str:
    async with get_pool().acquire() as conn:
        return await conn.execute(sql, *args)


@asynccontextmanager
async def transaction() -> AsyncIterator[asyncpg.Connection]:
    """Acquire a connection and run inside a transaction.

    Usage:
        async with supabase.transaction() as conn:
            await conn.execute("UPDATE ...")
            row = await conn.fetchrow("INSERT ... RETURNING *", ...)
    """
    async with get_pool().acquire() as conn:
        async with conn.transaction():
            yield conn
