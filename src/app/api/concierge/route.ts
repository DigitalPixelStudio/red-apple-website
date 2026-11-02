import { NextRequest, NextResponse } from "next/server";
import { SITE, FAQS, SERVICES, DEVICE_FAMILIES } from "@/lib/site";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";
import { PRICES, TURNAROUND, inr } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"] as const;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const KEY_NAMES = ["GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY", "GOOGLE_API_KEY", "GEMINI_KEY", "GEMINI_STUDIO_API_KEY"] as const;
type Turn = { role: "user" | "model"; text: string };
type GeminiResult =
  | { ok: true; response: Response; model: string }
  | { ok: false; status: number; code: string; detail: string };

function resolveKeys(): string[] {
  const names = ["GEMINI_API_KEY", "GEMINI_API_KEY1", ...KEY_NAMES.slice(1)];
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value && value.length > 8 && !seen.has(value)) {
      seen.add(value);
      keys.push(value);
    }
  }
  return keys;
}

function retrieveKnowledge(query: string): string {
  const docs = [
    ...KNOWLEDGE_BASE.map((item) => ({
      title: item.title,
      body: item.content,
      tags: item.tags,
    })),
    ...FAQS.map((item) => ({ title: item.q, body: item.a, tags: [item.q] })),
    ...SERVICES.map((item) => ({
      title: item.title,
      body: [item.desc, item.time, item.devices, ...item.points].join(" · "),
      tags: [item.title, item.devices],
    })),
    ...DEVICE_FAMILIES.map((item) => ({
      title: item.name,
      body: [item.tag, item.desc].join(" · "),
      tags: [item.name, item.tag],
    })),
    ...Object.entries(PRICES).flatMap(([model, repairs]) =>
      Object.entries(repairs).map(([repair, range]) => ({
        title: model + " " + repair,
        tags: [model, repair, "price", "pricing", "cost", "quote"],
        body: model + " — " + repair + ": " + inr(range[0]) +
          (range[0] === range[1] ? "" : " – " + inr(range[1])) +
          ". Typical turnaround: " + (TURNAROUND[repair] ?? "confirmed after diagnosis") + ".",
      }))
    ),
  ];

  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "has", "are",
    "was", "were", "what", "when", "where", "which", "will", "would", "can",
    "could", "you", "your", "our", "their", "about", "please", "tell", "me",
    "hai", "ka", "ki", "ke", "ko", "kya", "mera", "meri", "mere", "mujhe",
    "kaise", "kitna", "kitne", "karo", "karna", "chahiye", "theek",
  ]);
  const terms = Array.from(new Set(query.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []))
    .filter((term) => !stopWords.has(term));
  if (!terms.length) return "";

  return docs
    .map((doc) => {
      const title = doc.title.toLowerCase();
      const tags = doc.tags.join(" ").toLowerCase();
      const body = doc.body.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += 5;
        else if (tags.includes(term)) score += 3;
        else if (body.includes(term)) score += 1;
      }
      if (query.toLowerCase().includes(title)) score += 8;
      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((doc) => doc.title + ": " + doc.body.slice(0, 900))
    .join("\n");
}

function systemPrompt(query: string): string {
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
    "- We repair iPhone 6 through iPhone 18 Pro Max, plus iPad, Apple Watch, iPod, AirPods and MacBook.",
    "- Independent repair workshop. NOT an Apple Authorised Service Provider; never imply Apple affiliation.",
    "- 90-day service warranty on repairs. Battery and display also have 6 months of health cover: battery health below 80% or a non-impact display fault qualifies for one replacement under policy. New impact/liquid damage and third-party repair are excluded.",
    "- Devices in transit and on the bench are covered by the shop care policy and photographed at collection and hand-back.",
    "- Customers may watch bench work through the workshop glass wall. We do not copy, read or retain customer data; repair records contain only model, fault, part, price and date.",
    "- Diagnosis is free. Customer receives a fixed quote and approves it before work or payment.",
    "- Payment is after diagnosis and approval; no advance. UPI, card and cash are accepted.",
    "",
    "PRICE RULES — STRICT:",
    "- Retrieved price entries below are the only source for numeric repair prices. Never invent, estimate, interpolate, or use a price remembered from another conversation.",
    "- If both model and repair are known, quote the exact table entry. For a range, show the complete range and say the exact grade/revision is confirmed at free diagnosis.",
    "- If a model/repair pair is absent, say it is quoted after a free diagnosis. Do not substitute another model's price.",
    "- Never discount below the lower end of a listed range. Never promise a cash discount or price match.",
    "- Data recovery starts at ₹2,999 with free assessment; outcome is not guaranteed.",
    "- If a customer explicitly asks for the overall iPhone price range, state ₹1,200 to ₹36,400, then ask for the exact model and fault. Do not present this as a quote.",
    "",
    "RETRIEVED PRICE MATRIX (INR):",
    "Use only the exact model + repair entries included in the retrieved knowledge below. If no matching entry is retrieved, quote only after free diagnosis.",
    "",
    "RETRIEVED WEBSITE KNOWLEDGE (relevant FAQ and service details):",
    retrieveKnowledge(query) || "No additional matching FAQ or service entry; use only the verified shop facts above.",
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
    "- If the customer asks for a lower price, never discount below the matrix floor. Offer to have a technician check whether another safe part grade is available; negotiation below the floor goes to a human.",
    "- Bulk/B2B requests for 5 or more devices go to the owner for a written custom quote.",
    "- Do not invent discounts, urgency, guarantees, services, stock, review counts or business claims.",
    "- Use no emoji unless the customer used one first. Never use repeated exclamation marks or pressure/scarcity claims.",
    "",
    "CONVERSATION FLOW:",
    "1. Answer the question directly. 2. Ask for the missing model or fault if needed. 3. Quote only from the matrix. 4. Reassure briefly about warranty/privacy/turnaround where relevant. 5. Offer a concrete next step: walk-in or doorstep pickup.",
    "If you do not understand, ask one narrow clarification. Do not repeat the same fallback twice; offer WhatsApp or a call, then a human.",
    "Never say you crawled a website or read a file. You have the shop facts and approved pricing matrix supplied in this instruction."
  ].join("\n");
}

async function callGemini(model: string, key: string, body: unknown): Promise<GeminiResult> {
  try {
    const response = await fetch(BASE + "/" + model + ":streamGenerateContent?alt=sse", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
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
    if (!response.body) {
      return { ok: false, status: 502, code: "EMPTY_STREAM", detail: "Gemini returned no response stream." };
    }
    return { ok: true, response, model };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      code: error instanceof Error ? error.name : "NETWORK_ERROR",
      detail: "The AI provider did not respond before the request deadline."
    };
  }
}

function textStream(upstream: Response): ReadableStream<Uint8Array> {
  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const emitEvent = (event: string, controller: ReadableStreamDefaultController<Uint8Array>) => {
    for (const line of event.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const payload = JSON.parse(raw);
        const text = (payload?.candidates?.[0]?.content?.parts ?? [])
          .map((part: { text?: string }) => part.text ?? "")
          .join("");
        if (text) controller.enqueue(encoder.encode(text));
      } catch {
        // Ignore malformed keep-alive or partial SSE events; the next event remains usable.
      }
    }
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            emitEvent(buffer.slice(0, boundary), controller);
            buffer = buffer.slice(boundary + 2);
            boundary = buffer.indexOf("\n\n");
          }
        }
        buffer += decoder.decode();
        if (buffer.trim()) emitEvent(buffer, controller);
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    }
  });
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
    systemInstruction: { parts: [{ text: systemPrompt(
      history.filter((turn) => turn.role === "user").slice(-2).map((turn) => turn.text).concat(message).join(" ")
    ) }] },
    contents,
    generationConfig: { temperature: 0.25, maxOutputTokens: 240, topP: 0.85 }
  };
}

export async function POST(request: NextRequest) {
  const keys = resolveKeys();
  if (!keys.length) return new Response(null, { status: 204, headers: { "Cache-Control": "no-store", "X-Concierge-Fallback": "local" } });

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
  let selected: { response: Response; model: string } | null = null;

  // At most three attempts: primary key/model, one alternate key, then the fallback model.
  // A network timeout stops retries; repeatedly waiting on the same exhausted project only adds latency.
  const plan = [
    { model: MODELS[0], key: keys[0] },
    ...(keys[1] ? [{ model: MODELS[0], key: keys[1] }] : []),
    { model: MODELS[1], key: keys[0] },
  ];

  for (const attempt of plan) {
    const result = await callGemini(attempt.model, attempt.key, payload);
    if (result.ok) {
      selected = { response: result.response, model: result.model };
      break;
    }
    attempts.push({ model: attempt.model, status: result.status, code: result.code });
    console.warn("[concierge] provider fallback", {
      model: attempt.model,
      status: result.status,
      code: result.code,
    });
    if (result.status === 0 || result.status === 400) break;
  }

  if (selected) {
    return new Response(textStream(selected.response), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
        "X-AI-Model": selected.model
      }
    });
  }

  // Let the browser's deterministic resolver answer from the local knowledge base.
  // A quota outage is not a customer-facing server error and should not count as a 5xx.
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "X-Concierge-Fallback": "local",
      "X-Concierge-Attempts": String(attempts.length),
    },
  });
}

export async function GET() {
  const keys = resolveKeys();
  return NextResponse.json({
    ok: true,
    configured: keys.length > 0,
    configuredKeySlots: keys.length,
    streaming: true,
    retrieval: "local-keyword-rag",
    knowledgeDocuments: KNOWLEDGE_BASE.length + FAQS.length + SERVICES.length + DEVICE_FAMILIES.length + Object.values(PRICES).reduce((total, row) => total + Object.keys(row).length, 0),
    models: MODELS
  }, { headers: { "Cache-Control": "no-store" } });
}
