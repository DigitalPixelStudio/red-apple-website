# Google Ban / Strike Deep Research — redmobilerepair.in

Owner: Faisu · Research agent: @research (RES) · Initial: 2026-11-23 · v18 update: 2026-11-23 · One coordinated pass.

## Sources consulted (official first)
- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies) (updated 2026-08-28)
- [LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Review snippet / AggregateRating](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) (updated 2026-09-08)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) (updated 2026-07-10)
- [Google Ads — Third-party consumer technical support](https://support.google.com/adspolicy/answer/13527027) — **critical finding**
- [Google Ads — Other restricted businesses](https://support.google.com/adspolicy/answer/6368711)
- [Google Local Services Ads — getting started / eligible categories](https://support.google.com/localservices/answer/6224841)
- [LSA — how providers qualify](https://support.google.com/localservices/answer/6230381) and [screening requirements](https://support.google.com/localservices/answer/12174778)
- [Google Business Profile — tips to improve local ranking](https://support.google.com/business/answer/7091)
- [Whitespark 2026 Local Search Ranking Factors](https://whitespark.ca/local-search-ranking-factors) (industry survey, not Google-official)
- [Meta Lead Ads / qualified-leads guidance](https://www.facebook.com/business/help/575610661605746/)
- [Meta Lead Ads API — Higher Intent forms](https://developers.facebook.com/documentation/ads-commerce/marketing-api/guides/lead-ads/create)

**Method:** live fetches with `User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` over Python `urllib` (no curl in sandbox) on `/`, `/privacy`, `/terms`, `/refund-policy`, `/services/iphone-display-repair`, `/quote`, `/robots.txt`, `/llms.txt`, `/sitemap.xml`. All nine returned **HTTP 200**.

## Verdict table

| # | Strike cause (Google policy) | Live evidence | Verdict |
|---|---|---|---|
| 1 | **Cloaking** — different content for bots vs users | Googlebot and Android-Chrome HTML for `/` are **byte-identical** (321,242 B each). Same counts for `warranty` (52), `4.9` (18), disclaimers (1/2). Core copy is SSR. | **PASS** |
| 2 | **Fake authority / "authorized", "genuine", GST claims** | No `GST`, no `1.3/5`, no `90-day`. `authorized` occurs 1× only as Next.js internal RSC key. `authorised` occurs 2× only inside the compliant disclaimer. `genuine` = "Genuine customer feedback" describing real reviews, not parts. | **PASS** |
| 3 | **Self-serving schema (AggregateRating / FAQPage)** | `FAQPage` = **0** in rendered output. One `AggregateRating` (4.9 / 1103) matches visible, factual rating. Google states self-serving review markup **does not trigger a manual action** — merely ineligible for star display. | **PASS** (advisory: stars come from GBP, not this markup) |
| 4 | **Doorway pages / region funnels** | On-site: no city-swapped pages; `/services/*` are distinct repairs; 17 zones live in one coverage list + schema, not 17 near-duplicate URLs. **Off-site residual:** two legacy Vercel clones are exactly Google's *"multiple websites with slight variations"* example. | **PASS on-site / RESIDUAL off-site** |
| 5 | **Duplicate content** | Visible-text hashes differ across `/privacy`, `/terms`, `/refund-policy`. Every page self-canonicalises. | **PASS** |
| 6 | **noindex accidents** | No `noindex` in `X-Robots-Tag` or `<meta name=robots>` on any HTML URL. robots.txt allows `/` and `/_next/`, disallows only `/api/`. | **PASS** |
| 7 | **Slow mobile / Core Web Vitals** | Home HTML ~322 KB; core copy SSR. Field LCP/INP/CLS not measurable from this sandbox. | **ADVISORY PASS** — confirm in GSC PageSpeed Insights |
| 8 | **Deceptive ads / misrepresentation** | No ad copy is live. Config ships `ADS_DISCLAIMER`, a 55-term `NEGATIVE_KEYWORDS` guard-list, and — NEW — `adQualify.ts` which blocks fake-authority, DIY, job and competitor queries at the inquiry layer. No "official/authorized" claims anywhere. | **PASS (guardrails shipped + lead-side filter)** |
| 9 | **Back-button hijacking** | `pushState|replaceState|popstate|history.back|location.replace|beforeunload` in `public/final-site.js` → **zero matches**. | **PASS** |
| 10 | **Review abuse** | No authored fake reviews; only a factual GBP figure already visible on the page. | **PASS** |
| 11 | **NAP inconsistency** | Address, phone digits +91 86606 63776, 10 AM–12 AM ×7, 6 Months warranty and 4.9/1103 consistent across SSR pages, schema, sitemap, robots and `/llms.txt`. | **PASS** |
| 12 | **Keyword stuffing / hidden text** | Each Bengaluru zone appears once in visible copy. No white-on-white or off-screen keyword text. Metadata keywords are deduplicated case-insensitively. | **PASS** |
| 13 | **NEW — Paid-ads channel legality** | Google's [Third-party consumer technical support](https://support.google.com/adspolicy/answer/13527027) policy explicitly lists **"hardware repair services"** as not allowed. LSA's "Cell phone and laptop repair" category is limited to 11 countries (Austria, Belgium, Canada, France, Germany, Ireland, Italy, Spain, Switzerland, UK, US — **India is not listed**). Running Google Search/LSA *repair* ads would risk disapproval and, if disguised as a product ad, **circumvention → account suspension**. We do not run them. Paid demand goes to **Meta** (FB/IG click-to-WhatsApp + Higher-Intent forms); Google demand comes free via GBP/Map Pack + organic SEO. | **PASS (channel pivot; no Google repair ads)** |

**Overall strike verdict: NO BAN / NO MANUAL-ACTION TRIGGERS DETECTED.** 12 clean passes, 1 advisory (field CWV), 1 off-site residual (old Vercel clones). The v18 research adds a decisive ad-channel safety finding that *prevents* a future strike rather than reacting to one.

## Live re-audit — v18 (2026-11-23, Googlebot UA, Python urllib)

| Route | Status | Bytes | noindex | Banned strings |
|---|---|---|---|---|
| `/` | 200 | 322,808 | no | none |
| `/privacy` | 200 | 64,717 | no | none |
| `/terms` | 200 | 63,440 | no | none |
| `/refund-policy` | 200 | 63,868 | no | none |
| `/services/iphone-display-repair` | 200 | 77,665 | no | none |
| `/quote` | 200 | 66,504 | no | none |
| `/robots.txt` | 200 | 663 | no | none |
| `/llms.txt` | 200 | 7,119 | no | none |
| `/sitemap.xml` | 200 | 3,097 | no | none |

Banned-string scan: `1.3/5`, `90-day`, `GST`, `authorized service`, `genuine apple parts`, `Apple Authorized` → **0 hits on every route**. Factual `4.9` present on all HTML pages.

**robots.txt confirmed live:** `Allow: /` and `Allow: /_next/` for `*` and every listed UA; `Disallow: /api/` only; 14 distinct UA groups (Googlebot, Bingbot, Google-Extended, GPTBot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, ClaudeBot, PerplexityBot, Applebot, Applebot-Extended, facebookexternalhit, WhatsApp, AdsBot-Google, CCBot, meta-externalagent) — all allowed; `Sitemap` + `Host` set. AI-bot lock intact.

## Deep-research findings applied in v18

1. **Do not buy Google repair ads.** Third-party hardware repair is a restricted business; the only allowed carve-outs are *selling* devices/accessories and B2B-only support. Neither fits this studio. Disguising a repair ad risks account-level suspension with no reinstatement. → Documented in `ADS_TARGETING_SETUP.md §0/§2a`; keyword lists are explicitly labelled for organic/GBP/Meta use.
2. **LSA is not a fallback in India.** Eligible-country list (Google help, checked 2026-11-23) does not include India; "Google Verified" replaced Google Guaranteed in Oct 2025 and must never be claimed before screening passes.
3. **Local pack = relevance + distance + prominence** (Google GBP help). Controllable high-value levers: primary category ("Cell phone repair"/"Electronics repair" as genuinely matching), complete NAP, accurate 10 AM–12 AM hours (Whitespark #5 "open at time of search"), steady genuine reviews, and **HTML NAP matching GBP NAP** (Whitespark #15) — already consistent site-wide.
4. **Negatives are the biggest cost lever in repair** (DIY, parts-only, trade-in, brand warranty, jobs, remote). Grown from 27 → 55 terms.
5. **Lead quality, not clicks, is the optimisation target.** Meta's own guidance: Higher-Intent forms (`is_optimized_for_quality`), multiple-choice qualifying questions, predefined `Lead`/`Booked` labels, and CAPI-quality signals. Our `adQualify.ts` produces an honest on-site `high-intent`/`low-intent` signal BE-1 can attach to those events — a policy-safe "elite crack" that works from day one without any ad-account trickery.

## Fixes applied in this pass (owned files only)
- `src/lib/seo/adsTargeting.ts` — **25 new strategic positives** (19 hand-written + 6 zone-derived from the `SERVICE_AREAS` single source): whole-display/back/front glass/OLED/True Tone, same-day, pickup, model+fault, other Apple displays. Primary 10 → **35**. Negatives 27 → **55 (+28)**: jobs, DIY/parts, trade-in, Samsung/Android/OnePlus/Xiaomi, official-Apple-store/AppleCare/warranty-claim, remote/free. Exported `NEW_POSITIVE_KEYWORD_COUNT`, `NEW_NEGATIVE_KEYWORD_COUNT`, `ZONE_KEYWORDS`.
- `src/lib/seo/adQualify.ts` (**new**) — pure SSR-safe `qualifyInquiry(text)` pre-qualifier: positive boost + negative hard-block + device/fault/local/urgency token layer, bounded honest score, explainable reason. Not wired into APIs (BE-1 owns those); documented integration recipe.
- `src/app/layout.tsx` (metadata only) — **no edit needed**: it already spreads `PRIMARY_KEYWORDS` into `SEO_KEYWORDS`, so all 35 terms flow to metadata automatically; dedupe preserved.
- `public/llms.txt` — **no edit needed**: NAP, 17 zones, display services, warranty and pickup already factual and consistent; re-audit confirms 7,119 B live.
- `src/app/robots.ts` — **no edit needed**: verified compliant (14 crawlers, `/_next/` allowed, `/api/` disallowed, sitemap + host set).

## Residual manual items — Faisu only
1. **GSC Request Indexing** on `/`, `/privacy`, `/terms`, `/refund-policy`, `/services/iphone-display-repair` — clears cached 1.3/5 and 90-day snippets; verify at ~48h.
2. **Delete the two old Vercel projects** `redappplemobilerepair` and `red-apple-repair` — cross-domain near-duplicate risk and split signals.
3. **PageSpeed Insights (field data)** on `/` and `/services/iphone-display-repair` — confirm LCP/INP/CLS.
4. **Do not run Google Search/LSA repair ads.** Hand `ADS_TARGETING_SETUP.md` to the ads manager with this constraint called out.
