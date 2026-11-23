import { randomUUID } from "node:crypto";

/**
 * Shared response metadata for API routes.
 *
 * - `Cache-Control: no-store` — form/status responses must never be cached by an
 *   edge or browser, which also keeps personal data out of shared caches.
 * - `X-Request-Id` — a per-response correlation UUID. It is random, carries no
 *   PII and gives support/ops a trace handle when diagnosing load or errors.
 *
 * Usage: `NextResponse.json(body, apiMeta())`.
 */
export function apiMeta(): { headers: Record<string, string> } {
  return {
    headers: {
      "Cache-Control": "no-store",
      "X-Request-Id": randomUUID(),
    },
  };
}
