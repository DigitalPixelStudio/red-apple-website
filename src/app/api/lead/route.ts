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
  model?: string;
  condition?: string;
  urgency?: string;
  pickup?: string;
  preferredTime?: string;
  campaign?: string;
  utm?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
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

  // 2. sync the lead to the CRM. Failure is non-blocking for the customer-facing WhatsApp flow.
  const crmEndpoint = process.env.CRM_LEAD_ENDPOINT || "https://red-apple-crm.vercel.app/api/leads";
  const sourceText = [body.utm_source, body.source, body.referrer].filter(Boolean).join(" ").toLowerCase();
  const crmSource = /google|gclid|gbraid|wbraid/.test(sourceText) ? "google"
    : /instagram|igshid/.test(sourceText) ? "meta-ig"
    : /facebook|fbclid/.test(sourceText) ? "meta-fb" : "website";
  const clickId = body.gclid || body.gbraid || body.wbraid || body.fbclid || "";
  const utm = body.utm || JSON.stringify({
    source: body.utm_source || "", medium: body.utm_medium || "",
    campaign: body.utm_campaign || body.campaign || "", content: body.utm_content || "",
    term: body.utm_term || "", referrer: body.referrer || "",
  });
  try {
    const crmResponse = await fetch(crmEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: lead.name || "", phone: lead.phone || "", email: body.email || "",
        service: [body.device, body.model, body.issue].filter(Boolean).join(" — ") || body.message || "General enquiry",
        source: crmSource, campaign: body.utm_campaign || body.campaign || "",
        utm, click_id: clickId, external_id: `website:${phone}:${body.model || ""}:${body.issue || ""}`,
        notes: [body.condition ? "Condition: " + body.condition : "", body.message || body.issue || "",
          body.urgency ? "Urgency: " + body.urgency : "", body.pickup ? "Service preference: " + body.pickup : "",
          body.preferredTime ? "Preferred time: " + body.preferredTime : ""].filter(Boolean).join(" · "),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!crmResponse.ok) console.error("[lead] CRM sync returned", crmResponse.status);
  } catch (error) {
    console.error("[lead] CRM sync failed", error instanceof Error ? error.message : "unknown");
  }

  // 3. forward to an optional secondary webhook when one is configured
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
