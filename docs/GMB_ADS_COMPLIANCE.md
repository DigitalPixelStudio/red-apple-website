# GMB & Ads Compliance — Red Apple Mobile Repair

Owner: Faisu · Studio: The Pixel Forge Studio · Reference doc (v10 multi-search pass, 2026-11-22)

This file records the search/ads compliance guardrails and the two manual
follow-ups only Faisu can perform. It contains no secrets — the IndexNow key is
a public verification token, referenced by filename only.

## Standing compliance rules (do not regress)
- NAP parity everywhere: Metro Pillar No 125, No.38, next to Vignesh Dresses,
  opp. Bhadra Landmark, Halasuru, Bengaluru 560008 · +91 86606 63776 ·
  10 AM–12 AM, all 7 days.
- 6 Months written warranty (motherboard repairs excluded). Rating 4.9 / 1,103.
- Independent studio — NOT Apple authorized. No "genuine" / "authorized" / GST
  claims, no fake urgency, no self-serving aggregateRating or FAQPage schema.
- Canonical GBP: https://share.google/12Pqrwl3lJq4mL75p
- robots.txt explicitly allows Googlebot, Bingbot, Google-Extended,
  OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, Claude-SearchBot,
  ClaudeBot and Applebot; disallows /api/ and /_next/. llms.txt and sitemap.xml
  are public.

## IndexNow (Bing / IndexNow.org) — how Faisu submits
- Public key file: `public/indexnow-key.txt`, deployed at
  https://www.redmobilerepair.in/indexnow-key.txt. The first and only line is
  the 32-hex verification key. This is NOT a secret — never treat it as one.
- The key file sits at the domain root, so IndexNow "Option 2" covers every URL
  on www.redmobilerepair.in as long as `keyLocation` is sent with the request.
- Submit a POST (JSON) to `https://www.bing.com/indexnow` (or
  `https://api.indexnow.org/indexnow`, which fans out to all participating
  engines):

  ```json
  {
    "host": "www.redmobilerepair.in",
    "key": "<contents of indexnow-key.txt>",
    "keyLocation": "https://www.redmobilerepair.in/indexnow-key.txt",
    "urlList": [
      "https://www.redmobilerepair.in/",
      "https://www.redmobilerepair.in/privacy",
      "https://www.redmobilerepair.in/terms",
      "https://www.redmobilerepair.in/refund-policy",
      "https://www.redmobilerepair.in/services/iphone-display-repair"
    ]
  }
  ```

- Key rules (per https://www.indexnow.org/documentation): 8–128 hex chars
  (a-z, A-Z, 0-9, dashes). HTTP 200 = URL(s) received; 202 = key validation
  pending; 403 = key file missing or key not in file.
- Submit only AFTER a production deploy that includes the key file (otherwise
  the ownership check gets a 404 and the request is rejected).

## 48h Google index-flip check (RES-1 approved follow-up)
- Reminder: stale Google snippets cached around Oct 30 still show outdated
  rating / warranty text (e.g. 1.3/5 and 90-day warranty). Live SSR is already
  correct at 4.9 / 1,103 and 6 Months — this is Google's cache, not the live site.
- Faisu's action (GSC, human-only): Request Indexing on `/`, `/privacy`,
  `/terms`, `/refund-policy`, `/services/iphone-display-repair`.
- Then, ~48 hours after the re-crawl, confirm the snippets now read **4.9/5**
  and **6 Months** and no longer show the Oct 30 cached values. If stale text
  persists, re-request indexing and/or re-submit via IndexNow above.
- Do not edit live content to chase a cached snippet — preserve NAP, rating and
  warranty facts as the single source (`src/lib/site.ts`).

## Applebot / multi-search discovery
- AI/search crawlers (Applebot, OAI-SearchBot, ChatGPT-User, PerplexityBot,
  ClaudeBot, etc.) are allowed in robots.txt; llms.txt carries canonical NAP,
  17 Bengaluru zones, services, 6 Months warranty and published price pointers.
- Apple Maps deep link for the store is published in layout metadata:
  https://maps.apple.com/?q=Red+Apple+Mobile+Repair+Halasuru+Bengaluru
