# Apple / iPhone Display Repair — Google Ads + Meta Ads Setup

Owner: Faisu · Prepared by @research · 2026-11-23 · For handoff to the ads manager.

**Config source:** `src/lib/seo/adsTargeting.ts` (keywords, 17 zones, AREA_SERVED,
conversion events, disclaimer, negative-keyword guard-list).
**Companion audit:** `docs/GOOGLE_STRIKE_RESEARCH.md`.

## 0. Non-negotiables (read first)
- We are an **independent** studio. Never use "Authorized", "Apple Authorized",
  "genuine Apple parts", "official", "Google Guaranteed", GST or affiliation claims.
  (Google replaced Google Guaranteed with a single **Google Verified** badge in
  Oct 2025 — do not resurrect retired badges in copy.)
- Ad copy must carry the disclaimer exported as `ADS_DISCLAIMER`:
  *"Independent repair studio. Not affiliated with or endorsed by Apple Inc. Apple is a trademark of Apple Inc."*
- Quote only published price ranges. Never promise a diagnosis outcome before assessment.
- NAP is fixed: Metro Pillar No 125, No.38, next to Vignesh Dresses, opp. Bhadra
  Landmark, Halasuru, Bengaluru 560008 · +91 86606 63776 · 10 AM–12 AM, all 7 days.
- Content category: **Apple Display Repair** · City: **Bengaluru** · State: Karnataka.

## 1. Targeting constants (copy from the config, don't retype)
- `PRIMARY_KEYWORDS` — 10 display-led, high-intent terms (Apple display repair
  Bengaluru; iPhone display replacement; iPhone OLED screen repair; front-glass
  restoration; iPad/MacBook/Apple Watch display repair).
- `SERVICE_AREAS` / `AREA_SERVED` — the same **17 Bengaluru zones** used in schema:
  Halasuru, Indiranagar, MG Road, Koramangala, Lavelle Road, Richmond Town,
  Benson Town, Sadashivanagar, HSR Layout, Whitefield, Bellandur, Sarjapur Road,
  Jayanagar, JP Nagar, Domlur, Hebbal, Bengaluru.
- Treat zones as a **coverage area from one store**, not 17 offices. Do not claim
  a local address or a separate Google Business Profile per zone.

## 2. Google Ads
### 2a. Product choice
- **Search campaigns are primary.** Electronics/mobile repair is not a standard
  Local Services Ads job category in most markets; if " electronics repair" LSA
  eligibility is offered in the account, run it too (pay-per-lead, Google Verified
  badge, service type + area, no keywords). Do not claim Google Verified until
  screening actually passes.
- If LSA is unavailable, set up a Search campaign first; add Performance Max later
  **only after** call/form conversion tracking works (PMax needs conversion goals).

### 2b. Campaign / ad group structure (one intent per ad group)
| Ad group | Landing page | Match keywords (seed) |
|---|---|---|
| iPhone display | `/services/iphone-display-repair` | iPhone display replacement Bengaluru, iPhone OLED screen repair, iPhone screen replacement Halasuru |
| Front glass restoration | `/services/iphone-display-repair` (glass section) | iPhone front glass restoration Bengaluru, front glass repair original OLED |
| Other displays | `/services` | iPad display repair Bengaluru, MacBook display repair Bengaluru, Apple Watch screen repair Bengaluru |
| Generic local intent | `/` or `/quote` | Apple display repair near me, iPhone repair MG Road |

Use **phrase + exact** match at launch; broad only with a mature negative list.
Add call assets and location assets; point the location asset at the canonical GBP.

### 2c. Negative keywords — paste `NEGATIVE_KEYWORDS` verbatim
Job seekers (`jobs`, `career`, `salary`, `hiring`), DIY/tutorial/free, used/
wholesale, and — critically — `authorized service center`, `apple authorized`,
`genuine apple parts`. These prevent paying for traffic we must not claim to serve.

### 2d. Geo, schedule, budget
- Location targeting: **Presence** (not presence-or-interest) on Bengaluru + the
  17 zones. Add zone names in ad copy where genuinely relevant; never invent local proof.
- Schedule: align to live answering hours, 10 AM–12 AM IST. Use ad scheduling to
  bid down when nobody can pick up.
- Bid strategy: start Manual CPC / Maximize Clicks with a cap, move to
  Maximize Conversions once `lead_submit` / `phone_call` have ~30–50 conversions.

### 2e. Conversion actions to create (names from `CONVERSION_EVENTS`)
`lead_submit` (quote form), `estimate_request`, `whatsapp_click`, `phone_call`
(call asset + click-to-call), `pickup_booking`, `directions_click`,
`repair_status_check` (engagement, secondary). Mark revenue/primary only for
qualified lead events; import offline "booked job" outcomes later via an
enhanced-conversions-style import so the manager optimises to booked work, not raw clicks.

## 3. Meta Ads (Facebook + Instagram)
- Objective: **Leads / Advantage+ Leads**. Two conversion locations worth testing:
  1. **Click-to-WhatsApp** (recommended first — the business already runs WhatsApp
     ticketing): Leads → Messaging destination → WhatsApp → Maximize number of leads.
     To optimise for leads, share at least one lead/purchase event via WhatsApp or
     Conversions API for Business Messaging, and label chats with Meta's predefined
     `Lead` / `Booked` labels.
  2. **Instant Forms** with the **Higher intent** review screen. Add 2–3 qualifying
     questions: *Device model? · What's wrong (display/glass/other)? · How soon?*
     Avoid prohibited question categories (financial, criminal, account data).
- **Conversions API (CAPI) alongside the Pixel.** Note: from April 2026 the
  "qualified leads" goal is unavailable for new campaigns without CAPI; Meta
  reports ~21% lower cost per quality lead when CAPI for CRM is used with it.
  Do not send bare "conversation started" events as Leads — add the qualifying step.
- Audience: Advantage+ audience + Advantage+ placements; **avoid over-stacking**
  detailed-targeting filters. Use a service-area radius around Bengaluru rather
  than a tiny pin. Build a small retargeting set (site visitors, page engagers)
  from day one.
- Learning phase: run ≥7 days; budget for ~50 leads/ad-set/week; don't churn
  budgets daily. Prepare 3–4 creatives — real store, TBK machinery, before/after
  glass work, real faces — never stock "Apple store" imagery.
- **Speed to lead:** follow up within minutes during 10 AM–12 AM; slow follow-up
  is the largest cause of "cheap leads that never book". Leads are only exportable
  for 90 days — connect the CRM / Leads Centre so none expire.

## 4. Measurement map
| Event | Google Ads | Meta (Pixel/CAPI) | Owner |
|---|---|---|---|
| `lead_submit` | primary conversion | `Lead` via website/CAPI | form API |
| `estimate_request` | primary conversion | `Lead` | `/api/estimate` |
| `whatsapp_click` | secondary | `Contact` / WhatsApp lead | front-end |
| `phone_call` | call asset conversion | `Contact` | front-end |
| `pickup_booking` | primary conversion | `Schedule` | `/api/pickup-booking` |
| `repair_status_check` | engagement only | custom engagement | status page |

Judge every campaign by **cost per booked job**, not cost per click or per chat.
Keep a source field in the CRM per lead.

## 5. Compliance do / don't
**Do:** keep NAP, hours, 6 Months warranty and 4.9/1103 consistent; say "independent";
quote published ranges; disclose the disclaimer; use real store photography.
**Don't:** buy "authorized"/"genuine Apple" keywords; use retired Google Guaranteed
badges; create 17 near-duplicate zone landing pages (doorway-abuse risk — one
coverage list + a few genuinely distinct service pages is correct); run fake urgency;
run ads when nobody can answer.

## 6. Handoff checklist for the ads manager
1. Confirm tracking: GA4 events named exactly as `CONVERSION_EVENTS`; Meta Pixel + CAPI verified.
2. Paste `PRIMARY_KEYWORDS` and `NEGATIVE_KEYWORDS`; set geo to Bengaluru + the 17 zones.
3. Create ad groups in §2b; attach disclaimer to every ad and creative.
4. Launch Search first (or LSA if genuinely eligible); add Meta click-to-WhatsApp in parallel.
5. Wait 7 days, review by qualified lead and booked job, then scale.
6. Never edit `src/lib/site.ts`, pricing files, images or 3D assets to chase ad performance.
