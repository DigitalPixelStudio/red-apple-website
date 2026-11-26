import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as null | {
    page?: string; source?: string; campaign?: string; utm?: string;
    click_id?: string; referrer?: string; landing_page?: string; device?: string;
    city?: string; event?: string;
  };
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  const endpoint = process.env.CRM_VISIT_ENDPOINT || "https://red-apple-crm.vercel.app/api/visits";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        page: (body.page || "/").slice(0, 500),
        source: body.source || "website",
        campaign: (body.campaign || "").slice(0, 250),
        utm: (body.utm || "").slice(0, 1000),
        click_id: (body.click_id || "").slice(0, 500),
        referrer: (body.referrer || "").slice(0, 1000),
        landing_page: (body.landing_page || "").slice(0, 1000),
        device: (body.device || "").slice(0, 200),
        city: (body.city || "").slice(0, 100),
        event: body.event || "pageview",
      }),
      signal: AbortSignal.timeout(6000),
    });
    return NextResponse.json({ ok: response.ok }, { status: response.ok ? 200 : 202 });
  } catch {
    return NextResponse.json({ ok: false, queued: false }, { status: 202 });
  }
}
