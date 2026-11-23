import { NextResponse } from "next/server";
import { apiMeta } from "@/config/apiMeta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public, secret-free readiness report. This endpoint is intentionally noindex. */
export async function GET() {
  const storageConfigured = Boolean(
    (process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL) &&
    (process.env.CRM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
  const body = {
    ok: true,
    qualificationThreshold: 65,
    leadStorageConfigured: storageConfigured,
    conversionDeduplication: storageConfigured ? "persistent_event_id" : "unavailable",
    piiHashing: "sha256_email_and_phone",
    clickIds: ["gclid", "fbclid", "msclkid"],
    metaCapiConfigured: Boolean(process.env.META_CAPI_ENDPOINT && process.env.META_CAPI_ACCESS_TOKEN),
    bingCapiConfigured: Boolean(process.env.BING_CAPI_ENDPOINT && process.env.BING_CAPI_ACCESS_TOKEN),
    conversionDelivery: "server-side-hashed-payload-with-persistent-dedup",
    crmReadConfigured: Boolean(
      (process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.CRM_SUPABASE_READONLY_KEY || process.env.CRM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
    ),
    rateLimitMode: "best-effort-per-instance",
    serviceArea: { latitude: 12.9767, longitude: 77.6245, radiusMeters: 15000 },
  };
  return NextResponse.json(body, {
    headers: { ...apiMeta().headers, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}