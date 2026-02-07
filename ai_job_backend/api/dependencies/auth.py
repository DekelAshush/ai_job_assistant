"""
JWT auth: verify Supabase access token and return user_id (sub).
Supports both:
- ES256 (Supabase JWT Signing Keys): uses JWKS from SUPABASE_URL/auth/v1/.well-known/jwks.json
- HS256 (Legacy): set SUPABASE_JWT_SECRET in env.
"""
import logging
import os

import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)
security = HTTPBearer(auto_error=False)


def _get_jwks_uri() -> str:
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    if not url:
        raise RuntimeError("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL required for JWKS")
    return url.rstrip("/") + "/auth/v1/.well-known/jwks.json"


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    """Verify Bearer JWT and return the user id (sub). Raises 401 if missing or invalid."""
    if not credentials or credentials.credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header (Bearer token)",
        )
    token = credentials.credentials
    try:
        unverified = jwt.get_unverified_header(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
        )
    alg = unverified.get("alg")
    options = {"verify_aud": False, "verify_iss": False}
    try:
        if alg == "ES256":
            jwks_uri = _get_jwks_uri()
            jwks_client = PyJWKClient(jwks_uri)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256"],
                options=options,
            )
        else:
            secret = os.getenv("SUPABASE_JWT_SECRET")
            if not secret:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="SUPABASE_JWT_SECRET not configured (required for HS256 tokens)",
                )
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options=options,
            )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing sub (user id)",
        )
    logger.info("Token verified OK: user_id=%s alg=%s", user_id, alg)
    return str(user_id)
