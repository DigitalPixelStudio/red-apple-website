import { NextRequest, NextResponse } from "next/server";
import { POST as conciergePost, GET as conciergeGet } from "../concierge/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 40;

/** Light best-effort per-instance rate limit for the grounded AI concierge. */
const hits = new Map<string, { n: number; t: number }>();
function allow(ip: string) {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now - e.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
    return true;
  }
  e.n++;
  return e.n <= 20;
}

/** Thin wrapper: delegates ALL AI work to the single live concierge implementation. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(ip)) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }
  return conciergePost(req);
}

export async function GET() {
  return conciergeGet();
}
