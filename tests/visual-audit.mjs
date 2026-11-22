#!/usr/bin/env node
/**
 * tests/visual-audit.mjs — predeploy visual/CSS QA gate for Red Apple Mobile Repair.
 *
 * Ownership: QA only. This file never touches src/, public/ or .faicodex/.
 * Run against a LOCAL build (BASE_URL, default http://127.0.0.1:3000).
 * NEVER point this at production: production is redeployed only after the gate is green.
 *
 * Checks (per viewport: tablet 1024x768@2x, mobile 390x844@3x, desktop 1440x900@1x):
 *   1. computed object-fit: store/gallery photos = cover, machine-frame photos = contain
 *   2. header <nav> visible at >= 768px, hidden at 390px
 *   3. #ba-overlay cracked label and restored label bounding boxes do not overlap
 *   4. no .orange-glass-showcase node in the DOM (and not in SSR HTML)
 *   5. SSR HTML contains 4.9/5 and does not contain 1.3/5
 *   + frozen 3D canvas elements exist (existence only — headless has no WebGL,
 *     so this test deliberately never reads canvas pixels or calls getContext).
 *
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
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const SHOTS = process.argv.includes('--shots');
const SHOTS_FULL = process.env.SHOTS_FULL === '1';
const SHOTS_DIR = process.env.SHOTS_DIR || path.join(SCRIPT_DIR, 'shots');
const OVERLAP_TOLERANCE_PX = 1; // ignore sub-pixel/rounding-only intersections

const VIEWPORTS = [
  { name: 'tablet', width: 1024, height: 768, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

const results = [];
function record(status, check, detail) {
  const passed = status === true || status === 'PASS';
  const label = passed ? 'PASS' : 'FAIL';
  results.push({ status: label, check, detail });
  console.log(`[${label}] ${check}${detail ? ` — ${detail}` : ''}`);
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

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */
async function main() {
  const { chromium } = await loadPlaywright();
  const executablePath = resolveChromium(chromium);
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  if (SHOTS) fs.mkdirSync(SHOTS_DIR, { recursive: true });
  console.log(`visual-audit BASE_URL=${BASE_URL} shots=${SHOTS ? 'on' : 'off'}`);

  try {
    /* ---- Check 5: SSR HTML (once) ---- */
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

      /* ---- Check 1: object-fit ---- */
      // The rendered store gallery lives under #real-shop; the legacy #gallery
      // selector is kept for parity with final-site.css. Use whichever exists.
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

      /* ---- Check 2: nav visibility ---- */
      const nav = page.locator('nav').first();
      const navCount = await nav.count();
      const navVisible = navCount > 0 ? await nav.isVisible() : false;
      const navDisplay = navCount > 0 ? await nav.evaluate((el) => getComputedStyle(el).display) : 'missing';
      const expectNav = vp.width >= 768;
      record(navCount > 0 && navVisible === expectNav,
        `${vp.name}: header nav ${expectNav ? 'visible' : 'hidden'}`,
        `count=${navCount} display=${navDisplay} visible=${navVisible} expected=${expectNav}`);

      /* ---- Check 3: ba-overlay label boxes ---- */
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

      /* ---- Check 4: no orange-glass-showcase in DOM ---- */
      const showcase = await page.locator('.orange-glass-showcase').count();
      record(showcase === 0, `${vp.name}: no .orange-glass-showcase in DOM`, `count=${showcase}`);

      /* ---- Canvas existence only (NO WebGL / pixel judgement) ---- */
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

      // Turbopack/HMR chunk errors are dev-server teardown noise (this sandbox's
      // next dev exits 139 harmlessly); they cannot occur in a production build.
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
        for (const [tag, sel] of [
          ['ba', '#ba-slider-box'],
          ['gallery', gallerySel],
          ['machines', '#tbk-machines'],
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
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\n===== visual-audit summary: ${results.length - failed.length}/${results.length} PASS, ${failed.length} FAIL =====`);
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
