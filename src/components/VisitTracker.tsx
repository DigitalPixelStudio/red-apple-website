"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid"] as const;

function detectSource(values: Record<string, string>, referrer: string) {
  const source = (values.utm_source || "").toLowerCase();
  const ref = referrer.toLowerCase();
  if (values.gclid || values.gbraid || values.wbraid || source.includes("google") || ref.includes("google.")) return "google";
  if (values.fbclid || source.includes("facebook") || ref.includes("facebook.")) return "meta-fb";
  if (source.includes("instagram") || ref.includes("instagram.")) return "meta-ig";
  if (source.includes("whatsapp") || ref.includes("wa.me")) return "whatsapp";
  return "website";
}

export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const url = new URL(window.location.href);
    const current: Record<string, string> = {};
    KEYS.forEach((key) => { const value = url.searchParams.get(key); if (value) current[key] = value; });
    let saved: Record<string, string> = {};
    try { saved = JSON.parse(localStorage.getItem("ra_attribution") || "{}"); } catch {}
    const values = { ...saved, ...current };
    if (document.referrer && !values.referrer) values.referrer = document.referrer;
    if (Object.keys(current).length || !saved.referrer) {
      try { localStorage.setItem("ra_attribution", JSON.stringify(values)); } catch {}
    }
    const utm = KEYS.slice(0, 5).map((key) => values[key] ? key + "=" + values[key] : "").filter(Boolean).join("&");
    const clickId = values.gclid || values.gbraid || values.wbraid || values.fbclid || "";
    void fetch("/api/visit", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        page: pathname || "/", source: detectSource(values, values.referrer || ""),
        campaign: values.utm_campaign || "", utm, click_id: clickId,
        referrer: values.referrer || "", landing_page: url.href,
        device: navigator.userAgent.slice(0, 160), event: "pageview",
      }), keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
