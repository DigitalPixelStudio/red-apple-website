import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

/**
 * LLM discovery file (llms.txt convention).
 *
 * SHADOW FIX — this App Router route previously served a thin, hand-maintained
 * summary that SHADOWED the richer canonical `public/llms.txt` (a route segment
 * always wins over a same-named static file). It now serves the single source of
 * truth verbatim: 17 Bengaluru zones, Apple-display-repair focus, NAP, 6 Months
 * warranty, canonical GBP listing and phone — with zero duplicated facts that
 * could drift. `force-static` bakes the file into the build.
 */
export const dynamic = "force-static";
export const runtime = "nodejs";

const SOURCE = path.join(process.cwd(), "public", "llms.txt");

// Fail the build loudly if the canonical source is ever removed/renamed — protects
// Faisu's discovery content instead of silently serving a thin fallback.
if (!fs.existsSync(SOURCE)) {
  throw new Error("[llms.txt] canonical source public/llms.txt is missing — restore it before building.");
}

const body = fs.readFileSync(SOURCE, "utf8");
// GIFT — content-hash ETag gives crawlers a stable cache validator with no state.
const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 16)}"`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      ETag: etag,
      "X-Content-Source": "public/llms.txt",
    },
  });
}
