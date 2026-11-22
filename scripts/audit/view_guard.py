#!/usr/bin/env python3
"""Static regression guard for the v15 "view" fixes (stdlib only, read-only).

Faisu asked for a guard that FAILS (exit 1) if any of these land/regress wrongly:

  (a) AirPods stage in src/lib/final-site-html.ts MUST carry `lg:col-span-7`
      (the narrow-sliver bug: the stage column was too narrow).
  (b) Footer LIGHT theme:
        - src/app/final-site.css contains `.footer-light-modern`
        - the live footer wrapper in final-site-html.ts uses it
        - dark `.footer-neon-obsidian` is NOT on the live footer wrapper
  (c) 3D fills in public/final-site.js:
        - machine canvases (canvas-tbk-oca / -90l / -958) fill <= 0.90 (was 0.95)
        - hero (canvas-hero) fill >= 0.96 (was 0.95)
        - airpods fill in [0.84, 0.92]
        - macbook fill <= 0.96
        - iPad rotZ still present (config + application)
        - v14 one-time normalization guard still present
  (d) >= 10 zero-load effect comment markers in final-site.css
      (lines starting with `/* ZLE` OR containing `zero-load`).

Intended use: predeploy/CI. Against the pre-fix source this is EXPECTED TO FAIL;
once FE-1 / FaiCodex land their edits it must go green.

GIFT: `--json` machine-readable granular report + `--html/--css/--js` file
overrides for safe testing against alternate copies without touching production.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_HTML = ROOT / "src" / "lib" / "final-site-html.ts"
DEFAULT_CSS = ROOT / "src" / "app" / "final-site.css"
DEFAULT_JS = ROOT / "public" / "final-site.js"

EPS = 1e-9
MACHINE_CANVASES = ("canvas-tbk-oca", "canvas-tbk-90l", "canvas-tbk-958")


def read_text(path: Path) -> str:
    """Read UTF-8 with replacement so odd glyphs never abort the guard."""
    try:
        return path.read_bytes().decode("utf-8", errors="replace")
    except OSError as exc:  # missing/unreadable file
        return ""


def token(tag_or_text: str, name: str) -> bool:
    """True if `name` appears as a whole dash/word token (not a prefix/suffix)."""
    return re.search(r"(?<![-\w])" + re.escape(name) + r"(?![-\w])", tag_or_text) is not None


def nearest_opening_div_window(text: str, anchor_idx: int) -> str:
    """Text from the nearest `<div ...` opening before anchor_idx up to anchor.

    This captures the stage wrapper tag that immediately precedes a canvas.
    """
    matches = list(re.finditer(r"<div\b", text[:anchor_idx]))
    if not matches:
        return ""
    return text[matches[-1].start():anchor_idx]


def get_footer_tag(html: str) -> str:
    m = re.search(r"<footer\b[^>]*>", html)
    return m.group(0) if m else ""


def model_framing_entries(js: str) -> dict[str, dict]:
    """Parse MODEL_FRAMING into {canvas_id: {'fill': float|None, 'rotZ': bool}}."""
    start = js.find("MODEL_FRAMING")
    if start < 0:
        return {}
    brace = js.find("{", start)
    if brace < 0:
        return {}
    # balanced-brace scan (config is small; no nested braces in these entries)
    depth, end = 0, brace
    for i in range(brace, len(js)):
        if js[i] == "{":
            depth += 1
        elif js[i] == "}":
            depth -= 1
            if depth == 0:
                end = i
                break
    block = js[brace:end + 1]
    out: dict[str, dict] = {}
    for m in re.finditer(r"['\"](canvas-[\w-]+)['\"]\s*:\s*\{([^}]*)\}", block):
        cid, body = m.group(1), m.group(2)
        fm = re.search(r"\bfill\s*:\s*([0-9]*\.?[0-9]+)", body)
        out[cid] = {
            "fill": float(fm.group(1)) if fm else None,
            "rotZ": re.search(r"\brotZ\s*:", body) is not None,
            "raw": " ".join(body.split()),
        }
    return out


# --------------------------------------------------------------------------- #
# Checks. Each returns (ok: bool, expected: str, found: str, detail: str).
# --------------------------------------------------------------------------- #
def check_a(html: str):
    idx = html.find("canvas-airpods")
    if idx < 0:
        return False, "lg:col-span-7 on AirPods stage", "canvas-airpods not found", "canvas-airpods anchor missing"
    window = nearest_opening_div_window(html, idx)
    ok = token(window, "lg:col-span-7")
    found = "lg:col-span-7 present" if ok else "lg:col-span-7 MISSING"
    return ok, "stage wrapper has lg:col-span-7", found, "nearest <div> before canvas-airpods: " + (window.strip()[:180] or "<none>")


def check_b(css: str, html: str):
    results = []
    has_css = re.search(r"\.footer-light-modern\b", css) is not None
    results.append(("B1 css has .footer-light-modern", has_css,
                    "CSS defines .footer-light-modern",
                    ".footer-light-modern present" if has_css else "selector absent",
                    "checked src/app/final-site.css"))

    tag = get_footer_tag(html)
    has_light = token(tag, "footer-light-modern") if tag else False
    results.append(("B2 footer wrapper uses .footer-light-modern", has_light,
                    "live <footer> has footer-light-modern",
                    "applied" if has_light else ("footer tag not found" if not tag else "NOT applied"),
                    tag[:200] or "no <footer> element"))

    has_dark = token(tag, "footer-neon-obsidian") if tag else False
    results.append(("B3 dark footer-neon-obsidian NOT on wrapper", not has_dark,
                    "live <footer> must NOT have footer-neon-obsidian",
                    "still applied" if has_dark else ("footer tag not found" if not tag else "absent (good)"),
                    tag[:200] or "no <footer> element"))
    return results


def _fill_result(label, cid, entries, predicate, expected):
    ent = entries.get(cid)
    if ent is None or ent["fill"] is None:
        return (label, False, expected, f"{cid} missing / no fill", "MODEL_FRAMING entry absent or malformed")
    found = ent["fill"]
    ok = predicate(found)
    return (label, ok, expected, f"{cid} fill={found}", ent["raw"])


def check_c(js: str):
    entries = model_framing_entries(js)
    results = []

    for cid in MACHINE_CANVASES:
        results.append(_fill_result(f"C machine {cid} fill<=0.90", cid, entries,
                                    lambda v: v <= 0.90 + EPS, "<= 0.90"))

    results.append(_fill_result("C hero fill>=0.96", "canvas-hero", entries,
                                lambda v: v >= 0.96 - EPS, ">= 0.96"))

    results.append(_fill_result("C airpods fill in [0.84,0.92]", "canvas-airpods", entries,
                                lambda v: 0.84 - EPS <= v <= 0.92 + EPS, "0.84..0.92"))

    results.append(_fill_result("C macbook fill<=0.96", "canvas-macbook", entries,
                                lambda v: v <= 0.96 + EPS, "<= 0.96"))

    ipad = entries.get("canvas-estimate-ipad", {})
    rot_cfg = bool(ipad.get("rotZ"))
    rot_apply = re.search(r"root\.rotation\.z\s*=\s*cfg\.rotZ", js) is not None
    results.append(("C iPad rotZ present (config + apply)", rot_cfg and rot_apply,
                    "ipad cfg.rotZ + root.rotation.z=cfg.rotZ",
                    f"cfg={rot_cfg}, apply={rot_apply}",
                    ipad.get("raw", "no ipad entry")))

    guard_cond = re.search(r"!\s*root\.userData\.normalized", js) is not None
    guard_set = re.search(r"root\.userData\.normalized\s*=\s*true", js) is not None
    results.append(("C one-time normalization guard present", guard_cond and guard_set,
                    "!normalized guard + normalized=true",
                    f"guard={guard_cond}, set={guard_set}",
                    "v14 one-time normalization must survive the fill edits"))
    return results


def check_d(css: str):
    marker = re.compile(r"^\s*/\*\s*ZLE\b", re.IGNORECASE)
    found = [ln for ln in css.splitlines() if marker.match(ln) or "zero-load" in ln.lower()]
    ok = len(found) >= 10
    return ok, ">= 10 zero-load markers", f"{len(found)} found", "lines starting '/* ZLE' or containing 'zero-load'"


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Static view-regression guard (stdlib, read-only).")
    ap.add_argument("--json", action="store_true", help="emit a machine-readable JSON report")
    ap.add_argument("--html", type=Path, default=DEFAULT_HTML, help="override final-site-html.ts path")
    ap.add_argument("--css", type=Path, default=DEFAULT_CSS, help="override final-site.css path")
    ap.add_argument("--js", type=Path, default=DEFAULT_JS, help="override final-site.js path")
    args = ap.parse_args(argv)

    html = read_text(args.html)
    css = read_text(args.css)
    js = read_text(args.js)

    checks: list[dict] = []

    def add(cid, label, ok, expected, found, detail):
        checks.append({"id": cid, "label": label, "ok": bool(ok),
                       "expected": expected, "found": found, "detail": detail})

    ok, exp, found, detail = check_a(html)
    add("A", "AirPods stage lg:col-span-7", ok, exp, found, detail)

    for label, ok, exp, found, detail in check_b(css, html):
        add(label.split()[0], label, ok, exp, found, detail)

    for n, (label, ok, exp, found, detail) in enumerate(check_c(js), start=1):
        add(f"C{n}", label, ok, exp, found, detail)

    ok, exp, found, detail = check_d(css)
    add("D", "zero-load effect markers", ok, exp, found, detail)

    passed = sum(1 for c in checks if c["ok"])
    total = len(checks)
    result = "PASS" if passed == total else "FAIL"

    files = {"html": str(args.html), "css": str(args.css), "js": str(args.js)}

    if args.json:
        print(json.dumps({"tool": "view_guard", "result": result,
                          "passed": passed, "total": total,
                          "files": files, "checks": checks}, indent=2))
    else:
        print("=" * 64)
        print("VIEW GUARD — static regression check (read-only)")
        print("=" * 64)
        for c in checks:
            mark = "PASS" if c["ok"] else "FAIL"
            print(f"  [{mark}] {c['id']:>3} | {c['label']}")
            print(f"         expected: {c['expected']}")
            print(f"         found:    {c['found']}")
        print("-" * 64)
        print(f"RESULT: {result}  ({passed}/{total} checks passed)")
        if result == "FAIL":
            print("Regressions detected — fixes (FE-1 / FaiCodex) not fully landed yet.")
        print("Files: " + ", ".join(files.values()))

    return 0 if result == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
