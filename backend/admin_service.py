"""Admin dashboard stats and hard scrape orchestration."""

from __future__ import annotations

import json
import logging
import threading

from firebase_cache import (
    data_differ,
    get_admin_stats,
    get_cached_result,
    init_firebase,
    is_enabled,
    list_all_stored_tickets,
    log_search,
    save_result,
)
from scraper import login_and_fetch_marks

logger = logging.getLogger(__name__)

_hard_scrape_lock = threading.Lock()
_hard_scrape_running = False


def is_hard_scrape_running() -> bool:
    return _hard_scrape_running


def track_search(hall_ticket: str) -> None:
    init_firebase()
    log_search(hall_ticket)


def fetch_admin_stats() -> dict:
    init_firebase()
    stats = get_admin_stats()
    stats["hardScrapeRunning"] = _hard_scrape_running
    return stats


def stream_hard_scrape():
    global _hard_scrape_running

    if not _hard_scrape_lock.acquire(blocking=False):
        yield _emit({"type": "error", "message": "Hard scrape already running"})
        return

    _hard_scrape_running = True

    def _emit(payload: dict) -> str:
        return f"data: {json.dumps(payload)}\n\n"

    try:
        init_firebase()
        if not is_enabled():
            yield _emit({"type": "error", "message": "Firebase is not configured"})
            return

        tickets = list_all_stored_tickets()
        total = len(tickets)
        yield _emit({"type": "start", "total": total})

        if total == 0:
            yield _emit({"type": "done", "updated": 0, "unchanged": 0, "failed": 0, "total": 0})
            return

        updated = 0
        unchanged = 0
        failed = 0

        for index, ticket in enumerate(tickets):
            yield _emit({
                "type": "progress",
                "current": index + 1,
                "total": total,
                "hallTicket": ticket,
            })

            try:
                cached = get_cached_result(ticket)
                fresh = login_and_fetch_marks(ticket)

                if "error" in fresh:
                    failed += 1
                    yield _emit({"type": "failed", "hallTicket": ticket, "error": fresh.get("error")})
                    continue

                if cached and not data_differ(cached["data"], fresh):
                    unchanged += 1
                    yield _emit({"type": "unchanged", "hallTicket": ticket})
                    continue

                save_result(ticket, fresh)
                updated += 1
                yield _emit({"type": "updated", "hallTicket": ticket, "studentName": fresh.get("studentName")})
            except Exception as exc:
                failed += 1
                logger.exception("Hard scrape failed for %s: %s", ticket, exc)
                yield _emit({"type": "failed", "hallTicket": ticket, "error": str(exc)})

        yield _emit({
            "type": "done",
            "total": total,
            "updated": updated,
            "unchanged": unchanged,
            "failed": failed,
        })
    finally:
        _hard_scrape_running = False
        _hard_scrape_lock.release()
