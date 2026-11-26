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
