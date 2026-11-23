import { captureAttribution, getAttribution } from "./utmSessionVault";

export type LeadBeaconPayload = {
  name?: string; phone?: string; email?: string; device?: string;
  issue?: string; source?: string; page?: string;
};

export function createEventId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch { /* fallback below */ }
  return `ra-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function dispatchBeacon(path: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify(payload);
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.(path, blob)) return;
  } catch { /* fall through to keepalive fetch */ }
  void fetch(path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body, keepalive: true, credentials: "same-origin",
  }).catch(() => { /* fail open: WhatsApp must remain available */ });
}

/** Fire-and-forget lead persistence before opening the WhatsApp handoff. */
export function sendLeadBeacon(payload: LeadBeaconPayload, eventId = createEventId()): string {
  captureAttribution();
  const attribution = getAttribution();
  const clickId = attribution.gclid || attribution.fbclid || attribution.msclkid || "";
  dispatchBeacon("/api/lead", {
    ...payload, eventId, page: payload.page || window.location.pathname,
    campaign: attribution.utm_campaign || "", utm: JSON.stringify(attribution).slice(0, 1500), clickId,
  });
  return eventId;
}

/** PII is hashed server-side before it is stored or forwarded. */
export function sendConversionBeacon(
  payload: LeadBeaconPayload & { value?: number; currency?: string },
  eventId: string
) {
  captureAttribution();
  const attribution = getAttribution();
  const clickId = attribution.gclid || attribution.fbclid || attribution.msclkid || "";
  dispatchBeacon("/api/track-conversion", {
    ...payload, eventId, page: payload.page || window.location.pathname,
    sourceUrl: window.location.href, clickId, currency: payload.currency || "INR",
  });
}