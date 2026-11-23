/**
 * Apple / iPhone display repair — Ads & organic SEO targeting configuration.
 *
 * Single, reviewable source of truth for the ads manager, for layout metadata
 * and for the site-side lead pre-qualifier (src/lib/seo/adQualify.ts).
 * Factual only: NO secrets, NO "Authorized" / "genuine Apple parts" / GST /
 * affiliation claims. Red Apple is an independent repair studio.
 *
 * IMPORTANT POLICY CONTEXT (2026, see docs/GOOGLE_STRIKE_RESEARCH.md):
 * Google Ads disallows ads for third-party consumer hardware repair
 * ("Third-party consumer technical support", support.google.com/adspolicy/
 * answer/13527027). LSA's "Cell phone and laptop repair" category is not
 * available in India. These keyword lists are therefore for ORGANIC SEO,
 * Google Business Profile relevance, and META (Facebook/Instagram) ads —
 * NOT for Google Search repair ads. Never disguise a repair ad as a product
 * ad: that is circumvention and risks account suspension.
 *
 * Reference docs: docs/ADS_TARGETING_SETUP.md and docs/GOOGLE_STRIKE_RESEARCH.md
 */

import { BENGALURU_ZONES } from "@/lib/seo/localSchema";

/** Primary market. */
export const CITY = "Bengaluru" as const;
export const STATE = "Karnataka" as const;
export const COUNTRY = "IN" as const;

/** Google's preferred self-described category for this business. */
export const CONTENT_CATEGORY = "Apple Display Repair" as const;

/** 17 Bengaluru zones — re-used from the schema single source (no drift). */
export const SERVICE_AREAS: readonly string[] = BENGALURU_ZONES;

/**
 * AREA_SERVED is the ads-ready form of the same 17 zones.
 * A coverage list only — it does NOT imply a second office or a local GBP
 * in any zone (Google's representation guidelines).
 */
export const AREA_SERVED: ReadonlyArray<{
  name: string;
  region: string;
  country: string;
}> = Object.freeze(
  SERVICE_AREAS.map((name) => ({ name, region: STATE, country: COUNTRY })),
);

/**
 * Original 10 high-intent, Apple-display-led seed keywords. All describe work
 * the studio really performs; none imply Apple affiliation or promise an
 * undiagnosed outcome.
 */
const SEED_KEYWORDS: readonly string[] = [
  "Apple display repair Bengaluru",
  "iPhone display replacement Bengaluru",
  "iPhone OLED screen repair Bengaluru",
  "iPhone screen replacement Halasuru",
  "iPhone front glass restoration Bengaluru",
  "Apple display repair near me",
  "iPhone display repair MG Road",
  "iPad display repair Bengaluru",
  "MacBook display repair Bengaluru",
  "Apple Watch screen repair Bengaluru",
];

/**
 * 25 NEW strategic positive keywords added in the v18 SEO pass.
 * Themes: whole-display/back-glass/front-glass/OLED/True Tone, same-day +
 * pickup intent, model+fault (the highest-converting repair query shape),
 * and other Apple-ecosystem displays. Every term is a service we actually
 * sell; no fake authority or outcome claims.
 */
export const NEW_POSITIVE_KEYWORDS: readonly string[] = [
  // Whole display / glass / panel technology
  "iPhone whole display replacement Bengaluru",
  "iPhone back glass replacement Bengaluru",
  "iPhone front glass repair Bengaluru",
  "iPhone OLED display repair Bengaluru",
  "iPhone True Tone display repair Bengaluru",
  "iPhone cracked screen repair near me",
  "iPhone black screen repair Bengaluru",
  "iPhone glass restoration near me",
  // Urgency + pickup (service we genuinely offer)
  "same day iPhone display repair Bengaluru",
  "iPhone screen repair pickup Bengaluru",
  "doorstep iPhone display repair Bengaluru",
  "iPhone display repair Bengaluru",
  // Model + fault (bottom-of-funnel, research-backed)
  "iPhone 15 Pro Max screen repair Bengaluru",
  "iPhone 14 screen replacement Bengaluru",
  // Rest of the Apple display ecosystem
  "iPad screen replacement Bengaluru",
  "iPad display repair near me",
  "MacBook screen replacement Bengaluru",
  "Apple Watch screen replacement Bengaluru",
  "iPhone display replacement near me",
];

/**
 * Zone-led keywords are GENERATED from SERVICE_AREAS (the schema single
 * source) so a zone name can never drift between schema, llms.txt and ads.
 * The focus zones are filtered through the source: if a name is ever removed
 * upstream, its keyword simply disappears — no stale zone string is emitted.
 * 6 of the 25 new positives (3 zones × 2 intents).
 */
const ZONE_FOCUS_NAMES: readonly string[] = ["Indiranagar", "Koramangala", "Whitefield"];

export const ZONE_KEYWORDS: readonly string[] = Object.freeze(
  SERVICE_AREAS.filter((zone) => ZONE_FOCUS_NAMES.includes(zone)).flatMap((zone) => [
    `iPhone display repair ${zone}`,
    `iPhone screen replacement ${zone}`,
  ]),
);

/** 19 hand-written new positives + 6 single-source zone positives = 25. */
export const NEW_POSITIVE_KEYWORD_COUNT =
  NEW_POSITIVE_KEYWORDS.length + ZONE_KEYWORDS.length;

/**
 * Primary keyword set = 10 seeds + 25 new strategic positives (35 total).
 * Deduplicated case-insensitively so metadata never repeats a term
 * (repetition is a keyword-stuffing signal).
 */
export const PRIMARY_KEYWORDS: readonly string[] = Object.freeze(
  [...SEED_KEYWORDS, ...NEW_POSITIVE_KEYWORDS, ...ZONE_KEYWORDS].filter(
    (k, i, all) => all.findIndex((x) => x.toLowerCase() === k.toLowerCase()) === i,
  ),
);

/**
 * Negative-keyword guard-list — job seekers, DIY/parts, used/wholesale,
 * trade-in, competitor/Android brands, remote support and — critically —
 * "authorized service center" queries the studio must not claim.
 * Paste verbatim into Meta Ads / any allowed platform and use as an ad-copy
 * exclusion and as the adQualify.ts block list.
 */
export const NEGATIVE_KEYWORDS: readonly string[] = Object.freeze([
  // Original 27
  "jobs", "career", "careers", "salary", "vacancy", "hiring", "recruitment",
  "diy", "do it yourself", "tutorial", "how to replace myself", "free",
  "used", "second hand", "refurbished", "wholesale", "cheap copy",
  "authorized service center", "authorised service center",
  "apple authorized", "apple authorised", "genuine apple parts",
  "course", "training", "certification", "logo", "wallpaper",
  // 28 NEW negatives (v18)
  // Employment / training
  "job", "technician job", "apprenticeship", "resume", "internship",
  // DIY / parts-only intent (never a booked repair)
  "how to fix", "how to repair", "repair guide", "repair manual",
  "repair kit", "digitizer", "flex cable", "spare parts",
  // Resale / trade-in
  "trade in", "sell my iPhone",
  // Competitor & non-Apple brands (we only service Apple)
  "samsung", "samsung galaxy", "android", "oneplus", "xiaomi",
  // Fake authority / brand warranty we cannot provide
  "official apple store", "apple retail store", "applecare", "apple care",
  "warranty claim",
  // Remote / no-cost intent (out of scope)
  "remote support", "free repair", "online repair",
]);

export const NEW_NEGATIVE_KEYWORD_COUNT = 28;

/** GA4 / Ads conversion event names. Wire these in GTM, Meta CAPI and CRM. */
export const CONVERSION_EVENTS = {
  LEAD_SUBMIT: "lead_submit",
  ESTIMATE_REQUEST: "estimate_request",
  WHATSAPP_CLICK: "whatsapp_click",
  PHONE_CALL: "phone_call",
  PICKUP_BOOKING: "pickup_booking",
  DIRECTIONS_CLICK: "directions_click",
  REPAIR_STATUS_CHECK: "repair_status_check",
} as const;

export type ConversionEventName =
  (typeof CONVERSION_EVENTS)[keyof typeof CONVERSION_EVENTS];

/** Mandatory disclaimer for all ad copy and lead-creative. */
export const ADS_DISCLAIMER =
  "Independent repair studio. Not affiliated with or endorsed by Apple Inc. Apple is a trademark of Apple Inc." as const;
