import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrice, priceLabel, TURNAROUND } from "@/lib/pricing";
import { REPAIR_TYPES, wa } from "@/lib/site";

export const runtime = "nodejs";

const Schema = z.object({
  model: z.string().trim().min(1).max(80),
  repair: z.string().trim().refine((v) => (REPAIR_TYPES as readonly string[]).includes(v), { message: "invalid repair type" }),
});

/** POST /api/estimate — transparent price lookup from the single pricing sheet. */
export async function POST(req: Request) {
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }
  const { model, repair } = parsed.data;
  const price = getPrice(model, repair);
  return NextResponse.json(
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
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
