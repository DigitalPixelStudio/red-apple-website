# FaiCodex Memory — Red Apple Mobile Repair / Pixel Forge Studio

> Full handoff: `.faicodex/HANDOFF.md` (READ FIRST in a fresh session).

## Identity
- Owner: **Faisu** · Studio: **The Pixel Forge Studio** · Assistant codename: **FaiCodex** (head of 7-agent team).

## Project
- Live: https://www.redmobilerepair.in · repo `/root/workspace/red-apple-site-live` · branch `fix/disable-orange-glass-sweep`.
- Vercel project `redmobile-repair.in` (team `digital-pixel-studio`); deploy from this workspace with `vercel deploy --prod --scope digital-pixel-studio --project redmobile-repair.in --yes` (exit 139 = harmless sandbox noise; verify by fetching URL).
- GitHub: `gh` authenticated as DigitalPixelStudio. Native git HTTPS crashes in sandbox → use `python3 /root/ghgit.py push <dir> HEAD:refs/heads/<branch>`.
- Latest: commit `ed797d6`; safety tags `stable-pre-onego-v5`, `stable-pre-v4-fixes`.

## Business facts (single source `src/lib/site.ts`)
- Red Apple Mobile Repair Store · Metro Pillar No 125, No.38, next to Vignesh Dresses, opp. Bhadra Landmark, Halasuru, Bengaluru 560008 · +91 86606 63776 · 10 AM–12 AM all 7 days · 6 Months written warranty (motherboard excluded) · 4.9/1103 · GBP https://share.google/12Pqrwl3lJq4mL75p · independent (not Apple authorized).

## Architecture (key files)
- `src/app/page.tsx` mounts `src/lib/final-site-html.ts` verbatim; styles `src/app/final-site.css`; all interactivity + 3D in `public/final-site.js`.
- Pricing: `src/lib/pricing.ts` + `glass-pricing.ts` (single source; never hand-edit). APIs in `src/app/api/` (concierge = live Gemini bot, DO NOT break; estimate/crm-status/pickup-booking/forge-ai/health).
- `src/lib/site.ts` = SINGLE SOURCE for NAP, hours, warranty, REPAIR_TYPES, REPAIR_STATUS_FLOW.

## 3D rules
- FROZEN framing: canvas-hero, canvas-pickup-iphone, canvas-airpods, canvas-watch.
- Adjusted mobile: iPad +14%, tbk-oca +26%, tbk-90l +26%, tbk-958 +28%, macbook +28%, internals +14%.
- Single WebGL renderer + scissor; bounding-sphere fit; ResizeObserver; context recovery; fullscreen setSize(w,h,false).

## Working habits
- Always raise the 7 agents in parallel for tasks (`.faicodex/TEAM.md`); each gives a gift; FaiCodex reviews + executes.
- Preserve all images/models/quotations/WhatsApp flows; no phases/days language; verify with `bash scripts/predeploy-check.sh` before deploy.
- Memory must survive token resets — keep these files updated.

## v8 status (2026-11-22, deploy PENDING)
- Safety tag `stable-pre-v8-final`; v8 uncommitted at HEAD `2d29150`. Deploy PENDING until FaiCodex confirms; QA not claimed.
- v8 work: 12 jitter animations killed; static `.stage-3d-orange-bg` on 10 stages + `#ambient-particles` host; stat counter bot-proof (number animation removed); selective 3-model tuning ONLY (tablet/MacBook 0.70, AirPods 0.76 + Space Grey `#8A8F98`); 18-mote dpr=1 30 FPS particle canvas; `.stat-final` paint-only fade.
- Stale 1.3/5 / 90-day in Google snippets = Google CACHE, not live SSR — needs Faisu's GSC Request Indexing on 5 URLs: `/`, `/privacy`, `/terms`, `/refund-policy`, `/services/iphone-display-repair`.
- NEXT SESSION: predeploy + QA v8 gates → commit → deploy after FaiCodex confirms.

## v10 status (2026-11-22, APPROVED by Faisu, deploy PENDING)
- Safety tag `stable-pre-v10-closure` from HEAD `f105fa0`. v10 uncommitted; do NOT claim QA PASS/deploy until FaiCodex confirms.
- FE-1 glass-lab CTA rebuild (`.glass-lab-cta-band` + 9 `.lab-hash-chip`, text preserved) + luxury Obsidian/neon-orange footer (`pb-84px`) + 5 animations; BE-1 repair-status → POST `/api/crm-status` (0 405s, no fabricated stages) + input normalization; RES-1 robots 10 crawlers + IndexNow key + Apple Maps + `docs/GMB_ADS_COMPLIANCE.md` + 48h index-flip check; PY-1 both noindex gates BLOCKING in predeploy; QA-1 v10 gates; DevOps deploy; DOC-1 memory.
- FaiCodex 3D fix: `computeTightDeviceBounds()` (device meshes only, 0.88–0.90 near-edge fill) replaces inflating `Box3.setFromObject(root)`; `/_next/` re-allowed in robots.ts. Shared renderer intact.
- Preservation: store/machine images, aspect ratios, quotations, WhatsApp flows, v9 gap/noindex fixes untouched.
- 48h follow-up: after GSC indexing 5 URLs, confirm cached 1.3/5 & 90-day → 4.9/5 & 6 Months. Faisu-only: GSC 5 URLs, delete 2 old Vercel projects (`redappplemobilerepair`, `red-apple-repair`), optional Apple Business Connect.


## v18 status (2026-11-23, DOC COMPLETE, deploy PENDING, HEAD c055731)
- Generated /root/workspace/RedApple_Platinum_Final_Analysis.docx (platinum analysis + OpenCode advisory, 53 KB, 11 sections, verified opens OK).
- This pass DOCUMENTATION/MEMORY ONLY — DOC-1 did not touch src/public/scripts/tests/CRM.
- 7 agents × 2 gifts (14): FE-1 flush+polish; RES-1 Meta-only repolicy+false-negative fix; BE-1 X-Request-Id+fail-open; PY-1 retrying monitor+sanitized audit; QA-1 culprit scanner+variance harness; DevOps cache headers+predeploy; DOC-1 docx+handoff.
- Deploy PENDING until FaiCodex confirms. GSC 6 URLs, delete 2 Vercel clones, hand ads doc (META ONLY). CRM bridge DEFERRED.
