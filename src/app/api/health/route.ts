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
    // Vercel Git deployments expose VERCEL_GIT_COMMIT_SHA; CLI builds can
    // inject NEXT_PUBLIC_GIT_SHA at build time for the same verifiable result.
    build: { commit: (process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_GIT_SHA || "").slice(0, 7) || null },
    runtime: { region: process.env.VERCEL_REGION ?? null },
    services: {
      concierge: hasGemini,
      leadWebhook: Boolean(process.env.LEAD_WEBHOOK_URL),
      leadStorage: Boolean((process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL) && (process.env.CRM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)),
      crm: Boolean((process.env.CRM_SUPABASE_URL || process.env.SUPABASE_URL) && (process.env.CRM_SUPABASE_READONLY_KEY || process.env.CRM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)),
    },
    catalog: { models: Object.keys(PRICES).length },
  };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store", "X-Request-Id": randomUUID(), "X-Robots-Tag": "noindex, nofollow" },
  });
}