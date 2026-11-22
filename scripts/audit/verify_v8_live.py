#!/usr/bin/env python3
"""Quick live HTTP-200 + noindex-header check on the ten public routes (stdlib only).

Uses urllib.request with a Googlebot UA — never curl. Also prints the local
.next/BUILD_ID when present so a live check can be tied to a local build.

Second line of defence after the v8 deindex regression: a 200 response is NOT
healthy if it carries `X-Robots-Tag: noindex/nofollow`. Any such header turns
the route BAD so a bad deploy is caught even by this quick checker.

Gift: --json for machine-readable output (now includes live response headers).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_BASE_URL = "https://www.redmobilerepair.in"
GOOGLEBOT_UA = (
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
)
TIMEOUT_SECONDS = 20
ROOT = Path(__file__).resolve().parents[2]
BUILD_ID_PATH = ROOT / ".next" / "BUILD_ID"

ROUTES = (
    "/",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/services/iphone-display-repair",
    "/services/airpods-repair",
    "/quote",
    "/robots.txt",
    "/llms.txt",
    "/sitemap.xml",
)


FORBIDDEN_XROBOTS_TOKENS = ("noindex", "nofollow")


def _xrobots(headers) -> str:
    """Return the (case-insensitive) X-Robots-Tag header value, or ''."""
    if not headers:
        return ""
    try:
        for key, value in headers.items():
            if str(key).lower() == "x-robots-tag":
                return str(value)
    except Exception:  # pragma: no cover - defensive
        pass
    return ""


def fetch_status(base_url: str, path: str) -> tuple[int | None, str, str]:
    """Return (http_status, x_robots_tag, error). Never raises."""
    url = base_url.rstrip("/") + path
    request = Request(url, headers={"User-Agent": GOOGLEBOT_UA, "Accept": "*/*"})
    try:
        with urlopen(request, timeout=TIMEOUT_SECONDS) as response:  # noqa: S310
            xrobots = _xrobots(response.headers)
            response.read(1)
            return response.status, xrobots, ""
    except HTTPError as exc:
        return exc.code, _xrobots(exc.headers), f"HTTP {exc.code}"
    except (URLError, OSError, TimeoutError) as exc:
        return None, "", str(exc)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = parser.parse_args()

    statuses: dict[str, dict] = {}
    for path in ROUTES:
        status, xrobots, error = fetch_status(args.base_url, path)
        noindex = any(token in xrobots.lower() for token in FORBIDDEN_XROBOTS_TOKENS)
        statuses[path] = {
            "status": status,
            "x_robots_tag": xrobots,
            "error": error,
            "ok": status == 200 and not noindex,
            "noindex": noindex,
        }

    build_id: str | None = None
    try:
        build_id = BUILD_ID_PATH.read_text(encoding="utf-8").strip() or None
    except OSError:
        build_id = None

    all_200 = all(row["status"] == 200 for row in statuses.values())
    no_noindex = all(not row["noindex"] for row in statuses.values())
    ok = all_200 and no_noindex
    if args.json:
        print(
            json.dumps(
                {
                    "ok": ok,
                    "base_url": args.base_url,
                    "all_200": all_200,
                    "no_noindex": no_noindex,
                    "routes": statuses,
                    "build_id": build_id,
                },
                indent=2,
            )
        )
    else:
        print(f"Live verification ({args.base_url}) — " + ("PASS" if ok else "FAIL"))
        for path, row in statuses.items():
            shown = row["status"] if row["status"] is not None else row["error"]
            suffix = f"  X-Robots-Tag={row['x_robots_tag']!r}" if row["x_robots_tag"] else ""
            print(f"  [{'OK ' if row['ok'] else 'BAD'}] {path}: {shown}{suffix}")
        print(f"ALL 200: {all_200} | NO NOINDEX: {no_noindex}")
        print(f"BUILD_ID: {build_id or 'not found'}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
