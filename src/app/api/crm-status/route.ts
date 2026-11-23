import { NextResponse } from "next/server";
import { z } from "zod";
import { apiMeta } from "@/config/apiMeta";
import { REPAIR_STATUS_FLOW, SITE } from "@/lib/site";

export const runtime = "nodejs";

const Schema = z.object({
  ticket: z.string().trim().min(3).max(24).regex(/^[A-Za-z0-9-]+$/),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/),
});

const mask = (v: string) => v.replace(/\d(?=\d{4})/g, "X");

/** POST /api/crm-status — privacy-masked repair status lookup. Never fabricates a stage. */
export async function POST(req: Request) {
  const meta = apiMeta(); // one correlation id for this whole response
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400, headers: meta.headers });
  }
  const { ticket, phone } = parsed.data;
  const endpoint = process.env.CRM_STATUS_URL;

  if (!endpoint) {
    return NextResponse.json(
      {
        ok: true,
        ticket: ticket.toUpperCase(),
        phoneMasked: mask(phone),
        configured: false,
        stages: REPAIR_STATUS_FLOW,
        currentStage: null,
        message: "Live CRM not connected — we'll confirm your exact stage on WhatsApp.",
        whatsapp: SITE.phoneHref,
      },
      { headers: meta.headers }
    );
  }

  try {
    const res = await fetch(`${endpoint}?ticket=${encodeURIComponent(ticket)}&phone=${encodeURIComponent(phone)}`, {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("crm_unavailable");
    const data = await res.json().catch(() => ({}));
    const key = String(data?.stage ?? "").toLowerCase();
    const stage = REPAIR_STATUS_FLOW.find((s) => s.key === key) ?? null;
    return NextResponse.json(
      {
        ok: true,
        ticket: ticket.toUpperCase(),
        phoneMasked: mask(phone),
        configured: true,
        stages: REPAIR_STATUS_FLOW,
        currentStage: stage,
        message: data?.message ?? "Live status from our Halasuru bench.",
      },
      { headers: meta.headers }
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        ticket: ticket.toUpperCase(),
        phoneMasked: mask(phone),
        configured: true,
        stages: REPAIR_STATUS_FLOW,
        currentStage: null,
        message: "CRM temporarily unavailable — confirm on WhatsApp.",
      },
      { headers: meta.headers }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: apiMeta().headers });
}
