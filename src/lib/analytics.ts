// Lightweight analytics helper — GA4/GTM + Meta-ready dataLayer events.
//
// GA4 is wired but DORMANT until a measurement ID exists.
// Set NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX in Vercel -> Settings -> Environment Variables
// and events start flowing. Until then every GA4 call is a harmless no-op.

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/** Inject the GA4 tag once, client-side. Safe to call repeatedly. */
export function initGA4() {
  if (typeof window === "undefined" || !GA_ID) return;
  if (document.getElementById("ga4-script")) return;

  const el = document.createElement("script");
  el.id = "ga4-script";
  el.async = true;
  el.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(el);

  window.dataLayer = window.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    (window.dataLayer as unknown[]).push(args);
  };
  (window as unknown as { gtag: typeof gtag }).gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, { send_page_view: true });
}

type AnalyticsEvent =
  | "page_view"
  | "service_view"
  | "quote_started"
  | "device_selected"
  | "model_selected"
  | "quote_completed"
  | "whatsapp_click"
  | "call_click"
  | "map_click"
  | "ai_chat_started"
  | "lead_created"
  | "repair_status_checked"
  | "pickup_request";

declare global {
  interface Window {
    dataLayer: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload, ts: Date.now() });
    // forward to GA4 when the tag is live
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g === "function") g("event", event, payload);
    // Meta pixel ready hook (enable when pixel ID is configured)
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", event, payload);
    }
  } catch {
    /* analytics must never break the UI */
  }
}
