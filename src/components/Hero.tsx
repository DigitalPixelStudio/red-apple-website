"use client";
import { useState, useEffect, useRef } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";
import Phone3D from "./Phone3D";

export default function Hero() {
  const devices = [
    { label: "iPhone", sub: "Display · Back glass · Battery", icon: "phone" as IconName, img: "/images/v5/service-iphone.jpg", tone: "device-tone-orange" },
    { label: "iPad", sub: "Screens & logic boards", icon: "ipad" as IconName, img: "/images/v5/ipad-pro-129.jpg", tone: "device-tone-blue" },
    { label: "Apple Watch", sub: "Screens · Battery · Sensors", icon: "watch" as IconName, img: "/images/v5/service-watch.jpg", tone: "device-tone-green" },
    { label: "MacBook", sub: "Logic board · Keyboard · Screen", icon: "macbook" as IconName, img: "/images/v5/macbook-pro-latest.jpg", tone: "device-tone-violet" },
  ];

  /* Store hours: 10:00 – 24:00 (midnight), all 7 days (IST). Computed on the client so the
     badge never claims "Open now" at 2am. Falls back to the static label during
     SSR, then corrects itself on mount — no hydration mismatch. */
  const [status, setStatus] = useState<{ open: boolean; label: string }>({
    open: true,
    label: "Open now · Bangalore · 10:00 AM – 12:00 AM",
  });

  useEffect(() => {
    const compute = () => {
      // Convert to IST regardless of the visitor's timezone
      const now = new Date();
      const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const mins = ist.getHours() * 60 + ist.getMinutes();
      const OPEN = 10 * 60;        // 10:00
      const CLOSE = 24 * 60;       // 24:00 (midnight)
      const isOpen = mins >= OPEN && mins < CLOSE;

      if (isOpen) {
        const left = CLOSE - mins;
        const h = Math.floor(left / 60);
        const m = left % 60;
        const eta = h > 0 ? `${h}h ${m}m` : `${m}m`;
        setStatus({ open: true, label: `Open now · closes in ${eta} · 10 AM – 12 AM` });
      } else {
        setStatus({ open: false, label: `Closed now · opens 10:00 AM · all 7 days` });
      }
    };
    compute();
    const id = setInterval(compute, 60_000);   // refresh every minute
    return () => clearInterval(id);
  }, []);


  /**
   * The pointer wash.
   *
   * It used to call getBoundingClientRect() on every pointermove. That forces
   * the browser to flush pending layout, and on a scroll-driven page it runs
   * hundreds of times a second — a measurable part of the jank people feel.
   *
   * Now: the rect is measured once and cached (re-measured on resize), the
   * style writes are coalesced into a single rAF, and a touch pointer is
   * ignored entirely because a finger dragging to scroll is not a hover.
   */
  const glowRef = useRef<HTMLDivElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const moveRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef(false);

  useEffect(() => {
    const measure = () => { rectRef.current = null; };
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  const onHeroPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = glowRef.current;
    if (!el) return;

    if (!rectRef.current) rectRef.current = e.currentTarget.getBoundingClientRect();
    const r = rectRef.current;
    moveRef.current = {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };

    if (rafRef.current) return;
    rafRef.current = true;
    requestAnimationFrame(() => {
      rafRef.current = false;
      const m = moveRef.current;
      if (!m) return;
      el.style.setProperty("--mx", `${m.x}%`);
      el.style.setProperty("--my", `${m.y}%`);
    });
  };

  return (
    <section
      onPointerMove={onHeroPointerMove}
      className="hero-landscape-compact relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-white pt-28 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--bg-alt)] to-white" />
      <div className="orb left-[-14%] top-[-10%] h-[560px] w-[560px] bg-[var(--accent)]" />
      <div className="orb orb-reverse right-[-16%] bottom-[-12%] h-[520px] w-[520px] bg-[var(--accent2)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_46%,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.72)_42%,rgba(255,255,255,0)_78%)]" />

      {/* 3D depth layer — CSS only, no WebGL, no blur filter */}
      <div className="bg-3d">
        <div className="bg-grid" />
        <div className="bg-orb-3d one" />
        <div className="bg-orb-3d two" />
        <div className="bg-orb-3d three" />
      </div>

      {/* pointer-following wash — transform only, never a blur filter */}
      <div
        ref={glowRef}
        className="hero-cursor-glow"
        aria-hidden="true"
        style={{ ["--mx" as string]: "50%", ["--my" as string]: "38%" }}
      />
      <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.025]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold mb-6 tracking-wide uppercase">
          <span className={`w-2 h-2 rounded-full ${status.open ? "bg-green-500" : "bg-[var(--text-muted)]"} ${status.open ? "animate-pulse" : ""}`} />
          <span>{status.label}</span>
        </div>

        <h1 className="hero-apple hero-title mb-6 text-balance">
          Apple Device Repairs, <span className="hero-mastered">Mastered.</span>
        </h1>
        <p className="hero-sub hero-sub-rich mb-10 text-balance">
          Component-Level Micro-Soldering, OEM Displays &amp; Front-Glass Restoration
          On Specialised TBK Machinery — <strong>30-Minute Turnarounds</strong>, Right
          Here In Bengaluru. Backed By Our{" "}
          <strong>6-Month Repair Service Warranty</strong>.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a
            href={wa("Hi Red Apple Team, I would like to book an Apple repair consultation.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { location: "hero_primary" })}
            className="cta-orange px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          >
            <LineIcon name="whatsapp" size={19} color="#fff" />
            <span>Get Instant WhatsApp Quote</span>
          </a>
          <a
            href="#quote"
            className="px-8 py-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] font-bold text-base text-[var(--text)] hover:border-[var(--orange)]/60 transition duration-300 flex items-center justify-center gap-2.5"
          >
            <LineIcon name="zap" size={18} color="var(--orange)" />
            Check Smart Estimate
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {devices.map((d) => (
            <a
              key={d.label}
              href="#quote"
              className={`device-chip spotlight-card hover-pop group ${d.tone}`}
            >
              <span className="device-chip-icon">
                <LineIcon name={d.icon} className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold leading-tight sm:text-[13.5px]">{d.label}</span>
                <span className="mt-0.5 block line-clamp-2 text-[10.5px] leading-snug text-[var(--text-muted)] sm:text-[11px]">{d.sub}</span>
              </span>
              <LineIcon name="arrow-right" size={14} className="device-chip-arrow hidden sm:block" />
            </a>
          ))}
        </div>

        {/* 3D iPhone — the centrepiece.
            It used to be `hidden sm:block`. In landscape the viewport is wide
            enough to pass `sm:` but only ~390px tall, so the phone existed and
            was never reachable. It is always rendered now, and the hero
            compresses itself in landscape so the device comes into view. */}
        <div className="hero-phone-wrap hero-phone-live mt-14">
          <Phone3D />
          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--orange-deep)]">
            Built for every iPhone · 11 through 18 Pro Max
          </p>
        </div>
      </div>
    </section>
  );
}
