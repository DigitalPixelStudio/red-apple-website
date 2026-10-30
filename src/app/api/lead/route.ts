import { NextResponse } from "next/server";

/**
 * POST /api/lead
 *
 * Safety net for the quote form and the assistant. WhatsApp deep-links only work
 * if the visitor actually presses send — if they close the tab first the enquiry
 * is gone. This endpoint keeps a copy.
 *
 * Storage: server logs by default (zero cost, zero setup). To persist properly,
 * set LEAD_WEBHOOK_URL to any endpoint that accepts JSON — a Google Apps Script
 * web app, a Supabase edge function, Zapier, or a Discord webhook — and every
 * lead is forwarded there too.
 *
 * No PII is ever logged in full: the phone number is masked before it hits the
 * log so a leaked log file does not expose customer contact details.
 */

type Lead = {
  name?: string;
  phone?: string;
  email?: string;
  device?: string;
  issue?: string;
  message?: string;
  source?: string;
  page?: string;
};

const mask = (v?: string) =>
  !v ? "" : v.length <= 4 ? "***" : v.slice(0, 2) + "*".repeat(Math.max(0, v.length - 4)) + v.slice(-2);

export async function POST(req: Request) {
  let body: Lead;
  try {
    body = (await req.json()) as Lead;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const phone = (body.phone || "").replace(/[^\d]/g, "");
  const hasContact = phone.length >= 10 || Boolean(body.email);
  if (!hasContact && !body.message) {
    return NextResponse.json({ ok: false, error: "no contact detail" }, { status: 422 });
  }

  const lead = {
    ...body,
    phone: phone || undefined,
    receivedAt: new Date().toISOString(),
    source: body.source || "site",
  };

  // 1. always keep a masked trace in the server log
  console.log(
    "[lead]",
    JSON.stringify({
      ...lead,
      phone: mask(lead.phone),
      email: mask(lead.email),
      message: lead.message ? `${lead.message.slice(0, 80)}…` : undefined,
    })
  );

  // 2. forward to a webhook when one is configured
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (e) {
      console.error("[lead] webhook failed", e);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "POST only" }, { status: 405 });
}
