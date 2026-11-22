#!/usr/bin/env python3
"""Quick live HTTP-200 check on the ten public routes (stdlib only).

Uses urllib.request with a Googlebot UA — never curl. Also prints the local
.next/BUILD_ID when present so a live check can be tied to a local build.
Gift: --json for machine-readable output.
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


def fetch_status(base_url: str, path: str) -> tuple[int | None, str]:
    """Return (http_status, error). Never raises."""
    url = base_url.rstrip("/") + path
    request = Request(url, headers={"User-Agent": GOOGLEBOT_UA, "Accept": "*/*"})
    try:
        with urlopen(request, timeout=TIMEOUT_SECONDS) as response:  # noqa: S310
            response.read(1)
            return response.status, ""
    except HTTPError as exc:
        return exc.code, f"HTTP {exc.code}"
    except (URLError, OSError, TimeoutError) as exc:
        return None, str(exc)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = parser.parse_args()

    statuses: dict[str, dict] = {}
    for path in ROUTES:
        status, error = fetch_status(args.base_url, path)
        statuses[path] = {"status": status, "error": error, "ok": status == 200}

    build_id: str | None = None
    try:
        build_id = BUILD_ID_PATH.read_text(encoding="utf-8").strip() or None
    except OSError:
        build_id = None

    ok = all(row["ok"] for row in statuses.values())
    if args.json:
        print(
            json.dumps(
                {"ok": ok, "base_url": args.base_url, "routes": statuses, "build_id": build_id},
                indent=2,
            )
        )
    else:
        print(f"Live verification ({args.base_url}) — " + ("PASS" if ok else "FAIL"))
        for path, row in statuses.items():
            shown = row["status"] if row["status"] is not None else row["error"]
            print(f"  [{'OK ' if row['ok'] else 'BAD'}] {path}: {shown}")
        print(f"BUILD_ID: {build_id or 'not found'}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
