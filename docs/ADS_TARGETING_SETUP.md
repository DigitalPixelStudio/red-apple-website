# Apple / iPhone Display Repair — Ads Setup (strike-free)

Owner: Faisu · Prepared by @research · 2026-11-23 (v18) · For handoff to the ads manager.

**Config source:** `src/lib/seo/adsTargeting.ts` (35 primary keywords, 55 negatives, 17 zones,
AREA_SERVED, conversion events, disclaimer, counts) and `src/lib/seo/adQualify.ts` (site-side
lead pre-qualifier). **Companion audit:** `docs/GOOGLE_STRIKE_RESEARCH.md`.

## 0. Read this first — the channel decision (2026 policy)
- **Google Ads does not allow ads for third-party hardware repair.** The official
  [Third-party consumer technical support policy](https://support.google.com/adspolicy/answer/13527027)
  lists "hardware repair services" as not allowed. Google's only carve-outs are
  *selling* consumer technology and support offered **exclusively to businesses** —
  neither fits an independent walk-in repair studio. Do **not** run Google Search
  repair ads; do **not** disguise a repair ad as an accessory/device ad (that is
  circumvention → account suspension, no prior warning).
- **Local Services Ads are not an India fallback.** The "Cell phone and laptop
  repair" LSA category exists only in 11 countries (Austria, Belgium, Canada,
  France, Germany, Ireland, Italy, Spain, Switzerland, UK, US). India is absent.
  "Google Verified" replaced Google Guaranteed in Oct 2025 — never claim the badge
  before screening actually passes.
- **Therefore:** paid demand is run on **Meta (Facebook + Instagram)**; Google
  demand is won free through the **Google Business Profile / Map Pack** and
  organic SEO. The keyword lists below fuel organic relevance, GBP services copy
  and Meta targeting — *not* Google Search repair ads.
- We are an **independent** studio. Never use "Authorized", "Apple Authorized",
  "genuine Apple parts", "official", "Google Verified/Guaranteed", GST or
  affiliation claims. Ad copy must carry `ADS_DISCLAIMER` verbatim:
  *"Independent repair studio. Not affiliated with or endorsed by Apple Inc. Apple is a trademark of Apple Inc."*
- Quote only published price ranges; never promise a diagnosis outcome before
  assessment. NAP is fixed: Metro Pillar No 125, No.38, next to Vignesh Dresses,
  opp. Bhadra Landmark, Halasuru, Bengaluru 560008 · +91 86606 63776 · 10 AM–12 AM, all 7 days.

## 1. Targeting constants (copy from the config, don't retype)
- `PRIMARY_KEYWORDS` — **35 terms**: 10 seeds + **25 NEW strategic positives**
  (`NEW_POSITIVE_KEYWORD_COUNT`). The 25 = 19 hand-written + 6 zone-derived
  (`ZONE_KEYWORDS`) generated from `SERVICE_AREAS`, the same single source as
  schema and llms.txt. Themes: whole display, back glass, front glass, OLED,
  True Tone, same-day, pickup/doorstep, model+fault (iPhone 15 Pro Max / iPhone 14),
  and iPad/MacBook/Watch displays. All describe work we really perform.
- `NEGATIVE_KEYWORDS` — **55 terms** (27 original + **28 NEW**,
  `NEW_NEGATIVE_KEYWORD_COUNT`): jobs/training, DIY/parts-only, trade-in/resale,
  competitor brands (Samsung, Android, OnePlus, Xiaomi), fake authority
  (official Apple store, Apple retail store, AppleCare, Apple Care, warranty
  claim), and remote/free intent.
- `SERVICE_AREAS` / `AREA_SERVED` — the same **17 Bengaluru zones** used in schema.
  Treat zones as a **coverage area from one store**, not 17 offices. Do not claim
  a local address or GBP per zone (Google representation guidelines / doorway risk).

## 2. Meta Ads — the paid channel (primary)
### 2a. Product / objective
- **Leads → Click-to-WhatsApp** (recommended first — WhatsApp ticketing already exists):
  Messaging destination → WhatsApp → performance goal **Maximize number of leads**.
  Eligibility: share ≥1 lead/purchase event via WhatsApp or Conversions API for
  Business Messaging within 7 days, and label chats with Meta's predefined
  `Lead` / `Booked` labels (other labels may not attribute).
- **Instant Forms** alternative: enable **Higher Intent** (`is_optimized_for_quality:
  true` in the Lead Ads API) to add a review-and-confirm step. Add 2–3
  multiple-choice qualifiers: *Device? · What's wrong (display/glass/other)? · How soon?*
  Avoid prohibited question categories. Keep ≤6 questions.
- **CAPI alongside the Pixel.** From April 2026 the "qualified leads" goal is
  unavailable for new campaigns without CAPI; Meta reports ~21% lower cost per
  quality lead with CAPI for CRM. Do not send bare "conversation started" as Lead.
- The `adQualify.ts` result (§7) is the honest quality signal to attach to those
  Lead events — send `high-intent` events back via CAPI so delivery learns
  *booked repair demand*, not chatter.

### 2b. Audience / creative / operations
- Advantage+ audience + Advantage+ placements; avoid over-stacking detailed
  targeting. Use a service-area radius around Bengaluru (17 zones), not a tiny pin.
  Retarget site visitors and page engagers from day one.
- Learning phase: run ≥7 days; budget for ~50 leads/ad-set/week; don't churn budgets daily.
  3–4 creatives — real store, TBK machinery, before/after glass work, real faces —
  never stock "Apple store" imagery.
- **Speed to lead:** follow up within minutes during 10 AM–12 AM. Leads are only
  exportable for 90 days — connect the CRM/Leads Centre so none expire.

## 3. Google — free surfaces only
- **GBP is the product that sends repair customers to the counter.** Keep the
  primary category accurate and genuinely matching (do not stuff the business
  name — that breaks GBP guidelines and risks suspension). Complete NAP, 10 AM–12 AM
  hours, photos, services list, and steady genuine reviews all feed local-pack
  relevance/prominence. HTML NAP already matches GBP NAP site-wide (Whitespark #15).
- **Organic SEO:** the 35 `PRIMARY_KEYWORDS` feed `layout.tsx` metadata keywords
  automatically (deduped) and mirror the display-focused copy already SSR'd on
  `/` and `/services/iphone-display-repair`. Do not build 17 zone landing pages.
- Never attempt to buy or trick local-pack placement; Google states there is no
  way to request or pay for a better local ranking.

## 4. Conversion events (names from `CONVERSION_EVENTS`)
`lead_submit`, `estimate_request`, `whatsapp_click`, `phone_call`, `pickup_booking`,
`directions_click`, `repair_status_check` (engagement, secondary). Mark only
qualified lead events as primary; import offline "booked job" outcomes later so
bidding optimises to booked work, not raw clicks. Judge campaigns by **cost per
booked job**.

## 5. Measurement map
| Event | Meta (Pixel/CAPI) | Google (GA4 only) | Owner |
|---|---|---|---|
| `lead_submit` | `Lead` via website/CAPI | event | form API |
| `estimate_request` | `Lead` | event | `/api/estimate` |
| `whatsapp_click` | `Contact` | event | front-end |
| `phone_call` | `Contact` | event | front-end |
| `pickup_booking` | `Schedule` | event | `/api/pickup-booking` |
| `repair_status_check` | custom engagement | event | status page |

## 6. Compliance do / don't
**Do:** keep NAP, hours, 6 Months warranty and 4.9/1103 consistent; say "independent";
quote published ranges; disclose `ADS_DISCLAIMER`; use real store photography.
**Don't:** run Google Search/LSA repair ads; buy "authorized"/"genuine Apple" keywords;
use retired Google Guaranteed badges; create 17 near-duplicate zone pages; run fake
urgency; run ads when nobody can answer; edit `src/lib/site.ts`, pricing files,
images or 3D assets to chase ad performance.

## 7. Site-side lead pre-qualification — `src/lib/seo/adQualify.ts` (NEW)
This is the "background code that targets only potential customers / kills false
inquiries". It is **pure and SSR-safe** and reads the single-source keyword lists —
no secrets, no API wiring here.

```ts
import { qualifyInquiry, type QualifyResult } from "@/lib/seo/adQualify";

const result: QualifyResult = qualifyInquiry(noteFromEstimateForm);
// result.intent          -> "high-intent" | "low-intent"
// result.verdict         -> "high" | "low" (BE-1 adapter's canonical field)
// result.score           -> honest bounded number (-100..100)
// result.matchedPositive -> exact repair-intent phrases found
// result.matchedNegative -> disqualifying terms found (jobs/DIY/fake authority…)
// result.reason          -> plain-English explanation for CRM notes
```

**Live backend integration (verified 2026-11-26):**
- `src/lib/analytics/leadQuality.ts` wraps `qualifyInquiry()` from this module
  and is already used by `/api/lead`, `/api/estimate`, and
  `/api/track-conversion`.
- The helper is fail-open and non-blocking: it adds a quality verdict/score and
  event name/value; it does not reject or discard an enquiry. Lead/conversion
  storage remains the source of truth.
- The lead and conversion routes persist the quality score/verdict with their
  event rows. The estimate endpoint returns the quality metadata with its quote.
- Live `/api/ads-diagnostics` reports lead storage, persistent conversion
  deduplication and CRM read as configured. Meta CAPI and Bing CAPI are currently
  **not configured**; those require verified owner-supplied endpoint/token
  environment variables. Do not invent or expose credentials.
- Once Meta CAPI is configured, send the existing qualified event and quality
  fields through the already implemented server-side delivery path. Use
  predefined `Lead`/`Booked` WhatsApp labels in parallel.
- Never log or transmit secrets.

**Verified behaviour (transpile smoke test, 2026-11-23):**
- `"Hi, my iPhone 15 Pro Max screen cracked today, need same day display replacement in Indiranagar, pickup possible?"` → `high-intent` (score 4)
- `"iPhone display repair Bengaluru"` → `high-intent` (score 5)
- `"…job vacancy salary / course"` → `low-intent` (score −25, blocked)
- `"DIY screen replacement kit … digitizer spare parts how to fix"` → `low-intent` (score −20, blocked)
- `"Samsung galaxy screen repair"` → `low-intent` (score −10, blocked)
- `"genuine apple parts authorized service center warranty claim"` → `low-intent` (score −15, blocked)

## 8. Handoff checklist for the ads manager
1. Confirm tracking: Meta Pixel + CAPI verified; GA4 events named exactly as `CONVERSION_EVENTS`.
2. Paste `PRIMARY_KEYWORDS` (organic/GBP/Meta) and `NEGATIVE_KEYWORDS` (55) into allowed platforms; geo = Bengaluru + 17 zones.
3. Build Meta click-to-WhatsApp + Higher-Intent Instant Forms; attach `ADS_DISCLAIMER` to every creative.
4. Launch Meta first; run GBP/organic in parallel. **Do not launch Google repair ads.**
5. Wire `adQualify.ts` per §7 so Meta receives honest `high-intent` quality signals.
6. Wait 7 days, review by qualified lead and booked job, then scale.
7. Never edit `src/lib/site.ts`, pricing files, images or 3D assets to chase ad performance.
