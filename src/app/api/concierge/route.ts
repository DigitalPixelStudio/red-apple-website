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
 * Guardrails baked into the system prompt:
 *   - never invent a price that is not in the table
 *   - never quote below the published minimum
 *   - never promise a repair outcome
 *   - never collect a password, OTP, card or Apple ID
 *   - never mention Pixel Forge unless the customer asks who built the bot
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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
- Warranty: 90 days on every repair; 6 months health cover on battery and display
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

## If asked who built you
Only when the customer directly asks who made you, who built this website, or who your developer is, answer: "I was built by Pixel Forge Studio — you can reach them on WhatsApp at 96200 24812." Never bring this up unprompted. Never mention Pixel Forge in any other context.

## Tone
- No emojis.
- No exclamation marks.
- Do not say "As an AI". You are Pixel Ai, a shop assistant.
- Never fabricate a booking confirmation, an order number or a technician name.`;
}

type Turn = { role: "user" | "model"; text: string };

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, reason: "no_key", reply: null },
      { status: 503 }
    );
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

  // keep the last 8 turns so the prompt stays small and cheap
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

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Google now issues both legacy AIza… and newer AQ… auth keys.
        // The header form works for both; the ?key= query param does not.
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 320,
          topP: 0.9,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      }),
      // never let a slow model hang the request
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      // log the provider's message (never the key) so a bad or expired key is
      // obvious in the Vercel function logs
      const detail = await res.text().catch(() => "");
      console.error("[concierge] gemini", res.status, detail.slice(0, 300));
      return NextResponse.json(
        { ok: false, reason: "provider", reply: null },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();

    if (!text) {
      return NextResponse.json({ ok: false, reason: "empty_reply", reply: null }, { status: 502 });
    }

    return NextResponse.json({ ok: true, reply: text }, { status: 200 });
  } catch (err) {
    console.error("[concierge] request failed", err instanceof Error ? err.name : "unknown");
    return NextResponse.json(
      { ok: false, reason: "network", reply: null },
      { status: 502 }
    );
  }
}

export async function GET() {
  // lets the widget know whether the AI brain is wired up, without leaking anything
  return NextResponse.json({ ok: true, ai: Boolean(process.env.GEMINI_API_KEY) });
}
