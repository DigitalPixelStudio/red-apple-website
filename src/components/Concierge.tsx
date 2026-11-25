"use client";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";
import { PRICES, getPrice, priceLabel } from "@/lib/pricing";
import { GLASS_PRICE_ROWS, GLASS_PRICE_MIN, GLASS_PRICE_MAX } from "@/lib/glass-pricing";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";

type Msg = { from: "user" | "bot"; text: string; chips?: string[]; images?: string[] };
type ChatImage = { name: string; mimeType: "image/jpeg"; data: string; preview: string };
const CHAT_MEMORY_KEY = "redapple-forge-ai-history-v3";
const LEARN_KEY = "redapple-forge-ai-learn-v1";

type Learned = { words: Record<string, string[]>; lastModel?: string; lastRepair?: string };

/* Pull a model name out of free text, then answer with the real table price.
   Glass-only models and spellings are included so the glass list resolves too. */
const MODEL_HINTS = Array.from(new Set([
  ...Object.keys(PRICES),
  ...GLASS_PRICE_ROWS.flatMap((row) => [row.model, ...(row.aliases ?? [])]),
])).sort((a, b) => b.length - a.length);

const REPAIR_HINTS: [RegExp, string][] = [
  [/water|liquid|paani|geela|dropped in/i, "Water Damage Revival"],
  [/data recover|recover photos|photos|contacts|backup|dead phone data/i, "Board-Level Storage IC Repair"],
  [/back ?glass|backside|back side|back panel|rear glass|rear panel|back cover/i, "Back Glass Replacement"],
  [/front ?glass|glass ?only|glass restor|outer glass|touch glass|glass repair|glass price|glass cost|cracked glass|broken glass|sirf glass|only glass/i, "Front Glass Restoration"],
  // Bare "glass" after a model ("iphone 18 pro max glass") means front glass:
  // the back-glass rule above always wins when the message says "back".
  [/\bglass\b/i, "Front Glass Restoration"],
  [/screen|display|toot|tut|broken glass|cracked|black screen|green line|touch not working|lcd|oled/i, "Front Display Replacement"],
  [/battery|batter|charge not lasting|discharge|drain|health/i, "Battery Replacement"],
  [/camera|lens|blurry|focus|ois/i, "Camera Repair"],
  [/charging port|not charging|charging|port|flex|lightning|usb.?c/i, "Charging Port / Flex"],
  [/speaker|mic|haptic|sound|earpiece/i, "Speaker / Mic / Haptics"],
  [/motherboard|logic board|\bboard\b|\bic\b|chip/i, "Motherboard / IC Repair"],
  [/software|ios|update|boot loop|firmware/i, "Software / iOS Issue"],
  [/unlock|activation lock|icloud/i, "Owner-Verified Factory Restore Assistance"],
  [/dent|body|frame|housing/i, "Dent / Body / Frame Repair"],
];

/** Deterministic price lookup: the spreadsheet-backed matrix is the sole source. */
const TURNAROUND_HINTS: Record<string, string> = {
  "Front Glass Restoration": "same day, after the eligibility check",
  "Front Display Replacement": "about 45–60 minutes",
  "Back Glass Replacement": "about 60 minutes",
  "Battery Replacement": "about 30–45 minutes",
  "Camera Repair": "about 60 minutes",
  "Charging Port / Flex": "about 60 minutes",
  "Speaker / Mic / Haptics": "about 45–60 minutes",
  "Motherboard / IC Repair": "2–3 days",
  "Water Damage Revival": "24–48 hours",
  "Software / iOS Issue": "about 2 hours",
  "Board-Level Storage IC Repair": "1–2 days",
  "Owner-Verified Factory Restore Assistance": "same day after ownership verification",
  "Dent / Body / Frame Repair": "1–2 days",
  "Other / Not sure": "confirmed after diagnosis",
};

/** Deterministic price lookup: the spreadsheet-backed matrix is the sole source. */
function readLearn(): Learned {
  try {
    const raw = window.localStorage.getItem(LEARN_KEY);
    if (!raw) return { words: {} };
    const parsed = JSON.parse(raw) as Learned;
    return parsed && typeof parsed === "object" && parsed.words ? parsed : { words: {} };
  } catch {
    return { words: {} };
  }
}

function writeLearn(next: Learned) {
  try {
    window.localStorage.setItem(LEARN_KEY, JSON.stringify(next));
  } catch {
    // Private browsing / quota — learning is a bonus, never a blocker.
  }
}

/** Resize customer photos locally before upload: max 1280px and about 900 KB each. */
async function prepareChatImage(file: File): Promise<ChatImage> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a valid image file.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Each original photo must be under 12 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This photo could not be opened. Please choose another image."));
      element.src = objectUrl;
    });
    let scale = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
    let dataUrl = "";
    for (let attempt = 0; attempt < 4; attempt++) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Photo processing is unavailable on this device.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL("image/jpeg", attempt < 2 ? 0.76 : 0.64);
      if (dataUrl.length <= 1_250_000) break;
      scale *= 0.78;
    }
    const data = dataUrl.split(",")[1] || "";
    if (!data || data.length > 1_250_000) throw new Error("This photo is too large to send. Please choose a smaller image.");
    return { name: file.name.slice(0, 80), mimeType: "image/jpeg", data, preview: dataUrl };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Learns the customer's own vocabulary for a topic.
 *
 * Only strong matches are learned (score >= 3), only words that are not already
 * in the synonym table, capped at ten per topic. The vocabulary lives in this
 * browser's localStorage — it is a genuine local adaptation, not a claim that a
 * shared model has been retrained.
 */
function learnWords(topic: string, text: string) {
  const known = new Set(
    Object.values(SYNONYMS).flat().flatMap((phrase) => phrase.toLowerCase().split(/\s+/))
  );
  const stop = new Set(["this", "that", "with", "have", "what", "when", "where", "which", "your", "mine", "please", "hello", "price", "prices", "cost", "costs"]);
  const words = (text.toLowerCase().match(/[\p{L}]{4,}/gu) ?? [])
    .filter((word) => !known.has(word) && !stop.has(word));
  if (!words.length) return;
  const learned = readLearn();
  const previous = learned.words[topic] ?? [];
  learned.words[topic] = Array.from(new Set([...previous, ...words])).slice(-10);
  writeLearn(learned);
}

/** Remembers the last device/repair so follow-ups like "and its price?" work. */
function rememberContext(text: string) {
  const explicit = MODEL_HINTS.find((candidate) => {
    const key = candidate.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return (" " + normalized + " ").includes(" " + key + " ");
  });
  const repair = REPAIR_HINTS.find(([pattern]) => pattern.test(text))?.[1];
  if (!explicit && !repair) return;
  const learned = readLearn();
  if (explicit) learned.lastModel = explicit;
  if (repair) learned.lastRepair = repair;
  writeLearn(learned);
}

/** Deterministic price lookup: the spreadsheet-backed matrix is the sole source. */
function priceAnswer(text: string): string | null {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const explicitModel = MODEL_HINTS.find((candidate) => {
    const key = candidate.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    return (" " + normalized + " ").includes(" " + key + " ");
  }) ?? (/\biphone\s*17\s*(?:air|slim)\b/i.test(text) ? "iPhone 17 Slim/Air" : null)
     ?? (/\biphone\s*se\s*(?:3rd|third)\s*(?:gen|generation)\b/i.test(text) ? "iPhone SE (3rd G)" : null)
     ?? (/\biphone\s*se\s*(?:2nd|second)\s*(?:gen|generation)\b/i.test(text) ? "iPhone SE (2nd G)" : null);
  const repair = REPAIR_HINTS.find(([pattern]) => pattern.test(text))?.[1];

  // A question about the equipment or the process is not a price question.
  // Without an explicit model, let it fall through to the machinery/glass copy.
  const asksProcess = /\b(machine|machines|machinery|equipment|tbk|oca|laser|autoclave|chamber|press)\b/i.test(text);
  const asksDefinition = /\b(what is|what are|what does|how does|how do you|explain|difference between)\b/i.test(text);
  const asksTiming = /\b(how long|how much time|turnaround|duration|how many days|kitna (time|der))\b/i.test(text);
  if (!explicitModel && (asksProcess || asksDefinition || asksTiming)) return null;

  // Follow-up context: "and its price?", "how much for that one?" after a
  // model or repair was already named. Only used when the message itself does
  // not name a repair, so an explicit question always wins.
  const followedUp = /\b(it|its|this|that|same|one|and|also)\b|^\s*(price|cost|how much)/i.test(text);
  const learned = typeof window !== "undefined" ? readLearn() : { words: {} };
  const model = explicitModel ?? (followedUp && learned.lastModel ? learned.lastModel : null);
  const repairName = repair ?? (followedUp && learned.lastRepair ? learned.lastRepair : undefined);

  if (!model && repairName) {
    const unlisted = text.match(/\biphone\s*(5s|5c|5|4s|4)\b/i);
    if (unlisted) return "iPhone " + unlisted[1] + " — " + repairName + " is not listed in the approved price matrix. We can quote it after a free diagnosis.";
    if (repairName === "Board-Level Storage IC Repair") return "Board-level storage IC work starts at ₹2,999 and the assessment is free. A data outcome is never promised; the technician checks the hardware first.";
    if (repairName === "Motherboard / IC Repair") return "Board-level work is quoted after a free diagnosis. Which exact device and model is it?";
    if (repairName === "Front Glass Restoration") {
      return "Front glass restoration on listed iPhones is ₹" + GLASS_PRICE_MIN.toLocaleString("en-IN") + " to ₹" + GLASS_PRICE_MAX.toLocaleString("en-IN") + " — the exact price depends on the model. Tell me your exact iPhone and I will check the glass list. Every glass restoration carries a 6 Months hardware warranty, and eligibility is confirmed on inspection.";
    }
    if (repairName === "Front Display Replacement" && !/ipad|apple watch|airpods|macbook|ipod/i.test(text)) {
      return "Which iPhone model is it? Published iPhone display prices range from ₹1,200 to ₹36,400; I'll check the exact matrix entry once I have the model.";
    }
    return "Which exact device and model is it? I'll check the approved price matrix rather than guess.";
  }
  if (!model || !repairName) return null;

  if (repairName === "Water Damage Revival") {
    return "Water damage needs a free assessment first, and we cannot promise a recovery outcome. Please do not charge the device or apply heat. Typical assessment and treatment time is 24–48 hours.";
  }
  if (repairName === "Board-Level Storage IC Repair") {
    return "Board-level storage IC work starts at ₹2,999 and the assessment is free. A data outcome is never promised; the technician checks the hardware first. Typical turnaround is 1–2 days.";
  }

  const price = getPrice(model, repairName);
  if (!price) return model + " — " + repairName + " is quoted after a free diagnosis because it is not listed in the approved price matrix.";

  const quote = priceLabel(price);
  if (repairName === "Front Glass Restoration") {
    return model + " front glass restoration: " + quote + ". That is the published glass-only price, with parts and labour included. It carries a 6 Months hardware warranty, subject to the written policy, and eligibility is confirmed on inspection — if the OLED itself is damaged we recommend full display replacement instead. Typical turnaround: same day after the eligibility check. Would you like to book it?";
  }
  const priceText = price[0] === price[1]
    ? model + " " + repairName.toLowerCase() + ": " + quote + ". This is the listed price."
    : model + " " + repairName.toLowerCase() + ": " + quote + ". The exact part grade/revision is confirmed during free diagnosis.";
  const turnaround = TURNAROUND_HINTS[repairName] ? " Typical turnaround: " + TURNAROUND_HINTS[repairName] + "." : "";
  return priceText + turnaround + " Every repair carries a 6 Months warranty — your invoice is the warranty record. Motherboard repairs are excluded. Would you like to arrange a visit or doorstep pickup?";
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
  store: ["address", "where are you", "location", "kahan", "shop", "store", "directions", "map", "reach", "metro", "halasuru", "mg road", "open now", "are you open", "opening hours", "open till", "closing time", "what time", "hours"],
  timing: ["how long", "how much time", "duration", "kitna time", "wait", "same day", "turnaround", "how many days"],
  payment: ["payment", "pay", "upi", "card", "cash", "advance", "paise kaise", "how to pay", "refund"],
  quality: ["quality", "original", "genuine", "oem", "fake", "duplicate", "test", "check", "passcode", "data safe", "private"],
  glass: ["front glass", "glass restoration", "glass only", "outer glass", "touch glass", "glass repair", "glass replace", "glass damage", "cracked glass", "broken glass", "sirf glass", "only glass", "glass price", "glass cost"],
  machines: ["machine", "machinery", "tbk", "oca", "laminat", "vacuum", "hydraulic", "press", "bubble remover", "bubble", "chamber", "autoclave", "laser", "uv", "purple laser", "tbk-958", "tbk958", "958", "equipment", "lab setup"],
  booking: ["book", "booking", "appointment", "slot", "walk in", "walk-in", "reserve", "time book"],
  screen: ["screen", "display", "crack", "cracked", "toot", "toota", "tooti", "tuta", "tuti", "fut", "touch", "lcd", "oled", "dead pixel", "lines"],
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
  invoice: ["invoice", "bill", "receipt", "crm", "crm invoice", "record", "job card", "jobcard", "warranty record", "repair status", "stage update", "whatsapp update", "where is my device", "tracking", "after handover", "what happens after"],
  diagnosis: ["diagnosis", "diagnose", "check", "inspect", "assessment", "estimate first"],
  notrepaired: ["not repairable", "cannot fix", "cant fix", "unrepairable", "worse", "damage your"],
  parts: ["genuine", "oem", "original", "copy", "aftermarket", "quality of part", "which part"],
  privacy: ["privacy", "passcode", "password", "data safe", "my data", "apple id", "otp", "wipe"],
  corporate: ["corporate", "bulk", "company", "office", "school", "multiple devices", "reseller"],
  insurance: ["insurance", "claim", "insurer", "damage report"],
  whyexpensive: ["expensive", "costly", "cheaper", "price match", "too much", "why so much"],
  human: ["human", "person", "technician", "talk", "call", "speak", "agent", "staff", "baat", "insaan"],
};

/* Best topic for a typed sentence. Scores by how many keywords hit, plus any
   vocabulary this browser has already learned for that topic. */
function resolve(text: string): { topic: string; score: number } | null {
  const t = ` ${text.toLowerCase()} `;
  const learned = typeof window !== "undefined" ? readLearn().words : {};
  let best: string | null = null;
  let bestScore = 0;
  for (const [topic, words] of Object.entries(SYNONYMS)) {
    let score = 0;
    for (const w of words) if (t.includes(w)) score += w.length > 5 ? 2 : 1;
    for (const w of learned[topic] ?? []) if (t.includes(w)) score += 1;
    if (score > bestScore) { bestScore = score; best = topic; }
  }
  return bestScore >= 1 && best ? { topic: best, score: bestScore } : null;
}


const MENU: Record<string, { reply: string; chips: string[] }> = {
  start: {
    reply:
      "Hi, I'm FaiCodex AI — Red Apple's repair assistant. I can check prices, timing and warranty, and connect you to a technician. If my AI service is offline, I'll say so and use our verified offline answers instead. What's going on with your device?",
    chips: ["iPhone screen", "Glass price", "Battery", "Back glass", "Price list", "Doorstep pickup", "Talk to a technician"],
  },
  about: {
    reply:
      "Red Apple Mobile Repair has been in Halasuru since 2017 — nine years, same shop, same bench. We are an independent Apple specialist, not affiliated with Apple Inc. We do component-level micro-soldering, OEM-grade displays, and back-glass laser work. Open 10 AM to 12 AM midnight, all seven days. Rated 4.9 from " + SITE.ratingCount + " Google reviews (" + SITE.addressVerified + "): " + SITE.gmbUrl,
    chips: ["Price list", "Visit the store", "Google reviews", "Talk to a technician"],
  },
  store: {
    reply:
      "We are at " + SITE.address + " — " + SITE.addressVerified + ". Opposite Bhadra Landmark, about a minute from Halasuru Metro. Rated 4.9 from " + SITE.ratingCount + " Google reviews: " + SITE.gmbUrl + ". The workshop has glass walls so you can watch your repair. Open 10 AM – 12 AM midnight, every day, with WhatsApp assistance 24/7. Walk-ins welcome, no appointment needed.",
    chips: ["Open in Maps", "Google reviews", "Book doorstep pickup", "Talk to a technician"],
  },
  timing: {
    reply:
      "Display, back glass and battery are usually same-day, about 45–60 minutes. Front glass restoration is same-day after the eligibility check. Charging port and camera take about an hour; board-level work takes 2–3 days, water-damage work about 24–48 hours, board-level storage IC work 1–2 days, and iPad screens 1–3 days.",
    chips: ["Price list", "Book doorstep pickup", "Talk to a technician"],
  },
  payment: {
    reply:
      "You pay after the diagnosis and the fixed quote — never before. UPI, cards and cash all work. There is no advance and no hidden charge; the number we quote is the number you pay. If the repair turns out to be impossible, you owe nothing.",
    chips: ["Price list", "Visit the store", "Talk to a technician"],
  },
  quality: {
    reply:
      "Every device goes through a 21-point quality check before hand-back — touch across the whole panel, True Tone, Face ID, front and rear cameras, all sensors, charging, speakers, and a thermal check. We do not ask for your passcode and we never wipe a device without written permission.",
    chips: ["Warranty details", "Price list", "Talk to a technician"],
  },
  booking: {
    reply:
      "Two ways. Walk in any time between 10 AM and 12 AM midnight — no appointment needed. Or book a doorstep pickup and a rider collects the device; pickup runs 24/7 across Bengaluru and is free for repairs above ₹2,999. Either way, our CRM sends you WhatsApp stage updates from collection through hand-back.",
    chips: ["Book doorstep pickup", "Visit the store", "Talk to a technician"],
  },
  device: {
    reply:
      "We repair supported iPhone models listed on our website, plus iPad, Apple Watch, iPod, AirPods and MacBook. We handle display, battery, back glass, camera, charging, board-level work, water damage and board-level storage IC repair. Which device and model do you have?",
    chips: ["iPhone", "iPad", "Apple Watch", "AirPods", "MacBook", "Talk to a technician"],
  },
  iphone: {
    reply:
      "We repair supported iPhone models listed on our website. Tell me your exact model and fault so I can check the right service and approved price.",
    chips: ["Screen price", "Battery price", "Back glass price", "Water damage", "Talk to a technician"],
  },
  screen: {
    reply:
      "We offer OEM-grade display replacement, and separately, front glass restoration that keeps your original OLED. If only the outer glass is cracked and the display still works, glass restoration is usually the better value. If the OLED itself is damaged, go for a full display. Which iPhone model is it?",
    chips: ["Glass price", "Front glass restoration", "Full display price", "Talk to a technician"],
  },
  glass: {
    reply:
      "Front glass restoration keeps your original OLED, touch and True Tone — we replace only the damaged outer glass using TBK OCA lamination, a 90-litre bubble-remover chamber and the TBK-958 cold UV laser. Published prices run from ₹2,500 to ₹19,500 depending on the model, with a 6 Months hardware warranty. Eligibility is confirmed on inspection. Which iPhone model do you have?",
    chips: ["Glass price iPhone 17 Pro Max", "Glass price iPhone 16 Pro", "Glass price iPhone 15", "Full glass price list", "Talk to a technician"],
  },
  machines: {
    reply:
      "Our Halasuru lab runs three TBK systems. The TBK OCA Laminating Vacuum Compressed Hydraulic Press bonds the new glass to the original OLED under vacuum and controlled pressure. The TBK 90-Litre High-Pressure Bubble Remover Chamber removes microscopic air bubbles for a zero-defect finish. The TBK-958 Cold UV Purple Laser separates the bezel and back glass with low temperature, so the logic board sees no heat stress. Would you like glass prices or a technician?",
    chips: ["Glass price", "See the lab", "Talk to a technician"],
  },
  backglass: {
    reply:
      "Back-glass replacement is available for supported models and usually takes about 45–60 minutes. The exact price depends on your model; tell me which iPhone you have and I'll check the approved price matrix.",
    chips: ["Get exact price", "Book doorstep pickup", "Talk to a technician"],
  },
  battery: {
    reply:
      "Battery replacement usually takes about 30–45 minutes. The exact price depends on your model. Batteries carry the same 6 Months repair warranty as our other work — keep your invoice, as it is the warranty record. Which model do you have?",
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
      "Published iPhone display repairs range from ₹1,200 to ₹36,400 depending on the model. Front glass restoration on listed iPhones is ₹2,500 to ₹19,500. Neither is a final quote: send your exact model and fault and I'll check the approved list; anything not listed is quoted after a free diagnosis.",
    chips: ["Send my model", "Glass price", "Talk to a technician"],
  },
  location: {
    reply:
      SITE.address + " — " + SITE.addressVerified + ". Opposite Bhadra Landmark, about a minute from Halasuru Metro. Rated 4.9 from " + SITE.ratingCount + " Google reviews: " + SITE.gmbUrl + ". Open 10 AM to 12 AM midnight, all seven days. WhatsApp assistance runs 24/7. Walk-ins welcome, no appointment needed.",
    chips: ["Open in Maps", "Google reviews", "Call the store", "Book doorstep pickup"],
  },
  pickup: {
    reply:
      "Doorstep pickup runs 24/7 across Bengaluru — any hour, any day. A rider collects the device, we repair it, and it comes back tested. Free for repairs above ₹2,999. You'll get a WhatsApp confirmation with the rider's details, then CRM stage updates as the device moves through diagnosis, repair, quality check and delivery.",
    chips: ["Book pickup", "Talk to a technician"],
  },
  warranty: {
    reply:
      "6 Months on every repair — displays, batteries and glass included. Your invoice is the warranty record: bring it with the device, or WhatsApp the invoice number and photos, and we handle the diagnosis and the covered repair on that same invoice. Motherboard repairs are the only exclusion. Not covered: physical/impact or liquid damage after hand-back, repair or opening by another shop after us, accidental damage, normal wear and tear, misuse, cosmetic issues, or unrelated software faults.",
    chips: ["Read the full policy", "Talk to a technician"],
  },
  invoice: {
    reply:
      "Every repair is a job card in our CRM, not a note on a pad. Parts fitted, technician notes and status changes are logged against your job number, and the CRM tracked invoice is generated from that record and sent to you on WhatsApp. For walk-in and doorstep-pickup devices, the CRM also sends WhatsApp stage updates — received, diagnosis, in repair, quality check, ready for hand-back and delivered. That invoice is your 6 Months warranty record, so keep it. Need it in your company's name? Add those details at booking and we'll issue it that way.",
    chips: ["What happens after handover?", "Read the full policy", "Talk to a technician"],
  },
  diagnosis: {
    reply:
      "Diagnosis is free and it comes first. We open the device, find the actual fault, and give you one fixed number. You approve it before anything is charged. If it turns out not to be repairable, you owe nothing and we tell you why.",
    chips: ["Price list", "Book doorstep pickup", "Talk to a technician"],
  },
  notrepaired: {
    reply:
      "If we can't fix it, you pay nothing — we tell you before you commit, not after. If you have a concern after hand-back, contact us and the team will assess it under the written warranty.",
    chips: ["Warranty details", "Talk to a technician"],
  },
  parts: {
    reply:
      "We use OEM-grade or verified-grade parts and tell you the part grade before work begins. We are an independent repair workshop, not an Apple Authorised Service Provider, and we never describe an OEM-grade part as an Apple-sourced part.",
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
      "We supply the itemised CRM tracked invoice and a written damage report, which is what an insurance claim actually needs. We don't file the claim for you, but we'll give you everything the insurer asks for.",
    chips: ["Talk to a technician", "Price list"],
  },
  whyexpensive: {
    reply:
      "I understand. The price reflects the part grade, labour and our 6 Months warranty, with your invoice as the warranty record. If your budget is lower, a technician can check whether another safe part grade is available; we never discount below the published minimum.",
    chips: ["Warranty details", "Price list", "Talk to a technician"],
  },
  human: {
    reply:
      "I can open WhatsApp with a summary of this conversation so a Red Apple technician can take over. I won't claim a handoff is complete until the team responds.",
    chips: [],
  },
};

function localKnowledgeAnswer(query: string): string | null {
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "has", "are",
    "was", "were", "what", "when", "where", "which", "will", "would", "can",
    "could", "you", "your", "our", "their", "about", "please", "tell", "me",
    "hai", "ka", "ki", "ke", "ko", "kya", "mera", "meri", "mere", "mujhe",
    "kaise", "kitna", "kitne", "karo", "karna", "chahiye", "theek",
  ]);
  const terms = Array.from(new Set(query.toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? []))
    .filter((term) => !stopWords.has(term));
  if (!terms.length) return null;

  const best = KNOWLEDGE_BASE.map((document) => {
    const title = document.title.toLowerCase();
    const tags = document.tags.join(" ").toLowerCase();
    const body = document.content.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 5;
      else if (tags.includes(term)) score += 3;
      else if (body.includes(term)) score += 1;
    }
    return { document, score };
  }).sort((a, b) => b.score - a.score)[0];

  if (!best || best.score < 3) return null;
  const answer = best.document.content.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  // Cut on a word boundary so a truncated excerpt never stops mid-word.
  const trimmed = answer.length > 420 ? answer.slice(0, 417).replace(/\s+\S*$/, "") + "…" : answer;
  return "From our offline repair guide: " + trimmed;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ChatImage[]>([]);
  const [imageError, setImageError] = useState("");
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageConsent, setImageConsent] = useState(false);

  useEffect(() => {
    if (!memoryReady) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(CHAT_MEMORY_KEY, JSON.stringify({ savedAt: Date.now(), messages: msgs.slice(-30).map((m) => ({ from: m.from, text: m.text, chips: m.chips })) }));
      } catch {
        // Storage quotas and private browsing are non-fatal.
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [msgs, memoryReady]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" }); }, [msgs]);

  const [draft, setDraft] = useState("");

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;
    setImageConsent(false);
    const remaining = Math.max(0, 3 - images.length);
    if (!remaining) { setImageError("You can attach up to 3 photos."); return; }
    if (selected.length > remaining) setImageError("Only the first " + remaining + " photo(s) were added; the limit is 3.");
    else setImageError("");
    const next: ChatImage[] = [];
    setImageProcessing(true);
    try {
      for (const file of selected.slice(0, remaining)) {
        try { next.push(await prepareChatImage(file)); }
        catch (error) { setImageError(error instanceof Error ? error.message : "This photo could not be added."); }
      }
      if (next.length) setImages((current) => [...current, ...next].slice(0, 3));
    } finally { setImageProcessing(false); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if ((!t && !images.length) || typing || streaming || imageProcessing) return;
    if (images.length && !imageConsent) { setImageError('Please confirm the photo-sharing notice before sending images through FaiCodex AI (Google Gemini).'); return; }
    const attached = images;
    setDraft("");
    setImages([]);
    setImageError("");
    send(t || "Please inspect the attached photos. Describe the visible damage, likely repair options and what details are needed for an accurate quote.", attached, imageConsent);
    setImageConsent(false);
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
  const send = async (text: string, attachments: ChatImage[] = [], consentToImageProcessing = false) => {
    if (stopped || typing || streaming) return;
    setMsgs((m) => [...m, { from: "user", text, images: attachments.map((image) => image.preview) }]);
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

    // Context + local vocabulary learning. Cheap, synchronous and private.
    rememberContext(text);
    const early = resolve(text);
    if (early && early.score >= 3 && early.topic !== "start") learnWords(early.topic, text);

    const handoffNow = (reason: string) => {
      const transcript = [...msgs.slice(-8), { from: "user" as const, text }]
        .map((item) => (item.from === "user" ? "Customer: " : "FaiCodex AI: ") + item.text)
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
    if (/(icloud|activation lock).*(circumvent|open)|(circumvent|open).*(icloud|activation lock)/i.test(text)) {
      push("We cannot circumvent iCloud Activation Lock. Ask a technician about owner-verified factory restore assistance with proof of ownership.", ["Talk to a technician"]);
      return;
    }
    if (/(talk to (a )?(human|person|technician)|speak to (a )?(human|person|technician)|call me|agent|staff)/i.test(text)) {
      handoffNow("Customer requested a human technician");
      return;
    }
    if (!attachments.length && /(water|liquid|paani|geela)/i.test(text)) {
      push("Please do not charge the device or use heat to dry it. Water damage needs a free assessment first; recovery cannot be promised. Would you prefer a walk-in assessment or doorstep pickup?", ["Book doorstep pickup", "Talk to a technician"]);
      return;
    }

    // instant, deterministic answers first
    const built = attachments.length ? null : builderAnswer(text);
    if (built) { setTimeout(() => push(built), 160); return; }

    const priced = attachments.length ? null : priceAnswer(text);
    if (priced) {
      setTimeout(() => push(priced, ["Book doorstep pickup", "Talk to a technician"]), 160);
      return;
    }

    // ---- real AI ----
    let streamedReply = "";
    let providerUnavailable = false;
    try {
      const history = msgs
        .filter((m) => m.text)
        .slice(-6)
        .map((m) => ({ role: m.from === "user" ? ("user" as const) : ("model" as const), text: m.text }));

      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, images: attachments.map(({ mimeType, data }) => ({ mimeType, data })), imageConsent: attachments.length > 0 && consentToImageProcessing }),
        signal: AbortSignal.timeout(42000),
        cache: "no-store",
      });

      if (res.status === 204 || !res.ok) {
        providerUnavailable = true;
      } else if (res.body) {
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
      providerUnavailable = true;
    }

    if (attachments.length) {
      push("I couldn't complete the photo assessment just now. Please try again shortly, or send the photos to our technician on WhatsApp for a manual check. I won't guess at a diagnosis or price from an image I couldn't inspect.", ["Talk to a technician"]);
      return;
    }

    // ---- fallback: curated topic, then local knowledge, then the menu ----
    // This runs even when the hosted model is unreachable, so a customer asking
    // about glass, the TBK machines or a price still gets a real answer instead
    // of an apology. Only a genuinely unknown question reaches the apology.
    const syn = resolve(text);
    const confidentTopic = syn && syn.score >= 2 ? syn.topic : null;

    // A confidently recognised topic has a hand-written, complete answer that
    // beats a two-sentence excerpt from the knowledge base.
    if (confidentTopic && MENU[confidentTopic]) {
      setFailedTurns(0);
      const entry = MENU[confidentTopic];
      setTimeout(() => push(entry.reply, entry.chips), 160);
      return;
    }

    const localAnswer = localKnowledgeAnswer(text);
    if (localAnswer) {
      setFailedTurns(0);
      setTimeout(() => push(localAnswer, ["Book doorstep pickup", "Talk to a technician"]), 160);
      return;
    }

    const lower = text.toLowerCase();
    let resolved = "";
    for (const k of Object.keys(MENU)) { if (k !== "start" && lower.includes(k)) { resolved = k; break; } }
    if (syn && MENU[syn.topic]) resolved = syn.topic;

    if (resolved && MENU[resolved]) {
      setFailedTurns(0);
      const entry = MENU[resolved];
      setTimeout(() => push(entry.reply, entry.chips), 180);
      return;
    }

    if (providerUnavailable) {
      setFailedTurns(0);
      push("That reply came from our verified offline answers, not the live AI service, which is temporarily unreachable. I can still check published prices or connect you directly with a Red Apple technician.", ["Price list", "Talk to a technician"]);
      return;
    }

    if (text.trim().split(/\s+/).length > 2) {
      const nextFailedTurn = failedTurns + 1;
      setFailedTurns(nextFailedTurn);
      if (nextFailedTurn >= 3) {
        handoffNow("Three consecutive unclear customer messages");
        return;
      }
      const clarification = nextFailedTurn === 1
        ? "I want to get that right. Which device and model are you asking about?"
        : "Is the issue with the screen, battery, charging, or something else?";
      setTimeout(() => push(clarification, ["Screen", "Glass price", "Battery", "Charging", "Talk to a technician"]), 180);
      return;
    }

    setFailedTurns(0);
    const entry = MENU.start;
    setTimeout(() => push(entry.reply, entry.chips), 180);
  };

  const chipAction = (chip: string) => {
    if (/see the lab|glass lab/i.test(chip)) {
      document.getElementById("glass")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setMsgs((m) => [...m, { from: "user", text: chip }, { from: "bot", text: "Here is the glass lab — live prices, the before/after result and the three TBK machines.", chips: ["Glass price", "Talk to a technician"] }]);
      return;
    }
    if (/front glass restoration/i.test(chip)) { send("front glass restoration"); return; }
    if (/full glass price list|^glass price$/i.test(chip)) { send("front glass restoration price"); return; }
    if (/price list/i.test(chip)) {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setMsgs((m) => [...m, { from: "user", text: chip }, { from: "bot", text: "Here is the published repair-pricing section. If your exact model or repair is not listed, the team will confirm it after a free diagnosis.", chips: ["Talk to a technician"] }]);
      return;
    }
    if (chip.includes("WhatsApp") || chip.includes("estimate") || chip.includes("quote") || /pickup/i.test(chip) || /technician|human|agent/i.test(chip)) {
      const isHuman = /technician|human|agent/i.test(chip);
      const transcript = msgs.slice(-8).map((item) =>
        (item.from === "user" ? "Customer: " : "FaiCodex AI: ") + item.text
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
    if (/google reviews/i.test(chip)) {
      window.open(SITE.gmbUrl, "_blank", "noopener,noreferrer");
      track("map_click", { source: "concierge", chip: "google_reviews" });
      setMsgs((m) => [...m, { from: "user", text: chip }, { from: "bot", text: "Opening our verified Google My Business & Maps listing — 4.9 from " + SITE.ratingCount + " reviews.", chips: [] }]);
      return;
    }
    if (chip.includes("Maps")) { window.open(SITE.mapsUrl, "_blank", "noopener,noreferrer"); track("map_click", { source: "concierge" }); setMsgs((m) => [...m, { from: "user", text: chip }]); return; }
    if (chip.includes("Call")) { window.open(SITE.phoneHref, "_self"); track("call_click", { source: "concierge" }); return; }
    if (chip.includes("policy")) { window.open("/refund-policy", "_blank", "noopener,noreferrer"); setMsgs((m) => [...m, { from: "user", text: chip }, { from: "bot", text: "Opened our Refund & Warranty Policy in a new tab.", chips: [] }]); return; }
    const modelMatch = chip.match(/iPhone\s+\d+[^,]*/i);
    if (modelMatch) {
      const wantsGlass = /glass/i.test(chip);
      send(`${wantsGlass ? "front glass" : "screen"} price for ${modelMatch[0]}`);
      return;
    }
    send(chip.replace(/^[^\w]+/, "").trim());
  };

  const restoreMemory = () => {
    if (memoryReady) return;
    try {
      const saved = window.localStorage.getItem(CHAT_MEMORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { savedAt?: number; messages?: unknown };
        const fresh = typeof parsed.savedAt === "number" && Date.now() - parsed.savedAt < 7 * 24 * 60 * 60 * 1000;
        if (fresh && Array.isArray(parsed.messages)) {
          const safe = parsed.messages.filter((item): item is Msg =>
            Boolean(item) &&
            typeof item === "object" &&
            ((item as Msg).from === "user" || (item as Msg).from === "bot") &&
            typeof (item as Msg).text === "string" &&
            (item as Msg).text.length <= 3000 &&
            (!(item as Msg).chips || (Array.isArray((item as Msg).chips) && (item as Msg).chips!.every((chip) => typeof chip === "string")))
          ).slice(-30);
          if (safe.length) setMsgs(safe);
        } else {
          window.localStorage.removeItem(CHAT_MEMORY_KEY);
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
        aria-label="Open FaiCodex AI chat"
        className="fixed bottom-24 right-5 z-[70] grid h-12 w-12 place-items-center rounded-[13px] bg-[var(--cta-dark)] text-white shadow-xl transition-transform hover:scale-105 md:bottom-8 md:right-8"
      >
        {open ? <LineIcon name="close" size={20} /> : <LineIcon name="bot" size={22} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-32 right-4 z-[70] flex h-[460px] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-[22px] bg-white shadow-xl ring-1 ring-black/[0.08] md:bottom-24 md:right-8">
          {/* Header */}
          <div className="relative flex items-center gap-3 bg-[var(--cta-dark)] px-5 py-4 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <LineIcon name="bot" size={20} />
            </span>
            <div>
              <div className="text-[14px] font-bold">FaiCodex AI</div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Repair assistant · prices &amp; warranty · technician handoff</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typing || streaming) return;
                setMsgs([{ from: "bot", text: MENU.start.reply, chips: MENU.start.chips }]);
                setStopped(false);
                setFailedTurns(0);
                window.localStorage.removeItem(CHAT_MEMORY_KEY);
              }}
              disabled={typing || streaming}
              aria-label="Clear conversation history on this device"
              className="ml-auto mr-1 rounded-full bg-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white/75 hover:bg-white/20 disabled:opacity-30"
            >
              Clear
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20">
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
                  {m.images && m.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {m.images.map((src, imageIndex) => <NextImage key={imageIndex} src={src} alt="Customer repair photo" width={64} height={64} unoptimized className="h-16 w-16 rounded-lg border border-white/30 object-cover" />)}
                    </div>
                  )}
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

          {/* Optional photo attachments — processed locally and never stored in chat history. */}
          {images.length > 0 && (
            <div className="flex items-center gap-2 border-t border-black/[0.05] bg-white px-3 pt-2">
              {images.map((image, index) => (
                <div key={image.name + index} className="relative">
                  <NextImage src={image.preview} alt="Selected repair photo" width={48} height={48} unoptimized className="h-12 w-12 rounded-lg border border-black/10 object-cover" />
                  <button type="button" onClick={() => setImages((current) => current.filter((_, i) => i !== index))} aria-label="Remove photo" className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-zinc-900 text-xs text-white">×</button>
                </div>
              ))}
              <span className="text-[10px] text-zinc-500">{images.length}/3</span>
            </div>
          )}
          {images.length > 0 && (
            <label className="flex items-start gap-2 border-t border-black/[0.05] bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-zinc-700">
              <input type="checkbox" checked={imageConsent} onChange={(event) => setImageConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
              <span>I agree to send these device photos through FaiCodex AI, for AI review. FaiCodex AI uses a third-party AI service for image analysis. On free-tier processing, submitted prompts and images may be used by that service to improve its products. Do not upload personal or sensitive information.</span>
            </label>
          )}
          {imageError && <p role="status" className="bg-white px-3 pt-1 text-[10px] text-red-600">{imageError}</p>}
          <form onSubmit={submit} className="flex items-center gap-2 border-t border-black/[0.07] bg-white px-3 py-2.5">
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelection} aria-label="Choose repair photos" />
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={typing || streaming || imageProcessing || images.length >= 3} aria-label="Add repair photos" title="Add up to 3 repair photos" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 text-[12px] font-bold text-zinc-900 shadow-sm transition hover:border-red-300 hover:bg-red-100 disabled:opacity-40">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-zinc-900 shadow-sm"><LineIcon name="paperclip" size={15} /></span>
              <span>Add photo</span>
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your problem — e.g. screen toot gayi"
              aria-label="Type your message to FaiCodex AI"
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-[var(--bg-alt)] px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={(!draft.trim() && !images.length) || typing || streaming || imageProcessing}
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