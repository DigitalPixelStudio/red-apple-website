import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { apiMeta } from "@/config/apiMeta";
import { qualifyOptional } from "@/lib/analytics/leadQuality";
import { rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 5;

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

const maskPhone = (value: string) => value.replace(/\d(?=\d{4})/g, "X");

/** POST /api/lead — durable, isolated website lead capture; fail-open for WhatsApp. */
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
  const inquiry = [input.device, input.issue].filter(Boolean).join(" — ");
  const quality = await qualifyOptional(inquiry);
  const supabaseUrl = (process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  let persisted = false;
  if (supabaseUrl && serviceKey) {
    const row = {
      event_id: eventId,
      name: input.name,
      phone: input.phone.replace(/[\s()-]/g, ""),
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
    };
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/website_leads?on_conflict=event_id`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates,return=minimal",
        },
        body: JSON.stringify(row),
        signal: AbortSignal.timeout(2500),
        cache: "no-store",
      });
      persisted = response.ok;
      if (!response.ok) console.warn("[lead] storage unavailable", { status: response.status });
    } catch {
      console.warn("[lead] storage timeout or network failure");
    }
  } else {
    console.warn("[lead] storage is not configured");
  }

  console.info("[lead] accepted", {
    eventId,
    phone: maskPhone(input.phone),
    source: input.source || "website",
    qualityScore: quality?.score ?? null,
    persisted,
  });

  // Fail-open: a storage outage must never prevent the WhatsApp handoff.
  return NextResponse.json({
    ok: true,
    accepted: true,
    persisted,
    eventId,
    leadQuality: quality ?? null,
  }, { status: 202, headers: { ...meta.headers, "Cache-Control": "no-store" } });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: apiMeta().headers });
}