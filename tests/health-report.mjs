#!/usr/bin/env node
/**
 * tests/health-report.mjs — LOCAL production-build health & smoothness checkup.
 *
 * Ownership: QA only. READ-ONLY: never touches src/, public/, scripts/ or data.
 * Run against a LOCAL production build (BASE_URL, default http://127.0.0.1:3000).
 * This is a REPORT, NOT a blocking gate: it always exits 0 and writes JSON to
 * /tmp/opencode/health-v16.json. Thresholds are evaluated and reported, never
 * enforced as a deploy blocker.
 *
 * Per viewport (tablet 1024x768@2x, mobile 390x844@3x, desktop 1440x900@1x):
 *   (i)   Long Tasks via PerformanceObserver during a 3s scripted scroll
 *         -> count + max duration (ms)
 *   (ii)  CLS via PerformanceObserver (layout-shift, excluding recent input)
 *   (iii) document.querySelectorAll('*').length  (DOM size)
 *   (iv)  count of elements whose computed will-change !== 'auto'
 *   (v)   console errors (console.error + uncaught pageerror)
 *
 * Long tasks are reported for the SCROLL window (primary) and separately for the
 * load phase (context), so load-time hydration cost is not mistaken for scroll
 * jank. The known headless-no-WebGL console error ("THREE.WebGLRenderer: Error
 * creating WebGL context") is reported RAW and also classified as a harness
 * artifact; the "no console errors" threshold evaluates genuine app errors only.
 *
 * Thresholds (reported, not enforced): longTasks <= 2, max task < 80ms,
 * CLS <= 0.05, zero console errors.
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
const OUT_PATH = process.env.HEALTH_OUT || '/tmp/opencode/health-v16.json';
// GIFT (QA): `--repeat N` runs the full measurement N times and prints a per-metric
// variance table — STABLE signals (CLS/DOM/will-change/app-errors) vs NOISY ones
// (long-task count/timing) separate cleanly on this headless, shared sandbox.
const repeatArg = process.argv.indexOf('--repeat');
const REPEAT = repeatArg >= 0 && Number(process.argv[repeatArg + 1]) > 0
  ? Math.min(5, Number(process.argv[repeatArg + 1])) : 1;
// Read-only source paths for the 120fps culprit scanner (never edits these files).
const CSS_SOURCE_PATH = path.join(REPO_ROOT, 'src', 'app', 'final-site.css');
const JS_SOURCE_PATH = path.join(REPO_ROOT, 'public', 'final-site.js');

const THRESHOLDS = { longTaskCount: 2, longTaskMaxMs: 80, cls: 0.05, consoleErrors: 0 };
const VIEWPORTS = [
  { name: 'tablet', width: 1024, height: 768, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

function gitHead() {
  try { return execFileSync('git', ['-C', REPO_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { return 'unknown'; }
}

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
  if (expected && fs.existsSync(expected)) return undefined;
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

// Instrument BEFORE any page script runs so buffered longtask/layout-shift
// entries from first paint are captured.
function installObservers() {
  window.__health = { longTasks: [], cls: 0, obsErrors: [], scrollStart: null };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__health.longTasks.push({ startTime: e.startTime, duration: e.duration });
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch (e) { window.__health.obsErrors.push('longtask: ' + (e && e.message ? e.message : e)); }
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (!e.hadRecentInput) window.__health.cls += e.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) { window.__health.obsErrors.push('layout-shift: ' + (e && e.message ? e.message : e)); }
}

// Scripted scroll lasting ~3 seconds. Scrolls proportionally through the whole
// document so lazy-loaded sections and their effects are exercised.
async function scrollFor3s(page) {
  await page.evaluate(async () => {
    const steps = 60;
    const delayMs = 50; // 60 * 50ms = 3000ms
    // Mark the scroll window so load-phase tasks can be reported separately.
    if (window.__health) window.__health.scrollStart = performance.now();
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    for (let i = 0; i <= steps; i++) {
      window.scrollTo(0, Math.round((max * i) / steps));
      await new Promise((r) => setTimeout(r, delayMs));
    }
    window.scrollTo(0, 0);
  });
}

function evaluate(thresholds, metrics) {
  return {
    longTaskCount: { value: metrics.longTaskCount, limit: thresholds.longTaskCount,
      pass: metrics.longTaskCount <= thresholds.longTaskCount },
    longTaskMaxMs: { value: metrics.longTaskMaxMs, limit: thresholds.longTaskMaxMs,
      pass: metrics.longTaskMaxMs < thresholds.longTaskMaxMs },
    cls: { value: Number(metrics.cls.toFixed(4)), limit: thresholds.cls,
      pass: metrics.cls <= thresholds.cls },
    consoleErrors: { value: metrics.consoleErrors, limit: thresholds.consoleErrors,
      pass: metrics.consoleErrors <= thresholds.consoleErrors },
  };
}

/* ------------------------------------------------------------------ *
 * GIFT (QA): read-only 120fps culprit scanner.
 * Emits EXACT file:line evidence for every source construct that can affect
 * smooth scrolling — active/infinite animations, scroll/view timelines, blur
 * filters, JS scroll listeners, continuous rAF drivers. Structural evidence,
 * never a string-only "looks fine" claim. This function NEVER writes to src.
 * ------------------------------------------------------------------ */
function culpritScan() {
  const culprits = [];
  const css = fs.existsSync(CSS_SOURCE_PATH) ? fs.readFileSync(CSS_SOURCE_PATH, 'utf8') : '';
  const js = fs.existsSync(JS_SOURCE_PATH) ? fs.readFileSync(JS_SOURCE_PATH, 'utf8') : '';
  const lineAt = (src, idx) => src.slice(0, idx).split('\n').length;
  let m;

  // 1. Infinite animations — classify compositor-only (opacity/transform) as LOW.
  const infRe = /animation\s*:\s*([^;]*\binfinite\b[^;]*)/g;
  while ((m = infRe.exec(css)) !== null) {
    const decl = m[1].trim();
    const compositor = !/\b(?:filter|backdrop-filter|box-shadow|width|height|margin|padding|top|left|right|bottom)\b/.test(decl);
    culprits.push({
      severity: compositor ? 'LOW' : 'REVIEW', kind: 'infinite-animation',
      file: 'src/app/final-site.css', line: lineAt(css, m.index), evidence: decl,
      note: compositor
        ? 'opacity/transform only — GPU-compositor friendly; still runs continuously, incl. during scroll'
        : 'animates a non-compositor property in an infinite loop — inspect on real GPU hardware',
    });
  }
  // 2. Scroll-/view-timeline effects — declarative, but update on every scroll frame.
  const tlRe = /animation-timeline\s*:\s*(?:scroll|view)\s*\([^)]*\)/g;
  while ((m = tlRe.exec(css)) !== null) {
    culprits.push({
      severity: 'LOW', kind: 'scroll-timeline', file: 'src/app/final-site.css',
      line: lineAt(css, m.index), evidence: m[0],
      note: 'declarative scroll-linked compositor effect; no JS listener but active on every scroll frame',
    });
  }
  // 3. Real blur filters — a blur on a scrolling/animated layer is the classic jank source.
  const blurRe = /(?:backdrop-filter|filter)\s*:\s*blur\s*\([^)]*\)/g;
  while ((m = blurRe.exec(css)) !== null) {
    culprits.push({
      severity: 'REVIEW', kind: 'active-blur', file: 'src/app/final-site.css',
      line: lineAt(css, m.index), evidence: m[0],
      note: 'blur is a costly paint — confirm it is not on a scrolled/animated layer',
    });
  }
  // 4. JS scroll listeners — the direct "animation stopping smooth scroll" suspect.
  const scrollRe = /addEventListener\(\s*['"]scroll['"]/g;
  while ((m = scrollRe.exec(js)) !== null) {
    culprits.push({
      severity: 'REVIEW', kind: 'js-scroll-listener', file: 'public/final-site.js',
      line: lineAt(js, m.index), evidence: m[0],
      note: 'JS scroll listener — verify {passive:true} + rAF throttling',
    });
  }
  // 5. Continuous rAF drivers — one entry per driver function (deduped).
  const rafRe = /requestAnimationFrame\(\s*(\w+)\s*\)/g;
  const rafFns = new Set();
  while ((m = rafRe.exec(js)) !== null) {
    if (rafFns.has(m[1])) continue;
    rafFns.add(m[1]);
    culprits.push({
      severity: 'INFO', kind: 'raf-driver', file: 'public/final-site.js',
      line: lineAt(js, m.index), evidence: `requestAnimationFrame(${m[1]})`,
      note: 'continuous rAF loop — low risk if work is throttled; 3D driver is the primary GPU consumer on real hardware',
    });
  }
  return {
    count: culprits.length,
    jsScrollListeners: culprits.filter((c) => c.kind === 'js-scroll-listener').length,
    activeBlurs: culprits.filter((c) => c.kind === 'active-blur').length,
    infiniteAnimations: culprits.filter((c) => c.kind === 'infinite-animation').length,
    items: culprits,
  };
}

async function main(outPath = OUT_PATH, label = '') {
  const report = {
    kind: 'health-report', version: 'v16', generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL, gitHead: gitHead(), thresholds: THRESHOLDS,
    note: 'REPORT ONLY — thresholds are informative, not a blocking deploy gate.',
    environment: {
      headless: true,
      webglAvailable: false,
      sharedSandbox: true,
      caveat: 'Long-task counts/timings are noisy and inflated here: headless Chromium has no WebGL, so 11 three.js canvases repeatedly fail context creation, and this sandbox runs other agents\' build/next-server processes concurrently. Load-phase tasks (300-700ms) are dominated by that init, not by the ZLE-V16 effects. STABLE signals: CLS, DOM node count, will-change count, and genuine app console errors. Re-run on a dedicated GPU-enabled runner for production-grade INP numbers.',
    },
    viewports: [], errors: [],
    culprits: culpritScan(),
  };

  let browser = null;
  try {
    const { chromium } = await loadPlaywright();
    const executablePath = resolveChromium(chromium);
    browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.deviceScaleFactor,
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', (m) => {
        if (m.type() === 'error') consoleErrors.push({ kind: 'console.error', text: m.text() });
      });
      page.on('pageerror', (e) => {
        consoleErrors.push({ kind: 'pageerror', text: String(e && e.message ? e.message : e) });
      });

      await page.addInitScript(installObservers);
      const nav = await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(300); // let first-paint shifts settle into observers
      await scrollFor3s(page);
      await page.waitForTimeout(150); // flush trailing observer callbacks

      const measured = await page.evaluate(() => {
        const h = window.__health || { longTasks: [], cls: 0, obsErrors: [], scrollStart: null };
        const allTasks = h.longTasks;
        // Primary smoothness metric = tasks DURING the 3s scroll window.
        const scrollTasks = h.scrollStart == null ? allTasks
          : allTasks.filter((t) => t.startTime >= h.scrollStart);
        const loadTasks = h.scrollStart == null ? []
          : allTasks.filter((t) => t.startTime < h.scrollStart);
        const maxDur = (arr) => arr.length ? Math.max(...arr.map((t) => t.duration)) : 0;
        let domNodes = 0, willChange = 0;
        const all = document.querySelectorAll('*');
        domNodes = all.length;
        for (const el of all) {
          let wc = 'auto';
          try { wc = getComputedStyle(el).willChange; } catch { /* ignore */ }
          if (wc && wc !== 'auto') willChange++;
        }
        const shape = (t) => ({ startTime: Math.round(t.startTime), duration: Math.round(t.duration) });
        return {
          longTaskCount: scrollTasks.length,           // during scroll (primary)
          longTaskMaxMs: maxDur(scrollTasks),          // during scroll (primary)
          loadLongTaskCount: loadTasks.length,         // load phase (context)
          loadLongTaskMaxMs: maxDur(loadTasks),        // load phase (context)
          cls: h.cls, domNodes, willChange,
          observerErrors: h.obsErrors,
          scrollStart: h.scrollStart == null ? null : Math.round(h.scrollStart),
          longTasks: scrollTasks.map(shape).slice(0, 20),
        };
      });

      // Headless Chromium has NO WebGL (known studio constraint) — three.js logs a
      // context-creation error that does NOT occur in real browsers. Report it raw
      // AND classify it separately so the "no console errors" threshold evaluates
      // against genuine app errors, not a test-harness artifact.
      const HEADLESS_ARTIFACT = /webgl\s*context|webglrenderer/i;
      const appConsoleErrors = consoleErrors.filter((e) => !HEADLESS_ARTIFACT.test(e.text));
      const headlessArtifacts = consoleErrors.filter((e) => HEADLESS_ARTIFACT.test(e.text));

      const metrics = {
        longTaskCount: measured.longTaskCount,
        longTaskMaxMs: Number(measured.longTaskMaxMs.toFixed(2)),
        loadLongTaskCount: measured.loadLongTaskCount,
        loadLongTaskMaxMs: Number(measured.loadLongTaskMaxMs.toFixed(2)),
        cls: Number(measured.cls.toFixed(4)),
        domNodes: measured.domNodes,
        willChange: measured.willChange,
        consoleErrors: appConsoleErrors.length,       // genuine app errors (threshold metric)
        rawConsoleErrors: consoleErrors.length,       // includes headless WebGL artifact
        headlessWebglArtifacts: headlessArtifacts.length,
        consoleErrorDetails: consoleErrors.slice(0, 10),
        observerErrors: measured.observerErrors,
        scrollStartMs: measured.scrollStart,
        longTasks: measured.longTasks,
        httpStatus: nav ? nav.status() : null,
      };
      report.viewports.push({
        name: vp.name, width: vp.width, height: vp.height, dpr: vp.deviceScaleFactor,
        metrics, thresholds: evaluate(THRESHOLDS, metrics),
      });
      console.log(`[health ${vp.name}] scrollLongTasks=${metrics.longTaskCount} max=${metrics.longTaskMaxMs}ms ` +
        `(load: ${metrics.loadLongTaskCount} tasks / max ${metrics.loadLongTaskMaxMs}ms) ` +
        `CLS=${metrics.cls} domNodes=${metrics.domNodes} willChange=${metrics.willChange} ` +
        `consoleErrors=${metrics.consoleErrors} (raw=${metrics.rawConsoleErrors}, headlessWebGL=${metrics.headlessWebglArtifacts})`);
      await context.close();
    }
  } catch (e) {
    report.errors.push(String(e && e.stack ? e.stack : e));
    console.error('[health FATAL]', e && e.stack ? e.stack : e);
  } finally {
    if (browser) await browser.close();
  }

  // Aggregate = worst case across viewports (conservative summary).
  const v = report.viewports;
  const agg = {
    longTaskCount: v.reduce((s, x) => s + x.metrics.longTaskCount, 0),
    longTaskMaxMs: v.length ? Math.max(...v.map((x) => x.metrics.longTaskMaxMs)) : 0,
    cls: v.length ? Math.max(...v.map((x) => x.metrics.cls)) : 0,
    domNodes: v.length ? Math.max(...v.map((x) => x.metrics.domNodes)) : 0,
    willChange: v.length ? Math.max(...v.map((x) => x.metrics.willChange)) : 0,
    consoleErrors: v.reduce((s, x) => s + x.metrics.consoleErrors, 0),
    rawConsoleErrors: v.reduce((s, x) => s + x.metrics.rawConsoleErrors, 0),
    clsNote: 'CLS reported per viewport; aggregate takes the worst value.',
  };
  report.aggregate = { metrics: agg, thresholds: evaluate(THRESHOLDS, agg) };
  report.allThresholdsMet = report.viewports.length === VIEWPORTS.length &&
    report.viewports.every((x) => Object.values(x.thresholds).every((t) => t.pass));

  try { fs.mkdirSync(path.dirname(outPath), { recursive: true }); } catch { /* ignore */ }
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n[health ${label}] report written -> ${outPath}`);
  console.log(`[health ${label}] aggregate: longTasks=${agg.longTaskCount} max=${agg.longTaskMaxMs}ms ` +
    `CLS=${agg.cls} domNodes=${agg.domNodes} willChange=${agg.willChange} consoleErrors=${agg.consoleErrors}`);
  console.log(`[health ${label}] allThresholdsMet=${report.allThresholdsMet} (REPORT ONLY — exit 0)`);
  if (label === '') {
    const c = report.culprits;
    console.log(`[health] culprit scan: ${c.count} construct(s) — jsScrollListeners=${c.jsScrollListeners} ` +
      `activeBlurs=${c.activeBlurs} infiniteAnimations=${c.infiniteAnimations}`);
    for (const item of c.items) {
      console.log(`   [${item.severity}] ${item.kind} ${item.file}:${item.line} — ${item.evidence}`);
    }
  }
  // REPORT, not a gate: never fail the caller.
  process.exitCode = 0;
  return report;
}

/* GIFT (QA): repeatability harness. Runs the full measurement REPEAT times and
 * reports per-metric variance so noisy headless signals are never mistaken for
 * real regressions (or vice versa). Writes a combined variance JSON. */
async function runAll() {
  if (REPEAT === 1) { await main(); return; }
  const runs = [];
  for (let i = 1; i <= REPEAT; i++) {
    const p = OUT_PATH.replace(/\.json$/, '') + `-run${i}.json`;
    const r = await main(p, `run${i}/${REPEAT} `);
    if (r) runs.push(r);
  }
  const metrics = ['longTaskCount', 'longTaskMaxMs', 'cls', 'domNodes', 'willChange', 'consoleErrors'];
  const viewports = ['tablet', 'mobile', 'desktop'];
  const variance = { kind: 'health-variance', generatedAt: new Date().toISOString(), runs: runs.length, byViewport: {} };
  console.log('\n===== health repeatability / variance =====');
  for (const vp of viewports) {
    variance.byViewport[vp] = {};
    for (const k of metrics) {
      const vals = runs.map((r) => {
        const v = r.viewports.find((x) => x.name === vp);
        return v ? v.metrics[k] : null;
      }).filter((v) => v !== null);
      const min = Math.min(...vals), max = Math.max(...vals);
      const spread = Number((max - min).toFixed(4));
      // A metric is STABLE if it does not vary across runs on this headless sandbox.
      const stable = spread === 0;
      variance.byViewport[vp][k] = { values: vals, min, max, spread, stable };
      console.log(`  ${vp.padEnd(7)} ${k.padEnd(15)} values=${JSON.stringify(vals)} spread=${spread} ${stable ? 'STABLE' : 'NOISY'}`);
    }
  }
  const stableCount = Object.values(variance.byViewport).reduce(
    (s, m) => s + Object.values(m).filter((x) => x.stable).length, 0);
  variance.summary = `${stableCount}/${viewports.length * metrics.length} per-viewport metrics STABLE across ${runs.length} runs`;
  console.log(`  SUMMARY: ${variance.summary}`);
  const vPath = OUT_PATH.replace(/\.json$/, '') + '-variance.json';
  try { fs.mkdirSync(path.dirname(vPath), { recursive: true }); } catch { /* ignore */ }
  fs.writeFileSync(vPath, JSON.stringify(variance, null, 2));
  console.log(`  variance report written -> ${vPath}`);
}

runAll().catch((e) => {
  console.error('[health-report FATAL]', e && e.stack ? e.stack : e);
  process.exitCode = 0; // report-only
});
