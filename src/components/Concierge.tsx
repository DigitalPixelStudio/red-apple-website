"use client";
import { useEffect, useRef, useState } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";
import { getPrice, priceLabel, priceRange, inr } from "@/lib/pricing";

type Msg = { from: "user" | "bot"; text: string; chips?: string[] };

/* Pull a model name out of free text, then answer with the real table price. */
const MODEL_HINTS = [
  "17 Pro Max","17 Pro","17 Plus","17","Air",
  "16 Pro Max","16 Pro","16 Plus","16",
  "15 Pro Max","15 Pro","15 Plus","15",
  "14 Pro Max","14 Pro","14 Plus","14",
  "13 Pro Max","13 Pro","13 mini","13",
  "12 Pro Max","12 Pro","12 mini","12",
  "SE (3rd Gen)","11 Pro Max","11 Pro","11",
  "XS Max","XS","XR","X",
];

const REPAIR_HINTS: [RegExp, string][] = [
  [/screen|display|crack|toot|tut|glass front|lcd|oled/i, "Front Display Replacement"],
  [/back ?glass|rear|back panel/i, "Back Glass Replacement"],
  [/battery|batter|charge drain|heating/i, "Battery Replacement"],
  [/camera|lens|photo|focus/i, "Camera Repair"],
  [/charging port|charging|port|flex/i, "Charging Port / Flex"],
  [/speaker|mic|haptic|sound/i, "Speaker / Mic / Haptics"],
  [/motherboard|board|ic |chip/i, "Motherboard / IC Repair"],
  [/water|liquid|paani|geela/i, "Water Damage Revival"],
  [/software|ios|update|boot/i, "Software / iOS Issue"],
  [/data|photos|recover/i, "Data Recovery"],
  [/unlock/i, "Unlocking (lawful)"],
  [/firmware|os install/i, "OS / Firmware Installation"],
  [/dent|body|frame/i, "Dent / Body / Frame Repair"],
];

/** Returns a concrete price answer, or null when we cannot be specific. */
function priceAnswer(text: string): string | null {
  const t = text.toLowerCase();
  const model = MODEL_HINTS.find((m) => t.includes(m.toLowerCase()));
  const repair = REPAIR_HINTS.find(([re]) => re.test(text))?.[1];
  if (!model || !repair) return null;

  const full = `iPhone ${model}`;
  const p = getPrice(full, repair);
  if (p) {
    return `${full} — ${repair}: **${priceLabel(p)}**. Genuine parts and labour included. Want me to hold a slot?`;
  }
  const r = priceRange();
  return `${full} with ${repair.toLowerCase()} is quoted after a free diagnosis — we do not guess at board-level work. Published repairs run ${inr(r.min)} to ${inr(r.max)}. Send the model on WhatsApp and a technician replies with a fixed figure.`;
}

/* Typed input is matched through this synonym table, so "display kharab hai"
   or "kitna paisa lagega" resolve to the right topic instead of falling back to
   the menu. Order matters: the first hit wins. */
const SYNONYMS: Record<string, string[]> = {
  screen: ["screen", "display", "glass", "crack", "cracked", "toot", "toota", "tooti", "tuta", "tuti", "fut", "touch", "lcd", "oled", "dead pixel", "lines"],
  backglass: ["back glass", "backglass", "rear", "back panel", "back cover"],
  battery: ["battery", "batter", "charge", "charging", "drain", "draining", "heating", "hot", "battery health", "swell", "swollen"],
  camera: ["camera", "lens", "photo", "blurry", "focus", "ois", "flash"],
  water: ["water", "liquid", "wet", "rain", "spill", "paani", "geela", "soaked"],
  data: ["data", "photos", "recover", "recovery", "backup", "contacts", "deleted", "lost data"],
  iphone: ["iphone", "apple phone"],
  ipad: ["ipad", "tablet"],
  watch: ["watch", "iwatch", "ultra"],
  airpods: ["airpod", "airpods", "earbud", "earphone", "pods"],
  macbook: ["macbook", "mac book", "laptop", "imac", "mac mini", "mac studio", "mac"],
  estimate: ["price", "pricing", "cost", "quote", "estimate", "how much", "kitna", "kitne", "paisa", "rate", "charges", "paise"],
  location: ["location", "address", "where", "shop", "store", "directions", "kahan", "kaha", "map", "reach"],
  pickup: ["pickup", "pick up", "doorstep", "home", "collect", "drop", "delivery"],
  warranty: ["warranty", "guarantee", "guaranty", "warrenty"],
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
      "Hi, I'm RedMobile F Ai — Red Apple's repair assistant. I can give you a real answer on price, timing or warranty, or put you straight through to a technician. What's going on with your device?",
    chips: ["iPhone screen", "Battery", "Back glass", "Price list", "Doorstep pickup", "Talk to a technician"],
  },
  device: {
    reply:
      "We cover the whole Apple family — iPhone (all models through 17 Pro Max), iPad, Apple Watch, AirPods, MacBook Pro/Air, Mac mini, iMac and Mac Studio. Display, battery, back glass, camera, charging port, water damage, logic board and data recovery. Which one is yours?",
    chips: ["iPhone", "iPad", "Apple Watch", "AirPods", "MacBook", "Talk to a technician"],
  },
  iphone: {
    reply:
      "iPhone is 80% of what we do. Display from ₹2,499, battery from ₹1,899, back glass from ₹1,999, charging port from ₹1,499 — the exact figure depends on your model. Most repairs are done in 30–45 minutes while you wait.",
    chips: ["Screen price", "Battery price", "Back glass price", "Water damage", "Talk to a technician"],
  },
  screen: {
    reply:
      "Display replacement: OEM-grade OLED, True Tone preserved, roughly 45 minutes. Price runs ₹2,499 for older models up to ₹24,635 for an iPhone 16 Pro Max. Tell me your model and I'll give you the exact figure — or a technician can on WhatsApp.",
    chips: ["iPhone 16 Pro Max", "iPhone 15", "iPhone 14", "iPhone 13", "Talk to a technician"],
  },
  backglass: {
    reply:
      "Back glass is our signature job — laser-aligned, MagSafe still works, no camera damage. From ₹1,999, about 60 minutes. It's the repair other shops in Bengaluru send to us.",
    chips: ["Get exact price", "Book doorstep pickup", "Talk to a technician"],
  },
  battery: {
    reply:
      "Battery from ₹1,899, about 30 minutes, with a free health report before and after. Every battery carries a 6-month health guarantee on top of the 90-day service warranty.",
    chips: ["Get exact price", "Book doorstep pickup", "Talk to a technician"],
  },
  camera: {
    reply:
      "Front or rear camera, including OIS and zoom modules, with calibration after fitting. Usually 60 minutes. From ₹2,299 depending on the model.",
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
      "iPad display, battery, charging port, camera and logic board — across iPad, Pro, Air and mini. Displays typically 1–2 hours because of the adhesive cure. From ₹3,499.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  watch: {
    reply:
      "Apple Watch screens, batteries, sensors and speakers across every Series and Ultra. Most are same-day. From ₹2,999.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  airpods: {
    reply:
      "AirPods battery replacement, charging-case repair, speaker and mic fixes for all generations including Pro and Max. Usually same-day. From ₹1,499.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  macbook: {
    reply:
      "MacBook Pro and Air, Mac mini, iMac and Studio — display, keyboard, battery, storage, thermal and logic-board work by Apple-trained technicians. Diagnosis is free; most board-level repairs are 2–3 days.",
    chips: ["Get exact price", "Talk to a technician"],
  },
  estimate: {
    reply:
      "I won't guess at a price — that's how people get surprised later. Send your exact model and the fault, and you'll have a fixed figure in minutes. iPhone screen runs ₹2,499–₹24,635; battery ₹1,899–₹6,499; back glass from ₹1,999.",
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
      "90 days on every repair. Battery and display also carry a 6-month health guarantee — if battery health drops below 80% or the panel develops a non-impact fault, we replace it once free. Damage from a new drop or liquid isn't covered.",
    chips: ["Read the full policy", "Talk to a technician"],
  },
  human: {
    reply:
      "Connecting you to a technician on WhatsApp now. They can see your chat history with me, so you won't have to repeat anything.",
    chips: [],
  },
};

export default function Concierge() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: MENU.start.reply, chips: MENU.start.chips },
  ]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const [draft, setDraft] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = draft.trim();
    if (!t) return;
    setDraft("");
    send(t);
  };

  const send = (text: string) => {
    setMsgs((m) => [...m, { from: "user", text }]);
    setTyping(true);
    const lower = text.toLowerCase();
    let resolved = "start";
    for (const k of Object.keys(MENU)) { if (lower.includes(k)) { resolved = k; break; } }
    // synonym pass wins over the raw substring pass — it understands Hinglish
    const syn = resolve(text);
    if (syn && MENU[syn]) resolved = syn;

    // a concrete price question gets a concrete answer before anything else
    const priced = priceAnswer(text);
    if (priced) {
      setTimeout(() => {
        setMsgs((m) => [...m, { from: "bot", text: priced, chips: ["Book doorstep pickup", "Talk to a technician"] }]);
        setTyping(false);
      }, 550);
      return;
    }
    setTimeout(() => {
      const item =
        resolved === "start" && text.trim().split(/\s+/).length > 2
          ? {
              reply:
                "I want to get that right rather than guess. A technician can look at your exact model and give you a fixed price in a couple of minutes.",
              chips: ["Talk to a human", "Estimate", "Device & repair"],
            }
          : MENU[resolved];
      setMsgs((m) => [...m, { from: "bot", text: item.reply, chips: item.chips }]);
      setTyping(false);
    }, 650);
  };

  const chipAction = (chip: string) => {
    if (chip.includes("WhatsApp") || chip.includes("estimate") || chip.includes("quote") || chip.includes("Book pickup")) {
      const msg = chip.includes("estimate") || chip.includes("quote")
        ? "Hi Red Apple Mobile Repair Store! I'd like an estimate for my Apple device."
        : chip.includes("pickup")
          ? "Hi! I'd like to book free pickup & drop for my Apple device."
          : chip.includes("Emergency")
            ? "URGENT: My Apple device has water damage. Please help!"
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

  return (
    <>
      {/* Floating launcher */}
      <button
        id="concierge-open"
        onClick={() => setOpen(!open)}
        aria-label="Open RedMobile F Ai chat"
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
              <div className="text-[14px] font-bold">RedMobile F Ai</div>
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
              aria-label="Type your message to RedMobile F Ai"
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-[var(--bg-alt)] px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--orange)]/60"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!draft.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--orange)] text-white transition-transform hover:scale-105 disabled:opacity-35"
            >
              <LineIcon name="arrow-right" size={16} color="#fff" />
            </button>
          </form>

          {/* Chips */}
          {msgs.length > 0 && msgs[msgs.length - 1].chips && msgs[msgs.length - 1].chips!.length > 0 && !typing && (
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
