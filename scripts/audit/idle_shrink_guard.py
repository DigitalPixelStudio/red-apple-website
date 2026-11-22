#!/usr/bin/env python3
"""Static regression guard for the v14 "idle shrink" bug (stdlib only, read-only).

WHAT Faisu REPORTED
-------------------
After the tab goes idle (app switch / lock / focus loss) and returns, the 3D
device models visibly SHRINK. The root-cause chain in public/final-site.js:

  1. centerAndFitResponsive() re-runs `root.scale.multiplyScalar(2.0 / r0)` on
     EVERY call. That line is documented as "normalise scale ONCE against the
     tight device bounds" — but nothing stops a second call from multiplying
     an already-normalized scale again.
  2. wakeAll() (visibilitychange / pageshow / focus) sets `autoFramed = false`
     and `autoWake = true`. Those are exactly the two flags animate() checks
     in the gate `if ((!s.autoFramed || s.autoWake) && cw && ch)` before it
     calls centerAndFitResponsive(). So every wake re-runs the "one-time"
     normalization -> compounding scale -> idle shrink.
  3. The agreed v14 near-edge fill values (the v13 values v14 must preserve)
     must not be quietly reduced as a workaround for the shrink.

WHAT THIS CHECKER DOES
----------------------
Reads public/final-site.js (NEVER edits it) and FAILS (exit 1) if:
  (a) the unguarded `multiplyScalar(2.0 / r0)` is still in centerAndFitResponsive;
  (b) wakeAll resets a re-normalization trigger flag AND the one-time guard is
      absent (only then are wake refits unsafe; with the guard, camera-only
      refits are safe and needed for the stale-aspect fix);
  (c) any effective MODEL_FRAMING fill regresses below the agreed v14 floor.

With FaiCodex's v14 one-time-guard fix applied -> expect PASS/0. Intended for
predeploy/CI.

GIFT: --json for machine-readable output + --file override for safe testing.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_JS = ROOT / "public" / "final-site.js"

# The "agreed v14 floor" = the near-edge per-model fills agreed in v13
# (commit 01edba3) that v14 must preserve. AirPods is deliberately eased;
# MacBook is deliberately pushed furthest. Effective fill = min(cap, fill).
V14_FILL_FLOORS: dict[str, float] = {
    "canvas-hero":          0.92,
    "canvas-estimate-ipad": 0.92,
    "canvas-pickup-iphone": 0.92,
    "canvas-tbk-oca":       0.92,
    "canvas-tbk-90l":       0.92,
    "canvas-tbk-958":       0.92,
    "canvas-internals":     0.92,
    "canvas-airpods":       0.86,   # intentionally eased back
    "canvas-watch":         0.92,
    "canvas-macbook":       0.94,   # intentionally pushed furthest
}
DEFAULT_FILL_FLOOR = 0.92
FALLBACK_BARE_TRIGGERS = {("autoFramed", "false"), ("autoWake", "true")}
_EPS = 1e-9


# --------------------------------------------------------------------------- #
# Minimal JS-aware text helpers (no third-party parser needed).
# --------------------------------------------------------------------------- #
def blank_comments(text: str) -> str:
    """Replace // and /* */ comment content with spaces, preserving strings,
    newlines and offsets. Keeps regex matches honest (no commented-out hits)."""
    out = list(text)
    i, n = 0, len(text)
    state = "code"
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ""
        if state == "code":
            if c == "/" and nxt == "/":
                state = "line"
                out[i] = out[i + 1] = " "
                i += 2
                continue
            if c == "/" and nxt == "*":
                state = "block"
                out[i] = out[i + 1] = " "
                i += 2
                continue
            if c in ("'", '"', "`"):
                state = c
        elif state == "line":
            if c == "\n":
                state = "code"
            else:
                out[i] = " "
        elif state == "block":
            if c == "*" and nxt == "/":
                out[i] = out[i + 1] = " "
                state = "code"
                i += 2
                continue
            if c != "\n":
                out[i] = " "
        elif state in ("'", '"', "`"):
            if c == "\\":
                i += 2
                continue
            if c == state:
                state = "code"
        i += 1
    return "".join(out)


def _matching_brace(text: str, open_idx: int) -> int | None:
    """Index of the } matching the { at open_idx, honoring strings/comments."""
    depth = 0
    i = open_idx
    n = len(text)
    state = "code"
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ""
        if state == "code":
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    return i
            elif c == "/" and nxt == "/":
                state = "line"
                i += 1
            elif c == "/" and nxt == "*":
                state = "block"
                i += 1
            elif c in ("'", '"', "`"):
                state = c
        elif state == "line":
            if c == "\n":
                state = "code"
        elif state == "block":
            if c == "*" and nxt == "/":
                state = "code"
                i += 1
        elif state in ("'", '"', "`"):
            if c == "\\":
                i += 2
                continue
            if c == state:
                state = "code"
        i += 1
    return None


def extract_body(text: str, header_regex: str) -> str | None:
    """Return the inner body of the function/object whose declaration matches."""
    m = re.search(header_regex, text)
    if not m:
        return None
    # Search from the match START (not end): header regexes may themselves end
    # with the opening `{` (e.g. `MODEL_FRAMING = {` or `() => {`). Starting at
    # m.end() would skip past that brace into the first inner block/entry.
    open_idx = text.find("{", m.start())
    if open_idx < 0:
        return None
    close_idx = _matching_brace(text, open_idx)
    if close_idx is None:
        return None
    return text[open_idx + 1 : close_idx]


# --------------------------------------------------------------------------- #
# (a) one-time normalization guard
# --------------------------------------------------------------------------- #
def check_one_time_guard(body: str | None) -> tuple[bool, str]:
    if body is None:
        return True, "centerAndFitResponsive() not found — no repeated normalization to guard"
    b = blank_comments(body)
    mult = re.search(r"multiplyScalar\s*\(\s*2(?:\.0+)?\s*\/\s*r0\s*\)", b)
    if not mult:
        return True, "no repeated 2.0/r0 multiply — scale is not re-normalized per fit"

    # Look for a one-time guard around the multiply: a flag that is both
    # checked (`if (!flag)` / `if (flag !== true)` / `if (!set.has(root))`)
    # and latched (`flag = true` / `set.add(root)`), or a cached base size.
    lo, hi = max(0, mult.start() - 1200), min(len(b), mult.end() + 1200)
    window = b[lo:hi]

    checked: set[str] = set()
    for m in re.finditer(r"if\s*\(\s*!\s*([A-Za-z_$][\w$.]*)", window):
        checked.add(m.group(1).strip())
    for m in re.finditer(
        r"if\s*\(\s*([A-Za-z_$][\w$.]*)\s*(?:===|==|!==|!=)\s*(?:false|undefined|null|0)\s*\)",
        window,
    ):
        checked.add(m.group(1).strip())
    for m in re.finditer(r"if\s*\(\s*!\s*([A-Za-z_$][\w$.]*?)\.has\s*\(", window):
        checked.add(m.group(1).strip())

    latched: set[str] = set()
    for m in re.finditer(r"([A-Za-z_$][\w$.]*)\s*=\s*(?:true|1)\s*;", window):
        latched.add(m.group(1).strip())
    for m in re.finditer(r"([A-Za-z_$][\w$.]*?)\.add\s*\(", window):
        latched.add(m.group(1).strip())
    # Latching via cloning the base scale is also a valid one-time signal.
    for m in re.finditer(r"([A-Za-z_$][\w$.]*(?:[Bb]ase|[Ss]cale|[Ss]ize)[A-Za-z_$\w.]*)\s*=", window):
        latched.add(m.group(1).strip())

    cached = re.search(
        r"\b(?:baseScale|baseSize|baseRadius|baseScaleFactor|cachedScale|cachedBase|"
        r"cachedSize|restScale|restSize|initialScale|origScale|originalScale|_baseScale)\b",
        window,
        re.I,
    )
    guard_hits = sorted(checked & latched)
    if guard_hits:
        return True, f"multiply is inside a one-time guard (checked then latched): {guard_hits}"
    if cached:
        return True, f"cached base scale/size mechanism present ('{cached.group(0)}') — normalization not re-applied blindly"
    return False, (
        "multiplyScalar(2.0 / r0) runs unguarded on every centerAndFitResponsive() call "
        "— re-normalization compounds scale after each wake (idle shrink)"
    )


# --------------------------------------------------------------------------- #
# (b) wakeAll resetting a refit trigger is SAFE only with the one-time guard
# --------------------------------------------------------------------------- #
def reframe_triggers(js_text: str) -> set[tuple[str, str]]:
    """Derive (flag, trigger_value) from the animate() gate that calls the fitter."""
    triggers: set[tuple[str, str]] = set()
    for m in re.finditer(r"centerAndFitResponsive\s*\(", js_text):
        prefix = js_text[max(0, m.start() - 40) : m.start()]
        if re.search(r"function\s*$", prefix.strip()):  # the declaration, not a call
            continue
        before = js_text[: m.start()]
        ifs = list(re.finditer(r"\bif\s*\(", before))
        if not ifs:
            continue
        i, depth = ifs[-1].end(), 1
        while i < len(js_text) and depth:
            if js_text[i] == "(":
                depth += 1
            elif js_text[i] == ")":
                depth -= 1
            i += 1
        cond = blank_comments(js_text[ifs[-1].end() : i - 1])
        for mm in re.finditer(r"!\s*([A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*)", cond):
            triggers.add((mm.group(1).split(".")[-1], "false"))
        for mm in re.finditer(r"(?<![\w$.!])([A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*)", cond):
            triggers.add((mm.group(1).split(".")[-1], "true"))
        break
    return triggers | FALLBACK_BARE_TRIGGERS


def check_wake_all(
    js_text: str, triggers: set[tuple[str, str]], normalization_safe: bool
) -> tuple[bool, str]:
    """A wakeAll refit is harmless when the fitter's one-time normalization guard
    is present: the fit re-computes camera/aspect but cannot re-multiply scale.
    Only when the guard is ABSENT does resetting a re-normalization trigger flag
    cause the compounding-scale idle-shrink regression."""
    body = extract_body(
        js_text,
        r"\bwakeAll\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)?\s*=>\s*\{",
    )
    if body is None:
        return True, "no wakeAll handler found — no framing flag is reset on wake"
    b = blank_comments(body)
    hits = []
    for flag, val in sorted(triggers):
        if re.search(r"\b" + re.escape(flag) + r"\s*=\s*" + val + r"\b", b):
            hits.append(f"{flag}={val}")
    if not hits:
        return True, "wakeAll does not reset any flag that re-runs centerAndFitResponsive()"
    # wakeAll DOES reset refit triggers. That is correct behaviour for the
    # stale-aspect fix as long as the fitter normalizes scale only once.
    if normalization_safe:
        return True, (
            f"wakeAll resets refit flag(s) {', '.join(hits)}, but centerAndFitResponsive() "
            "has a one-time normalization guard — camera-only refits are safe (and required "
            "for the stale-aspect fix)"
        )
    return False, (
        f"wakeAll resets re-normalization trigger flag(s): {', '.join(hits)} "
        "AND no one-time normalization guard — wake refits compound scale (idle shrink)"
    )


# --------------------------------------------------------------------------- #
# (c) fills must not regress below the agreed v14 floor
# --------------------------------------------------------------------------- #
def check_fill_floor(js_text: str) -> tuple[bool, str, dict[str, float]]:
    flat = blank_comments(js_text)
    obj = extract_body(js_text, r"\bMODEL_FRAMING\s*=\s*\{")
    if obj is None:
        return False, "MODEL_FRAMING object not found", {}

    declared: dict[str, float] = {}
    for m in re.finditer(
        r"['\"](canvas-[\w-]+)['\"]\s*:\s*\{\s*fill\s*:\s*([0-9.]+)",
        blank_comments(obj),
    ):
        declared[m.group(1)] = float(m.group(2))

    fb = re.search(r"MODEL_FRAMING\s*\[\s*id\s*\]\s*\|\|\s*\{\s*fill\s*:\s*([0-9.]+)", flat)
    fallback = float(fb.group(1)) if fb else None
    cap_m = re.search(r"Math\.min\(\s*([0-9.]+)\s*,\s*cfg\.fill", flat)
    cap = float(cap_m.group(1)) if cap_m else 1.0

    effective: dict[str, float] = {}
    bad: list[str] = []
    for cid, floor in V14_FILL_FLOORS.items():
        val = declared.get(cid, fallback)
        if val is None:
            bad.append(f"{cid}: missing (no declared fill and no fallback)")
            continue
        eff = min(cap, val)
        effective[cid] = round(eff, 4)
        if eff + _EPS < floor:
            bad.append(f"{cid}: effective fill {eff:.2f} < v14 floor {floor:.2f}")
    if fallback is not None and fallback + _EPS < DEFAULT_FILL_FLOOR:
        bad.append(f"fallback fill {fallback:.2f} < v14 floor {DEFAULT_FILL_FLOOR:.2f}")

    if bad:
        return False, "; ".join(bad), effective
    return True, f"all fills at/above agreed v14 floor (cap {cap:.2f})", effective


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description="Guard the v14 idle-shrink 3D regression.")
    ap.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    ap.add_argument("--file", type=Path, default=DEFAULT_JS, help="JS file to check (default: public/final-site.js)")
    args = ap.parse_args()

    path = args.file
    try:
        js = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        msg = f"cannot read {path}: {exc}"
        if args.json:
            print(json.dumps({"status": "ERROR", "error": msg, "exit_code": 1}))
        else:
            print(f"ERROR: {msg}")
        return 1

    fn_body = extract_body(js, r"\bfunction\s+centerAndFitResponsive\s*\(")
    a_ok, a_detail = check_one_time_guard(fn_body)
    # A wake refit is only unsafe if it can re-multiply scale. Feed check (a)'s
    # guard verdict into check (b): an absent guard is the sole FAIL condition.
    b_ok, b_detail = check_wake_all(js, reframe_triggers(js), a_ok)
    c_ok, c_detail, effective = check_fill_floor(js)

    checks = [
        {"id": "a_one_time_normalization_guard", "title": "scale normalized once (or cached), not per fit", "ok": a_ok, "detail": a_detail},
        {"id": "b_wake_no_unsafe_renormalize", "title": "wake refits cannot re-multiply scale (one-time guard)", "ok": b_ok, "detail": b_detail},
        {"id": "c_v14_fill_floor", "title": "fills at/above agreed v14 floor", "ok": c_ok, "detail": c_detail},
    ]
    ok = all(c["ok"] for c in checks)
    passed = sum(c["ok"] for c in checks)
    summary = f"{passed}/{len(checks)} checks passed — " + ("PASS" if ok else "FAIL (idle-shrink regression present)")
    result = {
        "script": "idle_shrink_guard",
        "status": "PASS" if ok else "FAIL",
        "exit_code": 0 if ok else 1,
        "file": str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
        "v14_fill_floors": V14_FILL_FLOORS,
        "effective_fills": effective,
        "summary": summary,
        "checks": checks,
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"idle_shrink_guard — {result['file']}")
        for c in checks:
            print(f"  [{'OK ' if c['ok'] else 'BAD'}] {c['id']}: {c['title']}")
            print(f"        {c['detail']}")
        print(summary)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
