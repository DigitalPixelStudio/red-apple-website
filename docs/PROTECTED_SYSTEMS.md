# Protected Systems — Hard Rules

These are change-control rules, not suggestions. A build must fail if key AI / CRM invariants disappear.

## 1. 3D scenes and model rendering — OWNER LOCK
**Do not alter without prior owner consultation:**
- `public/final-site.js` 3D model builders and their scene setup.
- Three.js version / script loading strategy.
- Renderer creation options, antialiasing, pixel ratio / DPR caps, canvas copy/compositing, render loop cadence, visibility observers, slot scheduler and resize handling.
- Geometry, materials, texture mapping, lights, camera positions, model scale, animation functions, drag/orbit controls, canvas IDs and stage dimensions.
- CSS affecting `.stage-3d-box`, `.stage-3d-white`, `.tile-3d-studio-*`, canvas sizing or touch-action.
- The currently approved 3D baseline is commit `a9e62b2178530236334999b45ac8322cbabbcb02`.

Allowed without changing the models: theme controls outside the canvas; theme-specific text/surface styling that explicitly excludes model stages and canvases; backup/documentation tooling.

## 2. AI concierge and photo/image analysis — DO NOT TOUCH
Protected file: `src/app/api/concierge/route.ts`.
Do not change model names/fallback order, prompt, knowledge retrieval, streaming, API key resolution, image consent, accepted MIME types, image-size limits, payload limits, Gemini inline image forwarding, rate limiting, provider timeouts or safe fallbacks without explicit approval.

Critical markers currently protected by the prebuild guard:
- `GEMINI_IMAGE_INPUT_ENABLED`, `IMAGE_MODELS`
- `imageConsent`, `inlineData`, `image-review-disabled`
- `image_payload_too_large`, `KNOWLEDGE_BASE`, `localResponse`

No theme, backup or UI task should edit this route.

## 3. CRM / repair status — DO NOT TOUCH
Protected file: `src/app/api/crm-status/route.ts`.
Preserve:
- POST validation and rate limiting.
- Read-only Supabase REST access.
- customers → repairs → invoices lookup and current join/filter logic.
- ticket and phone matching, masked phone output and no-store responses.
- status-to-stage mapping and WhatsApp fallback.
- no customer data in public logs, Git, static backups or manifests.

Do not change table names, columns, credentials, RLS, policies, schema, status values or CRM data without explicit owner approval.

## 4. Health and lead capture
Protected files:
- `src/app/api/health/route.ts`
- `src/app/api/lead/route.ts`
The health endpoint must continue to report concierge, imageUnderstanding, CRM, CRM table probes, lead storage and website lead ledger. The critical-flow guard verifies source invariants; it is not a substitute for a live runtime probe.

## 5. Theme scope
- Toggle only changes `html[data-theme]` and saved `ra-theme` preference.
- Theme changes must not change any 3D renderer settings or image bytes.
- No global `filter: invert()`, brightness, opacity or blend-mode hacks on images/canvas.
- 3D model stages and stage backdrops stay on their approved light/graphite studio palette in both themes.
- Dark theme may restyle page surfaces, borders, text, inputs and native controls only.
- Maintain keyboard focus, aria-label, aria-pressed and visible icon state.

## 6. Database and secrets
- Never commit `.env*`, API keys, service-role keys, database exports, customer data, invoice PDFs or repair ticket dumps.
- Backups are allowlisted source/assets only. Live CRM database backup is a separate, owner-approved secure operation and must use encrypted storage and access controls.
- Never print secrets in logs or documentation.

## 7. Release gates
1. Work on a feature branch.
2. Review diff and verify protected files are unchanged.
3. Run `npm run backup:site` only when a local backup is desired.
4. Run `npm run build`; `prebuild` executes `scripts/critical-flow-guard.mjs`.
5. Verify `/api/health` and CRM status route availability in preview.
6. Test light/dark toggle on phone and tablet; compare all images and every 3D stage.
7. Do not promote to production until the owner explicitly approves.
