#!/usr/bin/env python3
"""STATIC ZLE-V16 smoothness guard for final-site.css. Stdlib only, read-only.

Blocks a regression into the zero-jitter ("ZLE-V16") animation baseline. It
FAILS (exit 1) when any of these hold:

  1. A *large, full-width ambient* element has an ACTIVE animation whose
     keyframe animates `transform` or `opacity` (continuous motion / repaint on
     a full-bleed layer). Elements with `animation: none` are always safe.
  2. Any `@keyframes` block animates `filter` or `blur(...)` (paint-blur in a
     hot animation loop).
  3. `animation: ... infinite` is active on a selector that must be STATIC:
     `.heading-breathe`, the ticker/marquee, `.studio-cap-*`,
     `.studio-glass-band`, `.studio-tag`.

It also requires >=10 `ZLE-V16` markers (proof the neutralization block is
still present) and NO `orange-glass` residue in active CSS.

Notes:
  - Small, non-ambient opacity pulses (e.g. the live-status `.pulse-ring`
    using `pulseOpacityV16`) are intentional and are NOT flagged.
  - Orphaned keyframes that no element references carry zero runtime cost and
    do not trigger check (1); only *active* references matter.

Gift: --json for machine-readable output and --file to check a scratch copy.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CSS = ROOT / "src" / "app" / "final-site.css"

MIN_MARKERS = 10

# Selectors describing large / full-width / full-bleed ambient decoration.
# Deliberately does NOT include "ring": the small live-status pulse-ring is
# allowed to run an opacity-only pulse.
AMBIENT_RX = re.compile(
    r"ambient|breathe|marquee|stage-3d|glow|laser|aura|spectrum|shimmer|"
    r"orange-bg|color-shift|\borbs?\b|full-?width|\bband\b|\btrack\b|"
    r"\bwash\b|\bbeam\b|backdrop",
    re.I,
)

# Selectors that must be completely static (no infinite animation).
STATIC_RX = re.compile(
    r"heading-breathe|ticker|marquee|studio-cap|studio-glass-band|studio-tag",
    re.I,
)

_KEYFRAMES_RE = re.compile(r"@(?:-webkit-)?keyframes\s+([\w-]+)\s*\{", re.I)
_ANIM_RE = re.compile(r"\banimation(?:-name)?\s*:\s*([^;!]+)", re.I)
_TRANSFORM_RE = re.compile(r"\btransform\s*:", re.I)
_OPACITY_RE = re.compile(r"\bopacity\s*:", re.I)
_FILTER_RE = re.compile(r"\bfilter\s*:|\bblur\s*\(", re.I)


# --------------------------------------------------------------------------- #
# Minimal CSS helpers.
# --------------------------------------------------------------------------- #
def blank_comments(text: str) -> str:
    """Blank /* ... */ bodies (keep newlines/length) so regexes see active CSS."""
    out = list(text)
    i, n = 0, len(text)
    state = "code"
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ""
        if state == "code":
            if c == "/" and nxt == "*":
                state = "block"
                out[i] = out[i + 1] = " "
                i += 2
                continue
        elif state == "block":
            if c == "*" and nxt == "/":
                out[i] = out[i + 1] = " "
                state = "code"
                i += 2
                continue
            if c != "\n":
                out[i] = " "
        i += 1
    return "".join(out)


def _blocks(text: str) -> list[tuple[str, str]]:
    """Return (selector, body) for every {...} block at this brace level."""
    results: list[tuple[str, str]] = []
    i, n = 0, len(text)
    boundary = 0
    while i < n:
        c = text[i]
        if c == ";":
            boundary = i + 1
            i += 1
            continue
        if c == "{":
            selector = text[boundary:i].strip()
            depth = 0
            j = i
            quote = None
            while j < n:
                ch = text[j]
                if quote:
                    if ch == "\\":
                        j += 2
                        continue
                    if ch == quote:
                        quote = None
                else:
                    if ch in ('"', "'"):
                        quote = ch
                    elif ch == "{":
                        depth += 1
                    elif ch == "}":
                        depth -= 1
                        if depth == 0:
                            break
                j += 1
            body = text[i + 1 : j] if j < n else text[i + 1 :]
            results.append((selector, body))
            boundary = j + 1
            i = j + 1
            continue
        i += 1
    return results


def iter_rules(css: str):
    """Yield (selector, declarations) for normal rules, descending into at-rules."""
    for selector, body in _blocks(css):
        if selector.startswith("@"):
            yield from iter_rules(body)
        else:
            yield selector, body


def parse_keyframes(css: str) -> dict[str, dict]:
    kfs: dict[str, dict] = {}
    for m in _KEYFRAMES_RE.finditer(css):
        open_idx = css.find("{", m.start())
        if open_idx < 0:
            continue
        depth = 0
        j = open_idx
        while j < len(css):
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        body = css[open_idx + 1 : j]
        kfs[m.group(1)] = {
            "transform": bool(_TRANSFORM_RE.search(body)),
            "opacity": bool(_OPACITY_RE.search(body)),
            "filter": bool(_FILTER_RE.search(body)),
        }
    return kfs


def animation_parts(decls: str) -> list[str]:
    """Return active animation shorthand parts (drops `none` components)."""
    parts: list[str] = []
    for decl in _ANIM_RE.finditer(decls):
        for raw in decl.group(1).split(","):
            part = raw.strip()
            if not part or re.match(r"^none\b", part, re.I):
                continue
            parts.append(part)
    return parts


def referenced_keyframes(part: str, kfs: dict[str, dict]) -> list[str]:
    return [
        name
        for name in kfs
        if re.search(r"\b" + re.escape(name) + r"\b", part, re.I)
    ]


# --------------------------------------------------------------------------- #
# Checks.
# --------------------------------------------------------------------------- #
def check_filter_keyframes(kfs: dict[str, dict]) -> tuple[bool, str, list[str]]:
    bad = sorted(name for name, flags in kfs.items() if flags["filter"])
    detail = (
        "no @keyframes animates filter/blur"
        if not bad
        else "FILTER/BLUR keyframes active: " + ", ".join(bad)
    )
    return not bad, detail, bad


def check_ambient_active(
    rules: list[tuple[str, str]], kfs: dict[str, dict]
) -> tuple[bool, str, list[str]]:
    bad: list[str] = []
    for selector, decls in rules:
        if not AMBIENT_RX.search(selector):
            continue
        for part in animation_parts(decls):
            for name in referenced_keyframes(part, kfs):
                flags = kfs[name]
                if flags["transform"] or flags["opacity"]:
                    hit = f"{selector} -> {name}"
                    if hit not in bad:
                        bad.append(hit)
    detail = (
        "no large full-width ambient element runs a transform/opacity keyframe"
        if not bad
        else "AMBIENT MOTION: " + "; ".join(bad)
    )
    return not bad, detail, bad


def check_static_selectors(rules: list[tuple[str, str]]) -> tuple[bool, str, list[str]]:
    bad: list[str] = []
    for selector, decls in rules:
        if not STATIC_RX.search(selector):
            continue
        for part in animation_parts(decls):
            if re.search(r"\binfinite\b", part, re.I):
                hit = f"{selector} -> {part}"
                if hit not in bad:
                    bad.append(hit)
    detail = (
        "heading-breathe / ticker / studio-cap-* / studio-glass-band / studio-tag static"
        if not bad
        else "INFINITE ANIMATION on static selector: " + "; ".join(bad)
    )
    return not bad, detail, bad


def check_markers(raw: str) -> tuple[bool, str, int]:
    count = raw.count("ZLE-V16")
    return (
        count >= MIN_MARKERS,
        f"ZLE-V16 markers: {count} (need >= {MIN_MARKERS})",
        count,
    )


def check_no_orange_glass(css_active: str) -> tuple[bool, str, int]:
    count = len(re.findall(r"orange-glass", css_active, re.I))
    return (
        count == 0,
        f"orange-glass residue in active CSS: {count}",
        count,
    )


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    ap.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_CSS,
        help="CSS file to check (default: src/app/final-site.css)",
    )
    args = ap.parse_args()

    path = args.file
    try:
        raw = path.read_text(encoding="utf-8", errors="replace").replace("\x00", "")
    except OSError as exc:
        msg = f"cannot read {path}: {exc}"
        print(
            json.dumps({"status": "ERROR", "error": msg, "exit_code": 1})
            if args.json
            else f"ERROR: {msg}"
        )
        return 1

    active = blank_comments(raw)
    kfs = parse_keyframes(active)
    rules = list(iter_rules(active))

    a_ok, a_detail, filter_kfs = check_filter_keyframes(kfs)
    b_ok, b_detail, ambient_bad = check_ambient_active(rules, kfs)
    c_ok, c_detail, static_bad = check_static_selectors(rules)
    d_ok, d_detail, markers = check_markers(raw)
    e_ok, e_detail, residue = check_no_orange_glass(active)

    checks = [
        {"id": "a_no_filter_blur_keyframes", "title": "no filter/blur keyframes", "ok": a_ok, "detail": a_detail},
        {"id": "b_no_ambient_transform_opacity", "title": "no ambient full-width transform/opacity motion", "ok": b_ok, "detail": b_detail},
        {"id": "c_static_heading_ticker_cap_glass_tag", "title": "heading/ticker/cap/glass-band/tag have no infinite animation", "ok": c_ok, "detail": c_detail},
        {"id": "d_zle_markers", "title": f">={MIN_MARKERS} ZLE-V16 markers present", "ok": d_ok, "detail": d_detail},
        {"id": "e_no_orange_glass", "title": "no orange-glass residue in active CSS", "ok": e_ok, "detail": e_detail},
    ]
    ok = all(c["ok"] for c in checks)
    passed = sum(c["ok"] for c in checks)
    result = {
        "script": "smoothness_guard",
        "status": "PASS" if ok else "FAIL",
        "exit_code": 0 if ok else 1,
        "file": str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
        "keyframes": {k: v for k, v in sorted(kfs.items())},
        "filter_keyframes": filter_kfs,
        "ambient_motion_offenders": ambient_bad,
        "static_selector_offenders": static_bad,
        "zle_v16_markers": markers,
        "orange_glass_residue": residue,
        "summary": f"{passed}/{len(checks)} checks passed — " + ("PASS" if ok else "FAIL (ZLE-V16 smoothness regression)"),
        "checks": checks,
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"smoothness_guard — {result['file']}")
        for c in checks:
            print(f"  [{'OK ' if c['ok'] else 'BAD'}] {c['id']}: {c['title']}")
            print(f"        {c['detail']}")
        print(result["summary"])
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
