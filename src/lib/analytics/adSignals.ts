import { CONTENT_CATEGORY, CITY } from "@/lib/seo/adsTargeting";

// Ad-platform signal hooks — consent-aware, SDK-free, SSR-safe (config-only import).
//
// Every hook pushes a typed event to window.dataLayer and, only when the matching
// public destination ID is configured, forwards it to the Meta pixel (fbq) and/or
// GA4 (gtag). Nothing here imports a library, reads a secret, or logs an ID value:
// the env vars are public client IDs used purely as an on/off switch.
//
// Consent model (privacy-first, no CMP required):
//   - Explicit denial always wins: setAdConsent(false), window.__AD_SIGNALS_CONSENT__
//     = false, or an ad_consent/ad_storage/cookie_consent=denied cookie.
//   - Explicit grant: setAdConsent(true), window.__AD_SIGNALS_CONSENT__ = true, or a
//     =granted cookie.
//   - With no explicit signal, configuring a public destination ID IS the opt-in.
//     No ID configured => the module is inert (AD_SIGNALS_READY === false).

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
// NEXT_PUBLIC_GTAG_ID is canonical; NEXT_PUBLIC_GA_ID is the repo's existing slot.
const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID || process.env.NEXT_PUBLIC_GA_ID || "";

/** True when at least one ad destination is configured. */
export const AD_SIGNALS_READY = Boolean(META_PIXEL_ID || GTAG_ID);

// Context fields are sourced from the single ads-targeting config so events can
// never drift from the canonical category/city used across SEO and layout.
type CommonFields = {
  content_category: typeof CONTENT_CATEGORY;
  city: typeof CITY;
};

export type AdSignalName = "ViewContent" | "InitiateCheckout" | "Contact";

/** Discriminated union so every event is typed and carries the fixed context fields. */
export type AdSignalEvent =
  | ({ event: "ViewContent"; device: string; service: string } & CommonFields)
  | ({ event: "InitiateCheckout"; estimateId: string; value: number; currency: "INR" } & CommonFields)
  | ({ event: "Contact"; channel: string } & CommonFields);

// Local structural type only — deliberately NOT a `declare global` Window merge,
// since src/lib/analytics.ts already declares dataLayer/fbq on Window.
type AdBrowser = {
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
  __AD_SIGNALS_CONSENT__?: boolean;
};

let consentOverride: boolean | null = null;

/** Opt the current session in/out. Explicit values take precedence over all signals. */
export function setAdConsent(granted: boolean): void {
  consentOverride = Boolean(granted);
}

function hasConsent(w: AdBrowser): boolean {
  if (consentOverride !== null) return consentOverride;
  if (typeof w.__AD_SIGNALS_CONSENT__ === "boolean") return w.__AD_SIGNALS_CONSENT__;
  try {
    const cookies = typeof document === "undefined" ? "" : document.cookie;
    if (/(?:^|;\s*)(?:ad_consent|ad_storage|cookie_consent)=denied\b/i.test(cookies)) return false;
    if (/(?:^|;\s*)(?:ad_consent|ad_storage|cookie_consent)=granted\b/i.test(cookies)) return true;
  } catch {
    /* ignore cookie access errors */
  }
  return AD_SIGNALS_READY;
}

const clean = (value: unknown, max = 120): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function emit(event: AdSignalEvent): void {
  if (typeof window === "undefined") return; // SSR-safe
  try {
    const w = window as unknown as AdBrowser;
    if (!hasConsent(w)) return;

    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ ...event, ts: Date.now() });

    // Strip the discriminant/timestamp; destinations receive only the payload.
    const { event: _name, ...payload } = event;
    if (META_PIXEL_ID && typeof w.fbq === "function") {
      w.fbq("track", event.event, payload);
    }
    if (GTAG_ID && typeof w.gtag === "function") {
      w.gtag("event", event.event, payload);
    }
  } catch {
    /* ad signals must never break the UI */
  }
}

const COMMON: CommonFields = Object.freeze({
  content_category: CONTENT_CATEGORY,
  city: CITY,
});

/** ViewContent — a visitor viewed a device/service offering. */
export function trackViewContent(input: { device: string; service: string }): void {
  emit({
    event: "ViewContent",
    device: clean(input?.device),
    service: clean(input?.service),
    ...COMMON,
  });
}

/** InitiateCheckout — a visitor started an estimate (value in INR). */
export function trackInitiateCheckout(input: { estimateId: string; value: number }): void {
  const value = typeof input?.value === "number" && Number.isFinite(input.value)
    ? Math.max(0, input.value)
    : 0;
  emit({
    event: "InitiateCheckout",
    estimateId: clean(input?.estimateId, 80),
    value,
    currency: "INR",
    ...COMMON,
  });
}

/** Contact — a visitor reached out on a given channel. */
export function trackContact(input: { channel: string }): void {
  emit({
    event: "Contact",
    channel: clean(input?.channel, 80),
    ...COMMON,
  });
}
