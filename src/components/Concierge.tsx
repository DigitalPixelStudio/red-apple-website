"use client";
import { useEffect, useRef, useState } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";
import { PRICES, getPrice, priceLabel } from "@/lib/pricing";

type Msg = { from: "user" | "bot"; text: string; chips?: string[] };
const CHAT_MEMORY_KEY = "redapple-pixel-ai-history-v1";

/* Pull a model name out of free text, then answer with the real table price. */
const MODEL_HINTS = Object.keys(PRICES).sort((a, b) => b.length - a.length);

const REPAIR_HINTS: [RegExp, string][] = [
  [/water|liquid|paani|geela|dropped in/i, "Water Damage Revival"],
  [/data recover|recover photos|photos|contacts|backup|dead phone data/i, "Data Recovery"],
  [/back ?glass|backside|back side|back panel|rear glass|rear panel|back cover/i, "Back Glass Replacement"],
  [/screen|display|toot|tut|broken glass|cracked|black screen|green line|touch not working|lcd|oled/i, "Front Display Replacement"],
  [/battery|batter|charge not lasting|discharge|drain|health/i, "Battery Replacement"],
  [/camera|lens|blurry|focus|ois/i, "Camera Repair"],
  [/charging port|not charging|charging|port|flex|lightning|usb.?c/i, "Charging Port / Flex"],
  [/speaker|mic|haptic|sound|earpiece/i, "Speaker / Mic / Haptics"],
  [/motherboard|logic board|\bboard\b|\bic\b|chip/i, "Motherboard / IC Repair"],
  [/software|ios|update|boot loop|firmware/i, "Software / iOS Issue"],
  [/unlock|activation lock|icloud/i, "Unlocking (lawful)"],
  [/dent|body|frame|housing/i, "Dent / Body / Frame Repair"],
];

/** Deterministic price lookup: the spreadsheet-backed matrix is the sole source. */
const TURNAROUND_HINTS: Record<string, string> = {
  "Front Display Replacement": "about 45–60 minutes",
  "Back Glass Replacement": "about 60 minutes",
  "Battery Replacement": "about 30–45 minutes",
  "Camera Repair": "about 60 minutes",
  "Charging Port / Flex": "about 60 minutes",
  "Speaker / Mic / Haptics": "about 45–60 minutes",
  "Motherboard / IC Repair": "2–3 days",
  "Water Damage Revival": "24–48 hours",
  "Software / iOS Issue": "about 2 hours",
  "Data Recovery": "1–2 days",
  "Dent / Body / Frame Repair": "1–2 days",
  "Other / Not sure": "confirmed after diagnosis",
};

/** Deterministic price lookup: the spreadsheet-backed matrix is the sole source. */
function priceAnswer(text: string): string | null {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const model = MODEL_HINTS.find((candidate) => {
    const key = candidate.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return (" " + normalized + " ").includes(" " + key + " ");
  }) ?? (/\biphone\s*17\s*(?:air|slim)\b/i.test(text) ? "iPhone 17 Slim/Air" : null)
     ?? (/\biphone\s*se\s*(?:3rd|third)\s*(?:gen|generation)\b/i.test(text) ? "iPhone SE (3rd G)" : null)
     ?? (/\biphone\s*se\s*(?:2nd|second)\s*(?:gen|generation)\b/i.test(text) ? "iPhone SE (2nd G)" : null);
  const repair = REPAIR_HINTS.find(([pattern]) => pattern.test(text))?.[1];

  if (!model && repair) {
    const unlisted = text.match(/\biphone\s*(5s|5c|5|4s|4)\b/i);
    if (unlisted) return "iPhone " + unlisted[1] + " — " + repair + " is not listed in the approved price matrix. We can quote it after a free diagnosis.";
    if (repair === "Data Recovery") return "Data recovery starts at ₹2,999 and the assessment is free. Recovery is not guaranteed; the technician checks whether the data is reachable before any work.";
    if (repair === "Motherboard / IC Repair") return "Board-level work is quoted after a free diagnosis. Which exact device and model is it?";
    if (repair === "Front Display Replacement" && !/ipad|apple watch|airpods|macbook|ipod/i.test(text)) {
      return "Which iPhone model is it? Published iPhone display prices range from ₹1,200 to ₹36,400; I'll check the exact matrix entry once I have the model.";
    }
    return "Which exact device and model is it? I'll check the approved price matrix rather than guess.";
  }
  if (!model || !repair) return null;

  if (repair === "Water Damage Revival") {
    return "Water damage needs a free assessment first, and we cannot promise a recovery outcome. Please do not charge the device or apply heat. Typical assessment and treatment time is 24–48 hours.";
  }
  if (repair === "Data Recovery") {
    return "Data recovery starts at ₹2,999 and the assessment is free. Recovery is not guaranteed; the technician checks whether the data is reachable before any work. Typical turnaround is 1–2 days.";
  }

  const price = getPrice(model, repair);
  if (!price) return model + " — " + repair + " is quoted after a free diagnosis because it is not listed in the approved price matrix.";

  const quote = priceLabel(price);
  const priceText = price[0] === price[1]
    ? model + " " + repair.toLowerCase() + ": " + quote + ". This is the listed price."
    : model + " " + repair.toLowerCase() + ": " + quote + ". The exact part grade/revision is confirmed during free diagnosis.";
  const turnaround = TURNAROUND_HINTS[repair] ? " Typical turnaround: " + TURNAROUND_HINTS[repair] + "." : "";
  return priceText + turnaround + " The repair carries a 90-day service warranty. Would you like to arrange a visit or doorstep pickup?";
}

/* Typed input is matched through this synonym table, so "display kharab hai"
   or "kitna paisa lagega" resolve to the right topic instead of falling back to
   the menu. Order matters: the first hit wins. */
/* Triggered ONLY by a direct question about who built this assistant or the
   site. It never volunteers the studio or the number — the client's customers
   are here for a repair, not a sales pitch. */
const BUILDER_TRIGGERS = [
  "who made you", "who built you", "who created you", "who developed you",
  "who designed this", "who built this site", "who made this website",
  "who built this website", "who is your developer", "kisne banaya",
  "kisne banai", "who are you built by", "your developer", "your creator",
  "which company made this", "who coded this",
];

function builderAnswer(text: string): string | null {
  const t = text.toLowerCase().replace(/\s+/g, " ");
  if (!BUILDER_TRIGGERS.some((k) => t.includes(k))) return null;
  return "I was built by Pixel Forge Studio, the team behind this website. They build sites, CRMs and apps — you can reach them on WhatsApp at 96200 24812. Red Apple's repairs themselves are done by their own technicians, not by Pixel Forge.";
}

const SYNONYMS: Record<string, string[]> = {
  about: ["about you", "about the shop", "who are you", "how long have", "experience", "since when", "history", "9 years", "nine years", "trust", "legit", "genuine shop"],
  store: ["address", "where are you", "location", "kahan", "shop", "store", "directions", "map", "reach", "metro", "halasuru", "mg road"],
  timing: ["how long", "how much time", "duration", "kitna time", "wait", "same day", "turnaround", "how many days"],
  payment: ["payment", "pay", "upi", "card", "cash", "advance", "paise kaise", "how to pay", "refund"],
  quality: ["quality", "original", "genuine", "oem", "fake", "duplicate", "test", "check", "passcode", "data safe", "private"],
  booking: ["book", "booking", "appointment", "slot", "walk in", "walk-in", "reserve", "time book"],
  screen: ["screen", "display", "glass", "crack", "cracked", "toot", "toota", "tooti", "tuta", "tuti", "fut", "touch", "lcd", "oled", "dead pixel", "lines"],
  backglass: ["back glass", "backglass", "rear", "back panel", "back cover"],
  battery: ["battery", "batter", "charge", "charging", "drain", "draining", "heating", "hot", "battery health", "swell", "swollen"],
  camera: ["camera", "lens", "photo", "blurry", "focus", "ois", "flash"],
  water: ["water", "liquid", "wet", "rain", "spill", "paani", "geela", "soaked"],
  data: ["data", "photos", "recover", "recovery", "backup", "contacts", "deleted", "lost data"],
  device: ["device & repair", "what do you repair", "which devices", "do you fix"],
  iphone: ["iphone", "apple phone"],
  ipad: ["ipad", "tablet"],
  watch: ["watch", "iwatch", "ultra"],
  airpods: ["airpod", "airpods", "earbud", "earphone", "pods"],
  macbook: ["macbook", "mac book", "laptop", "imac", "mac mini", "mac studio", "mac"],
  estimate: ["send my model", "price", "pricing", "cost", "quote", "estimate", "how much", "kitna", "kitne", "paisa", "rate", "charges", "paise"],
  /* superseded by the richer `store` topic — kept empty so scoring never splits */
  location: [],
  pickup: ["pickup", "pick up", "doorstep", "home", "collect", "drop", "delivery"],
  warranty: ["warranty", "guarantee", "guaranty", "warrenty", "full policy", "policy"],
  invoice: ["invoice", "bill", "gst", "receipt", "crm", "record", "job card", "jobcard", "after handover", "what happens after"],
  diagnosis: ["diagnosis", "diagnose", "check", "inspect", "assessment", "estimate first"],
  notrepaired: ["not repairable", "cannot fix", "cant fix", "unrepairable", "worse", "damage your"],
  parts: ["genuine", "oem", "original", "copy", "aftermarket", "quality of part", "which part"],
  privacy: ["privacy", "passcode", "password", "data safe", "my data", "apple id", "otp", "wipe"],
  corporate: ["corporate", "bulk", "company", "office", "school", "multiple devices", "reseller"],
  insurance: ["insurance", "claim", "insurer", "damage report"],
  whyexpensive: ["expensive", "costly", "cheaper", "price match", "too much", "why so much"],
  human: ["human", "person", "technician", "talk", "call", "speak", "agent", "staff", "baat", "insaan"],
};

/* Best topic for a typed sentence. Scores by how many keywords hit. */
function resolve(text: string): string | null {
  const t = ` ${text.toLowerCase()} `;
  let best: string | null = null;
  let bestScore = 0;
  for (const [topic, words] of Object.entries(SYNONYMS)) {
    let score = 0;
    for (const w of words) if (t.includes(w)) score += w.length > 5 ? 2 : 1;
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  return bestScore >= 1 ? best : null;
}


const MENU: Record<string, { reply: string; chips: string[] }> = {
  start: {
    reply:
      "Hi, I'm Pixel Ai — Red Apple's repair assistant. I can give you a real answer on price, timing or warranty, or put you straight through to a technician. What's going on with your device?",
    chips: ["iPhone screen", "Battery", "Back glass", "Price list", "Doorstep pickup", "Talk to a technician"],
  },
  about: {
    reply:
      "Red Apple Mobile Repair has been on Mahatma Gandhi Road, Halasuru since 2017 — nine years, same shop, same bench. We are an independent Apple specialist, not affiliated with Apple Inc. We do component-level micro-soldering, OEM-grade displays, and back-glass laser work. Open 10:00 AM to 12:00 AM, all seven days. Rating is 4.9 from 905 Google reviews.",
    chips: ["Price list", "Visit the store", "Talk to a technician"],
  },
  store: {
    reply:
      "We are at No. 1, Mahatma Gandhi Road, opposite Bhadra Landmark, Halasuru, Bengaluru 560008 — one minute from Halasuru Metro, Metro Pillar 125. The workshop has glass walls so you can watch your repair. Open 10:00 AM – 12:00 AM, every day. Walk-ins welcome, no appointment needed.",
    chips: ["Open in Maps", "Book doorstep pickup", "Talk to a technician"],
  },
  timing: {
    reply:
      "Display, back glass and battery are usually same-day, about 45–60 minutes. Charging port and camera take about an hour; board-level work takes 2–3 days, water-damage work about 24–48 hours, data recovery 1–2 days, and iPad screens 1–3 days.",
    chips: ["Price list", "Book doorstep pickup", "Talk to a technician"],
  },
  payment: {
    reply:
      "You pay after the diagnosis and the fixed quote — never before. UPI, cards and cash all work. There is no advance and no hidden charge; the number we quote is the number you pay. If the repair turns out to be impossible, you owe nothing.",
    chips: ["Price list", "Visit the store", "Talk to a technician"],
  },
  quality: {
    reply:
      "Every device goes through 32 checkpoints before hand-back — touch across the whole panel, True Tone, Face ID, front and rear cameras, all sensors, charging, speakers, and a thermal check. We do not ask for your passcode and we never wipe a device without written permission.",
    chips: ["Warranty details", "Price list", "Talk to a technician"],
  },
  booking: {
    reply:
      "Two ways. Walk in any time between 10:00 AM and 12:00 AM — no appointment needed. Or book a doorstep pickup and a rider collects the device; pickup runs 24/7 across Bengaluru and is free for repairs above ₹2,999.",
    chips: ["Book doorstep pickup", "Visit the store", "Talk to a technician"],
  },
  device: {
    reply:
      "We cover iPhone models through iPhone 18 Pro Max, plus iPad, Apple Watch, iPod, AirPods and MacBook. We handle display, battery, back glass, camera, charging, board-level work, water damage and data recovery. Which device and model do you have?",
    chips: ["iPhone", "iPad", "Apple Watch", "AirPods", "MacBook", "Talk to a technician"],
  },
  iphone: {
    reply:
      "We repair iPhone models from iPhone 6 through iPhone 18 Pro Max. Prices depend on the exact model and repair; tell me both and I'll check the approved price matrix rather than guess.",
    chips: ["Screen price", "Battery price", "Back glass price", "Water damage", "Talk to a technician"],
  },
  screen: {
    reply:
      "We offer OEM-grade display replacement. The exact price depends on the model and is quoted from the approved price matrix; if a combination is not listed, diagnosis is free and the technician will confirm the quote. Which iPhone model is it?",
    chips: ["iPhone 16 Pro Max", "iPhone 15", "iPhone 14", "iPhone 13", "Talk to a technician"],
  },
  backglass: {
    reply:
      "Back-glass replacement is available for supported models and usually takes about 45–60 minutes. The exact price depends on your model; tell me which iPhone you have and I'll check the approved price matrix.",
    chips: ["Get exact price", "Book doorstep pickup", "Talk to a technician"],
  },
  battery: {
    reply:
      "Battery replacement usually takes about 30–45 minutes. The exact price depends on your model; battery repairs carry a 90-day service warranty plus the stated 6-month battery health cover. Which model do you have?",
    chips: ["Get exact price", "Book doorstep pickup", "Talk to a technician"],
  },
  camera: {
    reply:
      "We assess front and rear camera faults, including focus and stabilisation issues. Turnaround is usually about an hour; the price depends on the exact model and fault. Which device do you have?",
    chips: ["Get exact price", "Talk to a technician"],
  },
  water: {
    reply:
      "Water damage is time-critical. Don't charge it and don't try to dry it with heat — bring it in or book a pickup now. We do ultrasonic cleaning plus chip-level corrosion treatment, and we'll tell you honestly if it's recoverable before you pay.",
    chips: ["Book pickup now", "Call the store", "Talk to a technician"],
  },
  data: {
    reply:
      "We recover photos, chats and contacts from damaged or dead devices — logical and board-level. Your data is never wiped without written permission from you. Assessment is free; recovery starts at ₹2,999.",
    chips: ["Get a quote", "Talk to a technician"],
  },
  ipad: {
    reply:
      "We repair iPad Pro, Air and mini models, including display, battery, charging and housing issues. Screen repairs usually take 1–3 days; the exact price depends on the iPad model and repair.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  watch: {
    reply:
      "We repair supported Apple Watch Ultra, Series and SE models, including screens, batteries and housing issues. Tell me the exact model and repair so I can check the approved price matrix.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  airpods: {
    reply:
      "We assess AirPods battery, charging-case, speaker and microphone faults. Pricing is confirmed at the counter after checking the exact model and issue.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  macbook: {
    reply:
      "We assess MacBook Pro and Air, Mac mini, iMac and Mac Studio faults. MacBook repairs are quoted after a free diagnosis; board-level work generally takes 2–3 days.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  estimate: {
    reply:
      "Published iPhone repair prices range from ₹1,200 to ₹36,400 depending on the model and repair. That is not a quote: send your exact model and fault and I'll check the approved matrix; anything not listed is quoted after a free diagnosis.",
    chips: ["Send my model", "Talk to a technician"],
  },
  location: {
    reply:
      "No. 1, Mahatma Gandhi Road, opposite Bhadra Landmark, Halasuru, Bengaluru 560008 — one minute from Halasuru Metro. Open 10:00 AM to 12:00 AM, all seven days. Walk-ins welcome, no appointment needed.",
    chips: ["Open in Maps", "Call the store", "Book doorstep pickup"],
  },
  pickup: {
    reply:
      "Doorstep pickup runs 24/7 across Bengaluru — any hour, any day. A rider collects the device, we repair it, and it comes back tested. Free for repairs above ₹2,999. Book it and you'll get a WhatsApp confirmation with the rider's details.",
    chips: ["Book pickup", "Talk to a technician"],
  },
  warranty: {
    reply:
      "90 days on every repair. Battery and display also carry 6 months of health cover — if battery health drops below 80% or the panel develops a non-impact fault, we replace it once free. Damage from a new drop or liquid isn't covered.",
    chips: ["Read the full policy", "Talk to a technician"],
  },
  invoice: {
    reply:
      "Every repair is a job card in our CRM, not a note on a pad. Parts fitted, technician notes and status changes are logged against your job number — and the GST invoice is generated from that record, then sent to you on WhatsApp. Need it in your company's name? Give us the GSTIN at booking and we'll issue it that way.",
    chips: ["What happens after handover?", "Price list", "Talk to a technician"],
  },
  diagnosis: {
    reply:
      "Diagnosis is free and it comes first. We open the device, find the actual fault, and give you one fixed number. You approve it before anything is charged. If it turns out not to be repairable, you owe nothing and we tell you why.",
    chips: ["Price list", "Book doorstep pickup", "Talk to a technician"],
  },
  notrepaired: {
    reply:
      "If we can't fix it, you pay nothing — we tell you before you commit, not after. If a repair we did makes something worse, we put it right at our cost. That has never been refused.",
    chips: ["Warranty details", "Talk to a technician"],
  },
  parts: {
    reply:
      "We use OEM-grade or genuine-grade parts and tell you the part grade before work begins. We are an independent repair workshop, not an Apple Authorised Service Provider, and we never describe an OEM-grade part as a genuine Apple part.",
    chips: ["Warranty details", "Price list", "Talk to a technician"],
  },
  privacy: {
    reply:
      "We never ask for your passcode, Apple ID, OTP, UPI PIN or card details. Repairs are performed at component level; if a repair ever requires a data wipe, we explain it first and obtain your written permission.",
    chips: ["Talk to a technician", "Visit the store"],
  },
  corporate: {
    reply:
      "Bulk enquiries for five or more devices are handled by the owner with a custom written quote. Share the device list and a technician will arrange the next step.",
    chips: ["Talk to a technician", "Price list"],
  },
  insurance: {
    reply:
      "We supply the itemised GST invoice and a written damage report, which is what an insurance claim actually needs. We don't file the claim for you, but we'll give you everything the insurer asks for.",
    chips: ["Talk to a technician", "Price list"],
  },
  whyexpensive: {
    reply:
      "I understand. The price reflects the part grade, labour and 90-day warranty. If your budget is lower, a technician can check whether another safe part grade is available; we never discount below the published minimum.",
    chips: ["Warranty details", "Price list", "Talk to a technician"],
  },
  human: {
    reply:
      "I can open WhatsApp with a summary of this conversation so a Red Apple technician can take over. I won't claim a handoff is complete until the team responds.",
    chips: [],
  },
};

export default function Concierge() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: MENU.start.reply, chips: MENU.start.chips },
  ]);
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [failedTurns, setFailedTurns] = useState(0);
  const [memoryReady, setMemoryReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!memoryReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(CHAT_MEMORY_KEY, JSON.stringify(msgs.slice(-30)));
      } catch {
        // Storage quotas and private browsing are non-fatal.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [msgs, memoryReady]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" }); }, [msgs]);

  const [draft, setDraft] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t || typing || streaming) return;
    setDraft("");
    send(t);
  };

  /**
   * send() tries the real AI first and falls back to the local rule engine.
   *
   * Order matters:
   *   1. Gemini via /api/concierge — real conversation, any language, knows the
   *      whole price table. This is the normal path.
   *   2. If the key is missing, the call fails, or it times out, we drop to the
   *      deterministic resolver below. The widget never goes silent.
   *
   * The "who built you" and price-answer helpers stay in front of the network
   * call because they are instant and 100% accurate — no point spending a
   * round trip on a fact we already know.
   */
  const send = async (text: string) => {
    if (stopped || typing || streaming) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setTyping(true);

    const push = (reply: string, chips: string[] = []) => {
      setMsgs((m) => [...m, { from: "bot", text: reply, chips }]);
      setTyping(false);
      setStreaming(false);
    };

    const lowerText = text.toLowerCase().trim();
    if (/^(stop|unsubscribe|opt out|opt-out)$/i.test(lowerText)) {
      setStopped(true);
      push("Understood. I won't send any further replies in this chat.");
      return;
    }

    const handoffNow = (reason: string) => {
      const transcript = [...msgs.slice(-8), { from: "user" as const, text }]
        .map((item) => (item.from === "user" ? "Customer: " : "Pixel Ai: ") + item.text)
        .join("\n");
      const message = "REDAPPLE-HANDOFF\nReason: " + reason + "\nPlease have a technician review this conversation.\n\n" + transcript;
      window.open(wa(message), "_blank", "noopener,noreferrer");
      track("whatsapp_click", { source: "concierge", chip: "human_handoff" });
      push("I'm sorry this needs a person. I've opened WhatsApp with your conversation summary so the Red Apple team can take over.", []);
    };

    if (/\b(bulk|b2b)\b|\b(?:5|6|7|8|9|10|five|six|seven|eight|nine|ten)\+?\s*(?:devices|phones|iphones|macbooks)\b/i.test(text)) {
      handoffNow("Bulk/B2B enquiry for owner quote");
      return;
    }
    if (/(discount|cheaper|price match|negotiate|lower.*price|price.*lower|cash.*less)/i.test(text)) {
      handoffNow("Price negotiation; technician to check safe part-grade options");
      return;
    }
    if (/(refund|legal action|lawyer|complaint|second time|terrible|damaged by (you|the repair)|you damaged)/i.test(text)) {
      handoffNow("Customer complaint / refund / damage escalation");
      return;
    }
    if (/(icloud|activation lock).*(bypass|unlock)|(bypass|unlock).*(icloud|activation lock)/i.test(text)) {
      push("We cannot bypass iCloud Activation Lock. If this is a carrier/network lock, a technician can explain the lawful option with proof of ownership.", ["Talk to a technician"]);
      return;
    }
    if (/(talk to (a )?(human|person|technician)|speak to (a )?(human|person|technician)|call me|agent|staff)/i.test(text)) {
      handoffNow("Customer requested a human technician");
      return;
    }
    if (/(water|liquid|paani|geela)/i.test(text)) {
      push("Please do not charge the device or use heat to dry it. Water damage needs a free assessment first; recovery cannot be promised. Would you prefer a walk-in assessment or doorstep pickup?", ["Book doorstep pickup", "Talk to a technician"]);
      return;
    }

    // instant, deterministic answers first
    const built = builderAnswer(text);
    if (built) { setTimeout(() => push(built), 420); return; }

    const priced = priceAnswer(text);
    if (priced) {
      setTimeout(() => push(priced, ["Book doorstep pickup", "Talk to a technician"]), 420);
      return;
    }

    // ---- real AI ----
    let streamedReply = "";
    try {
      const history = msgs
        .filter((m) => m.text)
        .slice(-8)
        .map((m) => ({ role: m.from === "user" ? ("user" as const) : ("model" as const), text: m.text }));

      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
        signal: AbortSignal.timeout(27000),
        cache: "no-store",
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let inserted = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (!chunk) continue;
          streamedReply += chunk;

          if (!inserted) {
            inserted = true;
            setTyping(false);
            setStreaming(true);
            setMsgs((m) => [...m, { from: "bot", text: chunk, chips: [] }]);
          } else {
            setMsgs((m) => {
              const next = [...m];
              const last = next[next.length - 1];
              if (last?.from === "bot") {
                next[next.length - 1] = { ...last, text: last.text + chunk };
              }
              return next;
            });
          }
        }

        const tail = decoder.decode();
        if (tail) {
          streamedReply += tail;
          setMsgs((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last?.from === "bot") {
              next[next.length - 1] = { ...last, text: last.text + tail };
            }
            return next;
          });
        }

        if (streamedReply.trim()) {
          track("ai_chat_message", { source: "gemini_stream" });
          setMsgs((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last?.from === "bot") {
              next[next.length - 1] = {
                ...last,
                chips: ["Price list", "Book doorstep pickup", "Talk to a technician"]
              };
            }
            return next;
          });
          setTyping(false);
          setStreaming(false);
          return;
        }
      }
    } catch {
      if (typeof streamedReply !== "undefined" && streamedReply.trim()) {
        push("My reply was interrupted while connecting. Please try once more, or choose WhatsApp to continue with a technician.", ["Talk to a technician"]);
        return;
      }
      // fall through to the rule engine — never surface a network error to a customer
    }

    // ---- fallback: local resolver ----
    const lower = text.toLowerCase();
    let resolved = "start";
    for (const k of Object.keys(MENU)) { if (lower.includes(k)) { resolved = k; break; } }
    const syn = resolve(text);
    if (syn && MENU[syn]) resolved = syn;

    if (resolved === "start" && text.trim().split(/\s+/).length > 2) {
      const nextFailedTurn = failedTurns + 1;
      setFailedTurns(nextFailedTurn);
      if (nextFailedTurn >= 3) {
        handoffNow("Three consecutive unclear customer messages");
        return;
      }
      const clarification = nextFailedTurn === 1
        ? "I want to get that right. Which device and model are you asking about?"
        : "Is the issue with the screen, battery, charging, or something else?";
      setTimeout(() => push(clarification, ["Screen", "Battery", "Charging", "Talk to a technician"]), 300);
      return;
    }

    setFailedTurns(0);
    const entry = MENU[resolved];
    setTimeout(() => push(entry.reply, entry.chips), 300);
  };

  const chipAction = (chip: string) => {
    if (chip.includes("WhatsApp") || chip.includes("estimate") || chip.includes("quote") || /pickup/i.test(chip) || /technician|human|agent/i.test(chip)) {
      const isHuman = /technician|human|agent/i.test(chip);
      const transcript = msgs.slice(-8).map((item) =>
        (item.from === "user" ? "Customer: " : "Pixel Ai: ") + item.text
      ).join("\n");
      const msg = isHuman
        ? "REDAPPLE-HANDOFF\nCustomer requests a technician. Please review this chat:\n\n" + transcript
        : chip.includes("estimate") || chip.includes("quote")
          ? "Hi Red Apple Mobile Repair Store! I'd like an estimate for my Apple device."
          : chip.toLowerCase().includes("pickup")
            ? "Hi! I'd like to arrange doorstep pickup for my Apple device. Please confirm availability."
            : chip.includes("Emergency")
              ? "URGENT: My Apple device has water damage. Please advise on a free assessment."
              : "Hi Red Apple Mobile Repair Store! I need help with my Apple device.";
      window.open(wa(msg), "_blank", "noopener,noreferrer");
      track("whatsapp_click", { source: "concierge", chip });
      setMsgs((m) => [...m, { from: "user", text: chip }, { from: "bot", text: "Opening WhatsApp in a new tab — our team usually replies within minutes.", chips: [] }]);
      return;
    }
    if (chip.includes("Maps")) { window.open(SITE.mapsUrl, "_blank", "noopener,noreferrer"); track("map_click", { source: "concierge" }); setMsgs((m) => [...m, { from: "user", text: chip }]); return; }
    if (chip.includes("Call")) { window.open(SITE.phoneHref, "_self"); track("call_click", { source: "concierge" }); return; }
    if (chip.includes("Maps")) { window.open(SITE.mapsUrl, "_blank", "noopener,noreferrer"); track("map_click", { source: "concierge" }); setMsgs((m) => [...m, { from: "user", text: chip }]); return; }
    if (chip.includes("policy")) { window.open("/refund-policy", "_blank", "noopener,noreferrer"); setMsgs((m) => [...m, { from: "user", text: chip }, { from: "bot", text: "Opened our Refund & Warranty Policy in a new tab.", chips: [] }]); return; }
    const modelMatch = chip.match(/iPhone\s+\d+[^,]*/i);
    if (modelMatch) { send(`screen price for ${modelMatch[0]}`); return; }
    send(chip.replace(/^[^\w]+/, "").trim());
  };

  const restoreMemory = () => {
    if (memoryReady) return;
    try {
      const saved = window.localStorage.getItem(CHAT_MEMORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const safe = parsed.filter((item): item is Msg =>
            item && (item.from === "user" || item.from === "bot") &&
            typeof item.text === "string"
          ).filter((item) => !item.chips || (Array.isArray(item.chips) && item.chips.every((chip) => typeof chip === "string"))).slice(-30);
          if (safe.length) setMsgs(safe);
        }
      }
    } catch {
      // Corrupt or unavailable browser storage must never stop the chat.
    }
    setMemoryReady(true);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        id="concierge-open"
        onClick={() => { if (!open) restoreMemory(); setOpen(!open); }}
        aria-label="Open Pixel Ai chat"
        className="fixed bottom-24 right-5 z-[70] grid h-14 w-14 place-items-center rounded-[var(--cta-radius)] bg-[var(--cta-dark)] text-white shadow-2xl transition-transform hover:scale-110 animate-pulse-ring md:bottom-8 md:right-8"
      >
        {open ? <LineIcon name="close" size={20} /> : <LineIcon name="bot" size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-36 right-4 z-[70] flex h-[540px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-black/[0.08] md:bottom-24 md:right-8">
          {/* Header */}
          <div className="relative flex items-center gap-3 bg-[var(--cta-dark)] px-5 py-4 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <LineIcon name="bot" size={20} />
            </span>
            <div>
              <div className="text-[14px] font-bold">Pixel Ai</div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Online · replies instantly</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <LineIcon name="close" size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--bg-alt)] px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-3xl px-4 py-3 text-[13px] leading-relaxed ${
                  m.from === "user" ? "bg-[var(--cta-dark)] text-white" : "bg-white text-[var(--text)] shadow-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-3xl bg-white px-4 py-3 shadow-sm"><span className="inline-flex gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--text-muted)] [animation-delay:240ms]" /></span></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Typed input — the visitor can ask anything, not just tap chips */}
          <form onSubmit={submit} className="flex items-center gap-2 border-t border-black/[0.07] bg-white px-3 py-2.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your problem — e.g. screen toot gayi"
              aria-label="Type your message to Pixel Ai"
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-[var(--bg-alt)] px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim() || typing || streaming}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--orange)] text-white transition-transform hover:scale-105 disabled:opacity-35"
            >
              <LineIcon name="arrow-right" size={16} color="#fff" />
            </button>
          </form>

          {/* Chips */}
          {msgs.length > 0 && msgs[msgs.length - 1].chips && msgs[msgs.length - 1].chips!.length > 0 && !typing && !streaming && (
            <div className="flex flex-wrap gap-2 border-t border-black/[0.05] bg-white px-4 py-3">
              {msgs[msgs.length - 1].chips!.map((c) => (
                <button key={c} onClick={() => chipAction(c)}
                  className="icon-pop rounded-full border border-black/10 bg-[var(--bg-alt)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--text)] hover:border-[var(--accent)]/40 hover:bg-white">
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export const startConcierge = () => track("ai_chat_started", { source: "section" });
