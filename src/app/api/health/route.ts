import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { SITE } from "@/lib/site";
import { PRICES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

async function probeTable(baseUrl: string, key: string, table: string, columns = "id"): Promise<boolean> {
  if (!baseUrl || !key) return false;
  try {
    const url = new URL(`${baseUrl}/rest/v1/${table}`);
    url.searchParams.set("select", columns);
    url.searchParams.set("limit", "0");
    const response = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(2200),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** GET /api/health — verifies real integrations without returning customer data or secrets. */
export async function GET() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY) ||
    Object.keys(process.env).some((key) => /^GEMINI_/i.test(key));
  const baseUrl = (process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY || "";
  const readKey = process.env.CRM_SUPABASE_READONLY_KEY || serviceKey;

  const [customers, leads, repairs, invoices, websiteLeadLedger] = await Promise.all([
    probeTable(baseUrl, readKey, "customers", "id,phone"),
    probeTable(baseUrl, readKey, "leads", "id,name,phone,service,source,status,customer_id,external_id"),
    probeTable(baseUrl, readKey, "repairs", "id,token,device,issue,status,customer_id"),
    probeTable(baseUrl, readKey, "invoices", "id,code,repair_id,phone"),
    probeTable(baseUrl, serviceKey, "website_leads", "id,event_id"),
  ]);

  const crm = customers && repairs && invoices;
  const leadStorage = Boolean(serviceKey && customers && leads);
  const body = {
    ok: true,
    status: "ok",
    ts: new Date().toISOString(),
    service: SITE.shortName,
    build: { commit: (process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GIT_SHA || "").slice(0, 7) || null },
    runtime: { region: process.env.VERCEL_REGION ?? null },
    services: {
      concierge: hasGemini,
      imageUnderstanding: process.env.GEMINI_IMAGE_INPUT_ENABLED === "true",
      leadWebhook: Boolean(process.env.LEAD_WEBHOOK_URL),
      leadStorage,
      crm,
      websiteLeadLedger,
    },
    crmTables: { customers, leads, repairs, invoices },
    catalog: { models: Object.keys(PRICES).length },
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store", "X-Request-Id": randomUUID(), "X-Robots-Tag": "noindex, nofollow" },
  });
}
