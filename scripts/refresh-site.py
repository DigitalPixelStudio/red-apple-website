#!/usr/bin/env python3
"""POST-DEPLOY REFRESHER — "keep the site fresh, never down" (stdlib only).

DRY-RUN BY DEFAULT: with no --commit this helper makes ZERO network calls and
sends NO pings. It only prints the exact plan and exits 0. Pass --commit to run
the chain for real:

  (1) verify_v13_ssr.py --json    — 10 routes, Googlebot UA: 200 / rating parity /
                                    no banned strings / no noindex / one title pipe
  (2) ping-indexnow.py --commit   — IndexNow nudge, RUN ONLY IF STEP 1 PASSES
  (3) health-monitor.py --quiet   — final "alive & strike-free" verdict

Step 3 ALWAYS runs under --commit (even if step 1 or 2 failed): it is a read-only
final health verdict, so Faisu never ends a run without knowing the current
state of the site. IndexNow is submitted ONLY after a clean SSR PASS — a strike
regression can never half-submit URLs to a search engine.

SAFETY: subprocess calls use sys.executable and argument lists (never a shell).
NO API key or secret is ever printed: the IndexNow payload is consumed as JSON
and only {ok, accepted, httpStatus, mode} are surfaced; --json uses the same
sanitized view. URL userinfo is stripped from all output via safe_url().

Usage
-----
    python3 scripts/refresh-site.py                    # safe dry-run (default)
    python3 scripts/refresh-site.py --json             # dry-run, machine-readable
    python3 scripts/refresh-site.py --commit           # run the full chain
    python3 scripts/refresh-site.py --commit --json    # full chain + JSON report
    python3 scripts/refresh-site.py --commit --base-url http://localhost:3000

Exit codes
----------
    0  success (dry-run config valid, or --commit with all executed steps passing)
    1  site regression — verify_v13_ssr.py or health-monitor.py FAILED;
       IndexNow was withheld if the SSR gate failed
    2  configuration/setup error (missing script or invalid --base-url) —
       no network, no POST
    3  IndexNow submission failed (site itself healthy: SSR PASS, health PASS)
    4  a step could not be executed or its output could not be parsed
       (transport/timeout/JSON parse error)
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
VERIFY_SSR = ROOT / "audit" / "verify_v13_ssr.py"
PING_INDEXNOW = ROOT / "ping-indexnow.py"
HEALTH_MONITOR = ROOT / "health-monitor.py"

DEFAULT_BASE_URL = "https://www.redmobilerepair.in"
DEFAULT_STEP_TIMEOUT = 300  # generous: 10 routes x 20s x retries inside each step


def safe_url(url: str) -> str:
    try:
        parsed = urlparse(url)
    except ValueError:
        return "<invalid-url>"
    host = parsed.hostname or ""
    if host and parsed.port:
        host = f"{host}:{parsed.port}"
    return f"{parsed.scheme}://{host}{parsed.path}" if host else "<invalid-url>"


def validate_base_url(url: str) -> str | None:
    try:
        parsed = urlparse(url)
    except ValueError:
        return "malformed URL"
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        return "expected an http(s) URL with a host"
    return None


def run_script(script: Path, extra_args: list[str], timeout: int) -> dict:
    """Run a helper with sys.executable (no shell). Never raises."""
    if not script.is_file():
        return {"spawned": False, "ok": False, "error": f"missing script: {script.name}"}
    cmd = [sys.executable, str(script)] + extra_args
    started = time.time()
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True,
                              timeout=timeout, check=False)
    except subprocess.TimeoutExpired:
        return {"spawned": True, "ok": False, "error": f"timed out after {timeout}s",
                "duration_seconds": round(time.time() - started, 3)}
    except OSError as exc:
        return {"spawned": False, "ok": False, "error": f"could not execute: {exc}"}
    return {
        "spawned": True,
        "ok": proc.returncode == 0,
        "returncode": proc.returncode,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "duration_seconds": round(time.time() - started, 3),
    }


def parse_json(text: str) -> dict | None:
    try:
        data = json.loads(text)
    except (ValueError, TypeError):
        return None
    return data if isinstance(data, dict) else None


def summarize_ssr(run: dict, data: dict | None) -> dict:
    """Only safe fields: no response headers, no raw HTML snippets, no secrets."""
    internal = (not run.get("spawned")) or data is None or "error" in run
    if data is None:
        return {"ok": False, "internal_error": True,
                "detail": run.get("error") or "unparseable SSR JSON"}
    return {
        "ok": bool(run.get("ok")) and bool(data.get("ok")) and not internal,
        "internal_error": internal,
        "routes": len(data.get("routes_checked", [])),
        "checks": [{"id": c.get("id"), "ok": c.get("ok")} for c in data.get("checks", [])],
        "violations": [str(v)[:300] for v in data.get("violations", [])[:10]],
        "returncode": run.get("returncode"),
    }


def summarize_ping(run: dict, data: dict | None) -> dict:
    """Explicit allow-list of ping fields — the key is NEVER included."""
    internal = (not run.get("spawned")) or data is None or "error" in run
    if data is None:
        return {"ok": False, "internal_error": True,
                "detail": run.get("error") or "unparseable IndexNow JSON"}
    return {
        "ok": bool(run.get("ok")) and bool(data.get("ok")) and not internal,
        "internal_error": internal,
        "mode": data.get("mode"),
        "sent": data.get("sent"),
        "accepted": data.get("accepted"),
        "httpStatus": data.get("httpStatus"),
        "returncode": run.get("returncode"),
    }


def summarize_health(run: dict) -> dict:
    internal = (not run.get("spawned")) or "error" in run
    return {
        "ok": bool(run.get("ok")) and not internal,
        "internal_error": internal,
        "line": (run.get("stdout") or "").strip().splitlines()[-1:] or
                [run.get("error", "")],
        "returncode": run.get("returncode"),
    }


def build_plan(base_url: str) -> list[dict]:
    return [
        {"step": "verify_ssr", "script": VERIFY_SSR.name,
         "path": "scripts/audit/verify_v13_ssr.py",
         "args": ["--base-url", base_url, "--json"],
         "gate": "gates IndexNow: step 2 runs ONLY if this PASSES"},
        {"step": "indexnow", "script": PING_INDEXNOW.name,
         "path": "scripts/ping-indexnow.py",
         "args": ["--commit"],
         "gate": "submits canonical URLs — withheld unless step 1 PASS"},
        {"step": "health", "script": HEALTH_MONITOR.name,
         "path": "scripts/health-monitor.py",
         "args": ["--base-url", base_url, "--quiet"],
         "gate": "read-only final verdict — always runs under --commit"},
    ]


def emit(result: dict, as_json: bool) -> None:
    if as_json:
        print(json.dumps(result, indent=2, sort_keys=True))
        return
    print(f"REFRESH [{result['mode'].upper()}] — {result['display_url']}")
    if result.get("errors"):
        print("  CONFIG ERRORS: " + "; ".join(result["errors"]))
    if result["mode"] == "dry-run":
        print("  No network calls. No IndexNow POST. Planned steps:")
        for item in result.get("plan", []):
            print(f"    {item['step']}: python3 {item['path']} "
                  f"{' '.join(item['args'])}")
            print(f"        ({item['gate']})")
    else:
        for step in result["steps"]:
            tag = "SKIP" if step.get("skipped") else ("PASS" if step.get("ok") else "FAIL")
            line = f"  [{tag}] {step['step']}"
            if step.get("skipped"):
                line += f" — {step.get('reason', '')}"
            elif step["step"] == "health":
                line += f" — {' '.join(step.get('line', []))}"
            elif step["step"] == "verify_ssr":
                line += f" — {step.get('routes', '?')} routes, {len(step.get('violations', []))} violation(s)"
            elif step["step"] == "indexnow":
                line += f" — accepted={step.get('accepted')} http={step.get('httpStatus')}"
            print(line)
    print(f"RESULT: {result['result']} (exit {result['exit_code']})")


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--commit", action="store_true",
                    help="run the chain for real (default is a safe dry-run)")
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    ap.add_argument("--step-timeout", type=int, default=DEFAULT_STEP_TIMEOUT,
                    help=f"per-step timeout in seconds (default {DEFAULT_STEP_TIMEOUT})")
    ap.add_argument("--json", dest="as_json", action="store_true",
                    help="emit machine-readable JSON (sanitized; no keys)")
    args = ap.parse_args(argv)

    errors: list[str] = []
    url_error = validate_base_url(args.base_url)
    if url_error:
        errors.append(f"invalid --base-url: {url_error}")
    for script in (VERIFY_SSR, PING_INDEXNOW, HEALTH_MONITOR):
        if not script.is_file():
            errors.append(f"missing script: {script.name}")
    if args.step_timeout < 1:
        errors.append("--step-timeout must be >= 1")
    if errors:
        result = {
            "script": "refresh-site.py",
            "mode": "commit" if args.commit else "dry-run",
            "ok": False, "result": "CONFIG ERROR", "exit_code": 2,
            "base_url": args.base_url, "display_url": safe_url(args.base_url),
            "errors": errors, "network_calls": 0, "indexnow_posted": False,
            "plan": [], "steps": [],
        }
        emit(result, args.as_json)
        return 2

    plan = build_plan(args.base_url)
    if not args.commit:
        result = {
            "script": "refresh-site.py", "mode": "dry-run", "ok": True,
            "result": "DRY-RUN OK", "exit_code": 0,
            "base_url": args.base_url, "display_url": safe_url(args.base_url),
            "network_calls": 0, "indexnow_posted": False, "plan": plan, "steps": [],
        }
        emit(result, args.as_json)
        return 0

    # ---- COMMIT: run the chain ---------------------------------------------
    steps: list[dict] = []

    ssr_run = run_script(VERIFY_SSR, ["--base-url", args.base_url, "--json"], args.step_timeout)
    ssr = summarize_ssr(ssr_run, parse_json(ssr_run.get("stdout", "")))
    steps.append({"step": "verify_ssr", **ssr})

    if ssr["ok"]:
        ping_run = run_script(PING_INDEXNOW, ["--commit"], args.step_timeout)
        ping = summarize_ping(ping_run, parse_json(ping_run.get("stdout", "")))
        steps.append({"step": "indexnow", **ping})
    else:
        steps.append({
            "step": "indexnow", "ok": None, "skipped": True, "internal_error": False,
            "reason": "SSR gate did not PASS — IndexNow submission withheld",
        })

    # Always run the final read-only health verdict.
    health_run = run_script(HEALTH_MONITOR, ["--base-url", args.base_url, "--quiet"],
                            args.step_timeout)
    steps.append({"step": "health", **summarize_health(health_run)})

    health = steps[-1]
    fail_site = (
        (not ssr["ok"] and not ssr.get("internal_error"))
        or (not health["ok"] and not health.get("internal_error"))
    )
    fail_internal = any(s.get("internal_error") for s in steps if not s.get("skipped"))
    fail_indexnow = any(s["step"] == "indexnow" and s.get("ok") is False
                        for s in steps)
    if fail_site:
        exit_code, verdict = 1, "SITE REGRESSION"
    elif fail_internal:
        exit_code, verdict = 4, "STEP ERROR"
    elif fail_indexnow:
        exit_code, verdict = 3, "INDEXNOW FAILED"
    else:
        exit_code, verdict = 0, "PASS"

    result = {
        "script": "refresh-site.py", "mode": "commit", "ok": exit_code == 0,
        "result": verdict, "exit_code": exit_code,
        "base_url": args.base_url, "display_url": safe_url(args.base_url),
        "network_calls": sum(1 for s in steps if s["step"] != "indexnow" or not s.get("skipped")),
        "indexnow_posted": any(s["step"] == "indexnow" and not s.get("skipped")
                               for s in steps),
        "indexnow_accepted": any(s["step"] == "indexnow" and s.get("ok") is True
                                 for s in steps),
        "plan": plan, "steps": steps,
    }
    emit(result, args.as_json)
    return exit_code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
