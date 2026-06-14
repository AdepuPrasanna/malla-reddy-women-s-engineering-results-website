"""Simple HMAC admin token auth with Firestore user support."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from functools import wraps
from typing import Any

from flask import g, jsonify, request

TOKEN_TTL_SECONDS = 60 * 60 * 12  # 12 hours


def _secret() -> str:
    return os.environ.get("ADMIN_SECRET") or os.environ.get("ADMIN_PASSWORD") or "mrecw-admin-dev-secret"


def admin_credentials() -> tuple[str, str]:
    username = os.environ.get("ADMIN_USERNAME", "admin")
    password = os.environ.get("ADMIN_PASSWORD", "mrecw@admin")
    return username, password


def create_admin_token(username: str, role: str = "admin") -> str:
    payload = {
        "sub": username,
        "role": role,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    raw = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(_secret().encode(), raw.encode(), hashlib.sha256).hexdigest()
    return f"{raw}.{sig}"


def decode_admin_token(token: str | None) -> dict[str, Any] | None:
    if not token:
        return None
    token = token.replace("Bearer ", "").strip()
    if "." not in token:
        return None
    raw, sig = token.rsplit(".", 1)
    expected = hmac.new(_secret().encode(), raw.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, sig):
        return None
    try:
        payload = json.loads(base64.urlsafe_b64decode(raw.encode()).decode())
    except (json.JSONDecodeError, ValueError):
        return None
    if payload.get("role") != "admin":
        return None
    if int(payload.get("exp", 0)) < int(time.time()):
        return None
    return payload


def verify_admin_token(token: str | None) -> bool:
    return decode_admin_token(token) is not None


def authenticate_admin(username: str, password: str) -> str | None:
    from cms_service import bootstrap_admin_users, verify_admin_password

    bootstrap_admin_users()
    user = verify_admin_password(username, password)
    if user:
        return create_admin_token(user.get("username") or username, user.get("role") or "admin")

    expected_user, expected_pass = admin_credentials()
    if username == expected_user and password == expected_pass:
        return create_admin_token(username, "admin")
    return None


def require_admin(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization") or request.headers.get("X-Admin-Token")
        payload = decode_admin_token(auth)
        if not payload:
            return jsonify({"error": "Unauthorized"}), 401
        g.admin_user = payload.get("sub")
        g.admin_role = payload.get("role")
        return view(*args, **kwargs)

    return wrapper
