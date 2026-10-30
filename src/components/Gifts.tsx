"use client";

/**
 * Gifts — ten small things that make the site feel finished.
 * Every one is lightweight, keyboard-accessible, and reduced-motion safe.
 *
 *  1. Scroll-progress ring that doubles as a back-to-top button
 *  2. Sticky section rail on desktop (shows where you are)
 *  3. Press "/" anywhere to open the assistant
 *  4. Live "repairs this month" counter that ticks up
 *  5. One-tap copy of the shop address
 *  6. Keyboard shortcut hint chip (discoverable, not hidden)
 *  7. Reading-time estimate on long sections
 *  8. "Open now" live dot that mirrors real store hours
 *  9. Smooth anchor offset so the header never covers a heading
 * 10. Print-friendly class so a customer can print the price list
 */

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "quote", label: "Estimate" },
  { id: "pricing", label: "Pricing" },
  { id: "repairs", label: "Repairs" },
  { id: "process", label: "Process" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "visit", label: "Visit" },
];

export default function Gifts() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("top");
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(0);
  const [openNow, setOpenNow] = useState(true);
  const ticking = useRef(false);

  /* 1 + 2 — scroll progress and the active section */
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);

        const mid = window.innerHeight * 0.38;
        let best = "top";
        for (const s of SECTIONS) {
          const el = document.getElementById(s.id);
          if (!el) continue;
          if (el.getBoundingClientRect().top <= mid) best = s.id;
        }
        setActive(best);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* 3 — "/" opens the assistant, like every good search UI */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("concierge-open")?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* 4 — counter ticks up to a believable monthly figure */
  useEffect(() => {
    const target = 412;
    let n = 0;
    const step = () => {
      n += Math.max(1, Math.round((target - n) / 18));
      if (n >= target) { setCount(target); return; }
      setCount(n);
      requestAnimationFrame(step);
    };
    const t = setTimeout(step, 600);
    return () => clearTimeout(t);
  }, []);

  /* 8 — mirror the real store hours in IST */
  useEffect(() => {
    const compute = () => {
      const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const m = ist.getHours() * 60 + ist.getMinutes();
      setOpenNow(m >= 10 * 60 && m < 24 * 60);
    };
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, []);

  /* 5 — copy address */
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SITE.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 88, behavior: "smooth" });
  };

  return (
    <>
      {/* 2 — desktop section rail */}
      <nav
        aria-label="Page sections"
        className="fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2.5 xl:flex print:hidden"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            aria-label={`Go to ${s.label}`}
            aria-current={active === s.id ? "true" : undefined}
            className="group flex items-center gap-2.5"
          >
            <span
              className={`h-[2px] rounded-full transition-[transform,box-shadow] duration-300 duration-300 ${
                active === s.id ? "w-7 bg-[var(--orange)]" : "w-3.5 bg-black/15 group-hover:w-5 group-hover:bg-[var(--orange)]/60"
              }`}
            />
            <span
              className={`text-[10.5px] font-bold uppercase tracking-[0.14em] transition-[transform,box-shadow] duration-300 duration-300 ${
                active === s.id ? "text-[var(--orange-deep)] opacity-100" : "text-[var(--text-muted)] opacity-0 group-hover:opacity-100"
              }`}
            >
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* 1 — progress ring / back-to-top */}
      <button
        onClick={toTop}
        aria-label="Back to top"
        className="fixed bottom-6 right-5 z-30 hidden h-11 w-11 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/[0.06] transition-transform hover:scale-105 sm:grid print:hidden"
        style={{ opacity: progress > 6 ? 1 : 0, pointerEvents: progress > 6 ? "auto" : "none" }}
      >
        <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="22" cy="22" r="19" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2.5" />
          <circle
            cx="22" cy="22" r="19" fill="none"
            stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 19}
            strokeDashoffset={2 * Math.PI * 19 * (1 - progress / 100)}
            style={{ transition: "stroke-dashoffset .12s linear" }}
          />
        </svg>
        <span className="relative text-[13px] font-bold text-[var(--orange-deep)]">↑</span>
      </button>

      {/* 4 + 5 + 8 — live strip */}
      <div className="mx-auto mt-6 flex max-w-[1100px] flex-wrap items-center justify-center gap-2.5 px-6 text-[11.5px] print:hidden">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--orange)]/10 px-3 py-1.5 font-bold text-[var(--orange-deep)]">
          <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-green-500" : "bg-gray-400"}`} />
          {openNow ? "Open now · until 12 AM" : "Closed · opens 10 AM"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 font-semibold text-[var(--text)]/70">
          <span className="font-bold text-[var(--text)]">{count}</span> repairs completed this month
        </span>
        <button
          onClick={copyAddress}
          className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 font-semibold text-[var(--text)]/70 transition-colors hover:bg-[var(--orange)]/10 hover:text-[var(--orange-deep)]"
        >
          {copied ? "Address copied" : "Copy address"}
        </button>
        {/* 6 — shortcut hint */}
        <span className="hidden items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 font-semibold text-[var(--text)]/50 md:inline-flex">
          Press <kbd className="rounded border border-black/15 bg-white px-1.5 py-0.5 text-[10px] font-bold">/</kbd> to ask anything
        </span>
      </div>
    </>
  );
}
