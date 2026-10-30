"use client";
import { useEffect, useState } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

const LINKS = [
  { href: "#ecosystem", label: "Devices" },
  { href: "#repairs", label: "Repairs" },
  { href: "#pricing", label: "Pricing" },
  { href: "#process", label: "How It Works" },
  { href: "#quote", label: "Get Quote" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
  { href: "#visit", label: "Visit" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      // only setState when the VALUE actually changes — prevents a re-render per pixel
      setScrolled((prev) => {
        const next = y > 24;
        return prev === next ? prev : next;
      });
      setHidden((prev) => {
        const next = y > 400 && y > lastY && !open;
        lastY = y;
        return prev === next ? prev : next;
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 will-change-transform ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "bg-white/95 border-b border-black/[0.06] shadow-sm" : "bg-white/80"}`}
    >
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3 lg:px-8">
        <a href="#top" className="group flex items-center gap-2.5" aria-label="Red Apple Mobile Repair Store home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--cta-dark)] shadow-lg transition-transform group-hover:scale-105">
            <LineIcon name="apple" size={20} color="#fff" />
          </span>
          <span className="leading-tight">
            <span className="block font-apple text-[16px] font-extrabold tracking-tight text-[var(--text)] animate-brand-breathe">Red Apple</span>
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent)]">Mobile Repair Store</span>
          </span>
        </a>

        <div className="hidden items-center gap-6 xl:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={wa("Hi Red Apple Mobile Repair Store! I need a repair estimate.")}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "navbar" })}
            className="hidden sm:inline-flex items-center gap-2 rounded-[var(--cta-radius)] bg-[var(--cta-dark)] px-4 py-2 text-[13px] font-bold text-white transition-transform hover:scale-[1.03] shadow-md"
          >
            <LineIcon name="whatsapp" size={16} />
            WhatsApp
          </a>
          <a
            href={SITE.phoneHref}
            onClick={() => track("call_click", { source: "navbar" })}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-[var(--cta-radius)] border border-black/10 bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--text)] transition-colors hover:bg-white"
          >
            <LineIcon name="call" size={14} />
            Call
          </a>
          <button
            onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl bg-black/[0.05] text-[var(--text)] xl:hidden"
          >
            <LineIcon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-4 mb-4 rounded-3xl bg-white p-6 shadow-2xl xl:hidden">
          <div className="grid gap-1">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-[15px] font-medium text-[var(--text)] hover:bg-black/[0.04]">
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <a href={wa("Hi Red Apple Mobile Repair Store!")} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-[var(--cta-radius)] bg-[var(--cta-dark)] px-5 py-3 text-center text-[14px] font-bold text-white flex items-center justify-center gap-2">
              <LineIcon name="whatsapp" size={16} /> WhatsApp
            </a>
            <a href={SITE.phoneHref} className="flex-1 rounded-[var(--cta-radius)] border border-black/10 bg-white px-5 py-3 text-center text-[14px] font-semibold flex items-center justify-center gap-2">
              <LineIcon name="call" size={16} /> Call
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
