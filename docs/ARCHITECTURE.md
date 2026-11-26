# Website Architecture & Build Record

## Runtime / framework
- Next.js **16.4.6**, App Router.
- React / React DOM **19.2.8**.
- TypeScript **5.x**.
- Tailwind CSS **4.x** through `@tailwindcss/postcss`.
- Node.js **22.x** (declared in `package.json`; do not jump major versions without testing).
- Hosting: Vercel; Mumbai runtime region has been used for this project (Vercel region code `bom1`).
- PWA support includes service-worker registration in `public/final-site.js`, `public/sw.js`, install prompt component and web manifest/assets.

## 3D / motion / visual layer
- Three.js **r128**, loaded from cdnjs in `src/app/layout.tsx` using `beforeInteractive`.
- Main procedural 3D scene/model construction and render scheduling live in `public/final-site.js`. The 3D models are primarily code-generated meshes; the model source is the JavaScript scene-builder, not a folder of downloadable GLB files.
- Interactive canvas IDs include the hero iPhone and machine/device stages; preserve existing IDs and their matching scene registration.
- CSS and stage framing live in `src/app/final-site.css`; global tokens and motion helpers live in `src/app/globals.css`.
- HTML structure is the owner-approved template in `src/lib/final-site-html.ts`, mounted verbatim by `src/app/page.tsx`.
- Fonts are loaded using `next/font/google`: Inter, Plus Jakarta Sans (legacy CSS variable `--font-space`) and JetBrains Mono.
- 3D renderer settings and model source are owner-locked. A backup script includes `public/final-site.js` and all public image assets.

## AI / image analysis
- FaiCodex AI API: `src/app/api/concierge/route.ts`.
- Gemini REST API is called directly with `fetch`; no dedicated Gemini SDK dependency is declared in `package.json`.
- Model fallback arrays and image-model order are declared in the route.
- Image requests use explicit user consent, allowlisted JPEG/PNG/WebP MIME types, per-image and aggregate payload limits, Gemini `inlineData` forwarding, and a safe disabled/unavailable response.
- Knowledge retrieval is assembled from `src/lib/knowledge-base.ts`, FAQ/service/device catalog and approved price sources.
- Streaming response parsing is implemented in the route.

## CRM / data
- Public read-only repair lookup: `src/app/api/crm-status/route.ts`.
- Health probe: `src/app/api/health/route.ts`.
- Lead capture: `src/app/api/lead/route.ts`.
- Supabase is accessed via PostgREST `fetch` calls; no Supabase SDK dependency is listed in package dependencies.
- Public status lookup reads customers, repairs and invoices; masks phone numbers and avoids returning customer profiles.
- Do not assume a successful health probe means every optional feature is configured; inspect each reported service field in preview.

## Main source map
| Path | Responsibility |
|---|---|
| `src/lib/final-site-html.ts` | Approved page HTML structure |
| `src/app/page.tsx` | Mounts approved HTML and loads final-site.js |
| `public/final-site.js` | 3D scenes, interactions, estimates, UI behaviours, PWA registration |
| `src/app/final-site.css` | Main site presentation, stages, responsive and motion styles |
| `src/app/globals.css` | Global tokens, base typography, common animations |
| `src/app/layout.tsx` | Root layout, metadata, fonts, Three.js loader, PWA install UI |
| `src/app/api/concierge/route.ts` | AI concierge and image understanding |
| `src/app/api/crm-status/route.ts` | Read-only repair status lookup |
| `src/app/api/health/route.ts` | Service and integration health probes |
| `src/lib/knowledge-base.ts` | Approved AI facts and policies |
| `src/lib/pricing.ts` | Approved device repair price matrix |
| `scripts/critical-flow-guard.mjs` | Prebuild invariant checks |
| `scripts/backup-site-assets.mjs` | Allowlisted source/assets snapshot |

## Tools and libraries actually present
- Next.js, React, React DOM, TypeScript, Tailwind CSS, ESLint, Zod.
- Three.js r128 via CDN script.
- Browser APIs used by current code include IntersectionObserver, ResizeObserver, requestAnimationFrame, Canvas/WebGL, Service Worker and localStorage.
- Vercel deployment and runtime logs; GitHub repository/branches/commits.
- Gemini API and Supabase REST endpoints through native fetch.
- Do not add packages or external services just for a cosmetic theme toggle.

## Commands
```bash
node --version             # expected Node 22.x
npm install
npm run dev
npm run lint
npm run build              # runs critical-flow-guard as prebuild
npm run backup:site        # allowlisted local backup, no customer database rows
```

## Environment variable names referenced by source (names only; never store values here)
- Gemini: `GEMINI_API_KEY` and supported aliases; `GEMINI_IMAGE_INPUT_ENABLED`.
- CRM/Supabase: `CRM_SUPABASE_URL`, `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `CRM_SUPABASE_READONLY_KEY`, service-key aliases.
- Optional leads/analytics: `LEAD_WEBHOOK_URL`, `NEXT_PUBLIC_GA_ID`.
- Exact deployed values are environment-specific and must be checked in Vercel; do not infer them from source.
