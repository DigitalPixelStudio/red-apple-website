import { NextRequest } from "next/server";
import { POST as conciergePost, GET as conciergeGet } from "../concierge/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 40;

/** Compatibility alias. The canonical concierge route owns rate limiting. */
export async function POST(req: NextRequest) {
  return conciergePost(req);
}

export async function GET() {
  return conciergeGet();
}