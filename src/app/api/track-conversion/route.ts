import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiMeta } from "@/config/apiMeta";
import { qualifyOptional } from "@/lib/analytics/leadQuality";
import { rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 6;

const Schema = z.object({
  eventId: z.string().trim().min(8).max(100),
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional(),
  device: z.string().trim().max(100).optional(),
  issue: z.string().trim().max(700).optional(),
  page: z.string().trim().max(240).optional(),
  sourceUrl: z.string().trim().url().max(1200).optional(),
  clickId: z.string().trim().max(512).optional(),
});

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

async function deliverMeta(
  endpoint: string,
  token: string,
  event: { name: string; id: string; sourceUrl: string; value: number; emailHash: string | null; phoneHash: string | null }
): Promise<"sent" | "failed"> {
  const url = new URL(endpoint);
  url.searchParams.set("access_token", token);
  const userData: Record<string, string[]> = {};
  if (event.emailHash) userData.em = [event.emailHash];
  if (event.phoneHash) userData.ph = [event.phoneHash];
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: event.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.id,
        action_source: "website",
        event_source_url: event.sourceUrl,
        user_data: userData,
        custom_data: { currency: "INR", value: event.value },
      }],
    }),
    signal: AbortSignal.timeout(1800),
    cache: "no-store",
  });
  return response.ok ? "sent" : "failed";
}

async function deliverBing(
  endpoint: string,
  token: string,
  event: { name: string; id: string; sourceUrl: string; value: number; emailHash: string | null; phoneHash: string | null; clickId: string }
): Promise<"sent" | "failed"> {
  // BING_CAPI_ENDPOINT is a verified Microsoft Ads ingestion endpoint or relay
  // supplied by the account owner; no guessed Microsoft API URL is used.
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      eventId: event.id,
      eventName: event.name,
      eventTime: new Date().toISOString(),
      eventSourceUrl: event.sourceUrl,
      userData: { emailSha256: event.emailHash, phoneSha256: event.phoneHash },
      clickId: event.clickId || undefined,
      value: event.value,
      currency: "INR",
    }),
    signal: AbortSignal.timeout(1800),
    cache: "no-store",
  });
  return response.ok ? "sent" : "failed";
}

/**
 * Persistent conversion-event deduplication + SHA-256 PII normalisation.
 * Outbound Meta/Bing delivery is enabled only when verified endpoints/tokens
 * are configured; raw email/phone are never written to this conversion row.
 */
export async function POST(request: Request) {
  const limited = rateLimit(request, "track-conversion", 60, 60_000);
  if (limited) return limited;
  const meta = apiMeta();
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400, headers: meta.headers });
  }

  const input = parsed.data;
  const inquiry = [input.device, input.issue].filter(Boolean).join(" — ");
  const quality = await qualifyOptional(inquiry);
  const eventName = quality?.eventName ?? "SoftEngage";
  const value = quality?.value ?? 0;
  const supabaseUrl = (process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const emailHash = input.email ? sha256(input.email.trim().toLowerCase()) : null;
  const phoneDigits = input.phone?.replace(/\D/g, "") || "";
  const phoneHash = phoneDigits ? sha256(phoneDigits) : null;
  const candidateUrl = input.sourceUrl ? new URL(input.sourceUrl) : null;
  const allowedHost = candidateUrl && ["redmobilerepair.in", "www.redmobilerepair.in"].includes(candidateUrl.hostname);
  const sourceUrl = allowedHost ? candidateUrl!.toString() : `https://www.redmobilerepair.in${input.page || "/"}`;

  let persisted = false;
  let deduplicated = false;
  let metaDelivery: "sent" | "failed" | "not_configured" = "not_configured";
  let bingDelivery: "sent" | "failed" | "not_configured" = "not_configured";

  if (supabaseUrl && serviceKey) {
    const row = {
      conversion_event_id: input.eventId,
      event_name: eventName,
      event_value: value,
      currency: "INR",
      email_sha256: emailHash,
      phone_sha256: phoneHash,
      source_url: sourceUrl,
      page: input.page || null,
      click_id: input.clickId || null,
      source: "conversion",
      quality_score: quality?.score ?? 0,
      quality_verdict: quality?.verdict ?? "low",
    };
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/website_leads?on_conflict=conversion_event_id&select=conversion_event_id`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=representation",
        },
        body: JSON.stringify(row),
        signal: AbortSignal.timeout(2500),
        cache: "no-store",
      });
      if (response.ok) {
        const inserted = await response.json().catch(() => []);
        persisted = true;
        deduplicated = !Array.isArray(inserted) || inserted.length === 0;
        if (!deduplicated) {
          const event = { name: eventName, id: input.eventId, sourceUrl, value, emailHash, phoneHash, clickId: input.clickId || "" };
          const metaEndpoint = process.env.META_CAPI_ENDPOINT;
          const metaToken = process.env.META_CAPI_ACCESS_TOKEN;
          const bingEndpoint = process.env.BING_CAPI_ENDPOINT;
          const bingToken = process.env.BING_CAPI_ACCESS_TOKEN;
          const deliveries: Promise<void>[] = [];
          if (metaEndpoint && metaToken) {
            deliveries.push(deliverMeta(metaEndpoint, metaToken, event).then((status) => { metaDelivery = status; }).catch(() => { metaDelivery = "failed"; }));
          }
          if (bingEndpoint && bingToken) {
            deliveries.push(deliverBing(bingEndpoint, bingToken, event).then((status) => { bingDelivery = status; }).catch(() => { bingDelivery = "failed"; }));
          }
          await Promise.all(deliveries);
        }
      } else {
        console.warn("[conversion] event storage unavailable", { status: response.status });
      }
    } catch {
      console.warn("[conversion] event storage timeout or network failure");
    }
  }

  return NextResponse.json({
    ok: true, accepted: true, persisted, deduplicated,
    eventId: input.eventId, eventName, qualityScore: quality?.score ?? 0,
    value, currency: "INR", piiHashed: true, metaDelivery, bingDelivery,
  }, {
    status: 202,
    headers: { ...meta.headers, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, {
    status: 405, headers: { ...apiMeta().headers, "X-Robots-Tag": "noindex, nofollow" },
  });
}