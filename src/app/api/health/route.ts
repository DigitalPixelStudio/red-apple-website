import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { SITE } from "@/lib/site";
import { PRICES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/** GET /api/health — live site + crawler health (booleans only, never secrets). */
export async function GET() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY) ||
    Object.keys(process.env).some((k) => /^GEMINI_/i.test(k));
  const body = {
    ok: true,
    status: "ok",
    ts: new Date().toISOString(),
    service: SITE.shortName,
    build: { commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || null },
    services: {
      concierge: hasGemini,
      leadWebhook: Boolean(process.env.LEAD_WEBHOOK_URL),
      crm: Boolean(process.env.CRM_STATUS_URL),
    },
    catalog: { models: Object.keys(PRICES).length },
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store", "X-Request-Id": randomUUID() },
  });
}
