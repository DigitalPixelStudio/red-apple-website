// Lightweight analytics helper — GA4/GTM + Meta-ready dataLayer events.
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
  | "repair_status_checked";

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
    // Meta pixel ready hook (enable when pixel ID is configured)
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", event, payload);
    }
  } catch {
    /* analytics must never break the UI */
  }
}
