import { NextRequest, NextResponse } from "next/server";
import { SITE, REPAIR_TYPES } from "@/lib/site";
import { PRICES, priceRange, inr, TURNAROUND } from "@/lib/pricing";

/**
 * /api/concierge — Pixel Ai's brain.
 *
 * The Gemini key lives ONLY in the Vercel environment variable
 * `GEMINI_API_KEY`. It is never written into the repo, never sent to the
 * browser, and never logged. If the variable is missing the route answers 503
 * and the widget falls back to its built-in rule engine, so the site still
 * works with no key configured.
 *
 * Visit `/api/concierge?probe=1` in a browser to check whether the key is
 * wired up and which model answered. It never reveals the key itself.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Google renames and retires models regularly, and an AQ auth key can be
 * scoped to a subset. We try newest-first and use the first that answers,
 * so a retired model name never takes the assistant down.
 */
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-1.5-flash",
];

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** A compact, readable dump of the price table for the system prompt. */
function priceBlock(): string {
  const lines: string[] = [];
  for (const [model, repairs] of Object.entries(PRICES)) {
    const parts = Object.entries(repairs).map(([repair, [lo, hi]]) =>
      `${repair}=${lo === hi ? inr(lo) : `${inr(lo)}-${inr(hi)}`}`
    );
    lines.push(`${model}: ${parts.join("; ")}`);
  }
  return lines.join("\n");
}

function systemPrompt(): string {
  const r = priceRange();
  return `You are Pixel Ai, the repair assistant for ${SITE.legalName} (${SITE.name}) in Bengaluru, India.

## Who you are
- You help customers understand their Apple device problem, the price, the timing and the warranty.
- You are warm, brief and concrete. You never waffle. Two to four short sentences is usually enough.
- You are NOT a general chatbot. If someone asks something unrelated to device repair, gently steer back.

## The shop
- Address: ${SITE.address}
- Hours: ${SITE.hours}
- Doorstep pickup: ${SITE.pickupHours}, free for repairs above ₹2,999
- Phone / WhatsApp: ${SITE.phone}
- Rating: 4.9 from 905 Google reviews, 9+ years at the same MG Road location
- Warranty: 90 days on every repair; 6 months of health cover on battery and display
- We are an INDEPENDENT repair service. We are not affiliated with, authorised by, or endorsed by Apple Inc. Never imply otherwise.
- We do not ask for passcodes, Apple IDs, OTPs or card details. Ever.

## Pricing rules — these are absolute
- The only prices you may quote are in the table below. Range: ${inr(r.min)} to ${inr(r.max)}.
- If a model+repair is NOT in the table, say it is quoted after a free diagnosis and offer WhatsApp. Do not estimate, do not guess, do not interpolate.
- Never quote below the listed minimum.
- Never invent a discount, offer, EMI plan or coupon.
- If the customer pushes for a lower price, say the price is fixed and explain what is included (genuine parts, labour, 90-day warranty).

## Price table (model: repair=price in INR)
${priceBlock()}

## Typical turnaround
${REPAIR_TYPES.map((t) => `${t}: ${TURNAROUND[t] ?? "same day"}`).join("\n")}

## Language
- Reply in the SAME language and script the customer wrote in.
- English, Hindi (Devanagari or Roman), Kannada, Tamil, Telugu, Bengali, Marathi, Malayalam, Gujarati, Punjabi, Urdu — all fine.
- Hinglish input ("screen toot gayi, kitna lagega") gets Hinglish back.
- If the customer mixes languages, mirror their mix.
- If the customer names a device but not a model, ask for the model in one short line — do not dump the whole price range.

## If asked who built you
Only when the customer directly asks who made you, who built this website, or who your developer is, answer: "I was built by Pixel Forge Studio — you can reach them on WhatsApp at 96200 24812." Never bring this up unprompted. Never mention Pixel Forge in any other context.

## Tone
- No emojis.
- No exclamation marks.
- Do not say "As an AI". You are Pixel Ai, a shop assistant.
- Never fabricate a booking confirmation, an order number or a technician name.`;
}

type Turn = { role: "user" | "model"; text: string };

type GeminiResult = { ok: true; text: string; model: string } | { ok: false; status: number; detail: string };

async function callGemini(model: string, key: string, body: unknown): Promise<GeminiResult> {
  try {
    const res = await fetch(`${BASE}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Header form works for both legacy AIza… and newer AQ… auth keys.
        "x-goog-api-key": key,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, status: res.status, detail: detail.slice(0, 240) };
    }

    const data = await res.json();
    const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();

    if (!text) return { ok: false, status: 200, detail: "empty candidate" };
    return { ok: true, text, model };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      detail: err instanceof Error ? err.name : "network",
    };
  }
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, reason: "no_key", reply: null }, { status: 503 });
  }

  let body: { message?: string; history?: Turn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const message = (body.message ?? "").toString().slice(0, 800).trim();
  if (!message) {
    return NextResponse.json({ ok: false, reason: "empty" }, { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const contents = [
    ...history
      .filter((t) => t && typeof t.text === "string" && t.text.trim())
      .map((t) => ({
        role: t.role === "model" ? "model" : "user",
        parts: [{ text: t.text.slice(0, 600) }],
      })),
    { role: "user", parts: [{ text: message }] },
  ];

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt() }] },
    contents,
    generationConfig: { temperature: 0.5, maxOutputTokens: 320, topP: 0.9 },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const attempts: string[] = [];
  for (const model of MODELS) {
    const r = await callGemini(model, key, payload);
    if (r.ok) {
      return NextResponse.json({ ok: true, reply: r.text, model: r.model }, { status: 200 });
    }
    attempts.push(`${model}:${r.status}:${r.detail.slice(0, 60)}`);
    // 401/403 means the key itself is wrong — trying other models will not help
    if (r.status === 401 || r.status === 403) break;
  }

  // log for the Vercel function logs; never includes the key
  console.error("[concierge] all models failed ::", attempts.join(" | "));
  return NextResponse.json(
    { ok: false, reason: "provider", reply: null, attempts },
    { status: 502 }
  );
}

/**
 * GET is the health check.
 *   /api/concierge          -> { ok, ai: boolean }
 *   /api/concierge?probe=1  -> actually calls Gemini once and reports which
 *                              model answered, or why it failed. No key leaks.
 */
export async function GET(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  const probe = req.nextUrl.searchParams.get("probe");

  if (!probe) {
    return NextResponse.json({ ok: true, ai: Boolean(key) });
  }
  if (!key) {
    return NextResponse.json({ ok: false, ai: false, reason: "GEMINI_API_KEY is not set" });
  }

  const payload = {
    contents: [{ role: "user", parts: [{ text: "Reply with exactly: OK" }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 8 },
  };

  const results: Record<string, string> = {};
  for (const model of MODELS) {
    const r = await callGemini(model, key, payload);
    results[model] = r.ok ? "ok" : `${r.status} ${r.detail.slice(0, 120)}`;
    if (r.ok) {
      return NextResponse.json({
        ok: true,
        ai: true,
        workingModel: model,
        keyFormat: key.slice(0, 3) + "…",
        results,
      });
    }
    if (r.status === 401 || r.status === 403) break;
  }

  return NextResponse.json({
    ok: false,
    ai: false,
    keyFormat: key.slice(0, 3) + "…",
    results,
    hint: "If every model returns 401/403 the key is wrong, expired or not enabled for the Gemini API. If only some fail, the model name is retired.",
  });
}
