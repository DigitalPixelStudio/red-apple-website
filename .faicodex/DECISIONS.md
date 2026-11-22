# Decision Log — The Pixel Forge Studio / red-apple-site-live

Purpose: one durable, factual record of *why* a change was made, so future passes do not
re-litigate settled decisions. Append-only. Owner: **DOC-1** (Documents & Maintenance).

Format: `DATE — TOPIC — DECISION (one line) — RATIONALE / SOURCE (one line)`.

---

## 2026-11-22 — One-Go Build v5

- 2026-11-22 — Safety baseline — Created git tag `stable-pre-onego-v5` before any v5 edit. — TEAM.md / TASKS.md.
- 2026-11-22 — 3D framing scope — FROZEN: iPhone 17 Pro, Pickup Phone, AirPods Pro, Apple Watch. — TEAM.md / PREFERENCES.md / MEMORY.md.
- 2026-11-22 — 3D tuning scope — ADJUST: iPad (slight), TBK OCA/90L/958 (medium), MacBook/iMac/Mini (medium). — TEAM.md.
- 2026-11-22 — PWA canvas — Recover blank models on `webglcontextlost` / `visibilitychange`. — TASKS.md (live mobile finding).
- 2026-11-22 — Fullscreen — Non-stretch aspect sync; never distort models. — TASKS.md (live mobile finding).
- 2026-11-22 — Header/nav — Single-line brand at 360–430px; top rail `justify-start`, `overflow-x-auto`, `snap-x`, no crop. — TASKS.md.
- 2026-11-22 — FAB placement — AI FAB above bottom dock, no overlap. — TASKS.md.
- 2026-11-22 — Legal links — Privacy/Terms/Refund must use dedicated routes, never `#faq`. — TASKS.md.
- 2026-11-22 — 120fps — Isolate `perf-text-zone` / `clip-notes-zone`; no blur over scrolling text. — TASKS.md.
- 2026-11-22 — Visual — Warm editorial texture + visible GPU laser sweeps; orange glow only on store/machine photos. — TASKS.md.
- 2026-11-22 — Business data — `src/lib/site.ts` is single source; NAP/warranty parity everywhere. — MEMORY.md / TASKS.md.
- 2026-11-22 — AI bot — Keep `/api/concierge` (Gemini + local fallback) intact; do not break. — MEMORY.md.
- 2026-11-22 — Reporting — No phase/day language; one coordinated pass; each agent brings one gift. — PREFERENCES.md / TEAM.md.

_Note: this log was created by DOC-1 to fill the gap where TEAM.md listed DECISIONS.md as owned but the file did not exist._
