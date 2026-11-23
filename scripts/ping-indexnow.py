#!/usr/bin/env python3
"""Ping IndexNow for the canonical Red Apple Mobile Repair routes.

Instant Bing / ChatGPT / Copilot indexing nudge for deploys. stdlib only.

Safety contract
---------------
* DRY-RUN by default: nothing is sent unless --commit is passed.
* The IndexNow key is read from public/indexnow-key.txt and NEVER printed or
  logged (human output shows only key presence + length; --json redacts it).
* Graceful timeout + error handling; no stack traces leak the key.
* Exit 0 on dry-run, HTTP 200 or 202. Non-zero on transport error or a
  non-success HTTP status so CI/deploy hooks can notice.

Usage
-----
    python3 scripts/ping-indexnow.py                 # preview payload, send nothing
    python3 scripts/ping-indexnow.py --json          # machine-readable preview
    python3 scripts/ping-indexnow.py --commit        # actually POST to IndexNow
    python3 scripts/ping-indexnow.py --commit --json # POST + JSON result
    python3 scripts/ping-indexnow.py --timeout 15 --commit
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

# ---- Fixed configuration (host + canonical routes are authoritative) --------
HOST = "www.redmobilerepair.in"
BASE_URL = "https://" + HOST
KEY_FILE_REL = Path("public") / "indexnow-key.txt"
KEY_LOCATION = BASE_URL + "/" + KEY_FILE_REL.name  # public URL of the key file
ENDPOINT = "https://api.indexnow.org/indexnow"
ROUTES = (
    "/",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/services/iphone-display-repair",
    "/quote",
    "/sitemap.xml",
)
SUCCESS_STATUSES = {200, 202}
DEFAULT_TIMEOUT = 10  # seconds

_HEX_KEY = re.compile(r"^[0-9a-fA-F]{8,128}$")


class PingError(Exception):
    """A user-facing failure with a safe (key-free) message."""


def repo_root() -> Path:
    # scripts/ping-indexnow.py -> parent.parent is the repo root.
    return Path(__file__).resolve().parent.parent


def read_key(path: Path) -> str:
    try:
        raw = path.read_bytes()
    except OSError as exc:
        raise PingError(f"cannot read key file at {KEY_FILE_REL.as_posix()} ({exc.strerror or 'I/O error'})") from None
    key = raw.decode("utf-8", errors="strict").strip()
    if not _HEX_KEY.match(key):
        # Report only structural facts; never echo the value.
        raise PingError(
            f"key file is not a valid IndexNow key (expected 8-128 hex chars, got length {len(key)})"
        )
    return key


def build_payload(key: str) -> dict[str, Any]:
    return {
        "host": HOST,
        "key": key,
        "keyLocation": KEY_LOCATION,
        "urlList": [BASE_URL + route for route in ROUTES],
    }


def redacted_view(payload: dict[str, Any]) -> dict[str, Any]:
    """Copy of the payload safe to print: key value replaced by metadata."""
    return {
        "host": payload["host"],
        "key": "<redacted>",
        "keyConfigured": True,
        "keyLength": len(payload["key"]),
        "keyLocation": payload["keyLocation"],
        "urlList": list(payload["urlList"]),
    }


def post(payload: dict[str, Any], timeout: int) -> tuple[int, str]:
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        ENDPOINT,
        data=body,
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            text = response.read(2048).decode("utf-8", errors="replace")
            return int(response.status), text.strip()
    except urllib.error.HTTPError as exc:
        # HTTPError is the normal path for non-2xx; it carries the status code.
        try:
            text = exc.read(2048).decode("utf-8", errors="replace").strip()
        except Exception:
            text = ""
        return int(exc.code), text
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        reason = getattr(exc, "reason", exc)
        raise PingError(f"network error contacting IndexNow: {reason}") from None


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ping IndexNow for canonical site routes.")
    parser.add_argument(
        "--commit",
        action="store_true",
        help="actually POST to IndexNow (default is a safe dry-run)",
    )
    parser.add_argument(
        "--json",
        dest="as_json",
        action="store_true",
        help="emit machine-readable JSON (key always redacted)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"request timeout in seconds (default {DEFAULT_TIMEOUT})",
    )
    return parser.parse_args(argv)


def emit(result: dict[str, Any], as_json: bool) -> None:
    if as_json:
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return
    print(f"IndexNow ping — mode: {result['mode']}")
    print(f"  host:         {result['host']}")
    print(f"  keyLocation:  {result['keyLocation']}")
    print(f"  key:          {result['key']} (length {result['keyLength']})")
    print(f"  URLs ({result['urlCount']}):")
    for url in result["urls"]:
        print(f"    - {url}")
    if result["mode"] == "dry-run":
        print("  DRY-RUN: nothing sent. Re-run with --commit to publish.")
    else:
        print(f"  HTTP status:  {result['httpStatus']}")
        print(f"  accepted:     {result['accepted']}")
        if result.get("response"):
            print(f"  response:     {result['response'][:200]}")


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    try:
        key = read_key(repo_root() / KEY_FILE_REL)
        payload = build_payload(key)
    except PingError as exc:
        # Message is guaranteed key-free.
        if args.as_json:
            print(json.dumps({"ok": False, "error": str(exc)}, sort_keys=True))
        else:
            print(f"error: {exc}", file=sys.stderr)
        return 1

    view = redacted_view(payload)
    base: dict[str, Any] = {
        "host": view["host"],
        "key": view["key"],
        "keyLength": view["keyLength"],
        "keyLocation": view["keyLocation"],
        "urls": view["urlList"],
        "urlCount": len(view["urlList"]),
    }

    if not args.commit:
        emit({**base, "mode": "dry-run", "sent": False, "accepted": False, "ok": True}, args.as_json)
        return 0

    try:
        status, text = post(payload, args.timeout)
    except PingError as exc:
        emit({**base, "mode": "commit", "sent": True, "accepted": False, "ok": False, "error": str(exc)}, args.as_json)
        return 3

    accepted = status in SUCCESS_STATUSES
    result = {
        **base,
        "mode": "commit",
        "sent": True,
        "httpStatus": status,
        "accepted": accepted,
        "ok": accepted,
        "response": text,
    }
    emit(result, args.as_json)
    return 0 if accepted else 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
