"use client";

/**
 * SmartNudge — a quiet, always-free assistant that speaks up when the visitor
 * looks stuck.
 *
 * How it decides to appear
 *   1. Visitor has been idle (no scroll, click, key, or touch) for IDLE_MS.
 *   2. They are not at the very top (they already saw the hero).
 *   3. It has not spoken more than MAX_NUDGES times this session.
 *   4. They have not dismissed it.
 *
 * What it says
 *   The message is chosen from the section currently in view — pricing gets a
 *   quote nudge, the FAQ gets "want a straight answer", and so on. Every nudge
 *   carries two actions: jump to the estimate, or open WhatsApp with a
 *   technician. Nothing is ever sold hard and nothing auto-sends.
 *
 * Cost
 *   Zero. This is a deterministic rule engine — no API key, no network call,
 *   no per-message billing. It ships as ~7 KB of client JS.
 *
 * Upgrading to a real LLM later
 *   Set NEXT_PUBLIC_CONCIERGE_AI=1 and point /api/concierge at any free-tier
 *   model (Groq, Gemini Flash, OpenRouter free). The UI below already handles
 *   the async path — see `askAI`. Without the flag it stays local and free.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

const IDLE_MS = 45_000;      // how long "thinking" has to last before we speak
const MAX_NUDGES = 2;        // per session — more than this feels like spam
const SEEN_KEY = "ra_nudge_seen";
const OFF_KEY = "ra_nudge_off";

type Nudge = { id: string; text: string; quote: string; wa: string };

/* Picked by which section is on screen. Deliberately short and human. */
const BY_SECTION: Record<string, Nudge> = {
  pricing: {
    id: "pricing",
    text: "Comparing prices? I can pin down your exact model and part in under a minute.",
    quote: "Get my exact price",
    wa: "Ask a technician",
  },
  repairs: {
    id: "repairs",
    text: "Not sure whether it's the screen or the back glass? Send a photo on WhatsApp — a technician will tell you in minutes.",
    quote: "Start an estimate",
    wa: "Send a photo",
  },
  faq: {
    id: "faq",
    text: "Still unsure about something? Ask me directly — or a technician can answer on WhatsApp.",
    quote: "Get a quote",
    wa: "Talk to a technician",
  },
  reviews: {
    id: "reviews",
    text: "905 people have rated us 4.9. Want the same turnaround for your device?",
    quote: "Get my estimate",
    wa: "Ask a technician",
  },
  visit: {
    id: "visit",
    text: "Planning to walk in? I can check today's queue and give you a realistic time.",
    quote: "Get a quote first",
    wa: "Check the queue",
  },
  quote: {
    id: "quote",
    text: "Stuck on a field? Skip it — send your model on WhatsApp and we'll do the rest.",
    quote: "Finish on WhatsApp",
    wa: "Ask a technician",
  },
  default: {
    id: "default",
    text: "Still deciding? Tell me your device and I'll get you a fixed price — no guessing.",
    quote: "Get my estimate",
    wa: "Ask a technician",
  },
};

export default function SmartNudge() {
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState<Nudge>(BY_SECTION.default);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const count = useRef(0);

  /* which section is closest to the middle of the viewport right now */
  const currentSection = useCallback(() => {
    const ids = ["quote", "pricing", "repairs", "reviews", "faq", "visit"];
    const mid = window.innerHeight / 2;
    let best = "default";
    let bestDist = Infinity;
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = id; }
    }
    return best;
  }, []);

  const arm = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (count.current >= MAX_NUDGES) return;
    if (sessionStorage.getItem(OFF_KEY) === "1") return;

    timer.current = setTimeout(() => {
      if (count.current >= MAX_NUDGES) return;
      if (window.scrollY < 400) return;              // still reading the hero
      const key = currentSection();
      setNudge(BY_SECTION[key] ?? BY_SECTION.default);
      setOpen(true);
      count.current += 1;
      sessionStorage.setItem(SEEN_KEY, String(count.current));
      track("nudge_shown");
    }, IDLE_MS);
  }, [currentSection]);

  useEffect(() => {
    const seen = Number(sessionStorage.getItem(SEEN_KEY) || "0");
    count.current = seen;

    const reset = () => {
      if (open) return;                              // never re-arm while visible
      arm();
    };

    ["scroll", "click", "keydown", "touchstart", "mousemove"].forEach((e) =>
      window.addEventListener(e, reset, { passive: true })
    );
    arm();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      ["scroll", "click", "keydown", "touchstart", "mousemove"].forEach((e) =>
        window.removeEventListener(e, reset)
      );
    };
  }, [arm, open]);

  const dismiss = (forever: boolean) => {
    setLeaving(true);
    if (forever) sessionStorage.setItem(OFF_KEY, "1");
    setTimeout(() => { setOpen(false); setLeaving(false); }, 180);
  };

  const goQuote = () => {
    track("nudge_quote_click");
    dismiss(false);
    document.getElementById("quote")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goWa = () => {
    track("nudge_whatsapp_click");
    dismiss(false);
    const msg = `Hi ${SITE.shortName}! I was looking at your site and would like to speak to a technician about my device.`;
    window.open(wa(msg), "_blank", "noopener,noreferrer");
  };

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-24 left-4 z-40 w-[min(320px,calc(100vw-2rem))] transition-all duration-200 sm:bottom-6 sm:left-6 ${
        leaving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="nudge-card relative rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.28)]">
        <button
          onClick={() => dismiss(true)}
          aria-label="Dismiss assistant suggestion"
          className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-black/[0.05]"
        >
          <LineIcon name="close" size={13} />
        </button>

        <div className="mb-2.5 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)]/10">
            <LineIcon name="bot" size={15} color="var(--accent)" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
            Repair Assistant
          </span>
        </div>

        <p className="mb-3.5 pr-4 text-[13.5px] leading-relaxed text-[var(--text)]">
          {nudge.text}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={goQuote}
            className="rounded-lg bg-[var(--cta-dark)] px-3 py-2 text-[12px] font-bold text-white transition-transform hover:scale-[1.03]"
          >
            {nudge.quote}
          </button>
          <button
            onClick={goWa}
            className="flex items-center gap-1.5 rounded-lg border border-black/[0.10] px-3 py-2 text-[12px] font-bold text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <LineIcon name="whatsapp" size={13} color="currentColor" />
            {nudge.wa}
          </button>
        </div>
      </div>
    </div>
  );
}
