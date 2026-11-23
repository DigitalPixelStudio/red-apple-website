#!/usr/bin/env python3
"""LIVE v13 SSR verification (stdlib urllib, Googlebot UA — never curl).

Fetches the ten public routes and asserts, against the CURRENTLY DEPLOYED site:

  (1) every route returns HTTP 200;
  (2) homepage SSR contains '4.9/5' and NOT '1.3/5';
  (3) zero banned legacy strings on any HTML route:
      '90-day', 'No. 1, Mahatma Gandhi Rd', '10:30 AM',
      'Authorised Service Centre', 'orange-glass';
  (4) no 'noindex'/'nofollow' in an X-Robots-Tag header on any route, and no
      <meta name=robots> with noindex/nofollow on any HTML route;
  (5) exactly one <title> per HTML route with exactly one '|' pipe.

Stdlib only. Defaults to https://www.redmobilerepair.in. Supports --json and
--base-url for staging/preview verification.

Gift: --json includes per-route status, response headers, matched pipe counts and
a compact violations list — machine-readable for CI and for Faisu's audit trail.

Emergency maintenance: --skip-noindex bypasses ONLY check (4), the live
noindex/nofollow assertion. The HTTP-200, rating, banned-string and title-pipe
(SSR/strike) checks remain BLOCKING. Predeploy drives this via
ALLOW_NOINDEX_MAINTENANCE=1; default behaviour is unchanged.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_BASE_URL = "https://www.redmobilerepair.in"
GOOGLEBOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
TIMEOUT_SECONDS = 20

HTML_ROUTES = (
    "/",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/services/ipad-repair",
    "/services/iphone-display-repair",
    "/quote",
)
TEXT_ROUTES = ("/robots.txt", "/llms.txt", "/sitemap.xml")
ALL_ROUTES = HTML_ROUTES + TEXT_ROUTES

BANNED_STRINGS = (
    "90-day",
    "No. 1, Mahatma Gandhi Rd",
    "10:30 AM",
    "Authorised Service Centre",
    "orange-glass",
)
FORBIDDEN_XROBOTS_TOKENS = ("noindex", "nofollow")
REQUIRED_RATING = "4.9/5"
FORBIDDEN_RATING = "1.3/5"

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)
META_TAG_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE)
META_NAME_RE = re.compile(r"\bname\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)
META_CONTENT_RE = re.compile(r"\bcontent\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)


def fetch(base_url: str, path: str) -> tuple[int | None, str, dict[str, str], str | None]:
    """Return (status, decoded_body, lower-cased headers, error). Never raises."""
    url = base_url.rstrip("/") + path
    req = Request(url, headers={"User-Agent": GOOGLEBOT_UA, "Accept": "text/html,text/plain,*/*"})
    try:
        with urlopen(req, timeout=TIMEOUT_SECONDS) as resp:  # noqa: S310
            body = resp.read().decode("utf-8", errors="replace")
            headers = {str(k).lower(): str(v) for k, v in resp.headers.items()}
            return resp.status, body, headers, None
    except HTTPError as exc:
        try:
            body = exc.read().decode("utf-8", errors="replace")
        except Exception:  # pragma: no cover - defensive
            body = ""
        headers = {str(k).lower(): str(v) for k, v in exc.headers.items()}
        return exc.code, body, headers, f"HTTP {exc.code}"
    except (URLError, OSError, TimeoutError) as exc:
        return None, "", {}, str(exc)


def meta_robots_contents(html: str) -> list[str]:
    out: list[str] = []
    for tag in META_TAG_RE.findall(html):
        name = META_NAME_RE.search(tag)
        if not name or name.group(1).strip().lower() != "robots":
            continue
        content = META_CONTENT_RE.search(tag)
        out.append(content.group(1) if content else "")
    return out


def snippet(text: str, needle: str, width: int = 60) -> str:
    idx = text.lower().find(needle.lower())
    if idx < 0:
        return ""
    start, end = max(0, idx - width // 2), min(len(text), idx + len(needle) + width // 2)
    return re.sub(r"\s+", " ", text[start:end]).strip()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    ap.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    ap.add_argument(
        "--skip-noindex",
        action="store_true",
        help="EMERGENCY ONLY: bypass the noindex assertion (4); HTTP-200/SSR/strike checks stay blocking",
    )
    args = ap.parse_args()

    pages: dict[str, dict] = {}
    for path in ALL_ROUTES:
        status, body, headers, error = fetch(args.base_url, path)
        pages[path] = {"status": status, "body": body, "headers": headers, "error": error}

    checks: list[dict] = []

    def add(cid: str, ok: bool, detail: str) -> None:
        checks.append({"id": cid, "ok": bool(ok), "detail": detail})

    # (1) all routes 200
    bad_status = [
        f"{p}: {pages[p]['status'] if pages[p]['status'] is not None else pages[p]['error']}"
        for p in ALL_ROUTES
        if pages[p]["status"] != 200
    ]
    add(
        "1_all_routes_200",
        not bad_status,
        f"all {len(ALL_ROUTES)} routes 200"
        if not bad_status
        else "non-200: " + ", ".join(bad_status),
    )

    # (2) rating parity on the homepage
    home = pages["/"]["body"]
    has_good = REQUIRED_RATING in home
    has_bad = FORBIDDEN_RATING in home
    add(
        "2_rating_parity",
        has_good and not has_bad,
        f"'{REQUIRED_RATING}' present={has_good}, '{FORBIDDEN_RATING}' present={has_bad}",
    )

    # (3) banned legacy strings across all HTML routes
    banned_hits: list[str] = []
    for path in HTML_ROUTES:
        body = pages[path]["body"]
        for needle in BANNED_STRINGS:
            if needle.lower() in body.lower():
                banned_hits.append(f"{path}: {needle!r} -> ...{snippet(body, needle)}...")
    add(
        "3_no_banned_strings",
        not banned_hits,
        "no banned legacy strings on any HTML route"
        if not banned_hits
        else f"{len(banned_hits)} hit(s): " + " | ".join(banned_hits),
    )

    # (4) no noindex anywhere (response headers + SSR meta robots)
    # EMERGENCY OVERRIDE: --skip-noindex bypasses ONLY this noindex check.
    if args.skip_noindex:
        add(
            "4_no_noindex",
            True,
            "SKIPPED via --skip-noindex (ALLOW_NOINDEX_MAINTENANCE=1) — "
            "noindex assertions bypassed; HTTP-200/SSR/strike checks still blocking",
        )
    else:
        noindex_hits: list[str] = []
        for path in ALL_ROUTES:
            xrobots = pages[path]["headers"].get("x-robots-tag", "")
            if any(tok in xrobots.lower() for tok in FORBIDDEN_XROBOTS_TOKENS):
                noindex_hits.append(f"{path}: X-Robots-Tag={xrobots!r}")
        for path in HTML_ROUTES:
            contents = meta_robots_contents(pages[path]["body"])
            if any(
                any(tok in c.lower() for tok in FORBIDDEN_XROBOTS_TOKENS) for c in contents
            ):
                noindex_hits.append(f"{path}: meta robots={contents!r}")
        add(
            "4_no_noindex",
            not noindex_hits,
            "no noindex/nofollow header or meta robots on any route"
            if not noindex_hits
            else "NOINDEX EXPOSURE: " + " | ".join(noindex_hits),
        )

    # (5) exactly one <title> with exactly one pipe on every HTML route
    title_hits: list[str] = []
    title_pipes: dict[str, int] = {}
    for path in HTML_ROUTES:
        titles = TITLE_RE.findall(pages[path]["body"])
        if len(titles) != 1:
            title_hits.append(f"{path}: {len(titles)} <title> tags (expected 1)")
            title_pipes[path] = -1
            continue
        title = re.sub(r"\s+", " ", titles[0]).strip()
        pipes = title.count("|")
        title_pipes[path] = pipes
        if pipes != 1:
            title_hits.append(f"{path}: {pipes} pipe(s) in title {title!r} (expected 1)")
        brand_count = title.lower().count("red apple")
        if brand_count > 1:
            title_hits.append(f"{path}: brand repeated {brand_count}x in title {title!r}")
    add(
        "5_one_title_one_pipe",
        not title_hits,
        "exactly one <title> with one pipe per HTML route"
        if not title_hits
        else "title problems: " + " | ".join(title_hits),
    )

    violations = [c["detail"] for c in checks if not c["ok"]]
    ok = not violations
    result = {
        "ok": ok,
        "base_url": args.base_url,
        "user_agent": GOOGLEBOT_UA,
        "noindex_skipped": bool(args.skip_noindex),
        "routes_checked": list(ALL_ROUTES),
        "statuses": {p: pages[p]["status"] for p in ALL_ROUTES},
        "response_headers": {p: pages[p]["headers"] for p in ALL_ROUTES},
        "title_pipes": title_pipes,
        "checks": checks,
        "violations": violations,
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"verify_v13_ssr ({args.base_url}) — " + ("PASS" if ok else "FAIL"))
        for c in checks:
            print(f"  [{'OK ' if c['ok'] else 'BAD'}] {c['id']}: {c['detail']}")
        for p in ALL_ROUTES:
            print(f"        {p}: {pages[p]['status'] if pages[p]['status'] is not None else pages[p]['error']}")
        if violations:
            print("\nVIOLATIONS:")
            for v in violations:
                print(f"  - {v}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
