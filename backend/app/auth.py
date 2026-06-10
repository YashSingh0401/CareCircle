"""Supabase JWT verification — supports both signing methods.

Primary: **JWT Signing Keys** (ES256 / RS256). The backend fetches Supabase's
public JWKS from `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`, caches it,
and picks the right key by the token's `kid` header.

Fallback: **Legacy HS256 shared secret** via `SUPABASE_JWT_SECRET`. Kept so
tokens issued before key rotation (still unexpired in users' browsers) keep
working during the transition.
"""
from __future__ import annotations

import time
from typing import Any

import httpx
from fastapi import Depends, Header, HTTPException, status
from jose import jwt, JWTError

from app.config import settings

AUDIENCE = "authenticated"  # Supabase default audience claim
JWKS_PATH = "/auth/v1/.well-known/jwks.json"
JWKS_TTL_SECONDS = 3600     # re-fetch hourly

_jwks_cache: dict | None = None
_jwks_fetched_at: float = 0.0


async def _fetch_jwks() -> dict:
    """Pull JWKS from Supabase. Raises on failure (caller handles fallback)."""
    global _jwks_cache, _jwks_fetched_at
    if not settings.supabase_url:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "SUPABASE_URL is not configured — cannot fetch JWKS",
        )
    url = f"{settings.supabase_url.rstrip('/')}{JWKS_PATH}"
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_fetched_at = time.time()
    return _jwks_cache


async def _get_jwks(force_refresh: bool = False) -> dict:
    """Return cached JWKS unless TTL expired or force_refresh. Stale-on-error."""
    if not force_refresh and _jwks_cache and (time.time() - _jwks_fetched_at) < JWKS_TTL_SECONDS:
        return _jwks_cache
    try:
        return await _fetch_jwks()
    except Exception:
        if _jwks_cache:
            return _jwks_cache  # serve stale rather than 5xx everyone out
        raise


def _find_key(jwks: dict, kid: str | None) -> dict | None:
    if not kid:
        return None
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


async def verify_jwt(token: str) -> dict:
    """Verify a Supabase JWT. Returns the decoded claims dict or raises 401."""
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Malformed token: {e}")

    alg = header.get("alg", "")

    # Legacy / transition path: tokens still signed with the rotated-out HS256 secret
    if alg == "HS256":
        if not settings.supabase_jwt_secret:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Token uses HS256 but no legacy SUPABASE_JWT_SECRET is configured",
            )
        try:
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                audience=AUDIENCE,
            )
        except JWTError as e:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid HS256 token: {e}")

    # Modern path: asymmetric signing keys via JWKS
    if alg not in ("ES256", "RS256"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Unsupported algorithm: {alg}")

    kid = header.get("kid")
    jwks = await _get_jwks()
    key = _find_key(jwks, kid)
    if key is None:
        # JWKS may be stale right after Supabase rotated keys — refresh once
        jwks = await _get_jwks(force_refresh=True)
        key = _find_key(jwks, kid)
    if key is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Unknown signing key id: {kid}")

    try:
        return jwt.decode(token, key, algorithms=[alg], audience=AUDIENCE)
    except JWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {e}")


def _claims_to_user(claims: dict) -> dict:
    meta = claims.get("user_metadata") or {}
    return {
        "user_id": claims["sub"],
        "email":   claims.get("email"),
        "role":    meta.get("role") or claims.get("role"),
    }


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

bearer_scheme = HTTPBearer(auto_error=False)

async def get_current_user(token: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    """Strict — raise 401 if no/invalid token."""
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    claims = await verify_jwt(token.credentials)
    return _claims_to_user(claims)


async def get_current_user_optional(token: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict | None:
    """Lax — return None instead of raising. Use for public-browse routes."""
    if not token:
        return None
    try:
        claims = await verify_jwt(token.credentials)
        return _claims_to_user(claims)
    except HTTPException:
        return None
