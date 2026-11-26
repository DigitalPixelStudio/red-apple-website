# Red Apple Mobile Repair — Project Memory & Owner Preferences

This document is the durable project brief for future maintainers and coding agents. It records known owner decisions and hard constraints. If a fact is uncertain, preserve the existing implementation and ask before changing it.

## Product identity
- Project: Red Apple Mobile Repair, Halasuru, Bengaluru.
- Production domain: https://www.redmobilerepair.in
- GitHub repository: https://github.com/DigitalPixelStudio/red-apple-website
- Main preview branch used for this work: `feat/nov26-preserve-backup-theme`.
- Customer-facing assistant name: **FaiCodex AI**. Do not rename it without owner approval.
- Red Apple is a separate client/business project; do not merge Pixel Forge Studio branding or data into it.

## Owner-approved design direction
- Premium, elite, corporate repair-lab presentation.
- Existing warm white / pearl / red / orange visual identity is the approved default.
- Keep the current layout, content hierarchy, mobile/tablet responsive behaviour, CTA hierarchy, images, and 3D model framing.
- Motion should feel deliberate and smooth, not busy. Typography motion may use subtle transform/opacity only.
- 3D models must retain their current known-good appearance, scale, camera framing, lighting, geometry, materials, animation and touch interactions.
- Dark mode is an optional user-controlled theme. It must not recolour, invert, tint, dim, crop, or otherwise alter images, video, WebGL canvases, 3D models, model stage backdrops, or machine/product photography.
- Persist theme choice locally. Light mode remains the default for first-time visitors unless the owner explicitly approves system-following behaviour.

## Owner communication / workflow preferences
- Explain changes before making risky changes; do not surprise the owner with broad redesigns.
- Keep work mobile-first and tablet-aware.
- Prefer minimal, reversible, targeted commits.
- Use a separate feature branch and preview deployment first. Never push unapproved experiments directly to production.
- Provide the exact changed files, commit, preview URL, build result and verification notes.
- Do not claim measured FPS, successful live AI image analysis, CRM transactions or customer delivery unless actually tested.
- The owner wants complete project notes: stack, tools, build commands, architecture, protected flows, assets and rollback instructions.

## Business facts used in public website content
- Independent repair workshop; do not imply Apple Authorised Service Provider status or Apple affiliation.
- Location: Halasuru, Bengaluru.
- Services and pricing are maintained in version-controlled source files. Pricing source notes say the pricing table is generated from the approved workbook; do not hand-edit the table.
- The invoice is the warranty record. Public warranty wording and exclusions must remain consistent with the approved knowledge base.
- Customer-facing status must come from the live CRM lookup, not guessed progress.

## AI assistant rules
- FaiCodex AI answers from the approved website knowledge base, FAQ, service catalog and price matrix.
- No invented prices, warranty promises, repair status, shop facts or hidden fault diagnosis.
- For attached photos, describe only visible evidence and clearly state uncertainty.
- Never claim image analysis if the image feature is disabled or the live vision provider is unavailable.
- Never request customer passcodes, Apple ID/passwords, OTPs, UPI PINs or card credentials.
- Keep photo consent, MIME validation, payload limits, rate limits and safe fallbacks intact.

## CRM rules
- The public repair-status route is read-only and queries the same customers / repairs / invoices data used by the CRM.
- Keep ticket + phone matching, phone masking, rate limiting, no-store caching and no-PII response shape intact.
- Do not rename tables/columns, alter database schema, rewrite status mappings, change credentials or mutate customer records without explicit approval.
- Never export live CRM customer rows, tickets, invoices or phone numbers into Git or a website asset backup.

## Known-good baseline
- The owner explicitly approved the restored 3D preview based on commit `a9e62b2178530236334999b45ac8322cbabbcb02`.
- Treat that snapshot as the 3D visual/performance baseline. Do not change its renderer, canvas compositing, DPR, antialiasing, geometry, materials, cameras, animation timing or visibility scheduling without consulting the owner and testing a separate preview.
- The later touch-GPU optimisation that caused visual defects was reverted for the baseline branch.


## Scroll-settle refinement (2026-11-26)
- A small scroll-settle guard now eases only ambient auto-orbit while the page is scrolling and during the short inertial settle window.
- The shared WebGL renderer continues rendering; no scroll pause, renderer replacement, FPS throttle, DPR, antialiasing, canvas compositing, model geometry, materials, camera framing, or direct pointer-drag controls are changed.
- Preserve the 140 ms scroll quiet period and 280 ms ease-in unless the owner explicitly approves a different interaction feel.
- AI image analysis, FaiCodex concierge, CRM status APIs, database schemas and customer data are outside this change and must remain untouched.


## Desktop/tablet lower 3D stage fit (2026-11-26)
- Lower-stage 3D models use a camera-fit multiplier of 0.86 on desktop and tablet profiles only, increasing camera distance so models sit inside their containers without mesh scaling or aspect distortion.
- Hero model and all mobile profiles retain their previous framing values.
- No canvas/container CSS dimensions, renderer size, DPR, antialiasing, materials, geometry, lighting, interaction, animations, AI image analysis, CRM APIs, database schema or data are to be changed for this adjustment.
- Keep this invariant covered by `scripts/critical-flow-guard.mjs`.


## Model framing and motion cleanup (2026-11-26)
- All 3D stages receive a modest 4% camera-fill increase; the MacBook stage receives an 8% camera-fill increase. Existing desktop/tablet lower-stage fit multiplier remains 0.86 before the zoom boost.
- This is camera framing only. Do not edit model meshes, geometry, dimensions, materials, lighting, model assets, renderer, DPR, antialiasing, touch/drag controls, WebGL scheduling or animation callbacks.
- Decorative typography and CSS motion are off by default to reduce nonessential main-thread/compositor work. The independent WebGL model animation and orbit/touch interaction remain enabled.
- The Reviews section (#reviews), titled around Halasuru and Bengaluru, retains a one-shot side-entry reveal for its four cards. It is not an infinite ticker or continuous animation. Respect prefers-reduced-motion.
- Keep the model zoom, motion-off default, scroll-settle behaviour, and review-side-reveal covered by the critical flow guard.


## Red Apple glass support + stability refinement (2026-11-26)
- Customer-facing brand wordmark is "Red Apple". Keep standard editorial typography black on light surfaces; preserve white text on dark cards/CTAs and semantic status colours.
- Glass Restoration And Repair Support, hashtags, quote/call actions and eight capabilities are merged into one compact panel inside #glass-lab. Do not add a duplicate capabilities section. Exclude the Halasuru/Bengaluru locality label and #Halasuru hashtag from this glass-support panel.
- Equipment wording is "TBK-958 Cold UV Laser".
- Keep hero camera framing at its approved 1.04 multiplier and laptop at 1.08; other non-hero, non-laptop models use 1.08. Camera fill only; no mesh, model asset, geometry, material or rig changes.
- Selecting a glass price pill must update the calculator without calling scrollIntoView on the already-visible #glass-lab section. Preserve native touch scrolling and existing WebGL touch/drag/orbit controls and scroll-settle behaviour.
- Preserve AI image analysis, FaiCodex AI/concierge, CRM APIs/tables, lead capture, database schema/data, environment variables, model assets, and all unrelated page sections.

## Model sizing + scroll-render stability pass (2026-11-26)
- Preserve hero framing at 1.04 and MacBook framing at 1.08, including the existing large-screen MacBook fit multiplier of 0.86.
- Remove the blanket 0.86 desktop/tablet multiplier from all other lower-stage models; it previously cancelled the intended zoom increase and made the models smaller. Apply camera-only fill 1.12 to other non-hero/non-MacBook models. For the three TBK machinery models, use 0.92 on mobile to prevent top/bottom clipping and 1.12 on tablet/desktop.
- Pause the shared WebGL animation/compositing loop during native page scrolling and resume 160 ms after scroll settles. Do not lower DPR, disable antialiasing, change the shared renderer, or alter model geometry, materials, lighting, camera rigs, touch/drag controls, or model animation callbacks.
- Tighten the WebGL visibility window slightly so fewer adjacent stages render simultaneously.
- Remove per-pointermove layout reads/style writes for the decorative 3D glass sheen. Keep pointer drag rotation intact.
- Hide ambient particle/orb layers and disable decorative infinite CSS motion by default; retain one-shot review-card reveals. The 3D model animation remains active whenever the page is not scrolling and the stage is visible.
- Keep FaiCodex AI, image analysis, CRM APIs/tables, lead capture, data, environment variables and all customer flows unchanged.

## Glass panel, model scale and motion cleanup (2026-11-26)
- Glass Restoration And Repair Support is now a compact minimal panel: tighter spacing, smaller type, subtle neutral capability chips, compact quote/call CTAs; all eight capability labels and the original content are retained.
- Camera-only model framing: hero remains 1.04; MacBook increases from 1.08 to 1.14; AirPods reduces from 1.12 to 1.05; TBK machinery reduces from 1.12 desktop/tablet or 0.92 mobile to 1.05 desktop/tablet or 0.86 mobile. No geometry, model assets, material, light, rig, animation or renderer changes.
- Remove the global saturate/contrast filter applied to every heading, text node, button, label and SVG; it was unnecessary work across a large number of page elements.
- The motion-restore CSS had re-enabled ambient-orb drift and ra-motion-text infinite animation even while the document explicitly set data-motion="off". Explicitly disable ambient particles/orbs, text/gradient/accent infinite loops and their transitions by default. Preserve WebGL model motion, touch/drag rotation and one-shot content reveals.
- Keep AI image analysis, FaiCodex AI, CRM APIs/tables, customer records, lead capture, data, environment variables and integrations unchanged. No AI/CRM code or backend files changed in this pass.
## Final 3D framing + text-scroll stability pass (2026-11-26)
- Camera-only, very small zoom-out adjustments: canvas-internals (Component-Level Architecture), canvas-tbk-90l, canvas-estimate-ipad, and canvas-pickup-iphone now use a 1.08 camera-fill multiplier instead of the prior 1.12; TBK 90L uses 1.00 on tablet/desktop and 0.82 on mobile instead of the general machinery multiplier. Other models retain their approved values, including MacBook 1.14 and AirPods 1.05.
- No model geometry, mesh scale, textures, materials, lighting, assets, renderer options, DPR, antialiasing, canvas dimensions, animation callbacks or direct touch/drag controls were changed. Preserve the existing 3D component quality.
- Root cause for text-heavy scroll shimmer: later prefers-reduced-motion: no-preference CSS restore layers re-enabled repeated text opacity/scale, animated font-variation weight, gradient background-position + saturate filter, and ambient-orb drift after earlier static-motion rules. The global .brand-name and .stat-breathe rules also animated variable font weight/background-position.
- src/app/globals.css now overrides those expensive text/ambient loops at the end of the cascade: typography/brand gradients are static, variable font-weight animation is removed, ambient particle canvas is hidden and ambient orbs are static. Preserve one-shot reveals, normal hover/focus feedback, WebGL motion when not scrolling, and touch/drag interaction.
- Main header and light footer wordmark now read Red Apple in black and Mobile Repairs in red. Header retains the Halasuru · Bengaluru locality line.
- Backend, SEO, Ads and CRM files were audited but not modified: /api/concierge, /api/crm-status, /api/health, /api/lead, /api/track-conversion, /api/ads-diagnostics, /api/pickup-booking, /api/estimate; Supabase website-leads/conversion-ledger migrations; canonical/metadata, LocalBusiness + Service JSON-LD, robots, sitemap, llms.txt, IndexNow, 35 primary search terms, 55 negative terms, 17 Bengaluru zones, attribution/UTM capture, conversion deduplication, Meta/GA event hooks and lead qualification helper remain in the release tree.
- Google Ads compliance remains strict: independent consumer hardware repair is restricted by Google's third-party consumer technical support policy. Use GBP + organic SEO for Google discovery and Meta for paid repair leads; do not run or disguise Google Search repair ads.
- Live health probe on production returned CRM, concierge, image understanding, lead storage, customers/repairs/invoices/leads tables all true and catalog count 59; webhook flag false. This is reported as an existing unconfigured flag, not silently changed. Runtime error query over 24h returned no errors; recent runtime error/warning log query returned no entries (Hobby runtime log retention is 1 hour).
## Source-level text jitter correction + release guard (2026-11-26)
- Removed the motion-restore rules directly from src/app/final-site.css, not only through a later override: no-preference visitors no longer re-enable animated heading transforms, animated gradient/filter text, ra-motion text scale, or ambient-orb drift. Removed the faiColorFlow keyframes that animated CSS filter saturation.
- Keep static glyph rendering in all motion preferences. The one-shot Reviews card entrance is preserved; scripts/audit/smoothness_guard.py explicitly allows only that exact review selector when animation-iteration-count is 1 and rejects infinite animation. No 3D renderer or model quality settings are touched.
- Ads diagnostics on the live deployment reported lead storage, persistent conversion deduplication and CRM read true; Meta CAPI and Bing CAPI configuration false. These require account credentials/environment configuration and were not silently changed. The adQualify helper is present but its backend integration remains a documented follow-up, not an active API gate.
- Production QA browser pass before this final release found no clipping, broken images, layout shifts, visible scroll jitter or console errors across the inspected sections; repeat the same check on the final deployment after publish.
