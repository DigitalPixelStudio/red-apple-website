"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

function detectSource(params: URLSearchParams, referrer: string) {
  const source = (params.get("utm_source") || "").toLowerCase();
  const ref = referrer.toLowerCase();
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid") || source.includes("google") || ref.includes("google.")) return "google";
  if (params.has("fbclid") || source.includes("facebook") || ref.includes("facebook.")) return "meta-fb";
  if (source.includes("instagram") || ref.includes("instagram.")) return "meta-ig";
  if (source.includes("whatsapp") || ref.includes("wa.me")) return "whatsapp";
  return "website";
}

export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const url = new URL(window.location.href);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    const utm = keys.map((key) => {
      const value = url.searchParams.get(key);
      return value ? key + "=" + value : "";
    }).filter(Boolean).join("&");
    const clickId = url.searchParams.get("gclid") || url.searchParams.get("gbraid") ||
      url.searchParams.get("wbraid") || url.searchParams.get("fbclid") || "";
    const payload = {
      page: pathname || "/",
      source: detectSource(url.searchParams, document.referrer),
      campaign: url.searchParams.get("utm_campaign") || "",
      utm,
      click_id: clickId,
      referrer: document.referrer || "",
      landing_page: url.href,
      device: navigator.userAgent.slice(0, 160),
      event: "pageview",
    };
    void fetch("/api/visit", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify(payload), keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
