"""CMS: feedback, admin users, footer settings."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from werkzeug.security import check_password_hash, generate_password_hash

from firebase_cache import (
    COLLECTION_ADMIN_USERS,
    COLLECTION_FEEDBACK,
    COLLECTION_SETTINGS,
    SETTINGS_FOOTER_DOC,
    delete_raw_document,
    get_raw_document,
    init_firebase,
    is_enabled,
    list_raw_documents,
    set_raw_document,
)

DEFAULT_FOOTER = {
    "sections": [
        {
            "id": "quick-links",
            "title": "Quick Links",
            "links": [
                {"id": "ql-1", "label": "Academic Results", "href": "/academic-results", "external": False},
                {"id": "ql-2", "label": "Class Results", "href": "/class-results", "external": False},
                {"id": "ql-3", "label": "Help Center", "href": "/help-center", "external": False},
            ],
        },
        {
            "id": "legal",
            "title": "Legal",
            "links": [
                {"id": "lg-1", "label": "Privacy Policy", "href": "/help-center", "external": False},
                {"id": "lg-2", "label": "Terms of Service", "href": "/help-center", "external": False},
            ],
        },
    ],
}


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _user_doc_id(username: str) -> str:
    return username.strip().lower()


def bootstrap_admin_users() -> None:
    """Seed default admin from env when no users exist."""
    from admin_auth import admin_credentials

    init_firebase()
    if not is_enabled():
        return

    existing = list_raw_documents(COLLECTION_ADMIN_USERS, order_field="username", descending=False, limit=1)
    if existing:
        return

    username, password = admin_credentials()
    now = _utc_now_iso()
    set_raw_document(
        COLLECTION_ADMIN_USERS,
        _user_doc_id(username),
        {
            "username": username,
            "passwordHash": generate_password_hash(password),
            "role": "admin",
            "active": True,
            "createdAt": now,
            "updatedAt": now,
        },
    )


def get_admin_user(username: str) -> dict[str, Any] | None:
    init_firebase()
    if not is_enabled():
        return None
    return get_raw_document(COLLECTION_ADMIN_USERS, _user_doc_id(username))


def verify_admin_password(username: str, password: str) -> dict[str, Any] | None:
    user = get_admin_user(username)
    if not user or not user.get("active"):
        return None
    if not check_password_hash(user.get("passwordHash") or "", password):
        return None
    return user


def list_admin_users() -> list[dict[str, Any]]:
    init_firebase()
    users = list_raw_documents(COLLECTION_ADMIN_USERS, order_field="username", descending=False, limit=100)
    return [
        {
            "id": u["id"],
            "username": u.get("username"),
            "role": u.get("role", "admin"),
            "active": bool(u.get("active", True)),
            "createdAt": u.get("createdAt"),
            "updatedAt": u.get("updatedAt"),
        }
        for u in users
    ]


def create_admin_user(username: str, password: str, role: str = "admin") -> dict[str, Any]:
    init_firebase()
    if not is_enabled():
        raise ValueError("Firebase is not configured")

    username = username.strip()
    if len(username) < 3:
        raise ValueError("Username must be at least 3 characters")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters")
    if role not in ("admin",):
        raise ValueError("Invalid role")

    doc_id = _user_doc_id(username)
    if get_raw_document(COLLECTION_ADMIN_USERS, doc_id):
        raise ValueError("Username already exists")

    now = _utc_now_iso()
    payload = {
        "username": username,
        "passwordHash": generate_password_hash(password),
        "role": role,
        "active": True,
        "createdAt": now,
        "updatedAt": now,
    }
    if not set_raw_document(COLLECTION_ADMIN_USERS, doc_id, payload):
        raise ValueError("Failed to create user")
    return {"id": doc_id, "username": username, "role": role, "active": True, "createdAt": now, "updatedAt": now}


def update_admin_user(user_id: str, *, role: str | None = None, active: bool | None = None, password: str | None = None) -> dict[str, Any]:
    init_firebase()
    user = get_raw_document(COLLECTION_ADMIN_USERS, user_id)
    if not user:
        raise ValueError("User not found")

    updates: dict[str, Any] = {"updatedAt": _utc_now_iso()}
    if role is not None:
        if role not in ("admin",):
            raise ValueError("Invalid role")
        updates["role"] = role
    if active is not None:
        updates["active"] = active
    if password:
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")
        updates["passwordHash"] = generate_password_hash(password)

    set_raw_document(COLLECTION_ADMIN_USERS, user_id, updates, merge=True)
    updated = get_raw_document(COLLECTION_ADMIN_USERS, user_id) or {}
    return {
        "id": user_id,
        "username": updated.get("username"),
        "role": updated.get("role", "admin"),
        "active": bool(updated.get("active", True)),
        "createdAt": updated.get("createdAt"),
        "updatedAt": updated.get("updatedAt"),
    }


def delete_admin_user(user_id: str) -> None:
    init_firebase()
    if not get_raw_document(COLLECTION_ADMIN_USERS, user_id):
        raise ValueError("User not found")
    if not delete_raw_document(COLLECTION_ADMIN_USERS, user_id):
        raise ValueError("Failed to delete user")


def submit_feedback(message: str, *, source: str = "help-center") -> dict[str, Any]:
    init_firebase()
    if not is_enabled():
        raise ValueError("Feedback storage is not available")

    message = message.strip()
    if len(message) < 3:
        raise ValueError("Feedback is too short")

    doc_id = str(uuid.uuid4())
    now = _utc_now_iso()
    payload = {
        "message": message,
        "status": "new",
        "source": source,
        "createdAt": now,
    }
    if not set_raw_document(COLLECTION_FEEDBACK, doc_id, payload):
        raise ValueError("Failed to save feedback")
    return {"id": doc_id, **payload}


def list_feedback() -> list[dict[str, Any]]:
    init_firebase()
    return list_raw_documents(COLLECTION_FEEDBACK, order_field="createdAt", descending=True, limit=200)


def update_feedback_status(feedback_id: str, status: str) -> dict[str, Any]:
    init_firebase()
    if status not in ("new", "read", "resolved"):
        raise ValueError("Invalid status")

    doc = get_raw_document(COLLECTION_FEEDBACK, feedback_id)
    if not doc:
        raise ValueError("Feedback not found")

    set_raw_document(COLLECTION_FEEDBACK, feedback_id, {"status": status, "updatedAt": _utc_now_iso()}, merge=True)
    updated = get_raw_document(COLLECTION_FEEDBACK, feedback_id) or {}
    return {
        "id": feedback_id,
        "message": updated.get("message"),
        "status": updated.get("status"),
        "source": updated.get("source"),
        "createdAt": updated.get("createdAt"),
        "updatedAt": updated.get("updatedAt"),
    }


def get_footer_settings() -> dict[str, Any]:
    init_firebase()
    if not is_enabled():
        return DEFAULT_FOOTER

    doc = get_raw_document(COLLECTION_SETTINGS, SETTINGS_FOOTER_DOC)
    if not doc or not doc.get("sections"):
        return DEFAULT_FOOTER
    return {"sections": doc.get("sections")}


def save_footer_settings(sections: list[dict[str, Any]]) -> dict[str, Any]:
    init_firebase()
    if not is_enabled():
        raise ValueError("Firebase is not configured")

    cleaned = []
    for section in sections:
        title = (section.get("title") or "").strip()
        if not title:
            continue
        links = []
        for link in section.get("links") or []:
            label = (link.get("label") or "").strip()
            href = (link.get("href") or "").strip()
            if not label or not href:
                continue
            links.append({
                "id": link.get("id") or str(uuid.uuid4()),
                "label": label,
                "href": href,
                "external": bool(link.get("external")),
            })
        cleaned.append({
            "id": section.get("id") or str(uuid.uuid4()),
            "title": title,
            "links": links,
        })

    now = _utc_now_iso()
    payload = {"sections": cleaned, "updatedAt": now}
    set_raw_document(COLLECTION_SETTINGS, SETTINGS_FOOTER_DOC, payload, merge=True)
    return payload
