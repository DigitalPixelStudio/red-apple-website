#!/usr/bin/env python3
"""SITE HEALTH MONITOR — one command to prove the site is alive & strike-free.

A non-destructive, stdlib-only monitor for redmobilerepair.in. It fetches the
ten key routes with a Googlebot UA (urllib only — NEVER curl) and checks:

  * every route returns HTTP 200;
  * no X-Robots-Tag / <meta name=robots> exposes noindex or nofollow;
  * the homepage serves '4.9/5' and NOT the stale '1.3/5';
  * zero banned legacy strings on any route
    ('90-day', 'No. 1, Mahatma Gandhi Rd', '10:30 AM',
     'Authorised Service Centre', 'orange-glass').

It prints a clean PASS/FAIL table, or machine-readable JSON with --json, or a
single cron-friendly line with --quiet. It makes ZERO writes, sends NO pings,
and NEVER prints secrets (URLs are printed with any userinfo stripped).

Usage
-----
    python3 scripts/health-monitor.py
    python3 scripts/health-monitor.py --json
    python3 scripts/health-monitor.py --quiet            # cron: one line
    python3 scripts/health-monitor.py --retries 2 --timeout 15
    python3 scripts/health-monitor.py --base-url http://localhost:3000

Exit codes
----------
    0  healthy — all routes 200, zero violations (site alive & strike-free)
    1  unhealthy — one or more checks failed (SEO/rating/rating-strike regression)
    2  configuration error (invalid --base-url or --retries/--timeout) — no network
    3  total outage — not a single route returned HTTP 200 (site/network down)

NOINDEX MAINTENANCE: this monitor is a HEALTH check, not a deploy gate. To run
it against a preview deployment that intentionally serves noindex, point it at
that URL with --base-url; the canonical production default is strike-free.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

DEFAULT_BASE_URL = "https://www.redmobilerepair.in"
GOOGLEBOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
DEFAULT_TIMEOUT = 20
DEFAULT_RETRIES = 1  # one automatic retry on transient transport/5xx errors
RETRY_BACKOFF_SECONDS = 0.3

HTML_ROUTES = (
    "/",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/quote",
    "/services/iphone-display-repair",
)
TEXT_ROUTES = ("/robots.txt", "/llms.txt", "/sitemap.xml")
API_ROUTES = ("/api/health",)
ALL_ROUTES = HTML_ROUTES + TEXT_ROUTES + API_ROUTES

BANNED_STRINGS = (
    "90-day",
    "No. 1, Mahatma Gandhi Rd",
    "10:30 AM",
    "Authorised Service Centre",
    "orange-glass",
)
FORBIDDEN_ROBOTS_TOKENS = ("noindex", "nofollow")
REQUIRED_RATING = "4.9/5"
FORBIDDEN_RATING = "1.3/5"

META_TAG_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE)
META_NAME_RE = re.compile(r"\bname\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)
META_CONTENT_RE = re.compile(r"\bcontent\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)


def safe_url(url: str) -> str:
    """Printable form of a URL with any embedded userinfo removed."""
    try:
        parsed = urlparse(url)
    except ValueError:
        return "<invalid-url>"
    host = parsed.hostname or ""
    if host and parsed.port:
        host = f"{host}:{parsed.port}"
    if not host:
        return "<invalid-url>"
    return f"{parsed.scheme}://{host}{parsed.path}"


def validate_base_url(url: str) -> str | None:
    try:
        parsed = urlparse(url)
    except ValueError:
        return "malformed URL"
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        return "expected an http(s) URL with a host"
    return None


def meta_robots_contents(html: str) -> list[str]:
    contents: list[str] = []
    for tag in META_TAG_RE.findall(html):
        name = META_NAME_RE.search(tag)
        if not name or name.group(1).strip().lower() != "robots":
            continue
        content = META_CONTENT_RE.search(tag)
        contents.append(content.group(1) if content else "")
    return contents


def fetch(base_url: str, path: str, timeout: int, retries: int) -> dict:
    """Fetch one route. Returns status/body/headers/error/attempts. Never raises.

    Retries ONLY transient failures: transport errors, timeouts, HTTP 429 and
    5xx. Definitive 4xx responses are returned immediately (no pointless wait).
    """
    url = base_url.rstrip("/") + path
    request = Request(
        url,
        headers={"User-Agent": GOOGLEBOT_UA, "Accept": "text/html,text/plain,application/json,*/*"},
    )
    attempts = max(1, retries + 1)
    last: dict = {"status": None, "body": "", "headers": {}, "error": None, "attempts": 0}
    for attempt in range(1, attempts + 1):
        if attempt > 1:
            time.sleep(RETRY_BACKOFF_SECONDS * (attempt - 1))
        try:
            with urlopen(request, timeout=timeout) as response:  # noqa: S310
                body = response.read().decode("utf-8", errors="replace")
                headers = {str(k).lower(): str(v) for k, v in response.headers.items()}
                return {"status": response.status, "body": body, "headers": headers,
                        "error": None, "attempts": attempt}
        except HTTPError as exc:
            try:
                body = exc.read().decode("utf-8", errors="replace")
            except Exception:  # pragma: no cover - defensive
                body = ""
            headers = {str(k).lower(): str(v) for k, v in exc.headers.items()}
            last = {"status": exc.code, "body": body, "headers": headers,
                    "error": f"HTTP {exc.code}", "attempts": attempt}
            if exc.code == 429 or 500 <= exc.code <= 599:
                continue
            return last
        except (URLError, OSError, TimeoutError) as exc:
            last = {"status": None, "body": "", "headers": {},
                    "error": str(exc), "attempts": attempt}
    return last


def snippet(text: str, needle: str, width: int = 80) -> str:
    index = text.lower().find(needle.lower())
    if index < 0:
        return ""
    start, end = max(0, index - width // 2), min(len(text), index + len(needle) + width // 2)
    return re.sub(r"\s+", " ", text[start:end]).strip()


def run_checks(base_url: str, timeout: int, retries: int) -> dict:
    started = time.time()
    pages: dict[str, dict] = {}
    violations: list[dict] = []

    def add(check: str, route: str, detail: str) -> None:
        violations.append({"check": check, "route": route, "detail": detail[:400]})

    for path in ALL_ROUTES:
        pages[path] = fetch(base_url, path, timeout, retries)

    # 1. HTTP 200 on every route.
    for path in ALL_ROUTES:
        status = pages[path]["status"]
        if status != 200:
            add("http_200", path,
                f"status={status if status is not None else 'unreachable'} "
                f"error={pages[path]['error']!r} attempts={pages[path]['attempts']}")

    # 2. No noindex/nofollow in response headers (all routes) or meta robots (HTML).
    for path in ALL_ROUTES:
        xrobots = pages[path]["headers"].get("x-robots-tag", "")
        if any(token in xrobots.lower() for token in FORBIDDEN_ROBOTS_TOKENS):
            add("noindex_header", path, f"X-Robots-Tag={xrobots!r}")
    for path in HTML_ROUTES:
        for content in meta_robots_contents(pages[path]["body"]):
            if any(token in content.lower() for token in FORBIDDEN_ROBOTS_TOKENS):
                add("noindex_meta", path, f"meta robots={content!r}")

    # 3. Rating parity: canonical 4.9/5 present on home; stale 1.3/5 nowhere.
    home = pages["/"]["body"]
    if REQUIRED_RATING not in home:
        add("rating_missing", "/", f"'{REQUIRED_RATING}' absent from homepage SSR")
    for path in HTML_ROUTES:
        if FORBIDDEN_RATING in pages[path]["body"]:
            add("stale_rating", path,
                f"'{FORBIDDEN_RATING}' present -> ...{snippet(pages[path]['body'], FORBIDDEN_RATING)}...")

    # 4. Zero banned legacy strings on every route body.
    for path in ALL_ROUTES:
        body = pages[path]["body"]
        for needle in BANNED_STRINGS:
            if needle.lower() in body.lower():
                add("banned_string", path,
                    f"{needle!r} -> ...{snippet(body, needle)}...")

    bad_routes = {v["route"] for v in violations}
    route_table = [
        {
            "route": path,
            "status": pages[path]["status"],
            "attempts": pages[path]["attempts"],
            "result": "FAIL" if path in bad_routes else "OK",
        }
        for path in ALL_ROUTES
    ]

    def check(cid: str, ok: bool, detail: str) -> dict:
        return {"id": cid, "ok": bool(ok), "detail": detail}

    checks = [
        check("http_200_all_routes",
              all(pages[p]["status"] == 200 for p in ALL_ROUTES),
              f"{sum(1 for p in ALL_ROUTES if pages[p]['status'] == 200)}/{len(ALL_ROUTES)} routes returned 200"),
        check("no_noindex",
              not [v for v in violations if v["check"].startswith("noindex")],
              "no noindex/nofollow header or meta robots on any route"),
        check("rating_parity",
              REQUIRED_RATING in home and not any(
                  FORBIDDEN_RATING in pages[p]["body"] for p in HTML_ROUTES),
              f"'{REQUIRED_RATING}' present, '{FORBIDDEN_RATING}' absent on HTML routes"),
        check("no_banned_strings",
              not [v for v in violations if v["check"] == "banned_string"],
              "zero banned legacy strings on all routes"),
    ]

    ok = not violations
    total_outage = all(pages[p]["status"] is None for p in ALL_ROUTES)
    exit_code = 0 if ok else (3 if total_outage else 1)
    return {
        "script": "health-monitor.py",
        "ok": ok,
        "verdict": "PASS" if ok else ("OUTAGE" if total_outage else "FAIL"),
        "exit_code": exit_code,
        "base_url": base_url,
        "display_url": safe_url(base_url),
        "user_agent": GOOGLEBOT_UA,
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "duration_seconds": round(time.time() - started, 3),
        "routes_checked": list(ALL_ROUTES),
        "routes": {p: {"status": pages[p]["status"], "attempts": pages[p]["attempts"],
                       "error": pages[p]["error"]} for p in ALL_ROUTES},
        "route_table": route_table,
        "checks": checks,
        "violations": violations,
        "retry_policy": f"retries={retries} (transport/429/5xx only), timeout={timeout}s",
    }


def print_table(result: dict) -> None:
    print(f"SITE HEALTH — {result['display_url']} — {result['verdict']}")
    print(f"Googlebot UA · {len(result['routes_checked'])} routes · "
          f"{len(result['violations'])} violation(s) · {result['duration_seconds']}s · "
          f"{result['checked_at']}")
    print()
    print(f"{'ROUTE':<40} {'STATUS':<8} RESULT")
    print("-" * 62)
    for row in result["route_table"]:
        status = row["status"] if row["status"] is not None else "DOWN"
        print(f"{row['route']:<40} {str(status):<8} {row['result']}")
    if result["violations"]:
        print()
        print("VIOLATIONS:")
        for v in result["violations"]:
            print(f"  [{v['check']}] {v['route']}: {v['detail']}")
    else:
        print()
        print("OK: site is alive & strike-free — no violations.")


def print_quiet(result: dict) -> None:
    if result["ok"]:
        n = len(result["routes_checked"])
        print(f"HEALTH OK — {n}/{n} routes 200, 0 violations [{result['display_url']}]")
    else:
        summary = "; ".join(f"{v['check']}@{v['route']}" for v in result["violations"][:5])
        print(f"HEALTH {result['verdict']} — {len(result['violations'])} violation(s): {summary} "
              f"[{result['display_url']}]")


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    ap.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT,
                    help=f"per-request timeout in seconds (default {DEFAULT_TIMEOUT})")
    ap.add_argument("--retries", type=int, default=DEFAULT_RETRIES,
                    help=f"retries on transient transport/429/5xx failures (default {DEFAULT_RETRIES})")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--json", dest="as_json", action="store_true",
                      help="emit machine-readable JSON")
    mode.add_argument("--quiet", action="store_true",
                      help="cron mode: print one summary line only")
    args = ap.parse_args(argv)

    errors: list[str] = []
    url_error = validate_base_url(args.base_url)
    if url_error:
        errors.append(f"invalid --base-url: {url_error}")
    if args.timeout < 1:
        errors.append("--timeout must be >= 1")
    if args.retries < 0:
        errors.append("--retries must be >= 0")
    if errors:
        print("HEALTH CONFIG ERROR: " + "; ".join(errors), file=sys.stderr)
        return 2

    result = run_checks(args.base_url, args.timeout, args.retries)
    if args.as_json:
        print(json.dumps(result, indent=2, sort_keys=True))
    elif args.quiet:
        print_quiet(result)
    else:
        print_table(result)
    return result["exit_code"]


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
