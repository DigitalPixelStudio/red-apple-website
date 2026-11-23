#!/usr/bin/env python3
"""POST-DEPLOY FRESHNESS HELPER (stdlib only, read-only). BE-1 flagged need.

Runs a compact, machine-readable post-deploy freshness check:
  1. verify_v13_ssr.py --json  (10 routes, Googlebot UA: 200 / rating parity /
     no banned legacy strings / no noindex / one-title-one-pipe);
  2. a GET on /api/health (must return HTTP 200).

SAFETY / NETWORK POSTURE
  DRY-RUN IS THE DEFAULT. With no --live flag this helper makes ZERO network calls:
  it only validates its own configuration and prints the exact commands/URL it
  WOULD run, so it is safe to invoke anywhere (CI lint, local, pre-ship). Pass
  --live to actually ping the site. Never curl — urllib only.

INDEXNOW (BE-1 OWNS IT — NOT IMPLEMENTED HERE)
  IndexNow pinging is intentionally standalone. The orchestrator may chain it
  AFTER this helper reports PASS, e.g.:
      python3 scripts/audit/postdeploy_freshen.py --live \
        && python3 <BE-1-owned indexnow ping>
  This helper does NOT ping IndexNow or any search engine. Keep the two steps
  separate so a freshness failure never half-submits a URL to IndexNow.

Gift: --json emits a single machine-readable object (mode, per-check ok/status,
violations, base URL) for the audit trail; plain mode prints one PASS/FAIL line.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
VERIFY_SSR = ROOT / "scripts" / "audit" / "verify_v13_ssr.py"
DEFAULT_BASE_URL = "https://www.redmobilerepair.in"
HEALTH_PATH = "/api/health"
HEALTH_UA = "Mozilla/5.0 (compatible; PixelForgeFreshness/1.0; +https://thepixelforgestudio.in)"
HEALTH_TIMEOUT = 20
SSR_TIMEOUT = 240  # 10 routes x verify_v13_ssr.py's 20s per-route timeout


def run_ssr(base_url: str, skip_noindex: bool) -> dict:
    """Run verify_v13_ssr.py with --json and parse its result. No shell involved."""
    cmd = [sys.executable, str(VERIFY_SSR), "--base-url", base_url, "--json"]
    if skip_noindex:
        cmd.append("--skip-noindex")
    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=SSR_TIMEOUT, check=False
        )
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"verify_v13_ssr.py timed out after {SSR_TIMEOUT}s"}
    try:
        data = json.loads(proc.stdout)
    except (ValueError, TypeError) as exc:
        return {
            "ok": False,
            "error": f"unparseable SSR JSON: {exc}",
            "returncode": proc.returncode,
            "stderr_excerpt": proc.stderr[-500:],
        }
    data["returncode"] = proc.returncode
    data["ok"] = bool(data.get("ok")) and proc.returncode == 0
    return data


def get_health(base_url: str) -> dict:
    """GET /api/health; PASS only on HTTP 200. Never raises."""
    url = base_url.rstrip("/") + HEALTH_PATH
    req = Request(url, headers={"User-Agent": HEALTH_UA, "Accept": "application/json,text/plain,*/*"})
    try:
        with urlopen(req, timeout=HEALTH_TIMEOUT) as resp:  # noqa: S310
            status = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except HTTPError as exc:
        status = exc.code
        try:
            body = exc.read().decode("utf-8", errors="replace")
        except Exception:  # pragma: no cover - defensive
            body = ""
    except (URLError, OSError, TimeoutError) as exc:
        return {"ok": False, "status": None, "url": url, "error": str(exc)}
    return {
        "ok": status == 200,
        "status": status,
        "url": url,
        "body_excerpt": body[:400],
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    ap.add_argument(
        "--live",
        action="store_true",
        help="actually ping the site (SSR verifier + /api/health). DEFAULT is DRY-RUN: no network.",
    )
    ap.add_argument(
        "--skip-noindex",
        action="store_true",
        help="EMERGENCY ONLY: passthrough to verify_v13_ssr.py; bypasses only its noindex check",
    )
    ap.add_argument("--json", action="store_true", help="emit a single machine-readable JSON object")
    args = ap.parse_args()

    parsed = urlparse(args.base_url)
    errors: list[str] = []
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        errors.append(f"invalid --base-url: {args.base_url!r}")
    if not VERIFY_SSR.is_file():
        errors.append(f"missing verifier: {VERIFY_SSR}")
    config_ok = not errors

    ssr_command = [sys.executable, str(VERIFY_SSR), "--base-url", args.base_url, "--json"]
    if args.skip_noindex:
        ssr_command.append("--skip-noindex")
    health_url = args.base_url.rstrip("/") + HEALTH_PATH

    if args.live and config_ok:
        ssr = run_ssr(args.base_url, args.skip_noindex)
        health = get_health(args.base_url)
        mode = "live"
    else:
        ssr = {"ok": None, "skipped": True, "would_run": ssr_command}
        health = {"ok": None, "skipped": True, "would_get": health_url}
        mode = "dry-run"
        if args.live and not config_ok:
            errors.append("--live requested but configuration is invalid; no network calls made")

    checks = {
        "config": {"ok": config_ok, "detail": "base-url valid and verifier present" if config_ok else "; ".join(errors)},
        "ssr": ssr,
        "health": health,
    }
    ok = config_ok and (ssr.get("ok") is True) and (health.get("ok") is True)
    if mode == "dry-run":
        ok = config_ok  # a dry run passes when its own configuration is sound

    ssr_tag = "DRY-RUN" if mode == "dry-run" else ("PASS" if ssr.get("ok") else "FAIL")
    health_tag = (
        "DRY-RUN"
        if mode == "dry-run"
        else (f"PASS:{health.get('status')}" if health.get("ok") else f"FAIL:{health.get('status')}")
    )
    summary = (
        f"POSTDEPLOY FRESHEN [{mode.upper()}] "
        f"{'PASS' if ok else 'FAIL'} — base={args.base_url} ; "
        f"ssr={ssr_tag} ; health={health_tag}"
        + (" ; NO network calls made (dry-run)" if mode == "dry-run" else "")
    )

    result = {
        "script": "postdeploy_freshen.py",
        "mode": mode,
        "ok": ok,
        "base_url": args.base_url,
        "summary": summary,
        "checks": checks,
        "violations": [
            f"{name}: {c.get('error') or c.get('detail') or c}"
            for name, c in checks.items()
            if c.get("ok") is False
        ],
        "planned_ssr_command": ssr_command,
        "planned_health_url": health_url,
        "indexnow": "standalone — BE-1 owns the ping; orchestrator chains it AFTER a PASS",
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(summary)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
