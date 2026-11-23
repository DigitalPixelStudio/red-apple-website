#!/usr/bin/env python3
"""STATIC guard for FAISU's HARD DEVICE-LOCKED 3D rules (v13). Stdlib only, read-only.

This checker NEVER edits source. It reads public/final-site.js and FAILS (exit 1)
if any of the device-locked framing rules drift:

  MODEL_FRAMING must carry a device-aware mechanism — optional per-model
  `mobileFill` / `desktopFill` keys, and/or a `V13_DEVICE_FILL` map.

  LOCKED (device-aware) models and their locked values:
    - canvas-tbk-oca, canvas-tbk-90l, canvas-tbk-958,
      canvas-internals, canvas-airpods  -> desktop fill 0.86..0.87
    - canvas-internals                  -> ALSO explicit mobileFill 0.88
  EVERY OTHER model (canvas-hero, canvas-estimate-ipad, canvas-pickup-iphone,
  canvas-watch, canvas-macbook) is FROZEN: it must have NO device override.

  Additionally:
    - the fit function must choose fill from viewport width <768 vs >=768;
    - the v14 one-time normalization guard must still be present;
    - the renderer must remain SHARED (no per-slot renderer.setSize).

It FAILS if a non-locked model gains a device override or if any locked mobile
value is altered away from its v13 spec.

Gift: --json for machine-readable output and --file to point at a scratch copy,
so the guard can be tested without touching production source.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_JS = ROOT / "public" / "final-site.js"

# --- Faisu's locked v13 spec -------------------------------------------------
DESKTOP_MIN, DESKTOP_MAX = 0.86, 0.87
INTERNALS_MOBILE = 0.88
_EPS = 1e-9

DEVICE_LOCKED = (
    "canvas-tbk-oca",
    "canvas-tbk-90l",
    "canvas-tbk-958",
    "canvas-internals",
    "canvas-airpods",
)
INTERNALS_ID = "canvas-internals"
V13_MAP_NAME = "V13_DEVICE_FILL"
DEVICE_KEYS = ("mobileFill", "desktopFill", "mobile", "desktop")

_NUMBER = r"(-?\d+(?:\.\d+)?)"
_ENTRY_RE = re.compile(r"['\"](canvas-[\w-]+)['\"]\s*:\s*\{")

# Per-slot functions that must NEVER resize the shared renderer.
PER_SLOT_FUNCS = (
    ("animate", r"\bfunction\s+animate\s*\("),
    ("registerSlot", r"\bfunction\s+registerSlot\s*\("),
    ("resizeSlot", r"\bfunction\s+resizeSlot\s*\("),
    ("toggleFullscreen", r"\bfunction\s+toggleFullscreen\s*\("),
    ("renderSlot", r"\bfunction\s+renderSlot\s*\("),
    (
        "fullscreenchange handler",
        r"document\.addEventListener\(\s*['\"]fullscreenchange",
    ),
)


# --------------------------------------------------------------------------- #
# Minimal JS-aware text helpers (comment blanking keeps regex matches honest).
# --------------------------------------------------------------------------- #
def blank_comments(text: str) -> str:
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
    depth = 0
    i, n = open_idx, len(text)
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
    span = extract_body_span(text, header_regex)
    return span[2] if span else None


def extract_body_span(text: str, header_regex: str) -> tuple[int, int, str] | None:
    m = re.search(header_regex, text)
    if not m:
        return None
    open_idx = text.find("{", m.start())
    if open_idx < 0:
        return None
    close_idx = _matching_brace(text, open_idx)
    if close_idx is None:
        return None
    return open_idx, close_idx, text[open_idx + 1 : close_idx]


def _field(body: str, name: str) -> float | None:
    m = re.search(r"\b" + re.escape(name) + r"\s*:\s*" + _NUMBER, body)
    return float(m.group(1)) if m else None


def parse_entries(obj_body: str) -> dict[str, dict]:
    """Parse {'canvas-x': { fill: 0.9, mobileFill: 0.88, ... }, ...} blocks."""
    result: dict[str, dict] = {}
    for m in _ENTRY_RE.finditer(obj_body):
        open_idx = m.end() - 1  # the '{' after the colon
        close_idx = _matching_brace(obj_body, open_idx)
        if close_idx is None:
            continue
        inner = obj_body[open_idx + 1 : close_idx]
        cid = m.group(1)
        result[cid] = {
            "fill": _field(inner, "fill"),
            "desktopFill": _field(inner, "desktopFill"),
            "mobileFill": _field(inner, "mobileFill"),
            "desktop": _field(inner, "desktop"),
            "mobile": _field(inner, "mobile"),
        }
    return result


def merge_overrides(framing: dict[str, dict], v13: dict[str, dict]) -> dict[str, dict]:
    """Merge MODEL_FRAMING entries with an optional V13_DEVICE_FILL map.

    MODEL_FRAMING's own keys take precedence; the V13 map fills in anything the
    entry omits. A model counts as 'device-aware' if either source gives it a
    mobile/desktop override or it appears in the V13 map at all.
    """
    merged: dict[str, dict] = {}
    for cid in set(framing) | set(v13):
        f = framing.get(cid, {})
        v = v13.get(cid, {})
        row: dict[str, object] = {}
        for key in ("fill", "desktopFill", "mobileFill", "desktop", "mobile"):
            row[key] = f.get(key) if f.get(key) is not None else v.get(key)
        row["has_override"] = bool(
            f.get("desktopFill") is not None
            or f.get("mobileFill") is not None
            or f.get("desktop") is not None
            or f.get("mobile") is not None
            or cid in v13
        )
        merged[cid] = row
    return merged


def _in_range(value: float | None, lo: float, hi: float) -> bool:
    return value is not None and (lo - _EPS) <= value <= (hi + _EPS)


def _near(value: float | None, target: float) -> bool:
    return value is not None and abs(value - target) <= _EPS


# --------------------------------------------------------------------------- #
# Individual checks. Each returns (ok, detail, extra-data).
# --------------------------------------------------------------------------- #
def check_framing_present(js_flat: str) -> tuple[bool, str, dict]:
    span = extract_body_span(js_flat, r"\bMODEL_FRAMING\s*=\s*\{")
    if span is None:
        return False, "MODEL_FRAMING object not found in public/final-site.js", {}
    framing = parse_entries(span[2])
    if not framing:
        return False, "MODEL_FRAMING found but no device entries could be parsed", {}
    return True, f"MODEL_FRAMING parsed: {len(framing)} model entries", framing


def check_device_mechanism(merged: dict[str, dict]) -> tuple[bool, str, list[str]]:
    overridden = sorted(cid for cid, row in merged.items() if row["has_override"])
    ok = bool(overridden)
    detail = (
        "device-aware fill mechanism present: " + ", ".join(overridden)
        if ok
        else (
            "NO device-aware fill mechanism: neither mobileFill/desktopFill nor a "
            f"{V13_MAP_NAME} map was found (v13 device-locked fills missing)"
        )
    )
    return ok, detail, overridden


def check_desktop_fills(merged: dict[str, dict]) -> tuple[bool, str, dict]:
    bad: list[str] = []
    effective: dict[str, float | None] = {}
    for cid in DEVICE_LOCKED:
        row = merged.get(cid)
        if row is None:
            bad.append(f"{cid}: missing from MODEL_FRAMING/{V13_MAP_NAME}")
            effective[cid] = None
            continue
        desk = (
            row["desktopFill"]
            if row["desktopFill"] is not None
            else row["desktop"]
            if row["desktop"] is not None
            else row["fill"]
        )
        effective[cid] = desk
        if not _in_range(desk, DESKTOP_MIN, DESKTOP_MAX):
            shown = "missing" if desk is None else f"{desk:.2f}"
            bad.append(
                f"{cid}: desktop fill {shown} outside locked "
                f"{DESKTOP_MIN:.2f}-{DESKTOP_MAX:.2f}"
            )
    detail = (
        "all 5 locked models have desktop fill in "
        f"{DESKTOP_MIN:.2f}-{DESKTOP_MAX:.2f}"
        if not bad
        else "; ".join(bad)
    )
    return not bad, detail, effective


def check_internals_mobile(merged: dict[str, dict]) -> tuple[bool, str]:
    row = merged.get(INTERNALS_ID)
    mobile = None
    if row:
        mobile = row["mobileFill"] if row["mobileFill"] is not None else row["mobile"]
    if mobile is None:
        return False, (
            f"{INTERNALS_ID} has NO explicit mobileFill — v13 requires mobileFill "
            f"{INTERNALS_MOBILE:.2f}"
        )
    if not _near(mobile, INTERNALS_MOBILE):
        return False, (
            f"{INTERNALS_ID} mobileFill {mobile:.2f} was ALTERED — locked value is "
            f"{INTERNALS_MOBILE:.2f}"
        )
    return True, f"{INTERNALS_ID} mobileFill locked at {mobile:.2f}"


def check_frozen_models(merged: dict[str, dict], framing: dict[str, dict], v13: dict[str, dict]) -> tuple[bool, str, list[str]]:
    offenders: list[str] = []
    frozen = sorted(set(framing) - set(DEVICE_LOCKED))
    for cid in frozen:
        if merged.get(cid, {}).get("has_override"):
            offenders.append(cid)
    # An override in the V13 map for any model outside the locked set is also a
    # breach, even if that model is not currently listed in MODEL_FRAMING.
    for cid in sorted(set(v13) - set(DEVICE_LOCKED)):
        if cid not in offenders:
            offenders.append(cid)
    detail = (
        "all frozen models have NO device override"
        if not offenders
        else "FROZEN model(s) gained a device override: " + ", ".join(offenders)
    )
    return not offenders, detail, offenders


def check_viewport_selection(js_flat: str) -> tuple[bool, str]:
    if "768" not in js_flat:
        return False, "no viewport-width 768 threshold found in public/final-site.js"
    width_rx = re.compile(
        r"innerWidth|outerWidth|clientWidth|screen\.width|viewportWidth|\bw\b|\bvw\b",
        re.I,
    )
    fill_rx = re.compile(r"mobileFill|desktopFill|" + V13_MAP_NAME + r"|isMobile|isDesktop", re.I)
    cmp_rx = re.compile(r"<=?|>=?")
    for m in re.finditer(r"\b768\b", js_flat):
        window = js_flat[max(0, m.start() - 340) : m.end() + 340]
        if width_rx.search(window) and fill_rx.search(window) and cmp_rx.search(window):
            return True, (
                "fit logic selects fill from viewport width vs 768 (<768 mobile, "
                ">=768 desktop)"
            )
    return False, (
        "768 threshold exists but is not tied to a width comparison and a "
        "mobileFill/desktopFill selection"
    )


def check_one_time_guard(js_text: str) -> tuple[bool, str]:
    body = extract_body(js_text, r"\bfunction\s+centerAndFitResponsive\s*\(")
    if body is None:
        return True, "centerAndFitResponsive() not found — no normalization to guard"
    b = blank_comments(body)
    mult = re.search(r"multiplyScalar\s*\(\s*2(?:\.0+)?\s*\/\s*r0\s*\)", b)
    if not mult:
        return True, "no repeated 2.0/r0 multiply — scale is not re-normalized per fit"
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
    for m in re.finditer(
        r"([A-Za-z_$][\w$.]*(?:[Bb]ase|[Ss]cale|[Ss]ize)[A-Za-z_$\w.]*)\s*=", window
    ):
        latched.add(m.group(1).strip())
    cached = re.search(
        r"\b(?:baseScale|baseSize|baseRadius|baseScaleFactor|cachedScale|cachedBase|"
        r"cachedSize|restScale|restSize|initialScale|origScale|originalScale|_baseScale|normalized)\b",
        window,
        re.I,
    )
    guard_hits = sorted(checked & latched)
    if guard_hits:
        return True, f"multiply is inside a one-time guard: {guard_hits}"
    if cached:
        return True, f"one-time normalization cached via '{cached.group(0)}'"
    return False, (
        "multiplyScalar(2.0 / r0) runs unguarded on every fit — idle-shrink regression"
    )


def check_shared_renderer(js_text: str) -> tuple[bool, str]:
    flat = blank_comments(js_text)
    calls = list(re.finditer(r"\brenderer\s*\.\s*setSize\s*\(", flat))
    if not calls:
        return False, "no active renderer.setSize found — shared renderer setup missing"

    offenders: list[str] = []
    # (1) Explicit per-slot function bodies.
    spans: list[tuple[str, int, int]] = []
    for label, rx in PER_SLOT_FUNCS:
        span = extract_body_span(js_text, rx)
        if span:
            spans.append((label, span[0], span[1]))
    for call in calls:
        for label, start, end in spans:
            if start <= call.start() <= end:
                offenders.append(f"renderer.setSize inside {label}()")

    # (2) Generic: a setSize inside a small enclosing function that touches a
    # slot/canvas is a per-slot resize even if the function has another name.
    for call in calls:
        innermost = None
        for m in re.finditer(r"\{", flat[: call.start()]):
            close = _matching_brace(flat, m.start())
            if close is not None and close >= call.start():
                innermost = (m.start(), close)
        if not innermost:
            continue
        o, c = innermost
        prefix = flat[max(0, o - 160) : o]
        body = flat[o : c + 1]
        if re.search(r"\bfunction\b|=>", prefix) and re.search(
            r"\bslot\b|\.canvas\b|\bs\.canvas\b|\bregisterSlot\b", body
        ):
            tag = f"near offset {call.start()}"
            if tag not in offenders:
                offenders.append(f"per-slot renderer.setSize ({tag})")

    # The one allowed call is the global MAX_W x MAX_H shared setup.
    has_global = any(
        re.search(r"MAX_W|MAX_H", flat[call.end() : call.end() + 80]) for call in calls
    )
    if not has_global:
        offenders.append("no MAX_W/MAX_H shared-renderer setSize found")

    detail = (
        "shared renderer intact — setSize only at global MAX_W x MAX_H setup; "
        "no per-slot setSize"
        if not offenders
        else "SHARED RENDERER BROKEN: " + "; ".join(offenders)
    )
    return not offenders, detail


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    ap.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_JS,
        help="JS file to check (default: public/final-site.js)",
    )
    args = ap.parse_args()

    path = args.file
    try:
        js = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        msg = f"cannot read {path}: {exc}"
        print(json.dumps({"status": "ERROR", "error": msg, "exit_code": 1}) if args.json else f"ERROR: {msg}")
        return 1

    js_flat = blank_comments(js)
    framing_ok, framing_detail, framing = check_framing_present(js_flat)

    v13_span = extract_body_span(js_flat, r"\b" + V13_MAP_NAME + r"\s*=\s*\{")
    v13 = parse_entries(v13_span[2]) if v13_span else {}

    merged = merge_overrides(framing, v13)

    if framing_ok:
        a_ok, a_detail, overridden = check_device_mechanism(merged)
        b_ok, b_detail, effective = check_desktop_fills(merged)
        c_ok, c_detail = check_internals_mobile(merged)
        d_ok, d_detail, frozen_offenders = check_frozen_models(merged, framing, v13)
    else:
        a_ok = b_ok = c_ok = d_ok = False
        a_detail = b_detail = c_detail = d_detail = "blocked: MODEL_FRAMING unreadable"
        overridden, effective, frozen_offenders = [], {}, []

    e_ok, e_detail = check_viewport_selection(js_flat)
    f_ok, f_detail = check_one_time_guard(js)
    g_ok, g_detail = check_shared_renderer(js)

    checks = [
        {"id": "a_model_framing_present", "title": "MODEL_FRAMING parsed", "ok": framing_ok, "detail": framing_detail},
        {"id": "b_device_aware_mechanism", "title": "mobileFill/desktopFill or V13_DEVICE_FILL present", "ok": a_ok, "detail": a_detail},
        {"id": "c_locked_desktop_fills", "title": "TBK/internals/AirPods desktop fill 0.86-0.87", "ok": b_ok, "detail": b_detail},
        {"id": "d_internals_mobile_fill", "title": "canvas-internals mobileFill locked at 0.88", "ok": c_ok, "detail": c_detail},
        {"id": "e_frozen_models_untouched", "title": "no frozen model has a device override", "ok": d_ok, "detail": d_detail},
        {"id": "f_viewport_768_selection", "title": "fit chooses fill by width <768 vs >=768", "ok": e_ok, "detail": e_detail},
        {"id": "g_one_time_normalization", "title": "one-time normalization guard intact", "ok": f_ok, "detail": f_detail},
        {"id": "h_shared_renderer", "title": "shared renderer, no per-slot setSize", "ok": g_ok, "detail": g_detail},
    ]
    ok = all(c["ok"] for c in checks)
    passed = sum(c["ok"] for c in checks)
    result = {
        "script": "v13_lock_guard",
        "status": "PASS" if ok else "FAIL",
        "exit_code": 0 if ok else 1,
        "file": str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
        "locked_spec": {
            "desktop_range": [DESKTOP_MIN, DESKTOP_MAX],
            "internals_mobile": INTERNALS_MOBILE,
            "locked_models": list(DEVICE_LOCKED),
        },
        "effective_desktop_fills": effective,
        "device_overridden_models": overridden,
        "frozen_offenders": frozen_offenders,
        "v13_map_entries": sorted(v13),
        "summary": f"{passed}/{len(checks)} checks passed — " + ("PASS" if ok else "FAIL (v13 device-lock drift)"),
        "checks": checks,
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"v13_lock_guard — {result['file']}")
        for c in checks:
            print(f"  [{'OK ' if c['ok'] else 'BAD'}] {c['id']}: {c['title']}")
            print(f"        {c['detail']}")
        print(result["summary"])
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
