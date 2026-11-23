#!/usr/bin/env python3
"""Live SEO-strike scanner for redmobilerepair.in (stdlib only, urllib — never curl).

Fetches the ten public routes with a Googlebot UA and asserts:
  (a) '/' contains '4.9/5' and does not contain '1.3/5'
  (b) no banned legacy string on any HTML route
      ('90-day', 'No. 1, Mahatma Gandhi Rd', '10:30 AM', 'orange-glass',
       'Authorised Service Centre')
  (c) no duplicate brand pipes in any <title> (multiple '|' or repeated brand)
  (d) robots.txt names Googlebot, GPTBot, PerplexityBot, ClaudeBot, Applebot
  (e) llms.txt contains Bengaluru and 560008
  (f) raw SSR HTML on '/' contains 'data-target="4.9"' and '1,103', and does
      NOT contain '1.3/5' (counter bot-proof)
  (g) source public/final-site.js has NO legacy counter-animation pattern
      ('(now - start) / dur' or 'target * ease') — number animation removed
  (h) source src/app/final-site.css has NO ACTIVE declaration of the retired
      ambient animations (laserDrift|ambientDrift|shimmerLine|gridBreathe|
      sparkleFloat). Commented-out CSS does not count as active.
  (i) HARD GATE: no fetched HTML route serves an X-Robots-Tag response header
      containing 'noindex'/'nofollow', AND every SSR <meta name=robots> contains
      'index'. Grew out of the v8 regression where an x-vercel-deployment-url
      header rule made PRODUCTION serve `noindex, nofollow` and self-deindex.
  (j) HARD GATE: next.config.ts keeps the `host` + *.vercel.app noindex shield
      AND contains NO `has` rule keyed on `x-vercel-deployment-url` (the exact
      regression that fired on the production domain).
  (k) src/app/final-site.css keeps the ambient-orb blank-gap guard:
      `:not(.ambient-orb)` and `.ambient-orb { position: absolute !important`.
  (l) src/lib/final-site-html.ts keeps the v9 price-grid responsive classes
      (`full-price-grid` with grid-cols-1 sm:grid-cols-2 lg:grid-cols-3) and the
      footer grid-cols-1 + break-words email guard.
  (m) public/final-site.js keeps the v9 MODEL_FRAMING + centerAndFitResponsive
      framing implementation.

Checks (a)-(f) reflect deployed live state; (g)-(m) read local repo source.
Prints PASS/FAIL per check, exits 1 on any FAIL.
Gift: --json for machine-readable output (now includes live response headers).

Emergency maintenance: --skip-noindex bypasses ONLY check (i), the live
noindex/nofollow exposure assertion. All strike/SSR/source gates — including
(j) the next.config.ts shield — stay BLOCKING. Predeploy drives this via
ALLOW_NOINDEX_MAINTENANCE=1; default behaviour is unchanged.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_BASE_URL = "https://www.redmobilerepair.in"
GOOGLEBOT_UA = (
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
)
TIMEOUT_SECONDS = 20

# scripts/audit/<file> -> parents[2] is the repo root.
SOURCE_ROOT = Path(__file__).resolve().parents[2]
JS_SOURCE = SOURCE_ROOT / "public" / "final-site.js"
CSS_SOURCE = SOURCE_ROOT / "src" / "app" / "final-site.css"
HTML_SOURCE = SOURCE_ROOT / "src" / "lib" / "final-site-html.ts"
NEXT_CONFIG = SOURCE_ROOT / "next.config.ts"

HTML_ROUTES = (
    "/",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/services/iphone-display-repair",
    "/services/airpods-repair",
    "/quote",
)
TEXT_ROUTES = ("/robots.txt", "/llms.txt", "/sitemap.xml")
ALL_ROUTES = HTML_ROUTES + TEXT_ROUTES  # 10 routes total

BANNED_STRINGS = (
    "90-day",
    "No. 1, Mahatma Gandhi Rd",
    "10:30 AM",
    "orange-glass",
    "Authorised Service Centre",
)
REQUIRED_BOTS = ("Googlebot", "GPTBot", "PerplexityBot", "ClaudeBot", "Applebot")
REQUIRED_LLMS = ("Bengaluru", "560008")

# (f) counter bot-proof tokens in the server-rendered homepage HTML.
REQUIRED_SSR = ('data-target="4.9"', "1,103")
FORBIDDEN_SSR = ("1.3/5",)

TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.IGNORECASE | re.DOTALL)

# (g) legacy counter animation — whitespace-tolerant but pattern-specific.
OLD_COUNTER_PATTERNS = (
    ("(now - start) / dur", re.compile(r"\(\s*now\s*-\s*start\s*\)\s*/\s*dur")),
    ("target * ease", re.compile(r"target\s*\*\s*ease")),
)

# (h) retired ambient animations: only ACTIVE `animation:` declarations count.
CSS_ANIM_NAMES = (
    "laserDrift",
    "ambientDrift",
    "shimmerLine",
    "gridBreathe",
    "sparkleFloat",
)
CSS_COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
CSS_ACTIVE_ANIM_RE = re.compile(
    r"animation(?:-name)?\s*:\s*[^;}]*?\b(" + "|".join(CSS_ANIM_NAMES) + r")\b"
)

# (i) response-header + SSR meta-robots guards.
META_TAG_RE = re.compile(r"<meta\b[^>]*>", re.IGNORECASE)
META_NAME_RE = re.compile(r"\bname\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)
META_CONTENT_RE = re.compile(r"\bcontent\s*=\s*['\"]([^'\"]*)['\"]", re.IGNORECASE)
FORBIDDEN_XROBOTS_TOKENS = ("noindex", "nofollow")

# (j) next.config.ts shield guard. Comments are stripped so the explanatory
# warning comment about the regression cannot itself trip the forbidden rule.
TS_BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
TS_LINE_COMMENT_RE = re.compile(r"//[^\n]*")
# A single rule: has[{key:"host", value:"...vercel.app..."}] ... X-Robots-Tag:noindex
SHIELD_RULE_RE = re.compile(
    r"key\s*:\s*['\"]host['\"]\s*,?\s*value\s*:\s*['\"][^'\"]*vercel\\*\.\\*app[^'\"]*['\"]"
    r"[\s\S]{0,500}?['\"]X-Robots-Tag['\"]\s*,\s*value\s*:\s*['\"][^'\"]*noindex[^'\"]*['\"]",
    re.IGNORECASE,
)
FORBIDDEN_DEPLOY_HEADER_RE = re.compile(r"x-vercel-deployment-url", re.IGNORECASE)

# (k)/(l)/(m) v9 source-gate patterns.
AMBIENT_ORB_NOT_RE = re.compile(r":not\(\s*\.ambient-orb\s*\)")
AMBIENT_ORB_FLOW_RE = re.compile(r"\.ambient-orb\s*\{\s*position:\s*absolute\s*!important")
PRICE_GRID_RE = re.compile(
    r"id=['\"]full-price-grid['\"][^>]*class=['\"][^'\"]*"
    r"grid-cols-1[^'\"]*sm:grid-cols-2[^'\"]*lg:grid-cols-3[^'\"]*['\"]"
)
FOOTER_GRID_RE = re.compile(r"4 Footer Columns[\s\S]{0,200}?grid-cols-1")
EMAIL_BREAK_RE = re.compile(
    r"mailto:support@redmobilerepair\.in['\"][^>]*class=['\"][^'\"]*break-words[^'\"]*['\"]"
)


def headers_to_dict(headers) -> dict[str, str]:
    """Normalise an email.message.Message (or None) to a lower-keyed dict."""
    if not headers:
        return {}
    try:
        return {str(k).lower(): str(v) for k, v in headers.items()}
    except Exception:  # pragma: no cover - defensive
        return {}


def meta_robots_contents(html: str) -> list[str]:
    """Return the content attribute of every <meta name="robots"> tag."""
    contents: list[str] = []
    for tag in META_TAG_RE.findall(html):
        name = META_NAME_RE.search(tag)
        if not name or name.group(1).strip().lower() != "robots":
            continue
        content = META_CONTENT_RE.search(tag)
        contents.append(content.group(1) if content else "")
    return contents


def fetch(
    base_url: str, path: str
) -> tuple[int | None, str, dict[str, str], str | None]:
    """Return (http_status, decoded_body, response_headers, error). Never raises."""
    url = base_url.rstrip("/") + path
    request = Request(
        url,
        headers={"User-Agent": GOOGLEBOT_UA, "Accept": "text/html,text/plain,*/*"},
    )
    try:
        with urlopen(request, timeout=TIMEOUT_SECONDS) as response:  # noqa: S310
            body = response.read().decode("utf-8", errors="replace")
            return response.status, body, headers_to_dict(response.headers), None
    except HTTPError as exc:
        try:
            body = exc.read().decode("utf-8", errors="replace")
        except Exception:  # pragma: no cover - defensive
            body = ""
        return exc.code, body, headers_to_dict(exc.headers), f"HTTP {exc.code}"
    except (URLError, OSError, TimeoutError) as exc:
        return None, "", {}, str(exc)


def snippet(text: str, needle: str, width: int = 60) -> str:
    """Short, escaped context around the first match, for honest reporting."""
    index = text.lower().find(needle.lower())
    if index < 0:
        return ""
    start = max(0, index - width // 2)
    end = min(len(text), index + len(needle) + width // 2)
    return re.sub(r"\s+", " ", text[start:end]).strip()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    parser.add_argument(
        "--skip-noindex",
        action="store_true",
        help="EMERGENCY ONLY: bypass the live noindex exposure check (i); all strike/source gates stay blocking",
    )
    args = parser.parse_args()

    pages: dict[str, dict] = {}
    for path in ALL_ROUTES:
        status, body, headers, error = fetch(args.base_url, path)
        pages[path] = {
            "status": status,
            "body": body,
            "headers": headers,
            "error": error,
        }

    checks: list[dict] = []

    def add(check_id: str, ok: bool, detail: str) -> None:
        checks.append({"id": check_id, "ok": bool(ok), "detail": detail})

    unreachable = [p for p, v in pages.items() if v["error"]]
    add(
        "fetch_all_routes",
        not unreachable,
        f"all {len(ALL_ROUTES)} routes fetched"
        if not unreachable
        else "unreachable: " + ", ".join(
            f"{p} ({pages[p]['error']})" for p in unreachable
        ),
    )

    # (a) rating parity on the homepage
    home = pages["/"]["body"]
    has_good = "4.9/5" in home
    has_bad = "1.3/5" in home
    add(
        "a_rating_4_9",
        has_good and not has_bad,
        "'4.9/5' present=%s, '1.3/5' present=%s" % (has_good, has_bad),
    )

    # (b) banned legacy strings across every HTML route
    banned_hits: list[str] = []
    for path in HTML_ROUTES:
        body = pages[path]["body"]
        for needle in BANNED_STRINGS:
            if needle.lower() in body.lower():
                banned_hits.append(f"{path}: {needle!r} -> ...{snippet(body, needle)}...")
    add(
        "b_no_banned_strings",
        not banned_hits,
        "no banned strings on HTML routes"
        if not banned_hits
        else f"{len(banned_hits)} hit(s): " + " | ".join(banned_hits),
    )

    # (c) duplicate brand pipes in <title> tags
    pipe_hits: list[str] = []
    for path in HTML_ROUTES:
        titles = TITLE_RE.findall(pages[path]["body"])
        if len(titles) != 1:
            pipe_hits.append(f"{path}: found {len(titles)} <title> tags (expected 1)")
            continue
        title = re.sub(r"\s+", " ", titles[0]).strip()
        pipes = title.count("|")
        brand_count = title.lower().count("red apple")
        if pipes > 1 or brand_count > 1:
            pipe_hits.append(
                f"{path}: {title!r} (pipes={pipes}, brand occurrences={brand_count})"
            )
    add(
        "c_no_duplicate_brand_pipes",
        not pipe_hits,
        "one clean <title> per HTML route"
        if not pipe_hits
        else "duplicate brand pipes: " + " | ".join(pipe_hits),
    )

    # (d) robots.txt bot directives
    robots = pages["/robots.txt"]["body"]
    missing_bots = [bot for bot in REQUIRED_BOTS if bot.lower() not in robots.lower()]
    add(
        "d_robots_bots",
        not missing_bots,
        "robots.txt names all 5 bots"
        if not missing_bots
        else "missing from robots.txt: " + ", ".join(missing_bots),
    )

    # (e) llms.txt NAP facts
    llms = pages["/llms.txt"]["body"]
    missing_llms = [fact for fact in REQUIRED_LLMS if fact.lower() not in llms.lower()]
    add(
        "e_llms_nap",
        not missing_llms,
        "llms.txt contains Bengaluru and 560008"
        if not missing_llms
        else "missing from llms.txt: " + ", ".join(missing_llms),
    )

    # (f) counter bot-proof: canonical rating/review must be in raw SSR HTML.
    missing_ssr = [token for token in REQUIRED_SSR if token not in home]
    bad_ssr = [token for token in FORBIDDEN_SSR if token in home]
    f_parts = []
    if missing_ssr:
        f_parts.append("missing SSR token(s): " + ", ".join(repr(t) for t in missing_ssr))
    if bad_ssr:
        f_parts.append("forbidden SSR token(s): " + ", ".join(repr(t) for t in bad_ssr))
    add(
        "f_ssr_counter_botproof",
        not missing_ssr and not bad_ssr,
        'SSR has data-target="4.9" and 1,103; no 1.3/5'
        if not f_parts
        else "; ".join(f_parts),
    )

    # (g) legacy counter animation must be gone from the JS source.
    try:
        js_text = JS_SOURCE.read_text(encoding="utf-8")
        js_error = None
    except OSError as exc:  # pragma: no cover - defensive
        js_text, js_error = "", str(exc)
    if js_error:
        add("g_no_old_counter_js", False, f"cannot read {JS_SOURCE}: {js_error}")
    else:
        js_hits = [label for label, rx in OLD_COUNTER_PATTERNS if rx.search(js_text)]
        add(
            "g_no_old_counter_js",
            not js_hits,
            "no legacy counter animation in public/final-site.js"
            if not js_hits
            else "legacy counter animation pattern(s) still present: "
            + ", ".join(js_hits),
        )

    # (h) retired ambient animations must not be actively declared in CSS.
    try:
        css_text = CSS_SOURCE.read_text(encoding="utf-8")
        css_error = None
    except OSError as exc:  # pragma: no cover - defensive
        css_text, css_error = "", str(exc)
    if css_error:
        add("h_no_active_ambient_css", False, f"cannot read {CSS_SOURCE}: {css_error}")
    else:
        css_active = CSS_COMMENT_RE.sub("", css_text)
        active_animations = sorted(set(CSS_ACTIVE_ANIM_RE.findall(css_active)))
        add(
            "h_no_active_ambient_css",
            not active_animations,
            "no active retired ambient animations in src/app/final-site.css"
            if not active_animations
            else "active animation declaration(s): " + ", ".join(active_animations),
        )

    # (i) HARD GATE — no noindex/nofollow may leak onto a production HTML route.
    # EMERGENCY OVERRIDE: --skip-noindex bypasses ONLY this live noindex check.
    if args.skip_noindex:
        add(
            "i_no_noindex_on_production",
            True,
            "SKIPPED via --skip-noindex (ALLOW_NOINDEX_MAINTENANCE=1) — "
            "live noindex assertions bypassed; all strike/source gates still blocking",
        )
    else:
        i_hits: list[str] = []
        for path in HTML_ROUTES:
            page = pages[path]
            xrobots = page["headers"].get("x-robots-tag", "")
            if any(token in xrobots.lower() for token in FORBIDDEN_XROBOTS_TOKENS):
                i_hits.append(f"{path}: X-Robots-Tag={xrobots!r}")
            contents = meta_robots_contents(page["body"])
            if not contents:
                i_hits.append(f"{path}: missing <meta name=robots>")
            elif not any("index" in c.lower() for c in contents):
                i_hits.append(f"{path}: meta robots={contents!r} lacks 'index'")
        add(
            "i_no_noindex_on_production",
            not i_hits,
            "all HTML routes: no noindex/nofollow header; meta robots contains 'index'"
            if not i_hits
            else "NOINDEX EXPOSURE: " + " | ".join(i_hits),
        )

    # (j) HARD GATE — next.config.ts source must keep the shield and drop the
    # x-vercel-deployment-url rule that caused the v8 deindex regression.
    try:
        config_raw = NEXT_CONFIG.read_text(encoding="utf-8")
        config_error = None
    except OSError as exc:  # pragma: no cover - defensive
        config_raw, config_error = "", str(exc)
    if config_error:
        add(
            "j_noindex_shield_source",
            False,
            f"cannot read {NEXT_CONFIG}: {config_error}",
        )
    else:
        config_code = TS_BLOCK_COMMENT_RE.sub("", config_raw)
        config_code = TS_LINE_COMMENT_RE.sub("", config_code)
        j_problems: list[str] = []
        if not SHIELD_RULE_RE.search(config_code):
            j_problems.append("missing host + *.vercel.app X-Robots-Tag:noindex shield")
        if FORBIDDEN_DEPLOY_HEADER_RE.search(config_code):
            j_problems.append("FORBIDDEN x-vercel-deployment-url has-rule present")
        add(
            "j_noindex_shield_source",
            not j_problems,
            "next.config.ts keeps host/.vercel.app shield and has no x-vercel-deployment-url rule"
            if not j_problems
            else "; ".join(j_problems),
        )

    # (k) ambient-orb blank-gap guard in CSS.
    if css_error:
        add(
            "k_ambient_orb_blank_gap_guard",
            False,
            f"cannot read {CSS_SOURCE}: {css_error}",
        )
    else:
        k_missing: list[str] = []
        if not AMBIENT_ORB_NOT_RE.search(css_text):
            k_missing.append(":not(.ambient-orb)")
        if not AMBIENT_ORB_FLOW_RE.search(css_text):
            k_missing.append(".ambient-orb { position: absolute !important")
        add(
            "k_ambient_orb_blank_gap_guard",
            not k_missing,
            "ambient-orb blank-gap guard present in src/app/final-site.css"
            if not k_missing
            else "missing CSS guard(s): " + ", ".join(k_missing),
        )

    # (l) v9 price-grid + footer layout guard in the SSR HTML template.
    try:
        html_src = HTML_SOURCE.read_text(encoding="utf-8")
        html_error = None
    except OSError as exc:  # pragma: no cover - defensive
        html_src, html_error = "", str(exc)
    if html_error:
        add(
            "l_v9_layout_source",
            False,
            f"cannot read {HTML_SOURCE}: {html_error}",
        )
    else:
        l_missing: list[str] = []
        if not PRICE_GRID_RE.search(html_src):
            l_missing.append(
                "full-price-grid with grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )
        if not FOOTER_GRID_RE.search(html_src):
            l_missing.append("footer grid-cols-1")
        if not EMAIL_BREAK_RE.search(html_src):
            l_missing.append("footer email break-words")
        add(
            "l_v9_layout_source",
            not l_missing,
            "v9 price-grid + footer grid/break-words guard present in final-site-html.ts"
            if not l_missing
            else "missing HTML guard(s): " + ", ".join(l_missing),
        )

    # (m) v9 responsive model framing must remain in the JS source.
    if js_error:
        add(
            "m_v9_model_framing",
            False,
            f"cannot read {JS_SOURCE}: {js_error}",
        )
    else:
        m_missing = [
            token for token in ("MODEL_FRAMING", "centerAndFitResponsive")
            if token not in js_text
        ]
        add(
            "m_v9_model_framing",
            not m_missing,
            "MODEL_FRAMING + centerAndFitResponsive present in public/final-site.js"
            if not m_missing
            else "missing JS token(s): " + ", ".join(m_missing),
        )

    violations = [c["detail"] for c in checks if not c["ok"]]
    ok = not violations
    result = {
        "ok": ok,
        "base_url": args.base_url,
        "user_agent": GOOGLEBOT_UA,
        "noindex_skipped": bool(args.skip_noindex),
        "routes_checked": list(ALL_ROUTES),
        "statuses": {p: pages[p]["status"] for p in ALL_ROUTES},
        "response_headers": {p: pages[p]["headers"] for p in ALL_ROUTES},
        "source_files": {
            "js": str(JS_SOURCE),
            "css": str(CSS_SOURCE),
            "html": str(HTML_SOURCE),
            "next_config": str(NEXT_CONFIG),
        },
        "checks": checks,
        "violations": violations,
    }

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"SEO strike scanner ({args.base_url}) — " + ("PASS" if ok else "FAIL"))
        for check in checks:
            print(f"  [{'OK ' if check['ok'] else 'BAD'}] {check['id']}: {check['detail']}")
        if violations:
            print("\nVIOLATIONS:")
            for violation in violations:
                print(f"  - {violation}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
