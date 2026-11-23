/**
 * Apple / iPhone display repair — Ads & organic SEO targeting configuration.
 *
 * Single, reviewable source of truth for the ads manager and for layout metadata.
 * Factual only: NO secrets, NO "Authorized" / "genuine Apple parts" / GST /
 * affiliation claims. Red Apple is an independent repair studio.
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
 * High-intent, Apple-display-led keywords. All describe work the studio really
 * performs; none imply Apple affiliation or promise an undiagnosed outcome.
 */
export const PRIMARY_KEYWORDS: readonly string[] = [
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
 * GIFT — negative-keyword guard-list. Blocks job seekers, DIY traffic and,
 * critically, "authorized service center" queries the studio must not claim.
 * Paste verbatim into Google Ads (Search) and use as an ad-copy exclusion.
 */
export const NEGATIVE_KEYWORDS: readonly string[] = [
  "jobs", "career", "careers", "salary", "vacancy", "hiring", "recruitment",
  "diy", "do it yourself", "tutorial", "how to replace myself", "free",
  "used", "second hand", "refurbished", "wholesale", "cheap copy",
  "authorized service center", "authorised service center",
  "apple authorized", "apple authorised", "genuine apple parts",
  "course", "training", "certification", "logo", "wallpaper",
];

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
