import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { SITE, wa } from "@/lib/site";

export const runtime = "nodejs";

const Schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^\+?\d{10,15}$/),
  model: z.string().trim().min(1).max(80),
  issue: z.string().trim().max(300).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/).optional(),
  slot: z.string().trim().max(40).optional(),
});

const mask = (v: string) => v.replace(/\d(?=\d{4})/g, "X");

/** POST /api/pickup-booking — validated 24/7 pickup request, desk webhook + WhatsApp. */
export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  const b = parsed.data;
  const reference = `PU-${randomUUID().slice(0, 8).toUpperCase()}`;
  console.log("[pickup] received", {
    reference,
    phone: mask(b.phone),
    model: b.model,
    pincode: b.pincode ?? null,
  });

  const endpoint = process.env.PICKUP_WEBHOOK_URL || process.env.LEAD_WEBHOOK_URL;
  if (endpoint) {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, reference, ts: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  const whatsapp = wa(
    `Hi Red Apple, I want free doorstep pickup.\nReference: ${reference}\nName: ${b.name}\nPhone: ${b.phone}\nDevice: ${b.model}\nIssue: ${b.issue ?? "Not specified"}\nPincode: ${b.pincode ?? "Not specified"}\nPreferred: ${b.slot ?? "ASAP"}`
  );
  return NextResponse.json(
    {
      ok: true,
      received: true,
      reference,
      whatsapp,
      storeHours: SITE.hours,
      note: "Team confirms your slot on WhatsApp — no slot is auto-booked.",
      webhookConfigured: Boolean(endpoint),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
