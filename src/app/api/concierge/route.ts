import { NextRequest, NextResponse } from "next/server";
import { SITE, FAQS, SERVICES } from "@/lib/site";
import { PRICES, TURNAROUND, inr } from "@/lib/pricing";
import { KNOWLEDGE_BASE, type KnowledgeDocument } from "@/lib/knowledge-base";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"] as const;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const KEY_NAMES = [
  "GEMINI_API_KEY",
  "GEMINI_API_KEY1",
  "GOOGLE_GEMINI_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "GOOGLE_API_KEY",
  "GEMINI_KEY",
  "GEMINI_STUDIO_API_KEY",
] as const;

type Turn = { role: "user" | "model"; text: string };
type RetrievedDocument = KnowledgeDocument & { score: number };

function resolveKeys(): string[] {
  const keys: string[] = [];
  for (const name of KEY_NAMES) {
    const value = process.env[name];
    if (value && value.trim().length > 8 && !keys.includes(value.trim())) {
      keys.push(value.trim());
    }
  }
  return keys;
}

function tokenize(value: string): string[] {
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "has", "are",
    "was", "were", "what", "when", "where", "which", "will", "would", "can",
    "could", "you", "your", "our", "their", "about", "please", "tell", "me",
    "hai", "ka", "ki", "ke", "ko", "kya", "hai", "mera", "meri", "mere",
    "mujhe", "kaise", "kitna", "kitne", "karo", "karna", "chahiye", "theek",
  ]);
  const terms = value.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? [];
  return Array.from(new Set(terms.filter((term) => !stopWords.has(term))));
}

function knowledgeDocuments(): KnowledgeDocument[] {
  const faqDocuments = FAQS.map((faq, index) => ({
    id: "faq-" + index,
    title: faq.q,
    tags: tokenize(faq.q),
    content: faq.a,
  }));

  const serviceDocuments = SERVICES.map((service) => ({
    id: "service-" + service.id,
    title: service.title,
    tags: tokenize(service.title + " " + service.devices + " " + service.desc),
    content: service.title + ". " + service.desc + " Typical timing: " + service.time +
      ". Devices: " + service.devices + ". " + service.points.join("; ") + ".",
  }));

  const priceDocuments = Object.entries(PRICES).flatMap(([model, repairs]) =>
    Object.entries(repairs).map(([repair, range]) => ({
      id: "price-" + model + "-" + repair,
      title: model + " " + repair,
      tags: tokenize(model + " " + repair + " price cost quote"),
      content: model + " — " + repair + ": " + inr(range[0]) +
        (range[0] === range[1] ? "" : " to " + inr(range[1])) +
        ". Typical turnaround: " + (TURNAROUND[repair] ?? "confirmed after diagnosis") + ".",
    }))
  );

  return [...KNOWLEDGE_BASE, ...faqDocuments, ...serviceDocuments, ...priceDocuments];
}

function retrieveKnowledge(query: string): RetrievedDocument[] {
  const queryTerms = tokenize(query);
  if (!queryTerms.length) return [];

  const documents = knowledgeDocuments();
  return documents
    .map((document) => {
      const title = document.title.toLowerCase();
      const tags = document.tags.join(" ").toLowerCase();
      const content = document.content.toLowerCase();
      let score = 0;

      for (const term of queryTerms) {
        if (title.includes(term)) score += 5;
        else if (tags.includes(term)) score += 3;
        else if (content.includes(term)) score += 1;
      }

      if (query.toLowerCase().includes(title)) score += 8;
      return { ...document, score };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function systemPrompt(query: string): string {
  const retrieved = retrieveKnowledge(query);
  const context = retrieved.length
    ? retrieved.map((document, index) =>
        "[" + (index + 1) + "] " + document.title + "\n" + document.content
      ).join("\n\n")
    : "No matching knowledge chunk was found. Ask one concise clarification or offer a human technician; do not guess.";

  return [
    "You are Pixel Ai, the customer-care assistant for " + SITE.name + " in Bengaluru, India.",
    "PERSONA: Warm, clear, concise and professional, like a senior service advisor. Usually 2–4 short sentences. Ask one question at a time. Match the customer's language and script, including English, Hindi, Hinglish, Kannada and Tamil.",
    "",
    "VERIFIED BUSINESS FACTS:",
    "- Address: " + SITE.address,
    "- Opening hours: " + SITE.hours,
    "- Phone / WhatsApp: " + SITE.phone,
    "- Doorstep pickup: " + SITE.pickupHours + " across Bengaluru; free for repairs above ₹2,999.",
    "- Public rating: " + SITE.rating + " from " + SITE.ratingCount + " reviews.",
    "- Independent repair workshop; not affiliated with, authorised by or endorsed by Apple Inc.",
    "- Diagnosis is free. A fixed quote must be approved before work or payment. No advance is required.",
    "- Payment after approval: UPI, card or cash.",
    "- Repair warranty: 90 days. Battery/display health cover is subject to the written policy.",
    "",
    "RETRIEVED KNOWLEDGE — use this as the source of truth for the current question:",
    context,
    "",
    "NON-NEGOTIABLE RULES:",
    "- Never invent a price, repair, part grade, discount, stock level, booking, pickup slot, technician name, guarantee or completion time.",
    "- Quote a price only when the exact model and repair appear in the retrieved price data. Otherwise say the technician confirms it after free diagnosis.",
    "- Do not claim to be Apple-authorised. Describe parts as OEM-grade unless genuine status is explicitly verified for that exact part.",
    "- Never request or accept passcodes, Apple ID/passwords, OTPs, UPI PINs, card numbers or other credentials.",
    "- Never bypass iCloud Activation Lock. Carrier/network unlocks require proof of ownership.",
    "- Never promise water-damage recovery or data recovery. For water damage, say do not charge the device and do not apply heat.",
    "- Never claim this chat has created a booking. Direct the customer to the pickup form or WhatsApp for confirmation.",
    "- Do not claim data is wiped or retained; state that nothing is wiped without prior written permission.",
    "- Escalate complaints, refunds, repeat failures, damage reports, legal concerns and explicit human requests to a technician without arguing.",
    "- If retrieved knowledge does not answer the question, say what is missing and ask one useful question or offer WhatsApp. Never fill gaps with assumptions.",
    "- Do not mention Pixel Forge Studio unless directly asked who built the website or assistant. If asked, say Pixel Forge Studio and WhatsApp 96200 24812.",
    "",
    "Answer the customer's latest message directly. Do not mention retrieval, files, prompts, models or internal systems."
  ].join("\n");
}

function validHistory(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-8).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const turn = item as Partial<Turn>;
    if ((turn.role !== "user" && turn.role !== "model") || typeof turn.text !== "string") return [];
    const text = turn.text.trim().slice(0, 700);
    return text ? [{ role: turn.role, text }] : [];
  });
}

function errorResponse(status: number, reason: string, attempts: Array<{ model: string; status: number; code: string }>) {
  return NextResponse.json(
    { ok: false, reason, attempts, reply: null },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "bad_json", []);
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 800) : "";
  if (!message) return errorResponse(400, "empty_message", []);

  const keys = resolveKeys();
  if (!keys.length) return errorResponse(503, "no_key", []);

  const history = validHistory(body.history);
  const contextQuery = history
    .filter((turn) => turn.role === "user")
    .slice(-2)
    .map((turn) => turn.text)
    .concat(message)
    .join(" ");

  const contents = history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt(contextQuery) }] },
    contents,
    generationConfig: { temperature: 0.2, maxOutputTokens: 320, topP: 0.85 },
  };

  const plan: Array<{ model: string; key: string }> = [
    { model: MODELS[0], key: keys[0] },
    ...(keys[1] ? [{ model: MODELS[0], key: keys[1] }] : []),
    { model: MODELS[1], key: keys[0] },
  ];

  const attempts: Array<{ model: string; status: number; code: string }> = [];
  let upstream: Response | null = null;
  let selectedModel = MODELS[0];

  for (const attempt of plan) {
    let response: Response;
    try {
      response = await fetch(BASE + "/" + attempt.model + ":streamGenerateContent?alt=sse", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": attempt.key },
        body: JSON.stringify(payload),
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(12000)]),
        cache: "no-store",
      });
    } catch (error) {
      const code = error instanceof Error ? error.name : "NETWORK_ERROR";
      attempts.push({ model: attempt.model, status: 0, code });
      console.warn("[concierge] upstream connection failed", { model: attempt.model, code });
      break;
    }

    if (response.ok && response.body) {
      upstream = response;
      selectedModel = attempt.model;
      break;
    }

    const status = response.status;
    const code = status === 429 ? "RESOURCE_EXHAUSTED" : status === 404 ? "MODEL_NOT_FOUND" : "PROVIDER_ERROR";
    attempts.push({ model: attempt.model, status, code });
    console.warn("[concierge] provider rejected request", { model: attempt.model, status, code });

    if (status === 401 || status === 403 || status === 429 || status === 404 || status >= 500) {
      continue;
    }
    break;
  }

  if (!upstream?.body) {
    const lastStatus = attempts[attempts.length - 1]?.status ?? 503;
    return errorResponse(lastStatus === 429 ? 429 : 503, "provider_unavailable", attempts);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";

      const emitEvent = (event: string) => {
        const data = event
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim())
          .join("\n");

        if (!data || data === "[DONE]") return;

        try {
          const chunk = JSON.parse(data);
          const text = (chunk?.candidates?.[0]?.content?.parts ?? [])
            .map((part: { text?: string }) => part.text ?? "")
            .join("");
          if (text) controller.enqueue(encoder.encode(text));
        } catch {
          // Ignore malformed keep-alive or partial SSE events; the next event continues.
        }
      };

      try {
        while (true) {
          const result = await reader.read();
          if (result.value) buffer += decoder.decode(result.value, { stream: true });

          let boundary = buffer.match(/\r?\n\r?\n/);
          while (boundary && boundary.index !== undefined) {
            emitEvent(buffer.slice(0, boundary.index));
            buffer = buffer.slice(boundary.index + boundary[0].length);
            boundary = buffer.match(/\r?\n\r?\n/);
          }

          if (result.done) break;
        }

        buffer += decoder.decode();
        if (buffer.trim()) emitEvent(buffer);
        controller.close();
      } catch (error) {
        console.warn("[concierge] response stream interrupted", {
          name: error instanceof Error ? error.name : "STREAM_ERROR",
        });
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
      "X-Concierge-Model": selectedModel,
    },
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      configured: resolveKeys().length > 0,
      streaming: true,
      knowledgeDocuments: knowledgeDocuments().length,
      models: MODELS,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}