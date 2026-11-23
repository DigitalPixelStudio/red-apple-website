# Google Ban / Strike Deep Research — redmobilerepair.in

Owner: Faisu · Research agent: @research (RES) · Date: 2026-11-23 · One coordinated pass.

Sources consulted (official first):
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) (updated 2026-08-28)
- [LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Review snippet / AggregateRating](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) (updated 2026-09-08)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) (updated 2026-07-10)
- [Google Local Services Ads help](https://support.google.com/localservices/answer/12492201)
- [Meta lead-ads help](https://www.facebook.com/business/help/375478503258484)

**Method:** live fetches with `User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` over Python `urllib` (no curl in sandbox) on `/`, `/privacy`, `/terms`, `/refund-policy`, `/services/iphone-display-repair`, `/quote`, `/robots.txt`, `/llms.txt`, `/sitemap.xml`. All nine returned **HTTP 200**.

## Verdict table

| # | Strike cause (Google policy) | Live evidence | Verdict |
|---|---|---|---|
| 1 | **Cloaking** — different content for bots vs users | Googlebot and Android-Chrome HTML for `/` are **byte-identical** (321,242 B each). Same counts for `warranty` (52), `4.9` (18), disclaimers (1/2). Core copy is SSR. | **PASS** |
| 2 | **Fake authority / "authorized", "genuine", GST claims** | No `GST`, no `1.3/5`, no `90-day`. `authorized` occurs 1× only as Next.js internal RSC key (`"unauthorized":"$undefined"` — not visible copy). `authorised` occurs 2× only inside the compliant disclaimer *"not affiliated with, authorised by, or endorsed by Apple Inc."* `genuine` = "Genuine customer feedback" describing real Google reviews, not parts. | **PASS** |
| 3 | **Self-serving schema (AggregateRating / FAQPage)** | `FAQPage` = **0** in rendered output (dead `faqSchema` is not emitted). One `AggregateRating` (4.9 / 1103) matches the visible, factual rating. Google explicitly states self-serving review markup **does not trigger a manual action** — it is merely ineligible for star display, and star ratings come from the Google Business Profile. | **PASS** (advisory: stars won't render from this markup; kept intentionally) |
| 4 | **Doorway pages / region funnels** | On-site: no city-swapped pages; `/services/*` are genuinely distinct repairs with unique titles, and the 17 zones live in one coverage list + schema, not 17 near-duplicate URLs. **Off-site residual:** the two legacy Vercel clones (`redappplemobilerepair`, `red-apple-repair`) are exactly Google's *"multiple websites with slight variations"* example. | **PASS on-site / RESIDUAL off-site** (Faisu must delete clones) |
| 5 | **Duplicate content** | Visible-text hashes differ across `/privacy` (`da308550…`, 4090 chars), `/terms` (`ac75d385…`, 3578) and `/refund-policy` (`b5af1a54…`, 3620). Every page self-canonicalises. | **PASS** |
| 6 | **noindex accidents** | No `noindex` in `X-Robots-Tag` or `<meta name=robots>` on any of the 6 HTML URLs. Root metadata is `index:true, follow:true` for both general and googleBot. robots.txt allows `/` and `/_next/`, disallows only `/api/`. | **PASS** |
| 7 | **Slow mobile / Core Web Vitals** | Home HTML 321 KB; 23 images, only 1 without explicit width/height attributes — the logo, which has fixed CSS `h-10 w-10 sm:h-11 sm:w-11` so CLS is contained. `three.js` is loaded `beforeInteractive` from CDN (render cost to watch). Field LCP/INP/CLS not measurable from this sandbox. | **ADVISORY PASS** — confirm in GSC PageSpeed Insights |
| 8 | **Deceptive ads** | No ad copy is live. New `adsTargeting.ts` ships an explicit `ADS_DISCLAIMER` and a `NEGATIVE_KEYWORDS` guard-list that blocks "authorized service center" bids. | **PASS (guardrails shipped)** |
| 9 | **Back-button hijacking** | `grep` for `pushState|replaceState|popstate|history.back|history.forward|location.replace|beforeunload` in `public/final-site.js` → **zero matches**. | **PASS** |
| 10 | **Review abuse** | No authored fake reviews; the only rating is a factual GBP figure already visible on the page. Google keeps GBP stars separate from organic markup. | **PASS** |
| 11 | **NAP inconsistency** | Address, phone digits +91 86606 63776, 10 AM–12 AM ×7, 6 Months warranty and 4.9/1103 consistent across SSR pages, schema, sitemap and robots. **Minor:** the *live* `/llms.txt` prints `+918660663776` (same digits, no spaces) because `src/app/llms.txt/route.ts` shadows `public/llms.txt`. | **PASS (formatting advisory)** |
| 12 | **Keyword stuffing / hidden text** | Each Bengaluru zone appears once in visible homepage copy (MG Road 7× as part of the real address/NAP, not a city block). No white-on-white or off-screen keyword text. | **PASS** |

**Overall strike verdict: NO BAN / NO MANUAL-ACTION TRIGGERS DETECTED.** 10 clean passes, 2 advisories (CWV field measurement + llms.txt phone formatting), 1 off-site residual (old Vercel clones).

## Fixes applied in this pass (owned files only)
- `src/lib/seo/adsTargeting.ts` (new) — compliance-first ads config: `PRIMARY_KEYWORDS`, `SERVICE_AREAS` (17 zones from the schema single source), `AREA_SERVED`, `CONTENT_CATEGORY`, `CITY`, `CONVERSION_EVENTS`, `ADS_DISCLAIMER`, plus the negative-keyword guard-list.
- `src/app/layout.tsx` (metadata only) — `category` now `Apple Display Repair`; display-focused keywords merged from the config, case-insensitively deduplicated. Description deliberately left unchanged (already Apple-display-led; no duplication).
- `public/llms.txt` — added the canonical content category and city as a factual classification.
- `docs/GMB_ADS_COMPLIANCE.md` — corrected a stale line that claimed robots.txt disallows `/_next/` (it is explicitly allowed).
- `src/app/robots.ts` — **verified compliant, no change needed** (14 crawlers, `/_next/` allowed, `/api/` disallowed, sitemap + host set).

## Residual manual items — Faisu only
1. **GSC Request Indexing** on `/`, `/privacy`, `/terms`, `/refund-policy`, `/services/iphone-display-repair` — clears the cached 1.3/5 and 90-day snippets. Then verify at ~48h.
2. **Delete the two old Vercel projects** `redappplemobilerepair` and `red-apple-repair` — cross-domain near-duplicate risk (doorway-abuse example) and split signals.
3. **PageSpeed Insights (field data)** on `/` and `/services/iphone-display-repair` — confirm LCP/INP/CLS.
4. **Orchestrator only:** align the phone format in `src/app/llms.txt/route.ts` to `+91 86606 63776`; that route (not `public/llms.txt`) is what currently serves `/llms.txt`. Not touched here — outside this agent's file ownership.
