// Google Ads conversion tracking helpers — Red Apple Mobile Repair
// Conversion ID: AW-18459619487

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GADS_ID = "AW-18459619487";

/** Conversion action send-to labels (from Google Ads) */
export const CONVERSIONS = {
  /** "Red Apple - Phone Call (website)" */
  phone: "AW-18459619487/GMF4CLX9jagdEJ_hneJE",
  /** "Red Apple - WhatsApp Lead" */
  whatsapp: "AW-18459619487/KeLbCLj9jagdEJ_hneJE",
  /** "Red Apple - Form Submit" */
  form: "AW-18459619487/kVImCNn9jagdEJ_hneJE",
} as const;

/**
 * Fire a Google Ads conversion event.
 * Safe to call anywhere — no-ops if gtag hasn't loaded yet.
 */
export function trackConversion(sendTo: string, value = 1.0): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: sendTo,
    value,
    currency: "INR",
  });
}
