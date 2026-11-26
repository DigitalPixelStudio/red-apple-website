import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { apiMeta } from "@/config/apiMeta";
import { qualifyOptional } from "@/lib/analytics/leadQuality";
import { rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 15;

const Schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{10,18}$/),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  device: z.string().trim().max(100).optional(),
  issue: z.string().trim().max(700).optional(),
  source: z.string().trim().max(80).optional(),
  page: z.string().trim().max(240).optional(),
  campaign: z.string().trim().max(160).optional(),
  utm: z.string().trim().max(1600).optional(),
  clickId: z.string().trim().max(512).optional(),
  eventId: z.string().trim().max(100).optional(),
}).refine((value) => value.phone.replace(/\D/g, "").length >= 10, { path: ["phone"], message: "invalid_phone" });

type IdRow = { id: string };

const maskPhone = (value: string) => value.replace(/\d(?=\d{4})/g, "X");
const makeId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function crmSource(value?: string): string {
  const source = (value || "website").toLowerCase();
  if (source.includes("google")) return "google";
  if (source.includes("facebook") || source.includes("meta-fb")) return "meta-fb";
  if (source.includes("instagram") || source.includes("meta-ig")) return "meta-ig";
  if (source.includes("whatsapp")) return "whatsapp";
  if (source.includes("store")) return "store";
  if (source.includes("manual")) return "manual";
  return "website";
}

async function readRows<T>(baseUrl: string, key: string, table: string, filters: Record<string, string>): Promise<T[]> {
  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  Object.entries(filters).forEach(([name, value]) => url.searchParams.set(name, value));
  const response = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) throw new Error(`crm_read_${table}_${response.status}`);
  return await response.json() as T[];
}

async function insertRow<T>(baseUrl: string, key: string, table: string, row: Record<string, unknown>): Promise<T | null> {
  const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(row),
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error(`crm_write_${table}_${response.status}`);
  const result = await response.json().catch(() => []);
  return (Array.isArray(result) ? result[0] : result) as T | null;
}

/** POST /api/lead — write website enquiries into the same live CRM used by the store. */
export async function POST(request: Request) {
  const limited = rateLimit(request, "lead", 24, 60_000);
  if (limited) return limited;
  const meta = apiMeta();
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400, headers: meta.headers });
  }

  const input = parsed.data;
  const eventId = input.eventId || randomUUID();
  const phone = input.phone.replace(/[\s()-]/g, "");
  const phoneDigits = phone.replace(/\D/g, "");
  const last10 = phoneDigits.slice(-10);
  const inquiry = [input.device, input.issue].filter(Boolean).join(" — ");
  const quality = await qualifyOptional(inquiry);
  const baseUrl = (process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY || "";

  let persisted = false;
  let deduplicated = false;
  let crmLeadId: string | null = null;
  let analyticsPersisted = false;

  if (baseUrl && serviceKey) {
    try {
      // Idempotency: a repeated browser beacon must not create duplicate CRM leads.
      const existing = await readRows<IdRow>(baseUrl, serviceKey, "leads", {
        select: "id", external_id: `eq.${eventId}`, is_test: "eq.false", limit: "1",
      });
      if (existing[0]?.id) {
        crmLeadId = existing[0].id;
        persisted = true;
        deduplicated = true;
      } else {
        // Reuse the CRM customer record by phone suffix, or create one if this
        // is the first website enquiry from that number.
        let customers = await readRows<IdRow>(baseUrl, serviceKey, "customers", {
          select: "id", phone: `ilike.*${last10}`, is_test: "eq.false",
          order: "created_at.desc", limit: "1",
        });
        let customerId = customers[0]?.id || null;
        if (!customerId) {
          const customer = await insertRow<IdRow>(baseUrl, serviceKey, "customers", {
            id: makeId("cu"), name: input.name, phone, is_test: false,
          });
          customerId = customer?.id || null;
        }

        const lead = await insertRow<IdRow>(baseUrl, serviceKey, "leads", {
          id: makeId("ld"),
          name: input.name,
          phone,
          service: inquiry || input.device || "Website enquiry",
          source: crmSource(input.source),
          campaign: input.campaign || null,
          utm: input.utm || null,
          click_id: input.clickId || null,
          external_id: eventId,
          status: "new",
          notes: input.issue || null,
          customer_id: customerId,
          is_test: false,
        });
        crmLeadId = lead?.id || null;
        persisted = Boolean(crmLeadId);
      }
    } catch (error) {
      console.warn("[lead] CRM persistence failed", {
        reason: error instanceof Error ? error.message : "unknown",
      });
    }

    // Keep the separate attribution ledger when its optional migration exists.
    // The CRM lead above remains the primary source of truth for store follow-up.
    try {
      const response = await fetch(`${baseUrl}/rest/v1/website_leads?on_conflict=event_id`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify({
          event_id: eventId,
          name: input.name,
          phone,
          email: input.email || null,
          device: input.device || null,
          issue: input.issue || null,
          source: input.source || "website",
          page: input.page || null,
          campaign: input.campaign || null,
          utm: input.utm || null,
          click_id: input.clickId || null,
          quality_score: quality?.score ?? null,
          quality_verdict: quality?.verdict ?? "unknown",
          event_name: quality?.eventName ?? "SoftEngage",
          event_value: quality?.value ?? 0,
          currency: "INR",
        }),
        signal: AbortSignal.timeout(2000),
        cache: "no-store",
      });
      analyticsPersisted = response.ok;
    } catch {
      // Optional analytics ledger must not block CRM capture or WhatsApp.
    }
  } else {
    console.warn("[lead] CRM storage is not configured");
  }

  console.info("[lead] accepted", {
    eventId,
    phone: maskPhone(phone),
    source: crmSource(input.source),
    qualityScore: quality?.score ?? null,
    persisted,
    deduplicated,
  });

  // Fail-open: a storage outage must never prevent the WhatsApp handoff.
  return NextResponse.json({
    ok: true,
    accepted: true,
    persisted,
    crmLeadId,
    deduplicated,
    analyticsPersisted,
    eventId,
    leadQuality: quality ?? null,
  }, { status: 202, headers: { ...meta.headers, "Cache-Control": "no-store" } });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: apiMeta().headers });
}
