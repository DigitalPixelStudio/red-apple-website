/**
 * Share / promotion signal helpers — 100% PURE and SSR-safe.
 *
 * Design contract:
 *   - No `window`, no DOM, no timers, no mutation of module state, no side effects.
 *   - No secrets, no env vars, no analytics beacons — nothing is sent anywhere.
 *   - The canonical base URL comes from the single source (src/lib/site.ts), so
 *     these helpers can never drift from the robots/sitemap/NAP canonical host.
 *
 * FUTURE USE (no HTML/JSX is edited here — this file only exports data helpers):
 *   A footer or CTA component can import `buildShareLinks()` and render anchors:
 *
 *     import { buildShareLinks } from "@/lib/analytics/promoSignals";
 *     const share = buildShareLinks();          // { canonical, whatsapp, facebook, x, text }
 *     <a href={share.whatsapp}>Share on WhatsApp</a>
 *     <a href={share.facebook}>Share on Facebook</a>
 *     <a href={share.x}>Share on X</a>
 *     <button onClick={() => navigator.clipboard.writeText(share.canonical)}>Copy link</button>
 *
 *   Optionally call `track("whatsapp_click")` from src/lib/analytics.ts in the same
 *   handler for measurement. Keeping the share URLs here means the CTA and footer
 *   share one UTM taxonomy and there is no duplicated link-building logic.
 */

import { baseUrl, SITE } from "@/lib/site";

/** Channels this module can build a ready-to-use share URL for. */
export const SHARE_CHANNELS = ["whatsapp", "facebook", "x"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export type ShareLinks = {
  /** UTM-tagged canonical homepage URL — the "copy link" target. */
  canonical: string;
  whatsapp: string;
  facebook: string;
  x: string;
  /** Ready-to-paste share copy (tagline + canonical URL). */
  text: string;
};

/** Normalise a path to an absolute, canonical site URL. */
export function canonicalShareUrl(path: string = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${clean}`;
}

/**
 * Apply one consistent UTM taxonomy. `utm_source` uses "twitter" for X because
 * that is the value ad platforms and GA4 recognise for that network.
 */
export function buildTrackedUrl(channel: ShareChannel, path: string = "/"): string {
  const url = new URL(canonicalShareUrl(path));
  url.searchParams.set("utm_source", channel === "x" ? "twitter" : channel);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "promote");
  url.searchParams.set("utm_content", channel);
  return url.toString();
}

/** Share copy built only from verified single-source site facts. */
export function buildShareText(path: string = "/"): string {
  return `${SITE.name} — ${SITE.tagline} ${SITE.area}. ${canonicalShareUrl(path)}`;
}

/**
 * Build every share link in one call so a future footer/CTA needs a single import.
 * Returns plain strings — safe to render as anchor `href` values or copy to clipboard.
 */
export function buildShareLinks(path: string = "/"): ShareLinks {
  const canonical = buildTrackedUrl("facebook", path); // neutral UTM-tagged copy target
  const url = canonicalShareUrl(path);
  const text = buildShareText(path);
  return {
    canonical,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    text,
  };
}
