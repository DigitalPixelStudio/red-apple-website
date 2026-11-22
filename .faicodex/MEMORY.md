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
