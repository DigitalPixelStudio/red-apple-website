import { NextRequest, NextResponse } from "next/server";
import { SITE, FAQS, SERVICES, DEVICE_FAMILIES } from "@/lib/site";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";
import { PRICES, TURNAROUND, inr } from "@/lib/pricing";
import { GLASS_PRICE_ROWS, GLASS_PRICE_MIN, GLASS_PRICE_MAX, GLASS_WARRANTY_MONTHS } from "@/lib/glass-pricing";
import { rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 40;

// Current stable Flash family, ordered for reliable low-latency fallback.
const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash-lite"] as const;
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
// GEMINI_API_KEY is canonical; the others are accepted aliases for older deployments.
const KEY_NAMES = ["GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY", "GOOGLE_API_KEY", "GEMINI_STUDIO_API_KEY", "GOOGLE_GEMINI_API_KEY", "GEMINI_KEY"] as const;
type Turn = { role: "user" | "model"; text: string };
type GeminiResult =
  | { ok: true; response: Response; model: string }
  | { ok: false; status: number; code: string; detail: string };

function resolveKeys(): string[] {
  // Canonical slot first, then numbered slots, then the accepted aliases.
  const names = ["GEMINI_API_KEY_Redmobilerepair", "GEMINI_API_KEY", "GEMINI_API_KEY1", "GEMINI_API_KEY2", ...KEY_NAMES.slice(1)];
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value && value.length > 8 && !seen.has(value)) {
      seen.add(value);
      keys.push(value);
    }
  }
  // Future-proof: any GEMINI_* secret added in Vercel is picked up automatically.
  for (const [name, raw] of Object.entries(process.env)) {
    if (!/^GEMINI_/i.test(name) || !raw) continue;
    const value = raw.trim();
    if (value.length > 8 && !seen.has(value)) { seen.add(value); keys.push(value); }
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
    ...GLASS_PRICE_ROWS.map((row) => ({
      title: row.model + " Front Glass Restoration",
      tags: [row.model, "front glass", "glass restoration", "glass only", "cracked glass", "price", "pricing", "cost", "quote", "TBK"],
      body: row.model + " — Front Glass Restoration: " + inr(row.price) +
        ". Glass-only restoration, separate from full display replacement. " +
        GLASS_WARRANTY_MONTHS + "-month hardware warranty; eligibility confirmed on inspection. " +
        "Typical turnaround: same day after the eligibility check.",
    })),
    {
      title: "Front glass restoration machinery (TBK)",
      tags: ["TBK", "machine", "machinery", "OCA", "laminating", "vacuum", "hydraulic press", "bubble remover", "chamber", "UV laser", "cold laser", "TBK-958", "lab"],
      body: "Glass restoration uses three TBK systems: the TBK OCA Laminating Vacuum Compressed Hydraulic Press for vacuum and hydraulic optical bonding; the TBK 90-Litre High-Pressure Bubble Remover Chamber for a zero-bubble, permanent OCA cure; and the TBK-958 Cold UV Purple Laser for low-temperature bezel separation and back-glass removal with no thermal stress on the logic board.",
    },
  ];

  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "has", "are",
    "was", "were", "what", "when", "where", "which", "will", "would", "can",
    "could", "you", "your", "our", "their", "about", "please", "tell", "me",
    "hai", "ka", "ki", "ke", "ko", "kya", "mera", "meri", "mere", "mujhe",
    "kaise", "kitna", "kitne", "karo", "karna", "chahiye", "theek",
  ]);
  /* Query expansion: a customer's word is mapped onto the vocabulary the
     documents actually use. This is the cheap half of RAG — no embedding
     service, no cold start, and it never invents a fact. */
  const EXPAND: Record<string, string[]> = {
    screen: ["display", "oled", "lcd", "touch", "cracked"],
    display: ["screen", "oled", "true tone", "glass"],
    battery: ["charging", "drain", "health", "swollen", "power", "charge"],
    charge: ["charging port", "battery", "flex"],
    glass: ["front glass", "restoration", "oca", "lamination", "oled", "screen glass"],
    price: ["cost", "quote", "rate", "pricing", "kitna"],
    cost: ["price", "quote", "rate"],
    quote: ["price", "estimate", "cost"],
    estimate: ["price", "quote", "cost"],
    watch: ["apple watch", "ultra", "series"],
    mac: ["macbook", "imac", "mac mini", "logic board"],
    laptop: ["macbook", "logic board"],
    tab: ["ipad", "tablet"],
    water: ["liquid", "corrosion", "spill", "water damage"],
    data: ["recovery", "photos", "contacts", "backup"],
    unlock: ["activation lock", "carrier", "network lock"],
    open: ["hours", "timing", "opening"],
    time: ["turnaround", "duration", "how long"],
    warranty: ["guarantee", "policy", "cover", "6 Months", "6 Months", "invoice", "claim", "warranty claim"],
    invoice: ["bill", "receipt", "crm", "job card", "proof of repair", "warranty record"],
    status: ["repair status", "stage", "stage update", "whatsapp update", "tracking", "where is my device"],
    genuine: ["oem", "original", "part grade"],
    original: ["oem", "genuine", "part grade"],
    fix: ["repair", "service"],
    repair: ["fix", "service"],
    oled: ["glass", "display", "original screen", "lcd"],
    motherboard: ["board", "ic", "logic board", "chip"],
    board: ["motherboard", "ic", "logic"],
    ic: ["motherboard", "chip", "board"],
    pickup: ["doorstep", "free pickup", "home collection"],
  };

  const rawTerms = Array.from(new Set(query.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []))
    .filter((term) => !stopWords.has(term));
  if (!rawTerms.length) return "";

  const terms = Array.from(new Set(rawTerms.flatMap((term) => [term, ...(EXPAND[term] ?? [])])));
  const q = query.toLowerCase();
  /* Bigrams catch "13 pro max", "front glass", "battery health" — phrases that
     a bag-of-words score would otherwise split apart. */
  const bigrams = rawTerms.slice(0, -1).map((term, i) => term + " " + rawTerms[i + 1]);

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
      for (const phrase of bigrams) {
        if (title.includes(phrase)) score += 6;
        else if (tags.includes(phrase)) score += 4;
        else if (body.includes(phrase)) score += 2;
      }
      /* A tag that appears verbatim in the question is a strong signal. */
      for (const tag of doc.tags) {
        const clean = tag.toLowerCase().trim();
        if (clean.length >= 4 && q.includes(clean)) score += 2;
      }
      if (q.includes(title)) score += 8;
      /* Exact model numbers matter more than prose length. */
      if (/\b1[0-9]\b/.test(q) && /\biphone\b/.test(q) && /\biphone\b/.test(title)) score += 3;
      return { ...doc, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    /* Deduplicate near-identical titles so one repeated FAQ cannot crowd out
       the policy chunk that actually answers the question. */
    .filter((doc, index, list) => list.findIndex((other) => other.title === doc.title) === index)
    .slice(0, 8)
    .map((doc) => doc.title + ": " + doc.body.slice(0, 760))
    .join("\n");
}

function inferIntent(query: string): string {
  const lower = query.toLowerCase();
  const model = Object.keys(PRICES)
    .sort((a, b) => b.length - a.length)
    .find((m) => lower.includes(m.toLowerCase()));
  const issueList = [
    "Front Glass Restoration", "Front Display Replacement", "Back Glass Replacement",
    "Battery Replacement", "Motherboard / IC Repair", "Charging Port / Flex",
    "Camera Repair", "Water Damage",
  ];
  const issue = issueList.find((i) => lower.includes(i.toLowerCase()))
    || (lower.includes("glass") ? "Front Glass Restoration" : null)
    || (lower.includes("screen") ? "Front Display Replacement" : null)
    || (lower.includes("board") || lower.includes("dead") ? "Motherboard / IC Repair" : null);
  return `DETECTED INTENT — device: ${model || "unspecified"}, issue: ${issue || "unspecified"}. ` +
    (model && issue
      ? `When quoting, use only the ${model} / ${issue} row from the supplied matrix. If that exact row is absent, say a free diagnosis is needed — never substitute another model's price.`
      : `Ask one narrow clarification for the missing device or fault before quoting a fixed price.`);
}

function systemPrompt(query: string): string {
  return [
    "You are Forge AI, the customer-care assistant for " + SITE.name + ", an independent device-repair workshop in Bengaluru.",
    "",
    "PERSONA: Warm, concise, confident, like a helpful senior service advisor. Usually 2–4 short sentences. Ask only one question at a time. Match the customer's language AND script (English, Hindi, Hinglish, Kannada, Tamil, Telugu, and other languages).",
    "",
    "GROUNDING RULES — STRICT:",
    "- Answer ONLY from the verified shop facts and the retrieved knowledge base / price matrix supplied below. Never use a remembered fact, never invent a detail, and never guess.",
    "- If the answer is not in the supplied material, say it needs a free diagnosis or a technician. Do not fill the gap with general knowledge.",
    "- Keep it short and friendly: two to four sentences, one question at most.",
    "- NEVER quote any shorter warranty period. The warranty is 6 Months on every repair, display, battery and glass job; motherboard repairs are the only exclusion. The invoice is the warranty record and the customer can claim diagnosis and a covered repair on that same invoice within 6 Months.",
    "- NEVER give the old address (No. 1 Mahatma Gandhi Road or 'opposite Bhadra Landmark' by itself). The verified address is " + SITE.address + " — " + SITE.addressVerified + ".",
    "- Rating is 4.9 from " + SITE.ratingCount + " Google reviews. Verified listing: " + SITE.gmbUrl + ".",
    "",
    "VERIFIED SHOP FACTS:",
    "- Address: " + SITE.address,
    "- Opening hours: " + SITE.hours + ", all seven days.",
    "- Phone/WhatsApp: " + SITE.phone,
    "- Doorstep pickup: " + SITE.pickupHours + " across Bengaluru; free for repairs above ₹2,999.",
    "- We repair supported iPhone models listed in the website model list, plus iPad, Apple Watch, iPod, AirPods and MacBook.",
    "- Independent repair workshop. NOT an Apple Authorised Service Provider; never imply Apple affiliation.",
    "- 6 Months repair warranty on all repairs, displays, batteries and glass work; motherboard repairs are the only exclusion. The invoice is the warranty record: bring the invoice and the device, or WhatsApp the invoice number and photos, and diagnosis plus a covered repair are handled on that same invoice within 6 Months. Excluded: physical/impact or liquid damage after hand-back, repair or opening by another shop after us, accidental damage, normal wear and tear, misuse, cosmetic issues, and unrelated software faults.",
    "- Repair progress is tracked in our CRM. Walk-in and doorstep-pickup customers get WhatsApp stage updates (received, diagnosis, in repair, quality check, ready for hand-back, delivered). Point customers to the repair-status page or WhatsApp; never claim a specific stage is complete.",
    "- " + SITE.addressVerified + ": " + SITE.address + ". Google reviews: " + SITE.gmbUrl + ".",
    "- Front Glass Restoration is a separate service from Front Display Replacement. Published glass-only prices run from ₹" + GLASS_PRICE_MIN.toLocaleString("en-IN") + " to ₹" + GLASS_PRICE_MAX.toLocaleString("en-IN") + " by model, with a " + GLASS_WARRANTY_MONTHS + "-month hardware warranty. Eligibility is confirmed on inspection; if the OLED or touch layer itself is damaged, recommend full display replacement instead.",
    "- Glass restoration machinery, named verbatim: TBK OCA Laminating Vacuum Compressed Hydraulic Press; TBK 90-Litre High-Pressure Bubble Remover Chamber; TBK-958 Cold UV Purple Laser. Explain the process, but never claim a machine was used on a specific device unless the repair is front-glass restoration.",
    "- Store hours are 10 AM – 12 AM midnight, all seven days. Customer assistance and doorstep pickup run 24/7.",
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
    "- Board-level storage IC repair starts at ₹2,999 with free assessment; a data outcome is never promised.",
    "- Front-glass entries in the retrieved knowledge are fixed published prices. Quote them exactly, say the price is for glass-only restoration, and confirm eligibility on inspection. Never confuse front glass with back glass or with a full display replacement.",
    "- If a customer explicitly asks for the overall iPhone price range, state ₹1,200 to ₹36,400, then ask for the exact model and fault. Do not present this as a quote.",
    "",
    "RETRIEVED PRICE MATRIX (INR):",
    "Use only the exact model + repair entries included in the retrieved knowledge below. If no matching entry is retrieved, quote only after free diagnosis.",
    "",
    "RETRIEVED WEBSITE KNOWLEDGE (relevant FAQ and service details):",
    "Approved policy chunks take precedence over general FAQ or marketing descriptions if they conflict.",
    retrieveKnowledge(query) || "No additional matching FAQ or service entry; use only the verified shop facts above.",
    "",
    "TURNAROUND:",
    "- Display, back glass and battery: usually same day, approximately 45–60 minutes.",
    "- Front glass restoration: same day after the eligibility check.",
    "- Charging port and camera: approximately 60 minutes.",
    "- Board-level / motherboard work: 2–3 days.",
    "- Water-damage assessment and treatment: approximately 24–48 hours; never promise recovery.",
    "- Board-level storage IC repair: approximately 1–2 days; never promise a data outcome.",
    "- iPad screens: approximately 1–3 days.",
    "- If timing is not listed or depends on parts, say the technician confirms it after diagnosis.",
    "",
    "SAFETY, PRIVACY AND COMPLIANCE:",
    "- Never ask for or accept a device passcode, Apple ID/password, OTP, UPI PIN, card number or other account credentials. Tell customers not to share them.",
    "- Never promise that data will be recovered or that water-damaged devices will work. Offer a free assessment first.",
    "- For water damage, advise: do not charge the device and do not apply heat; arrange assessment promptly.",
    "- Never circumvent iCloud Activation Lock. Refuse briefly and offer owner-verified factory restore assistance only with proof of ownership.",
    "- Describe parts as OEM-grade or verified-grade only. Never describe an OEM-grade part as Apple-sourced.",
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
    "Never say you crawled a website or read a file. You have the shop facts and approved pricing matrix supplied in this instruction.",
    inferIntent(query)
  ].join("\n");
}

function localAnswer(message: string): string {
  const lower = message.toLowerCase();
  const model = Object.keys(PRICES)
    .sort((a, b) => b.length - a.length)
    .find((m) => lower.includes(m.toLowerCase()));
  if (model && PRICES[model]["Front Glass Restoration"]) {
    const [min, max] = PRICES[model]["Front Glass Restoration"];
    const price = min === max ? inr(min) : `${inr(min)} – ${inr(max)}`;
    return `${model} front-glass restoration (we keep your original OLED) is ${price} with our 6 Months written CRM warranty. Glass is restored on our TBK OCA press at the Halasuru studio, usually the same day. Would you like a walk-in slot or free 24/7 doorstep pickup?`;
  }
  // Exact grounded prices for other common intents (no hallucination, from PRICES).
  const issueRows: Array<[string[], string]> = [
    [["back glass", "backglass", "rear glass"], "Back Glass Replacement"],
    [["battery"], "Battery Replacement"],
    [["camera"], "Camera Repair"],
    [["charging port", "charging", "port"], "Charging Port / Flex"],
  ];
  for (const [keys, row] of issueRows) {
    if (model && PRICES[model]?.[row]) {
      const [lo, hi] = PRICES[model][row];
      const p = lo === hi ? inr(lo) : `${inr(lo)} – ${inr(hi)}`;
      if (keys.some((k) => lower.includes(k))) {
        return `${model} ${row.toLowerCase()} is ${p}. We quote a fixed price after a free bench inspection and back it with our 6 Months written CRM warranty. Would you like a Halasuru walk-in slot or 24/7 pickup?`;
      }
    }
  }
  if (lower.includes("motherboard") || lower.includes("board") || lower.includes("ic ") || lower.includes("water")) {
    return "Board-level and water-damage work starts with a free microscope diagnosis. Typical motherboard / IC repair is ₹10,500 – ₹14,500 depending on the fault; we never promise a data outcome. Motherboard work is excluded from the standard 6 Months warranty, which we explain on your CRM invoice.";
  }
  if (lower.includes("warranty")) {
    return "Every standard repair carries a 6 Months written CRM warranty — displays, front glass, batteries and most board work are quoted on the invoice. Motherboard repairs are the only exclusion. Your invoice is the warranty record; just bring it back within 6 Months.";
  }
  if (lower.includes("pickup") || lower.includes("doorstep") || lower.includes("24")) {
    return `We offer 24/7 insured doorstep pickup across Bengaluru with zero-password privacy — free for repairs above ₹2,999. The Halasuru bench is open 10 AM – 12 AM, all 7 days. Share your device and fault and we will arrange a slot.`;
  }
  if (lower.includes("address") || lower.includes("location") || lower.includes("visit") || lower.includes("halasuru")) {
    return `You will find us at ${SITE.address} — ${SITE.addressVerified}. We are open 10 AM – 12 AM, all 7 days, one minute from Halasuru Metro. Rated 4.9 from ${SITE.ratingCount} Google reviews.`;
  }
  return `At ${SITE.name} we repair iPhone, iPad, Apple Watch, AirPods and MacBook — including front-glass restoration that keeps your original OLED. We are independent (not Apple-authorised), give a fixed written CRM quote and a 6 Months warranty, and offer 24/7 pickup (free above ₹2,999). Tell me the exact device and fault and I will guide you to a price.`;
}

function localResponse(message: string, reason: string): Response {
  return new Response(localAnswer(message), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Concierge-Fallback": "local",
      "X-Concierge-Source": "local",
      "X-Concierge-Reason": reason,
    },
  });
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
/* Keep generation settings minimal and compatible across the current Flash family.
   Gemini 3.x accepts thinkingLevel; 2.5 uses thinkingBudget. If a model rejects
   an optional setting, retry once with only maxOutputTokens. */
function generationConfigFor(model: string, minimal = false): Record<string, unknown> {
  if (minimal) return { maxOutputTokens: 800 };
  const config: Record<string, unknown> = { maxOutputTokens: 800 };
  if (/gemini-3\./.test(model)) config.thinkingConfig = { thinkingLevel: "low" };
  else if (/gemini-2\.5/.test(model)) config.thinkingConfig = { thinkingBudget: 256 };
  return config;
}

function buildPayload(message: string, history: Turn[], model: string, minimal = false) {
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
    generationConfig: generationConfigFor(model, minimal)
  };
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "concierge", 18, 60_000);
  if (limited) return limited;
  const keys = resolveKeys();
  // No configured key is a normal local-answer path, not a server error.
  if (!keys.length) {
    const fallbackMessage = await request.json().then((b: { message?: unknown }) => String(b.message || "")).catch(() => "");
    return localResponse(fallbackMessage, "no_api_key");
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400, headers: { "X-Concierge-Source": "unavailable" } });
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 800) : "";
  if (!message) return NextResponse.json({ ok: false, reason: "empty_message" }, { status: 400, headers: { "X-Concierge-Source": "unavailable" } });

  const history: Turn[] = Array.isArray(body.history)
    ? body.history.slice(-8).filter((item): item is Turn =>
        Boolean(item) &&
        typeof item === "object" &&
        ((item as Turn).role === "user" || (item as Turn).role === "model") &&
        typeof (item as Turn).text === "string"
      )
    : [];

  const attempts: Array<{ model: string; status: number; code: string }> = [];
  let selected: { response: Response; model: string } | null = null;

  // Try the primary model with the canonical key, one alternate key, then each
  // fallback model. A 404 (unknown model) always moves to the next model.
  // A 400 caused by an optional generationConfig field is retried once with a
  // minimal config; a still-malformed request stops the chain.
  const plan = MODELS.flatMap((model, index) => [
    { model, key: keys[0] },
    ...(keys[1] && index === 0 ? [{ model, key: keys[1] }] : []),
  ]);

  for (const attempt of plan) {
    const previousFailure = attempts[attempts.length - 1];
    if (previousFailure && (previousFailure.status === 429 || previousFailure.status === 503)) {
      const backoffMs = Math.min(250 * 2 ** attempts.length, 750);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
    let result = await callGemini(attempt.model, attempt.key, buildPayload(message, history, attempt.model));
    if (!result.ok && result.status === 400) {
      result = await callGemini(attempt.model, attempt.key, buildPayload(message, history, attempt.model, true));
    }
    if (result.ok) {
      selected = { response: result.response, model: result.model };
      break;
    }
    attempts.push({ model: attempt.model, status: result.status, code: result.code });
    // Log status and model name only — never a key or a provider message.
    console.warn("[concierge] provider fallback", {
      model: attempt.model,
      status: result.status,
      code: result.code,
    });
    if (result.status === 400) break;
  }

  if (selected) {
    return new Response(textStream(selected.response), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
        "X-AI-Model": selected.model,
        "X-Concierge-Source": "gemini"
      }
    });
  }

  // A quota outage is not a customer-facing error: answer from the verified
  // local knowledge base with HTTP 200 so the chat never shows "unavailable".
  return localResponse(message, "provider_unavailable");
}

export async function GET() {
  const keys = resolveKeys();
  return NextResponse.json({
    ok: true,
    configured: keys.length > 0,
    configuredKeySlots: keys.length,
    source: keys.length > 0 ? "gemini" : "unavailable",
    reason: keys.length > 0 ? "ready" : "no_api_key — set GEMINI_API_KEY (aliases accepted)",
    keyNamesAccepted: KEY_NAMES,
    primaryModel: MODELS[0],
    fallbackModels: MODELS.slice(1),
    streaming: true,
    retrieval: "local-keyword-rag",
    knowledgeDocuments: KNOWLEDGE_BASE.length + FAQS.length + SERVICES.length + DEVICE_FAMILIES.length + Object.values(PRICES).reduce((total, row) => total + Object.keys(row).length, 0),
    models: MODELS
  }, { headers: { "Cache-Control": "no-store", "X-Concierge-Source": keys.length > 0 ? "gemini" : "unavailable" } });
}