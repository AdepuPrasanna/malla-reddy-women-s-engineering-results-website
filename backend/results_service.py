"""Results fetch orchestration: Firebase cache + scraper refresh for all pages."""

from __future__ import annotations

import logging
import os
import threading
import time
from typing import Any, Callable

from firebase_cache import (
    class_cache_key,
    contrast_cache_key,
    data_differ,
    get_cached_backlog,
    get_cached_class,
    get_cached_contrast,
    get_cached_credits_contrast,
    get_cached_result,
    init_firebase,
    is_enabled,
    save_class_result,
    save_contrast,
    save_credits_contrast,
    save_result,
    log_search,
    to_summary,
)
from scraper import build_backlog_report, build_credits_contrast, build_result_contrast, build_hall_ticket, fetch_class_results, login_and_fetch_marks

logger = logging.getLogger(__name__)

_refresh_in_progress: set[str] = set()
_refresh_guard = threading.Lock()


def _meta(source: str, *, cached: bool, cached_at: str | None = None, updated: bool = False, response_ms: float | None = None) -> dict:
    meta: dict[str, Any] = {"source": source, "cached": cached}
    if cached_at:
        meta["cachedAt"] = cached_at
    if updated:
        meta["updated"] = True
    if response_ms is not None:
        meta["responseMs"] = response_ms
    return meta


def _attach_meta(data: dict, meta: dict) -> dict:
    out = dict(data)
    out["_meta"] = meta
    return out


def _strip_meta(data: dict) -> tuple[dict, dict | None]:
    meta = data.get("_meta")
    clean = {k: v for k, v in data.items() if k != "_meta"}
    return clean, meta


def _with_refresh_lock(key: str) -> bool:
    with _refresh_guard:
        if key in _refresh_in_progress:
            return False
        _refresh_in_progress.add(key)
        return True


def _release_refresh_lock(key: str) -> None:
    with _refresh_guard:
        _refresh_in_progress.discard(key)


def _schedule_background(key: str, worker: Callable[[], None]) -> None:
    if not _with_refresh_lock(key):
        return

    def run() -> None:
        try:
            worker()
        finally:
            _release_refresh_lock(key)

    threading.Thread(target=run, daemon=True, name=f"refresh-{key[:24]}").start()


def _schedule_student_refresh(hall_ticket: str, cached_data: dict) -> None:
    ticket = hall_ticket.strip().upper()

    def worker() -> None:
        try:
            fresh = login_and_fetch_marks(ticket)
            if "error" in fresh:
                return
            if data_differ(cached_data, fresh):
                save_result(ticket, fresh)
                logger.info("Updated Firebase results for %s", ticket)
        except Exception as exc:
            logger.exception("Background student refresh failed for %s: %s", ticket, exc)

    _schedule_background(f"student:{ticket}", worker)


def _resolve_student_results(ticket: str, *, force_refresh: bool = False) -> dict:
    init_firebase()
    if is_enabled() and ticket:
        log_search(ticket)

    if force_refresh or not is_enabled():
        scraped = login_and_fetch_marks(ticket)
        if "error" in scraped:
            return scraped
        if is_enabled():
            save_result(ticket, scraped)
        source = "scraped" if not is_enabled() else "scraped_and_cached"
        return _attach_meta(scraped, _meta(source, cached=False))

    cached = get_cached_result(ticket)
    if not cached:
        scraped = login_and_fetch_marks(ticket)
        if "error" in scraped:
            return scraped
        save_result(ticket, scraped)
        return _attach_meta(scraped, _meta("scraped_and_cached", cached=False))

    data = dict(cached["data"])
    sync_refresh = os.environ.get("FIREBASE_SYNC_REFRESH", "false").lower() == "true"

    if sync_refresh:
        scraped = login_and_fetch_marks(ticket)
        if "error" in scraped:
            return _attach_meta(data, _meta("firebase", cached=True, cached_at=cached.get("updatedAt")))
        if data_differ(data, scraped):
            save_result(ticket, scraped)
            return _attach_meta(scraped, _meta("scraped_and_updated", cached=False, updated=True))
        return _attach_meta(data, _meta("firebase", cached=True, cached_at=cached.get("updatedAt")))

    _schedule_student_refresh(ticket, data)
    return _attach_meta(data, _meta("firebase", cached=True, cached_at=cached.get("updatedAt")))


def get_student_results(hall_ticket: str, *, force_refresh: bool = False) -> dict:
    """Academic Results + Credits Analyzer — instant Firebase read on cache hit."""
    started = time.perf_counter()
    result = _resolve_student_results(hall_ticket.strip().upper(), force_refresh=force_refresh)
    if result.get("_meta", {}).get("cached"):
        result["_meta"]["responseMs"] = round((time.perf_counter() - started) * 1000, 1)
    return result


def get_backlog_report(hall_ticket: str, *, force_refresh: bool = False) -> dict:
    """Backlog Report — instant read from mrecw_backlog_reports when cached."""
    started = time.perf_counter()
    ticket = hall_ticket.strip().upper()
    init_firebase()

    if not force_refresh and is_enabled():
        cached_backlog = get_cached_backlog(ticket)
        if cached_backlog:
            data = dict(cached_backlog["data"])
            cached_result = get_cached_result(ticket)
            if cached_result:
                _schedule_student_refresh(ticket, cached_result["data"])
            elapsed = round((time.perf_counter() - started) * 1000, 1)
            return _attach_meta(
                data,
                _meta("firebase", cached=True, cached_at=cached_backlog.get("updatedAt"), response_ms=elapsed),
            )

    data = _resolve_student_results(ticket, force_refresh=force_refresh)
    if "error" in data:
        return data
    meta = data.pop("_meta", None)
    report = build_backlog_report(data)
    if meta:
        report["_meta"] = meta
    return report


def _contrast_from_cached_students(a: str, b: str) -> dict | None:
    cached_a = get_cached_result(a)
    cached_b = get_cached_result(b)
    if not cached_a or not cached_b:
        return None
    contrast = build_result_contrast(cached_a["data"], cached_b["data"])
    _schedule_student_refresh(a, cached_a["data"])
    _schedule_student_refresh(b, cached_b["data"])
    return contrast


def get_result_contrast(ticket_a: str, ticket_b: str, *, force_refresh: bool = False) -> dict:
    """Result Compare — instant read from contrast cache or two cached student records."""
    started = time.perf_counter()
    a = ticket_a.strip().upper()
    b = ticket_b.strip().upper()
    key = contrast_cache_key(a, b)
    init_firebase()

    if not force_refresh and is_enabled():
        cached = get_cached_contrast(key)
        if cached:
            data = dict(cached["data"])
            has_full = (
                isinstance(data.get("first"), dict)
                and isinstance(data.get("second"), dict)
                and data["first"].get("subjects")
                and data["second"].get("subjects")
            )
            if not has_full:
                rebuilt = _contrast_from_cached_students(a, b)
                if rebuilt:
                    save_contrast(key, rebuilt)
                    elapsed = round((time.perf_counter() - started) * 1000, 1)
                    rebuilt["_meta"] = {
                        "source": "firebase",
                        "cached": True,
                        "responseMs": elapsed,
                    }
                    return rebuilt
            for ticket in (a, b):
                row = get_cached_result(ticket)
                if row:
                    _schedule_student_refresh(ticket, row["data"])
            elapsed = round((time.perf_counter() - started) * 1000, 1)
            return _attach_meta(
                data,
                _meta("firebase", cached=True, cached_at=cached.get("updatedAt"), response_ms=elapsed),
            )

        built = _contrast_from_cached_students(a, b)
        if built:
            save_contrast(key, built)
            elapsed = round((time.perf_counter() - started) * 1000, 1)
            built["_meta"] = {
                "source": "firebase",
                "cached": True,
                "responseMs": elapsed,
            }
            return built

    data_a = _resolve_student_results(a, force_refresh=force_refresh)
    if "error" in data_a:
        return data_a

    data_b = _resolve_student_results(b, force_refresh=force_refresh)
    if "error" in data_b:
        return data_b

    clean_a, meta_a = _strip_meta(data_a)
    clean_b, meta_b = _strip_meta(data_b)
    contrast = build_result_contrast(clean_a, clean_b)
    contrast["_meta"] = {
        "source": "firebase" if (meta_a or {}).get("cached") and (meta_b or {}).get("cached") else "mixed",
        "cached": bool((meta_a or {}).get("cached") and (meta_b or {}).get("cached")),
        "cachedAtA": (meta_a or {}).get("cachedAt"),
        "cachedAtB": (meta_b or {}).get("cachedAt"),
    }

    if is_enabled():
        save_contrast(key, {k: v for k, v in contrast.items() if k != "_meta"})

    return contrast


def _credits_contrast_from_cached_students(a: str, b: str) -> dict | None:
    cached_a = get_cached_result(a)
    cached_b = get_cached_result(b)
    if not cached_a or not cached_b:
        return None
    contrast = build_credits_contrast(cached_a["data"], cached_b["data"])
    _schedule_student_refresh(a, cached_a["data"])
    _schedule_student_refresh(b, cached_b["data"])
    return contrast


def get_credits_compare(ticket_a: str, ticket_b: str, *, force_refresh: bool = False) -> dict:
    """Credits Compare — side-by-side credit analysis for two students."""
    started = time.perf_counter()
    a = ticket_a.strip().upper()
    b = ticket_b.strip().upper()
    key = contrast_cache_key(a, b)
    init_firebase()

    if not force_refresh and is_enabled():
        cached = get_cached_credits_contrast(key)
        if cached:
            data = dict(cached["data"])
            for ticket in (a, b):
                row = get_cached_result(ticket)
                if row:
                    _schedule_student_refresh(ticket, row["data"])
            elapsed = round((time.perf_counter() - started) * 1000, 1)
            return _attach_meta(
                data,
                _meta("firebase", cached=True, cached_at=cached.get("updatedAt"), response_ms=elapsed),
            )

        built = _credits_contrast_from_cached_students(a, b)
        if built:
            save_credits_contrast(key, built)
            elapsed = round((time.perf_counter() - started) * 1000, 1)
            built["_meta"] = {
                "source": "firebase",
                "cached": True,
                "responseMs": elapsed,
            }
            return built

    data_a = _resolve_student_results(a, force_refresh=force_refresh)
    if "error" in data_a:
        return data_a

    data_b = _resolve_student_results(b, force_refresh=force_refresh)
    if "error" in data_b:
        return data_b

    clean_a, meta_a = _strip_meta(data_a)
    clean_b, meta_b = _strip_meta(data_b)
    contrast = build_credits_contrast(clean_a, clean_b)
    contrast["_meta"] = {
        "source": "firebase" if (meta_a or {}).get("cached") and (meta_b or {}).get("cached") else "mixed",
        "cached": bool((meta_a or {}).get("cached") and (meta_b or {}).get("cached")),
        "cachedAtA": (meta_a or {}).get("cachedAt"),
        "cachedAtB": (meta_b or {}).get("cachedAt"),
    }

    if is_enabled():
        save_credits_contrast(key, {k: v for k, v in contrast.items() if k != "_meta"})

    return contrast


def finalize_class_result(students: list, failed: list, prefix: str, start_roll: int, end_roll: int, roll_digits: int) -> dict:
    students = sorted(students, key=lambda row: float(row.get("cgpa") or 0), reverse=True)
    cgpa_values = [float(s["cgpa"]) for s in students if s.get("cgpa")]
    class_avg = round(sum(cgpa_values) / len(cgpa_values), 2) if cgpa_values else None
    total = end_roll - start_roll + 1
    return {
        "prefix": prefix,
        "startRoll": start_roll,
        "endRoll": end_roll,
        "rollDigits": roll_digits,
        "totalAttempted": total,
        "successCount": len(students),
        "failedCount": len(failed),
        "classAverageCgpa": class_avg,
        "students": students,
        "failed": failed,
    }


def schedule_class_refresh(prefix: str, start_roll: int, end_roll: int, roll_digits: int, delay_sec: float) -> None:
    key = class_cache_key(prefix, start_roll, end_roll, roll_digits)

    def worker() -> None:
        try:
            fresh = fetch_class_results(prefix, start_roll, end_roll, roll_digits, delay_sec, summary_only=True)
            for student in fresh.get("students") or []:
                ticket = (student.get("hallTicket") or "").upper()
                if ticket:
                    save_result(ticket, student)
            save_class_result(key, fresh)
            logger.info("Background class refresh saved for %s", key)
        except Exception as exc:
            logger.exception("Background class refresh failed for %s: %s", key, exc)

    _schedule_background(f"class:{key}", worker)


def get_class_results(
    prefix: str,
    start_roll: int,
    end_roll: int,
    roll_digits: int = 2,
    delay_sec: float = 1.5,
    *,
    force_refresh: bool = False,
) -> dict:
    """Class Results — instant Firebase read when section cache exists."""
    started = time.perf_counter()
    prefix = prefix.strip().upper()
    key = class_cache_key(prefix, start_roll, end_roll, roll_digits)
    init_firebase()

    if not force_refresh and is_enabled():
        cached = get_cached_class(key)
        if cached:
            data = dict(cached["data"])
            schedule_class_refresh(prefix, start_roll, end_roll, roll_digits, delay_sec)
            elapsed = round((time.perf_counter() - started) * 1000, 1)
            return _attach_meta(
                data,
                _meta("firebase", cached=True, cached_at=cached.get("updatedAt"), response_ms=elapsed),
            )

        assembled = build_class_from_cache(prefix, start_roll, end_roll, roll_digits)
        if assembled:
            save_class_result(key, assembled)
            schedule_class_refresh(prefix, start_roll, end_roll, roll_digits, delay_sec)
            elapsed = round((time.perf_counter() - started) * 1000, 1)
            return _attach_meta(
                assembled,
                _meta("firebase", cached=True, response_ms=elapsed),
            )

    scraped = fetch_class_results(prefix, start_roll, end_roll, roll_digits, delay_sec, summary_only=True)
    if is_enabled():
        for student in scraped.get("students") or []:
            ticket = (student.get("hallTicket") or "").upper()
            if ticket:
                save_result(ticket, student)
        save_class_result(key, scraped)

    return _attach_meta(scraped, _meta("scraped_and_cached" if is_enabled() else "scraped", cached=False))


def resolve_class_student(ticket: str, *, force_refresh: bool = False) -> dict:
    """Resolve one class row from Firebase or scrape."""
    ticket = ticket.strip().upper()
    init_firebase()

    if not force_refresh and is_enabled():
        cached = get_cached_result(ticket)
        if cached:
            _schedule_student_refresh(ticket, cached["data"])
            return to_summary(cached["data"])

    scraped = login_and_fetch_marks(ticket)
    if "error" in scraped:
        return scraped

    summary = to_summary(scraped)
    if is_enabled():
        save_result(ticket, scraped)
    return summary


def build_class_from_cache(prefix: str, start_roll: int, end_roll: int, roll_digits: int) -> dict | None:
    """Build class result entirely from cached student documents when all exist."""
    if not is_enabled():
        return None

    students = []
    failed = []
    tickets = [build_hall_ticket(prefix, roll, roll_digits) for roll in range(start_roll, end_roll + 1)]

    for ticket in tickets:
        cached = get_cached_result(ticket)
        if cached and "error" not in cached.get("data", {}):
            students.append(to_summary(cached["data"]))
        else:
            return None

    return finalize_class_result(students, failed, prefix, start_roll, end_roll, roll_digits)
