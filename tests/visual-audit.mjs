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
 * GATES (64 total = 34 legacy/v8 + 16 v9 + 12 v10 + 2 v14):
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
  // v8 source snapshots (global gates + fullscreen fallback).
  const jsSource = readSource(JS_SOURCE_PATH);
  const cssSource = readSource(CSS_SOURCE_PATH);
  const htmlSource = readSource(HTML_SOURCE_PATH);

  // v10 expected DOM texts are DERIVED FROM SOURCE so the DOM gate compares
  // real source<->DOM byte identity (never a hardcoded copy that can drift).
  // If extraction fails the gate fails closed (length/emptiness assertions below).
  const V10_CHIPS = extractAll(htmlSource, /<span class="lab-hash-chip">([^<]*)<\/span>/g);
  const V10_BUTTONS = extractAll(htmlSource, /<a[^>]*class="[^"]*cta-tactile[^"]*"[^>]*>([^<]*)<\/a>/g)
    .map((s) => s.trim());
  const hoursMatch = htmlSource.match(/<p class="mt-2\.5[^"]*">(Store open[^<]*)<\/p>/);
  const V10_HOURS = hoursMatch ? hoursMatch[1].trim() : '';

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
    const hasMacbookTier = /['"]canvas-macbook['"]\s*:\s*\{\s*fill:\s*0\.9[4-9]\b/.test(framingBlock);
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

    /* ---- v10 GLOBAL SOURCE Gate 25: glass-lab CTA (zero-jitter) source ---- */
    const hasCtaBand = htmlSource.includes('glass-lab-cta-band');
    const chipCountSrc = (htmlSource.match(/class="lab-hash-chip"/g) || []).length;
    const cssBandContain = /\.glass-lab-cta-band\s*\{[^}]*contain:\s*layout style/.test(cssSource);
    const cssChipShadow = /\.lab-hash-chip\s*\{[^}]*box-shadow:\s*none/.test(cssSource);
    record(hasCtaBand && chipCountSrc === 9 && cssBandContain && cssChipShadow,
      'v10 SOURCE glass-lab CTA: band + 9 chips, CSS box-shadow:none + contain:layout style',
      `band=${hasCtaBand} chipCount=${chipCountSrc} (expected 9) cssContain=${cssBandContain} ` +
      `cssChipShadowNone=${cssChipShadow}`, 'SOURCE-CHECK');

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
    const macbookHighest = macbookFill !== undefined &&
      macbookFill >= maxFill - 1e-9 && airpodsFill !== undefined && macbookFill > airpodsFill;
    const airpodsEased = airpodsFill !== undefined && airpodsFill < maxFill &&
      airpodsFill < Math.max(...nonAirpods.map(([, v]) => v));
    const tabletToken = /\b(?:isTablet|tabletFill|wideFill|widerFill|fillWide|landscapeFill)\b/
      .test(framingBlock + fitFn);
    const tabletIdCond = /id\s*===?\s*['"][^'"]*(?:ipad|tablet)[^'"]*['"]/i.test(fitFn);
    const tabletWider = tabletToken || tabletIdCond;
    const capMatch = /Math\.min\(\s*([01](?:\.\d+)?)\s*,\s*cfg\.fill/.exec(fitFn);
    const capVal = capMatch ? Number(capMatch[1]) : 1; // no cap = fully open
    const capOk = capVal >= 0.95;
    record(mostRaised && macbookHighest && airpodsEased && tabletWider && capOk && fillEntries.length >= 8,
      'v15 SOURCE final-site.js: hero>=0.96, machines eased 0.84-0.90, tablet wider, MacBook highest, AirPods eased, cap raised',
      `slots=${fillEntries.length} raised=${raisedCount}/${nonAirpods.length} ` +
      `fills=${JSON.stringify(fills)} macbookHighest=${macbookHighest} airpodsEased=${airpodsEased} ` +
      `tabletWider=${tabletWider} (token=${tabletToken} idCond=${tabletIdCond}) ` +
      `fillCap=${capVal} (expected >=0.95)`, 'SOURCE-CHECK');

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

      /* ---- v10 GATE 30 (per viewport): glass-lab CTA DOM byte-identical to source ---- */
      const band = page.locator('.glass-lab-cta-band').first();
      const bandCount = await band.count();
      const domChips = await page.locator('.lab-hash-chip').evaluateAll(
        (els) => els.map((el) => el.textContent.trim()));
      // Fail closed: extraction from source must have produced exactly 9/2/1.
      const chipsIdentical = V10_CHIPS.length === 9 && domChips.length === 9 &&
        domChips.every((t, i) => t === V10_CHIPS[i]);
      const domButtons = await band.locator('a.cta-tactile').evaluateAll(
        (els) => els.map((el) => el.textContent.trim()));
      const buttonsIdentical = V10_BUTTONS.length === 2 && domButtons.length === 2 &&
        domButtons.every((t, i) => t === V10_BUTTONS[i]);
      const domHours = await band.locator('p').evaluateAll((els) => els.map((el) => el.textContent.trim()));
      const hoursIdentical = !!V10_HOURS && domHours.includes(V10_HOURS);
      record(bandCount > 0 && chipsIdentical && buttonsIdentical && hoursIdentical,
        `${vp.name}: glass-lab CTA DOM byte-identical (9 hashtags + 2 buttons + hours line)`,
        `band=${bandCount} chips=${domChips.length}/9 identical=${chipsIdentical} ` +
        `buttons=${domButtons.length}/2 identical=${buttonsIdentical} hoursIdentical=${hoursIdentical} ` +
        `srcChips=${V10_CHIPS.length} srcButtons=${V10_BUTTONS.length} hoursLen=${V10_HOURS.length}`,
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
          ['glasslab', '.glass-lab-cta-band'],
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
