"use client";
import { useEffect, useRef, useState } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

type Msg = { from: "user" | "bot"; text: string; chips?: string[] };

const MENU: Record<string, { reply: string; chips: string[] }> = {
  start: { reply: "Hi! I'm the Red Apple repair concierge. I can help you find the right repair, prepare your visit and connect you with our technicians instantly. What do you need?", chips: ["Device & repair", "Estimate", "Location & timings", "Pickup & drop", "Warranty", "Talk to a human"] },
  "device": { reply: "We repair the full Apple family: iPhone (all models), iPad, iPod touch, Apple Watch, AirPods, MacBook Pro/Air, Mac mini, iMac and Mac Studio — plus Apple accessories. Which device do you have?", chips: ["iPhone", "iPad", "Apple Watch", "AirPods", "MacBook / Mac", "Talk to a human"] },
  "iphone": { reply: "iPhone is our specialty — especially display and back glass replacement on Pro & Pro Max models. We also fix batteries, cameras, charging ports, water damage, motherboards and software. What's the issue?", chips: ["Screen / display", "Back glass", "Battery", "Camera", "Water damage", "Data recovery", "Talk to a human"] },
  "screen": { reply: "Cracked display? We replace front displays on every iPhone with OEM-grade OLED panels — True Tone preserved, ~45 minutes, 90-day warranty. Tap below to get your exact model's estimate on WhatsApp.", chips: ["Get display estimate", "Visit store", "Talk to a human"] },
  "backglass": { reply: "Back glass is our flagship service. Laser-aligned, MagSafe-compatible, seamless finish — especially popular for iPhone Pro & Pro Max. Get a quote in 2 taps.", chips: ["Get back glass estimate", "Visit store", "Talk to a human"] },
  "battery": { reply: "Battery replacement takes ~30 minutes with a free health report before & after. Every battery carries a 6-month health guarantee. Want a quote?", chips: ["Battery estimate", "Visit store", "Talk to a human"] },
  "camera": { reply: "We repair front & rear cameras, OIS, zoom and lenses with OEM modules, plus calibration after install. Usually ~60 minutes.", chips: ["Camera estimate", "Talk to a human"] },
  "water": { reply: "Water damage is time-critical — don't charge the device, bring it in fast or use our free pickup. We do ultrasonic cleaning and chip-level corrosion treatment with the best success rate in the city.", chips: ["Emergency WhatsApp", "Book pickup", "Visit store"] },
  "data": { reply: "We recover photos, chats, contacts and files from damaged or locked devices — logical and board-level recovery. Data is never wiped without your permission.", chips: ["Data recovery quote", "Talk to a human"] },
  "ipad": { reply: "iPad repairs: displays, batteries, charging, cameras and logic boards across iPad, Pro, Air and mini. Which issue would you like to check?", chips: ["Screen", "Battery", "Estimate", "Talk to a human"] },
  "watch": { reply: "Apple Watch repairs: screens, batteries, sensors, speakers and straps across all Series and Ultra models.", chips: ["Watch estimate", "Talk to a human"] },
  "airpods": { reply: "AirPods services: battery replacement, charging case repair, speaker and microphone fixes for all generations, including Pro and Max.", chips: ["AirPods estimate", "Talk to a human"] },
  "macbook": { reply: "MacBook Pro, Air, Mac mini, iMac & Studio — displays, keyboards, batteries, storage, thermal and logic-board repairs by Apple-trained techs.", chips: ["Mac estimate", "Talk to a human"] },
  "estimate": { reply: "Exact prices depend on your model and the part needed — we never guess on estimates. Tell us your device + model and we'll send you a precise quote on WhatsApp within minutes.", chips: ["iPhone screen quote", "Mac quote", "Watch quote", "AirPods quote", "Talk to a human"] },
  "location": { reply: `${SITE.address}. Open ${SITE.hours}. Just 1 minute from Halasuru Metro — walk-ins welcome all day.`, chips: ["Open in Google Maps", "Call store", "Pickup & drop"] },
  "pickup": { reply: "Free doorstep pickup & drop across Bengaluru for eligible repairs. Share your area on WhatsApp and we'll arrange it the same day.", chips: ["Book pickup", "Talk to a human"] },
  "warranty": { reply: "Every repair includes a 90-day service warranty. Displays and batteries also carry a 6-month health guarantee. We stand behind every fix.", chips: ["Talk to a human"] },
  "human": { reply: "Absolutely — our senior technicians are one tap away on WhatsApp. Tell them what happened and they'll take over from here.", chips: [] },
};

export default function Concierge() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: MENU.start.reply, chips: MENU.start.chips },
  ]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = (text: string) => {
    setMsgs((m) => [...m, { from: "user", text }]);
    setTyping(true);
    const lower = text.toLowerCase();
    let resolved = "start";
    for (const k of Object.keys(MENU)) { if (lower.includes(k)) { resolved = k; break; } }
    setTimeout(() => {
      const item = MENU[resolved];
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
    send(chip.replace(/^[^\w]+/, "").trim());
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        id="concierge-open"
        onClick={() => setOpen(!open)}
        aria-label="Open AI repair concierge"
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
              <div className="text-[14px] font-bold">Red Apple AI Concierge</div>
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

          {/* Chips */}
          {msgs.length > 0 && msgs[msgs.length - 1].chips && msgs[msgs.length - 1].chips!.length > 0 && !typing && (
            <div className="flex flex-wrap gap-2 border-t border-black/[0.05] bg-white px-4 py-3">
              {msgs[msgs.length - 1].chips!.map((c) => (
                <button key={c} onClick={() => chipAction(c)}
                  className="rounded-full border border-black/10 bg-[var(--bg-alt)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--text)] transition-all hover:border-[var(--accent)]/40 hover:bg-white">
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
