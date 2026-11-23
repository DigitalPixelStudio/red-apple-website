import { NextResponse } from "next/server";
import { z } from "zod";
import { apiMeta } from "@/config/apiMeta";
import { qualifyOptional, withLeadQuality } from "@/lib/analytics/leadQuality";
import { getPrice, priceLabel, TURNAROUND } from "@/lib/pricing";
import { REPAIR_TYPES, wa } from "@/lib/site";

export const runtime = "nodejs";

const Schema = z.object({
  model: z.string().trim().min(1).max(80),
  repair: z.string().trim().refine((v) => (REPAIR_TYPES as readonly string[]).includes(v), { message: "invalid repair type" }),
});

/** POST /api/estimate — transparent price lookup from the single pricing sheet. */
export async function POST(req: Request) {
  const meta = apiMeta(); // one correlation id for this whole response
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400, headers: meta.headers });
  }
  const { model, repair } = parsed.data;
  const price = getPrice(model, repair);

  // OPTIONAL ad-qualification (RES-1 hook). This route has no free-text issue field:
  // the closest inquiry descriptor is the validated model + repair pair, so we score
  // that text. The WhatsApp ticket below is intentionally left untouched, and the
  // qualifier is fail-open — see src/lib/analytics/leadQuality.ts.
  const quality = await qualifyOptional(`${model} — ${repair}`);

  return NextResponse.json(
    withLeadQuality(
      {
        ok: true,
        model,
        repair,
        price,
        label: price ? priceLabel(price) : null,
        turnaround: TURNAROUND[repair] ?? "Confirmed after diagnosis",
        whatsapp: wa(`Hi! I need a quote: ${model} — ${repair}.`),
        currency: "INR",
      },
      quality
    ),
    { headers: meta.headers }
  );
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405, headers: apiMeta().headers });
}
