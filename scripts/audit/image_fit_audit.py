#!/usr/bin/env python3
"""Audit image aspect-ratio handling (the 2026-11-22 strip-fix / no-crop rules).

Hard rules (non-zero exit on violation):
  (a) `.studio-photo-frame img` defaults to object-fit: cover
  (b) `.studio-photo-frame.machine-frame img` scopes to object-fit: contain
  (c) exactly 3 machine wrappers carry the `machine-frame` class

Advisory only (never fails the audit):
  (d) gallery natural WxH ratios + extreme-portrait flag (h/w >= 1.5)

Gift: `--json` for machine-readable output.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSS = ROOT / "src/app/final-site.css"
HTML = ROOT / "src/lib/final-site-html.ts"
GALLERY = ROOT / "public/images/gallery"

PORTRAIT_FLAG = 1.5  # h/w; taller than 3:2 may still need object-position tuning
EXPECTED_WRAPPERS = 3


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def css_object_fit(css: str, selector: str) -> str | None:
    """Return the object-fit value declared for an exact CSS selector."""
    pattern = re.compile(r"(?m)(?:^|\})\s*" + re.escape(selector) + r"\s*\{([^}]*)\}")
    match = pattern.search(css)
    if not match:
        return None
    value = re.search(r"object-fit\s*:\s*([a-z-]+)", match.group(1))
    return value.group(1) if value else None


def count_machine_wrappers(html: str) -> int:
    count = 0
    for match in re.finditer(r'class="([^"]*)"', html):
        classes = set(match.group(1).split())
        if {"studio-photo-frame", "machine-frame"} <= classes:
            count += 1
    return count


def gallery_report() -> list[dict]:
    try:
        from PIL import Image
    except ImportError:
        Image = None

    rows: list[dict] = []
    files = sorted(p for p in GALLERY.iterdir() if p.is_file()) if GALLERY.exists() else []
    for path in files:
        row: dict = {"file": path.name}
        if Image is None:
            row["error"] = "Pillow unavailable — dimensions skipped"
        else:
            try:
                with Image.open(path) as img:
                    w, h = img.size
                row.update(
                    w=w,
                    h=h,
                    ratio=round(h / w, 3) if w else None,
                    orientation="portrait" if h > w else "landscape" if w > h else "square",
                    extreme_portrait=bool(w and h / w >= PORTRAIT_FLAG),
                )
            except Exception as exc:  # unreadable / unsupported file -> advisory
                row["error"] = str(exc)
        rows.append(row)
    return rows


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = parser.parse_args()

    css = html = ""
    read_errors: list[str] = []
    for label, path in (("css", CSS), ("html", HTML)):
        try:
            if label == "css":
                css = read(path)
            else:
                html = read(path)
        except OSError as exc:
            read_errors.append(f"{path.relative_to(ROOT)}: {exc}")

    cover = css_object_fit(css, ".studio-photo-frame img")
    contain = css_object_fit(css, ".studio-photo-frame.machine-frame img")
    wrappers = count_machine_wrappers(html)

    checks = [
        {"id": "a_default_cover", "ok": cover == "cover",
         "detail": f".studio-photo-frame img -> {cover!r} (expected 'cover')"},
        {"id": "b_machine_contain", "ok": contain == "contain",
         "detail": f".studio-photo-frame.machine-frame img -> {contain!r} (expected 'contain')"},
        {"id": "c_three_machine_wrappers", "ok": wrappers == EXPECTED_WRAPPERS,
         "detail": f"machine-frame wrappers: {wrappers} (expected {EXPECTED_WRAPPERS})"},
    ]
    for err in read_errors:
        checks.append({"id": "read_error", "ok": False, "detail": err})

    gallery = gallery_report()
    flagged = [r["file"] for r in gallery if r.get("extreme_portrait")]

    violations = [c["detail"] for c in checks if not c["ok"]]
    ok = not violations
    result = {"ok": ok, "checks": checks, "gallery": gallery,
              "extreme_portrait_flags": flagged, "portrait_threshold": PORTRAIT_FLAG,
              "violations": violations}

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print("Image fit audit — " + ("PASS" if ok else "FAIL"))
        for c in checks:
            print(f"  [{'OK ' if c['ok'] else 'BAD'}] {c['id']}: {c['detail']}")
        print(f"\nGallery ({len(gallery)} images, portrait flag h/w >= {PORTRAIT_FLAG}):")
        for r in gallery:
            if "error" in r:
                print(f"  {r['file']}: ERROR {r['error']}")
            else:
                mark = "  <== extreme portrait, check object-position" if r["extreme_portrait"] else ""
                print(f"  {r['file']}: {r['w']}x{r['h']} h/w={r['ratio']} {r['orientation']}{mark}")
        print(f"\nExtreme-portrait flags (advisory): {', '.join(flagged) or 'none'}")
        if violations:
            print("\nVIOLATIONS:")
            for v in violations:
                print(f"  - {v}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
