# PIXEL FORGE STUDIO — COMPLETE SESSION HANDOFF (2026-11-22)

> **READ THIS FIRST IN A FRESH SESSION.** This file is self-contained: it carries all context
> needed to continue work on Red Apple Mobile Repair after a token reset / fresh context.
> Owner: **Faisu** · Lead AI: **FaiCodex** · Studio: **The Pixel Forge Studio**.

---

## 1. WHO / WHERE

| Item | Value |
|---|---|
| Owner | Faisu (DigitalPixelStudio / Pixel Forge Studio, Bengaluru) |
| Assistant codename | **FaiCodex** (OpenCode orchestrator, head of the 7-agent team) |
| Live site | https://www.redmobilerepair.in (Next.js 16.4.6 App Router, Node 22, Tailwind 4, one shared three.js renderer, PWA) |
| Repo | `/root/workspace/red-apple-site-live` (git worktree of `red-apple-website`) |
| Working branch | `fix/disable-orange-glass-sweep` (107+ commits ahead of main; live is deployed from THIS branch, NOT main) |
| Vercel project | `redmobile-repair.in` (id `prj_UXuax2HiAkDgB0MNqrTc10b52TFr`, team/scope `digital-pixel-studio`, team id `team_X2IuKDqvHxg5BoaS61nc2mpg`) |
| GitHub repo | `DigitalPixelStudio/red-apple-website` |
| Latest production deploy | commit `036ed98` (v7: machine card restructure); prior `3cfbbb4` (v6: strip fix), `ed797d6` |
| Rollback tags | `stable-pre-strip-fix` (pre-v6), `stable-pre-onego-v5`, `stable-pre-v4-fixes` |
| Safety | NEVER force-push main. Deploy forward from tags. |
| Final Word report | `/root/workspace/RedApple_OneGo_v5_Final_Report.docx` |

## 2. FIRST COMMANDS IN A FRESH SESSION
```bash
cd /root/workspace/red-apple-site-live
cat .faicodex/HANDOFF.md            # this file
cat .faicodex/TEAM.md               # 7-agent operating model
cat .faicodex/PREFERENCES.md        # owner preferences
cat .faicodex/TASKS.md              # task ledger
cat .faicodex/DECISIONS.md          # settled decisions (do not re-litigate)
bash scripts/predeploy-check.sh     # full health gate (build + NAP/SEO)
```
Then tell Faisu: "Context restored from .faicodex/HANDOFF.md — ready to work."

## 3. DEPLOY PROVIDER ACCESS (how I connected to GitHub + Vercel)
- **GitHub**: `gh` CLI installed (v2.45.0), authenticated as `DigitalPixelStudio`; token scopes `repo`, `read:org`, `gist`.
  - IMPORTANT: native `git` HTTPS crashes in this sandbox (`free(): invalid pointer / qroot-CRASH`) → use helper `python3 /root/ghgit.py push <repo-dir> HEAD:refs/heads/<branch>` (uses dulwich + gh token). `gh api` works normally.
- **Vercel**: CLI installed (v66.5.0), token at `/root/.local/share/com.vercel.cli/auth.json` (key `token`, `vca_...`).
  - Deploy: `vercel deploy --prod --scope digital-pixel-studio --project redmobile-repair.in --yes`
  - CLI exits 139 after succeeding (sandbox noise) → always verify by fetching the URL, not exit code.
  - `vercel logs` works; no real errors in recent windows.
  - Env vars (names only, never print values): `GEMINI_API_KEY_Redmobilerepair`, `GEMINI_API_KEY` (+ aliases), `LEAD_WEBHOOK_URL`, `CRM_STATUS_URL`, `PICKUP_WEBHOOK_URL`, `DESK_WEBHOOK_URL`.
- **Python helpers**: Pillow installed (`--break-system-packages`); `requests` absent; use `urllib.request`. Pillow scripts in `scripts/`.

## 4. EXACT SOURCE MAP
- `src/app/page.tsx` — mounts `finalSiteHtml` verbatim (`dangerouslySetInnerHTML`), loads `/final-site.js` via `next/script`.
- `src/lib/final-site-html.ts` — THE live homepage HTML (UTF-8 BOM). All visible text, images, dropdowns, quote form, sections.
- `src/app/final-site.css` — homepage CSS (unlayered, imported by globals.css).
- `public/final-site.js` — all 3D (three.js), slider, quote logic, AI chat, nav behavior, PWA recovery.
- `src/app/globals.css` — Tailwind + legacy component styles (many dormant for the live page).
- `src/lib/site.ts` — **SINGLE SOURCE** for business facts (SITE, REPAIR_TYPES, REPAIR_STATUS_FLOW, wa(), baseUrl, SERVICE_PAGES, FAQS).
- `src/lib/pricing.ts` / `src/lib/glass-pricing.ts` — pricing single source (generated from spreadsheet — DO NOT hand-edit).
- `src/app/layout.tsx` — metadata, JSON-LD (LocalBusiness/Organization/Service — no aggregateRating/FAQPage), GA4 dormant.
- `src/app/api/` — `concierge` (live Gemini bot), `lead`, `estimate`, `crm-status`, `pickup-booking`, `forge-ai` (thin wrapper over concierge), `health`.
- `src/app/llms.txt/route.ts` — llms.txt built from SITE (single source).
- `.faicodex/` — memory + team + docs. `scripts/` — QA/DevOps/Python helpers.

## 5. BUSINESS FACTS (single source `src/lib/site.ts`)
- Name: Red Apple Mobile Repair Store (legal: RED APPLE MOBILE REPAIR STORE)
- Address: Metro Pillar No 125, No.38, next to Vignesh Dresses, opp. Bhadra Landmark, Halasuru, Bengaluru, Karnataka 560008
- Phone/WhatsApp: +91 86606 63776 · Hours: 10 AM – 12 AM, all 7 days
- Warranty: 6 Months written (motherboard excluded) · Rating 4.9 / 1,103
- Official GBP: https://share.google/12Pqrwl3lJq4mL75p
- Independent studio — NOT Apple authorized/affiliated (keep disclaimers). No GST / genuine Apple claims / fake urgency.

## 6. FROZEN vs ADJUSTED 3D MODELS (CRITICAL)
- **FROZEN — do not touch framing**: `canvas-hero` (iPhone 17 Pro), `canvas-pickup-iphone`, `canvas-airpods`, `canvas-watch`.
- **Adjusted mobile only**: iPad `0.82×1.14`, OCA `0.80×1.26`, 90L `0.84×1.26`, 958 `0.84×1.28`, MacBook `0.94×1.28`, internals `0.94×1.14`.
- Engine: single renderer + scissor + `drawImage` to 2D canvases; adaptive DPR; `ResizeObserver` cached sizes; bounding-sphere fit `centerAndFitEdgeToEdge`; orbit drag uses per-canvas `setPointerCapture`; `webglcontextlost/restored` recovery + `visibilitychange`/`pageshow`/`focus` wake; fullscreen uses `setSize(w,h,false)` + aspect sync.

## 7. CURRENT VERIFIED STATE (all PASS on 2026-11-22)
- Health 200; NAP/SEO guard all PASS; 5 backend APIs smoke-tested 200; AI bot 200/gemini.
- 10/10 live UI/3D checks PASS; no runtime errors; canonicals/og:image clean; robots allows AI crawlers + disallows /api.
- No backdrop-blur, no repaint keyframes, no scroll freeze, lazy images, smooth scroll, PWA recovery present.

## 8. OWNER PREFERENCES (permanent)
- Always raise the 7 agents in parallel for assigned tasks; each brings one "gift"; FaiCodex reviews and executes.
- Preserve ALL images, 3D models, quotations, WhatsApp flows, dropdowns, store data.
- No "phases"/"days" language — one coordinated pass.
- Concise factual reports; final link always given; gifts listed.
- Memory must survive token resets (this file + companions).

## 9. TOOLING GOTCHAS
- `execute` tool has been unreliable in this session — use `shell` + write tool.
- `curl` native crashes (libcurl/sandbox) → use Python `urllib.request` for HTTP.
- In-app browser panel ("No OpenChamber client connected") — use live HTTP assertions instead.
- Big heredoc scripts have aborted mid-way before saving; after any multi-edit script, RE-VERIFY the live source and re-apply if needed (happened once with brand/rail/zoom edits).
- Don't declare "done" on build exit code alone — build exits 139 from sandbox noise; verify output/BUILD_ID.

## 10. KNOWN REMAINING / NOT YET DONE
- Playwright MCP not available → 9-gate browser automation not run; HTTP/DOM assertions used instead.
- `/crm-status`, `/contact`, `/services/*` dedicated routes exist; some link from the generated nav rail via hash anchors on homepage (hybrid) — acceptable per current build.
- No real CRM webhook configured (`CRM_STATUS_URL` unset) → status API returns honest "not connected" response (by design).
- `main` branch is far behind the worktree; do NOT assume git-based deploys reproduce live.

---
*End of handoff. Fresh session: read sections 1–4 first, then run the commands in section 2.*


## 11. v6 / v7 ADDENDUM (2026-11-22, commit 036ed98)
Real bugs found via Playwright (not string checks) and fixed:
- **"Black strip"** = `.stage-3d-box` used `rgba(17,17,19,.96)` obsidian backdrop on all 10 3D stages.
  Replaced with warm editorial radial `#FFF9F3 → #F8E9DD → #EED7C4`. Renderer is `alpha:true`, so CSS shows through.
- **Machine images cropped** = portrait 1613×2160 (3:4) in `aspect-square`+`object-cover`.
  Fixed: `aspect-[3/4]` natural ratio, `object-contain`, warm matte `#F7EFE6`; no crop, full machine visible.
- **Global hover micro-jitter** = `globals.css a[href],button:hover { transform: translate3d(0,-1px,0) }`.
  Neutralized: hover/active `transform:none !important` (verified computed transform `none` on hover).
- **Invisible content** = `.reveal-up` could stay at opacity 0 if IntersectionObserver missed.
  Added 1.2s failsafe that adds `.is-in` to all remaining elements (verified 15/15 visible).
- **Smooth scroll** was hover-only + overridden by late globals rule → now unconditional `smooth` (reduced-motion still wins).
- **Bigger 3D models** = machine cards stacked full-width (image above 3D), 3D stage 480/520px;
  mobile pads reduced to 1.10/1.12 (still >1 so bounding-sphere fit = zero crop).
- **More light animation** = laser-line sections now 5 (hero, glass-lab, tbk-machines, ecosystem-3d, comparison);
  transform/opacity only, `contain:strict`.
- Header compacted: one-line brand + subtext, warm gradient Install button (no black), nowrap CTAs.
- Verified live: docOverflow 0, warm stage, imgFit contain, smooth scroll, 5 lasers, 15/15 reveals, AI bot healthy.
- Safety tag before this pass: `stable-pre-strip-fix`.

---

## 12. IMAGE/3D FIX PASS — IN PROGRESS (2026-11-22, deploy PENDING)
> Section 7 "all PASS" refers to the previously deployed v7 (`036ed98`). This pass is NEW, uncommitted, and not yet verified/deployed.
- Safety tag created before edits: `backup-before-image-3d-fix` (rollback point on `fix/disable-orange-glass-sweep`).
- 3 files changed (uncommitted): `src/app/final-site.css` (scoped object-fit cover/contain), `src/lib/final-site-html.ts` (`machine-frame` class, header nav `md:flex` for tablet gap, glass visualiser label separation), `public/final-site.js` (aspect-preserving `fitDims`; `resizeSlot` no longer corrupts shared renderer).
- Build artifacts valid: `BUILD_ID=2hZajWIhaMmA7Bcteqh24`; TypeScript OK; compiler OK (exit 139 = benign sandbox teardown — verify via BUILD_ID, not exit code).
- Deploy: **PENDING** (FaiCodex has not deployed this pass). QA: **NOT run / not claimed** — do not report QA PASS until gates are executed.
- NEXT SESSION FIRST ACTION (gift): run `bash scripts/predeploy-check.sh` + QA gates on this pass, then deploy from `fix/disable-orange-glass-sweep` via `vercel deploy --prod --scope digital-pixel-studio --project redmobile-repair.in --yes` and verify the live URL.

---

## 13. v9 FINAL PUSH — DEPLOYED (2026-11-22) — SAFE TO RESTART
- Section 12 is now RESOLVED: pass committed, pushed, deployed, verified.
- HEAD: `b2c13b7` on `fix/disable-orange-glass-sweep` (prior `a992de7`). Rollback tag: `backup-before-image-3d-fix` (commit `4097815`).
- Fixes live: store/bench/craft photos fill frames (`object-fit: cover`); TBK machine photos keep natural 3:4 no-crop (`machine-frame` → contain); tablet header nav fills the old empty gap (`md:flex`, low-priority links `lg:inline`); glass slider labels no longer overlap (strict left/right halves); 3D fullscreen no longer corrupts the shared renderer (`fitDims` aspect-preserving, `resizeSlot` no longer calls `setSize`/`setPixelRatio`); nav focus ring + `x-vercel-deployment-url` noindex shield.
- Verification: `tests/visual-audit.mjs` **23/23 PASS** (tablet 2x / mobile 3x / desktop), `scripts/predeploy-check.sh` ALL PASS, live health 200 on all 8 checked routes, live HTML confirmed to carry the new classes.
- New tools: `tests/visual-audit.mjs` (`BASE_URL=... node tests/visual-audit.mjs --shots`), `scripts/audit/image_fit_audit.py` (`--json`).
- NEXT SESSION: CRM build. Use `/catch-up` — no website work remains open. Live: https://www.redmobilerepair.in

---

## 14. v7 ULTIMATE ELITE — DEPLOYED (2026-11-22) — FINAL
- Section 13 resolved. HEAD `aeab7a7` on `fix/disable-orange-glass-sweep`; rollback tags `stable-pre-v7-final`, `backup-before-image-3d-fix`.
- Live changes: mobile logo always visible; hero gap + AI toast repositioned; fullscreen ⛶ button restored on all 10 stages (`z-20`); every 3D model BIGGER (lower pad, no shrink); AirPods warm-champagne contrast on orangish studio tiles; orange-glass token purge; vivid ₹1,00,000 color-shift + breathing badges; footer black bar removed; MobilePhoneRepair JSON-LD with 17 Bengaluru zones; adSignals.ts consent hooks; 'Authorised Service Centre' -> 'Standard Brand Mail-In Center'.
- Gates: visual-audit 23/23 PASS, seo_strike_scanner PASS (live), image_fit_audit PASS, predeploy-check ALL PASS, 8 live routes 200.
- New tools: `scripts/audit/seo_strike_scanner.py`, `scripts/audit/verify_v7_live.py`, `src/lib/seo/localSchema.ts`, `src/lib/analytics/adSignals.ts`.
- NEXT: CRM build. Use `/catch-up`.

---

## 17b. v10 GRAND CLOSURE — DEPLOYED (2026-11-22) — HEAD badfb9b
- Section 17 PENDING resolved. Rollback `stable-pre-v10-closure` (f105fa0).
- Root-cause 3D fix: `computeTightDeviceBounds()` excludes Torus halos + Circle shadows; 0.88-0.90 near-edge fill, fov 34, shared renderer intact, fullscreen safe. Models now fill their stages on all viewports (verified structurally — headless has no WebGL).
- Glass-lab CTA rebuilt zero-jitter (exact text preserved); Obsidian+neon footer anchored at bottom edge with store photo/aspect untouched; repair-status POSTs (0 405s); robots allows 10 crawlers + /_next/; IndexNow key + Apple Maps; both noindex gates BLOCKING in predeploy.
- Gates: QA 62/62 PASS, SEO scanner 14/14 live PASS, predeploy ALL PASS. BUILD_ID `Nugti3XuXDrekAu_4jLkf`.
- Faisu manual: GSC Request Indexing 5 URLs; delete 2 old Vercel projects; 48h index-flip check. Next: CRM. `/catch-up`.

---

## 15b. v8 FLAWLESS POLISH — DEPLOYED (2026-11-22) — FINAL
- Section 15 (PENDING) is RESOLVED. HEAD `4c594ad`; runtime commit `4c28cb0`; rollback `stable-pre-v8-final`.
- Live: 34/34 QA gates PASS, SEO scanner 8/8 PASS on live, 10/10 routes 200, predeploy ALL PASS, BUILD_ID `ywbfY68blWQ-kRby774bY`.
- v8 shipped: number animation removed (bot cannot render 1.3/5), 12 jitter animations killed, 18-mote dpr=1 30 FPS particles, static orange studio on all 10 stages, hero fullscreen removed only, hero lock-screen text re-slotted, selective tuning (tablet 0.70 / MacBook 0.70 / AirPods 0.76 + Space Grey #8A8F98).
- Faisu's GSC action (only he can do it): Request Indexing on /, /privacy, /terms, /refund-policy, /services/iphone-display-repair — cached 1.3/5 / 90-day snippets clear only after re-crawl.
- SAFE TO RESTART — `/catch-up`; next milestone: CRM.

---

## 16. v9 FINAL SETUP — DEPLOYED (2026-11-22) — HEAD 1219210
- Rollback tags: `stable-pre-v9-final`, `stable-pre-v8-final`. Live proof: hero gap gone (content top 147px, h1 206px), pills 0 overlap, price 1/2/3 cols, footer 1/4 cols, email break-words.
- CRITICAL: production noindex header regression (from v8 x-vercel-deployment-url rule) FIXED and verified absent on live; PY-1 scanner now hard-gates it (14/14 PASS).
- 3D: responsive MODEL_FRAMING (hero 0.86, tablet 0.66, pickup 0.76, 3/4 camera) with shared renderer intact.
- Gates: QA 50/50 PASS, SEO scanner 14/14 live PASS, predeploy ALL PASS, 10 routes 200. BUILD_ID `CUlBTafDpTCvkbWed933c`.
- Faisu's manual actions: GSC Request Indexing on 5 URLs; delete 2 old Vercel projects. Next: CRM. `/catch-up`.

---

## 15. v8 JITTER-FREE / BOT-PROOF BUILD — IN PROGRESS (2026-11-22, deploy PENDING)
> Sections 7/13/14 PASS refer to previously deployed builds. v8 is NEW, uncommitted, and NOT deployed. Do not report QA PASS or deploy until FaiCodex confirms.
- Safety tag before edits: `stable-pre-v8-final` (rollback point on `fix/disable-orange-glass-sweep`). HEAD `2d29150` (docs); v8 changes uncommitted: `public/final-site.js`, `src/app/final-site.css`, `src/lib/final-site-html.ts`, `scripts/audit/seo_strike_scanner.py`, new `scripts/audit/verify_v8_live.py`.
- Agents (each with a gift):
  - FE-1: killed 12 jitter animations (orbFloat, laserDrift, ambientDrift, shimmerLine, gridBreathe, sparkleFloat, logoLaser, logoFloat, activeRailPulse, waPulse, headingUnderlinePulse, badgePulse); static `.stage-3d-orange-bg` on all 10 stages + `#ambient-particles` host.
  - BE-1: live SSR clean on 7 routes + 7 APIs healthy.
  - RES-1: schema / robots / llms confirmed; 5 GSC Request Indexing URLs produced.
  - PY-1: `seo_strike_scanner.py` upgraded (10 routes + counter-bot gate `g` + animation gate `h`); `verify_v8_live.py` added.
  - QA-1: adding v8 visual gates (in progress).
  - DevOps: running predeploy.
- FaiCodex: stat counter bot-proof (removed number animation — Googlebot can no longer render 1.3/5); hero fullscreen button removed only; hero lock-screen text re-slotted into non-overlapping corners; selective 3-model tuning ONLY (tablet 0.70, MacBook 0.70, AirPods 0.76 + Space Grey `#8A8F98`); 18-mote dpr=1 30 FPS particle canvas; `.stat-final` paint-only fade.
- KEY NUANCE: stale 1.3/5 / 90-day in Google snippets = Google's CACHE, not live SSR (live SSR clean). Needs Faisu's GSC Request Indexing on 5 URLs: `/`, `/privacy`, `/terms`, `/refund-policy`, `/services/iphone-display-repair`.
- STATUS: deploy **PENDING**; QA not claimed. NEXT-SESSION REMINDER: run predeploy + QA v8 gates, commit, deploy after FaiCodex confirms; ask Faisu to Request Indexing the 5 URLs. Live: https://www.redmobilerepair.in

---

## 17. v10 CLOSURE BUILD — APPROVED BY FAISU, DEPLOY PENDING (2026-11-22)
> Faisu thanked all engineers and approved v10. This build is NEW/uncommitted — do NOT claim QA PASS or deploy until FaiCodex confirms.
- Safety tag: `stable-pre-v10-closure` created from HEAD `f105fa0` (rollback point on `fix/disable-orange-glass-sweep`). Working tree uncommitted (v10 files across `public/`, `src/app/`, `scripts/predeploy-check.sh`, `docs/`).
- 7 agents parallel, each with a gift:
  - **FE-1**: rebuilt jittery glass-lab CTA — `.glass-lab-cta-band` + 9 `.lab-hash-chip`, exact text preserved; luxury Obsidian Black + neon-orange footer anchored near bottom with `pb-84px` dock clearance; store photo/aspect untouched. Gift: 5 animations (GPU scroll hairline, lazy reveals, tactile buttons, 16-mote dust, `@view-transition`).
  - **BE-1**: repair-status page now POSTs `/api/crm-status` (zero 405s), honest WhatsApp handoff kept, no fabricated stages. Gift: input normalization.
  - **RES-1**: robots allows 10 crawlers incl Applebot + Bingbot; IndexNow key file; Apple Maps deep link; llms discovery; `docs/GMB_ADS_COMPLIANCE.md` + 48h Google index-flip check.
  - **PY-1**: both noindex gates (header + source) wired as BLOCKING in `scripts/predeploy-check.sh`.
  - **QA-1**: v10 gates (not yet PASS-claimed). **DevOps**: deploy (pending). **DOC-1**: memory.
- **FaiCodex 3D root-cause fix**: v9 models shrank because `Box3.setFromObject(root)` included decorative Torus halos + Circle shadow discs (~2x inflation). v10 adds `computeTightDeviceBounds()` measuring ONLY device meshes + near-edge 0.88–0.90 fill; shared renderer intact (no per-slot `setSize`). Also re-allowed `/_next/` in `robots.ts` (Google rendering guidance).
- **PRESERVATION**: all store/machine images, aspect ratios, quotations, WhatsApp flows, and v9 gap/noindex fixes untouched.
- **STATUS**: deploy PENDING until FaiCodex confirms. QA not claimed.
- **48h follow-up (approved)**: after GSC Request Indexing on /, /privacy, /terms, /refund-policy, /services/iphone-display-repair, confirm cached 1.3/5 & 90-day snippets replaced by 4.9/5 & 6 Months.
- **Manual (Faisu only)**: GSC Request Indexing 5 URLs; delete old Vercel projects `redappplemobilerepair` + `red-apple-repair`; optionally claim Apple Business Connect.
- Next action: FaiCodex runs predeploy + QA v10 gates → commit → deploy from `fix/disable-orange-glass-sweep` → verify live. Live: https://www.redmobilerepair.in


---

## 18. v18 PLATINUM FINAL ANALYSIS — DOC COMPLETE, DEPLOY PENDING (2026-11-23, HEAD c055731)
- Owner request: "Give a word document with your current website analyze" + "lengthy document explaining all and clear instructions and Codes" + "final platinum tier build advise to opencode in word document".
- DELIVERABLE: /root/workspace/RedApple_Platinum_Final_Analysis.docx — 53,250 bytes, python-docx 1.2.0, 8 tables, 11 H1 sections, 11 page breaks, opens/verified OK, opened in file panel. Commit at analysis (pre-deploy HEAD): c055731 (v17 PRECISION FINISH, last deployed).
- DOC-1 subagent ownership was STRICT: .faicodex/HANDOFF.md, .faicodex/MEMORY.md, brain events-log.md, brain projects/redmobilerepair.md + generate the docx. NO src/public/scripts/tests/CRM edits. All v18 code already present in working tree; this pass = documentation + memory only.
- 7 agents + 2 gifts each (14 gifts): FE-1 gate-safe 96px flush + zero-JS polish/reduced-motion; RES-1 Google hardware-repolicy redirect (Meta-only) + false-negative qualifier fix; BE-1 X-Request-Id correlation + fail-open qualifier/zod hardening; PY-1 retrying monitor + sanitized audit trail; QA-1 culprit scanner + variance harness; DevOps cache-layer headers + predeploy integration; DOC-1 platinum docx + handoff/memory continuity. FaiCodex integrated, held frozen 3D lock (TBK 0.75 / AirPods 0.66 / MacBook 0.90, mobile FROZEN) + preservation law.
- Document contains: title, exec summary, BEFORE/AFTER 5-row table, deep analysis (architecture/shared renderer/single-source/7 APIs, performance, SEO+strike, Meta-only ads, footer+10 FX, source map), smoothness verdict, 14-gift work log, 35-pos/55-neg keyword appendix + qualifyInquiry strategy, backend 100/100 checklist, Faisu 2-min manual list, copy-paste OpenCode golden rules, risk/rollback register, final verdict.
- Gates for the eventual deploy: predeploy-check.sh + visual-audit.mjs + health-report.mjs + seo_strike_scanner + health-monitor --quiet; verify .next/BUILD_ID (exit 139 benign); deploy vercel --prod --scope digital-pixel-studio --project redmobile-repair.in; verify live URL not exit code.
- STATUS: DEPLOY PENDING until FaiCodex confirms. QA for the v18 code state NOT claimed here (doc subagent did not run gates). Manual (Faisu only): GSC 6 URLs, delete 2 Vercel clones, hand ads doc (META ONLY), optional Apple Business Connect. CRM bridge DEFERRED. SAFE TO RESTART — use /catch-up. Live: https://www.redmobilerepair.in
