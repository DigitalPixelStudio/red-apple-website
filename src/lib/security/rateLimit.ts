import { NextResponse } from "next/server";

/**
 * Best-effort sliding-window limiter for serverless routes.
 * Vercel may run multiple isolated instances, so this is per-instance rather
 * than a globally shared quota. Keep limits conservative and never block the
 * customer-facing WhatsApp fallback on storage/provider failures.
 */
const windows = new Map<string, number[]>();
const MAX_KEYS = 5000;

export function rateLimit(request: Request, scope: string, limit = 30, windowMs = 60_000): NextResponse | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (windows.get(key) ?? []).filter((stamp) => now - stamp < windowMs);

  if (recent.length >= limit) {
    windows.set(key, recent);
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
    return NextResponse.json({ ok: false, error: "rate_limited", retryAfter }, {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) },
    });
  }

  recent.push(now);
  windows.set(key, recent);
  if (windows.size > MAX_KEYS) {
    for (const [entryKey, stamps] of windows) {
      if (!stamps.length || now - stamps[stamps.length - 1] >= windowMs) windows.delete(entryKey);
      if (windows.size <= MAX_KEYS * 0.8) break;
    }
  }
  return null;
}