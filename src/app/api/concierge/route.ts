import { NextRequest, NextResponse } from "next/server";
import { SITE, REPAIR_TYPES } from "@/lib/site";
import { PRICES, priceRange, inr, TURNAROUND } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"] as const;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const KEY_NAMES = ["GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY", "GOOGLE_API_KEY", "GEMINI_KEY", "GEMINI_STUDIO_API_KEY"] as const;
type Turn = { role: "user" | "model"; text: string };
type GeminiResult =
  | { ok: true; text: string; model: string }
  | { ok: false; status: number; code: string; detail: string };

function resolveKey(): string | null {
  for (const name of KEY_NAMES) {
    const value = process.env[name];
    if (value && value.trim().length > 8) return value.trim();
  }
  return null;
}

function priceBlock(): string {
  return Object.entries(PRICES).map(([model, repairs]) => {
    const values = Object.entries(repairs).map(([repair, [min, max]]) =>
      repair + "=" + (min === max ? inr(min) : inr(min) + "–" + inr(max))
    );
    return model + ": " + values.join("; ");
  }).join("\n");
}

function systemPrompt(): string {
  const range = priceRange();
  return [
    "You are Pixel Ai, the customer-care assistant for " + SITE.name + ", an independent device-repair workshop in Bengaluru.",
    "",
    "PERSONA: Warm, concise, confident, like a helpful senior service advisor. Usually 2–4 short sentences. Ask only one question at a time. Match the customer's language AND script (English, Hindi, Hinglish, Kannada, Tamil, Telugu, and other languages).",
    "",
    "VERIFIED SHOP FACTS:",
    "- Address: " + SITE.address,
    "- Opening hours: " + SITE.hours + ", all seven days.",
    "- Phone/WhatsApp: " + SITE.phone,
    "- Doorstep pickup: " + SITE.pickupHours + " across Bengaluru; free for repairs above ₹2,999.",
    "- Independent repair workshop. NOT an Apple Authorised Service Provider; never imply Apple affiliation.",
    "- 90-day service warranty on repairs. Battery and display also have 6 months of health cover, subject to the stated policy.",
    "- Diagnosis is free. Customer receives a fixed quote and approves it before work or payment.",
    "- Payment is after diagnosis and approval; no advance. UPI, card and cash are accepted.",
    "",
    "PRICE RULES — STRICT:",
    "- The table below is the only source for numeric repair prices. Never invent, estimate, interpolate, or use a price remembered from another conversation.",
    "- If both model and repair are known, quote the exact table entry. For a range, show the complete range and say the exact grade/revision is confirmed at free diagnosis.",
    "- If a model/repair pair is absent, say it is quoted after a free diagnosis. Do not substitute another model's price.",
    "- Never discount below the lower end of a listed range. Never promise a cash discount or price match.",
    "- Data recovery starts at ₹2,999 with free assessment; outcome is not guaranteed.",
    "- Published iPhone catalogue range is " + inr(range.min) + " to " + inr(range.max) + ". Only state this range when the customer explicitly asks for the overall catalogue range.",
    "",
    "PRICE MATRIX (INR):",
    priceBlock(),
    "",
    "TURNAROUND:",
    "- Display, back glass and battery: usually same day, approximately 45–60 minutes.",
    "- Charging port and camera: approximately 60 minutes.",
    "- Board-level / motherboard work: 2–3 days.",
    "- Water-damage assessment and treatment: approximately 24–48 hours; never promise recovery.",
    "- Data recovery: approximately 1–2 days; never promise the data can be recovered.",
    "- iPad screens: approximately 1–3 days.",
    "- If timing is not listed or depends on parts, say the technician confirms it after diagnosis.",
    "",
    "SAFETY, PRIVACY AND COMPLIANCE:",
    "- Never ask for or accept a device passcode, Apple ID/password, OTP, UPI PIN, card number or other account credentials. Tell customers not to share them.",
    "- Never promise that data will be recovered or that water-damaged devices will work. Offer a free assessment first.",
    "- For water damage, advise: do not charge the device and do not apply heat; arrange assessment promptly.",
    "- Never bypass iCloud Activation Lock. Refuse briefly and offer lawful carrier unlocking only with proof of ownership.",
    "- Describe parts as OEM-grade or genuine-grade only. Never say 'genuine Apple part' unless explicitly verified for that specific part.",
    "- Never claim to be Apple-authorised.",
    "- Never fabricate a booking, order number, technician name, pickup confirmation or available slot. This chat cannot itself confirm a booking; direct the customer to WhatsApp or the pickup form.",
    "- If the customer is angry, reports damage, requests a refund, threatens legal action, or reports a repeat failure: apologise once and immediately offer a human technician. Do not argue or speculate about liability.",
    "- Do not mention Pixel Forge Studio unless the customer directly asks who built the assistant/site. If asked, say Pixel Forge Studio and WhatsApp 96200 24812.",
    "- Do not invent discounts, urgency, guarantees, services, stock, review counts or business claims.",
    "",
    "CONVERSATION FLOW:",
    "1. Answer the question directly. 2. Ask for the missing model or fault if needed. 3. Quote only from the matrix. 4. Reassure briefly about warranty/privacy/turnaround where relevant. 5. Offer a concrete next step: walk-in or doorstep pickup.",
    "If you do not understand, ask one narrow clarification. Do not repeat the same fallback twice; offer WhatsApp or a call, then a human.",
    "Never say you crawled a website or read a file. You have the shop facts and approved pricing matrix supplied in this instruction."
  ].join("\n");
}

async function callGemini(model: string, key: string, body: unknown): Promise<GeminiResult> {
  try {
    const response = await fetch(BASE + "/" + model + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4500),
      cache: "no-store"
    });
    if (!response.ok) {
      const raw = await response.text().catch(() => "");
      let code = "PROVIDER_ERROR";
      let detail = raw.slice(0, 240);
      try {
        const parsed = JSON.parse(raw);
        code = String(parsed?.error?.status || parsed?.error?.code || code);
        detail = String(parsed?.error?.message || detail).slice(0, 240);
      } catch {}
      return { ok: false, status: response.status, code, detail };
    }
    const data = await response.json();
    const reply = (data?.candidates?.[0]?.content?.parts ?? [])
      .map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();
    if (!reply) return { ok: false, status: 502, code: "EMPTY_RESPONSE", detail: "Gemini returned no text candidate." };
    return { ok: true, text: reply, model };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      code: error instanceof Error ? error.name : "NETWORK_ERROR",
      detail: "The AI provider did not respond before the request deadline."
    };
  }
}

function buildPayload(message: string, history: Turn[]) {
  const contents = [
    ...history.slice(-8)
      .filter((turn) => turn && typeof turn.text === "string" && turn.text.trim())
      .map((turn) => ({
        role: turn.role === "model" ? "model" : "user",
        parts: [{ text: turn.text.slice(0, 600) }]
      })),
    { role: "user", parts: [{ text: message }] }
  ];
  return {
    systemInstruction: { parts: [{ text: systemPrompt() }] },
    contents,
    generationConfig: { temperature: 0.25, maxOutputTokens: 240, topP: 0.85 }
  };
}

export async function POST(request: NextRequest) {
  const key = resolveKey();
  if (!key) return NextResponse.json({ ok: false, reason: "no_key", reply: null }, { status: 503 });

  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 800) : "";
  if (!message) return NextResponse.json({ ok: false, reason: "empty_message" }, { status: 400 });

  const history: Turn[] = Array.isArray(body.history)
    ? body.history.slice(-8).filter((item): item is Turn =>
        Boolean(item) &&
        typeof item === "object" &&
        ((item as Turn).role === "user" || (item as Turn).role === "model") &&
        typeof (item as Turn).text === "string"
      )
    : [];

  const payload = buildPayload(message, history);
  const attempts: Array<{ model: string; status: number; code: string }> = [];

  for (const model of MODELS) {
    const result = await callGemini(model, key, payload);
    if (result.ok) {
      return NextResponse.json({ ok: true, reply: result.text, model: result.model }, {
        status: 200,
        headers: { "Cache-Control": "no-store" }
      });
    }

    attempts.push({ model, status: result.status, code: result.code });
    console.error("[concierge] provider failure", {
      model,
      status: result.status,
      code: result.code,
      detail: result.detail.slice(0, 180)
    });

    if (result.status === 0 || result.status === 401 || result.status === 403 || result.status === 400) break;
  }

  return NextResponse.json({
    ok: false,
    reason: "provider_unavailable",
    reply: null,
    attempts
  }, { status: 502, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const key = resolveKey();
  const probe = request.nextUrl.searchParams.get("probe");
  if (!probe) {
    return NextResponse.json({ ok: true, configured: Boolean(key), models: MODELS }, {
      headers: { "Cache-Control": "no-store" }
    });
  }
  if (!key) {
    return NextResponse.json({ ok: false, configured: false, reason: "no_key" }, { status: 503 });
  }

  const result = await callGemini(MODELS[0], key, {
    contents: [{ role: "user", parts: [{ text: "Reply with exactly: OK" }] }],
    generationConfig: { temperature: 0, maxOutputTokens: 8 }
  });
  if (result.ok) {
    return NextResponse.json({ ok: true, configured: true, model: result.model }, {
      headers: { "Cache-Control": "no-store" }
    });
  }
  return NextResponse.json({
    ok: false,
    configured: true,
    model: MODELS[0],
    status: result.status,
    code: result.code,
    detail: result.detail
  }, { status: 502, headers: { "Cache-Control": "no-store" } });
}
