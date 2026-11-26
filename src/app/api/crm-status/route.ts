import { NextResponse } from "next/server";
import { z } from "zod";
import { apiMeta } from "@/config/apiMeta";
import { REPAIR_STATUS_FLOW, wa } from "@/lib/site";
import { rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 15;

const Schema = z.object({
  ticket: z.string().trim().min(3).max(80),
  phone: z.string().trim().min(10).max(20),
});

type CustomerRow = { id: string };
type RepairRow = {
  id: string; token: string; device: string; issue: string;
  status: string; created_at?: string | null;
};
type InvoiceRow = { code?: string | null; repair_id?: string | null; phone?: string | null };

const stageKeyByStatus: Record<string, string> = {
  intake: "received",
  diagnosis: "inspection",
  "waiting-part": "repair",
  repair: "repair",
  repairing: "repair",
  "in-progress": "repair",
  qc: "quality",
  quality: "quality",
  ready: "ready",
  delivered: "completed",
};

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length > 4 ? `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}` : "****";
}

function whatsappFallback(ticket: string, phone: string): string {
  return wa(`Hi Red Apple, please confirm the live status of repair ticket ${ticket} registered to phone ending ${phone.replace(/\D/g, "").slice(-4)}.`);
}

async function getRows<T>(
  baseUrl: string,
  key: string,
  table: string,
  filters: Record<string, string>
): Promise<T[]> {
  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  for (const [name, value] of Object.entries(filters)) url.searchParams.set(name, value);
  const response = await fetch(url, {
    method: "GET",
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) throw new Error(`crm_read_${table}_${response.status}`);
  return (await response.json()) as T[];
}

/**
 * Public repair lookup. It reads the same customers / repairs / invoices tables
 * used by Red Apple CRM. Only a phone suffix and ticket must match; no customer
 * profile, address, email, or full phone number is returned to the browser.
 */
export async function POST(request: Request) {
  const limited = rateLimit(request, "crm-status", 12, 60_000);
  if (limited) return limited;
  const meta = apiMeta();
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400, headers: meta.headers });
  }

  const ticket = parsed.data.ticket.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 80);
  const phone = parsed.data.phone.replace(/\D/g, "");
  const last10 = phone.slice(-10);
  const phoneMasked = maskPhone(phone);
  const whatsapp = whatsappFallback(ticket, phone);
  const baseUrl = (process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.CRM_SUPABASE_READONLY_KEY ||
    process.env.CRM_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY || "";

  const empty = {
    ok: true, configured: Boolean(baseUrl && key), ticket, phoneMasked,
    jobNumber: null as string | null, invoiceNumber: null as string | null,
    deviceModel: null as string | null, serviceType: null as string | null,
    stageStep: null as number | null, stageLabel: null as string | null,
    warrantyMonths: null as number | null, updatedAt: null as string | null,
    stages: REPAIR_STATUS_FLOW, currentStage: null,
    message: "No matching live repair record was found. Please confirm with our team on WhatsApp.",
    whatsapp,
  };

  if (!baseUrl || !key) {
    return NextResponse.json({ ...empty, configured: false, message: "Live tracking is temporarily unavailable. Please confirm your status on WhatsApp." }, {
      headers: { ...meta.headers, "Cache-Control": "no-store" },
    });
  }

  try {
    // Red Apple CRM has customers.phone (not alt_phone). Match the final 10
    // digits to support both local and +91-formatted phone numbers.
    const customers = await getRows<CustomerRow>(baseUrl, key, "customers", {
      select: "id", phone: `ilike.*${last10}`, is_test: "eq.false",
      order: "created_at.desc", limit: "1",
    });
    const customerId = customers[0]?.id;
    if (!customerId) {
      return NextResponse.json(empty, { headers: { ...meta.headers, "Cache-Control": "no-store" } });
    }

    let repairs = await getRows<RepairRow>(baseUrl, key, "repairs", {
      select: "id,token,device,issue,status,created_at",
      token: `eq.${ticket}`, customer_id: `eq.${customerId}`,
      is_test: "eq.false", order: "created_at.desc", limit: "1",
    });

    let invoiceNumber: string | null = null;
    if (!repairs[0]) {
      // CRM invoices have a phone snapshot and repair_id; there is no
      // customer_id column on invoices.
      const invoices = await getRows<InvoiceRow>(baseUrl, key, "invoices", {
        select: "code,repair_id,phone", code: `eq.${ticket}`,
        phone: `ilike.*${last10}`, is_test: "eq.false", limit: "1",
      });
      invoiceNumber = invoices[0]?.code ?? null;
      if (invoices[0]?.repair_id) {
        repairs = await getRows<RepairRow>(baseUrl, key, "repairs", {
          select: "id,token,device,issue,status,created_at",
          id: `eq.${invoices[0].repair_id}`, customer_id: `eq.${customerId}`,
          is_test: "eq.false", limit: "1",
        });
      }
    }

    const repair = repairs[0];
    if (!repair) {
      return NextResponse.json(empty, { headers: { ...meta.headers, "Cache-Control": "no-store" } });
    }

    if (!invoiceNumber) {
      const invoices = await getRows<InvoiceRow>(baseUrl, key, "invoices", {
        select: "code", repair_id: `eq.${repair.id}`, is_test: "eq.false", limit: "1",
      });
      invoiceNumber = invoices[0]?.code ?? null;
    }

    const stageKey = stageKeyByStatus[repair.status.toLowerCase()] ?? null;
    const stageIndex = stageKey ? REPAIR_STATUS_FLOW.findIndex((stage) => stage.key === stageKey) : -1;
    const currentStage = stageIndex >= 0 ? REPAIR_STATUS_FLOW[stageIndex] : null;
    return NextResponse.json({
      ...empty,
      ticket: repair.token,
      jobNumber: repair.token,
      invoiceNumber,
      deviceModel: repair.device,
      serviceType: repair.issue,
      stageStep: stageIndex >= 0 ? stageIndex + 1 : null,
      stageLabel: currentStage?.label ?? null,
      currentStage,
      warrantyMonths: null,
      updatedAt: repair.created_at ?? null,
      message: currentStage ? `Live repair record found: ${currentStage.label}.` : "Live repair record found. Please confirm the exact stage with our team.",
      whatsapp,
    }, { headers: { ...meta.headers, "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("[crm-status] read-only lookup failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({
      ...empty,
      configured: true,
      message: "We couldn't retrieve the live status right now. Please confirm it on WhatsApp.",
    }, { headers: { ...meta.headers, "Cache-Control": "no-store" } });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: apiMeta().headers });
}
