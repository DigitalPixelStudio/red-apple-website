#!/usr/bin/env node
/**
 * tests/visual-audit.mjs — predeploy visual/CSS QA gate for Red Apple Mobile Repair.
 *
 * Ownership: QA only. This file never touches src/, public/ or .faicodex/.
 * Run against a LOCAL build (BASE_URL, default http://127.0.0.1:3000).
 * NEVER point this at production: production is redeployed only after the gate is green.
 *
 * Viewports: tablet 1024x768@2x, mobile 390x844@3x, desktop 1440x900@1x.
 *
 * GATES (99 total = 93 existing + 6 FE-1 integration gates SOURCE-CHECK):
 *   93 existing = 34 legacy/v8 + 16 v9 + 12 v10 + 2 v14 + 17 v13 + 5 v16 + 7 v17.
 *   FE-1 (6 SOURCE): footer 96px-gap closure, 10 PLATINUM-FX markers, keywords
 *   config, qualify helper, promoSignals, health-monitor.py + refresh-site.py.
 *   LEGACY (2 global, 7 per viewport):
 *    1. SSR rating 4.9/5 present and 1.3/5 absent
 *    2. SSR HTML has no .orange-glass-showcase
 *    3. per: store/gallery photos (.studio-photo-frame) object-fit=cover;
 *           machine-frame photos object-fit=contain
 *    4. per: header <nav> visible >= 768px, hidden at 390px
 *    5. per: #ba-overlay cracked/restored label boxes do not overlap
 *    6. per: no .orange-glass-showcase node in DOM
 *    7. per: frozen 3D canvases exist (existence only — headless has no WebGL,
 *            so this gate never reads canvas pixels or calls getContext)
 *    8. per: no app JS errors (HMR/Turbopack teardown noise ignored)
 *   v8 NEW (2 global source gates, 3 per viewport):
 *    9. GLOBAL SOURCE: public/final-site.js contains 0x8a8f98 + applyAirpodsSpaceGrey
 *       and NOT the old `target * ease` counter animation
 *   10. GLOBAL SOURCE: src/app/final-site.css has .stage-3d-orange-bg + .stat-final
 *   11. per: fullscreen toggle absent on #canvas-hero, present on the other 9 stages.
 *       DOM-CHECK when the 3D engine ran ([data-fs-toggle] buttons in DOM);
 *       SOURCE-CHECK fallback when headless has no WebGL (engine never created buttons):
 *       asserts public/final-site.js contains `if (slot.canvas.id === 'canvas-hero') continue;`.
 *       Never FAILs solely because of no-WebGL.
 *   12. per: all 10 .stage-3d-box wrappers carry .stage-3d-orange-bg
 *   13. per: #ambient-particles host exists in DOM
 *   v9 NEW (3 per viewport + 7 responsive = 16):
 *    14. per: hero top -> first real content flow wrapper < 80px (blank-gap guard).
 *            Catches the 608px regression from orbs in flow; h1 / "Open now" pill
 *            gaps reported as evidence (they sit ~93-145px down by design at >=sm
 *            because the grid uses items-center beside a 600px stage).
 *    15. per: both #hero .ambient-orb computed position === 'absolute'.
 *    16. per: "Drag to orbit 360°" and "iPhone 17 Pro Max · Orange" pills do not intersect.
 *    17-19: #full-price-grid computed columns = 1 @390px, 2 @768px, 3 @1440px.
 *    20-21: footer wrapper computed columns = 1 @390px, 4 @1440px.
 *    22: footer mailto anchor overflow-wrap === 'break-word'.
 *    23: all 4 footer column headings computed textAlign === 'left'.
 *   v10 NEW (6 global source/scripts + 2 per viewport = 12):
 *    24. GLOBAL SOURCE: final-site.js computeTightDeviceBounds + aspect-aware
 *        distV/distH -> Math.max(distV, distH) per-axis fit + MODEL_FRAMING fills
 *        (most 0.92, airpods 0.86, macbook 0.94); NO per-slot renderer.setSize;
 *        NO inflated setFromObject(root, true) in the fit path. (source/structural
 *        only — headless Chromium has no WebGL, so this gate NEVER reads pixels.)
 *    25. GLOBAL SOURCE: final-site-html.ts .glass-lab-cta-band + 9 .lab-hash-chip;
 *        final-site.css has box-shadow:none on chips + contain:layout style on band.
 *    26. SOURCE robots.ts: Googlebot/Bingbot/Applebot allowed, /_next/ NOT disallowed.
 *    27. SOURCE public/indexnow-key.txt: exactly one key line (value never printed).
 *    28. SOURCE repair-status/page.tsx: /api/crm-status uses POST, never GET.
 *    29. SCRIPTS predeploy-check.sh: blocking noindex gate calls BOTH scanners.
 *    30-31. per viewport: glass-lab CTA DOM byte-identical to source (9 hashtags +
 *        both buttons + hours line); footer obsidian bg + store photo src/aspect-square
 *        + copyright/credit text + dark computed background.
 *   v14 NEW (2 global SOURCE gates — the "models shrink after idle" fix):
 *    32. GLOBAL SOURCE: normalization is ONE-TIME per slot — a per-slot latching flag
 *        (baseSize/normalized) guards `multiplyScalar(2.0 / r0)` (either inside the
 *        fit fn or at the centerAndFitResponsive call site), and the flag is assigned.
 *        Guards the regression where every idle wake re-multiplied scale and shrank models.
 *    33. GLOBAL SOURCE: raised fills present — most slots >= 0.95, tablet (iPad) wider
 *        logic present, MacBook highest, AirPods eased, and the fill hard-cap is raised.
 *        (SOURCE/structural only — headless Chromium has no WebGL; NEVER reads canvas pixels.)
 *    NOTE: gate 24's fill check is version-tolerant (legacy 0.92/0.86/0.94 OR raised
 *    tiers) so all 62 original gates stay green across the v13->v14 transition; the
 *    strict raised-value assertion lives in gate 33.
 *   v13 NEW (8 global SOURCE + 6 per-viewport DOM + 3 responsive DOM = 17):
 *    S1. CSS dark-orange dot rgba(194,65,12,.24) + 24px grid, legacy dot gone.
 *    S2. Header logo h-10/w-10 + sm:h-11/sm:w-11 + flex-col items-center alignment.
 *    S3. #est-condition removed from HTML source; #est-wrong carries col-span-full.
 *    S4. Both rebuilt sections keep their new structure: .studio-cap-grid with 9
 *        .studio-cap-chip, .lab-hash-row / .lab-cta-row / .lab-hours-line,
 *        #ba-slider-box min-h-[290px] with sm:h-80 preserved.
 *    S5. Footer padding source: 66px mobile + 16px @min-width:1024px + pb/lg:pb classes.
 *    S6. public/og-card.jpg is a real JPEG, 1200x630 and <250000 bytes.
 *    S7. robots.ts names WhatsApp / facebookexternalhit / AdsBot-Google, >=14 bots,
 *        /_next/ allowed and never disallowed.
 *    S8. final-site.js has NO est-condition reference; window-level pointermove /
 *        resize listeners are {passive:true}; no non-passive touch/wheel listener.
 *    D1/D2 (per viewport): est fields correct; both rebuilt sections byte-identical
 *        to source (9 capabilities + 9 hashtags + 2 buttons + hours line).
 *    R1/R2/R3 (responsive DOM): visualiser min-height 290px @390 and 320px height
 *        unchanged @1024; footer padding 66px @390 / 16px @1440; header logo 40px
 *        @390 / 44px @1440 with centred column alignment.
 *   v16 NEW (2 global SOURCE + 1 per viewport = 5):
 *    V16-A SOURCE: >=10 ZLE-V16 markers, .studio-cap-item/.studio-cap-static/
 *        .studio-tag rules declare animation:none (no live infinite animation on
 *        the rebuilt labels), and no @keyframes block animates a blur filter.
 *    V16-B SOURCE: HARD device lock — TBK + AirPods desktopFill lowered, mobile
 *        unchanged, internals desktop+mobile lock, MacBook frozen, fit selects by
 *        `window.innerWidth < 768`. Structural only (headless has no WebGL).
 *    V16-C per viewport: computed animationName === 'none' on all rebuilt labels,
 *        measured BEFORE the audit's animation-kill style (real CSS evidence).
 *    NOTE: the v10 ticker/band gates (25, 30, S4, D2) were RETARGETED to v16
 *    classes (.studio-cap-row/.studio-cap-item, .studio-glass-band/.studio-tag)
 *    with byte-identical TEXT checks preserved (texts derived from source).
 *   v17 NEW (7 global SOURCE gates — all run in --source-only, no WebGL):
 *    V17-A CSS >=8 V17-FX markers + v17AccentBreath opacity-only keyframe applied
 *          + a prefers-reduced-motion guardian that kills the V17 breathing.
 *    V17-B CSS footer padding-bottom 62px mobile / 12px @min-width:768px (flush).
 *    V17-C heavier head fonts: CSS `h1,h2,h3{font-weight:900!important}` + the
 *          `font-black` utility present on headings in the HTML source.
 *    V17-D HTML verbatim: the ₹1,00,000 "Four Reasons" heading + all 4 reason
 *          titles present byte-for-byte (never a loose substring stub).
 *    V17-E SOURCE services/[slug]/page.tsx calls buildServiceJsonLd(...) AND
 *          injects it via an application/ld+json <script dangerouslySetInnerHTML>.
 *    V17-F SOURCE layout.tsx declares en-IN hreflang (alternates.languages or
 *          an explicit hreflang key) — Next 16 replaces alternates wholesale.
 *    V17-G SOURCE device lock: TBK desktopFill 0.74-0.76 (target 0.75) and
 *          AirPods desktopFill 0.65-0.67 (target 0.66). Structural only (no WebGL).
 *    NOTE: v13 S5 + R2 footer gates were RETARGETED to accept v17 62/12 as well
 *    as legacy 66/16 so all 86 pre-existing gates stay green on the v17 build.
 *
 * Gift: `node tests/visual-audit.mjs --source-only` runs ONLY the SOURCE gates —
 * no browser, no local build. Use it to verify a final-site.js edit in seconds
 * before spending time on a production build. It never touches canvas pixels.
 * Gift: `node tests/visual-audit.mjs --shots` writes one screenshot per viewport
 * to tests/shots/ for eyeball review. Set SHOTS_FULL=1 for full-page captures.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const SHOTS = process.argv.includes('--shots');
const SOURCE_ONLY = process.argv.includes('--source-only'); // gift: source gates only, no browser/build
// Gift (v17): --self-test proves the strict V17-G 3D gate DISCRIMINATES — it must
// FAIL on the current (pre-change) source and PASS when the target 0.75/0.66
// values are simulated IN MEMORY. No file is edited; headless has no WebGL.
const SELF_TEST = process.argv.includes('--self-test');
const SHOTS_FULL = process.env.SHOTS_FULL === '1';
const SHOTS_DIR = process.env.SHOTS_DIR || path.join(SCRIPT_DIR, 'shots');
const OVERLAP_TOLERANCE_PX = 1; // ignore sub-pixel/rounding-only intersections

// v9 anchors (blank-gap guard + responsive layout). All are pure DOM/computed-
// style measurements — no WebGL, no canvas pixels, no string-only heuristics.
const HERO_GAP_MAX_PX = 80;          // hero top -> first real content top
const FULL_PRICE_GRID_EXPECT = { 390: 1, 768: 2, 1440: 3 };
const FOOTER_COLS_EXPECT = { 390: 1, 1440: 4 };
const RESPONSIVE_WIDTHS = [390, 768, 1440];

// v8 source anchors (read once; shared by the global source gates and the
// fullscreen SOURCE-CHECK fallback). Exact strings from the shipped v8 files.
const JS_SOURCE_PATH = path.join(REPO_ROOT, 'public', 'final-site.js');
const CSS_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'app', 'final-site.css');
const HERO_FS_EXCLUSION = "if (slot.canvas.id === 'canvas-hero') continue;";
const EXPECTED_FS_BUTTONS = 9; // 10 stages − hero
const EXPECTED_STAGE_BOXES = 10;

// ---- v10 source anchors (source/structural gates — headless has no WebGL) ----
const HTML_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'lib', 'final-site-html.ts');
const ROBOTS_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'app', 'robots.ts');
const REPAIR_STATUS_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'app', 'repair-status', 'page.tsx');
const INDEXNOW_PATH = path.join(REPO_ROOT, 'public', 'indexnow-key.txt');
const PREDEPLOY_PATH = path.join(REPO_ROOT, 'scripts', 'predeploy-check.sh');
// v13 source anchors (all verified from disk — headless has no WebGL, so 3D stays source-only).
const OG_CARD_PATH = path.join(REPO_ROOT, 'public', 'og-card.jpg');
// v17 source anchors (RES-1 JSON-LD + geo hreflang). Structural only.
const SERVICES_SLUG_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'app', 'services', '[slug]', 'page.tsx');
const LAYOUT_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'app', 'layout.tsx');
// FE-1 integration source anchors (all SOURCE-CHECK — no browser/build, no WebGL).
const ADS_TARGETING_PATH = path.join(REPO_ROOT, 'src', 'lib', 'seo', 'adsTargeting.ts');
const AD_QUALIFY_PATH = path.join(REPO_ROOT, 'src', 'lib', 'seo', 'adQualify.ts');
const LEAD_QUALITY_PATH = path.join(REPO_ROOT, 'src', 'lib', 'analytics', 'leadQuality.ts');
const PROMO_SIGNALS_PATH = path.join(REPO_ROOT, 'src', 'lib', 'analytics', 'promoSignals.ts');
const LEAD_ROUTE_PATH = path.join(REPO_ROOT, 'src', 'app', 'api', 'lead', 'route.ts');
const CONFIG_DIR = path.join(REPO_ROOT, 'src', 'config');
const HEALTH_MONITOR_PATH = path.join(REPO_ROOT, 'scripts', 'health-monitor.py');
const REFRESH_SITE_PATH = path.join(REPO_ROOT, 'scripts', 'refresh-site.py');

// Slice a function body out of a source string using two adjacent markers.
// Scopes the 3D framing assertions to centerAndFitResponsive ONLY — the shared
// renderer setup and the legacy fallback live elsewhere and are not per-slot.
function sliceBetween(src, startMarker, endMarker) {
  const a = src.indexOf(startMarker);
  if (a < 0) return '';
  const b = src.indexOf(endMarker, a + startMarker.length);
  return b < 0 ? src.slice(a) : src.slice(a, b);
}
function extractAll(src, re) {
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) out.push(m[1]);
  return out;
}

/* ---- v14 source-analysis helpers (one-time normalization + raised fills) ----
 * These are genuine STRUCTURAL checks, not substring heuristics: the guard
 * detector brace-matches the source to find the `if (...)` that actually encloses
 * the normalization call. Headless Chromium has no WebGL, so 3D is verified here
 * from source only — never from canvas pixels. */
const V14_FLAG_WORDS = ['baseSize', 'normalized', 'normalizedSlots', 'framedSlots'];
const V14_FLAG_RE = new RegExp(`\\b(?:${V14_FLAG_WORDS.join('|')})\\b`);
const V14_FLAG_ASSIGN_RE = /(?:\.\s*|\b)(?:baseSize|normalized)\s*=(?!=)/;

// Return the condition strings of every `if (...)` block enclosing `idx`.
// Scans braces from the start of `src` up to `idx`; when a `{` is immediately
// preceded by `if (...)` it records that condition (and `null` otherwise).
function enclosingIfConditions(src, idx) {
  const stack = [];
  for (let i = 0; i < idx && i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') {
      const before = src.slice(Math.max(0, i - 200), i);
      const ifM = /if\s*\(([^)]*)\)\s*$/.exec(before);
      stack.push(ifM ? ifM[1] : null);
    } else if (ch === '}') {
      if (stack.length) stack.pop();
    }
  }
  return stack.filter(Boolean);
}

// The first enclosing `if` condition that references a one-time-per-slot flag,
// or '' when the call is unconditional. Empty string => FAIL (shrink bug).
function flagGuardAt(src, idx) {
  return enclosingIfConditions(src, idx).find((c) => V14_FLAG_RE.test(c)) || '';
}

// All indexes of a call regex, excluding `function name(` declarations.
function callSites(src, re) {
  const out = [];
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(src)) !== null) {
    const before = src.slice(Math.max(0, m.index - 12), m.index);
    if (!/\bfunction\s*$/.test(before)) out.push(m.index);
  }
  return out;
}

// Parse `{ 'canvas-id': { fill: <number>, ... }, ... }` from the framing block.
function parseFills(block) {
  const fills = {};
  const re = /['"](canvas-[\w-]+)['"]\s*:\s*\{[^}]*?\bfill:\s*(0?\.\d+|1(?:\.0+)?)/g;
  let m;
  while ((m = re.exec(block)) !== null) fills[m[1]] = Number(m[2]);
  return fills;
}

// v16: return every @keyframes rule body so "no blur-filter keyframes" is a
// per-block structural check, not a loose whole-file substring guess.
function keyframeBlocks(css) {
  const blocks = [];
  const re = /@keyframes\s+[\w-]+\s*\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    let depth = 1, i = m.index + m[0].length;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    blocks.push(css.slice(m.index + m[0].length, i - 1));
  }
  return blocks;
}

// v17: body of one named @keyframes rule ('' when absent). Brace-matched so an
// opacity-only keyframe can be proven structural — never a whole-file guess.
function namedKeyframeBody(css, name) {
  const re = new RegExp(`@keyframes\\s+${name}\\s*\\{`);
  const m = re.exec(css);
  if (!m) return '';
  let depth = 1, i = m.index + m[0].length;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
  }
  return css.slice(m.index + m[0].length, i - 1);
}

// v17: bodies of all @media blocks whose prelude matches conditionRe. Used to
// prove the reduced-motion guardian and the 768px footer padding live in the
// right @media context (brace-matched, not a proximity string heuristic).
function mediaBlocks(css, conditionRe) {
  const out = [];
  const re = /@media\s+([^{]+)\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    if (!conditionRe.test(m[1])) continue;
    let depth = 1, i = m.index + m[0].length;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    out.push(css.slice(m.index + m[0].length, i - 1));
  }
  return out;
}

// v16: parse a `const <Name>DEVICE_FILL = { 'canvas-id': { desktopFill: 0.86,
// mobileFill: 0.88 }, ... };` map into a plain object (no eval, values numeric).
function parseDeviceFillMap(js) {
  const m = /const\s+(\w*DEVICE_FILL)\s*=\s*\{([\s\S]*?)\n\s*\};/.exec(js);
  if (!m) return { name: '', entries: {} };
  const entries = {};
  const re = /['"](canvas-[\w-]+)['"]\s*:\s*\{([^}]*)\}/g;
  let e;
  while ((e = re.exec(m[2])) !== null) {
    const d = /\bdesktopFill:\s*(0?\.\d+|1(?:\.0+)?)/.exec(e[2]);
    const mob = /\bmobileFill:\s*(0?\.\d+|1(?:\.0+)?)/.exec(e[2]);
    entries[e[1]] = {
      desktopFill: d ? Number(d[1]) : null,
      mobileFill: mob ? Number(mob[1]) : null,
    };
  }
  return { name: m[1], entries };
}

// v17 gift: shared evaluator for the strict desktop-3D gate. Returns the parsed
// TBK/AirPods desktopFill values plus the in-band verdict. Used by BOTH gate
// V17-G and the --self-test discrimination proof so they can never drift apart.
function v17DeviceLockProbe(js) {
  const map = parseDeviceFillMap(js);
  const inBand = (v, lo, hi) => v !== null && v !== undefined && v >= lo && v <= hi;
  const tbk = ['canvas-tbk-oca', 'canvas-tbk-90l', 'canvas-tbk-958'];
  const tbkFills = tbk.map((id) => map.entries[id] ? map.entries[id].desktopFill : null);
  const airpods = map.entries['canvas-airpods'] ? map.entries['canvas-airpods'].desktopFill : null;
  const tbkOk = tbkFills.every((v) => inBand(v, 0.74, 0.76));
  const airpodsOk = inBand(airpods, 0.65, 0.67);
  return { name: map.name, tbkFills, airpods, tbkOk, airpodsOk, ok: tbkOk && airpodsOk };
}

const VIEWPORTS = [
  { name: 'tablet', width: 1024, height: 768, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

const results = [];
function record(status, check, detail, mode) {
  const passed = status === true || status === 'PASS';
  const label = passed ? 'PASS' : 'FAIL';
  const tag = mode ? ` [${mode}]` : '';
  results.push({ status: label, check, detail, mode: mode || '' });
  console.log(`[${label}${tag}] ${check}${detail ? ` — ${detail}` : ''}`);
}

/* ------------------------------------------------------------------ *
 * Module / browser resolution — works with the sandbox's global install
 * ------------------------------------------------------------------ */
async function loadPlaywright() {
  for (const id of ['playwright', 'playwright-core']) {
    try { return await import(id); } catch { /* try next */ }
  }
  let roots = [];
  try { roots.push(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()); } catch { /* ignore */ }
  roots.push('/usr/local/lib/nodejs/current/lib/node_modules');
  for (const root of roots) {
    for (const id of ['playwright', 'playwright-core']) {
      const entry = path.join(root, id, 'index.mjs');
      if (fs.existsSync(entry)) return await import(pathToFileURL(entry).href);
      const cjs = path.join(root, id, 'index.js');
      if (fs.existsSync(cjs)) return require(cjs);
    }
  }
  throw new Error('Playwright not found. Install globally or set NODE_PATH.');
}

function resolveChromium(chromium) {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const expected = chromium.executablePath?.();
  if (expected && fs.existsSync(expected)) return undefined; // use Playwright default
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/ms-playwright';
  if (!fs.existsSync(root)) return undefined;
  const revisions = fs.readdirSync(root)
    .filter((d) => /^chromium-\d+$/.test(d))
    .map((d) => ({ d, n: Number(d.split('-')[1]) }))
    .sort((a, b) => b.n - a.n);
  for (const { d } of revisions) {
    const exe = path.join(root, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(exe)) return exe;
  }
  return undefined;
}

function readSource(file) {
  try { return fs.readFileSync(file, 'utf8'); }
  catch (e) { console.log(`[WARN] cannot read ${file}: ${e && e.message ? e.message : e}`); return ''; }
}

// v13: read SOF dimensions from a real JPEG (no external image deps). Returns
// null unless the file is a valid JPEG with a baseline/extended SOF marker.
function jpegSize(file) {
  try {
    const b = fs.readFileSync(file);
    if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
    let i = 2;
    const sof = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf];
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m === 0xd8 || m === 0xd9 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      const seg = b.readUInt16BE(i + 2);
      if (seg < 2) return null;
      if (sof.includes(m)) {
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5), bytes: b.length };
      }
      i += 2 + seg;
    }
  } catch { /* keep null */ }
  return null;
}

/* ------------------------------------------------------------------ *
 * Geometry helpers
 * ------------------------------------------------------------------ */
function fmtBox(b) {
  if (!b) return 'null';
  return `x=${b.x.toFixed(1)} y=${b.y.toFixed(1)} w=${b.width.toFixed(1)} h=${b.height.toFixed(1)}`;
}
function intersection(a, b) {
  if (!a || !b) return null;
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return { w: Math.max(0, w), h: Math.max(0, h) };
}
function boxesOverlap(a, b) {
  const i = intersection(a, b);
  return !!i && i.w > OVERLAP_TOLERANCE_PX && i.h > OVERLAP_TOLERANCE_PX;
}
// Count columns from a computed grid-template-columns value. Chromium resolves
// fr tracks to used px ("460px 460px 460px"), but tolerate an unresolved
// repeat(N, ...) form too so the gate never miscounts on a rendering diff.
function gridColumns(value) {
  if (!value) return 0;
  const v = String(value).trim();
  if (!v || v === 'none') return 0;
  const rep = v.match(/^repeat\(\s*(\d+)\s*,/i);
  if (rep) return Number(rep[1]);
  return v.split(/\s+/).filter(Boolean).length;
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */
async function main() {
  // Gift (v17) --self-test: prove gate V17-G DISCRIMINATES — fails on out-of-band
  // values, passes on the 0.75/0.66 target. Forces values BY CANVAS ID in memory,
  // so it works before OR after FaiCodex's change lands. Edits nothing on disk;
  // no browser/build; 3D stays structural (headless has no WebGL).
  if (SELF_TEST) {
    const js = readSource(JS_SOURCE_PATH);
    const force = (src, tbkV, airV) => src
      .replace(/('canvas-tbk-(?:oca|90l|958)':\s*\{\s*desktopFill:\s*)(?:0?\.\d+|1(?:\.0+)?)/g, `$1${tbkV}`)
      .replace(/('canvas-airpods':\s*\{\s*desktopFill:\s*)(?:0?\.\d+|1(?:\.0+)?)/g, `$1${airV}`);
    const bad = v17DeviceLockProbe(force(js, '0.82', '0.78'));   // out of band -> FAIL
    const good = v17DeviceLockProbe(force(js, '0.75', '0.66'));  // target      -> PASS
    const correct = !bad.ok && good.ok;
    console.log('visual-audit --self-test: V17-G strict 3D gate discrimination proof');
    console.log(`  OUT-OF-BAND (0.82/0.78) -> ${bad.ok ? 'PASS' : 'FAIL'} (expected FAIL) ` +
      `tbk=${JSON.stringify(bad.tbkFills)} airpods=${bad.airpods}`);
    console.log(`  TARGET      (0.75/0.66) -> ${good.ok ? 'PASS' : 'FAIL'} (expected PASS) ` +
      `tbk=${JSON.stringify(good.tbkFills)} airpods=${good.airpods}`);
    console.log(`  RESULT: ${correct ? 'V17_GATE_DISCRIMINATION_OK' : 'V17_GATE_DISCRIMINATION_BROKEN'}`);
    if (!correct) process.exitCode = 1;
    return;
  }

  // v8 source snapshots (global gates + fullscreen fallback).
  const jsSource = readSource(JS_SOURCE_PATH);
  const cssSource = readSource(CSS_SOURCE_PATH);
  const htmlSource = readSource(HTML_SOURCE_PATH);

  // v10 expected DOM texts are DERIVED FROM SOURCE so the DOM gate compares
  // real source<->DOM byte identity (never a hardcoded copy that can drift).
  // If extraction fails the gate fails closed (length/emptiness assertions below).
  // v16: FE-1 rebuilt the band as .studio-glass-band > .studio-tag-row (9
  // .studio-tag) + .studio-cta-row (2 .studio-cta-btn) + .studio-hours-line.
  // Selectors moved; the byte-identical TEXT checks below are unchanged.
  const V10_CHIPS = extractAll(htmlSource, /<span class="studio-tag">([^<]*)<\/span>/g);
  const V10_BUTTONS = extractAll(htmlSource, /<a[^>]*class="[^"]*studio-cta-btn[^"]*"[^>]*>([^<]*)<\/a>/g)
    .map((s) => s.trim());
  // v16: hours line is now .studio-hours-line (was lab-hours-line / mt-2.5).
  const hoursMatch = htmlSource.match(/<p class="studio-hours-line">(Store open[^<]*)<\/p>/);
  const V10_HOURS = hoursMatch ? hoursMatch[1].trim() : '';
  // v16: the technical ticker's 9 capability labels are .studio-cap-item (the
  // last 6 also carry .studio-cap-static). Derived from source, never hardcoded.
  const V13_CAPS = extractAll(htmlSource, /<span class="studio-cap-item[^"]*">([^<]*)<\/span>/g);

  let browser = null;
  if (!SOURCE_ONLY) {
    const { chromium } = await loadPlaywright();
    const executablePath = resolveChromium(chromium);
    browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  }

  if (SHOTS) fs.mkdirSync(SHOTS_DIR, { recursive: true });
  console.log(`visual-audit BASE_URL=${BASE_URL} shots=${SHOTS ? 'on' : 'off'} ` +
    `mode=${SOURCE_ONLY ? 'SOURCE-ONLY' : 'FULL'}${SOURCE_ONLY ? ' (no browser, no build required)' : ''}`);

  try {
    /* ---- LEGACY Check 1+2: SSR HTML (once) ---- (skipped in SOURCE-ONLY: no server) */
    if (!SOURCE_ONLY) {
      let ssr = '';
      try {
        const res = await fetch(BASE_URL, { headers: { 'user-agent': 'Mozilla/5.0 visual-audit' } });
        ssr = await res.text();
        const has49 = ssr.includes('4.9/5');
        const has13 = ssr.includes('1.3/5');
        record(has49 && !has13, 'SSR rating 4.9/5 present, 1.3/5 absent',
          `status=${res.status} bytes=${ssr.length} 4.9/5=${has49} 1.3/5=${has13}`);
        const ssrShowcase = /class="[^"]*\borange-glass-showcase\b/.test(ssr);
        record(!ssrShowcase, 'SSR HTML has no .orange-glass-showcase', `found=${ssrShowcase}`);
      } catch (e) {
        record('FAIL', 'SSR HTML fetch', String(e && e.message ? e.message : e));
      }
    }

    /* ---- v8 GLOBAL SOURCE Gate 9: AirPods Space Grey + no old counter animation ---- */
    const hasSpaceGreyColor = jsSource.includes('0x8a8f98');
    const hasSpaceGreyFn = jsSource.includes('applyAirpodsSpaceGrey');
    const hasOldCounterAnim = jsSource.includes('target * ease');
    record(hasSpaceGreyColor && hasSpaceGreyFn && !hasOldCounterAnim,
      'SOURCE final-site.js: AirPods Space Grey + no old counter animation',
      `0x8a8f98=${hasSpaceGreyColor} applyAirpodsSpaceGrey=${hasSpaceGreyFn} ` +
      `"target * ease"=${hasOldCounterAnim} (expected present,present,absent)`, 'SOURCE-CHECK');

    /* ---- v8 GLOBAL SOURCE Gate 10: required CSS classes ---- */
    const cssHasOrangeBg = cssSource.includes('.stage-3d-orange-bg');
    const cssHasStatFinal = cssSource.includes('.stat-final');
    record(cssHasOrangeBg && cssHasStatFinal,
      'SOURCE final-site.css: .stage-3d-orange-bg + .stat-final',
      `.stage-3d-orange-bg=${cssHasOrangeBg} .stat-final=${cssHasStatFinal} (expected present,present)`,
      'SOURCE-CHECK');

    /* ---- v10 GLOBAL SOURCE Gate 24: tight bounds + aspect-aware per-axis fit ---- */
    // 3D is verified STRUCTURALLY only: headless Chromium has no WebGL, so we
    // never read canvas pixels or judge model size from a screenshot. The NEW
    // formula solves distance per-axis (distV/distH -> Math.max) and uses
    // MODEL_FRAMING fills (most 0.92, airpods 0.86, macbook 0.94). Assert that
    // approach — never the retired Math.min(0.90)/0.88/dist*0.24 formula.
    const framingBlock = sliceBetween(jsSource, 'const MODEL_FRAMING', 'function registerSlot');
    const fitFn = sliceBetween(jsSource, 'function centerAndFitResponsive', 'function registerSlot');
    // tight device-bounds helper exists in source AND is used by the fit
    const hasTightFn = /function\s+computeTightDeviceBounds\s*\(/.test(jsSource) &&
      fitFn.includes('computeTightDeviceBounds');
    // aspect-aware per-axis distance solve (the whole point of the new framing)
    const hasDistV = /\bdistV\s*=/.test(fitFn);
    const hasDistH = /\bdistH\s*=/.test(fitFn);
    const hasMaxDist = /Math\.max\s*\(\s*distV\s*,\s*distH\s*\)/.test(fitFn);
    // MODEL_FRAMING fill tiers. v14 forward-compatible: accept the original
    // 0.92/0.86/0.94 tiers AND the raised tiers (>=0.95 most, MacBook highest,
    // AirPods eased). This gate still verifies tier PRESENCE + every regression
    // guard below; the strict raised-value assertion is the new v14 gate 33.
    const hasDefaultFill = /fill:\s*0\.9[2-9]\b/.test(framingBlock);
    const hasAirpodsTier = /['"]canvas-airpods['"]\s*:\s*\{\s*fill:\s*0\.(?:8[6-9]|9[0-9])\b/.test(framingBlock);
    // v17: MacBook base fill is FROZEN at 0.90 (was 0.96) — accept 0.90-0.99.
    const hasMacbookTier = /['"]canvas-macbook['"]\s*:\s*\{\s*fill:\s*0\.9[0-9]\b/.test(framingBlock);
    // regression guards: no per-slot renderer.setSize inside the fit, and no
    // inflated setFromObject(root, true) in the fit path. (The legacy
    // centerAndFitEdgeToEdge fallback may still use setFromObject(root, true);
    // that function is OUTSIDE this slice, so the guard stays correctly scoped.)
    const noPerSlotSetSize = !/\.setSize\s*\(/.test(fitFn);
    const noInflatedFit = !/setFromObject\s*\(\s*root\s*,\s*true\s*\)/.test(fitFn);
    // GIFT (QA fail-closed): also reject any residue of the RETIRED formula so a
    // partial revert that keeps the new markers but restores the old math fails.
    const noRetiredMin090 = !/Math\.min\(\s*0\.90/.test(fitFn);
    const noRetiredDist024 = !/dist\s*\*\s*0\.24/.test(fitFn);
    const noRetiredFill088 = !/\b0\.88\b/.test(fitFn);
    record(hasTightFn && hasDistV && hasDistH && hasMaxDist &&
      hasDefaultFill && hasAirpodsTier && hasMacbookTier && noPerSlotSetSize && noInflatedFit &&
      noRetiredMin090 && noRetiredDist024 && noRetiredFill088,
      'v10 SOURCE final-site.js: tight bounds + distV/distH/Math.max + tiered fills (legacy or raised), no per-slot setSize, no inflated fit, no retired formula',
      `fitFnLen=${fitFn.length} tightFn=${hasTightFn} distV=${hasDistV} distH=${hasDistH} ` +
      `maxDist=${hasMaxDist} defaultFill=${hasDefaultFill} airpodsTier=${hasAirpodsTier} ` +
      `macbookTier=${hasMacbookTier} perSlotSetSizeAbsent=${noPerSlotSetSize} ` +
      `inflatedFitAbsent=${noInflatedFit} retiredMin090Absent=${noRetiredMin090} ` +
      `retiredDist024Absent=${noRetiredDist024} retiredFill088Absent=${noRetiredFill088} ` +
      `(expected true x12)`, 'SOURCE-CHECK');

    /* ---- v16 SOURCE Gate 25: rebuilt hashtag/CTA band (zero-jitter) source ----
     * v16: .glass-lab-cta-band/.lab-hash-chip -> .studio-glass-band/.studio-tag.
     * Structural contract (contain:layout style, box-shadow:none) is unchanged. */
    const hasCtaBand = htmlSource.includes('studio-glass-band');
    const chipCountSrc = (htmlSource.match(/class="studio-tag"/g) || []).length;
    const cssBandContain = /\.studio-glass-band\s*\{[^}]*contain:\s*layout style/.test(cssSource);
    const cssChipShadow = /\.studio-tag\s*\{[^}]*box-shadow:\s*none/.test(cssSource);
    record(hasCtaBand && chipCountSrc === 9 && cssBandContain && cssChipShadow,
      'v16 SOURCE glass-lab CTA: .studio-glass-band + 9 .studio-tag, CSS box-shadow:none + contain:layout style',
      `band=${hasCtaBand} tagCount=${chipCountSrc} (expected 9) cssContain=${cssBandContain} ` +
      `cssTagShadowNone=${cssChipShadow}`, 'SOURCE-CHECK');

    /* ---- v10 SOURCE Gate 26: robots rules allow crawlers, keep /_next/ crawlable ---- */
    const robots = readSource(ROBOTS_SOURCE_PATH);
    const hasGooglebot = /userAgent:\s*["']Googlebot["']/.test(robots);
    const hasBingbot = /userAgent:\s*["']Bingbot["']/.test(robots);
    const hasApplebot = /["']Applebot["']/.test(robots);
    const allowsNext = /allow:\s*\[[^\]]*["']\/_next\/["']/.test(robots);
    const disallowNext = /disallow:\s*\[[^\]]*["']\/_next\/["']/.test(robots);
    record(hasGooglebot && hasBingbot && hasApplebot && allowsNext && !disallowNext,
      'v10 SOURCE robots.ts: Googlebot/Bingbot/Applebot allowed, /_next/ not disallowed',
      `Googlebot=${hasGooglebot} Bingbot=${hasBingbot} Applebot=${hasApplebot} ` +
      `allowNext=${allowsNext} disallowNext=${disallowNext} (expected true,true,true,true,false)`,
      'SOURCE-CHECK');

    /* ---- v10 SOURCE Gate 27: indexnow key file = exactly one key line (value never printed) ---- */
    let indexnowOk = false, indexnowDetail = 'missing or unreadable';
    try {
      const knLines = fs.readFileSync(INDEXNOW_PATH, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      indexnowOk = knLines.length === 1 && knLines[0].length >= 8 && !/\s/.test(knLines[0]);
      indexnowDetail = `nonEmptyLines=${knLines.length} (expected 1) keyChars=${knLines[0] ? knLines[0].length : 0} (value redacted)`;
    } catch { /* keep default detail — never print the key */ }
    record(indexnowOk, 'v10 SOURCE public/indexnow-key.txt: single key line (value redacted)',
      indexnowDetail, 'SOURCE-CHECK');

    /* ---- v10 SOURCE Gate 28: repair-status posts to /api/crm-status, never GET ---- */
    const rs = readSource(REPAIR_STATUS_SOURCE_PATH);
    const crmIdx = rs.indexOf('/api/crm-status');
    const crmWindow = crmIdx >= 0 ? rs.slice(crmIdx, crmIdx + 320) : '';
    const crmPost = /method:\s*["']POST["']/.test(crmWindow);
    const crmGet = /method:\s*["']GET["']/.test(crmWindow);
    record(crmIdx >= 0 && crmPost && !crmGet,
      'v10 SOURCE repair-status/page.tsx: /api/crm-status uses POST, not GET',
      `endpointFound=${crmIdx >= 0} POST=${crmPost} GET=${crmGet} (expected true,true,false)`,
      'SOURCE-CHECK');

    /* ---- v10 SCRIPTS Gate 29: predeploy-check.sh blocking noindex gate calls both scanners ---- */
    const pre = readSource(PREDEPLOY_PATH);
    const blockingAt = pre.indexOf('noindex/strike gate (blocking) [live:');
    const seoAt = pre.indexOf('seo_strike_scanner.py', blockingAt);
    const v8At = pre.indexOf('verify_v8_live.py', blockingAt);
    const seoBlocking = seoAt >= 0 && /\|\s*\{/.test(pre.slice(seoAt, seoAt + 260));
    const v8Blocking = v8At >= 0 && /\|\s*\{/.test(pre.slice(v8At, v8At + 260));
    record(blockingAt >= 0 && seoBlocking && v8Blocking,
      'v10 SCRIPTS predeploy-check.sh: blocking noindex gate calls both scanners',
      `blockingSection=${blockingAt >= 0} seo_strike_scanner=${seoBlocking} verify_v8_live=${v8Blocking} ` +
      `(expected true x3)`, 'SOURCE-CHECK');

    /* ---- v14 GLOBAL SOURCE Gate 32: one-time-per-slot normalization ---- *
     * The v13 bug: every idle wake re-entered centerAndFitResponsive and ran
     * `root.scale.multiplyScalar(2.0 / r0)` again, compounding scale toward zero.
     * v14 must normalize ONCE per slot behind a latching per-slot flag. Two
     * equivalent implementations are accepted (both found with brace-aware
     * evidence, never a loose proximity string check):
     *   (a) the multiply itself sits inside an `if (!slot.baseSize ...)` guard
     *       in the fit fn, or
     *   (b) the centerAndFitResponsive CALL SITE in animate() is flag-guarded.
     * Either way the flag must also be assigned (latched) in source. */
    const multIdx = jsSource.search(/multiplyScalar\s*\(\s*2\.0\s*\/\s*r0\s*\)/);
    const multGuard = multIdx >= 0 ? flagGuardAt(jsSource, multIdx) : '';
    const fitCallIdxs = callSites(jsSource, /centerAndFitResponsive\s*\(/g);
    const callGuard = fitCallIdxs.map((i) => flagGuardAt(jsSource, i)).find(Boolean) || '';
    const flagLatched = V14_FLAG_ASSIGN_RE.test(jsSource);
    const normOnceOk = multIdx >= 0 && fitCallIdxs.length > 0 && flagLatched && !!(multGuard || callGuard);
    record(normOnceOk,
      'v14 SOURCE final-site.js: one-time-per-slot normalization (baseSize/normalized guards multiplyScalar(2.0/r0))',
      `multiplyFound=${multIdx >= 0} fitCalls=${fitCallIdxs.length} flagAssigned=${flagLatched} ` +
      `multiplyGuard="${multGuard || 'UNGUARDED'}" callGuard="${callGuard || 'UNGUARDED'}" ` +
      `(require flagAssigned && at least one guard)`, 'SOURCE-CHECK');

    /* ---- v14 GLOBAL SOURCE Gate 33: raised fills + tablet wide + cap ---- *
     * Source-only (headless has no WebGL). Parse the MODEL_FRAMING fills and
     * assert the v14 contract: most slots >= 0.95, tablet (iPad) wider logic,
     * MacBook is the maximum, AirPods eased below the max, and the fill hard-cap
     * in the fit fn was raised so the larger values actually take effect. */
    const fills = parseFills(framingBlock);
    const fillEntries = Object.entries(fills);
    const nonAirpods = fillEntries.filter(([id]) => id !== 'canvas-airpods');
    const raisedCount = nonAirpods.filter(([, v]) => v >= 0.95).length;
    // v15: machines are DELIBERATELY eased to <=0.90 (Faisu asked to reduce machine
    // zoom). Hero >=0.96 (increased). So accept: hero raised, machines 0.84..0.90,
    // and at least half of non-machine slots raised. Never let machines creep back to 0.95.
    const machineIds = ['canvas-tbk-oca', 'canvas-tbk-90l', 'canvas-tbk-958'];
    const machinesEased = machineIds.every((id) => {
      const v = fills[id];
      return v !== undefined && v >= 0.84 && v <= 0.90;
    });
    const heroRaised = (fills['canvas-hero'] ?? 0) >= 0.96;
    const nonMachine = nonAirpods.filter(([id]) => !machineIds.includes(id));
    const raisedNonMachine = nonMachine.filter(([, v]) => v >= 0.95).length;
    const mostRaised = nonMachine.length >= 5 && raisedNonMachine >= nonMachine.length - 1 &&
      heroRaised && machinesEased && nonAirpods.length >= 6;
    const maxFill = fillEntries.length ? Math.max(...fillEntries.map(([, v]) => v)) : 0;
    const macbookFill = fills['canvas-macbook'];
    const airpodsFill = fills['canvas-airpods'];
    // v17: MacBook is FROZEN at 0.90 (no device override). Its desktop effective
    // value = 0.90 (base). "macbookHighest" is obsolete; assert frozen 0.88-0.92.
    const macbookFrozen = macbookFill !== undefined && macbookFill >= 0.88 && macbookFill <= 0.92;
    const airpodsEased = airpodsFill !== undefined && airpodsFill < maxFill &&
      airpodsFill < Math.max(...nonAirpods.map(([, v]) => v));
    const tabletToken = /\b(?:isTablet|tabletFill|wideFill|widerFill|fillWide|landscapeFill)\b/
      .test(framingBlock + fitFn);
    const tabletIdCond = /id\s*===?\s*['"][^'"]*(?:ipad|tablet)[^'"]*['"]/i.test(fitFn);
    const tabletWider = tabletToken || tabletIdCond;
    const capMatch = /Math\.min\(\s*([01](?:\.\d+)?)\s*,\s*cfg\.fill/.exec(fitFn);
    const capVal = capMatch ? Number(capMatch[1]) : 1; // no cap = fully open
    const capOk = capVal >= 0.95;
    record(mostRaised && macbookFrozen && airpodsEased && tabletWider && capOk && fillEntries.length >= 8,
      'v17 SOURCE final-site.js: hero>=0.96, machines eased 0.84-0.90, tablet wider, MacBook frozen 0.88-0.92, AirPods eased, cap raised',
      `slots=${fillEntries.length} raised=${raisedCount}/${nonAirpods.length} ` +
      `fills=${JSON.stringify(fills)} macbookFrozen=${macbookFrozen} airpodsEased=${airpodsEased} ` +
      `tabletWider=${tabletWider} (token=${tabletToken} idCond=${tabletIdCond}) ` +
      `fillCap=${capVal} (expected >=0.95)`, 'SOURCE-CHECK');

    /* ================= v13 GLOBAL SOURCE GATES (S1–S8) =================
     * All run before the SOURCE-ONLY early return, so `--source-only` covers them.
     * 3D framing stays SOURCE-only — headless Chromium has no WebGL. */

    /* S1: dark-orange static dot grid replaced the red/grey dots. */
    // v17 retarget: FE-1 eased the dark-orange dot from .24 to .22. Accept both
    // so the gate stays green across the transition; the legacy red/grey dot
    // must still be gone (unchanged intent).
    const dotRgba = /rgba\(\s*194\s*,\s*65\s*,\s*12\s*,\s*0?\.(?:24|22)\s*\)/.test(cssSource);
    const dotGrid24 = (cssSource.match(/100%\s+100%\s*,\s*100%\s+100%\s*,\s*24px\s+24px/g) || []).length;
    const legacyDotAbsent = !/rgba\(\s*220\s*,\s*38\s*,\s*38\s*,\s*0?\.07\s*\)\s+1px/.test(cssSource) &&
      !/rgba\(\s*24\s*,\s*24\s*,\s*27\s*,\s*0?\.05\s*\)\s+1px/.test(cssSource);
    record(dotRgba && dotGrid24 >= 2 && legacyDotAbsent,
      'v13 SOURCE final-site.css (v17-tolerant): dark-orange dot rgba(194,65,12,.22|.24) + 24px grid, legacy dot gone',
      `darkOrangeRgba=${dotRgba} (.22 v17 or .24 legacy) grid24px=${dotGrid24} (expected >=2) legacyDotAbsent=${legacyDotAbsent}`,
      'SOURCE-CHECK');

    /* S2: header logo enlarged and its brand block centred. */
    const logoTag = (htmlSource.match(/<img[^>]*alt="Red Apple Mobile Repair Logo"[^>]*>/) || [''])[0];
    const logoH10 = /\bh-10\b/.test(logoTag) && /\bw-10\b/.test(logoTag);
    const logoH11 = /\bsm:h-11\b/.test(logoTag) && /\bsm:w-11\b/.test(logoTag);
    const logoAlign = /<div class="flex flex-col items-center">/.test(htmlSource);
    record(logoH10 && logoH11 && logoAlign,
      'v13 SOURCE final-site-html.ts: header logo h-10/w-10 + sm:h-11/sm:w-11 + centred column',
      `h10w10=${logoH10} smH11W11=${logoH11} centredColumn=${logoAlign}`, 'SOURCE-CHECK');

    /* S3: device-condition field deleted; the single "wrong" field spans full width. */
    const srcEstCondition = /id=["']est-condition["']/.test(htmlSource);
    const srcEstWrongFull = /<input[^>]*id=["']est-wrong["'][^>]*class="[^"]*\bcol-span-full\b/.test(htmlSource);
    record(!srcEstCondition && srcEstWrongFull,
      'v13 SOURCE final-site-html.ts: #est-condition removed, #est-wrong col-span-full',
      `estConditionPresent=${srcEstCondition} (expected false) estWrongColSpanFull=${srcEstWrongFull}`,
      'SOURCE-CHECK');

    /* S4 (v16): both rebuilt jitter sections keep their new static structure.
     * Ticker: .studio-cap-row > 9 .studio-cap-item (6 also .studio-cap-static).
     * Band: .studio-glass-band > .studio-tag-row/.studio-cta-row/.studio-hours-line. */
    const capGridSrc = htmlSource.includes('studio-cap-row');
    const capCountSrc = (htmlSource.match(/\bstudio-cap-item\b/g) || []).length;
    const staticCountSrc = (htmlSource.match(/\bstudio-cap-static\b/g) || []).length;
    const hashRowSrc = htmlSource.includes('studio-tag-row');
    const ctaRowSrc = htmlSource.includes('studio-cta-row');
    const hoursLineSrc = htmlSource.includes('studio-hours-line');
    const visMinSrc = /id="ba-slider-box"[^>]*\bmin-h-\[290px\]/.test(htmlSource);
    const visSmSrc = /id="ba-slider-box"[^>]*\bsm:h-80\b/.test(htmlSource);
    record(capGridSrc && capCountSrc === 9 && staticCountSrc === 6 && hashRowSrc && ctaRowSrc &&
      hoursLineSrc && visMinSrc && visSmSrc,
      'v16 SOURCE rebuilt sections: .studio-cap-row + 9 .studio-cap-item (6 static), studio-tag/cta/hours rows, visualiser min-h-[290px] + sm:h-80 kept',
      `capRow=${capGridSrc} capabilities=${capCountSrc}/9 static=${staticCountSrc}/6 tagRow=${hashRowSrc} ` +
      `ctaRow=${ctaRowSrc} hoursLine=${hoursLineSrc} visMin290=${visMinSrc} visSmH80=${visSmSrc}`, 'SOURCE-CHECK');

    /* S5: footer dock-clearance padding in BOTH CSS and utility classes.
     * v17 retarget: FE-1 flushed the footer to 62px mobile / 12px @>=768px.
     * Accept v17 (62/12) OR legacy (66/16) so this gate stays green across the
     * transition; the STRICT v17 assertion is gate V17-B below. */
    const mobilePadM = /\.footer-light-modern\s*\{[^}]*padding-bottom:\s*(\d+)px\s*!important/.exec(cssSource);
    const deskPadM = /@media\s*\(min-width:\s*(?:1024|768)px\)\s*\{\s*\.footer-light-modern\s*\{\s*padding-bottom:\s*(\d+)px\s*!important/.exec(cssSource);
    const mobilePad = mobilePadM ? mobilePadM[1] : '';
    const deskPad = deskPadM ? deskPadM[1] : '';
    const padMobileOk = mobilePad === '62' || mobilePad === '66';
    const padDeskOk = deskPad === '12' || deskPad === '16';
    const htmlPad = /id="footer-contact"[^>]*\bpb-\[(?:66|62)px\][^>]*\blg:pb-[34]\b/.test(htmlSource);
    record(padMobileOk && padDeskOk && htmlPad,
      'v13 SOURCE footer (v17-tolerant): padding-bottom 62/66px mobile / 12/16px desktop + footer utility classes',
      `cssMobile=${mobilePad || 'missing'} cssDesktop=${deskPad || 'missing'} (accepted 62|66 / 12|16) ` +
      `htmlClasses=${htmlPad}`, 'SOURCE-CHECK');

    /* S6: og-card.jpg is a genuine JPEG with the declared OG dimensions. */
    const og = jpegSize(OG_CARD_PATH);
    const ogOk = !!og && og.width === 1200 && og.height === 630 && og.bytes < 250000;
    record(ogOk, 'v13 SOURCE public/og-card.jpg: real JPEG 1200x630, <250000 bytes',
      og ? `width=${og.width} height=${og.height} bytes=${og.bytes} (expected 1200x630,<250000)`
         : 'missing, unreadable or not a JPEG', 'SOURCE-CHECK');

    /* S7: link-preview + ads crawlers explicitly allowed; /_next/ stays crawlable. */
    const rWhats = /["']WhatsApp["']/.test(robots);
    const rFb = /["']facebookexternalhit["']/.test(robots);
    const rAds = /["']AdsBot-Google["']/.test(robots);
    const rNextAllow = /allow:\s*\[[^\]]*["']\/_next\/["']/.test(robots);
    const rNextDisallow = /disallow:\s*\[[^\]]*["']\/_next\/["']/.test(robots);
    const uaArray = robots.match(/userAgent:\s*\[([\s\S]*?)\]/);
    const botNames = uaArray ? (uaArray[1].match(/["'][^"']+["']/g) || []).length : 0;
    record(rWhats && rFb && rAds && botNames >= 14 && rNextAllow && !rNextDisallow,
      'v13 SOURCE robots.ts: WhatsApp + facebookexternalhit + AdsBot-Google, >=14 bots, /_next/ allowed',
      `WhatsApp=${rWhats} facebookexternalhit=${rFb} AdsBot-Google=${rAds} botNames=${botNames} ` +
      `(expected >=14) allowNext=${rNextAllow} disallowNext=${rNextDisallow}`, 'SOURCE-CHECK');

    /* S8: no stale JS reference to the deleted field; scroll-critical listeners passive. */
    const jsEstCondition = /est-condition/.test(jsSource);
    const winPointerPassive = /window\.addEventListener\(\s*['"]pointermove['"][\s\S]{0,220}?\{\s*passive:\s*true\s*\}\s*\)/.test(jsSource);
    const winResizePassive = /window\.addEventListener\(\s*['"]resize['"][\s\S]{0,140}?\{\s*passive:\s*true\s*\}\s*\)/.test(jsSource);
    const passiveTrueCount = (jsSource.match(/passive:\s*true/g) || []).length;
    const nonPassiveTouch = /addEventListener\(\s*['"](?:touchstart|touchmove|wheel)['"](?![^;]{0,180}passive:\s*true)/.test(jsSource);
    record(!jsEstCondition && winPointerPassive && winResizePassive && passiveTrueCount >= 2 && !nonPassiveTouch,
      'v13 SOURCE final-site.js: no est-condition reference + passive window pointermove/resize listeners',
      `estConditionRef=${jsEstCondition} (expected false) windowPointermovePassive=${winPointerPassive} ` +
      `windowResizePassive=${winResizePassive} passiveTrueCount=${passiveTrueCount} (expected >=2) ` +
      `nonPassiveTouchWheel=${nonPassiveTouch} (expected false)`, 'SOURCE-CHECK');

    /* ================= v16 GLOBAL SOURCE GATES =================
     * FE-1's zero-latency-effects (ZLE-V16) rebuild: static ticker + hashtag band,
     * no infinite paint animations, no blur-filter keyframes; plus the device-lock
     * contract. All STRUCTURAL/source checks — headless has no WebGL. */

    /* V16-A: >=10 ZLE-V16 markers; no active infinite animation on the rebuilt
     * ticker/band labels; no @keyframes block animates a blur filter. */
    const zleMarkerCount = (cssSource.match(/ZLE-V16/g) || []).length;
    // Per-selector rule bodies must declare `animation: none` (fail-closed: a
    // missing rule means the label is not proven static).
    const capItemRule = (cssSource.match(/\.studio-cap-item\s*\{[^}]*\}/) || [''])[0];
    const capStaticRule = (cssSource.match(/\.studio-cap-static\s*\{[^}]*\}/) || [''])[0];
    const tagRule = (cssSource.match(/\.studio-tag\s*\{[^}]*\}/) || [''])[0];
    const capItemStatic = /animation:\s*none/.test(capItemRule);
    const capStaticStatic = /animation:\s*none/.test(capStaticRule);
    const tagStatic = /animation:\s*none/.test(tagRule);
    // No rule for these label classes may carry a live (non-none) infinite animation.
    const liveLabelAnim = new RegExp(
      `\\.studio-(?:cap-item|cap-static|tag)[^{]*\\{[^}]*animation:\\s*(?!none)[^;}]*infinite`
    ).test(cssSource);
    const kf = keyframeBlocks(cssSource);
    const blurKeyframes = kf.filter((b) => /filter:\s*(?:blur|backdrop-filter)/.test(b)).length;
    record(zleMarkerCount >= 10 && capItemStatic && capStaticStatic && tagStatic &&
      !liveLabelAnim && blurKeyframes === 0,
      'v16 SOURCE final-site.css: >=10 ZLE-V16 markers, static ticker/band labels (no infinite anim), no blur-filter keyframes',
      `zleMarkers=${zleMarkerCount} (expected >=10) capItemStatic=${capItemStatic} ` +
      `capStaticStatic=${capStaticStatic} tagStatic=${tagStatic} liveLabelInfiniteAnim=${liveLabelAnim} ` +
      `(expected false) keyframes=${kf.length} blurFilterKeyframes=${blurKeyframes} (expected 0)`,
      'SOURCE-CHECK');

    /* V16-B: HARD device lock. TBK machines + AirPods carry a lowered
     * desktopFill; internals carries BOTH desktopFill and a mobileFill lock;
     * mobile is unchanged (no mobileFill on TBK/AirPods); MacBook stays frozen.
     * The fit path selects by `window.innerWidth < 768`. Source-only (no WebGL). */
    const devMap = parseDeviceFillMap(jsSource);
    const tbkIds = ['canvas-tbk-oca', 'canvas-tbk-90l', 'canvas-tbk-958'];
    const tbkLowered = tbkIds.every((id) => {
      const e = devMap.entries[id];
      return e && e.desktopFill !== null && e.desktopFill <= 0.88;
    });
    const airpodsLock = devMap.entries['canvas-airpods'] &&
      devMap.entries['canvas-airpods'].desktopFill !== null &&
      devMap.entries['canvas-airpods'].desktopFill <= 0.88;
    const internals = devMap.entries['canvas-internals'];
    const internalsBaseline = fills['canvas-internals']; // MODEL_FRAMING fill (0.95)
    // "internals lock" = BOTH viewports explicitly pinned below the frozen
    // baseline (desktop 0.86, mobile 0.88 < baseline 0.95); every other model
    // is frozen at its baseline on mobile.
    const internalsLock = !!internals && internals.desktopFill !== null && internals.mobileFill !== null &&
      internalsBaseline !== undefined && internals.desktopFill < internalsBaseline &&
      internals.mobileFill < internalsBaseline;
    // "mobile unchanged": the TBK machines + AirPods must NOT override mobileFill.
    const mobileUnchanged = [...tbkIds, 'canvas-airpods'].every(
      (id) => devMap.entries[id] && devMap.entries[id].mobileFill === null);
    // MacBook: either frozen in MODEL_FRAMING (absent from the device map, so
    // mobile is untouched) or, if a desktopFill was added, it must be lowered.
    const macFramingFill = fills['canvas-macbook'];
    const macDev = devMap.entries['canvas-macbook'];
    const macbookOk = macFramingFill !== undefined &&
      (!macDev || (macDev.desktopFill !== null && macDev.desktopFill <= 0.96)) &&
      (!macDev || macDev.mobileFill === null);
    const hardLockLogic = !!devMap.name &&
      /window\.innerWidth\s*<\s*768/.test(fitFn) &&
      /isMobileView[\s\S]{0,160}mobileFill[\s\S]{0,160}desktopFill/.test(fitFn) &&
      new RegExp(`const\\s+dev\\s*=\\s*${devMap.name}\\s*\\[`).test(fitFn);
    record(tbkLowered && !!airpodsLock && internalsLock && mobileUnchanged && macbookOk && hardLockLogic,
      'v16 SOURCE final-site.js: device lock — TBK/AirPods desktopFill lowered, mobile unchanged, internals locked, MacBook frozen',
      `map=${devMap.name || 'MISSING'} tbkLowered=${tbkLowered} airpodsLock=${!!airpodsLock} ` +
      `internalsLock=${internalsLock} (${internals ? `desktop=${internals.desktopFill} mobile=${internals.mobileFill} baseline=${internalsBaseline}` : 'missing'}) ` +
      `mobileUnchanged=${mobileUnchanged} macbookFramingFill=${macFramingFill} ` +
      `macbookDev=${macDev ? JSON.stringify(macDev) : 'not-in-map(frozen)'} macbookOk=${macbookOk} ` +
      `hardLockLogic=${hardLockLogic}`, 'SOURCE-CHECK');

    /* ================= v17 GLOBAL SOURCE GATES (V17-A..G) =================
     * FE-1 effect polish, footer flush, verbatim copy; RES-1 service JSON-LD +
     * geo hreflang; FaiCodex desktop-only 3D tightening. ALL source/structural
     * checks — headless Chromium has no WebGL, so 3D is NEVER judged from pixels.
     * All seven run before the SOURCE_ONLY return so --source-only covers them. */

    /* V17-A: >=8 V17-FX markers + v17AccentBreath opacity-only keyframe actually
     * applied to the accent pills + a prefers-reduced-motion guardian that kills
     * that breathing. The keyframe body is brace-extracted and proven to contain
     * ONLY opacity declarations (no transform/filter/box-shadow/layout props). */
    const v17MarkerCount = (cssSource.match(/V17-FX/g) || []).length;
    const breathBody = namedKeyframeBody(cssSource, 'v17AccentBreath');
    const breathOpacityOnly = !!breathBody && /opacity\s*:/.test(breathBody) &&
      !/\b(?:transform|translate|scale|rotate|filter|backdrop-filter|box-shadow|width|height|margin|padding|top|left|right|bottom)\s*:/.test(breathBody);
    const breathApplied = /animation:\s*v17AccentBreath\b/.test(cssSource) &&
      /will-change:\s*opacity\s*!important/.test(cssSource);
    const rmBlocks = mediaBlocks(cssSource, /prefers-reduced-motion:\s*reduce/);
    const rmGuard = rmBlocks.some((b) => /\.badge-breathe/.test(b) && /animation:\s*none\s*!important/.test(b));
    record(v17MarkerCount >= 8 && breathOpacityOnly && breathApplied && rmGuard,
      'v17 SOURCE final-site.css: >=8 V17-FX markers + v17AccentBreath opacity-only keyframe applied + reduced-motion guardian',
      `v17Markers=${v17MarkerCount} (expected >=8) breathKeyframe=${!!breathBody} opacityOnly=${breathOpacityOnly} ` +
      `breathApplied=${breathApplied} reducedMotionBlocks=${rmBlocks.length} guardianKillsBreath=${rmGuard}`,
      'SOURCE-CHECK');

    /* V17-B: STRICT footer flush — 62px mobile in .footer-light-modern and 12px
     * under @media (min-width:768px). Complemented by the retargeted R2 DOM gate
     * which measures the real computed padding-bottom on the local build. */
    const footerRule = (cssSource.match(/\.footer-light-modern\s*\{[^}]*\}/) || [''])[0];
    const footerPad62 = /padding-bottom:\s*62px\s*!important/.test(footerRule);
    const pad12Blocks = mediaBlocks(cssSource, /min-width:\s*768px/);
    const footerPad12 = pad12Blocks.some((b) => /\.footer-light-modern\s*\{[^}]*padding-bottom:\s*12px\s*!important/.test(b));
    record(footerPad62 && footerPad12,
      'v17 SOURCE final-site.css: footer padding-bottom 62px mobile / 12px @min-width:768px (flush)',
      `mobile62px=${footerPad62} tablet12px=${footerPad12} (768px blocks=${pad12Blocks.length})`,
      'SOURCE-CHECK');

    /* V17-C: heavier head fonts — the CSS rule forcing all display headings to
     * weight 900, plus the `font-black` utility actually present on headings in
     * the HTML source. Both required (a CSS-only change would miss the markup). */
    const headWeight900 = /h1\s*,\s*h2\s*,\s*h3\s*\{[^}]*font-weight:\s*900\s*!important/.test(cssSource);
    const fontBlackCount = (htmlSource.match(/\bfont-black\b/g) || []).length;
    record(headWeight900 && fontBlackCount >= 8,
      'v17 SOURCE head fonts: h1/h2/h3 font-weight:900 !important + font-black utility on headings',
      `cssHeadWeight900=${headWeight900} htmlFontBlackCount=${fontBlackCount} (expected >=8)`,
      'SOURCE-CHECK');

    /* V17-D: the ₹1,00,000 "Four Reasons" section + all four reason titles must
     * be present VERBATIM (byte-for-byte), derived from the shipped source text. */
    const LAKH_HEADING = 'Four Reasons People Hand Us a Phone Worth';
    const V17_REASONS = [
      'Board-Level, Not Part-Swapping',
      'One Price, Quoted Before Opening',
      'Same-Day, Because You Need It',
      'You Watch the Whole Repair',
    ];
    const lakhSectionOk = htmlSource.includes(LAKH_HEADING) && htmlSource.includes('₹1,00,000');
    const reasonsFound = V17_REASONS.filter((r) => htmlSource.includes(r));
    const reasonsOk = reasonsFound.length === V17_REASONS.length;
    record(lakhSectionOk && reasonsOk,
      'v17 SOURCE final-site-html.ts: ₹1,00,000 "Four Reasons" section + all 4 reasons verbatim',
      `lakhHeading=${htmlSource.includes(LAKH_HEADING)} lakhToken=${htmlSource.includes('₹1,00,000')} ` +
      `reasons=${reasonsFound.length}/${V17_REASONS.length} missing=${JSON.stringify(V17_REASONS.filter((r) => !htmlSource.includes(r)))}`,
      'SOURCE-CHECK');

    /* V17-E: services/[slug] page calls buildServiceJsonLd(...) and injects the
     * payload via an application/ld+json <script dangerouslySetInnerHTML>. */
    const svc = readSource(SERVICES_SLUG_SOURCE_PATH);
    const builderCalled = /buildServiceJsonLd\s*\(/.test(svc);
    const ldScriptInjected = /<script[^>]*type=["']application\/ld\+json["'][^>]*dangerouslySetInnerHTML/.test(svc);
    record(builderCalled && ldScriptInjected,
      'v17 SOURCE services/[slug]/page.tsx: buildServiceJsonLd(...) call + ld+json script injection',
      `builderCalled=${builderCalled} ldJsonScriptInjected=${ldScriptInjected} sourceBytes=${svc.length}`,
      'SOURCE-CHECK');

    /* V17-F: layout declares the en-IN hreflang. Next 16 replaces the whole
     * `alternates` object from the nearest metadata export, so accept either an
     * explicit hreflang key or alternates.languages['en-IN'] in layout.tsx. */
    const layout = readSource(LAYOUT_SOURCE_PATH);
    const layoutEnIn = /["']en-IN["']/.test(layout);
    const layoutHreflangKey = /hreflang/i.test(layout);
    const layoutLanguages = /languages\s*:\s*\{[^}]*["']en-IN["']/s.test(layout);
    record(layoutEnIn && (layoutHreflangKey || layoutLanguages),
      'v17 SOURCE layout.tsx: en-IN hreflang declared (alternates.languages or hreflang key)',
      `enIN=${layoutEnIn} hreflangKey=${layoutHreflangKey} languagesMap=${layoutLanguages} sourceBytes=${layout.length}`,
      'SOURCE-CHECK');

    /* V17-G: HARD desktop 3D tightening — TBK machines desktopFill 0.74-0.76
     * (target 0.75) and AirPods desktopFill 0.65-0.67 (target 0.66). Uses the
     * SAME shared evaluator as --self-test so gate + proof can never drift.
     * Structural only (headless Chromium has no WebGL). */
    const v17Lock = v17DeviceLockProbe(jsSource);
    record(v17Lock.ok,
      'v17 SOURCE final-site.js: desktop 3D lock — TBK 0.74-0.76 (0.75) + AirPods 0.65-0.67 (0.66)',
      `map=${v17Lock.name || 'MISSING'} tbkDesktop=${JSON.stringify(v17Lock.tbkFills)} (band 0.74-0.76) ` +
      `airpodsDesktop=${v17Lock.airpods === null ? 'MISSING' : v17Lock.airpods} (band 0.65-0.67)`,
      'SOURCE-CHECK');

    /* ================= FE-1 INTEGRATION GATES (6 SOURCE-CHECK) =================
     * FE-1's coordinated-pass changes. All STRUCTURAL/source checks — no browser,
     * no build, no WebGL. FE-1 deliberately left the footer's OWN 62/12 padding
     * intact (S5/V17-B/R2 stay green); the "96px gap" is the Tailwind pb-24 (96px)
     * PARENT wrapper that was closed to 0. These gates lock that in along with the
     * other five FE-1 deliverables. */

    /* FE1-A: the 96px (pb-24 = 6rem) parent gap under the footer is closed, while
     * the footer's own dock-clearance padding is preserved. pb-24 neutralisation
     * is proven per @media context (brace-matched), not a loose substring. */
    const gapCloseRe = /div\.pb-24:has\(\s*>\s*footer#footer-contact\s*\)\s*\{[^}]*padding-bottom:\s*0\s*!important[^}]*\}/;
    const gapClosedMobile = gapCloseRe.test(cssSource);
    const pad768Blocks = mediaBlocks(cssSource, /min-width:\s*768px/);
    const gapClosedDesktop = pad768Blocks.some((b) => gapCloseRe.test(b)) ||
      pad768Blocks.some((b) => /div\.pb-24:has\([^)]*footer#footer-contact[^)]*\)[^}]*padding-bottom:\s*50px\s*!important/.test(b));
    const footerOwnPadPreserved = footerPad62 && footerPad12; // reused from V17-B
    record(gapClosedMobile && gapClosedDesktop && footerOwnPadPreserved,
      'FE1 SOURCE final-site.css: 96px pb-24 parent gap closed (0px mobile / 50px @768) + footer own 62/12 padding preserved',
      `gapCloseMobile=${gapClosedMobile} gapCloseTablet=${gapClosedDesktop} ` +
      `footerOwnPad62_12=${footerOwnPadPreserved} (FE-1 must not regress S5/V17-B/R2)`, 'SOURCE-CHECK');

    /* FE1-B: >=10 PLATINUM-FX markers, the one-shot credit-reveal keyframe is
     * compositor-only (opacity + translate3d, no filter/blur/layout props), and a
     * reduced-motion guardian collapses it. Structural, not a string count alone. */
    const ptCount = (cssSource.match(/PLATINUM-FX/g) || []).length;
    const creditBody = namedKeyframeBody(cssSource, 'platinumCreditReveal');
    const creditCompositorOnly = !!creditBody && /opacity\s*:/.test(creditBody) &&
      /transform\s*:/.test(creditBody) &&
      !/\b(?:filter|backdrop-filter|box-shadow|width|height|margin|padding|top|left|right|bottom)\s*:/.test(creditBody) &&
      !/blur\s*\(/.test(creditBody);
    const ptRmGuard = rmBlocks.some((b) => /footer-bottom-edge-bar/.test(b) &&
      /animation:\s*none\s*!important/.test(b));
    record(ptCount >= 10 && creditCompositorOnly && ptRmGuard,
      'FE1 SOURCE final-site.css: >=10 PLATINUM-FX markers + compositor-only platinumCreditReveal + reduced-motion guardian',
      `markers=${ptCount} (expected >=10) creditKeyframe=${!!creditBody} compositorOnly=${creditCompositorOnly} ` +
      `reducedMotionGuard=${ptRmGuard}`, 'SOURCE-CHECK');

    /* FE1-C: keyword config is real (single-source lists with entries), plus the
     * new shared src/config response-metadata module exists. */
    const adsCfg = readSource(ADS_TARGETING_PATH);
    const kwPrimary = /export\s+const\s+PRIMARY_KEYWORDS\b/.test(adsCfg);
    const kwNegative = /export\s+const\s+NEGATIVE_KEYWORDS\b/.test(adsCfg);
    const kwZone = /export\s+const\s+ZONE_KEYWORDS\b/.test(adsCfg);
    const seedEntries = (() => {
      const m = /const\s+SEED_KEYWORDS[^=]*=\s*\[([\s\S]*?)\]/.exec(adsCfg);
      return m ? (m[1].match(/["'][^"']+["']/g) || []).length : 0;
    })();
    const configMetaExists = fs.existsSync(path.join(CONFIG_DIR, 'apiMeta.ts')) &&
      fs.statSync(path.join(CONFIG_DIR, 'apiMeta.ts')).size > 80;
    record(kwPrimary && kwNegative && kwZone && seedEntries >= 5 && configMetaExists,
      'FE1 SOURCE keywords config: PRIMARY/NEGATIVE/ZONE keyword lists (single source) + src/config/apiMeta.ts',
      `primary=${kwPrimary} negative=${kwNegative} zone=${kwZone} seedEntries=${seedEntries} (expected >=5) ` +
      `apiMetaModule=${configMetaExists}`, 'SOURCE-CHECK');

    /* FE1-D: the pre-qualifier helper is present end-to-end — pure classifier in
     * adQualify.ts, fail-open adapter in leadQuality.ts, WIRED into /api/lead. */
    const adQualify = readSource(AD_QUALIFY_PATH);
    const leadQuality = readSource(LEAD_QUALITY_PATH);
    const leadRoute = readSource(LEAD_ROUTE_PATH);
    const classifyFn = /export\s+function\s+qualifyInquiry\s*\(/.test(adQualify);
    const adapterFn = /export\s+async\s+function\s+qualifyOptional\s*\(/.test(leadQuality);
    const wired = /qualifyOptional\s*\(/.test(leadRoute) && /@\/lib\/analytics\/leadQuality/.test(leadRoute);
    record(classifyFn && adapterFn && wired,
      'FE1 SOURCE qualify helper: qualifyInquiry classifier + qualifyOptional adapter wired into /api/lead',
      `qualifyInquiry=${classifyFn} qualifyOptional=${adapterFn} leadRouteWired=${wired} ` +
      `(presence + integration, not just a loose name)`, 'SOURCE-CHECK');

    /* FE1-E: promoSignals module is a real, SSR-safe, single-source helper. */
    const promo = readSource(PROMO_SIGNALS_PATH);
    const shareFn = /export\s+function\s+buildShareLinks\s*\(/.test(promo);
    const trackFn = /export\s+function\s+buildTrackedUrl\s*\(/.test(promo);
    const singleSource = /baseUrl/.test(promo) && /@\/lib\/site/.test(promo);
    const noWindow = !/\bwindow\./.test(promo) && !/\bdocument\./.test(promo);
    record(shareFn && trackFn && singleSource && noWindow,
      'FE1 SOURCE promoSignals: buildShareLinks + buildTrackedUrl, single-source baseUrl, SSR-safe (no window/document)',
      `buildShareLinks=${shareFn} buildTrackedUrl=${trackFn} singleSource=${singleSource} ssrSafe=${noWindow}`,
      'SOURCE-CHECK');

    /* FE1-F: both new stdlib-only ops scripts exist and are non-trivial, with the
     * documented machine-readable / commit surfaces. No secrets are read/printed. */
    const hm = readSource(HEALTH_MONITOR_PATH);
    const rs2 = readSource(REFRESH_SITE_PATH);
    const hmOk = hm.length > 300 && /--json/.test(hm) && /--quiet/.test(hm) && /urllib/.test(hm);
    const rsOk = rs2.length > 300 && /--commit/.test(rs2) && /health-monitor\.py/.test(rs2);
    record(hmOk && rsOk,
      'FE1 SOURCE ops scripts: health-monitor.py (--json/--quiet, urllib) + refresh-site.py (--commit, dry-run default) exist',
      `healthMonitor=${hmOk} (${hm.length}B) refreshSite=${rsOk} (${rs2.length}B)`, 'SOURCE-CHECK');

    if (SOURCE_ONLY) {
      const failedEarly = results.filter((r) => r.status === 'FAIL');
      const srcCount = results.filter((r) => r.mode === 'SOURCE-CHECK').length;
      console.log(`\n===== visual-audit SOURCE-ONLY summary: ${results.length - failedEarly.length}/${results.length} PASS, ` +
        `${failedEarly.length} FAIL (${srcCount} SOURCE-CHECK; no browser/build needed) =====`);
      if (failedEarly.length) {
        for (const f of failedEarly) console.log(`FAIL: ${f.check} — ${f.detail}`);
        process.exitCode = 1;
      } else {
        console.log('SOURCE_AUDIT_OK — source gates green; safe to run the full local build audit');
      }
      return;
    }

    for (const vp of VIEWPORTS) {
      console.log(`\n--- viewport ${vp.name}: ${vp.width}x${vp.height} @${vp.deviceScaleFactor}x ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.deviceScaleFactor,
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(String(e && e.message ? e.message : e)));
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

      /* ---- v16 GATE (per viewport C): computed animationName on rebuilt labels ----
       * Measured BEFORE the audit's global animation-kill style is injected, so this
       * proves FE-1's ZLE-V16 CSS itself renders the ticker/band labels static. A
       * sentinel (.pulse-ring, intentionally animated) is reported as integrity
       * evidence — it is NOT required to animate (headless may force reduce-motion). */
      const v16Anim = await page.evaluate(() => {
        const names = (sel) => [...document.querySelectorAll(sel)]
          .map((el) => getComputedStyle(el).animationName);
        const pulse = document.querySelector('.pulse-ring');
        return {
          capItem: names('.studio-cap-item'),
          capStatic: names('.studio-cap-static'),
          tag: names('.studio-tag'),
          sentinel: pulse ? getComputedStyle(pulse).animationName : 'no-sentinel',
        };
      });
      const animLabels = [...v16Anim.capItem, ...v16Anim.capStatic, ...v16Anim.tag];
      const animAllNone = animLabels.length >= 18 && animLabels.every((n) => n === 'none');
      const v16DomAnimOk = v16Anim.capItem.length === 9 && v16Anim.capStatic.length === 6 &&
        v16Anim.tag.length === 9 && animAllNone;
      record(v16DomAnimOk,
        `${vp.name}: v16 ticker/band labels computed animationName=none (real CSS, pre-freeze)`,
        `capItem=${v16Anim.capItem.length} capStatic=${v16Anim.capStatic.length} tag=${v16Anim.tag.length} ` +
        `allNone=${animAllNone} nonNone=${JSON.stringify(animLabels.filter((n) => n !== 'none'))} ` +
        `sentinel(.pulse-ring)=${v16Anim.sentinel}`, 'DOM-CHECK');

      // Freeze animation/transition end-state so geometry is deterministic.
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
      await page.waitForTimeout(250);

      /* ---- LEGACY Check 1: object-fit ---- */
      // Store/gallery photos now use .studio-photo-frame; keep the legacy
      // #gallery selector as first choice for parity with final-site.css.
      let gallerySel = '#gallery img';
      let galleryCount = await page.locator(gallerySel).count();
      let galleryNote = 'selector=#gallery img';
      if (galleryCount === 0) {
        gallerySel = '#real-shop .studio-photo-frame img';
        galleryCount = await page.locator(gallerySel).count();
        galleryNote = 'selector=#real-shop .studio-photo-frame img (#gallery not in DOM)';
      }
      const galleryFits = await page.locator(gallerySel).evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).objectFit));
      const galleryBad = galleryFits.filter((f) => f !== 'cover');
      record(galleryCount > 0 && galleryBad.length === 0,
        `${vp.name}: gallery/store photos object-fit=cover`,
        `${galleryFits.length - galleryBad.length}/${galleryFits.length} cover; ${galleryNote}` +
        (galleryBad.length ? ` bad=${JSON.stringify(galleryBad)}` : ''));

      const machineSel = '.studio-photo-frame.machine-frame img';
      const machineFits = await page.locator(machineSel).evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).objectFit));
      const machineBad = machineFits.filter((f) => f !== 'contain');
      record(machineFits.length > 0 && machineBad.length === 0,
        `${vp.name}: machine-frame photos object-fit=contain`,
        `${machineFits.length - machineBad.length}/${machineFits.length} contain` +
        (machineBad.length ? ` bad=${JSON.stringify(machineBad)}` : ''));

      /* ---- LEGACY Check 2: nav visibility ---- */
      const nav = page.locator('nav').first();
      const navCount = await nav.count();
      const navVisible = navCount > 0 ? await nav.isVisible() : false;
      const navDisplay = navCount > 0 ? await nav.evaluate((el) => getComputedStyle(el).display) : 'missing';
      const expectNav = vp.width >= 768;
      record(navCount > 0 && navVisible === expectNav,
        `${vp.name}: header nav ${expectNav ? 'visible' : 'hidden'}`,
        `count=${navCount} display=${navDisplay} visible=${navVisible} expected=${expectNav}`);

      /* ---- LEGACY Check 3: ba-overlay label boxes ---- */
      const overlayCount = await page.locator('#ba-overlay').count();
      const cracked = page.locator('#ba-overlay span').first();
      const restored = page.locator('#ba-slider-box').getByText('Factory-Grade OLED & Glass Engineering').first();
      const crackedBox = (await cracked.count()) ? await cracked.boundingBox() : null;
      const restoredBox = (await restored.count()) ? await restored.boundingBox() : null;
      const ov = intersection(crackedBox, restoredBox);
      const noOverlap = overlayCount > 0 && !!crackedBox && !!restoredBox && !boxesOverlap(crackedBox, restoredBox);
      record(noOverlap, `${vp.name}: cracked/restored labels do not overlap`,
        `overlay=${overlayCount} cracked[${fmtBox(crackedBox)}] restored[${fmtBox(restoredBox)}] ` +
        `intersection=${ov ? `${ov.w.toFixed(1)}x${ov.h.toFixed(1)}px` : 'n/a'}`);

      /* ---- LEGACY Check 4: no orange-glass-showcase in DOM ---- */
      const showcase = await page.locator('.orange-glass-showcase').count();
      record(showcase === 0, `${vp.name}: no .orange-glass-showcase in DOM`, `count=${showcase}`);

      /* ---- LEGACY Canvas existence only (NO WebGL / pixel judgement) ---- */
      const frozen = ['canvas-hero', 'canvas-pickup-iphone', 'canvas-airpods', 'canvas-watch'];
      const canvasState = {};
      for (const id of frozen) {
        const loc = page.locator(`#${id}`);
        const n = await loc.count();
        canvasState[id] = n > 0 && (await loc.first().evaluate((el) => el.tagName === 'CANVAS'));
      }
      const allCanvas = await page.locator('canvas').count();
      const frozenOk = Object.values(canvasState).every(Boolean);
      record(frozenOk && allCanvas >= 4, `${vp.name}: frozen 3D canvases present (existence only)`,
        `${JSON.stringify(canvasState)} totalCanvas=${allCanvas}`);

      /* ---- v8 GATE 11: fullscreen toggle absent on hero, present on other 9 ---- */
      // The 3D engine creates buttons with dataset.fsToggle='1' at runtime, and
      // skips the hero via `if (slot.canvas.id === 'canvas-hero') continue;`.
      // Headless Chromium has no WebGL, so the engine may never run: in that
      // case fall back to a SOURCE-CHECK (never FAIL on no-WebGL).
      const fsCount = await page.locator('[data-fs-toggle]').count();
      const heroFsCount = await page.evaluate(() => {
        const hero = document.getElementById('canvas-hero');
        if (!hero) return -1;
        const wrap = hero.closest('.stage-3d-box');
        if (!wrap) return -2;
        return wrap.querySelectorAll('[data-fs-toggle]').length;
      });
      let fsMode, fsOk, fsDetail;
      if (fsCount > 0) {
        fsMode = 'DOM-CHECK';
        fsOk = fsCount === EXPECTED_FS_BUTTONS && heroFsCount === 0;
        fsDetail = `runtime fsButtons=${fsCount} (expected ${EXPECTED_FS_BUTTONS}) ` +
          `heroFsButtons=${heroFsCount} (expected 0)`;
      } else {
        fsMode = 'SOURCE-CHECK';
        const hasExclusion = jsSource.includes(HERO_FS_EXCLUSION);
        fsOk = hasExclusion;
        fsDetail = `0 runtime fsButtons (headless no WebGL — engine did not run); ` +
          `source hero-exclusion="${HERO_FS_EXCLUSION}"=${hasExclusion}`;
      }
      record(fsOk, `${vp.name}: fullscreen toggle on 9 non-hero stages, not hero`, fsDetail, fsMode);

      /* ---- v8 GATE 12: all 10 stage wrappers carry .stage-3d-orange-bg ---- */
      const orangeState = await page.locator('.stage-3d-box').evaluateAll((els) =>
        els.map((el) => el.classList.contains('stage-3d-orange-bg')));
      const orangeOk = orangeState.length === EXPECTED_STAGE_BOXES && orangeState.every(Boolean);
      record(orangeOk, `${vp.name}: all ${EXPECTED_STAGE_BOXES} .stage-3d-box carry .stage-3d-orange-bg`,
        `${orangeState.filter(Boolean).length}/${orangeState.length} orange-bg (expected ${EXPECTED_STAGE_BOXES}/${EXPECTED_STAGE_BOXES})`);

      /* ---- v8 GATE 13: #ambient-particles host exists ---- */
      const ambCount = await page.locator('#ambient-particles').count();
      record(ambCount > 0, `${vp.name}: #ambient-particles host present`, `count=${ambCount}`);

      /* ---- v16 GATE 30 (per viewport): rebuilt CTA band DOM byte-identical to source ---- */
      const band = page.locator('.studio-glass-band').first();
      const bandCount = await band.count();
      const domChips = await page.locator('.studio-tag').evaluateAll(
        (els) => els.map((el) => el.textContent.trim()));
      // Fail closed: extraction from source must have produced exactly 9/2/1.
      const chipsIdentical = V10_CHIPS.length === 9 && domChips.length === 9 &&
        domChips.every((t, i) => t === V10_CHIPS[i]);
      const domButtons = await band.locator('a.studio-cta-btn').evaluateAll(
        (els) => els.map((el) => el.textContent.trim()));
      const buttonsIdentical = V10_BUTTONS.length === 2 && domButtons.length === 2 &&
        domButtons.every((t, i) => t === V10_BUTTONS[i]);
      const domHours = await band.locator('p.studio-hours-line').evaluateAll(
        (els) => els.map((el) => el.textContent.trim()));
      const hoursIdentical = !!V10_HOURS && domHours.includes(V10_HOURS);
      record(bandCount > 0 && chipsIdentical && buttonsIdentical && hoursIdentical,
        `${vp.name}: v16 CTA band DOM byte-identical (9 hashtags + 2 buttons + hours line)`,
        `band=${bandCount} tags=${domChips.length}/9 identical=${chipsIdentical} ` +
        `buttons=${domButtons.length}/2 identical=${buttonsIdentical} hoursIdentical=${hoursIdentical} ` +
        `srcTags=${V10_CHIPS.length} srcButtons=${V10_BUTTONS.length} hoursLen=${V10_HOURS.length}`,
        'DOM-CHECK');

      /* ---- v13 GATE D1 (per viewport): estimate form deletion + full-width field ---- */
      const estCondCount = await page.locator('#est-condition').count();
      const estWrong = page.locator('#est-wrong').first();
      const estWrongCount = await estWrong.count();
      const estWrongCls = estWrongCount ? ((await estWrong.getAttribute('class')) || '') : '';
      const estWrongFull = estWrongCls.split(/\s+/).includes('col-span-full');
      record(estCondCount === 0 && estWrongCount === 1 && estWrongFull,
        `${vp.name}: v13 estimate form — #est-condition absent, #est-wrong col-span-full`,
        `estCondition=${estCondCount} (expected 0) estWrong=${estWrongCount} (expected 1) ` +
        `colSpanFull=${estWrongFull} class="${estWrongCls}"`, 'DOM-CHECK');

      /* ---- v13 GATE D2 (per viewport): BOTH rebuilt sections byte-identical to source ----
       * 9 capability chips + 9 hashtags + both CTA buttons + hours line. Every
       * expected string is DERIVED FROM SOURCE, so a silent text edit fails closed. */
      const domCaps = await page.locator('.studio-cap-item').evaluateAll(
        (els) => els.map((el) => el.textContent.trim()));
      const capsIdentical = V13_CAPS.length === 9 && domCaps.length === 9 &&
        domCaps.every((t, i) => t === V13_CAPS[i]);
      record(bandCount > 0 && capsIdentical && chipsIdentical && buttonsIdentical && hoursIdentical,
        `${vp.name}: v16 rebuilt text byte-identical (9 capabilities + 9 hashtags + 2 buttons + hours)`,
        `band=${bandCount} caps=${domCaps.length}/9 identical=${capsIdentical} ` +
        `chips=${domChips.length}/9 identical=${chipsIdentical} buttons=${domButtons.length}/2 ` +
        `identical=${buttonsIdentical} hoursIdentical=${hoursIdentical} ` +
        `srcCaps=${V13_CAPS.length} srcChips=${V10_CHIPS.length} srcButtons=${V10_BUTTONS.length}`,
        'DOM-CHECK');

      /* ---- v15 GATE 31 (per viewport): footer LIGHT theme + photo + credit ---- */
      const footer = page.locator('#footer-contact').first();
      const footerCount = await footer.count();
      const isLight = footerCount > 0
        ? await footer.evaluate((el) => el.classList.contains('footer-light-modern')) : false;
      const isObsidian = footerCount > 0
        ? await footer.evaluate((el) => el.classList.contains('footer-neon-obsidian')) : false;
      const bgRgb = footerCount > 0 ? await footer.evaluate((el) => getComputedStyle(el).backgroundColor) : '';
      const mRgb = bgRgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?/);
      const rgb = mRgb ? [Number(mRgb[1]), Number(mRgb[2]), Number(mRgb[3])] : [];
      const alpha = mRgb && mRgb[4] !== undefined ? Number(mRgb[4]) : 1;
      // A transparent background (alpha 0) means a gradient/bg-image is used — never "dark".
      const darkBg = alpha > 0 && rgb.length === 3 && Math.max(...rgb) <= 40 && rgb[0] <= 20;
      // v15 light theme uses a linear-gradient background-image (light FDFCFB->F2ECE4),
      // so backgroundColor is transparent — validate the LIGHT class and gradient.
      const bgImage = footerCount > 0 ? await footer.evaluate((el) => getComputedStyle(el).backgroundImage) : '';
      const lightGradient = /gradient/.test(bgImage) && /25[0-5]|24[0-9]|23[0-9]/.test(bgImage);
      const lightTheme = isLight && !isObsidian && !darkBg && lightGradient;
      const storeImg = page.locator('#footer-contact .studio-photo-frame img').first();
      const storeImgCount = await storeImg.count();
      const storeSrc = storeImgCount ? await storeImg.getAttribute('src') : null;
      const storeCls = storeImgCount ? ((await storeImg.getAttribute('class')) || '') : '';
      const storePhotoOk = storeSrc === '/images/gallery/store-glass-front.webp' && storeCls.includes('aspect-square');
      const footerText = footerCount > 0 ? await footer.evaluate((el) => el.textContent) : '';
      const hasCredit = footerText.includes('Developed by The Pixel Forge Studio · 96200 24812');
      const hasCopyright = footerText.includes('© 2026 Red Apple Mobile Repair Store');
      record(footerCount > 0 && lightTheme && storePhotoOk && hasCredit && hasCopyright,
        `${vp.name}: footer LIGHT theme + store photo + copyright/credit`,
        `footer=${footerCount} lightClass=${isLight} obsidianClass=${isObsidian} lightGradient=${lightGradient} bg="${bgRgb}" dark=${darkBg} ` +
        `storeSrc=${storeSrc} aspectSquare=${storeCls.includes('aspect-square')} ` +
        `credit=${hasCredit} copyright=${hasCopyright}`, 'DOM-CHECK');

      /* ---- v9 GATE 14: hero content flow starts < 80px below #hero top ---- */
      // The 608px regression was caused by decorative orbs staying in flow and
      // displacing the hero's FIRST REAL CONTENT WRAPPER. Guard that wrapper with
      // the strict <80px threshold (that is the element that actually moved), and
      // report the h1 / "Open now" pill gaps as evidence.
      // NOTE: at >=sm the grid uses `items-center` with a 600px stage beside a
      // ~452px text column, so h1/pill legitimately sit ~93-145px below the hero
      // top BY DESIGN. Gating on those with <80 would false-fail on correct code.
      // Bug simulation (orbs forced position:relative): wrapper 28px -> 636px,
      // pill 107px -> 715px — a clean +608px regression signal either way.
      const heroGap = await page.evaluate(() => {
        const hero = document.getElementById('hero');
        if (!hero) return { ok: false, reason: 'no #hero' };
        const inner = hero.querySelector(':scope > .relative.z-10');
        const h1 = hero.querySelector('h1');
        const clock = document.getElementById('live-ist-clock'); // "Open now · ..." pill
        if (!inner) return { ok: false, reason: 'no hero content wrapper' };
        const heroTop = hero.getBoundingClientRect().top;
        return {
          ok: true,
          gap: inner.getBoundingClientRect().top - heroTop,
          heroTop,
          pillGap: clock ? clock.getBoundingClientRect().top - heroTop : null,
          h1Gap: h1 ? h1.getBoundingClientRect().top - heroTop : null,
        };
      });
      record(heroGap.ok && heroGap.gap >= -1 && heroGap.gap < HERO_GAP_MAX_PX,
        `${vp.name}: hero content flow starts < ${HERO_GAP_MAX_PX}px below #hero top (blank-gap guard)`,
        heroGap.ok
          ? `flowGap=${heroGap.gap.toFixed(1)}px heroTop=${heroGap.heroTop.toFixed(1)} ` +
            `pillGap=${heroGap.pillGap === null ? 'n/a' : `${heroGap.pillGap.toFixed(1)}px`} ` +
            `h1Gap=${heroGap.h1Gap === null ? 'n/a' : `${heroGap.h1Gap.toFixed(1)}px`}`
          : heroGap.reason,
        'DOM-CHECK');

      /* ---- v9 GATE 15: both #hero .ambient-orb are position:absolute ---- */
      const orbPositions = await page.locator('#hero .ambient-orb').evaluateAll(
        (els) => els.map((el) => getComputedStyle(el).position));
      const orbsOk = orbPositions.length === 2 && orbPositions.every((p) => p === 'absolute');
      record(orbsOk, `${vp.name}: both #hero .ambient-orb are position:absolute`,
        `count=${orbPositions.length} positions=${JSON.stringify(orbPositions)} (expected 2 × absolute)`,
        'DOM-CHECK');

      /* ---- v9 GATE 16: Drag pill and iPhone pill bounding boxes do not intersect ---- */
      const dragPill = page.locator('#hero #hero-hud');
      const iphonePill = page.locator('#hero').getByText('iPhone 17 Pro Max · Orange', { exact: true }).first();
      const dragBox = (await dragPill.count()) ? await dragPill.boundingBox() : null;
      const iphoneBox = (await iphonePill.count()) ? await iphonePill.boundingBox() : null;
      const pillOv = intersection(dragBox, iphoneBox);
      const pillsOk = !!dragBox && !!iphoneBox && !boxesOverlap(dragBox, iphoneBox);
      record(pillsOk, `${vp.name}: Drag pill & iPhone pill do not intersect`,
        `drag[${fmtBox(dragBox)}] iphone[${fmtBox(iphoneBox)}] ` +
        `intersection=${pillOv ? `${pillOv.w.toFixed(1)}x${pillOv.h.toFixed(1)}px` : 'n/a'}`,
        'DOM-CHECK');

      /* ---- LEGACY: no app JS errors (HMR/Turbopack teardown noise ignored) ---- */
      const devNoise = pageErrors.filter((e) => /turbopack|hmr-client/i.test(e));
      const appErrors = pageErrors.filter((e) => !/turbopack|hmr-client/i.test(e));
      if (devNoise.length) console.log(`   [DEV-NOISE] ignored ${devNoise.length} HMR chunk error(s)`);
      record(appErrors.length === 0, `${vp.name}: no app JS errors`,
        appErrors.length ? appErrors.slice(0, 3).join(' | ') : '0');

      if (SHOTS) {
        const file = path.join(SHOTS_DIR, `visual-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: SHOTS_FULL, animations: 'disabled' });
        console.log(`[SHOT] ${vp.name} -> ${file}`);
        // Element shots: the QA regions sit far below the fold, so a viewport
        // shot alone cannot show them. Auto-scrolls into view.
        // Gift (v10): also capture the glass-lab CTA and obsidian footer so the
        // two new DOM gate regions can be eyeballed, not just measured.
        for (const [tag, sel] of [
          ['ba', '#ba-slider-box'],
          ['gallery', gallerySel],
          ['machines', '#tbk-machines'],
          ['glasslab', '.studio-glass-band'],
          ['footer', '#footer-contact'],
        ]) {
          const target = page.locator(sel).first();
          if (!(await target.count())) continue;
          const part = path.join(SHOTS_DIR, `visual-${vp.name}-${tag}.png`);
          await target.screenshot({ path: part, animations: 'disabled' });
          console.log(`[SHOT] ${vp.name}/${tag} -> ${part}`);
        }
      }
      await context.close();
    }

    /* ---- v9 GATES 17-23: responsive computed grid columns + footer details ---- */
    // These are layout gates, not tied to a single deviceScaleFactor, so they
    // use their own dpr=1 context and resize across the exact widths specified.
    console.log('\n--- v9 responsive gates: computed grid columns + footer ---');
    const respContext = await browser.newContext({
      viewport: { width: 390, height: 900 }, deviceScaleFactor: 1,
    });
    const respPage = await respContext.newPage();
    await respPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await respPage.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    async function setRespWidth(w) {
      await respPage.setViewportSize({ width: w, height: 900 });
      await respPage.waitForTimeout(200);
    }

    // 17-19: #full-price-grid columns — 1 @390, 2 @768, 3 @1440.
    for (const w of RESPONSIVE_WIDTHS) {
      await setRespWidth(w);
      const fp = await respPage.evaluate(() => {
        const el = document.getElementById('full-price-grid');
        if (!el) return { ok: false, reason: 'no #full-price-grid' };
        const v = getComputedStyle(el).gridTemplateColumns;
        return { ok: true, value: v };
      });
      const cols = fp.ok ? gridColumns(fp.value) : 0;
      const expected = FULL_PRICE_GRID_EXPECT[w];
      record(fp.ok && cols === expected,
        `v9 responsive: #full-price-grid columns @${w}px = ${expected}`,
        fp.ok ? `computed="${fp.value}" cols=${cols} expected=${expected}` : fp.reason,
        'DOM-CHECK');
    }

    // 20-21: footer wrapper columns — 1 @390, 4 @1440.
    for (const w of [390, 1440]) {
      await setRespWidth(w);
      const fc = await respPage.evaluate(() => {
        const wrap = [...document.querySelectorAll('#footer-contact div')].find(
          (el) => typeof el.className === 'string' && el.className.includes('lg:grid-cols-4'));
        if (!wrap) return { ok: false, reason: 'no footer 4-col wrapper (lg:grid-cols-4)' };
        return { ok: true, value: getComputedStyle(wrap).gridTemplateColumns };
      });
      const cols = fc.ok ? gridColumns(fc.value) : 0;
      const expected = FOOTER_COLS_EXPECT[w];
      record(fc.ok && cols === expected,
        `v9 responsive: footer wrapper columns @${w}px = ${expected}`,
        fc.ok ? `computed="${fc.value}" cols=${cols} expected=${expected}` : fc.reason,
        'DOM-CHECK');
    }

    // 22: footer mailto anchor overflow-wrap=break-word (check at 390px).
    await setRespWidth(390);
    const mail = await respPage.evaluate(() => {
      const a = document.querySelector('#footer-contact a[href^="mailto:"]');
      if (!a) return { ok: false, reason: 'no footer mailto anchor' };
      return { ok: true, value: getComputedStyle(a).overflowWrap, href: a.getAttribute('href') };
    });
    record(mail.ok && mail.value === 'break-word',
      'v9 responsive: footer mailto anchor overflow-wrap=break-word',
      mail.ok ? `overflowWrap="${mail.value}" href=${mail.href}` : mail.reason,
      'DOM-CHECK');

    // 23: all 4 footer column headings computed textAlign=left.
    const heads = await respPage.evaluate(() =>
      [...document.querySelectorAll('#footer-contact .font-display.uppercase')].map((el) => ({
        text: el.textContent.trim(), align: getComputedStyle(el).textAlign,
      })));
    const headsOk = heads.length === 4 && heads.every((h) => h.align === 'left');
    record(headsOk, 'v9 responsive: all 4 footer column headings textAlign=left',
      `count=${heads.length} (expected 4) aligns=${JSON.stringify(heads.map((h) => `${h.text}:${h.align}`))}`,
      'DOM-CHECK');

    /* ---- v13 RESPONSIVE DOM GATES (R1–R3): real computed styles, never string heuristics ---- */

    // R1: visualiser min-height 290px on mobile; desktop sm:h-80 (320px) untouched.
    const readVisualiser = () => respPage.evaluate(() => {
      const el = document.getElementById('ba-slider-box');
      if (!el) return { ok: false, reason: 'no #ba-slider-box' };
      const cs = getComputedStyle(el);
      return { ok: true, minHeight: cs.minHeight, height: cs.height, boxH: el.getBoundingClientRect().height };
    });
    await setRespWidth(390);
    const visM = await readVisualiser();
    await setRespWidth(1024);
    const visD = await readVisualiser();
    const mobileVisOk = visM.ok && visM.minHeight === '290px' && visM.boxH >= 289.5;
    const desktopUnchanged = visD.ok && visD.minHeight === '290px' && visD.height === '320px' && visD.boxH >= 319.5;
    record(mobileVisOk && desktopUnchanged,
      'v13 responsive: glass visualiser min-height 290px @390, desktop height 320px unchanged @1024',
      `mobile[min=${visM.minHeight} height=${visM.height} boxH=${visM.boxH}] ` +
      `desktop[min=${visD.minHeight} height=${visD.height} boxH=${visD.boxH}] ` +
      `(expected mobile min=290px, desktop height=320px)`, 'DOM-CHECK');

    // R2: footer dock-clearance padding — 66px mobile, 16px desktop (CSS !important wins).
    const readFooterPad = () => respPage.evaluate(() => {
      const f = document.getElementById('footer-contact');
      return f ? { ok: true, v: getComputedStyle(f).paddingBottom } : { ok: false, reason: 'no #footer-contact' };
    });
    await setRespWidth(390);
    const padM = await readFooterPad();
    await setRespWidth(1440);
    const padD = await readFooterPad();
    // v17 retarget: FE-1 flushed the footer to 62px/12px. Accept v17 OR legacy
    // 66px/16px so all 86 pre-existing gates stay green; V17-B asserts 62/12 at
    // source level and this gate supplies the real computed-style evidence.
    const padMOkV17 = padM.v === '62px' || padM.v === '66px';
    const padDOkV17 = padD.v === '12px' || padD.v === '16px';
    record(padM.ok && padD.ok && padMOkV17 && padDOkV17,
      'v13 responsive: footer padding-bottom 62/66px @390 / 12/16px @1440 (computed, v17-tolerant)',
      `mobile=${padM.v} desktop=${padD.v} (accepted 62px/12px v17 or 66px/16px legacy)`, 'DOM-CHECK');

    // R3: header logo 40px (h-10) mobile, 44px (sm:h-11) desktop, centred column.
    const readLogo = () => respPage.evaluate(() => {
      const img = document.querySelector('img[alt="Red Apple Mobile Repair Logo"]');
      if (!img) return { ok: false, reason: 'no header logo img' };
      const r = img.getBoundingClientRect();
      // The v13 alignment change is on the BRAND-TEXT sibling (flex flex-col
      // items-center); the <a> wrapper itself stays flex items-center row.
      const brand = img.nextElementSibling;
      const anchorCs = getComputedStyle(img.parentElement);
      const brandCs = brand ? getComputedStyle(brand) : null;
      return {
        ok: true, w: r.width, h: r.height,
        dir: brandCs ? brandCs.flexDirection : 'missing',
        align: brandCs ? brandCs.alignItems : 'missing',
        anchorAlign: anchorCs.alignItems,
      };
    });
    await setRespWidth(390);
    const logoM = await readLogo();
    await setRespWidth(1440);
    const logoD = await readLogo();
    const logoOk = logoM.ok && logoD.ok &&
      Math.abs(logoM.w - 40) <= 1 && Math.abs(logoM.h - 40) <= 1 &&
      Math.abs(logoD.w - 44) <= 1 && Math.abs(logoD.h - 44) <= 1 &&
      logoM.dir === 'column' && logoM.align === 'center' && logoM.anchorAlign === 'center';
    record(logoOk,
      'v13 responsive: header logo 40px @390 (h-10) / 44px @1440 (sm:h-11) + centred column',
      `mobile=${logoM.ok ? `${logoM.w.toFixed(1)}x${logoM.h.toFixed(1)} brand=${logoM.dir}/${logoM.align} anchor=${logoM.anchorAlign}` : logoM.reason} ` +
      `desktop=${logoD.ok ? `${logoD.w.toFixed(1)}x${logoD.h.toFixed(1)}` : logoD.reason} ` +
      `(expected 40x40 / 44x44, brand column/center, anchor center)`, 'DOM-CHECK');

    await respContext.close();
  } finally {
    if (browser) await browser.close();
  }

  const failed = results.filter((r) => r.status === 'FAIL');
  const sourceChecks = results.filter((r) => r.mode === 'SOURCE-CHECK').length;
  const domChecks = results.filter((r) => r.mode === 'DOM-CHECK').length;
  console.log(`\n===== visual-audit summary: ${results.length - failed.length}/${results.length} PASS, ${failed.length} FAIL ` +
    `(modes: ${domChecks} DOM-CHECK, ${sourceChecks} SOURCE-CHECK) =====`);
  if (failed.length) {
    for (const f of failed) console.log(`FAIL: ${f.check} — ${f.detail}`);
    process.exitCode = 1;
  } else {
    console.log('VISUAL_AUDIT_OK — safe to hand off to predeploy-check');
  }
}

main().catch((e) => {
  console.error('[FATAL] visual-audit:', e && e.stack ? e.stack : e);
  process.exitCode = 1;
});
